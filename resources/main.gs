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
 * @fileoverview This Google Apps Script file contains methods representing the
 * main entry and interaction points with the associated Google Spreadsheet.
 * The methods here delegate to the {@link SheetsApi} and
 * {@link CampaignManagerApi} classes for Sheets and Campaign Manager related
 * functionality respectively.
 */

/**
 * Configuration for the associated Google Sheets spreadsheet
 */
const config = {
  profileId: {
    sheetName: 'SETUP',
    cell: 'J20',
  },
  data: {
    sheetName: 'CONFIG',
    startRow: 2,
    startCol: 1,
    advertiserId: 0,
    creativeName: 1,
    creativeDimensionsRaw: 2,
    creativeAssetName: 3,
    creativeAssetPath: 4,
    backupImageName: 5,
    backupImagePath: 6,
    backupImageClickThroughUrl: 7,
  },
  status: {column: 8, columnId: 'I', done: 'DONE'}
};

/**
 * Creates a new menu in Google Sheets for triggering the upload of Campaign
 * Manager creatives.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Campaign Manager')
      .addItem('Upload Creatives', 'uploadCreatives')
      .addToUi();
}

/**
 * Uploads any unprocessed creatives referenced in the associated Google Sheets
 * spreadsheet one-by-one, utilizing dedicated CM and Sheets API wrappers.
 *
 * @see {@link SheetsApi} and {@link CampaignManagerApi}.
 */
function uploadCreatives() {
  const sheetsApi = new SheetsApi(SpreadsheetApp.getActiveSpreadsheet());
  const profileId =
      sheetsApi.getCellValue(config.profileId.sheetName, config.profileId.cell);
  const cmApi = new CampaignManagerApi(profileId, config.data);

  const data = sheetsApi.getSheetData(
      config.data.sheetName, config.data.startRow, config.data.startCol);

  data.forEach(function(row, index) {
    if (row[config.data.advertiserId] && !row[config.status.column]) {
      try {
        cmApi.insertCreative(row);
        sheetsApi.setCellValue(
            config.data.sheetName,
            config.status.columnId + (config.data.startRow + index),
            config.status.done);
      } catch (e) {
        console.log(e);
        throw new Error(
            `Failed to upload Creative ${row[config.data.creativeName]} ` +
            `for Advertiser ${row[config.data.advertiserId]}! Check the logs ` +
            `at https://script.google.com/home/executions for more details.`);
      }
    }
  });
}
