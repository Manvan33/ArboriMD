function toggle_aside() {
  // Get the root element
  var r = document.querySelector(":root");
  if (r.style.getPropertyValue("--aside-width-current") == "var(--aside-width-collapsed)") {
    document.querySelector("#aside").classList.remove("hidden");
    r.style.setProperty("--aside-width-current", "var(--aside-width-extended)");
  } else {
    document.querySelector("#aside").classList.add("hidden");
    r.style.setProperty("--aside-width-current", "var(--aside-width-collapsed)");
  }
}
