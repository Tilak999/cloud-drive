const GdriveFS = require("../gdrive-fs")
const fs = require('fs')

const gfs = new GdriveFS({
    keyFile: require('../masterKey.json'),
    indexDrive: 'svcaccnt-0',
    debug: true
})


//gfs.list('gfs:/', true).then(console.log)

//gfs.createDirectory('gfs:/', 'movies').then(console.log)


/*
async function test() {
    let resp = await gfs.createDirectory('gfs:/', 'movies')
    console.log(resp)

    resp = await gfs.createDirectory('gfs:/', 'movies')
    console.log(resp)
}
test()*/


gfs.uploadFile('gfs:/', fs.createReadStream('/home/trollvia_official/cloud-drive/Falcon.avi'), 'falcon.mp4').then(console.log)


/*gfs.downloadFile('gfs:/package-lock.json').then(resp=>{
    resp.data.pipe(process.stdout)
})*/
 
//gfs.getStorageInfo().then(console.log)

//gfs.deleteFile('gfs:/package-lock.json').then(console.log)

//gfs.listAllFiles().then(console.log)
//gfs.deleteAllFiles().then(console.log)