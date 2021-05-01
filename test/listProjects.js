const exec = require("../lib/exec")

const serviceAccountName = 'svcaccnt-1'
const projectId = 'cloud-drive-78'

async function main(){
    try {
        const out = await exec(`gcloud iam service-accounts list --filter ${serviceAccountName}@${projectId}`)
        console.log(out.includes('Listed 0 items'))
    } catch(e) {
        console.log('>>', e)
    }
}

main()