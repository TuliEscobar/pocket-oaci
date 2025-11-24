# OACI.ai (Pocket OACI) ✈️

> **The Pocket Bible for Global Aviation.**
> *Instant, AI-driven regulatory knowledge for pilots, ATCs, and aviation professionals.*

## 🌍 Mission
To empower every aviation professional with instant, accurate, and cited answers from ICAO documentation (Annexes, PANS-ATM, PANS-OPS) and beyond. We are building the **Universal Aviation Intelligence**.

## 🚀 MVP Features (Pocket OACI)
- **Ask OACI**: Natural language search for ICAO regulations.
- **Instant Citations**: Answers are backed by specific references (e.g., "Annex 6, Part I, Chapter 4").
- **Bilingual Support**: Seamlessly switch between **Spanish** 🇪🇸 and **English** 🇺🇸.
- **Premium Interface**: A "Cockpit-Ready", high-contrast dark mode design.

## 🛠️ Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Framer Motion
- **AI Engine**: RAG (Retrieval-Augmented Generation) with OpenAI/Gemini
- **Internationalization**: `next-intl`

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/oaci-web.git
    cd oaci-web
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file:
    ```env
    OPENAI_API_KEY=sk-...
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Open the App:**
    Visit `http://localhost:3000` to see the cockpit.

## 🗺️ Roadmap
See [VISIONARY_ROADMAP.md](./visionary_roadmap.md) for the long-term strategy.

---
*Built with ❤️ for the skies.*
