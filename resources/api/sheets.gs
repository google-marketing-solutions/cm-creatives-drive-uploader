/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview This Google Apps Script file wraps all interactions with the
 * Sheets API through the use of the built-in 'Advanced Google Service'
 * {@link Sheets}.
 *
 * @see {@link appsscript.json} for a list of enabled advanced services.
 */

/** @class SheetsApi representing a wrapper for the the Google Sheets API. */
class SheetsApi {
  /**
   * @constructs an instance of SheetsApi using a reference to the associated
   * active spreadsheet.
   *
   * @see {@link SpreadsheetApp#getActiveSpreadsheet}.
   *
   * @param {Object!} spreadsheet  the associated spreadsheet
   */
  constructor(spreadsheet) {
    /** @private */ this.spreadsheet_ = spreadsheet;
  }

  /**
   * Retrieves a sheet's contents by the given parameters.
   *
   * @param {string} sheetName   the name of the sheet
   * @param {number} startRow    the first row of data to retrieve
   * @param {number} startCol    the first column of data to retrieve
   *
   * @returns {array!} a two-dimensional array of the sheet's data
   */
  getSheetData(sheetName, startRow, startCol) {
    const sheet = this.spreadsheet_.getSheetByName(sheetName);

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    return sheet.getRange(startRow, startCol, lastRow, lastCol).getValues();
  }

  /**
   * Retrieves a cell's value by the given parameters.
   *
   * @param {string} sheetName   the name of the sheet
   * @param {string} cellId      the ID of the cell in A1 notation
   *
   * @returns {string} the value of the cell
   */
  getCellValue(sheetName, cellId) {
    const cell =
        this.spreadsheet_.getRange(sheetName + '!' + cellId + ':' + cellId);

    return cell.getValue();
  }

  /**
   * Sets a cell's value by the given parameters.
   *
   * @param {string} sheetName   the name of the sheet
   * @param {string} cellId      the ID of the cell in A1 notation
   * @param {string} value       the value of the cell
   */
  setCellValue(sheetName, cellId, value) {
    const cell =
        this.spreadsheet_.getRange(sheetName + '!' + cellId + ':' + cellId);

    cell.setValue(value);
  }
}
