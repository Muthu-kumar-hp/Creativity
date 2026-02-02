const questionContainer = document.querySelector(".question-container");
const resultContainer = document.querySelector(".result-container");
const gifResult = document.querySelector(".gif-result");
const heartLoader = document.querySelector(".cssload-main");
const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");

/* ============================
   NO BUTTON MOVEMENT (RESPONSIVE)
   ============================ */

function moveNoButton() {
  const containerRect = questionContainer.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = containerRect.width - btnRect.width;
  const maxY = containerRect.height - btnRect.height;

  // Safety fallback
  if (maxX <= 0 || maxY <= 0) return;

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  noBtn.style.position = "absolute";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

/* Desktop: Hover */
noBtn.addEventListener("mouseenter", moveNoButton);

/* Mobile: Touch */
noBtn.addEventListener("touchstart", e => {
  e.preventDefault(); // prevent click
  moveNoButton();
});

/* ============================
   YES BUTTON LOGIC
   ============================ */

yesBtn.addEventListener("click", () => {
  questionContainer.style.display = "none";
  heartLoader.style.display = "block";

  setTimeout(() => {
    heartLoader.style.display = "none";
    resultContainer.style.display = "block";

    if (gifResult && gifResult.play) {
      gifResult.play();
    }

  }, 3000);
});

/* ============================
   PARTICLE BACKGROUND
   ============================ */

const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
const count = window.innerWidth < 768 ? 60 : 120; // Less particles on mobile

/* Resize */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();

window.addEventListener("resize", resize);

/* Particle */
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;

    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;

    this.size = Math.random() * 2 + 1;
    this.alpha = Math.random() * 0.6 + 0.2;
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
    if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
    ctx.fill();
  }
}

/* Create */
function createParticles() {
  particles = [];

  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

createParticles();

/* Animate */
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.move();
    p.draw();
  });

  requestAnimationFrame(animate);
}

animate();
