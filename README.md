# Rajan Pundir — Video Editor Portfolio

A single-page portfolio site. Pure HTML/CSS/JS — no build step, so it deploys
straight to GitHub Pages for free.

## 1. Details already filled in

Name, email (rajanpundir62@gmail.com), phone (+91 99173 94750), and city
(Dehradun) are already in `index.html` — in the hero, the About section,
and the Contact section / contact bar. Update the social links (`#` hrefs
in the `.social-row` near the bottom of the Contact section) to your real
LinkedIn / Instagram / YouTube / Behance profiles when ready.

Your "VIDEO EDITOR" banner photo is already placed in three spots:
- `assets/hero-banner.jpg` — full banner, top of the page
- `assets/about-portrait.jpg` — cropped to just you, no background text, in the About section
- `assets/closing-banner.jpg` — full banner again, just before Contact

Swap any of these three files (keep the same filename) if you want to
change the photo later — no HTML/CSS edits needed, the containers auto-crop
to the right shape via `object-fit: cover`.

## 2. Add your videos

The Work section is split into seven category blocks, each its own
`<div class="work-category" id="cat-...">` in `index.html`:

| Category | Anchor id | Slots currently set up |
|---|---|---|
| AI Videos | `#cat-ai` | R_001, R_002 |
| Motion Graphics | `#cat-motion` | R_003, R_004 |
| Cinematic | `#cat-cinematic` | R_005, R_006 |
| Long Form | `#cat-longform` | R_007 |
| Shorts | `#cat-shorts` | R_008, R_009 (both live YouTube embeds already) |
| Others | `#cat-others` | R_010 |
| Landscape | `#cat-landscape` | R_011 (AI Landscape, live), R_012–R_016 (Cinematic Landscape, "Coming Soon" placeholders) |

**Landscape is different from the rest** — every other category uses a
vertical 9:16 card (`reel-card`). Landscape cards use `reel-card-landscape`
instead, which renders 16:9 widescreen at 380px wide. Use this class for
anything shot or composed horizontally (like AI motion graphics or
cinematic footage) instead of cropping it into a vertical card.

The Landscape category now has two rows: **AI Landscape** (R_011, already
live) and **Cinematic Landscape** (R_012–R_016, currently "Coming Soon"
placeholders — dashed border, no video). To fill one in once you have a
clip: find its `<article class="reel-card reel-card-landscape
reel-card-placeholder">` block and either

- swap in a YouTube embed the same way as other cards — replace the
  `<div class="reel-media reel-media-placeholder">...</div>` with
  `<div class="reel-media reel-media-embed" data-yt-id="YOUR_VIDEO_ID"></div>`,
  or
- swap in a local file the same way as the vertical cards — a
  `<video muted loop playsinline preload="none" poster="...">` block

— then update the `<h3>` title and remove `reel-card-placeholder` from the
`class` list so it stops using the dashed "coming soon" styling. Add more
placeholder cards the same way (copy an existing one, bump the `R_0NN`
number) if you end up with more than 5 cinematic landscape clips.

For each local-file slot, replace in `assets/`:
- `reel-N.mp4` → your actual edited clip (vertical 9:16 for standard cards,
  16:9 for Landscape cards; keep each under ~15MB so the page loads fast —
  export a compressed preview, not your master file)
- `reel-N-poster.jpg` → a thumbnail frame for that clip
- Update the `<h3>` title text next to each card to the real project name

To add or remove clips, copy/paste a `<article class="reel-card">` block
within the category's `.filmstrip` div, or move one to a different category
block entirely. The number of slots per category doesn't need to stay 2-2-2-1-2-1 —
rearrange freely.

If a clip is hosted on YouTube instead of a local file, replace the whole
`<video>...</video>` block with a single empty div carrying the video ID:

```html
<div class="reel-media reel-media-embed" data-yt-id="YOUR_VIDEO_ID"></div>
```

(the video ID is the part after `watch?v=`, or after `/shorts/`, in the
YouTube URL). The site's JavaScript handles the rest automatically —
it loads the video only once that card scrolls into view, autoplays it
muted and looped with the YouTube player UI hidden, and unloads it again
once you scroll away (keeps the page fast even with several videos on it).
A small "Watch on YouTube ↗" text link is worth adding under `<h3>` too,
as a fallback for anyone whose browser blocks embedded players:

```html
<a class="reel-external-link" href="https://youtube.com/watch?v=YOUR_VIDEO_ID" target="_blank" rel="noopener">Watch on YouTube ↗</a>
```

## 3. Mobile

The site is fully responsive — a hamburger menu takes over navigation below
720px wide, the About/Work/Process/Contact sections restack to single
columns, and all three banner photos crop responsively via `object-fit`.
Test locally by resizing your browser or using your browser's device
toolbar (F12 → toggle device toolbar).

## 4. Put it on GitHub

```bash
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## 5. Turn on GitHub Pages

1. On GitHub, open your repo → **Settings** → **Pages**
2. Under "Build and deployment", set **Source** to `Deploy from a branch`
3. Set **Branch** to `main` and folder to `/ (root)` → **Save**
4. Wait ~1 minute, then your site is live at:
   `https://<your-username>.github.io/<repo-name>/`

To use your own domain later, add a `CNAME` file with your domain name and
point your domain's DNS at GitHub's IPs (GitHub's Pages docs cover this).

## 6. Updating later

Any time you edit a file and run:

```bash
git add .
git commit -m "Update portfolio"
git push
```

...the live site updates automatically within a minute or two.
