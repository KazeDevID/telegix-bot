/**
 * =========================================================================
 *  PLUGIN: Set Prefix & Options (plugins/owner-setprefix.js)
 *  Mengatur prefix dan mode bot secara in-memory (Owner Only)
 * =========================================================================
 */

let handler = async (m, { config, text, usedPrefix, command, isOwner }) => {
  if (!isOwner) return
  const cfg = config || m.config || {}
  if (!cfg.opts) cfg.opts = {}

  if (!text) {
    return m.reply(
      `⚙️ *PENGATURAN BOT (Modular In-Memory)*\n\n` +
      `• *Prefix Saat Ini:* \`${cfg.prefix}\`\n` +
      `• *Self Mode:* \`${cfg.opts?.self ? 'Aktif' : 'Nonaktif'}\`\n` +
      `• *No-Prefix Mode:* \`${cfg.opts?.noprefix ? 'Aktif' : 'Nonaktif'}\`\n` +
      `• *Auto-Typing:* \`${cfg.opts?.autoTyping ? 'Aktif' : 'Nonaktif'}\`\n\n` +
      `*Perintah:* \n` +
      `• \`${usedPrefix}${command} prefix <karakter>\` (Ganti prefix sementara)\n` +
      `• \`${usedPrefix}${command} self\` (Toggle mode self/hanya owner)\n` +
      `• \`${usedPrefix}${command} noprefix\` (Toggle tanpa prefix)\n` +
      `• \`${usedPrefix}${command} autotyping\` (Toggle status auto-typing)`,
      { parse_mode: 'Markdown' }
    )
  }

  const [sub, ...val] = text.trim().split(/\s+/)
  const subcmd = (sub || '').toLowerCase()

  if (subcmd === 'self') {
    cfg.opts.self = !cfg.opts.self
    return m.reply(`✅ *Self Mode:* ${cfg.opts.self ? '🟢 Aktif (Hanya Owner)' : '⚪ Nonaktif (Publik)'}`, { parse_mode: 'Markdown' })
  }

  if (subcmd === 'noprefix') {
    cfg.opts.noprefix = !cfg.opts.noprefix
    return m.reply(`✅ *No-Prefix Mode:* ${cfg.opts.noprefix ? '🟢 Aktif' : '⚪ Nonaktif'}`, { parse_mode: 'Markdown' })
  }

  if (subcmd === 'autotyping' || subcmd === 'typing') {
    cfg.opts.autoTyping = !cfg.opts.autoTyping
    return m.reply(`✅ *Auto-Typing:* ${cfg.opts.autoTyping ? '🟢 Aktif (Kirim status typing)' : '⚪ Nonaktif'}`, { parse_mode: 'Markdown' })
  }

  if (subcmd === 'prefix') {
    const newP = val.join(' ')
    if (!newP) return m.reply('Masukkan karakter prefix baru.')
    cfg.prefix = newP
    return m.reply(`Prefix berhasil diubah ke: \`${newP}\``, { parse_mode: 'Markdown' })
  }

  m.reply('Subcommand tidak dikenali. Pilihan: `self`, `noprefix`, `autotyping`, `prefix <char>`', { parse_mode: 'Markdown' })
}

handler.help = ['setprefix', 'botsetting']
handler.tags = ['owner']
handler.command = /^(setprefix|botsetting|opt)$/i
handler.owner = true

module.exports = handler
