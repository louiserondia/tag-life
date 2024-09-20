var isLightMode = true;

// comment faire pour pas avoir de petit temps où c'est light
//  quand je refresh et que c'était dark avant ????

// document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("dark-mode") === "true") {
    const everything = document.querySelectorAll("*");
    everything.forEach((thing) => {
      thing.classList.add("dark-mode");
    })

    document.body.classList.add("dark-mode");
    document.getElementById("switch-mode").textContent = "☼";
    isLightMode = false;
  }

  document.getElementById("switch-mode").addEventListener("click", function () {
    const everything = document.querySelectorAll("*");
    everything.forEach((thing) => {
      thing.classList.toggle("dark-mode");
    })
    const button = document.getElementById("switch-mode");

    if (isLightMode) {
      button.textContent = "☼";
      localStorage.setItem("dark-mode", "true");
    } else {
      button.textContent = "☾";
      localStorage.setItem("dark-mode", "false");
    }
    isLightMode = !isLightMode;
  });
// });
