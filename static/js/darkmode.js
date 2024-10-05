var isLightMode = true;

if (localStorage.getItem("dark-mode") === "true") {
  const everything = document.querySelectorAll("*");
  everything.forEach((thing) => {
    thing.classList.add("dark-mode");
  });

  const bg = document.getElementById("bgImg");
  let bgSrc = bg.getAttribute("src");
  bgSrc = bgSrc.replace("day", "night");
  bg.src = bgSrc;

  const title = document.getElementById("titleImg");
  let titleSrc = title.getAttribute("src");
  titleSrc = titleSrc.replace("black", "white");
  title.src = titleSrc;

  document.body.classList.add("dark-mode");
  document.getElementById("switchMode").textContent = "☼";
  isLightMode = false;
}

document.getElementById("switchMode").addEventListener("click", function () {
  const everything = document.querySelectorAll("*");
  const bg = document.getElementById("bgImg");
  let bgSrc = bg.getAttribute("src");
  const title = document.getElementById("titleImg");
  let titleSrc = title.getAttribute("src");
  everything.forEach((thing) => {
    thing.classList.toggle("dark-mode");
  });
  const button = document.getElementById("switchMode");

  if (isLightMode) {
    button.textContent = "☼";
    localStorage.setItem("dark-mode", "true");
    bgSrc = bgSrc.replace("day", "night");
    titleSrc = titleSrc.replace("black", "white");
  } else {
    button.textContent = "☾";
    localStorage.setItem("dark-mode", "false");
    bgSrc = bgSrc.replace("night", "day");
    titleSrc = titleSrc.replace("white", "black");
  }
  bg.src = bgSrc;
  title.src = titleSrc;
  isLightMode = !isLightMode;
});
