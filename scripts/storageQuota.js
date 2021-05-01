const {google} = require('googleapis');
const fs = require('fs')
const path = require('path')
const authorize = require('../lib/auth');
const masterKey = require('../masterKey.json')

async function getStorageInfo(key) {
  const authClient = await authorize(key);
  const out = await google.drive("v3").about.get({ auth: authClient, fields: ['storageQuota','maxUploadSize']})
  return out.data.storageQuota
}

async function main() {
    const final = {
        limit: 0,
        usage: 0,
        usageInDrive: 0,
        usageInDriveTrash: 0
    }

    const promises = []
    for(const serviceId of Object.keys(masterKey)) {
        const promise = getStorageInfo(masterKey[serviceId])
        promises.push(promise)
    }

    const responses = await Promise.all(promises)
    for(const i in responses) {
        const storageQuota = responses[i]
        final.limit += parseInt(storageQuota.limit)
        final.usage += parseInt(storageQuota.usage)
        final.usageInDrive += parseInt(storageQuota.usageInDrive)
        final.usageInDriveTrash += parseInt(storageQuota.usageInDriveTrash)
    }
    console.log(final)
}
main()