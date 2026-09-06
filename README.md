# 🤖 Telegix Telegram Bot Base (nurutomo/wabot-aq Architecture)

Base script bot Telegram modern menggunakan library [telegix](https://www.npmjs.com/package/telegix)

## 🚀 Cara Menjalankan

### 1. Buka File Konfigurasi
Buka file `bot/config.js`:
```javascript
botToken = '123456789:ABCdefGhIJKlmNoPQRstuVWXyz' // Token dari @BotFather
botName = 'Nama Bot Anda'
owner = [
  [123456789, 'Nama Anda', true] // Masukkan ID Telegram Anda
]
```

### 2. Jalankan Bot
```bash
# Menggunakan script npm
npm run bot

# Atau langsung menggunakan node
node bot/main.js
```

---

## 🧩 Cara Menulis Plugin Baru

Buat file baru di folder `bot/plugins/`, contoh `bot/plugins/halo.js`:

```javascript
let handler = async (m, { bot, args, text, usedPrefix, command, isOwner }) => {
  await m.reply(`Halo *${m.name}*! Kamu menjalankan command *${usedPrefix}${command}*`, {
    parse_mode: 'Markdown'
  })
}

// Bantuan yang tampil di menu
handler.help = ['halo', 'hai']

// Kategori menu (main, info, tools, owner, dll)
handler.tags = ['main']

// Regex atau array nama command
handler.command = /^(halo|hai|hello)$/i

// Batasan hak akses (opsional):
// handler.owner = false    // Hanya untuk owner
// handler.group = false    // Hanya di grup
// handler.private = false  // Hanya di private chat
// handler.admin = false    // Hanya untuk admin grup

module.exports = handler
```

Ketika file disimpan, sistem watcher akan langsung memuat plugin secara otomatis tanpa perlu mematikan bot!
