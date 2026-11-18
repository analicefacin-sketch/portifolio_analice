const portraitWrapper = document.querySelector("#portraitWrapper");
const portraitReveal = document.querySelector("#portraitReveal");
const revealCircle = document.querySelector("#revealCircle");

const cursor = document.querySelector(".cursor");
const cursorDot = document.querySelector(".cursor-dot");

const celebrationSection = document.querySelector("#final");
const bubbleContainer = document.querySelector("#bubbleContainer");
const confettiCanvas = document.querySelector("#confettiCanvas");
const context = confettiCanvas.getContext("2d");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* Cursor personalizado */

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

let circleX = cursorX;
let circleY = cursorY;

document.addEventListener("mousemove", (event) => {
  cursorX = event.clientX;
  cursorY = event.clientY;

  cursorDot.style.transform =
    `translate(${cursorX - 2.5}px, ${cursorY - 2.5}px)`;
});

function animateCursor() {
  circleX += (cursorX - circleX) * 0.16;
  circleY += (cursorY - circleY) * 0.16;

  cursor.style.transform =
    `translate(${circleX - 17.5}px, ${circleY - 17.5}px)`;

  requestAnimationFrame(animateCursor);
}

animateCursor();

document.querySelectorAll("a, .information-item, .skill-card, .bubble")
  .forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursor.classList.add("active");
    });

    element.addEventListener("mouseleave", () => {
      cursor.classList.remove("active");
    });
  });

/* Revelação da fotografia pelo mouse */

function revealPortrait(clientX, clientY) {
  const bounds = portraitWrapper.getBoundingClientRect();

  const x = Math.max(0, Math.min(clientX - bounds.left, bounds.width));
  const y = Math.max(0, Math.min(clientY - bounds.top, bounds.height));

  const radius = window.innerWidth < 600 ? 72 : 100;

  portraitReveal.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;

  revealCircle.style.left = `${x}px`;
  revealCircle.style.top = `${y}px`;
}

portraitWrapper.addEventListener("pointerenter", () => {
  revealCircle.style.opacity = "1";
});

portraitWrapper.addEventListener("pointermove", (event) => {
  revealPortrait(event.clientX, event.clientY);
});

portraitWrapper.addEventListener("pointerleave", () => {
  portraitReveal.style.clipPath = "circle(0 at 50% 50%)";
  revealCircle.style.opacity = "0";
});

portraitWrapper.addEventListener("pointerdown", (event) => {
  revealPortrait(event.clientX, event.clientY);
});

/* Animação dos elementos durante a rolagem */

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  }
);

revealElements.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(element);
});

/* Bolhas */

const bubbleSettings = [
  { size: 115, left: 5, top: 15, duration: 4.8 },
  { size: 75, left: 19, top: 67, duration: 4.1 },
  { size: 150, left: 29, top: 8, duration: 5.5 },
  { size: 92, left: 47, top: 72, duration: 4.6 },
  { size: 125, left: 66, top: 12, duration: 5.2 },
  { size: 72, left: 81, top: 60, duration: 4.3 },
  { size: 165, left: 87, top: 17, duration: 5.7 },
  { size: 58, left: 11, top: 43, duration: 3.9 },
  { size: 64, left: 72, top: 43, duration: 4.5 },
  { size: 88, left: 39, top: 33, duration: 5 }
];

function createBubbles() {
  bubbleSettings.forEach((settings) => {
    const bubble = document.createElement("button");

    bubble.type = "button";
    bubble.className = "bubble";
    bubble.setAttribute("aria-label", "Estourar bolha");

    bubble.style.width = `${settings.size}px`;
    bubble.style.height = `${settings.size}px`;
    bubble.style.left = `${settings.left}%`;
    bubble.style.top = `${settings.top}%`;
    bubble.style.setProperty("--duration", `${settings.duration}s`);

    const popBubble = () => {
      if (bubble.classList.contains("pop")) {
        return;
      }

      const bubbleBounds = bubble.getBoundingClientRect();
      const sectionBounds = celebrationSection.getBoundingClientRect();

      const x =
        bubbleBounds.left -
        sectionBounds.left +
        bubbleBounds.width / 2;

      const y =
        bubbleBounds.top -
        sectionBounds.top +
        bubbleBounds.height / 2;

      bubble.classList.add("pop");
      createConfettiBurst(x, y, settings.size);

      window.setTimeout(() => {
        bubble.remove();
      }, 300);
    };

    bubble.addEventListener("mouseenter", popBubble);
    bubble.addEventListener("click", popBubble);
    bubble.addEventListener("touchstart", popBubble, { passive: true });

    bubbleContainer.appendChild(bubble);
  });
}

