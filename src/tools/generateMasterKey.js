const exec = require("./lib/exec");
const mergeKeys = require("./lib/mergeKeys");
const path = require("path");
const child_process = require("child_process");

const randomNumber = (Math.random() * 1000).toFixed(0);
const projectId = process.argv[2] || `cloud-drive-${randomNumber}`;
const debugLogs = process.argv.indexOf("--debug") > -1;

function exec(command) {
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout || stderr);
        });
    });
}

async function createProject(projectId) {
    const commands = [
        `gcloud projects create ${projectId} --name ${projectId}`,
        `gcloud config set project ${projectId}`,
        `gcloud services enable drive.googleapis.com`,
        `gcloud services enable iam.googleapis.com`,
    ];
    for (const command of commands) {
        const out = await exec(command);
        if (debugLogs) console.log(out);
    }
}

async function serviceAccountExist(serviceAccountName, projectId) {
    const out = await exec(
        `gcloud iam service-accounts list --filter ${serviceAccountName}@${projectId}`
    );
    return !out.includes("Listed 0 items");
}

async function createServiceAccount(uid, projectId) {
    const serviceAccountName = `svcaccnt-${uid}`;
    const accntExist = await serviceAccountExist(serviceAccountName, projectId);
    if (accntExist)
        return console.log(
            `> Skipping ${serviceAccountName} creation: Service account already present`
        );

    const commands = [
        `gcloud iam service-accounts create ${serviceAccountName} --display-name="Service account ${uid} --project ${projectId}"`,
        `gcloud projects add-iam-policy-binding ${projectId} --member="serviceAccount:${serviceAccountName}@${projectId}.iam.gserviceaccount.com" --role="roles/owner"`,
        `gcloud iam service-accounts keys create ./keys/${projectId}-${serviceAccountName}.json --iam-account=${serviceAccountName}@${projectId}.iam.gserviceaccount.com`,
    ];
    for (const command of commands) {
        const out = await exec(command);
        if (debugLogs) console.log(out);
    }
}

async function setProject(projectId) {
    return exec(`gcloud config set project ${projectId}`);
}

async function main() {
    try {
        if (!process.argv[2]) {
            console.log("creating new project: ", projectId);
            await createProject(projectId);
        }
        await setProject(projectId);

        console.log(
            `> Creating Service Accounts.. this might take few minutes`
        );
        for (let i = 0; i < 98; i++) {
            console.log(`> Creating Service Accounts:`, i);
            await createServiceAccount(i, projectId);
        }
        console.log(`> Service account created.. Done`);

        mergeKeys(
            path.join(__dirname, "keys"),
            path.join(__dirname, "masterKey.json")
        );
        console.log(
            `> Find the master key present at:`,
            path(__dirname, "masterKey.json")
        );
    } catch (e) {
        console.error("error", e);
    }
}

main();
