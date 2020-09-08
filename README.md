# Campaign Manager Creatives Drive Uploader

This repository contains Google Apps Script code that uses the
[Campaign Manager Trafficking API](https://developers.google.com/doubleclick-advertisers/getting_started)
to upload HTML5 creatives stored in Google Drive to Campaign Manager.

**DISCLAIMER**: The code samples shared here are _not_ formally supported
by Google and are provided only as a reference. See [LICENSE](LICENSE.md)
for more information.

Contributions are highly encouraged; see [CONTRIBUTING.md](CONTRIBUTING.md).

### Configuration and Setup

1.  Create a *Google Sheets* spreadsheet that contains the following:
    - A designated cell for referencing your CM User Profile ID
    - Columns for the following CM Creative attributes:
       - Advertiser ID
       - Creative Name
       - Creative Size ('width'x'height')
       - Creative Asset Name
       - Creative Asset Path (Drive ID)
       - Creative Backup Image Name
       - Creative Backup Image Path (Drive ID)
       - Creative Backup Image Custom Landing Page URL (optional)
       - Status
1.  Create an *Apps Script* project that is linked to this spreadsheet by
    navigating to *Tools > Script Editor*. Alternatively open the script
    directly from the
    [Apps Script Project Dashboard](https://script.google.com/home/all).
1.  Copy the code samples provided in [resources/](resources) to the script
    project created above. Consider using
    [clasp](https://github.com/google/clasp) for easier code management.
1.  Modify the `config` JavaScript object in `main.gs` to correctly reference
    the user profile ID cell as well as the creative attributes columns.
1.  Retrieve your CM *User Profile* by
    [logging into CM](https://www.google.com/dfa/trafficking/).
1.  Upload all HTML5 assets for your creatives to your Google Drive account,
    using any folder structure you prefer. We recommend using a **single
    compressed folder** per creative (refer to the guidelines for uploading
    HTML5 creatives
    [here](https://support.google.com/campaignmanager/answer/3145300?hl=en&ref_topic=2826366)).
1.  Fill up the columns created earlier with information pertaining to your
    creatives. To retrieve the **Drive File ID**, right-click on your file in
    Drive, choose *Get shareable link* and copy the file ID from the URL.
    Example: /file/d/\<**this-is-the-file-id**\>/view.
1.  Ensure that there is at least one **Landing Page** maintained in CM for
    every advertiser you would like to upload creatives for. This landing page
    will be associated with all creative backup images that do not specify a
    custom landing page URL.
1.  Ensure that every uploaded HTML5 creative contains at least one click tag.
    Refer to
    [these guidelines](https://support.google.com/campaignmanager/answer/4483813?hl=en&ref_topic=2826366)
    on how to prepare your creatives before upload.
