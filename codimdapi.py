import requests


class CodimdAPI:
    def __init__(self, url, email, password, proxy=None):
        self.url = url
        self.email = email
        self.password = password
        self.session = requests.Session()
        if proxy:
            self.session.proxies = {"http": proxy, "https": proxy}

    def login(self):
        self.session.post(self.url + "login", data={
            "email": self.email, "password": self.password}, headers={"Referer": self.url})

    def request(self, method, url, return_redirect=False, try_relogin=True):
        """ Make an authenticated request to the server.

        method: The HTTP method to use
        url: The URL to request
        return_redirect: If we should return the URL we're being redirected to
        try_relogin: If we should try to relogin if we're not logged in
        """
        result = self.session.request(
            method, url, allow_redirects=False)
        # If we're not logged in, we might get an error
        if not result.ok:
            if try_relogin:
                self.login()
                return self.request(method, url, return_redirect=return_redirect, try_relogin=False)
            # If after relogging in we're still getting an error, something is wrong
            print("Error requesting", url, result.status_code, result.text)
            return None
        if result.status_code == 302:
            if return_redirect:
                return result
            elif try_relogin:
                self.login()
                return self.request(method, url, try_relogin=False)
            else:
                print("Too many redirects after requesting", url, result.status_code, result.text)
                return None
        # Return the result if everything is fine
        return result

    def get_redirect_url(self, url):
        """Get the URL we're being redirected to.

        url: The URL to get the redirect URL from
        recursive: If we should try to relogin if we're not logged in
        """
        result = self.request("GET", url, return_redirect=True)
        # We're expecting a 302 redirect, if not return None
        if result.status_code != 302:
            return None
        # Return the URL we're being redirected to
        return result.next.url

    def get_history(self):
        result = self.request(
            "GET", self.url + "history")
        if not result:
            return None
        return result.json()

    def refresh_note(self, note_id):
        """Opens the note to update its entry in the history"""
        result = self.request(
            "GET", self.url + "socket.io/?EIO=3&transport=polling&noteId=" + note_id)
        return result.status_code == 200

    def delete_note(self, note_id):
        result = self.request(
            "DELETE", self.url + "history/" + note_id)
        return result.status_code == 200

    def create_note(self):
        return self.get_redirect_url(self.url + "new")

    def logout(self):
        self.request("GET", self.url + "logout")

    def download_note(self, note_id):
        result = self.request(
            "GET", self.url + note_id + "/download")
        return result.content
