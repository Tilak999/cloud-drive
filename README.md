# cloud-drive
Create pool cloud storage using multiple service account

## Setup
To run this setup you should have a google account.
Note: Setup script would only run on `cloud shell`, after retriving masterKey file example can be executed on local machine.

1. Login to [Google Cloud Console](https://console.cloud.google.com/)
2. Open `cloud shell`, see the below image.
![Step 2 help image](https://user-images.githubusercontent.com/21053902/116791360-5d9a0e80-aad7-11eb-8933-4f5c00885883.png)
3. Clone this repo: `git clone https://github.com/Tilak999/cloud-drive.git`
4. Run setup script: `cd cloud-drive && node main.js`
5. Wait for script to finish (It would take 10-15 mins to finish)
6. You will get a master key file which contains all the service account keys. (Download and keep it safe)

## Run Examples
You will find some sample scripts under `scripts` directory. To run the scripts run them from root of the repo directory.

```
cd cloud-drive
npm install
node scripts\storageQuota.js
```

## CLI Tool
We also have a CLI tool called gfs - for interacting with the pooled cloud storage.
[See CLI usage](/gfs-cli)

## About master key file
The master key file is nothing but collection of all the service account keys. Inside the json each service account key is mapped to corresponding service account file name. If you need to get the service account key files then they are present under `keys` directory.
