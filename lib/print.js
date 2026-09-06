const color = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
}

/**
 * Print incoming message event to stdout
 * @param {object} m - Objek pesan dari serializer
 * @param {import('telegix').Context} ctx - Konteks Telegix
 */
function printMessage(m, ctx) {
  if (!m || !m.text) return

  const now = new Date()
  const timeStr = now.toTimeString().split(' ')[0]

  const chatTypeBadge = m.isGroup
    ? `${color.magenta}[GROUP]${color.reset}`
    : `${color.blue}[PRIVATE]${color.reset}`

  const senderBadge = `${color.bold}${m.name}${color.reset} ${color.gray}(${m.sender})${color.reset}`
  const chatInfo = m.isGroup ? ` in ${color.cyan}${ctx.chat?.title || 'Group'}${color.reset}` : ''
  const previewText = m.text.length > 80 ? m.text.slice(0, 77) + '...' : m.text

  console.log(
    `${color.gray}[${timeStr}]${color.reset} ` +
    `${chatTypeBadge} ` +
    `${senderBadge}${chatInfo} ` +
    `-> ${color.green}${previewText}${color.reset}`
  )
}

module.exports = { printMessage, color }
