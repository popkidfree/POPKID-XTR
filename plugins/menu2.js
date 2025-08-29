const config = require('../config');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const os = require('os');
const { getPrefix } = require('../lib/prefix');

// Fonction pour styliser les majuscules comme ʜɪ
function toUpperStylized(str) {
  const stylized = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.split('').map(c => stylized[c.toUpperCase()] || c).join('');
}

// Normalisation des catégories
const normalize = (str) => str.toLowerCase().replace(/\s+menu$/, '').trim();

// Emojis par catégorie normalisée
const emojiByCategory = {
  ai: '🤖',
  anime: '🍥',
  audio: '🎧',
  bible: '📖',
  download: '⬇️',
  downloader: '📥',
  fun: '🎮',
  game: '🕹️',
  group: '👥',
  img_edit: '🖌️',
  info: 'ℹ️',
  information: '🧠',
  logo: '🖼️',
  main: '🏠',
  media: '🎞️',
  menu: '📜',
  misc: '📦',
  music: '🎵',
  other: '📁',
  owner: '👑',
  privacy: '🔒',
  search: '🔎',
  settings: '⚙️',
  sticker: '🌟',
  tools: '🛠️',
  user: '👤',
  utilities: '🧰',
  utility: '🧮',
  wallpapers: '🖼️',
  whatsapp: '📱',
};

cmd({
  pattern: 'menu2',
  alias: ['popkid'],
  desc: 'Show all bot commands',
  category: 'menu',
  react: '👌',
  filename: __filename
}, async (cmd, mek, m, { from, sender, reply }) => {
  try {
    const prefix = getPrefix();
    const timezone = config.TIMEZONE || 'Africa/Nairobi';
    const time = moment().tz(timezone).format('HH:mm:ss');
    const date = moment().tz(timezone).format('dddd, DD MMMM YYYY');

    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    let menu = `
╭┈┈〔ㄒ尺乂 -MENU〕┈╮
│▢- *USER:* @${sender.split("@")[0]}
│▢- *MODE:* ${config.MODE}
│▢- *TIME:* ${uptime()}
│▢- *PREFIX:* 「 ${config.PREFIX} 」
│▢- *PLUGINS:* 『 ${commands.length} 』
│▢-  *VER:* 2.0.0
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯

╭━〔卩ㄖ卩Ҝ丨ᗪ-ㄒ尺乂 〕┈⊷
│⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘
│POPKID IS BACK
├─┬〔 COMANDS 〕`;

    // Group commands by category (improved logic)
    const categories = {};
    for (const cmd of commands) {
      if (cmd.category && !cmd.dontAdd && cmd.pattern) {
        const normalizedCategory = normalize(cmd.category);
        categories[normalizedCategory] = categories[normalizedCategory] || [];
        categories[normalizedCategory].push(cmd.pattern.split('|')[0]);
      }
    }

    // Add sorted categories with stylized text
    for (const cat of Object.keys(categories).sort()) {
      const emoji = emojiByCategory[cat] || '💫';
      menu += `\n│ 〔${emoji}〕\n│      ╰┈➤${toUpperStylized(cat)}`;
    }

    menu += `
│卩ㄖ卩Ҝ丨ᗪ-ㄒ尺乂
│  TROPHY 🏆 WON 
│▶︎  • ılıılılılılılıılılı. 
│              ╭─➊ TOP⬙
│          ╭➊POWERFUL⬙
│       ╭➊ NOERROR⬙
│   ╭➊ ACUTE⬙
├┬➊  SPEED⬙
││ ╰➊ SIMPLE 
││        ╰➊ AVAILABLE 
││         ╰➊ ACTIVE 
││           ╰➊DESIGNED
││
││
││          ╭➊ SUPPORT 
││        ╭➊ USE GUIDE
││    ╭➊ AUTO 
││ ╭➊ NEW
│╰➊ HIGH QUALITY 
│▱▰▱▰
│ STATUS CODE
│𝄀𝄁𝄃𝄂𝄂𝄃𝄃𝄂𝄂𝄀𝄁𝄃𝄂𝄂𝄃𝄃𝄂𝄂𝄀𝄁𝄃𝄂𝄂𝄃𝄃𝄂𝄂𝄀𝄁𝄃
│   EXTINCTION  
│   OF WEAK BOT
│-ˋˏ✄┈┈┈┈ ©2025
╰─────────────╯`;

    // Context info for image message
    const imageContextInfo = {
      mentionedJid: [sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: config.NEWSLETTER_JID || '120363420342566562@newsletter',
        newsletterName: config.OWNER_NAME || toUpperStylized('popkid'),
        serverMessageId: 143
      }
    };

    // Send menu image
    await cmd.sendMessage(
      from,
      {
        image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/tbdd5d.jpg' },
        caption: menu,
        contextInfo: imageContextInfo
      },
      { quoted: mek }
    );

    // Send audio if configued
    if (config.MENU_AUDIO_URL) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await cmd.sendMessage(
        from,
        {
          audio: { url: config.MENU_AUDIO_URL },
          mimetype: 'audio/mp4',
          ptt: true,
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: config.OWNER_NAME || toUpperStylized('popkid'),
              serverMessageId: 143
            }
          }
        },
        { quoted: mek }
      );
    }

  } catch (e) {
    console.error('Menu Error:', e.message);
    await reply(`❌ ${toUpperStylized('Error')}: Failed to show menu. Try again.\n${toUpperStylized('Details')}: ${e.message}`);
  }
});
