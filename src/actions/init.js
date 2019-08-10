const opn = require('opn');
const readline = require('readline');
const { config } = require('../config');
const { getSpreadsheetId } = require('../utils');
const { appName } = require('../statics');

async function askQuestion(readlineInterface, question) {
    return new Promise((resolve) => {
        readlineInterface.question(question, (answer) => {
            resolve(answer);
        })
    })
}
async function init() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const fullName = await askQuestion(rl,'Enter your full name:');
    const spreadsheetLink = await askQuestion(rl,'Enter the spreadsheet link:');


    console.log('Last thing... credentials.');

    console.log('1. Click the "ENABLE THE GOOGLE SHEETS API" button.');
    console.log('2. Select or create a new project.');
    console.log('3. Click the "DOWNLOAD CLIENT CONFIGURATION" button.');
    console.log(`4. Run '${appName} --credentials <credentials-path>'. Or just '${appName} -c <credentials-path>'`);
    console.log('Hint: Make sure to use the google account that you want to record your attendance with.');

    opn('https://developers.google.com/sheets/api/quickstart/nodejs');
    rl.close();

    config.setGlobal('fullName', fullName);
    config.setGlobal('spreadsheetLink', spreadsheetLink.split('/edit')[0]);


}

module.exports = {
    init
};