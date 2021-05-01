# cloud-drive
Create pool cloud storage uisng multiple service account

## Setup
To run this setup you should have a google account.
Note: Setup script would only run on `cloud shell`, after retriving masterKey file example can be executed on local machine.

1. Login to [Google Cloud Console](https://console.cloud.google.com/)
2. Open `cloud shell`, see the below image.
![step2: help image](https://telegra.ph/file/6e816134fae4f644258b7.png)
3. Clone this repo: `git clone https://github.com/Tilak999/cloud-drive.git`
4. Run setup script: `cd cloud-drive && node main.js`
5. Wait for script to finish (It would take 10-15 mins to finish)
6. You will get a master key file which contains all the service account keys. (Download and keep it safe)

## Run Examples
You will find some sample scripts under `scripts` directory. To run the scripts run them from root of the repo directory.

```
cd cloud-drive
npm install
node scripts\cloud-drive.js
```

## About master key file
The master key file is nothing but collection of all the service account keys. Inside the json each service account key is mapped to corresponding service account file name. If you need to get the service account key files then they are present under `keys` directory.
