var isLightMode = true;

document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("switch-mode").textContent = "☼";
    const button = document.getElementById("switch-mode");
    button.classList.toggle("dark-mode");
    isLightMode = false;
  }

  document.getElementById("switch-mode").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    const button = document.getElementById("switch-mode");
    button.classList.toggle("dark-mode");

    if (isLightMode) {
      button.textContent = "☼";
      localStorage.setItem("dark-mode", "true");
    } else {
      button.textContent = "☾";
      localStorage.setItem("dark-mode", "false");
    }
    isLightMode = !isLightMode;
  });
});
