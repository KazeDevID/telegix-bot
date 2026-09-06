/**
 * =========================================================================
 *  CENTRAL MESSAGE HANDLER (handler.js)
 *  Struktur Arsitektur Asli: nurutomo/wabot-aq (Diadaptasi untuk Telegix)
 * =========================================================================
 */

const config = require('./config')
const { smsg } = require('./lib/serialize')
const { printMessage, color } = require('./lib/print')

/**
 * @param {number|string} senderId
 * @param {string} username
 * @param {object} [ctx]
 * @returns {boolean}
 */
function checkIsOwner(senderId, username, ctx) {
  const ownerList = Array.isArray(config.owner) ? config.owner : (config.owner ? [config.owner] : [])
  if (!ownerList || ownerList.length === 0) return false

  const sIdStr = senderId != null ? String(senderId).trim() : ''
  const ctxIdStr = ctx?.from?.id != null ? String(ctx.from.id).trim() : ''
  const rawUser = username || ctx?.from?.username || ''
  const userStr = String(rawUser).replace(/^@/, '').trim().toLowerCase()

  return ownerList.some(entry => {
    if (!entry) return false
    let target = entry
    if (Array.isArray(entry)) {
      target = entry[0]
    } else if (typeof entry === 'object' && entry !== null) {
      target = entry.id || entry.user || entry.userId || entry[0]
    }

    if (target == null) return false
    const targetStr = String(target).trim()

    if (sIdStr && targetStr === sIdStr) return true
    if (ctxIdStr && targetStr === ctxIdStr) return true

    const sNum = Number(sIdStr)
    const tNum = Number(targetStr)
    if (!isNaN(sNum) && !isNaN(tNum) && sNum > 0 && sNum === tNum) return true

    const cleanTarget = targetStr.replace(/^@/, '').toLowerCase()
    if (userStr && cleanTarget === userStr) return true

    return false
  })
}

