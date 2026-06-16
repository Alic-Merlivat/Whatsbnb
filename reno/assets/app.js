/* Renders the page from data/photos.js. You should not need to edit this. */
(function () {
  "use strict";

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function isVideo(item) {
    if (item.type === "video") return true;
    return /\.(mp4|webm|mov|m4v)$/i.test(item.src || "");
  }

  /* ---------- fill brand / blurbs ---------- */
  document.querySelectorAll("[data-site-title]").forEach(function (n) { n.textContent = SITE.title; });
  document.querySelectorAll("[data-tagline]").forEach(function (n) { n.textContent = SITE.tagline; });
  document.querySelectorAll("[data-story-blurb]").forEach(function (n) { n.textContent = SITE.storyBlurb; });
  document.querySelectorAll("[data-guest-blurb]").forEach(function (n) { n.textContent = SITE.guestBlurb; });

  /* ---------- before/after slider ---------- */
  function makeSlider(pair) {
    var ba = el("div", "ba");
    ba.innerHTML =
      '<div class="layer before"><img loading="lazy" src="' + pair.before + '" alt="Before"></div>' +
      '<div class="layer after"><div class="inner"><img loading="lazy" src="' + pair.after + '" alt="After"></div></div>' +
      '<span class="tag before">BEFORE</span>' +
      '<span class="tag after">AFTER</span>' +
      '<div class="handle"><div class="knob">&#8596;</div></div>' +
      (pair.caption ? '<span class="caption">' + pair.caption + "</span>" : "");

    var after = ba.querySelector(".after");
    var inner = ba.querySelector(".after .inner");
    var handle = ba.querySelector(".handle");

    function sizeInner() {
      inner.style.width = ba.clientWidth + "px";
    }
    function setPct(p) {
      p = Math.max(3, Math.min(97, p));
      after.style.width = p + "%";
      handle.style.left = p + "%";
    }
    function fromX(clientX) {
      var r = ba.getBoundingClientRect();
      setPct(((clientX - r.left) / r.width) * 100);
    }
    var down = false;
    ba.addEventListener("mousedown", function (e) { down = true; fromX(e.clientX); e.preventDefault(); });
    window.addEventListener("mousemove", function (e) { if (down) fromX(e.clientX); });
    window.addEventListener("mouseup", function () { down = false; });
    ba.addEventListener("touchstart", function (e) { fromX(e.touches[0].clientX); }, { passive: true });
    ba.addEventListener("touchmove", function (e) { fromX(e.touches[0].clientX); }, { passive: true });

    window.addEventListener("resize", sizeInner);
    setTimeout(sizeInner, 0);
    setPct(50);
    return ba;
  }

  /* ---------- lightbox ---------- */
  var LB = { items: [], i: 0, node: null };
  function buildLightbox() {
    var lb = el("div", "lightbox");
    lb.innerHTML =
      '<button class="x" aria-label="Close">&times;</button>' +
      '<button class="arrow prev" aria-label="Previous">&#8249;</button>' +
      '<div class="lb-stage"></div>' +
      '<button class="arrow next" aria-label="Next">&#8250;</button>' +
      '<div class="lb-cap"></div>';
    document.body.appendChild(lb);
    lb.querySelector(".x").onclick = closeLB;
    lb.querySelector(".prev").onclick = function (e) { e.stopPropagation(); step(-1); };
    lb.querySelector(".next").onclick = function (e) { e.stopPropagation(); step(1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLB(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLB();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
    LB.node = lb;
  }
  function renderLB() {
    var item = LB.items[LB.i];
    var stage = LB.node.querySelector(".lb-stage");
    stage.innerHTML = isVideo(item)
      ? '<video src="' + item.src + '" controls autoplay></video>'
      : '<img src="' + item.src + '" alt="">';
    LB.node.querySelector(".lb-cap").textContent = item.caption || "";
  }
  function openLB(items, i) { LB.items = items; LB.i = i; renderLB(); LB.node.classList.add("open"); }
  function closeLB() { LB.node.classList.remove("open"); LB.node.querySelector(".lb-stage").innerHTML = ""; }
  function step(d) { LB.i = (LB.i + d + LB.items.length) % LB.items.length; renderLB(); }

  /* ---------- masonry gallery ---------- */
  function makeGallery(items) {
    var grid = el("div", "masonry");
    items.forEach(function (item, idx) {
      var tile = el("div", "tile");
      if (isVideo(item)) {
        tile.innerHTML =
          '<video preload="metadata" src="' + item.src + '#t=0.1"></video>' +
          '<div class="play">&#9658;</div>' +
          (item.caption ? '<div class="cap">' + item.caption + "</div>" : "");
      } else {
        tile.innerHTML =
          '<img loading="lazy" src="' + item.src + '" alt="' + (item.caption || "") + '">' +
          (item.caption ? '<div class="cap">' + item.caption + "</div>" : "");
      }
      tile.onclick = function () { openLB(items, idx); };
      grid.appendChild(tile);
    });
    return grid;
  }

  /* ---------- page renderers ---------- */
  function renderStory(mount) {
    SITE.rooms.forEach(function (room) {
      var sec = el("section", "room");
      sec.id = room.id;
      sec.appendChild(el("h2", null, room.name));
      if (room.story) sec.appendChild(el("p", "story", room.story));
      (room.pairs || []).forEach(function (p) { sec.appendChild(makeSlider(p)); });
      if (room.gallery && room.gallery.length) {
        sec.appendChild(el("div", "gallery-label", "&#9632; More of the finished " + room.name.toLowerCase()));
        sec.appendChild(makeGallery(room.gallery));
      }
      mount.appendChild(sec);
    });
  }
  function renderGallery(mount) {
    SITE.rooms.forEach(function (room) {
      var sec = el("section", "room");
      sec.id = room.id;
      sec.appendChild(el("h2", null, room.name));
      var imgs = (room.gallery || []).slice();
      // include the "after" shots so guests see the best finished views too
      (room.pairs || []).forEach(function (p) { imgs.unshift({ src: p.after, caption: room.name }); });
      sec.appendChild(makeGallery(imgs));
      mount.appendChild(sec);
    });
  }

  buildLightbox();
  var storyMount = document.querySelector("[data-render='story']");
  var galleryMount = document.querySelector("[data-render='gallery']");
  if (storyMount) renderStory(storyMount);
  if (galleryMount) renderGallery(galleryMount);
})();
