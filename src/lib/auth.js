const { google } = require('googleapis');

async function authorize(key) {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/drive']
  });
  return await auth.getClient();
}

module.exports = authorize