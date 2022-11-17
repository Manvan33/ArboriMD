
let state = {
    "opened": [],
    "selected": null
}

function loadlist() {
    fetch("/list")
        .then(response => response.json())
        .then(data => {
            console.log(data);
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
            state["opened"].pop(name);
        } else {
            state["opened"].push(name);
        }
        console.log(state["opened"]);
    });
    if (state["opened"].includes(name)) {
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
    if (note.id == state["selected"]) {
        li.classList.add("selected");
    }
    li.addEventListener("click", event => {
        open_note(note.id);
        state["selected"] = note.id;
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
    state["selected"] = id;
    loadlist();
}
