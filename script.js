// ==========================
// LIGHTBOX FULLSCREEN
// ==========================

window.addEventListener("load", function () {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox-close");

  if (!lightbox || !lightboxImg || !closeBtn) {
    console.error("Lightbox elements not found. Check index.html.");
    return;
  }

  const images = document.querySelectorAll(".masonry img, .render-frame img, .product-card img");

  images.forEach(function (img) {
    img.style.cursor = "zoom-in";

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

  closeBtn.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeLightbox();
  });

  lightbox.addEventListener("click", function () {
    closeLightbox();
  });

  lightboxImg.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
});