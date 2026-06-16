/* =====================================================================
   TERBATAS 20 — PHOTO CONFIG
   ---------------------------------------------------------------------
   THIS is the only file you normally need to edit.
   To add your own photos, see HOW-TO-ADD-PHOTOS.md (plain-English guide).

   Quick version:
   1. Drop your photos into the photos/<room>/ folders.
   2. For each before/after PAIR, add a line under "pairs".
   3. For the finished-room gallery, add lines under "gallery".
   Paths are relative to the website folder. Use forward slashes /.
   ===================================================================== */

const SITE = {
  title: "Terbatas 20",
  tagline: "The renovation of our new home, before & after",
  // Shown on the landing page under each door:
  storyBlurb: "Follow the whole journey — what it looked like when we got the keys, the mess in between, and how every room turned out.",
  guestBlurb: "Welcome! Here is a tour of the house so you know exactly what to expect during your stay.",

  rooms: [
    {
      id: "kitchen",
      name: "Kitchen",
      // One short paragraph for the story page:
      story: "The original kitchen was dark, cramped, and hadn't been touched in decades. We knocked out the partition wall, brought in light, and rebuilt it around a central island.",
      // BEFORE / AFTER pairs — shoot these from the SAME angle for the slider to work:
      pairs: [
        { before: "photos/kitchen/before-01.jpg", after: "photos/kitchen/after-01.jpg", caption: "From the doorway" }
      ],
      // Finished-room gallery (the 'Pinterest' wall). Add as many as you like.
      // type: "image" (default) or "video".
      gallery: [
        { src: "photos/kitchen/g-01.jpg", caption: "The island" },
        { src: "photos/kitchen/g-02.jpg", caption: "Open shelving" },
        { src: "photos/kitchen/g-03.jpg", caption: "Morning light" },
        { src: "photos/kitchen/g-04.jpg", caption: "Morning light" },
        { src: "photos/kitchen/g-05.jpg", caption: "Morning light" },
        { src: "photos/kitchen/g-06.jpg", caption: "Morning light" },
        { src: "photos/kitchen/g-07.jpg", caption: "Morning light" },
        { src: "photos/kitchen/g-08.jpg", caption: "Morning light" },
        { src: "photos/kitchen/g-09.jpg", caption: "Morning light" },
      ]
    },
    {
      id: "living",
      name: "Living room",
      story: "What was a series of small, boxy rooms became one open, social space. New flooring throughout and a wall of windows changed everything.",
      pairs: [
        { before: "photos/living/before-01.jpg", after: "photos/living/after-01.jpg", caption: "Looking toward the windows" }
      ],
      gallery: [
        { src: "photos/living/g-01.jpg", caption: "Reading corner" },
        { src: "photos/living/g-02.jpg", caption: "The new floor" }
      ]
    },
    {
      id: "bathroom",
      name: "Bathroom",
      story: "Completely gutted and re-tiled, with a walk-in shower replacing the old tub and proper ventilation added at last.",
      pairs: [
        { before: "photos/bathroom/before-01.jpg", after: "photos/bathroom/after-01.jpg", caption: "The main bathroom" }
      ],
      gallery: [
        { src: "photos/bathroom/g-01.jpg", caption: "Removing the walls." },
        { src: "photos/bathroom/g-02.jpg", caption: "Maris our talented builder installing the new tiles." },
        { src: "photos/bathroom/g-03.jpg", caption: "The finished bathroom." },
        { src: "photos/bathroom/g-04.jpg", caption: "AI helping us to get some ideas." },
        { src: "photos/bathroom/g-05.jpg", caption: "AI helping us to get some ideas." },
        { src: "photos/bathroom/g-06.png", caption: "AI helping us to get some ideas." },
      ]
    },
    {
      id: "exterior",
      name: "Exterior",
      story: "The facade was tired and the garden overgrown. Fresh render, new paint, and a cleared-up entrance gave the house its presence back.",
      pairs: [
        { before: "photos/exterior/before-01.jpg", after: "photos/exterior/after-01.jpg", caption: "Street view" }
      ],
      gallery: [
        { src: "photos/exterior/g-01.jpg", caption: "Front door" },
        { src: "photos/exterior/g-02.jpg", caption: "The garden" }
      ]
    }
  ]
};
