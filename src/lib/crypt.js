'use strict'

const crypto = require('crypto')
const util = require('util')

const crypt = {
  iv: '@@@@&&&&####$$$$',
  encrypt: function (data, customKey) {
    const iv = this.iv
    const key = customKey
    let algo = '256'
    switch (key.length) {
      case 16:
        algo = '128'
        break
      case 24:
        algo = '192'
        break
      case 32:
        algo = '256'
        break
    }
    const cipher = crypto.createCipheriv('AES-' + algo + '-CBC', key, iv)
    // var cipher = crypto.createCipher('aes256',key);
    let encrypted = cipher.update(data, 'binary', 'base64')
    encrypted += cipher.final('base64')
    return encrypted
  },

  decrypt: function (data, customKey) {
    const iv = this.iv
    const key = customKey
    let algo = '256'
    switch (key.length) {
      case 16:
        algo = '128'
        break
      case 24:
        algo = '192'
        break
      case 32:
        algo = '256'
        break
    }
    const decipher = crypto.createDecipheriv('AES-' + algo + '-CBC', key, iv)
    let decrypted = decipher.update(data, 'base64', 'binary')
    try {
      decrypted += decipher.final('binary')
    } catch (e) {
      console.log(util.inspect(e))
    }
    return decrypted
  },

  gen_salt: function (length, cb) {
    crypto.randomBytes((length * 3.0) / 4.0, function (err, buf) {
      let salt
      if (!err) {
        salt = buf.toString('base64')
      }
      cb(err, salt)
    })
  },

  /* one way md5 hash with salt */
  md5sum: function (salt, data) {
    return crypto.createHash('md5').update(salt + data).digest('hex')
  },
  sha256sum: function (salt, data) {
    return crypto.createHash('sha256').update(data + salt).digest('hex')
  }
}

module.exports = crypt
