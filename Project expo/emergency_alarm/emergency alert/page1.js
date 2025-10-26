document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("box");
  const loginForm = document.getElementById("loginForm");

  const permissions = [
    { name: "Camera Permission", desc: "To detect and track your hand movements." },
    { name: "Accessibility Permission", desc: "To allow gesture control over apps." },
    { name: "Background Service", desc: "To keep gesture control running." }
  ];

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Animate box disappearing
    box.classList.add("fade-out");
    box.addEventListener("animationend", () => {
      showPermission(0);
    }, { once: true });
  });

  function showPermission(index) {
    if (index >= permissions.length) {
      // All permissions done
      box.innerHTML = `
        <h2>All Permissions Granted ✅</h2>
        <p>Your gesture control system is ready!</p>
        <button class="next-btn" id="finishBtn">Finish</button>
      `;
      box.classList.remove("fade-out");
      box.classList.add("fade-in");

      document.getElementById("finishBtn").addEventListener("click", () => {
        box.classList.remove("fade-in");
        box.classList.add("fade-out");

        // Smooth fade-out then redirect
        box.addEventListener("animationend", () => {
          window.location.href = "info.html";
        }, { once: true });
      });
      return;
    }

    const current = permissions[index];

    // Replace the box content
    box.innerHTML = `
      <div class="permission-step">
        <h2>${current.name}</h2>
        <p>${current.desc}</p>
        <button class="next-btn" id="allowBtn">Allow</button>
      </div>
    `;
    box.classList.remove("fade-out");
    box.classList.add("fade-in");

    document.getElementById("allowBtn").addEventListener("click", () => {
      if (current.name === "Camera Permission") {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(() => {
            nextPermission(index);
          })
          .catch(() => {
            alert("Camera permission denied.");
            nextPermission(index);
          });
      } else {
        nextPermission(index);
      }
    });
  }

  function nextPermission(index) {
    box.classList.remove("fade-in");
    box.classList.add("fade-out");
    box.addEventListener("animationend", () => {
      showPermission(index + 1);
    }, { once: true });
  }
});

// When user clicks Start, fade out and go to portfolio.html
document.getElementById('startBtn').addEventListener('click', () => {
  document.body.classList.add('fade-out');

  setTimeout(() => {
    window.location.href = "info.html"; // Next page
  }, 800); // Delay for fade animation
});

// Optional: smooth fade when leaving the page
window.addEventListener('beforeunload', () => {
  document.body.classList.add('fade-out');
});
