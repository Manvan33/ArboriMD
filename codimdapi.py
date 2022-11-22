import requests


class CodimdAPI:
    def __init__(self, url, email, password):
        print(f"{url=}, {email=}, {password=}")
        self.url = url
        self.email = email
        self.password = password

    def login(self):
        self.session = requests.Session()
        res = self.session.post(self.url + "login", data={
            "email": self.email, "password": self.password}, headers={"Referer": self.url})

    def logged_in_request(self, method, url, return_redirect=False):
        # print(f"{method} - {url} - return redirect={return_redirect}")
        try:
            result = self.session.request(method, url, allow_redirects=False)
            # print(result.status_code)
        except AttributeError:
            # print("AttributeError")
            self.login()
            return self.logged_in_request(method, url, return_redirect=return_redirect)
        if result.status_code == 302 and return_redirect==False:
            # print("not logged in", return_redirect)
            self.login()
            return self.logged_in_request(method, url, return_redirect=return_redirect)
        return result

    def get_history(self):
        result = self.logged_in_request(
            "GET", self.url + "history")
        return result.json()

    def refresh_note(self, note_id):
        result = self.logged_in_request(
            "GET", self.url + "socket.io/?EIO=3&transport=polling&noteId=" + note_id)
        return result.status_code == 200

    def delete_note(self, note_id):
        result = self.logged_in_request(
            "DELETE", self.url + "history/" + note_id)
        return result.status_code == 200

    def create_note(self):
        result = self.logged_in_request(
            "GET", self.url + "new", return_redirect=True)
        return result.next.url