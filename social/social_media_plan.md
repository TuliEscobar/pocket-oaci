# Social Media Publication Plan for Pocket‑OACI 🚀

## 1️⃣ Assets to create
- **Hero image** (1200 × 630 px) – a screenshot/mock‑up of the app UI with a tagline.
- **Short demo video / GIF** (15‑30 s) – showing a question being typed and the AI answering with citations.
- **Logo + branding assets** – PNG with transparent background, color palette (dark‑mode primary colors).
- **One‑pager PDF** – concise feature sheet (one page) for LinkedIn carousel.

## 2️⃣ Copy snippets (ready‑to‑post)
### Twitter / X (280 char limit)
```
🛫 Introducing Pocket‑OACI – an AI‑powered assistant for ICAO & RAAC regulations. 🎯 Ask any aviation‑law question and get instant, sourced answers. 🚀 Now includes RAAC Part 65! #Aviation #AI #RegTech https://github.com/TuliEscobar/pocket-oaci
```

### LinkedIn (longer post)
```
🚀 **Pocket‑OACI** is live! 🎉

We built a sleek web app that answers aviation regulation queries using Google Gemini 2.5 Pro and a Pinecone vector store. It supports both ICAO and Argentine RAAC documents – now with the newly added **RAAC Part 65**.

🔹 Instant, citation‑rich answers
🔹 Dark‑mode UI with smooth animations
🔹 Open‑source, ready to deploy on Vercel

👉 Check it out: https://github.com/TuliEscobar/pocket-oaci

#Aviation #AI #OpenSource #RegTech #Argentina
```

### Instagram (carousel caption)
```
Slide 1️⃣ – Meet Pocket‑OACI, your AI aviation regulator.
Slide 2️⃣ – Ask any ICAO or RAAC question.
Slide 3️⃣ – Get instant answers with source citations.
Slide 4️⃣ – New: RAAC Part 65 added!

🔗 Link in bio.
#Aviation #AI #Tech #Regulations #Argentina
```

## 3️⃣ Publishing schedule (UTC)
| Day | Platform | Time | Content |
|-----|----------|------|---------|
| Mon | Twitter/X | 10:00 | Hero image + tweet copy |
| Mon | LinkedIn | 12:30 | Full post + one‑pager PDF |
| Tue | Instagram | 14:00 | Carousel + story teaser |
| Wed | YouTube Shorts | 16:00 | Demo video (15 s) |
| Thu | Facebook | 11:00 | Same hero image + short description |
| Fri | Reddit (r/aviation) | 13:00 | AMA announcement with link |

## 4️⃣ Tools & Automation
- **Canva / Figma** – design hero image & carousel.
- **Lumen5 / Kapwing** – turn the demo GIF into a Shorts video.
- **Buffer / Hootsuite** – schedule posts across platforms.\n- **GitHub Actions** – optional CI step that generates the hero image automatically (see `scripts/generate_social_assets.ts`).

## 5️⃣ Tracking & Analytics
- Add UTM parameters to the GitHub link (`?utm_source=twitter&utm_medium=social&utm_campaign=pocket_oaci_launch`).
- Monitor clicks via GitHub Insights and Google Analytics (if you host a landing page).
- Record engagement metrics (likes, retweets, comments) in a simple spreadsheet.

## 6️⃣ Next steps (quick checklist)
- [ ] Create `social/hero.png` (1200 × 630 px) – we’ll generate a mock‑up next.
- [ ] Record a 15‑s demo GIF of a query.
- [ ] Export the one‑pager PDF.
- [ ] Schedule the posts using Buffer.
- [ ] Publish and start tracking!

---
*All assets live under the `social/` folder of the repo.*
