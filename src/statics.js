const moment = require('moment');
const { name } = require('../package.json');

const appName = 'record';
const sheetDateFormat = 'MM.YYYY';
const datetimeFormat = 'DD/MM/YYYY HH:mm:ss';
const timeFormat = 'hh:mm:ss';
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const valueInputOption = 'USER_ENTERED';

const workedHoursFormula = (rowIndex) => `=MAX(0,MIN(8,(D${rowIndex}-B${rowIndex})*24))`;
const getCurrentMonthSheetName = () => moment().format('MM.YYYY');

module.exports = {
	appName,
	sheetDateFormat,
	datetimeFormat,
	timeFormat,
	SCOPES,
	valueInputOption,
	workedHoursFormula,
	getCurrentMonthSheetName
};