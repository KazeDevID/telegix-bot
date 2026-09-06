/**
 * =========================================================================
 *  MAIN ENTRY POINT (main.js)
 *  Menjalankan Telegram Bot menggunakan Telegix & Struktur nurutomo/wabot-aq
 * =========================================================================
 */

const config = require('./config')

const { Telegix } = require('telegix')
const { loadAllPlugins, watchPlugins } = require('./lib/plugins')
const { handler } = require('./handler')
const { color } = require('./lib/print')

async function startBot() {
  console.clear()
  console.log(`${color.cyan}====================================================${color.reset}`)
  console.log(`${color.bold}${color.green}   🤖 TELEGIX TELEGRAM BOT BASE ${color.reset}`)
  console.log(`${color.gray}   Base By: KazeDevID ${color.reset}`)
  console.log(`${color.cyan}====================================================${color.reset}\n`)

  const token = config.botToken
  if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN' || token.includes('YOUR_')) {
    console.error(`${color.red}[ERROR] Token Telegram belum diatur!${color.reset}`)
    console.error(`Silakan buka file ${color.yellow}bot/config.js${color.reset} dan isi ${color.bold}config.botToken${color.reset} dengan token bot dari @BotFather.\n`)
    process.exit(1)
  }

  const bot = new Telegix(token)
  bot.config = config

  loadAllPlugins()
  watchPlugins()

  bot.catch((err, ctx) => {
    console.error(`${color.red}[BOT CATCH ERROR]${color.reset}`, err.message)
  })

  bot.on('message', async (ctx) => {
    await handler(ctx, bot)
  })

  bot.on('callback_query', async (ctx) => {
    try {
      if (typeof ctx.answerCbQuery === 'function') {
        ctx.answerCbQuery().catch(() => {})
      }
    } catch (e) {}
    await handler(ctx, bot)
  })

  try {
    const botInfo = await bot.launch({ dropPendingUpdates: true })
    bot.botInfo = botInfo

    console.log(`\n${color.green}✨ Bot Berhasil Terhubung ke Telegram!${color.reset}`)
    console.log(`• ${color.bold}Nama Bot:${color.reset}     ${botInfo.first_name || config.botName}`)
    console.log(`• ${color.bold}Username:${color.reset}     @${botInfo.username}`)
    console.log(`• ${color.bold}ID Bot:${color.reset}       ${botInfo.id}`)
    console.log(`• ${color.bold}Total Plugin:${color.reset} ${Object.keys(global.plugins || {}).length} aktif`)
    console.log(`• ${color.bold}Prefix:${color.reset}       ${config.prefix}`)
    console.log(`• ${color.bold}Mode:${color.reset}         ${config.opts.self ? 'Self (Owner Only)' : 'Public'}`)
    console.log(`• ${color.bold}Auto-Typing:${color.reset}  ${config.opts.autoTyping ? 'Aktif' : 'Nonaktif'}`)
    console.log(`${color.cyan}----------------------------------------------------${color.reset}`)
    console.log(`${color.gray}Bot siap menerima perintah. Tekan Ctrl+C untuk berhenti.${color.reset}\n`)
  } catch (err) {
    console.error(`${color.red}[FATAL] Gagal menghubungkan bot:${color.reset}`, err.message)
    process.exit(1)
  }

  const stopHandler = (signal) => {
    console.log(`\n${color.yellow}[SHUTDOWN] Menghentikan bot (${signal})...${color.reset}`)
    try {
      bot.stop(signal)
    } catch (e) {}
    process.exit(0)
  }

  process.once('SIGINT', () => stopHandler('SIGINT'))
  process.once('SIGTERM', () => stopHandler('SIGTERM'))
}

if (require.main === module) {
  startBot()
}

module.exports = { startBot }
