const {google} = require('googleapis');
const authorize = require('../lib/auth');
const path = require('path')
const fs = require('fs')

async function uploadFile(name, stream){
    return google.drive('v3').files.create({
        auth: await authorize(),
        resource: { name },
        media: { body: stream },
        fields: 'id'
    })
} 

async function main(){
    if(process.argv[2] && process.argv[2] != ''){
        const filename = path.basename(process.argv[2])
        const filepath = path.resolve(process.argv[2])
        const resp = await uploadFile(filename, fs.createReadStream(filepath))
        console.log(resp.data)
    } else {
        console.error("file path is missing or provided path is invalid")
    }
}

main()