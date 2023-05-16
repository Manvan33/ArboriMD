class View {
    static folders = {};
    static arbolist = document.getElementById('arbolist');
    render(selected, opened) {

    }
    update() {

    }
}
class FolderView {
    constructor(folder) {
        console.log("Building folder " + folder.name);
        this.folder = folder;
        this.element = document.getElementById("folder_template").cloneNode(true);
        this.element.removeAttribute("id");
        this.parent_folder = this.folder.parent;
        if (this.parent_folder == null) {
            console.log("Appending to root");
            Folder.root.appendChild(this.element);
        } else {
            console.log("Appending to parent" + this.parent_folder.name);
            this.parent_folder.view.element.appendChild(this.element);
        }
        this.render();
    }
    render() {
        this.element.open = this.folder.opened;
        this.element.querySelector(".title").innerText = this.folder.name;
    }
}
class NoteView {
    constructor(note) {
        this.note = note;
        this.element = document.createElement('li');
        this.element.classList.add("note-link");
        this.render();
    }
    render() {
        this.element.innerText = this.note.title;
        this.element.setAttribute("note_id", this.note.id);
    }
}

