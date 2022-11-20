
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
    clearOpened() {
        this.state.opened = [];
        this.storeState();
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

function toggle_aside() {
    // Get the root element
    var r = document.querySelector(':root');
    if (r.style.getPropertyValue("--aside-width-current") == "var(--aside-width-collapsed)") {
        document.querySelector("#aside").classList.remove("hidden");
        r.style.setProperty("--aside-width-current", "var(--aside-width-extended)");
    } else {
        document.querySelector("#aside").classList.add("hidden");
        r.style.setProperty("--aside-width-current", "var(--aside-width-collapsed)");
    }
}

function pageLoad() {
    state = new State();
    state.setSelected(window.location.pathname.slice(1));
    loadList();
    document.querySelector("#title_bar").addEventListener("click", toggle_aside);
    document.querySelector("#open_all_btn").addEventListener("click", openEverything);
    document.querySelector("#close_all_btn").addEventListener("click", closeEverything);
    document.querySelector("#copy_link_btn").addEventListener("click", copy_link);
    document.querySelector("#add_note_btn").addEventListener("click", new_note_dialog);
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
}


// Function to open all folders
function openEverything() {
    state.clearOpened();
    document.querySelectorAll("#arbolist details").forEach(details => {
        details.open = true;
        state.addOpened(details.querySelector(".title").innerText);
    });
}

// Function to close all folders
function closeEverything() {
    state.clearOpened();
    document.querySelectorAll("#arbolist details").forEach(details => {
        details.open = false;
    });
}

// Function to copy the link to the current note
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

// Function to create a folder 
function createFolder(name, data) {
    // Clone the node
    let folder = document.querySelector("#folder_template").cloneNode(true);
    folder.removeAttribute("id");
    let summary = folder.querySelector('summary');
    let title = folder.querySelector(".title");
    title.innerText = name;
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

// Function to create a note entry
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

// Function to open a note
function open_note(id) {
    document.querySelector('#codimd').src = CODIMD_URL + id;
    fetch("/refresh/" + id);
    state.setSelected(id);
    loadList();
    // Change url without reloading
    history.pushState({}, "", "/" + id);
}

function new_note_dialog() {
    console.log("new note");
}