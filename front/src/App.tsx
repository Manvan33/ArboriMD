import { useState, useRef } from "react";
import arrowBarLeft from "./assets/svg/arrowBarLeft.svg";
import tree from "./assets/svg/tree.svg";
import caretUp from "./assets/svg/caretUp.svg";
import caretDown from "./assets/svg/caretDown.svg";
import cloudDownload from "./assets/svg/cloudDownload.svg";
import link from "./assets/svg/link.svg";
import fileEarmarkPlus from "./assets/svg/fileEarmarkPlus.svg";
import search from "./assets/svg/search.svg";
import folder from "./assets/svg/folder.svg";
import folderOpen from "./assets/svg/folderOpen.svg";

function App() {
  // Function to open a note
  function open_note(url: string) {
    // refresh_current();
    setOpenedNoteUrl(url);
    const id: string = url.split("/").pop()?.split("?")[0] || "";
    console.log("Opening note " + id);
    fetch("/refresh/" + id).then((response) => {
      if (response.status == 200) {
        console.log("Refreshed note " + id);
      } else {
        console.log("Failed to refresh note " + id);
      }
      // Change url without reloading
      history.pushState({}, "", "/" + id);
    });
  }

  const [openedNoteUrl, setOpenedNoteUrl] = useState("http://127.0.0.1:3000/");
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const newNoteURL = useRef("");
  return (
    <>
      <aside id="aside" className={sideBarCollapsed ? "hidden" : ""}>
        <header id="title_bar" className="flex" onClick={() => setSideBarCollapsed(!sideBarCollapsed)}>
          <div id="title">
            <img className="icon" src={tree} />
            <h1>ArboriMD</h1>
          </div>
          <div className="control" title="Hide sidebar">
            <img className="icon" src={arrowBarLeft} />
          </div>
        </header>
        <div id="controls-box">
          <div className="control" id="close_all_btn" title="Fold everything">
            <img className="icon" src={caretUp} />
          </div>
          <div className="control" id="open_all_btn" title="Unfold everything">
            <img className="icon" src={caretDown} />
          </div>
          <div className="control" id="export_all" title="Export all notes">
            <a href="{{ url_for('backup') }}">
              <img className="icon" src={cloudDownload} />
            </a>
          </div>
          <div id="copy_link_btn" className="control" title="Add existing note to ArboriMD">
            <img className="icon" src={link} />
          </div>
          <div id="create_note_btn" className="control" title="Create a note">
            <img className="icon" src={fileEarmarkPlus} />
          </div>
        </div>
        <div id="add_note_dialog" className="hidden">
          <h2>
            Add a note
            <span className="right" id="hide_note_btn">
              x
            </span>
          </h2>
          <div className="flex column">
            <input
              type="text"
              id="add_note_url"
              onChange={(e) => {
                newNoteURL.current = e.target.value;
              }}
              placeholder="Enter the note URL"
            />
            <button type="button" id="add_note_url_btn" onClick={(e) => {}}>
              Add
            </button>
          </div>
        </div>
        <div id="search_box" className="flex">
          <input type="text" id="search_input" value="" placeholder="Search a note name" />
          <div id="search_btn" className="control" title="Search a note">
            <img className="icon" src={search} />
          </div>
        </div>
        <details id="folder_template">
          <summary>
            <img className="icon" src={folder} />
            <img className="icon" src={folderOpen} />
            <span className="title"></span>
          </summary>
        </details>
        <li id="note_link_template" className="note-link">
          <span className="note_title">bla</span>
          <span title="Click to delete note" className="note_delete">
            x
          </span>
        </li>
        <div id="arbolist"></div>
        <footer>
          <a target="_blank" href="https://github.com/Manvan33/ArboriMD">
            Made by Manvan
          </a>
        </footer>
      </aside>
      <iframe id="codimd" src={openedNoteUrl}></iframe>
    </>
  );
}

export default App;
