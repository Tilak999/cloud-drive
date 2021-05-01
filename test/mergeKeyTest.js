const merge = require('../lib/mergeKeys')
const path = require('path')

const input = path.resolve(__dirname,'../keys')
const masterKeyFile = path.join(__dirname, 'masterKey.json')

merge(input, masterKeyFile)