const fs = require('fs');
const path = require('path');

async function listModels() {
    console.log("🔍 Listing Available Gemini Models...");

    try {
        // 1. Read .env.local
        const envPath = path.join(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error("❌ .env.local file not found!");
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const keyMatch = envContent.match(/GOOGLE_API_KEY=(.*)/);

        if (!keyMatch) {
            console.error("❌ GOOGLE_API_KEY not found in .env.local");
            return;
        }

        const apiKey = keyMatch[1].trim();

        // 2. Fetch Models List via REST API
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            return;
        }

        if (!data.models) {
            console.log("⚠️ No models found.");
            return;
        }

        console.log("\n✅ Available Models:");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`   - ${m.name.replace('models/', '')} (${m.displayName})`);
            }
        });

    } catch (e) {
        console.error("💥 Unexpected Error:", e);
    }
}

listModels();
