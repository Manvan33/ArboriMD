import requests
from flask_login import UserMixin


class User(UserMixin):
    def __init__(self, username):
        self.username = username

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def get_id(self):
        return self.username

    @staticmethod
    def get_user(name):
        return User(name)


class OIDC:
    def __init__(self, discovery_url, client_id, client_secret, proxy=None):
        self.discovery_url = discovery_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.oidc_config = requests.get(discovery_url).json()
        self.token_endpoint = self.oidc_config["token_endpoint"]
        self.authorization_endpoint = self.oidc_config["authorization_endpoint"]
        self.introspection_endpoint = self.oidc_config["introspection_endpoint"]
        self.session = requests.Session()
        if proxy:
            self.session.proxies = {"http": proxy, "https": proxy}

    def get_auth_url(self, redirect_url):
        return self.authorization_endpoint + "?client_id=" + self.client_id + "&response_type=code&scope=openid&redirect_uri=" + redirect_url

    def validate_code(self, code, redirect_url) -> tuple[bool, str]:
        # Validating Authorization code
        payload = {
            'grant_type': 'authorization_code',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'redirect_uri': redirect_url
        }
        response = self.session.post(url=self.token_endpoint, data=payload)
        if not response.status_code == 200:
            return False, "Code validation failed"
        response = response.json()
        # Checks which user is logged in
        payload2 = {
            'token': response['access_token'],
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        response = self.session.post(
            url=self.introspection_endpoint, data=payload2)
        if not response.status_code == 200:
            return False, "Instrospection failed"
        return True, response.json()["preferred_username"]
