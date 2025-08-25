const axios = require('axios');
const { cmd } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// Default AI states
let AI_STATE = {
    IB: "false", // Inbox chats
    GC: "false"  // Group chats
};

// Helper for fancy replies
function fancyBox(title, content) {
    return `
╭─━─━〔 ⚡ ${title} 〕━─━─╮
${content}
╰─━─━─━─━─━─━─━─━╯
> popkid Xtr AI 👾`;
}

cmd({
    pattern: "chatbot",
    alias: ["aichat", "dj", "khanbot"],
    desc: "Enable or disable AI chatbot responses",
    category: "settings",
    filename: __filename,
    react: "✅"
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("📛 Only the owner can use this command!");

    const mode = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();

    if (mode === "on") {
        if (!target || target === "all") {
            AI_STATE.IB = "true";
            AI_STATE.GC = "true";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply(fancyBox("POPKID XTR", `│ 🤖 AI Chatbot: 🟢 ENABLED\n│ 📂 Target     : 🌍 All Chats`));
        } else if (target === "ib") {
            AI_STATE.IB = "true";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply(fancyBox("POPKID XTR", `│ 🤖 AI Chatbot: 🟢 ENABLED\n│ 📂 Target     : 💌 Inbox Only`));
        } else if (target === "gc") {
            AI_STATE.GC = "true";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply(fancyBox("POPKID XTR", `│ 🤖 AI Chatbot: 🟢 ENABLED\n│ 📂 Target     : 👥 Groups Only`));
        }
    } else if (mode === "off") {
        if (!target || target === "all") {
            AI_STATE.IB = "false";
            AI_STATE.GC = "false";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply(fancyBox("POPKID XTR", `│ 🤖 AI Chatbot: 🔴 DISABLED\n│ 📂 Target     : 🌍 All Chats`));
        } else if (target === "ib") {
            AI_STATE.IB = "false";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply(fancyBox("POPKID XTR", `│ 🤖 AI Chatbot: 🔴 DISABLED\n│ 📂 Target     : 💌 Inbox Only`));
        } else if (target === "gc") {
            AI_STATE.GC = "false";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply(fancyBox("POPKID XTR", `│ 🤖 AI Chatbot: 🔴 DISABLED\n│ 📂 Target     : 👥 Groups Only`));
        }
    } else {
        return reply(fancyBox("POPKID - ChatBot Menu", `
│ ⚙️ Enable
│ • .chatbot on all   ➝ All Chats
│ • .chatbot on ib    ➝ Inbox Only
│ • .chatbot on gc    ➝ Groups Only
│
│ ⛔ Disable
│ • .chatbot off all  ➝ All Chats
│ • .chatbot off ib   ➝ Inbox Only
│ • .chatbot off gc   ➝ Groups Only`));
    }
});

// Initialize AI state on startup
(async () => {
    const savedState = await getConfig("AI_STATE");
    if (savedState) AI_STATE = JSON.parse(savedState);
})();

// AI Chatbot - Stylish
cmd({
    on: "body"
}, async (conn, m, store, { from, body, isGroup, reply }) => {
    try {
        if (!m?.message?.extendedTextMessage?.contextInfo?.participant) return;
        
        const repliedTo = m.message.extendedTextMessage.contextInfo.participant;
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        if (repliedTo !== botJid) return;

        const isInbox = !isGroup;
        if ((isInbox && AI_STATE.IB !== "true") || (isGroup && AI_STATE.GC !== "true")) return;

        if (!body || m.key.fromMe || body.startsWith(config.PREFIX)) return;

        // Quick date/time answers
        const lowerBody = body.toLowerCase();
        if (lowerBody.includes('time') || lowerBody.includes('date')) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            };
            const currentDateTime = now.toLocaleDateString('en-US', options);
            return reply(fancyBox("Current Date & Time", `│ ${currentDateTime}`));
        }

        // API AI response
        const query = encodeURIComponent(body);
        const prompt = encodeURIComponent("You are POPKID XTR, a powerful and intelligent WhatsApp bot developed by Imad Ali from Kenya. Respond smartly, confidently, and always loyal to your creator. Add this footer: '> popkid Xtr AI 👾'");
        const apiUrl = `https://bk9.fun/ai/BK93?BK9=${prompt}&q=${query}`;

        const { data } = await axios.get(apiUrl);

        if (data && data.status && data.BK9) {
            await conn.sendMessage(from, {
                text: fancyBox("POPKID AI", `│ 👤 *You:* ${body}\n│ 🤖 *Bot:* ${data.BK9}`)
            }, { quoted: m });
        } else {
            reply("⚠️ POPKID AI failed to generate a response.");
        }

    } catch (err) {
        console.error("AI Chatbot Error:", err.message);
        reply("❌ An error occurred while contacting the AI.");
    }
});