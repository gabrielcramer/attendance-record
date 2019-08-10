const opn = require('opn');
const moment = require('moment');
const notifier = require('node-notifier');
const auth = require('../auth');
const { createNewSheet, getSheetByName, getSheetContent, updateRow, getSpreadsheetId, getIndexOfTodayCheckin } = require('../utils');
const { getCurrentMonthSheetName, datetimeFormat, workedHoursFormula, timeFormat } = require('../statics');
const { config } = require('../config');

async function checkIn() {
    const currentTime = moment();
    const fridayISOWeekday = 5;
    if (currentTime.isoWeekday() > fridayISOWeekday) {
        notifier.notify({
            title: `Enjoy the weekend!`,
            message: '🤟',
            wait: true
        });
        return;
    }
    const currentMonthSheetName = getCurrentMonthSheetName();
    const spreadsheets = await auth.getGoogleSpreadsheets();
    const spreadsheetLink = config.get('spreadsheetLink');
    const spreadsheetId = getSpreadsheetId(spreadsheetLink);
    const fullName = config.get('fullName');

    const currentMonthSheet = await getSheetByName(spreadsheets, spreadsheetId, currentMonthSheetName);

    if (!currentMonthSheet) {
        console.log(`'${currentMonthSheetName}' doesn't exist, we're going to create it.`);
        await createNewSheet(spreadsheets, spreadsheetId, currentMonthSheetName);
    }

    const content = await getSheetContent(spreadsheets, spreadsheetId, currentMonthSheetName);
    const checkedInTodayIndex = getIndexOfTodayCheckin(content, fullName);

    if (checkedInTodayIndex !== -1) {
        notifier.notify({
            title: `You have already checked in today.`,
            message: '🤓',
            wait: true
        });
        notifier.on('click', () => opn(`${spreadsheetLink}/edit#gid=${currentMonthSheet.properties.sheetId}`));
        return;
    }
    const newRowIndex = content.length + 1;
    let values = [
        fullName,
        currentTime.format(datetimeFormat),
        '',
        '',
        '',
        workedHoursFormula(newRowIndex)
    ];
    await updateRow(spreadsheets, spreadsheetId, currentMonthSheetName, newRowIndex, values);

    notifier.notify({
        title: `Successfully checked in at ${currentTime.format(timeFormat)}.`,
        message: `Hello there, ${fullName.split(' ')[0]}! Let's write some code! 👍`,
        wait: true
    });

    notifier.on('click', () => opn(`${spreadsheetLink}/edit#gid=${currentMonthSheet.properties.sheetId}`));
}

module.exports = {
    checkIn
};