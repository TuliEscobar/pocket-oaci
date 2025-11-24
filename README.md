# OACI.ai (Pocket OACI) ✈️

> **The Pocket Bible for Global Aviation.**
> *Instant, AI-driven regulatory knowledge for pilots, ATCs, and aviation professionals.*

## 📂 Project Structure
The project is located in the `pocket-oaci` folder. You must be inside this folder to run commands.

```text
OACI.ai/
└── pocket-oaci/       <-- 🛑 RUN COMMANDS HERE
    ├── app/           # Next.js App Router (Frontend)
    ├── messages/      # Translation files (en.json, es.json)
    ├── public/        # Static assets
    └── package.json   # Dependencies and scripts
```

## 🚀 How to Run (Quick Start)

1.  **Open your terminal.**
2.  **Navigate to the project folder:**
    ```bash
    cd pocket-oaci
    ```
    *(If you are in `OACI.ai`, you must type `cd pocket-oaci` first)*
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
4.  **Open the App:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🌍 Features (MVP)
- **"Black Box" Interface**: A distraction-free, dark mode UI designed for the cockpit.
- **Bilingual Core**: Built from the ground up to support **Spanish (ES)** and **English (EN)**.
- **Simulated AI**: Demonstrates how the system cites ICAO documents (e.g., Annex 6, Doc 8168).

## 🛠️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Internationalization**: `next-intl`

## 📖 Documentation
- **[VISIONARY_ROADMAP.md](./VISIONARY_ROADMAP.md)**: The long-term strategy (MVP -> National Regs -> Ecosystem).
- **[MVP_PRESENTATION_GUIDE.md](./MVP_PRESENTATION_GUIDE.md)**: A script for presenting this demo to investors/users.
- **[UI_MOCKUP.md](./UI_MOCKUP.md)**: The original visual concept.

---
*Built with ❤️ for the skies.*
