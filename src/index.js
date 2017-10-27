'use-strict'
const crypt = require('./lib/crypt')
const crypto = require('crypto')
const assert = require('assert')
const _ = require('lodash')

class Paytm {
  constructor (merchantKey, options) {
    assert(merchantKey, 'Merchant Key is an mandatory parameter')
    this.merchantKey = merchantKey
    const defaultOptions = {
      generateRoute: '/checksum/generate',
      verifyRoute: '/checksum/verify',
      handleError: false
    }
    this.options = _.merge(defaultOptions, options)
  }

  _paramToStrings (params) {
    let data = ''
    let tempKeys = Object.keys(params)
    tempKeys.sort()
    tempKeys.forEach(function (key) {
      let n = params[key].includes('REFUND')
      let m = params[key].includes('|')
      if (n === true) {
        params[key] = ''
      }
      if (m === true) {
        params[key] = ''
      }
      if (key !== 'CHECKSUMHASH') {
        if (params[key] === 'null') params[key] = ''
        data += (params[key] + '|')
      }
    })
    return data
  }

  middleware () {
    let express
    try {
      express = require('express')
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') throw new Error('Please install express package locally. $ yarn add express')
      throw err
    }
    const router = express.Router()
    router.post(this.options.generateRoute, this.generateChecksum())
    router.post(this.options.verifyRoute, this.verifyChecksum())
    return router
  }

  generateChecksum () {
    return (req, res, next) => {
      const params = req.body || req.query
      this._generate(params)
        .then((response) => {
          res.status(200).json(response)
        })
        .catch(err => {
          if (this.options.handleError) {
            res.status(500).send('checksum could not be generated')
            return
          }
          next(err)
        })
    }
  }

  verifyChecksum () {
    return (req, res, next) => {
      const params = req.body || req.query
      this._verify(params)
        .then((response) => {
          res.status(200).json(response)
        })
        .catch(err => {
          if (this.options.handleError) {
            res.status(400).send('checksum did not match')
            return
          }
          next(err)
        })
    }
  }

  _generate (params) {
    return new Promise((resolve, reject) => {
      const data = this._paramToStrings(params)
      crypt.gen_salt(4, (err, salt) => {
        if (err) return reject(err)
        const sha256 = crypto.createHash('sha256').update(data + salt).digest('hex')
        const checkSum = sha256 + salt
        const encrypted = crypt.encrypt(checkSum, this.merchantKey)
        params.CHECKSUMHASH = (encrypted)
        resolve(params)
      })
    })
  }

  _verify (params) {
    return new Promise((resolve, reject) => {
      if (!params) return reject(new Error('params are null'))
      const data = this._paramToStrings(params)
      if (params.CHECKSUMHASH) {
        params.CHECKSUMHASH = params.CHECKSUMHASH.replace('\n', '')
        params.CHECKSUMHASH = params.CHECKSUMHASH.replace('\r', '')

        const temp = decodeURIComponent(params.CHECKSUMHASH)
        const checksum = crypt.decrypt(temp, this.merchantKey)
        const salt = checksum.substr(checksum.length - 4)
        const sha256 = checksum.substr(0, checksum.length - 4)
        const hash = crypto.createHash('sha256').update(data + salt).digest('hex')
        if (hash === sha256) {
          resolve(params)
        } else {
          reject(new Error('checksum is wrong'))
        }
      } else {
        reject(new Error('checksum not found'))
      }
    })
  }
}

module.exports = Paytm
