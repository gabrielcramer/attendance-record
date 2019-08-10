module.exports.formatHeaderRow = (sheetId) => ({
  "requests": [
    {
      "repeatCell": {
        "range": {
          "sheetId": sheetId,
          "startRowIndex": 0,
          "endRowIndex": 1
        },
        "cell": {
          "userEnteredFormat": {
            "backgroundColor": {
              "red": 0.0,
              "green": 0.0,
              "blue": 0.0
            },
            "horizontalAlignment" : "CENTER",
            "textFormat": {
              "foregroundColor": {
                "red": 1.0,
                "green": 1.0,
                "blue": 1.0
              },
              "fontSize": 11,
              "bold": true
            }
          }
        },
        "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
      }
    },
    {
      "updateSheetProperties": {
        "properties": {
          "sheetId": sheetId,
          "gridProperties": {
            "frozenRowCount": 1
          }
        },
        "fields": "gridProperties.frozenRowCount"
      }
    },
     {
      "autoResizeDimensions": {
        "dimensions": {
          "sheetId": sheetId,
          "dimension": "COLUMNS",
          "startIndex": 0,
          "endIndex": 5
        }
      }
    }
  ]
});