# How to add your photos

The site works right now with placeholder images. Here's how to swap in your real ones. No coding needed — you edit one file and drop photos into folders.

## 1. Where photos live

Inside the `photos` folder there's one folder per room:

```
photos/
  kitchen/
  living/
  bathroom/
  exterior/
```

Put each room's photos into its folder. Keep file names simple (no spaces): `after-01.jpg`, `g-02.jpg`, etc.

## 2. The two kinds of photo

**Before/after pairs** — the slider. For this to look good, the *before* and *after* must be shot from the **same spot and angle**. If you don't have matching angles for a room, just skip the pair for that room (the gallery still works).

**Gallery photos** — the "Pinterest wall" of finished shots below each room. Any photos or videos of the finished result. Heights can vary; the layout handles it.

## 3. Edit `data/photos.js`

Open `data/photos.js` in any text editor. Each room looks like this:

```js
{
  id: "kitchen",
  name: "Kitchen",
  story: "Write a sentence or two about this room here.",
  pairs: [
    { before: "photos/kitchen/before-01.jpg", after: "photos/kitchen/after-01.jpg", caption: "From the doorway" }
  ],
  gallery: [
    { src: "photos/kitchen/g-01.jpg", caption: "The island" },
    { src: "photos/kitchen/g-02.jpg", caption: "Open shelving" }
  ]
}
```

- To add another **before/after**, copy a `{ before:..., after:..., caption:... }` line inside `pairs`.
- To add a **gallery photo**, copy a `{ src:..., caption:... }` line inside `gallery`. The caption is optional.
- For a **video**, point `src` at an `.mp4` file: `{ src: "photos/kitchen/walkthrough.mp4" }`. It plays in the gallery automatically.
- Keep the commas between items. Every `{ ... }` except the last in a list ends with a comma.

## 4. Add or remove rooms

Copy a whole room block (everything from `{` to its matching `},`) and change the `id`, `name`, and photos. Give each room a unique `id` (lowercase, no spaces). Delete a block to remove a room.

## 5. See your changes

Double-click `index.html` to open the site in your browser. Refresh after editing. That's it.

## 6. Sharing it

This is plain HTML — no server needed to view it locally. To put it online and send a link to friends and Airbnb guests, free options include Netlify Drop (drag the whole folder onto netlify.com/drop), GitHub Pages, or Cloudflare Pages. Tell me which you'd like and I'll walk you through it.

## Tips
- Resize huge photos before adding them (long edge ~2000px) so the site loads fast. I can write a one-click script to bulk-resize your hundreds of photos if you want.
- Phone videos are usually `.mp4` already and work as-is.
