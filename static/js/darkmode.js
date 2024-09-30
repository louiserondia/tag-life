var isLightMode = true;

// comment faire pour pas avoir de petit temps où c'est light
//  quand je refresh et que c'était dark avant ????

// document.addEventListener("DOMContentLoaded", function () {
if (localStorage.getItem("dark-mode") === "true") {
  const everything = document.querySelectorAll("*");
  everything.forEach((thing) => {
    thing.classList.add("dark-mode");
  });

  document.body.classList.add("dark-mode");
  document.getElementById("switchMode").textContent = "☼";
  isLightMode = false;
}

document.getElementById("switchMode").addEventListener("click", function () {
  const everything = document.querySelectorAll("*");
  const bg = document.getElementById("bgImg");
  let bgSrc = bg.getAttribute("src");
  const title = document.getElementById("titleImg");
  let titleSrc = title.getAttribute('src');
  everything.forEach((thing) => {
    thing.classList.toggle("dark-mode");
  });
  const button = document.getElementById("switchMode");

  if (isLightMode) {
    button.textContent = "☼";
    localStorage.setItem("dark-mode", "true");
    bgSrc = bgSrc.replace("day", "night");
    bg.src = bgSrc;
    titleSrc = titleSrc.replace("black", "white");
    title.src = titleSrc;
  } else {
    button.textContent = "☾";
    localStorage.setItem("dark-mode", "false");
    bgSrc = bgSrc.replace("night.png", "day.png");
    bg.src = bgSrc;
    titleSrc = titleSrc.replace("white", "black");
    title.src = titleSrc;
  }
  isLightMode = !isLightMode;
});
// });
