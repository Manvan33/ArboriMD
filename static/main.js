
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
        this.state = JSON.parse(getFromCookie("state"));
        if (this.state == null) {
            this.state = {
                "opened": [],
                "selected": null
            }
        }
        this.storeState();
    }

    loadState() {
        this.state = JSON.parse(getFromCookie("state"));
        return this.state;
    }

    storeState() {
        document.cookie = "state=" + JSON.stringify(this.state);
    }

    getSelected() {
        return this.loadState().selected;
    }

    getOpened() {
        return this.loadState().opened;
    }

    addOpened(folder) {
        this.loadState().opened.push(folder);
        this.storeState();
    }

    setSelected(id) {
        this.loadState().selected = id;
        this.storeState();
    }

    removeOpened(folder) {
        let opened = this.loadState().opened;
        opened.splice(opened.indexOf(folder), 1);
        this.storeState();
    }
}

let state = null;

function pageLoad() {
    state = new State();
    state.setSelected(window.location.pathname.slice(1));
    loadList();
}

function loadList() {
    fetch("/list")
        .then(response => response.json())
        .then(data => {
            let root = document.querySelector('#arbolist');
            root.innerHTML = "";
            Object.keys(data).forEach(folder => {
                root.appendChild(createFolder(folder, data[folder]));
            });
        });
    document.querySelector("#ctrl-copy").addEventListener("click", copy_link);
}

function createFolder(name, data) {
    let folder = document.createElement('details');
    let summary = document.createElement('summary');
    summary.innerText = name;
    folder.appendChild(summary);
    summary.addEventListener("click", event => {
        if (folder.open) {
            state.removeOpened(name);
        } else {
            state.addOpened(name);
        }
    });
    if (state.getOpened().includes(name)) {
        folder.open = true;
    }
    let ul = document.createElement('ul');
    data.forEach(note => {
        ul.appendChild(note_link(note));
    });
    folder.appendChild(ul);
    return folder;
}

function copy_link() {
    let link_content = document.querySelector('#codimd').src;
    tmp_input = document.createElement('input');
    tmp_input.value = link_content;
    tmp_input.style.position = 'absolute';
    document.body.appendChild(tmp_input);
    tmp_input.select();
    document.execCommand("copy");
    document.body.removeChild(tmp_input);
    alert("Link copied to clipboard");
}

function note_link(note) {
    let li = document.createElement('li');
    li.innerText = note.title;
    li.setAttribute("id", note.id);
    if (note.id == state.getSelected()) {
        li.classList.add("selected");
    }
    li.addEventListener("click", event => {
        open_note(note.id);
        state.setSelected(note.id);
        li.classList.add("selected");
        document.querySelectorAll("#arbolist li").forEach(li => {
            li.classList.remove("selected");
        });
    });
    return li;
}

function open_note(id) {
    document.querySelector('#codimd').src = CODIMD_URL + id;
    fetch("/refresh/" + id);
    state.setSelected(id);
    loadList();
    // Change url without reloading
    history.pushState({}, "", "/" + id);
}
