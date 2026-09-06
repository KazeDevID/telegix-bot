/**
 * =========================================================================
 *  PLUGIN: Start (plugins/main-start.js)
 *  Pesan selamat datang menggunakan Telegix RichMessage & Colored Buttons
 * =========================================================================
 */

const { Markup, RichMessage } = require('telegix')

let handler = async (m, { config, usedPrefix }) => {
  const botName = config?.botName || m.config?.botName || 'Telegix Bot'
  const card = RichMessage.card(
    `Halo ${m.name}! Selamat Datang di ${botName}`
  )
    .badge('Engine', 'Telegix 1.1.2 (Bot API 10.3)', '⚡')
    .badge('Status', 'Online & Siap', '🟢')
    .divider()
    .paragraph('Bot ini telah diperbarui dengan tombol berwarna (Bot API 9.4+) dan RichMessage block layout (Bot API 10.3+).')
    .expandableQuote(
      'Keunggulan Arsitektur:\n' +
      '• Dynamic Hot-Reload Plugins\n' +
      '• Owner Terdeteksi: ID 8687264154\n' +
      '• Colored Action Buttons: Primary (Biru), Success (Hijau), Danger (Merah)'
    )
    .row(
      Markup.button.primary('📜 Buka Menu', 'menu'),
      Markup.button.success('⚡ Cek Ping', 'ping')
    )
    .row(
      Markup.button.danger('👑 Info Owner', 'owner'),
      Markup.button.colored('🎴 Rich Card', 'primary', 'card')
    )
    .row(
      Markup.button.disabled('🔒 Stateless (No Database)')
    )

  await m.reply(card)
}

handler.help = ['start']
handler.tags = ['main']
handler.command = /^(start)$/i

module.exports = handler
