
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

let latest_list = {};

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
    if (NOTE_TO_OPEN != "") {
        open_note(CODIMD_URL + NOTE_TO_OPEN + "?edit");
    }
    state.setSelected(window.location.pathname.slice(1));
    loadList();
    document.querySelector("#title_bar").addEventListener("click", toggle_aside);
    document.querySelector("#open_all_btn").addEventListener("click", openAllFolders);
    document.querySelector("#close_all_btn").addEventListener("click", closeAllFolders);
    document.querySelector("#copy_link_btn").addEventListener("click", copy_link);
    document.querySelector("#add_note_btn").addEventListener("click", add_note_dialog);
    document.querySelector("#search_input").addEventListener("input", e => {
        let term = e.target.value;
        clearResults();
        if (term != "") {
            closeAllFolders();
            search_note(term).forEach(result => reveal_note(result));
        }
    });
    document.querySelector("#search_btn").addEventListener("click", clickFirstResult);
    document.querySelector("#search_input").addEventListener("keydown", e => {
        if (e.key == "Enter") {
            clickFirstResult();
        }
    });
    document.querySelector("#add_note_url_btn").addEventListener("click", e => {
        open_note(document.querySelector("#add_note_url").value);
        hide_note_dialog();
    });
    document.querySelector("#create_new_btn").addEventListener("click", e => {
        fetch("/create").then(response => {
            if (response.status == 200) {
                return response.text()
            } else {
                console.log("Failed to create note");
            }
        }).then(url => {
            open_note(url);
            hide_note_dialog();
        });
    });
    document.querySelector("#hide_note_btn").addEventListener("click", hide_note_dialog);
}

function loadList() {
    fetch("/list")
        .then(response => response.json())
        .then(data => {
            if (latest_list === data) {
                return;
            }
            let root = document.querySelector('#arbolist');
            root.innerHTML = "";
            Object.keys(data).sort((a, b) => { return a.localeCompare(b) }).forEach(folder => {
                root.appendChild(createFolder(folder, data[folder]));
            });
        });
}


// Function to open all folders
function openAllFolders() {
    state.clearOpened();
    document.querySelectorAll("#arbolist details").forEach(details => {
        details.open = true;
        state.addOpened(details.querySelector(".title").innerText);
    });
}

// Function to close all folders
function closeAllFolders() {
    state.clearOpened();
    document.querySelectorAll("#arbolist details").forEach(details => {
        details.open = false;
    });
}

// Function to copy the link to the current note
function copy_link() {
    let link_content = get_iframe_href();
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
        refresh_current();
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
    // sort the notes by title
    data = data.sort((a, b) => { return a.title.localeCompare(b.title) });
    data.forEach(note => {
        ul.appendChild(note_link(note));
    });
    folder.appendChild(ul);
    return folder;
}

// Function to create a note entry
function note_link(note) {
    let node = document.querySelector("#note_link_template").cloneNode(true);
    node.querySelector(".note_title").innerText = note.title;
    node.setAttribute("note_id", note.id);
    if (note.id == state.getSelected()) {
        node.classList.add("selected");
        node.scrollIntoView();
    }
    node.addEventListener("click", event => {
        event.target.classList.add("selected");
        open_note(CODIMD_URL + note.id + "?edit");
    });
    node.querySelector(".note_delete").addEventListener("click", event => {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete "' + note.title + '" ?')) {
            delete_note(note.id);
        }
    });
    node.style.display = "block";
    return node;
}

// Function to open a note
function open_note(url) {
    // Check if the note is already open
    if (document.querySelector('#codimd').src == url) {
        return;
    }
    refresh_current();
    document.querySelector('#codimd').src = url;
    let id = url.split("/").pop().split("?")[0];
    fetch("/refresh/" + id).then(response => {
        if (response.status == 200) {
            console.log("Refreshed note " + id);
        } else {
            console.log("Failed to refresh note " + id);
        }
        state.setSelected(id);
        loadList();
        // Change url without reloading
        history.pushState({}, "", "/" + id);
    });
}

function refresh_current() {
    // Refresh the current note
    fetch("/refresh/" + state.getSelected()).then(response => {
        if (response.status != 200) {
            console.log("Failed to refresh note " + id);
        } else {
            loadList();
        }
    });
}

function add_note_dialog() {
    let actual_note_url = "";
    document.querySelector('#add_note_url').value = actual_note_url;
    document.querySelector("#add_note_dialog").classList.remove("hidden");
}

function hide_note_dialog() {
    document.querySelector("#add_note_dialog").classList.add("hidden");
}

// Function to search for a note
function search_note(term) {
    results = [];
    document.querySelectorAll(".note-link").forEach(note => {
        if (note.innerText.toLowerCase().includes(term.toLowerCase())) results.push(note);
    });
    return results;
}

function reveal_note(note) {
    let folder = note.closest("details");
    folder.open = true;
    state.addOpened(folder.querySelector(".title").innerText);
    note.classList.add("found");
    note.scrollIntoView();
}

function clearResults() {
    document.querySelectorAll(".found").forEach(note => {
        note.classList.remove("found");
    });
}

function clickFirstResult() {
    document.querySelectorAll(".found")[0].click();
}

function delete_note(id) {
    if (state.getSelected() == id) {
        document.querySelector('#codimd').src = CODIMD_URL;
        state.setSelected(null);
    }
    fetch("/delete/" + id).then(response => {
        if (response.status == 200) {
            console.log("Deleted note " + id);
        } else {
            console.log("Failed to delete note " + id);
        }
        loadList();
    });
}

function get_iframe_href() {
    try {
        return document.querySelector('#codimd').contentWindow.location.href;
    } catch (e) {
        return document.querySelector('#codimd').src;
    }
}
