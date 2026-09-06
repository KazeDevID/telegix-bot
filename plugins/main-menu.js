/**
 * =========================================================================
 *  PLUGIN: Menu & Help (plugins/main-menu.js)
 *  Menampilkan menu terstruktur dengan Telegix RichMessage & Tombol Berwarna
 * =========================================================================
 */

const { Markup, RichMessage } = require('telegix')

let handler = async (m, { config, bot, usedPrefix, command, text }) => {
  const cfg = config || m.config || {}
  const uptime = formatTime(process.uptime())
  const senderName = m.name || 'Pengguna'

  const defaultTags = {
    'main': '🏠 MENU UTAMA',
    'info': 'ℹ️ INFORMASI BOT',
    'owner': '👑 KHUSUS OWNER'
  }

  const helpList = {}
  for (const tag in defaultTags) {
    helpList[tag] = []
  }

  for (const name in global.plugins) {
    const plugin = global.plugins[name]
    if (!plugin || plugin.disabled || !plugin.help) continue

    const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : ['main'])
    const helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help]

    for (const tag of tags) {
      if (!helpList[tag]) helpList[tag] = []
      for (const h of helps) {
        if (!helpList[tag].includes(h)) {
          helpList[tag].push(h)
        }
      }
    }
  }

  const card = RichMessage.card(
    `⚡ DAFTAR PERINTAH — ${cfg.botName || 'Telegix Bot'}`,
    `Halo ${senderName}! Berikut adalah daftar perintah yang siap digunakan:`
  )
    .badge('Uptime', uptime, '⏱️')
    .badge('Prefix', usedPrefix || '/', '⌨️')
    .badge('Mode', cfg.opts?.self ? 'Self' : 'Public', '🌐')
    .badge('Auto-Typing', cfg.opts?.autoTyping ? 'Aktif' : 'Nonaktif', '⌨️')
    .divider()

  for (const [tag, label] of Object.entries(defaultTags)) {
    const commands = helpList[tag] || []
    if (commands.length === 0) continue

    const formattedList = commands.map(cmd => `${usedPrefix || '/'}${cmd}`)
    card.header(label)
    card.list(formattedList)
  }

  card.divider()
  card.expandableQuote(
    'Catatan & Fitur Telegix:\n' +
    '• Tombol aksi (Primary, Success, Danger)\n' +
    '• Card layout disusun dengan Telegix RichMessage Builder\n'
  )

  card.row(
    Markup.button.primary('⚡ Cek Ping', 'ping'),
    Markup.button.success('ℹ️ Info Bot', 'botinfo')
  )
  card.row(
    Markup.button.danger('👑 Info Owner', 'owner'),
    Markup.button.colored('🎴 Rich Card', 'primary', 'card')
  )
  card.row(
    Markup.button.disabled('🔒 Memory Storage (No Database)')
  )

  await m.reply(card)
}

handler.help = ['menu', 'help', '?']
handler.tags = ['main']
handler.command = /^(menu|help|\?)$/i

module.exports = handler

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}j ${m}m ${s}d`
}
