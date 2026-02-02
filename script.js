const questionContainer = document.querySelector(".question-container");
const resultContainer = document.querySelector(".result-container");
const gifResult = document.querySelector(".gif-result");
const heartLoader = document.querySelector(".cssload-main");
const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");

// /change the postion of no button
noBtn.addEventListener("mouseover", () => {
  const newX = Math.floor(Math.random() * questionContainer.offsetWidth);
  const newY = Math.floor(Math.random() * questionContainer.offsetWidth);

  noBtn.style.left = `${newX}px`;
  noBtn.style.top = `${newY}px`;
});

// yes button functionality

yesBtn.addEventListener("click", () => {
  questionContainer.style.display = "none";
  heartLoader.style.display = "inherit";

  const timeoutId = setTimeout(() => {
    heartLoader.style.display = "none";
    resultContainer.style.display = "inherit";
    gifResult.play();
  }, 3000);
});
// ===============================
// PARTICLE BACKGROUND
// ===============================

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
const isMobile = window.innerWidth < 768;
const COUNT = isMobile ? 50 : 120;


// Resize Canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener("resize", () => {
  resizeCanvas();
  createParticles(); // Rebuild
});


// Particle Class
class Particle {

  constructor() {

    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;

    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;

    this.size = Math.random() * 2 + 1.5;
    this.alpha = Math.random() * 0.5 + 0.3;
  }

  move() {

    this.x += this.vx;
    this.y += this.vy;

    // Bounce
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {

    ctx.beginPath();

    ctx.arc(
      this.x,
      this.y,
      this.size,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;

    ctx.fill();
  }
}


// Create Particles
function createParticles() {

  particles = [];

  for (let i = 0; i < COUNT; i++) {
    particles.push(new Particle());
  }
}

createParticles();


// Animate Loop
function animate() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.move();
    p.draw();
  });

  requestAnimationFrame(animate);
}

animate();
