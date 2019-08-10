const moment = require('moment');
const notifier = require('node-notifier');
const powerOff = require('power-off');
const auth = require('../auth');
const { getSheetContent, getSpreadsheetId, getIndexOfTodayCheckin } = require('../utils');
const { getCurrentMonthSheetName, datetimeFormat, timeFormat, valueInputOption } = require('../statics');
const { config } = require('../config');

async function checkOut(cmd) {
    const sheetName = getCurrentMonthSheetName();
    const spreadsheets = await auth.getGoogleSpreadsheets();
    const spreadsheetLink = config.get('spreadsheetLink');
    const spreadsheetId = getSpreadsheetId(spreadsheetLink);
    const fullName = config.get('fullName');

    const content = await getSheetContent(spreadsheets, spreadsheetId, sheetName);

    const index = getIndexOfTodayCheckin(content, fullName);

    if (index === -1) {
        console.error('You were not checked in today');
        return;
    }
    const currentTime = moment();
    let values = [
        [
            currentTime.format(datetimeFormat)
        ]
    ];
    const resource = {
        values,
    };
    spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!D${index + 1}`,
        valueInputOption,
        resource,
    }, (err, result) => {
        if (err) {
            console.log(err);
        } else {

            notifier.notify({
                title: `Successfully checked out at ${currentTime.format(timeFormat)}.`,
                message: `Bye, ${fullName.split(' ')[0]}! See you soon! 👋`,
                wait: true
            });
            notifier.on('timeout', () => {
                if (cmd.shutdown) {
                    powerOff(function(err, stderr, stdout) {
                        if (!err && !stderr) {
                            console.log(stdout);
                        }
                    });
                }
            });
        }
    });

}

module.exports = {
    checkOut
};