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

let state = new State();

class Folder {
    static folders = {};
    constructor(name, parent, notes) {
        if (name in Folder.folders) {
            console.log("found existing folder");
            return Folder.folders[name];
        }
        this.name = name;
        this.parent = parent;
        this.children = [];
        this.view = new FolderView(this);
        notes.forEach(note => {
            this.children.push(new Note(note.id, note.title, this));
        });
        Folder.folders[this.name] = this;
        this.view.render();
        this.opened = this.name in state.getOpened();
    }

    close() {
        this.opened = false;
        this.view.render();
        state.removeOpened(this.name);
    }
    open() {
        this.opened = true;
        this.view.render();
        state.addOpened(this.name);
    }
    toggle() {
        if (this.opened) {
            this.close();
        } else {
            this.open();
        }
        this.view.render();
    }
    update_folder(parent, data) {
        if (this.parent != parent) {
            this.parent = parent;
            this.view.render();
        }

    }
}

class Note {
    static notes = {};

    constructor(id, title, folder) {
        if (id in Object.keys(Note.notes)) {
            return Note.notes[id];
        }
        Note.notes[id] = this;
        this.title = title;
        this.id = id;
        this.folder = folder;
        this.view = new NoteView(this);
    }
    select() {
        Note.notes.forEach(note => {
            note.selected = false;
        });
        this.selected = true;
        this.view.render();
        state.setSelected(this.id);
    }
}
