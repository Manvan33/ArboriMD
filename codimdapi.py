import requests


class CodimdAPI:
    def __init__(self, url, email, password):
        self.url = url
        self.email = email
        self.password = password

    def login(self):
        self.session = requests.Session()
        res = self.session.post(self.url + "login", data={
            "email": self.email, "password": self.password}, headers={"Referer": self.url})

    def logged_in_request(self, method, url, **kwargs):
        print(f"{method} - {url} - args: {kwargs}")
        try:
            result = self.session.request(method, url, **kwargs)
            print(result.status_code)
        except AttributeError:
            print("AttributeError")
            self.login()
            return self.logged_in_request(method, url, **kwargs)
        if result.status_code == 302:
            print("not logged in")
            self.login()
            return self.logged_in_request(method, url, **kwargs)
        return result

    def get_history(self):
        result = self.logged_in_request(
            "GET", self.url + "history", allow_redirects=False)
        return result.json()

    def refresh_note(self, note_id):
        result = self.logged_in_request(
            "GET", self.url + "socket.io/?EIO=3&transport=polling&noteId=" + note_id, allow_redirects=False)
        return result.status_code == 200

    def delete_note(self, note_id):
        result = self.logged_in_request(
            "DELETE", self.url + "history/" + note_id, allow_redirects=False)
        return result.status_code == 200
