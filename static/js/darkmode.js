const everything = document.querySelectorAll("*");

const switchMode = document.getElementById("switchMode");
switchMode.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  const mode = isDarkMode ? ["black", "white"] : ["white", "black"];
  handleSwitchMode(mode);
});

let isDarkMode = localStorage.getItem("dark-mode") === "true";
if (isDarkMode) {
  if (!document.body.classList.contains('dark-mode')) {
    handleSwitchMode(["black", "white"]);
  }
}

function handleSwitchMode(mode) {
  everything.forEach((thing) => {
    thing.classList.toggle("dark-mode");
  });

  const homeBg = document.getElementById("bgImg");
  if (homeBg) { // Home page
    const title = document.getElementById("titleImg");
    const photos = document.getElementById('bullePhotos');
    const radio = document.getElementById('bulleRadio');
    homeBg.src = homeBg.src.replace(mode[0], mode[1]);
    title.src = title.src.replace(mode[0], mode[1]);
    photos.src = photos.src.replace(mode[0], mode[1]);
    radio.src = radio.src.replace(mode[0], mode[1]);
  }

  const homeButton = document.getElementById('homeImg');
  if (homeButton) { // Images page
    homeButton.src = homeButton.src.replace(mode[0], mode[1]);
  }

  switchMode.textContent = isDarkMode === true ? '☼' : '☾';
  const content = isDarkMode ? "true" : "false";
  localStorage.setItem("dark-mode", content);
}
