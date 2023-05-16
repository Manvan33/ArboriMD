let latest_list = null;

function create_folders(data) {
    for (data.name in data) {
        if (data.name.includes("/")) {
            // Split into subfolders
            let parent_folder = new Folder(data.name.split("/")[0], data.parent, []);
            let subfolder = new Folder(data.name.split("/")[1], parent_folder, data);
            this.children.push(subfolder);
        } else {
            let folder = new Folder(data.name, data.parent, data);
        }
    }
}
function updateFolder(e) {
    console.log(e);
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
            Object.keys(data).forEach(folder => {
                new Folder(folder, null, data[folder]);
            });
            applyState();
        });
}

function applyState() {
    let opened = state.getOpened();
    document.querySelectorAll("#arbolist details").forEach(details => {
        let title = details.querySelector(".title").innerText;
        if (opened.has(title)) {
            details.open = true;
        } else {
            details.open = false;
        }
    });
    let selected = state.getSelected();
    document.querySelectorAll(".note-link").forEach(link => {
        if (link.getAttribute("note_id") == selected) {
            link.classList.add("selected");
            //link.scrollIntoView();
        } else {
            link.classList.remove("selected");
        }
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


// Function to create a note entry
function note_link(note) {
    let li = document.createElement('li');
    this.element.innerText = note.title;
    this.element.classList.add("note-link");
    this.element.setAttribute("id", note.id);
    if (note.id == state.getSelected()) {
        this.element.classList.add("selected");
        this.element.scrollIntoView();
    }
    this.element.addEventListener("click", event => {
        event.target.classList.add("selected");
        open_note(CODIMD_URL + note.id + "?edit");
    });
    return li;
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
    let actual_note_url = document.querySelector('#codimd').src;
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