/* Confetes */

const confettiColors = [
  "#e7779b",
  "#f3b9ca",
  "#ffd36e",
  "#8ed6d1",
  "#9da9f0",
  "#ffffff"
];

const confettiParticles = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = celebrationSection.clientWidth;
  const height = celebrationSection.clientHeight;

  confettiCanvas.width = width * ratio;
  confettiCanvas.height = height * ratio;
  confettiCanvas.style.width = `${width}px`;
  confettiCanvas.style.height = `${height}px`;

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createConfettiBurst(x, y, bubbleSize) {
  const totalParticles = Math.max(18, Math.round(bubbleSize / 3));

  for (let index = 0; index < totalParticles; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4.2;

    confettiParticles.push({
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed - 1.5,
      gravity: 0.075 + Math.random() * 0.06,
      drag: 0.987,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.22,
      life: 1,
      decay: 0.011 + Math.random() * 0.01,
      color:
        confettiColors[
          Math.floor(Math.random() * confettiColors.length)
        ]
    });
  }
}

function animateConfetti() {
  context.clearRect(
    0,
    0,
    celebrationSection.clientWidth,
    celebrationSection.clientHeight
  );

  for (let index = confettiParticles.length - 1; index >= 0; index -= 1) {
    const particle = confettiParticles[index];

    particle.velocityX *= particle.drag;
    particle.velocityY *= particle.drag;
    particle.velocityY += particle.gravity;

    particle.x += particle.velocityX;
    particle.y += particle.velocityY;
    particle.rotation += particle.rotationSpeed;
    particle.life -= particle.decay;

    if (particle.life <= 0) {
      confettiParticles.splice(index, 1);
      continue;
    }

    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.globalAlpha = particle.life;
    context.fillStyle = particle.color;

    context.fillRect(
      -particle.size / 2,
      -particle.size / 4,
      particle.size,
      particle.size / 2
    );

    context.restore();
  }

  requestAnimationFrame(animateConfetti);
}

resizeCanvas();
createBubbles();
animateConfetti();

window.addEventListener("resize", resizeCanvas);

/* Explosões suaves automáticas ao chegar à última seção */

let celebrationStarted = false;

const celebrationObserver = new IntersectionObserver(
  (entries) => {
    if (
      entries[0].isIntersecting &&
      !celebrationStarted &&
      !prefersReducedMotion
    ) {
      celebrationStarted = true;

      const automaticBubbles = Array.from(
        bubbleContainer.querySelectorAll(".bubble")
      ).slice(0, 3);

      automaticBubbles.forEach((bubble, index) => {
        window.setTimeout(() => {
          bubble.dispatchEvent(new MouseEvent("mouseenter"));
        }, 900 + index * 850);
      });
    }
  },
  { threshold: 0.35 }
);

celebrationObserver.observe(celebrationSection);

// Efeito de revelar a foto com o mouse
document.addEventListener("DOMContentLoaded", () => {
    const portraitWrapper = document.getElementById("portraitWrapper");
    const photoReveal = document.getElementById("photoReveal");

    if (portraitWrapper && photoReveal) {
        portraitWrapper.addEventListener("mousemove", (e) => {
            // Pega a posição do mouse relativa ao container da foto
            const rect = portraitWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Atualiza as variáveis CSS com a posição
            photoReveal.style.setProperty("--mouse-x", `${x}px`);
            photoReveal.style.setProperty("--mouse-y", `${y}px`);
        });

        // Quando o mouse sai da área, esconde a foto novamente
        portraitWrapper.addEventListener("mouseleave", () => {
            photoReveal.style.setProperty("--mouse-x", "-500px");
            photoReveal.style.setProperty("--mouse-y", "-500px");
        });
    }
});