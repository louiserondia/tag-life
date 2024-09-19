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
});

document.addEventListener("DOMContentLoaded", function() {
  const tagBoxes = document.querySelectorAll(".tag-box");

  tagBoxes.forEach(function(box) {
    box.addEventListener("click", function() {
      const checkbox = document.getElementById(box.getAttribute("for"));
      
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        box.classList.add("active");
      } else {
        box.classList.remove("active");
      }
      
      // Soumettre le formulaire automatiquement si besoin
      box.closest("form").submit();
    });
  });
});