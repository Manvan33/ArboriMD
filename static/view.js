class FolderView {
    static root = document.getElementById("arbolist");
    constructor(folder) {
        console.log("Building folder " + folder.name);
        this.folder = folder;
        this.element = document.getElementById("folder_template").cloneNode(true);
        this.element.removeAttribute("id");
        this.parent_folder = this.folder.parent;
        if (this.parent_folder == null) {
            console.log("Appending to root");
            FolderView.root.appendChild(this.element);
        } else {
            console.log("Appending to parent" + this.parent_folder.name);
            this.parent_folder.view.element.appendChild(this.element);
        }
        this.render();
    }
    render() {
        if (this.parent_folder != this.folder.parent) {
            const old_parent = this.parent_folder;
            this.parent_folder = this.folder.parent;
            old_parent.view.element.removeChild(this.element);
            this.parent_folder.view.element.appendChild(this.element);
        }
        this.element.open = this.folder.opened;
        this.element.querySelector(".title").innerText = this.folder.name;
    }
    remove_children() {
        this.element.querySelector(".children").innerHTML = "";
    }
}
class NoteView {
    constructor(note) {
        this.note = note;
        this.element = document.querySelector("#note_link_template").cloneNode(true);
        this.element.removeAttribute("id");
        this.element.setAttribute("note_id", note.id);
        this.element.addEventListener("click", event => {
            event.stopPropagation();
            open_note(this.note);
        });
        this.element.querySelector(".note_delete").addEventListener("click", event => {
            event.stopPropagation();
            ask_for_deletion(this.note.id);
        });
        this.element.style.display = "block";
        this.render();
    }
    render() {
        this.element.querySelector(".note_title").innerText = note.title;
        if (this.note.selected) {
            this.classList.add("selected");
        } else {
            this.classList.remove("selected");
        }
    }
}

