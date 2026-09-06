/**
 * =========================================================================
 *  CONFIGURATION MODULE - TELEGRAM BOT BASE (TELEGIX)
 * =========================================================================
 */

const config = {
  // Token Bot dari @BotFather
  botToken: 'YOUR_TELEGRAM_BOT_TOKEN',
  botName: 'Telegix Base',
  version: '1.0.0',

  // Daftar Owner Bot
  // Format: [ Telegram_User_ID (angka) atau '@username', 'Nama Owner', isCreator (boolean) ]
  // ID Owner Resmi: 8687264154
  owner: [
    [8687264154, 'Owner Utama', true],
    ['8687264154', 'Owner Utama (Str)', true]
  ],

  // Daftar Moderator & Pengguna Khusus
  mods: [],  // ID moderator bot
  prems: [], // ID pengguna premium

  // Command Prefix
  // Menggunakan RegExp: otomatis mendeteksi karakter awalan seperti . / ! # \
  prefix: /^[./!#\\]/,

  // Setingan Bot
  opts: {
    self: false,         // True = Bot hanya merespons pesan dari Owner
    autoTyping: true,    // True = Mengirim status 'typing' otomatis saat memproses (bukan autoread)
    noprefix: false,     // True = Izinkan perintah dipanggil tanpa prefix
    debug: true,         // Tampilkan detail log console untuk setiap pesan masuk
    ownerOnly: false     // Kunci bot hanya untuk owner
  },

  // Pesan & Respon Standar
  msg: {
    wait: '⏳ _Sedang diproses, mohon tunggu sebentar..._',
    error: '❌ _Terjadi kesalahan internal saat memproses perintah ini!_',
    done: '✅ _Selesai!_',
    banned: '🚫 Akun Anda telah diblokir untuk menggunakan bot ini.'
  },

  /**
   * Default Fail Handler (config.dfail)
   * Dipanggil otomatis jika user melanggar batas hak akses plugin
   * @param {string} type - Jenis penolakan ('owner', 'mods', 'admin', 'botAdmin', 'group', 'private')
   * @param {object} m - Objek pesan terserialisasi
   * @param {object} bot - Instance Telegix
   */
  dfail: (type, m, bot) => {
    const msg = {
      owner: '👑 *AKSES DITOLAK*\nPerintah ini hanya dapat dijalankan oleh *Owner Bot*!',
      mods: '🛡️ *AKSES DITOLAK*\nPerintah ini khusus untuk *Moderator Bot*!',
      admin: '👮 *AKSES DITOLAK*\nPerintah ini hanya bisa digunakan oleh *Admin Grup*!',
      botAdmin: '⚠️ *BOT BUKAN ADMIN*\nJadikan bot sebagai *Admin* di grup ini untuk menjalankan perintah ini!',
      group: '👥 *GRUP SAJA*\nPerintah ini hanya dapat digunakan di dalam *Grup Telegram*!',
      private: '💬 *PRIVATE CHAT SAJA*\nPerintah ini hanya dapat digunakan di *Private Chat* bersama bot!'
    }[type]

    if (msg) {
      return m.reply(msg, { parse_mode: 'Markdown' })
    }
  }
}

module.exports = config
