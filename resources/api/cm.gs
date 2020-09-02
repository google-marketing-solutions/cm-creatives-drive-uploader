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
 * Campaign Manager API through the use of the built-in
 * 'Advanced Google Service' {@link CampaignManager}.
 *
 * @see {@link appsscript.json} for a list of enabled advanced services.
 */

/** @class CampaignManagerApi representing a wrapper for the the CM API. */
class CampaignManagerApi {
  /**
   * @constructs an instance of CampaignManagerApi.
   *
   * @param {string} profileId    the UserProfile ID of the associated CM
   *     account
   * @param {Object!} dataConfig  the data row-column configuration
   */
  constructor(profileId, dataConfig) {
    /** @private */ this.profileId_ = profileId;
    /** @private */ this.dataConfig_ = dataConfig;
  }

  /**
   * Retrieves the default advertiser landing page for the given advertiser.
   * @private
   *
   * @param {string} advertiserId  the ID of the advertiser to use
   *
   * @returns {string} the ID of the retrieved advertiser landing page
   * @throws {Error!} if no landing pages exist for the given advertiser
   */
  getDefaultAdvertiserLandingPageId_(advertiserId) {
    const response = CampaignManager.AdvertiserLandingPages.list(
        this.profileId_, {'advertiserIds': [advertiserId], 'maxResults': 1});

    if (!response['landingPages'][0]) {
      throw new Error(
          `No landing pages found for advertiser: ${advertiserId}! Please ` +
          `create one for this Advertiser using the CM UI before retrying ` +
          `this operation.`);
    }
    return response['landingPages'][0]['id'];
  }

  /**
   * Updates the given creative with information pertaining to its backup image.
   * @private
   *
   * @param {array!} row        two-dimensional array representing a row of data
   * @param {Object!} creative  the {@link Creative} to update
   **/
  addMainCreative_(row, creative) {
    const advertiserId = row[this.dataConfig_.advertiserId];
    const creativeName = row[this.dataConfig_.creativeName];
    const creativeAssetName = row[this.dataConfig_.creativeAssetName];
    const creativeAssetPath = row[this.dataConfig_.creativeAssetPath];
    const creativeDimensionsRaw = row[this.dataConfig_.creativeDimensionsRaw];

    const creativeAssetMetadata = CreativeAssetUploader.insertCreativeAsset(
        this.profileId_, advertiserId, creativeAssetName, 'HTML',
        creativeAssetPath);
    const creativeAsset = CreativeAssetUploader.buildCreativeAsset(
        creativeAssetMetadata, 'PRIMARY');
    const creativeDimensions = creativeDimensionsRaw.split('x');

    creative.creativeAssets.push(creativeAsset);
    creative.advertiserId = advertiserId;
    creative.name = creativeName;

    CreativeUploader.addCreativeSize(
        this.profileId_, creativeDimensions, creative);
    CreativeUploader.addCreativeClickTags(
        creativeAssetMetadata.clickTags, creative);
  }

  /**
   * Updates the given creative with information pertaining to its backup image.
   * @private
   *
   * @param {array!} row        two-dimensional array representing a row of data
   * @param {Object!} creative  the {@link Creative} to update
   **/
  addCreativeBackupImage_(row, creative) {
    const advertiserId = row[this.dataConfig_.advertiserId];
    const backupImageName = row[this.dataConfig_.backupImageName];
    const backupImagePath = row[this.dataConfig_.backupImagePath];
    const backupImageCustomClickThroughUrl =
        row[this.dataConfig_.backupImageClickThroughUrl];

    const backupImageAsset = CreativeAssetUploader.insertAndbuildCreativeAsset(
        this.profileId_, advertiserId, backupImageName, 'HTML_IMAGE',
        backupImagePath, 'BACKUP_IMAGE');

    const backupImageClickThroughUrl =
        CampaignManager.newCreativeClickThroughUrl();
    if (backupImageCustomClickThroughUrl) {
      backupImageClickThroughUrl.customClickThroughUrl =
          backupImageCustomClickThroughUrl;
    } else {
      backupImageClickThroughUrl.landingPageId =
          this.getDefaultAdvertiserLandingPageId_(advertiserId);
    }

    const backupImageTargetWindow = CampaignManager.newTargetWindow();
    backupImageTargetWindow.targetWindowOption = 'NEW_WINDOW';

    creative.backupImageClickThroughUrl = backupImageClickThroughUrl;
    creative.backupImageReportingLabel = 'backup';
    creative.backupImageTargetWindow = backupImageTargetWindow;

    creative.creativeAssets.push(backupImageAsset);
  }

  /**
   * Creates a creative using the given {@link Spreadsheet} row data.
   *
   * @param {array!} row  two-dimensional array representing a row of data
   **/
  insertCreative(row) {
    console.log(`Inserting creative with config: ${JSON.stringify(row)}.`);

    const creative = CampaignManager.newCreative();
    creative.type = 'DISPLAY';
    creative.active = true;
    creative.creativeAssets = [];

    this.addMainCreative_(row, creative);
    this.addCreativeBackupImage_(row, creative);

    const creativeResponse =
        CampaignManager.Creatives.insert(creative, this.profileId_);

    console.log(
        `Created HTML5 display creative with ID ` +
        `[${creativeResponse.id}] and Name [${creativeResponse.name}]`);
  }
}