async function handler(ctx, bot) {
  try {
    const m = smsg(ctx, bot)
    if (!m) return

    m.config = config
    if (bot) bot.config = config

    if (config.opts?.debug) {
      printMessage(m, ctx)
    }

    if (ctx.callbackQuery) {
      if (typeof ctx.answerCallbackQuery === 'function') {
        ctx.answerCallbackQuery().catch(() => {})
      } else if (typeof ctx.answerCbQuery === 'function') {
        ctx.answerCbQuery().catch(() => {})
      }
    }

    const isOwner = checkIsOwner(m.sender, m.senderUsername || m.from?.username || ctx.from?.username, ctx)
    m.isOwner = isOwner
    const isMods = isOwner || (config.mods || []).some(mod => String(mod).trim() === String(m.sender).trim())
    const isPrems = isOwner || (config.prems || []).some(prem => String(prem).trim() === String(m.sender).trim())

    if (config.opts?.self && !isOwner) {
      return
    }

    let isAdmin = false
    let isBotAdmin = false

    if (m.isGroup) {
      try {
        const member = await ctx.getChatMember(m.sender)
        isAdmin = member && (member.status === 'creator' || member.status === 'administrator')

        if (bot?.botInfo?.id) {
          const botMember = await ctx.getChatMember(bot.botInfo.id)
          isBotAdmin = botMember && botMember.status === 'administrator'
        }
      } catch (e) {
      }
    }

    const extra = {
      bot,
      conn: bot,
      m,
      ctx,
      config,
      chatUpdate: ctx,
      isOwner,
      isMods,
      isPrems,
      isAdmin,
      isBotAdmin,
      isGroup: m.isGroup,
      isPrivate: m.isPrivate
    }

    for (const name in global.plugins) {
      const plugin = global.plugins[name]
      if (!plugin) continue
      if (typeof plugin.before === 'function') {
        try {
          const stop = await plugin.before.call(bot, m, extra)
          if (stop) return
        } catch (err) {
          console.error(`${color.red}[PLUGIN ERROR in ${name}.before]${color.reset}`, err)
        }
      }
    }

    const text = m.text || ''
    if (!text.trim()) return

    let usedPrefix = ''
    let isCommand = false

    const defaultPrefix = config.prefix || /^[./!#\\]/
    if (defaultPrefix instanceof RegExp) {
      const match = defaultPrefix.exec(text)
      if (match) {
        usedPrefix = match[0]
        isCommand = true
      }
    } else if (Array.isArray(defaultPrefix)) {
      for (const p of defaultPrefix) {
        if (text.startsWith(p)) {
          usedPrefix = p
          isCommand = true
          break
        }
      }
    } else if (typeof defaultPrefix === 'string') {
      if (text.startsWith(defaultPrefix)) {
        usedPrefix = defaultPrefix
        isCommand = true
      }
    }

    if (!isCommand && (ctx.callbackQuery || config.opts?.noprefix)) {
      usedPrefix = ''
      isCommand = true
    }

    const noPrefix = isCommand ? text.slice(usedPrefix.length).trim() : text.trim()
    const parts = noPrefix.split(/\s+/)
    const command = (parts[0] || '').toLowerCase()
    const args = parts.slice(1)
    const commandText = args.join(' ')

    extra.usedPrefix = usedPrefix
    extra.command = command
    extra.args = args
    extra.text = commandText

    let pluginMatched = false

    for (const name in global.plugins) {
      const plugin = global.plugins[name]
      if (!plugin) continue

      let isMatch = false

      if (plugin.command) {
        if (plugin.command instanceof RegExp) {
          isMatch = plugin.command.test(command)
        } else if (Array.isArray(plugin.command)) {
          isMatch = plugin.command.map(c => c.toLowerCase()).includes(command)
        } else if (typeof plugin.command === 'string') {
          isMatch = plugin.command.toLowerCase() === command
        }
      }

      if (!isMatch && typeof plugin.customPrefix === 'function') {
        isMatch = plugin.customPrefix(text, m)
      }

      if (!isMatch) continue
      pluginMatched = true

      if (config.opts?.autoTyping ?? config.opts?.autotyping) {
        try {
          if (typeof ctx.sendChatAction === 'function') {
            ctx.sendChatAction('typing').catch(() => {})
          } else if (typeof ctx.replyWithChatAction === 'function') {
            ctx.replyWithChatAction('typing').catch(() => {})
          } else if (typeof ctx.telegram?.sendChatAction === 'function') {
            ctx.telegram.sendChatAction(m.chatId || ctx.chat?.id, 'typing').catch(() => {})
          }
        } catch (e) {}
      }

      const callDfail = (type) => {
        if (typeof config.dfail === 'function') {
          return config.dfail(type, m, bot)
        }
        if (typeof global.dfail === 'function') {
          return global.dfail(type, m, bot)
        }
      }

      if (plugin.owner && !isOwner) {
        callDfail('owner')
        break
      }
      if (plugin.mods && !isMods) {
        callDfail('mods')
        break
      }
      if (plugin.group && !m.isGroup) {
        callDfail('group')
        break
      }
      if (plugin.private && !m.isPrivate) {
        callDfail('private')
        break
      }
      if (plugin.admin && !isAdmin) {
        callDfail('admin')
        break
      }
      if (plugin.botAdmin && !isBotAdmin) {
        callDfail('botAdmin')
        break
      }

      try {
        const handlerFn = typeof plugin === 'function' ? plugin : plugin.default || plugin.run
        if (typeof handlerFn === 'function') {
          await handlerFn.call(bot, m, extra)
        }
      } catch (err) {
        console.error(`${color.red}[ERROR in ${name}]${color.reset}`, err)
        const errMsg = isOwner
          ? `*Error di plugin:* \`${name}\`\n\`\`\`\n${err.stack || err.message}\n\`\`\``
          : (config.msg?.error || 'Terjadi kesalahan saat menjalankan perintah.')
        m.reply(errMsg, { parse_mode: 'Markdown' })
      }

      break
    }

    for (const name in global.plugins) {
      const plugin = global.plugins[name]
      if (plugin && typeof plugin.all === 'function') {
        try {
          await plugin.all.call(bot, m, extra)
        } catch (err) {
          console.error(`${color.red}[PLUGIN ERROR in ${name}.all]${color.reset}`, err)
        }
      }
    }
  } catch (err) {
    console.error(`${color.red}[HANDLER FATAL ERROR]${color.reset}`, err)
  }
}

module.exports = { handler }
