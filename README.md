# NodeJS Paytm Checksum SDK
[![npm version](https://badge.fury.io/js/paytm-sdk.svg)](https://badge.fury.io/js/paytm-sdk) [![Dependency Status](https://gemnasium.com/badges/github.com/saswatds/node-paytm-sdk.svg)](https://gemnasium.com/github.com/saswatds/node-paytm-sdk)


Unofficial Node.JS SDK for Paytm Checksum Generation and Verification

## Installation

```bash
$ npm install paytm-sdk --save
```

## Usage

```js
const Paytm = require('paytm-sdk')
const paytm = new Paytm('<merchantkey>', options)

const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('/', paytm.middleware())

app.listen(8000)
```

### Options

```js
const paytm = new Paytm('<merchantkey>', {
  generateRoute: '/checksum/generate', 
  verifyRoute: '/checksum/verify',
  handleError: false
})
```

##### generateRoute

This is route where you can send a POST request to generate checksum. The default value is set to `/checksum/generate`

##### verifyRoute

This is route where you can send a POST request to verify checksum. The default value is set to `/checksum/verify`

##### handleError 

Set this to true if you do not want to handle the error condition, instead want the library to send 500 for checksum generation failure and 400 for incorrect checksum


## Release Notes

| Release | Notes |
| --- | --- |
| 0.0.1 | Priliminary release |

## Licence

MIT