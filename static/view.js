class View {
    static folders = {};
    static arbolist = document.getElementById('arbolist');
    render(selected, opened) {

    }
    update() {

    }
}
class Folder {


    build() {
        console.log("Building folder " + this.name);
        // Clone the node
        let summary = this.element.querySelector('summary');
        this.element.querySelector(".title").innerText = this.name;
        this.element.appendChild(summary);
        summary.addEventListener("click", event => {
            event.preventDefault();
            console.log(this.name);
            this.toggle();
        });
        if (state.getOpened().has(this.name)) {
            this.element.open = true;
        }
        let ul = document.createElement('ul');
        this.element.appendChild(ul);
        if (this.parent == null) {
            console.log("Appending to root");
            Folder.root.appendChild(this.element);
        } else {
            console.log("Appending to parent" + this.parent.name);
            this.parent.element.appendChild(this.element);
        }
    }
    constructor(name, parent, data) {
        if (name in Folder.folders) {
            console.log("found existing folder");
            return Folder.folders[name];
        }
        this.parent = parent;
        this.children = [];
        this.element = document.querySelector("#folder_template").cloneNode(true);
        this.element.removeAttribute("id");
        if (name.includes("/")) {
            // Create subfolder
            let parent_folder = new Folder(name.split("/")[0], parent, []);
            let subfolder = new Folder(name.split("/")[1], parent_folder, data);
            this.children.push(subfolder);
            return parent_folder;
        } else {
            // Folder isn't a subfolder
            this.name = name;
            data.forEach(note => {
                this.children.push(new Note(note.id, note.title, this));
            });
        }
        Folder.folders[this.name] = this;
        this.build();
    }
    close() {
        this.element.open = false;
        state.removeOpened(this.name);
    }
    open() {
        this.element.open = true;
        state.addOpened(this.name);
    }
    toggle() {
        if (this.element.open) {
            this.close();
        } else {
            this.open();
        }
    }
}
