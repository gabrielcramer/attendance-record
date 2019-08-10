#!/usr/bin/env node
const fs = require('fs');
const opn = require('opn');
const cli = require('commander');
const startup = require('user-startup');
const { name, version } = require('../package.json');
const { checkIn } = require('../src/actions/checkin');
const { checkOut } = require('../src/actions/checkout');
const { init } = require('../src/actions/init');
const { handleConfig } = require('../src/actions/config');
const { config } = require('../src/config');
const { getCurrentMonthSheetName, appName } = require('../src/statics');
const { getSheetByName, getSpreadsheetId } = require('../src/utils');
const auth = require('../src/auth');

cli
    .version(version, '-v, --version');
cli
    .command('init')
    .action(init);

cli
    .command('config [configName] [configValue]')
    .action((configName, configValue) => handleConfig(configName, configValue));

cli
    .command('checkin')
    .action(checkIn);

cli
    .command('checkout')
    .action(checkOut)
    .option('-s, --shutdown', 'shutdown the computer after checkout');

cli
    .option('-e, --enable-startup-checkin', 'enable automatic checkin at startup')
    .option('-d, --disable-startup-checkin', 'disable automatic checkin at startup');

cli
    .option('-c, --credentials <credentials-path>', 'load google credentials');
cli
    .option('-o, --open-attendance-record', 'open the attendance record');

cli
    .parse(process.argv);

if (cli.enableStartupCheckin) {
    startup.create(name, process.execPath, [`${appName}`, 'checkin']);
    console.log(`Automatic checkin at startup enabled.\nDon\'t worry, you can always disable it using '${appName} -d'.`);
}

if (cli.disableStartupCheckin) {
    startup.remove(name);
    console.log('Automatic checkin at startup disabled.');
}

if (cli.credentials) {
    fs.readFile(cli.credentials, (err, content) => {
        if (err) {
            return console.log('Error loading client secret file:', err);
        }
        config.setGlobal('credentials', JSON.parse(content));
    });
}

if (cli.openAttendanceRecord) {
    const currentMonthSheetName = getCurrentMonthSheetName();
    const spreadsheetLink = config.get('spreadsheetLink');
    const spreadsheetId = getSpreadsheetId(spreadsheetLink);

    auth.getGoogleSpreadsheets()
        .then((spreadsheets) => getSheetByName(spreadsheets, spreadsheetId, currentMonthSheetName))
        .then((currentMonthSheet) => opn(`${spreadsheetLink}/edit#gid=${currentMonthSheet.properties.sheetId}`));
}