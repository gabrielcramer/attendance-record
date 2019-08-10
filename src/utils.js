const moment = require('moment');
const { valueInputOption, datetimeFormat } = require('./statics');
const { formatHeaderRow } = require('./formatHeaderRow');

// TODO: Better handle the case when the user enters wrong link
function getSpreadsheetId(link) {
    const spreadsheetIdRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/g;
    const match = spreadsheetIdRegex.exec(link);
    if (!match) {
        console.error(`Invalid url: ${link}\nPlease enter a valid google spreadsheet link.`)
        return '';
    }
    return match[1];
}
async function createNewSheet(spreadsheets, spreadsheetId, sheetName) {
    const resource = {
        "requests": [{
            "addSheet": {
                "properties": {
                    "title": sheetName,
                    "gridProperties": {
                        "rowCount": 3,
                        "columnCount": 6
                    },
                    "tabColor": {
                        "red": 1.0,
                        "green": 0.3,
                        "blue": 0.4
                    }
                }
            }
        }]
    };
    const addSheet = await batchUpdate(spreadsheets, spreadsheetId, resource);
    const newSheetId = addSheet.replies[0].addSheet.properties.sheetId;

    const values = [
        'Nume Angajat',
        'Data/Ora Sosire',
        'Semnatura',
        'Data/Ora Plecare',
        'Semnatura',
        'Ore Lucrate'
    ];

    const updateRowResponse = await updateRow(spreadsheets, spreadsheetId, sheetName, 1, values);
    return batchUpdate(spreadsheets, spreadsheetId, formatHeaderRow(newSheetId));
}

function getExistingSheets(spreadsheets, spreadsheetId) {
    const resources = {
        spreadsheetId
    };
    return new Promise((resolve, reject) => {
        spreadsheets.get(resources, (err, res) => {
            if (err) {
                return reject(new Error('The API returned an error: ' + err));
            } else {
                resolve(res.data.sheets);

            }
        });
    });
}

async function getSheetByName(spreadsheets, spreadsheetId, sheetName) {
    const existingSheets = await getExistingSheets(spreadsheets, spreadsheetId);

    return existingSheets.find((sheet) => sheet.properties.title === sheetName);
}

function getSheetContent(spreadsheets, spreadsheetId, sheetName) {

    const resources = {
        spreadsheetId,
        range: sheetName
    };

    return new Promise((resolve, reject) => {
        spreadsheets.values.get(resources, (err, res) => {
            if (err) {
                return reject(new Error('The API returned an error: ' + err));
            } else {
                resolve(res.data.values);
            }
        });
    });
}

function updateRow(spreadsheets, spreadsheetId, sheetName, rowIndex, rowValues) {
    let values = [
        rowValues
    ];
    const resource = {
        values,
    };
    return new Promise((resolve, reject) => {
        spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A${rowIndex}`,
            valueInputOption,
            resource,
        }, (err, result) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(result);
            }
        });
    })
}

function batchUpdate(spreadsheets, spreadsheetId, resource) {
    return new Promise((resolve, reject) => {
        spreadsheets.batchUpdate({
            spreadsheetId,
            resource,
        }, (err, response) => {
            if (err) {
                reject(new Error(err));
            } else {
                resolve(response.data);
            }
        });
    })
}
function getIndexOfTodayCheckin(rows, fullName) {
    return rows.findIndex((row) => {
        const isSameName = row[0] === fullName;
        const isCheckedInToday = row[1] && moment(row[1], datetimeFormat).isSame(moment(), 'day');

        return isSameName && isCheckedInToday;
    });

}
module.exports = {
    createNewSheet,
    getExistingSheets,
    getIndexOfTodayCheckin,
    getSheetByName,
    getSheetContent,
    getSpreadsheetId,
    updateRow,
    batchUpdate
};