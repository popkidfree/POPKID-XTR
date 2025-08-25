const os = require("os");
const { cmd } = require('../command');

cmd({
    pattern: "uptime",
    alias: ["runtime"],
    desc: "⏱️ Check bot uptime & system status",
    category: "utility",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // Format uptime
        const formatUptime = (seconds) => {
            const days = Math.floor(seconds / (3600 * 24));
            const hours = Math.floor((seconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            let t = "";
            if (days > 0) t += `${days}d `;
            if (hours > 0) t += `${hours}h `;
            if (minutes > 0) t += `${minutes}m `;
            t += `${secs}s`;
            return t.trim();
        };

        const uptime = formatUptime(process.uptime());

        // System stats
        const memUsed = process.memoryUsage().rss / 1024 / 1024;
        const totalMem = os.totalmem() / 1024 / 1024 / 1024;
        const cpuModel = os.cpus()[0].model.split(" ").slice(0,2).join(" ");
        const platform = os.platform().toUpperCase();

        const memPercent = ((memUsed / (totalMem * 1024)) * 100).toFixed(1);
        const memBar = (p) => {
            const bars = 8; // smaller bar for WhatsApp fit
            const filled = Math.round((p / 100) * bars);
            return "█".repeat(filled) + "░".repeat(bars - filled);
        };

        // Compact fancy box
        const caption = `
╭─❖ ⚡ *SYSTEM STATUS* ⚡ ❖─╮
│ ⏱ Uptime  : ${uptime}
│ 🖥 OS      : ${platform}
│ 💽 CPU     : ${cpuModel}
│ 🔋 RAM     : ${memPercent}% [${memBar(memPercent)}]
│ 📊 Memory  : ${(memUsed/1024).toFixed(2)}GB / ${totalMem.toFixed(1)}GB
│ 🤖 Bot     : POPKID XTR
│ 🌐 Status  : ✅ Online
╰───────────────────────╯
> 💡 Powered by *POPKID XTR*
        `.trim();

        await conn.sendMessage(from, { 
            text: caption,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {  
                    newsletterJid: '120363420342566562@newsletter',  
                    newsletterName: 'POPKID GLE BOT',  
                    serverMessageId: ''  
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in uptime command:", e);
        reply(`❌ Error checking uptime: ${e.message}`);
    }
});
