from flask import Flask, render_template, request
from codimdapi import CodimdAPI
import json
from os import getenv
from dotenv import load_dotenv

app = Flask(__name__, static_folder="static", template_folder="templates")

load_dotenv()
CODIMD_FQDN = getenv("CODIMD_FQDN")
CODIMD_EMAIL = getenv("CODIMD_EMAIL")
CODIMD_PASSWORD = getenv("CODIMD_PASSWORD")

print(CODIMD_EMAIL, CODIMD_FQDN, CODIMD_PASSWORD)
codimd = CodimdAPI(CODIMD_FQDN, CODIMD_EMAIL, CODIMD_PASSWORD)


@app.route('/')
def index():
    return render_template('index.html', url=CODIMD_FQDN, note_id="")


@app.route('/<note_id>')
def index_with_note(note_id):
    return render_template('index.html', url=CODIMD_FQDN, note_id=note_id+"?"+request.query_string.decode("utf-8"))


@app.route('/list')
def list():
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


def restructure_entry(entry): return {
    "id": entry["id"], "title": entry["text"], "timestamp": entry["time"]}


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
