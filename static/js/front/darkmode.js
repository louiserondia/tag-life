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

  const grid = document.getElementById("grid");
  if (grid) { // Home page
    for (let i = 1; i <= 10; i++) {
      const e = document.getElementById("bg_" + i);
      e.src = e.src.replace(mode[0], mode[1]);
    }
  }

  const homeButton = document.getElementById('homeImg');
  if (homeButton) { // Images page
    homeButton.src = homeButton.src.replace(mode[0], mode[1]);
  }
 
  switchMode.textContent = isDarkMode ? '☼' : '☾';
  const content = isDarkMode.toString();
  localStorage.setItem("dark-mode", content);
}
