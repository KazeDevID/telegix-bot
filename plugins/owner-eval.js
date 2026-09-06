/**
 * =========================================================================
 *  PLUGIN: Owner Evaluator (plugins/owner-eval.js)
 *  Fitur eksekusi kode JavaScript (>, =>) dan Terminal ($)
 *  Hanya dapat dijalankan oleh OWNER!
 * =========================================================================
 */

const util = require('util')
const { exec } = require('child_process')

let handler = async (m, { bot, text, isOwner, usedPrefix, command }) => {
  if (!isOwner) return

  const rawText = m.text || ''

  if (rawText.startsWith('$')) {
    const cmd = rawText.slice(1).trim()
    if (!cmd) return m.reply('Masukkan perintah shell.')
    m.reply(`⚡ _Menjalankan:_ \`${cmd}\``, { parse_mode: 'Markdown' })

    exec(cmd, (err, stdout, stderr) => {
      if (err) return m.reply(`*Error:*\n\`\`\`\n${err.message}\n\`\`\``, { parse_mode: 'Markdown' })
      if (stderr && stderr.trim()) return m.reply(`⚠️ *Stderr:*\n\`\`\`\n${stderr}\n\`\`\``, { parse_mode: 'Markdown' })
      m.reply(`*Output:*\n\`\`\`\n${stdout || '(Selesai tanpa output)'}\n\`\`\``, { parse_mode: 'Markdown' })
    })
    return
  }

  let code = rawText.trim()
  const isReturn = code.startsWith('=>')
  if (isReturn) {
    code = code.slice(2).trim()
  } else if (code.startsWith('>')) {
    code = code.slice(1).trim()
  }

  if (!code) return m.reply('Masukkan baris kode JavaScript untuk dievaluasi.')

  let output
  try {
    if (isReturn) {
      output = await eval(`(async () => { return ${code} })()`)
    } else {
      try {
        output = await eval(code)
      } catch (e) {
        output = await eval(`(async () => { ${code} })()`)
      }
    }
  } catch (err) {
    output = err
  }

  try {
    let result = typeof output !== 'string' ? util.inspect(output, { depth: 2 }) : output
    if (result.length > 3500) {
      result = result.slice(0, 3500) + '\n... (output terpotong)'
    }
    await m.reply(`*Result:*\n\`\`\`javascript\n${result}\n\`\`\``, { parse_mode: 'Markdown' })
  } catch (e) {
    m.reply(`Gagal menampilkan output: ${e.message}`)
  }
}

handler.help = ['>', '=>', '$']
handler.tags = ['owner']
handler.customPrefix = (text) => /^(=?>|\$)/.test(text)
handler.command = /^(=?>|\$)/
handler.owner = true

module.exports = handler
