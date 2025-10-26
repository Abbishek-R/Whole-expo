// ===== INITIAL LOAD =====
window.addEventListener("load", () => {
  const sections = document.querySelectorAll("section");
  const firstSection = sections[0];

  // Show the first section and its text immediately
  firstSection.classList.add("visible");
  firstSection.style.opacity = "1";
  firstSection.style.transform = "translateY(0)";

  const firstTexts = firstSection.querySelectorAll("h1, h2, h3, p, span");
  firstTexts.forEach((text, i) => {
    setTimeout(() => {
      text.style.opacity = "1";
      text.style.transform = "translateY(0)";
    }, i * 150);
  });

  // Hide other sections initially
  sections.forEach((section, index) => {
    if (index !== 0) {
      section.style.opacity = "0";
      section.style.transform = "translateY(50px)";
      section.style.transition = "opacity 1s ease, transform 1s ease";
      const texts = section.querySelectorAll("h1, h2, h3, p, span");
      texts.forEach(t => {
        t.style.opacity = "0";
        t.style.transform = "translateY(20px)";
        t.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      });
    }
  });
});

// ===== SCROLL ANIMATION =====
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY + window.innerHeight - 150;
  const sections = document.querySelectorAll("section");

  sections.forEach(section => {
    if (scrollY > section.offsetTop && !section.classList.contains("visible")) {
      section.classList.add("visible");
      section.style.opacity = "1";
      section.style.transform = "translateY(0)";
      
      // Animate text one by one
      const texts = section.querySelectorAll("h1, h2, h3, p, span");
      texts.forEach((text, i) => {
        setTimeout(() => {
          text.style.opacity = "1";
          text.style.transform = "translateY(0)";
        }, i * 150);
      });
    }
  });
});

// ===== REDIRECT START BUTTON =====
document.querySelector(".start-btn").addEventListener("click", () => {
  window.location.href = "page3.html";
});
