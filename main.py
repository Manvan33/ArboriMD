import json

from flask import Flask, render_template, request, redirect, url_for
from secrets import token_hex
from os import getenv
from dotenv import load_dotenv
from flask_login import LoginManager, login_user, current_user

from codimdapi import CodimdAPI
from oidc import User, OIDC

# Loading environment variables
load_dotenv()
CODIMD_URL = getenv("CODIMD_URL")
CODIMD_EMAIL = getenv("CODIMD_EMAIL")
CODIMD_PASSWORD = getenv("CODIMD_PASSWORD")
LOGIN_DISABLED = getenv("LOGIN_DISABLED", False) == "True"
# Optional variables for OIDC login
if not LOGIN_DISABLED:
    OIDC_CLIENT_ID = getenv("OIDC_CLIENT_ID")
    OIDC_CLIENT_SECRET = getenv("OIDC_CLIENT_SECRET")
    OIDC_DISCOVERY_URL = getenv("OIDC_DISCOVERY_URL")
    SECRET_KEY = getenv("SECRET_KEY")
    if not OIDC_CLIENT_ID or not OIDC_CLIENT_SECRET or not OIDC_DISCOVERY_URL or not SECRET_KEY:
        raise ValueError("OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_DISCOVERY_URL and SECRET_KEY must be set. Otherwise set LOGIN_DISABLED to True")
    else:
        oidc_tool = OIDC(OIDC_DISCOVERY_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET)

# Necessary variables
if not CODIMD_URL or not CODIMD_EMAIL or not CODIMD_PASSWORD:
    print("Please set CODIMD_URL, CODIMD_EMAIL and CODIMD_PASSWORD in .env")
    exit(1)

# Initialize Flask app
app = Flask(__name__, static_folder="static", template_folder="templates")
# flask_login will use this to disable login if needed
app.config["LOGIN_DISABLED"] = LOGIN_DISABLED 
app.secret_key = SECRET_KEY

# Initialize flask_login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return User.get_user(user_id)

@app.before_request
def check_login():
    if app.config["LOGIN_DISABLED"]:
        return
    if request.endpoint in ['login', 'oidc']:
        return
    if not current_user.is_authenticated:
        return login_manager.unauthorized()


# Initialize CodimdAPI
codimd = CodimdAPI(CODIMD_URL, CODIMD_EMAIL, CODIMD_PASSWORD)

# Converts a codimd history entry to a dict of tag-folders (keys) and notes (values)
restructure_entry = lambda entry: {"id": entry["id"], "title": entry["text"], "timestamp": entry["time"]}

@app.route('/')
def index():
    return render_template('index.html', url=CODIMD_URL, note_id="")

# Load a note from the URL
@app.route('/<note_id>')
def index_with_note(note_id):
    return render_template('index.html', url=CODIMD_URL, note_id=note_id+"?"+request.query_string.decode("utf-8"))

# Returns all notes from history
@app.route('/list')
def list() -> json:
    list = {"unsorted": []}
    data = codimd.get_history()
    for entry in data['history']:
        if entry['tags']:
            for tag in entry['tags']:
                if tag not in list:
                    list[tag] = []
                list[tag].append(restructure_entry(entry))
        else:
            list['unsorted'].append(restructure_entry(entry))
    return list


@app.route('/refresh/<note_id>')
def refresh(note_id):
    return codimd.refresh_note(note_id) and "OK" or (404, "ERROR")

@app.route('/create')
def create():
    return codimd.create_note() or (404, "ERROR")

@app.route('/delete/<note_id>')
def delete(note_id):
    return codimd.delete_note(note_id) and "OK" or (404, "ERROR")

@app.route('/login')
def login():
    if app.config["LOGIN_DISABLED"]:
        return redirect(url_for('index')+ "?" + request.query_string.decode("utf-8"))
    redirect_url = url_for("oidc", _external=True) + "?" + request.query_string.decode("utf-8")
    return redirect(oidc_tool.get_auth_url(redirect_url))

@app.route("/oidc")
def oidc():
    redirect_url = url_for('oidc', _external=True)+ "?next=" + request.args.get("next")
    auth_code = request.args.get("code")
    ok, username = oidc_tool.validate_code(auth_code, redirect_url)
    if not ok:
        return "Error: "+username, 400
    login_user(User.get_user(username), remember=True)
    return redirect(request.args.get("next"))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
