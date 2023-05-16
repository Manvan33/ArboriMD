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

    // Function to create a note entry
    build() {
        this.element.innerText = this.title;
        this.element.classList.add("note-link");
        this.element.setAttribute("id", this.id);
        if (this.id == state.getSelected()) {
            this.element.classList.add("selected");
            this.element.scrollIntoView();
        }
        this.element.addEventListener("click", event => {
            event.target.classList.add("selected");
            this.open();
        });
        this.folder.element.querySelector(".notes_list").appendChild(this.element);
    }
    open() {
        let url = CODIMD_URL + this.id + "?edit";
        // Check if the note is already open
        if (document.querySelector('#codimd').src == url) {
            return;
        }
        refresh_current();
        document.querySelector('#codimd').src = url;
        fetch("/refresh/" + this.id).then(response => {
            if (response.status == 200) {
                console.log("Refreshed note " + this.id);
            } else {
                console.log("Failed to refresh note " + this.id);
            }
            state.setSelected(this.id);
            loadList();
            // Change url without reloading
            history.pushState({}, "", "/" + this.id);
        });
    }
}
