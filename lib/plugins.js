const fs = require('fs')
const path = require('path')
const { color } = require('./print')

if (!global.plugins) {
  global.plugins = {}
}

const pluginFolder = path.resolve(__dirname, '../plugins')

/**
 * Memuat sebuah plugin tunggal dari file
 * @param {string} filename Nama file di folder plugins
 */
function loadPlugin(filename) {
  const filepath = path.join(pluginFolder, filename)
  if (!fs.existsSync(filepath)) {
    delete global.plugins[filename]
    return null
  }

  try {
    const resolved = require.resolve(filepath)
    delete require.cache[resolved]

    const loaded = require(filepath)
    const plugin = loaded.default || loaded

    if (typeof plugin === 'function' || typeof plugin?.all === 'function' || typeof plugin?.before === 'function') {
      global.plugins[filename] = plugin
      return plugin
    } else {
      console.warn(`${color.yellow}[PLUGIN WARN]${color.reset} '${filename}' tidak mengekspor handler yang valid.`)
      delete global.plugins[filename]
      return null
    }
  } catch (err) {
    console.error(`${color.red}[PLUGIN ERROR]${color.reset} Gagal memuat plugin '${filename}':`, err.message)
    delete global.plugins[filename]
    return null
  }
}

/**
 * Memuat semua plugin yang ada di folder plugins
 */
function loadAllPlugins() {
  if (!fs.existsSync(pluginFolder)) {
    fs.mkdirSync(pluginFolder, { recursive: true })
  }

  const files = fs.readdirSync(pluginFolder)
  let count = 0

  for (const file of files) {
    if (file.endsWith('.js') && !file.startsWith('.')) {
      const p = loadPlugin(file)
      if (p) count++
    }
  }

  console.log(`${color.green}[PLUGINS]${color.reset} Berhasil memuat ${color.bold}${count}${color.reset} plugin.`)
  return global.plugins
}

/**
 * Mengaktifkan file watcher untuk auto-reload saat kode plugin diedit
 */
function watchPlugins() {
  if (!fs.existsSync(pluginFolder)) return

  try {
    fs.watch(pluginFolder, (eventType, filename) => {
      if (!filename || !filename.endsWith('.js') || filename.startsWith('.')) return

      const filepath = path.join(pluginFolder, filename)
      if (fs.existsSync(filepath)) {
        console.log(`${color.cyan}[PLUGIN RELOAD]${color.reset} Memuat ulang: ${filename}`)
        loadPlugin(filename)
      } else {
        console.log(`${color.yellow}[PLUGIN UNLOAD]${color.reset} Plugin dihapus: ${filename}`)
        delete global.plugins[filename]
      }
    })
  } catch (err) {
    console.warn(`${color.yellow}[WATCHER]${color.reset} Watcher fs tidak dapat dimulai:`, err.message)
  }
}

module.exports = {
  loadPlugin,
  loadAllPlugins,
  watchPlugins,
  pluginFolder
}
