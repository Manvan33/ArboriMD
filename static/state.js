function getFromCookie(key) {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(key + "=")) {
            return cookie.slice(key.length + 1);
        }
    }
    return null;
}

class State {
    constructor() {
        this.db = JSON.parse(getFromCookie("state"));
        if (this.db == null || typeof this.db.opened != "object" || typeof this.db.selected != "string") {
            this.db = {
                "opened": new Set(),
                "selected": null
            }
        }
        this.storeState();
    }

    loadState() {
        this.db = JSON.parse(getFromCookie("state"));
        this.db.opened = new Set(this.db.opened);
        return this.db;
    }

    storeState() {
        document.cookie = "state=" + JSON.stringify({
            "opened": Array.from(this.db.opened),
            "selected": this.db.selected
        });
    }

    getSelected() {
        return this.loadState().selected;
    }
    setSelected(id) {
        this.loadState().selected = id;
        this.storeState();
    }
    getOpened() {
        return this.loadState().opened;
    }
    clearOpened() {
        this.loadState().opened = [];
        this.storeState();
    }
    addOpened(folder) {
        this.loadState().opened.add(folder);
        this.storeState();
    }
    removeOpened(folder) {
        this.loadState().opened.delete(folder);
        this.storeState();
    }
}