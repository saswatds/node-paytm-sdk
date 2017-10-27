const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const PAYTM = require('../src')

describe('PAYTM SDK TEST', function () {
  const paytm = new PAYTM('D48jn0gTkalXLIp!')

  describe('Generate Checksum', function () {
    it('should add checksumhash to params', function () {
      const params = {
        MID: 'PEMA334487211233',
        AMOUNT: '23.00'
      }
      return expect(paytm._generate(params)).to.eventually.have.property('CHECKSUMHASH')
    })
  })

  describe('Verify Checksum', function () {
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
})
