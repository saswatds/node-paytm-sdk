const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.use(require('chai-http'))

const expect = chai.expect
const PAYTM = require('../src')

describe('PAYTM SDK TEST', function () {
  const paytm = new PAYTM('D48jn0gTkalXLIp!', { handleError: true })

  describe('Generate And Verify Checksum', function () {
    it('should add checksumhash to params', function () {
      const params = {
        MID: 'PEMA334487211233',
        AMOUNT: '23.00'
      }
      return expect(paytm._generate(params)).to.eventually.have.property('CHECKSUMHASH')
    })

    it('should resolve a valid checksum', function () {
      const params = {
        MID: 'PEMA334487211233',
        AMOUNT: '23.00'
      }
      return expect(paytm._generate(params).then((params) => paytm._verify(params))).to.eventually.be.fulfilled
    })
    it('should reject an invalid checksum', function () {
      const params = {
        MID: 'PEMA334487211233',
        AMOUNT: '23.00'
      }
      return expect(paytm._generate(params).then((params) => paytm._verify({MID: params.MID, CHECKSUMHASH: params.CHECKSUMHASH}))).to.eventually.be.rejected
    })
    it('should not be affected by param order change', function () {
      const params = {
        MID: 'PEMA334487211233',
        AMOUNT: '23.00'
      }
      return expect(paytm._generate(params).then((params) => paytm._verify({AMOUNT: params.AMOUNT, MID: params.MID, CHECKSUMHASH: params.CHECKSUMHASH}))).to.eventually.be.fulfilled
    })
  })

  describe('Express Endpoints', function () {
    const express = require('express')
    const bodyParser = require('body-parser')

    const app = express()
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))
    app.use('/paytm', paytm.middleware())

    const params = {
      MID: 'PEMA334487211233',
      AMOUNT: '23.00'
    }

    it('should generate checksum at /paytm/checksum/generate', function (done) {
      chai.request(app)
        .post('/paytm/checksum/generate')
        .send(params)
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(paytm._verify(res.body)).to.eventually.be.fulfilled
          done()
        })
    })

    it('should reply 200 for valid checksum at /paytm/checksum/verify', function (done) {
      paytm._generate(params).then((res) => {
        chai.request(app)
          .post('/paytm/checksum/verify')
          .send(res)
          .end(function (err, res) {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            done()
          })
      })
    })

    it('should reply 400 for valid checksum /paytm/checksum/verify', function (done) {
      paytm._generate(params).then((res) => {
        chai.request(app)
          .post('/paytm/checksum/verify')
          .send({MID: res.MID, CHECKSUMHASH: res.CHECKSUMHASH})
          .end(function (err, res) {
            expect(err).to.be.not.null
            expect(res).to.have.status(400)
            done()
          })
      })
    })
  })
})
