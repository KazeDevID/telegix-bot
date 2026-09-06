/**
 * =========================================================================
 *  PLUGIN: Owner Info (plugins/info-owner.js)
 *  Menampilkan profil pemilik/developer bot 
 * =========================================================================
 */

const { Markup, RichMessage } = require('telegix')

let handler = async (m, { config }) => {
  const cfg = config || m.config || {}
  const owners = cfg.owner || []

  const card = RichMessage.card(
    '👑 INFORMASI OWNER & DEVELOPER',
    'Berikut adalah identitas pemilik dan pengembang bot Telegram ini:'
  )
    .badge('Status', 'Terverifikasi (Creator)', '⭐')
    .divider()

  if (owners.length === 0) {
    card.paragraph('Belum ada data owner yang terdaftar di bot/config.js.')
  } else {
    const listItems = []
    owners.forEach((item, index) => {
      const idOrUser = Array.isArray(item) ? item[0] : item
      const name = Array.isArray(item) ? item[1] : 'Owner'
      const isCreator = Array.isArray(item) ? item[2] : false
      listItems.push(`${name} ${isCreator ? '🌟' : ''} — ID: ${idOrUser}`)
    })
    card.header('Daftar Pemilik Terdaftar')
    card.list(listItems)
  }

  card.divider()
  card.expandableQuote(
    'Catatan Izin Owner:\n' +
    '• Memiliki hak akses penuh ke seluruh perintah ber-tag owner\n' +
    '• Bebas dari pembatasan rate limit dan mode self\n' +
    '• Dapat mengevaluasi kode via plugin evaluator'
  )

  card.row(
    Markup.button.success('💬 Chat Owner', 'tg://user?id=8687264154'),
    Markup.button.primary('📜 Buka Menu', 'menu')
  )

  await m.reply(card)
}

handler.help = ['owner', 'creator']
handler.tags = ['info']
handler.command = /^(owner|creator)$/i

module.exports = handler