/**
 * @class CreativeAssetUploader representing a wrapper for creative asset
 * upload functionality.
 */
class CreativeAssetUploader {
  /**
   * Creates and uploads a creative asset using the given parameters and file
   * content from Google Drive.
   *
   * @see {@link DriveApi}.
   *
   * @param {string} profileId     the CM UserProfile ID
   * @param {string} advertiserId  the ID of the advertiser to use
   * @param {string} assetName     the name of the creative asset
   * @param {string} assetType     the type of the creative asset
   * @param {string} assetDriveId  the file ID of the asset in Google Drive
   *
   * @returns {Object!} the {@link CreativeAssetMetadata} upload response
   **/
  static insertCreativeAsset(
      profileId, advertiserId, assetName, assetType, assetDriveId) {
    const creativeAssetId = CampaignManager.newCreativeAssetId();
    creativeAssetId.name = assetName;
    creativeAssetId.type = assetType;

    const creativeAssetMetadata = CampaignManager.newCreativeAssetMetadata();
    creativeAssetMetadata.assetIdentifier = creativeAssetId;

    const content = DriveApi.getFileByDriveId(assetDriveId);
    const response = CampaignManager.CreativeAssets.insert(
        creativeAssetMetadata, profileId, advertiserId, content);

    console.log(
        `Inserted creative asset with name [${assetName}] and type ` +
        `[${assetType}], received ID [${response.id}].`);

    return response;
  }

  /**
   * Builds a {@link CreativeAsset} object using a reference to the
   * uploaded {@link CreativeAssetMetadata}.
   *
   * @see {@link this#insertCreativeAsset}.
   *
   * @param {Object!} creativeAssetMetadata  the uploaded asset metadata
   * @param {string} role                    the role of the creative asset
   *
   * @returns {Object!} the created {@link CreativeAsset}
   **/
  static buildCreativeAsset(creativeAssetMetadata, role) {
    const creativeAsset = CampaignManager.newCreativeAsset();
    creativeAsset.assetIdentifier = creativeAssetMetadata.assetIdentifier;
    creativeAsset.role = role;

    return creativeAsset;
  }

  /**
   * Builds a {@link CreativeAsset} object, utilizing
   * {@link this#insertCreativeAsset} to upload a creative asset using the
   * given parameters.
   *
   * @param {string} profileId     the CM UserProfile ID
   * @param {string} advertiserId  the ID of the advertiser to use
   * @param {string} assetName     the name of the creative asset
   * @param {string} assetType     the type of the creative asset
   * @param {string} assetDriveId  the file ID of the asset in Google Drive
   * @param {string} role          the role of the creative asset
   *
   * @returns {Object!} the created {@link CreativeAsset}
   **/
  static insertAndbuildCreativeAsset(
      profileId, advertiserId, assetName, assetType, assetDriveId, role) {
    const creativeAssetMetadata = this.insertCreativeAsset(
        profileId, advertiserId, assetName, assetType, assetDriveId);

    return this.buildCreativeAsset(creativeAssetMetadata, role);
  }
}

/**
 * @class CreativeUploader representing a wrapper for creative upload
 * functionality.
 */
class CreativeUploader {
  /**
   * Retrieves the creative sizes for the given creative dimensions.
   * @private
   *
   * @param {string} profileId           the CM UserProfile ID
   * @param {array!} creativeDimensions  the width and height of the creative
   *
   * @returns {Object!} the available sizes for the given creative dimensions
   **/
  static getCreativeSizes_(profileId, creativeDimensions) {
    const sizes = CampaignManager.Sizes.list(
        profileId,
        {'width': creativeDimensions[0], 'height': creativeDimensions[1]});
    console.log(`Fetched creative sizes: ${JSON.stringify(sizes)}.`);

    return sizes;
  }

  /**
   * Updates the given creative with information pertaining to its size.
   *
   * @param {string} profileId           the CM UserProfile ID
   * @param {array!} creativeDimensions  the width and height of the creative
   * @param {Object!} creative           the {@link Creative} to update
   **/
  static addCreativeSize(profileId, creativeDimensions, creative) {
    const creativeSizes = this.getCreativeSizes_(profileId, creativeDimensions);
    const creativeSize = CampaignManager.newSize();

    if (creativeSizes) {
      creativeSize.id = creativeSizes['sizes'][0]['id'];
    } else {
      creativeSize.width = creativeDimensions[0];
      creativeSize.height = creativeDimensions[1];
    }
    creative.size = creativeSize;
  }

  /**
   * Updates the given creative with information pertaining to its click tags.
   *
   * @param {array!} clickTags  the {@link CreativeAssetMetadata} click tags
   * @param {Object!} creative  the {@link Creative} to update
   **/
  static addCreativeClickTags(clickTags, creative) {
    creative.clickTags = [];

    clickTags.forEach(function(clickTagMetadata) {
      let clickTag = CampaignManager.newClickTag();
      clickTag.name = clickTagMetadata.name;
      clickTag.eventName = clickTagMetadata.name;
      clickTag.clickThroughUrl = clickTagMetadata.clickThroughUrl;

      creative.clickTags.push(clickTag);
    });
  }
}
