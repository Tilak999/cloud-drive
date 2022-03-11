const fs = require('fs')
const path = require('path')

module.exports = function (keyFilePath, outputPath) {
    const keyFiles = fs.readdirSync(keyFilePath)
    const keys = []
    for (const keyFile of keyFiles) {
        const filePath = path.join(keyFilePath, keyFile)
        const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
        const serviceIdName = keyFile.split('.')[0]
        keys.push(`"${serviceIdName}":${content}`)
    }
    const content = `{ "indexStoreKey": "${keyFiles[0].split('.')[0]}", "serviceAccounts": { ${keys.join(',')} } }`
    console.log(content)
    const masterKey = JSON.stringify(JSON.parse(content), null, 4)
    fs.writeFileSync(outputPath, masterKey)
}