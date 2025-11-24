import TelegramBot from 'node-telegram-bot-api';
import { GoogleGenerativeAI } from "@google/generative-ai";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Store user language preferences
const userLanguages = new Map<number, string>();

// System prompts
const getSystemPrompt = (locale: string) => {
    return locale === 'es'
        ? `Eres OACI.ai, un asistente experto en regulaciones de aviación civil internacional.
       
       FORMATO DE RESPUESTA OBLIGATORIO:
       1. RESPUESTA DIRECTA: Comienza con la respuesta concreta en 1-2 líneas.
       2. EXPLICACIÓN: Desarrolla los detalles necesarios.
       3. FUENTE: Termina SIEMPRE citando el Anexo, Documento, Capítulo y Sección específicos.
       
       Reglas:
       - Sé claro, directo y profesional.
       - Usa terminología aeronáutica correcta.
       - NUNCA respondas sin citar la fuente exacta (Anexo + sección).
       - Si no conoces la respuesta exacta, dilo claramente.
       - Responde SOLO en ESPAÑOL.`
        : `You are OACI.ai, an expert assistant in international civil aviation regulations.
       
       MANDATORY RESPONSE FORMAT:
       1. DIRECT ANSWER: Start with the concrete answer in 1-2 lines.
       2. EXPLANATION: Develop the necessary details.
       3. SOURCE: Always end by citing the specific Annex, Document, Chapter, and Section.
       
       Rules:
       - Be clear, direct, and professional.
       - Use correct aeronautical terminology.
       - NEVER answer without citing the exact source (Annex + section).
       - If you don't know the exact answer, state it clearly.
       - Answer ONLY in ENGLISH.`;
};

// Helper to run chat with Gemini
async function askGemini(question: string, locale: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-03-25" });
        const systemPrompt = getSystemPrompt(locale);

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: locale === 'es' ? "Entendido. Soy OACI.ai." : "Understood. I am OACI.ai." }] },
            ],
        });

        const result = await chat.sendMessage(question);
        return result.response.text();
    } catch (error: any) {
        console.error("Gemini Error:", error);

        // Fallback to gemini-pro if 2.5 fails
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const systemPrompt = getSystemPrompt(locale);

            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: locale === 'es' ? "Entendido. Soy OACI.ai." : "Understood. I am OACI.ai." }] },
                ],
            });

            const result = await chat.sendMessage(question);
            return result.response.text();
        } catch (fallbackError) {
            throw new Error("AI service temporarily unavailable");
        }
    }
}

// Command: /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
✈️ *Bienvenido a OACI.ai* ✈️

La Biblia de Bolsillo para la Aviación Global.

*Comandos disponibles:*
/lang - Cambiar idioma (ES/EN)
/help - Ayuda

*¿Cómo usarlo?*
Simplemente escribe tu pregunta sobre regulaciones OACI y te responderé con la cita exacta.

Ejemplo: "¿Cuáles son las velocidades de espera?"
  `;

    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });

    // Set default language to Spanish
    if (!userLanguages.has(chatId)) {
        userLanguages.set(chatId, 'es');
    }
});

// Command: /lang
bot.onText(/\/lang/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Selecciona tu idioma / Select your language:', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🇪🇸 Español', callback_data: 'lang_es' },
                    { text: '🇬🇧 English', callback_data: 'lang_en' }
                ]
            ]
        }
    });
});

// Command: /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const locale = userLanguages.get(chatId) || 'es';

    const helpMessage = locale === 'es'
        ? `
*Ayuda - OACI.ai*

*¿Qué puedo hacer?*
Respondo preguntas sobre regulaciones OACI (Anexos 1-19, Doc 4444, Doc 8168, etc.).

*Ejemplos de preguntas:*
• ¿Cuáles son las velocidades de espera?
• ¿Qué dice el Anexo 6 sobre combustible mínimo?
• ¿Cuál es la separación vertical mínima?

*Comandos:*
/start - Inicio
/lang - Cambiar idioma
/help - Esta ayuda

*Nota:* No estoy afiliado a ICAO. Verifica siempre con documentos oficiales.
    `
        : `
*Help - OACI.ai*

*What can I do?*
I answer questions about ICAO regulations (Annexes 1-19, Doc 4444, Doc 8168, etc.).

*Example questions:*
• What are the holding speeds?
• What does Annex 6 say about minimum fuel?
• What is the minimum vertical separation?

*Commands:*
/start - Start
/lang - Change language
/help - This help

*Note:* I'm not affiliated with ICAO. Always verify with official documents.
    `;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Handle language selection
bot.on('callback_query', (query) => {
    const chatId = query.message!.chat.id;
    const data = query.data;

    if (data?.startsWith('lang_')) {
        const lang = data.split('_')[1];
        userLanguages.set(chatId, lang);

        const confirmMessage = lang === 'es'
            ? '✅ Idioma cambiado a Español'
            : '✅ Language changed to English';

        bot.answerCallbackQuery(query.id, { text: confirmMessage });
        bot.sendMessage(chatId, confirmMessage);
    }
});

// Handle regular messages (questions)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands
    if (!text || text.startsWith('/')) return;

    const locale = userLanguages.get(chatId) || 'es';

    // Send "typing..." indicator
    bot.sendChatAction(chatId, 'typing');

    try {
        const response = await askGemini(text, locale);

        // Split long messages (Telegram limit: 4096 chars)
        if (response.length > 4000) {
            const chunks = response.match(/.{1,4000}/g) || [];
            for (const chunk of chunks) {
                await bot.sendMessage(chatId, chunk);
            }
        } else {
            bot.sendMessage(chatId, response);
        }
    } catch (error: any) {
        const errorMessage = locale === 'es'
            ? '❌ Error al procesar tu pregunta. Por favor, intenta de nuevo.'
            : '❌ Error processing your question. Please try again.';

        bot.sendMessage(chatId, errorMessage);
        console.error('Bot Error:', error);
    }
});

console.log('🤖 OACI.ai Telegram Bot is running...');
