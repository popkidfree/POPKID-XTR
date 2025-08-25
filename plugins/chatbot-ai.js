const axios = require('axios');
const { cmd } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// ---------------- Styling ----------------
function fancyBox(title, content) {
  return `
╭─━─━〔 ⚡ ${title} 〕━─━─╮
${content}
╰─━─━─━─━─━─━─━─━╯
> popkid Xtr AI 👾`;
}

// ---------------- AI State ----------------
let AI_STATE = {
  IB: "false", // Inbox chats
  GC: "false"  // Group chats
};

// ---------------- Utils ----------------
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36";

// Try several AI endpoints with graceful fallback
async function getAIResponse(userText) {
  const prompt =
    "You are POPKID XTR, a smart, confident WhatsApp bot created by Imad Ali (Kenya). Keep replies helpful and calm. Add a short footer line only if not already present.";

  const q = encodeURIComponent(userText);
  const sys = encodeURIComponent(prompt);

  const endpoints = [
    {
      // Original BK9
      name: "BK9",
      url: `https://bk9.fun/ai/BK93?BK9=${sys}&q=${q}`,
      pick: (d) => (d && (d.BK9 || d.result || d.message)) || null
    },
    {
      // Lance/Render GPT
      name: "Render-GPT",
      url: `https://lance-frank-asta.onrender.com/api/gpt?q=${q}`,
      pick: (d) => (d && d.message) || null
    },
    {
      // MetaAI proxy
      name: "MetaAI",
      url: `https://apis.davidcyriltech.my.id/ai/metaai?text=${q}`,
      pick: (d) => (d && (d.response || (d.success && d.response))) || null
    },
    {
      // OpenAI proxy
      name: "OpenAI-Proxy",
      url: `https://vapis.my.id/api/openai?q=${q}`,
      pick: (d) => (d && d.result) || null
    },
    {
      // DeepSeek proxy
      name: "DeepSeek",
      url: `https://api.ryzendesu.vip/api/ai/deepseek?text=${q}`,
      pick: (d) => (d && d.answer) || null
    }
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(ep.url, {
        headers: { "user-agent": UA },
        timeout: 15000
      });
      const txt = ep.pick(res.data);
      if (txt && typeof txt === "string" && txt.trim()) {
        return txt.trim();
      }
    } catch (err) {
      console.error(`AI endpoint failed (${ep.name}):`, err?.message);
      // continue to next endpoint
    }
  }

  return null; // all failed
}

// ---------------- Settings Command ----------------
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
    return reply(
      fancyBox("POPKID - ChatBot Menu", `
│ ⚙️ Enable
│ • .chatbot on all   ➝ All Chats
│ • .chatbot on ib    ➝ Inbox Only
│ • .chatbot on gc    ➝ Groups Only
│
│ ⛔ Disable
│ • .chatbot off all  ➝ All Chats
│ • .chatbot off ib   ➝ Inbox Only
│ • .chatbot off gc   ➝ Groups Only`)
    );
  }
});

// ---------------- Load saved state on startup ----------------
(async () => {
  try {
    const savedState = await getConfig("AI_STATE");
    if (savedState) AI_STATE = JSON.parse(savedState);
  } catch (e) {
    console.error("Failed to load AI_STATE:", e?.message);
  }
})();

// ---------------- Auto AI Reply (only when user replies to bot) ----------------
cmd({
  on: "body"
}, async (conn, m, store, {
  from,
  body,
  isGroup,
  reply
}) => {
  try {
    // Only react when the message is a reply to the bot
    const ctx = m?.message?.extendedTextMessage?.contextInfo;
    const participant = ctx?.participant;
    if (!participant) return;

    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    if (participant !== botJid) return; // not replying to the bot

    // Respect AI settings
    const isInbox = !isGroup;
    if ((isInbox && AI_STATE.IB !== "true") || (isGroup && AI_STATE.GC !== "true")) return;

    // Ignore commands & self
    if (!body || m.key.fromMe || (config.PREFIX && body.startsWith(config.PREFIX))) return;

    const lower = body.toLowerCase();

    // Quick date/time
    if (lower.includes('time') || lower.includes('date')) {
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
      const currentDateTime = now.toLocaleString('en-US', options); // fixed
      return reply(fancyBox("Current Date & Time", `│ ${currentDateTime}`));
    }

    // Fetch AI response with fallbacks
    const aiText = await getAIResponse(body);

    if (!aiText) {
      return reply(
        fancyBox("POPKID AI", "│ ⚠️ Unable to contact AI servers at the moment.\n│ Please try again shortly.")
      );
    }

    // Ensure short branded footer (avoid duplicates)
    const footer = "popkid Xtr AI 👾";
    const hasFooter = aiText.toLowerCase().includes(footer.toLowerCase());
    const finalText = hasFooter ? aiText : `${aiText}\n\n> ${footer}`;

    await conn.sendMessage(
      from,
      { text: fancyBox("POPKID AI", `│ 👤 *You:* ${body}\n│ 🤖 *Bot:* ${finalText}`) },
      { quoted: m }
    );

  } catch (err) {
    console.error("AI Chatbot Error:", err?.message);
    reply(fancyBox("POPKID AI", `│ ❌ An error occurred while contacting the AI.\n│ ${err?.message || "Unknown error"}`));
  }
});
