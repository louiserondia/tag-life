document.addEventListener("DOMContentLoaded", function () {
  window.scroll(0, window.innerHeight / 3);

  function parallax(element, ratio, tx, sign) {
    const sy = window.scrollY;
    const start = document
      .getElementById("title")
      .getBoundingClientRect().bottom;
    const ty = Math.abs(sy - start) * ratio;
    element.style.transform = `translate(${tx}, ${sign}${ty}px)`;
  }

  function updateTitlePosition() {
    const part1 = document.getElementById("part1");
    const part3 = document.getElementById("images");
    parallax(part1, 0.2, "0", "+");
    parallax(part3, 0.2, "0", "-");
  }

  // window.addEventListener("scroll", updateTitlePosition);
  // updateTitlePosition();

  let bullePhotos = document.getElementById('bg_6');
  let bulleDessin = document.getElementById('bg_7');
  let bullePoleDance = document.getElementById('bg_8');

  if (bullePhotos) {
    bullePhotos.addEventListener('click', () => {
      window.location.href = imagesUrl;
    });
  }

  if (bulleDessin) {
    bulleDessin.addEventListener('click', () => {
      console.log('click dessin');
      window.location.href = webcamUrl;
    });
  }
  
  if (bullePoleDance) {
    bullePoleDance.addEventListener('click', () => {
      console.log('click pole dance');
      window.location.href = projectionUrl;
    });
  }

  let homeButton = document.getElementById('home');
  if (homeButton) {
    homeButton.addEventListener('click', () => {
      window.location.href = homeUrl;
    });
  }


});

document.addEventListener("DOMContentLoaded", () => {
  const clouds = document.querySelectorAll(".cloud");
  clouds.forEach((cloud, index) => {
    let delay = (index * 0.75) + "s";
    cloud.style.animationDelay = delay;
  });
});