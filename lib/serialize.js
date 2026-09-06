/**
 * Serialize Telegix context into a simple wabot-aq message object
 * @param {import('telegix').Context} ctx
 * @param {import('telegix').Telegix} bot
 * @returns {object} m
 */
function smsg(ctx, bot) {
  if (!ctx) return null

  const msg = ctx.message || ctx.editedMessage || ctx.channelPost || ctx.callbackQuery?.message
  const from = ctx.from || ctx.callbackQuery?.from
  const chat = ctx.chat

  const m = {
    ctx,
    bot,
    id: msg?.message_id,
    from,
    chat,
    chatId: chat?.id,
    chatType: chat?.type || 'private',
    isGroup: chat?.type === 'group' || chat?.type === 'supergroup',
    isChannel: chat?.type === 'channel',
    isPrivate: chat?.type === 'private',
    fromMe: from?.id === bot?.botInfo?.id,
    sender: from?.id,
    senderUsername: from?.username ? `@${from.username}` : null,
    name: [from?.first_name, from?.last_name].filter(Boolean).join(' ') || from?.username || 'User',
    text: ctx.text || msg?.caption || ctx.callbackQuery?.data || '',
    date: msg?.date ? new Date(msg.date * 1000) : new Date(),
    raw: msg
  }

  if (msg?.reply_to_message) {
    const q = msg.reply_to_message
    const qFrom = q.from
    m.quoted = {
      id: q.message_id,
      sender: qFrom?.id,
      name: [qFrom?.first_name, qFrom?.last_name].filter(Boolean).join(' ') || qFrom?.username || 'User',
      username: qFrom?.username ? `@${qFrom.username}` : null,
      text: q.text || q.caption || '',
      isBot: qFrom?.is_bot || false,
      photo: q.photo || null,
      document: q.document || null,
      audio: q.audio || null,
      video: q.video || null,
      voice: q.voice || null,
      sticker: q.sticker || null,
      raw: q
    }
  } else {
    m.quoted = null
  }

  /**
   * Helper m.reply (Khas wabot-aq)
   * Mengirim balasan langsung ke chat pengirim
   * Mendukung teks biasa, Markdown, HTML, maupun objek RichMessage Telegix
   */
  m.reply = async (content, extra = {}) => {
    try {
      if (content && (typeof content.compile === 'function' || typeof content.build === 'function')) {
        if (typeof ctx.replyWithRichMessage === 'function') {
          return await ctx.replyWithRichMessage(content, extra)
        }
        const compiled = typeof content.compile === 'function' ? content.compile() : content.build()
        const payload = {
          parse_mode: compiled.parse_mode || 'HTML',
          reply_to_message_id: m.id,
          ...(compiled.reply_markup ? { reply_markup: compiled.reply_markup } : {}),
          ...extra
        }
        return await ctx.reply(compiled.text || ' ', payload)
      }

      const payloadExtra = {
        reply_to_message_id: m.id,
        ...extra
      }

      if (extra?.inline_keyboard && !payloadExtra.reply_markup) {
        payloadExtra.reply_markup = { inline_keyboard: extra.inline_keyboard }
      }

      let textToSend = content
      if (typeof textToSend === 'object' && textToSend !== null) {
        textToSend = JSON.stringify(textToSend, null, 2)
      }

      return await ctx.reply(String(textToSend), payloadExtra)
    } catch (err) {
      console.error('[m.reply error]', err.message)
      return null
    }
  }

  /**
   * Helper balasan dengan Telegix Rich Message (Bot API 10.3 / 9.4+)
   */
  m.replyRichMessage = async (richMessage, extra = {}) => {
    try {
      if (typeof ctx.replyWithRichMessage === 'function') {
        return await ctx.replyWithRichMessage(richMessage, {
          reply_to_message_id: m.id,
          ...extra
        })
      }
      return await m.reply(richMessage, extra)
    } catch (err) {
      console.error('[m.replyRichMessage error]', err.message)
      return null
    }
  }

  /**
   * Helper balasan dengan format Markdown
   */
  m.replyMarkdown = async (markdownText, extra = {}) => {
    return m.reply(markdownText, { parse_mode: 'Markdown', ...extra })
  }

  /**
   * Helper balasan dengan format HTML
   */
  m.replyHTML = async (htmlText, extra = {}) => {
    return m.reply(htmlText, { parse_mode: 'HTML', ...extra })
  }

  /**
   * Helper react emoji (jika didukung)
   */
  m.react = async (emoji) => {
    try {
      if (typeof ctx.react === 'function') {
        return await ctx.react(emoji)
      }
    } catch (e) {
    }
  }

  /**
   * Helper hapus pesan
   */
  m.delete = async () => {
    try {
      if (m.id && typeof ctx.deleteMessage === 'function') {
        return await ctx.deleteMessage(m.id)
      }
    } catch (e) {
    }
  }

  return m
}

module.exports = { smsg }
