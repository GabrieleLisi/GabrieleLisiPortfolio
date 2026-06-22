window.addEventListener("load", function () {
  initLightbox();
  initDotField();
  initChromaGrid();
  initSplitTextAnimation();
});

/* LIGHTBOX */

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox-close");

  if (!lightbox || !lightboxImg || !closeBtn) return;

  const images = document.querySelectorAll(".masonry img, .render-frame img, .product-card img");

  images.forEach(function (img) {
    img.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || "Preview image";

      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", closeLightbox);

  lightboxImg.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeLightbox();
  });
}

/* DOT FIELD */

function initDotField() {
  const container = document.getElementById("dotField");
  if (!container) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  container.appendChild(canvas);

  const settings = {
    dotRadius: 1.5,
    dotSpacing: 14,
    cursorRadius: 350,
    bulgeStrength: 58,
    colorStart: "rgba(255,255,255,0.70)",
    colorEnd: "rgba(255,255,255,0.38)"
  };

  let dots = [];
  let width = 0;
  let height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const mouse = {
    x: -9999,
    y: -9999,
    prevX: -9999,
    prevY: -9999,
    speed: 0
  };

  let engagement = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildDots();
  }

  function buildDots() {
    dots = [];

    const step = settings.dotRadius + settings.dotSpacing;
    const cols = Math.floor(width / step);
    const rows = Math.floor(height / step);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * step + step / 2;
        const y = row * step + step / 2;

        dots.push({
          ax: x,
          ay: y,
          sx: x,
          sy: y
        });
      }
    }
  }

  function updateMouse(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }

  function updateSpeed() {
    const dx = mouse.prevX - mouse.x;
    const dy = mouse.prevY - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    mouse.speed += (dist - mouse.speed) * 0.5;

    if (mouse.speed < 0.001) mouse.speed = 0;

    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
  }

  function animate() {
    updateSpeed();

    const targetEngagement = Math.min(mouse.speed / 5, 1);
    engagement += (targetEngagement - engagement) * 0.06;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, settings.colorStart);
    gradient.addColorStop(1, settings.colorEnd);

    ctx.fillStyle = gradient;
    ctx.beginPath();

    const cursorRadiusSq = settings.cursorRadius * settings.cursorRadius;
    const radius = settings.dotRadius / 2;

    dots.forEach(function (dot) {
      const dx = mouse.x - dot.ax;
      const dy = mouse.y - dot.ay;
      const distSq = dx * dx + dy * dy;

      if (distSq < cursorRadiusSq && engagement > 0.01) {
        const dist = Math.sqrt(distSq);
        const t = 1 - dist / settings.cursorRadius;
        const push = t * t * settings.bulgeStrength * engagement;
        const angle = Math.atan2(dy, dx);

        dot.sx += (dot.ax - Math.cos(angle) * push - dot.sx) * 0.15;
        dot.sy += (dot.ay - Math.sin(angle) * push - dot.sy) * 0.15;
      } else {
        dot.sx += (dot.ax - dot.sx) * 0.1;
        dot.sy += (dot.ay - dot.sy) * 0.1;
      }

      ctx.moveTo(dot.sx + radius, dot.sy);
      ctx.arc(dot.sx, dot.sy, radius, 0, Math.PI * 2);
    });

    ctx.fill();
    requestAnimationFrame(animate);
  }

  resize();
  animate();

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", updateMouse, { passive: true });
}

/* CHROMA GRID */

function initChromaGrid() {
  const grid = document.getElementById("chromaProducts");
  if (!grid) return;

  let currentX = grid.offsetWidth / 2;
  let currentY = grid.offsetHeight / 2;
  let targetX = currentX;
  let targetY = currentY;

  function animate() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    grid.style.setProperty("--x", currentX + "px");
    grid.style.setProperty("--y", currentY + "px");

    requestAnimationFrame(animate);
  }

  grid.addEventListener("pointermove", function (event) {
    const rect = grid.getBoundingClientRect();

    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;

    grid.classList.add("is-active");
  });

  grid.addEventListener("pointerleave", function () {
    grid.classList.remove("is-active");
  });

  const cards = grid.querySelectorAll(".product-card");

  cards.forEach(function (card) {
    card.addEventListener("mousemove", function (event) {
      const rect = card.getBoundingClientRect();

      card.style.setProperty("--mouse-x", event.clientX - rect.left + "px");
      card.style.setProperty("--mouse-y", event.clientY - rect.top + "px");
    });
  });

  animate();
}

/* SPLIT TEXT SCROLL ANIMATION */

function initSplitTextAnimation() {
  const elements = document.querySelectorAll("h1, h2, .profile-text, .contact-text");

  elements.forEach(function (element) {
    if (element.dataset.split === "true") return;

    const originalHTML = element.innerHTML;
    element.innerHTML = "";

    const temp = document.createElement("div");
    temp.innerHTML = originalHTML;

    const text = temp.textContent.trim();
    const words = text.split(" ");

    words.forEach(function (word, wordIndex) {
      const wordSpan = document.createElement("span");
      wordSpan.className = "split-word";

      word.split("").forEach(function (char) {
        const charSpan = document.createElement("span");
        charSpan.className = "split-char";
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });

      element.appendChild(wordSpan);

      if (wordIndex < words.length - 1) {
        element.appendChild(document.createTextNode(" "));
      }
    });

    element.dataset.split = "true";
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const chars = entry.target.querySelectorAll(".split-char");

          chars.forEach(function (char, index) {
            char.style.transitionDelay = index * 18 + "ms";
          });

          entry.target.classList.add("split-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -80px 0px"
    }
  );

  document.querySelectorAll("[data-split='true']").forEach(function (element) {
    observer.observe(element);
  });
}