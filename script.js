window.addEventListener("load", () => {
  initLightbox();
  initDotField();
  initChromaGrid();
  initSplitText();
  initClickSpark();
});

/* LIGHTBOX */

function initLightbox() {
  const box = document.getElementById("lightbox");
  const imgBox = document.getElementById("lightbox-img");
  const close = document.querySelector(".lightbox-close");

  if (!box || !imgBox || !close) return;

  document.querySelectorAll(".masonry img, .render-frame img, .product-card img").forEach(img => {
    img.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      imgBox.src = img.currentSrc || img.src;
      imgBox.alt = img.alt || "Preview image";

      box.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  const closeBox = () => {
    box.classList.remove("active");
    imgBox.src = "";
    document.body.style.overflow = "";
  };

  close.addEventListener("click", closeBox);
  box.addEventListener("click", closeBox);
  imgBox.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("keydown", e => e.key === "Escape" && closeBox());
}

/* DOT FIELD */

function initDotField() {
  const container = document.getElementById("dotField");
  if (!container) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  container.appendChild(canvas);

  const cfg = {
    radius: 1.5,
    spacing: 14,
    mouseRadius: 350,
    strength: 58,
    colorA: "rgba(255,255,255,.70)",
    colorB: "rgba(255,255,255,.38)"
  };

  let w = 0;
  let h = 0;
  let dots = [];
  let engagement = 0;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, speed: 0 };

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    dots = [];
    const step = cfg.radius + cfg.spacing;

    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        dots.push({ ax: x, ay: y, sx: x, sy: y });
      }
    }
  }

  function updateMouse(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function animate() {
    const dx = mouse.px - mouse.x;
    const dy = mouse.py - mouse.y;

    mouse.speed += (Math.hypot(dx, dy) - mouse.speed) * 0.5;
    mouse.px = mouse.x;
    mouse.py = mouse.y;

    engagement += (Math.min(mouse.speed / 5, 1) - engagement) * 0.06;

    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, cfg.colorA);
    gradient.addColorStop(1, cfg.colorB);

    ctx.fillStyle = gradient;
    ctx.beginPath();

    const radiusSq = cfg.mouseRadius * cfg.mouseRadius;
    const dotRadius = cfg.radius / 2;

    dots.forEach(dot => {
      const mx = mouse.x - dot.ax;
      const my = mouse.y - dot.ay;
      const distSq = mx * mx + my * my;

      if (distSq < radiusSq && engagement > 0.01) {
        const dist = Math.sqrt(distSq);
        const t = 1 - dist / cfg.mouseRadius;
        const push = t * t * cfg.strength * engagement;
        const angle = Math.atan2(my, mx);

        dot.sx += (dot.ax - Math.cos(angle) * push - dot.sx) * 0.15;
        dot.sy += (dot.ay - Math.sin(angle) * push - dot.sy) * 0.15;
      } else {
        dot.sx += (dot.ax - dot.sx) * 0.1;
        dot.sy += (dot.ay - dot.sy) * 0.1;
      }

      ctx.moveTo(dot.sx + dotRadius, dot.sy);
      ctx.arc(dot.sx, dot.sy, dotRadius, 0, Math.PI * 2);
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

  let x = grid.offsetWidth / 2;
  let y = grid.offsetHeight / 2;
  let targetX = x;
  let targetY = y;

  function animate() {
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;

    grid.style.setProperty("--x", x + "px");
    grid.style.setProperty("--y", y + "px");

    requestAnimationFrame(animate);
  }

  grid.addEventListener("pointermove", e => {
    const rect = grid.getBoundingClientRect();

    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;

    grid.classList.add("is-active");
  });

  grid.addEventListener("pointerleave", () => {
    grid.classList.remove("is-active");
  });

  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();

      card.style.setProperty("--mouse-x", e.clientX - rect.left + "px");
      card.style.setProperty("--mouse-y", e.clientY - rect.top + "px");
    });
  });

  animate();
}

/* SPLIT TEXT */

function initSplitText() {
  const selectors = `
    h1,h2,h3,
    .brand,
    .nav nav a,
    .eyebrow,
    .intro,
    .profile-text,
    .contact-text,
    .profile-side p,
    .profile-side a,
    .profile-card p,
    .experience-list li,
    .tool-tags span,
    .numbers strong,
    .numbers span,
    .product-card h3,
    .product-card p,
    .cards h3,
    .cards p,
    .footer strong,
    .footer span,
    .footer small,
    .contact-mail
  `;

  document.querySelectorAll(selectors).forEach(el => {
    if (el.dataset.split) return;

    const text = el.textContent.trim();
    if (!text) return;

    el.innerHTML = "";

    text.split(" ").forEach((word, index, words) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "split-word";

      [...word].forEach(letter => {
        const charSpan = document.createElement("span");
        charSpan.className = "split-char";
        charSpan.textContent = letter;
        wordSpan.appendChild(charSpan);
      });

      el.appendChild(wordSpan);

      if (index < words.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });

    el.dataset.split = "true";
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const chars = entry.target.querySelectorAll(".split-char");

      if (entry.isIntersecting) {
        chars.forEach((char, index) => {
          char.style.transitionDelay = index * 10 + "ms";
        });

        entry.target.classList.add("split-visible");
      } else {
        chars.forEach(char => {
          char.style.transitionDelay = "0ms";
        });

        entry.target.classList.remove("split-visible");
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px"
  });

  document.querySelectorAll("[data-split='true']").forEach(el => observer.observe(el));
}

/* CLICK SPARK */

function initClickSpark() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.className = "click-spark-canvas";
  document.body.appendChild(canvas);

  const cfg = {
    color: "#ffffff",
    size: 10,
    radius: 18,
    count: 8,
    duration: 420,
    scale: 1.2
  };

  const sparks = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function easeOut(t) {
    return t * (2 - t);
  }

  function createSpark(e) {
    const now = performance.now();

    for (let i = 0; i < cfg.count; i++) {
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        angle: Math.PI * 2 * i / cfg.count,
        time: now
      });
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i];
      const elapsed = now - spark.time;

      if (elapsed > cfg.duration) {
        sparks.splice(i, 1);
        continue;
      }

      const progress = easeOut(elapsed / cfg.duration);
      const distance = progress * cfg.radius * cfg.scale;
      const length = cfg.size * (1 - progress);

      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + length) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + length) * Math.sin(spark.angle);

      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  resize();
  requestAnimationFrame(draw);

  window.addEventListener("resize", resize);
  document.addEventListener("click", createSpark);
}