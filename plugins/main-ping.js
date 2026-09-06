/**
 * =========================================================================
 *  PLUGIN: Ping (plugins/main-ping.js)
 *  Tes kecepatan respons dan latensi bot
 * =========================================================================
 */

let handler = async (m) => {
  const start = Date.now()
  const msg = await m.reply('🏓 _Pinging..._', { parse_mode: 'Markdown' })
  const latency = Date.now() - start

  const text =
    `🏓 *Pong!*\n\n` +
    `• *Kecepatan:* \`${latency} ms\`\n` +
    `• *Server Runtime:* \`${Math.round(process.uptime())}s\`\n` +
    `• *Status:* 🟢 Normal & Aktif`

  if (msg?.message_id && typeof m.ctx.editMessageText === 'function') {
    await m.ctx.editMessageText(text, { parse_mode: 'Markdown' }).catch(() => {})
  } else {
    await m.reply(text, { parse_mode: 'Markdown' })
  }
}

handler.help = ['ping', 'speed']
handler.tags = ['main']
handler.command = /^(ping|speed|p)$/i

module.exports = handler
