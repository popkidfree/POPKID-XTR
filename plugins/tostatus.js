const { cmd } = require("../command");
const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");
// Make sure you import your client instance here
// Example: if your bot instance is exported from ../popkid
const { malvin } = require("../popkid");

cmd({
  pattern: "post",
  alias: ["poststatus", "tostatus", "story", "repost", "reshare"],
  react: "📝",
  desc: "Post replied media to bot's WhatsApp status",
  category: "owner",
  filename: __filename
}, async (cmd, mek, m, { isOwner, reply }) => {
  try {
    if (!isOwner) return reply("🚫 *Owner-only command.*");

    // Only use m.quoted (avoid raw contextInfo mess)
    const quoted = m.quoted;
    if (!quoted) {
      return reply("⚠️ *Please reply to an image, video, or audio message to post to status.*");
    }

    const type = getContentType(quoted.message);
    if (!["imageMessage", "videoMessage", "audioMessage"].includes(type)) {
      return reply("❌ *Unsupported media. Reply to image, video, or audio only.*");
    }

    const mediaMsg = quoted.message[type];

    // Download content
    const stream = await downloadContentFromMessage(mediaMsg, type.replace("Message", "").toLowerCase());
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    // Caption fallback
    const caption = mediaMsg?.caption || "";

    // Compose message
    const content =
      type === "imageMessage"
        ? { image: buffer, caption }
        : type === "videoMessage"
        ? { video: buffer, caption }
        : { audio: buffer, mimetype: "audio/mp4", ptt: mediaMsg?.ptt || false };

    // Send to status
    await malvin.sendMessage("status@broadcast", content);
    reply("✅ *Status posted successfully!*");

  } catch (e) {
    console.error("❌ Error in .post command:", e);
    reply(`❗ Error posting status:\n${e.message}`);
  }
});
