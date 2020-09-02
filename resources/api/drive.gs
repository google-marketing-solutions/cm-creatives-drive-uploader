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
 * Drive API through the use of the built-in 'Advanced Google Service'
 * {@link DriveApp}.
 *
 * @see {@link appsscript.json} for a list of enabled advanced services.
 */

/** @class DriveApi representing a wrapper for the the Google Drive API. */
class DriveApi {
  /**
   * Retrieve the contents of a file stored on Drive by its ID.
   *
   * @param {string} fileId   the Drive ID of the file to retrieve
   *
   * @returns {Object!} the contents of the file as a {@link Blob}
   */
  static getFileByDriveId(fileId) {
    console.log(`Fetching file with ID [${fileId}] from Drive...`);
    const file = DriveApp.getFileById(fileId).getBlob();
    console.log(`Fetched [${file.getBytes().length}] bytes.`);

    return file;
  }
}
