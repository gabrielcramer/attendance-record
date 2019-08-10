const opn = require('opn');
const readline = require('readline');
const { google } = require('googleapis');
const { config } = require('./config');
const { appName } = require('./statics');

  // If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

function getGoogleSpreadsheets() {
  return new Promise((resolve, reject) => {
     // Load client secrets from a local file.
    const credentials = config.get('credentials');

    if (!credentials) {
      reject(new Error(`Credentials missing, please go through '${appName} init' again.`));
    }
    authorize(credentials, resolve, reject);
  })
  .then((auth) => google.sheets({version: 'v4', auth}).spreadsheets);
}

  /**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, resolve, reject) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
    const token = config.get('token');
    if(!token) {
      return getNewToken(oAuth2Client, resolve, reject);
    }
    oAuth2Client.setCredentials(token);
    resolve(oAuth2Client);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, resolve, reject) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  opn(authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) reject(new Error('Error while trying to retrieve access token', err));
      oAuth2Client.setCredentials(token);
      // Store the token for later program executions
      config.setGlobal('token', token);
      resolve(oAuth2Client);
    });
  });
}


module.exports.getGoogleSpreadsheets = getGoogleSpreadsheets;
