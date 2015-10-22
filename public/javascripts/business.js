// Parses raw pasted CSV and displays the stats on the review page.
function parsePastedCSV () {
  // Used to construct our post data
  var contactObj;
  var delimitedDataSplit;
  var dataToPost = [];
  // Used for existing header state
  var possibleHeader = '';
  var hasHeader;
  var columns;
  var nameIndex = -1;
  var emailIndex = -1;
  // Stats for the review page
  var csvStats = {
    'totalContacts': 0,
    'nameCount': 0,
    'emailCount': 0,
    'namesMissing': 0,
    'emailsMissing': 0
  };

  // Add comma delimiters to the raw CSV
  var rawCSV = $('.csv-upload-textarea').val();
  var delimitedData = convertTabsIntoCommas(rawCSV);

  // Grab the supposed "header"
  if (delimitedData.length && delimitedData[0]) {
    possibleHeader = delimitedData[0];
  }
  /*
  Check if this is actually a header
  TODO: Match against a synonym/case-insensitive list? 
    (name, Name, fullName, etc.)
  */
  hasHeader = possibleHeader.indexOf('name') >= 0 || 
              possibleHeader.indexOf('email') >= 0;

  // TODO: Factor out the contact bundling
  if (hasHeader) {
    // TODO: Use a better logging system (winston maybe?)
    console.log('parsePastedCSV: This CSV apparently has a header!');
    // Grab the index of name and email from the header
    columns = possibleHeader.split(',');
    nameIndex = columns.indexOf('name');
    emailIndex = columns.indexOf('email');
    console.log('parsePastedCSV: Name at index ' + nameIndex);
    console.log('parsePastedCSV: Email at index ' + emailIndex);
    csvStats.totalContacts = delimitedData.length - 1;

    // Start looking for name/email through the delimited data
    // Keep track of how many we find
    for (var i = 1; i < delimitedData.length; i++) {
      delimitedDataSplit = delimitedData[i].split(',');
      contactObj = {};

      if (nameIndex >= 0 && delimitedDataSplit[nameIndex]) {
        contactObj.name = {};
        contactObj.name.full = delimitedDataSplit[nameIndex];
        csvStats.nameCount += 1;
      }
      
      if (emailIndex >= 0 && delimitedDataSplit[emailIndex]) {
        contactObj.contact = {};
        contactObj.contact.email = delimitedDataSplit[emailIndex];
        csvStats.emailCount += 1;
      }

      dataToPost.push(contactObj);
    }
  }
  /*
  Since the pasted csv doesn't include a header, we're left with only 
  grabbing emails. It's unreliable to try and parse for a name! :(
  */
  else {
    csvStats.totalContacts = delimitedData.length;
    
    for (var i = 0; i < delimitedData.length; i++) {
      contactObj = {};
      // regex for email from "emailregex.com"
      var re = /[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?/i;
      var match = re.exec(delimitedData[i]);
      if (match) {
        contactObj.contact = {};
        contactObj.contact.email = match[0];
        dataToPost.push(contactObj);
        csvStats.emailCount += 1;
      }
    }
  }

  console.log('parsePastedCSV: Pending post ' + JSON.stringify(dataToPost));

  // Calculate missing stats
  csvStats.namesMissing = csvStats.totalContacts - csvStats.nameCount;
  csvStats.emailsMissing = csvStats.totalContacts - csvStats.emailCount;
  
  console.log('parsePastedCSV: Total Contacts: ' + csvStats.totalContacts);
  console.log('parsePastedCSV: Emails: ' + csvStats.emailCount);
  console.log('parsePastedCSV: Names: ' + csvStats.nameCount);
  console.log('parsePastedCSV: Missing Emails: ' + csvStats.emailsMissing);
  console.log('parsePastedCSV: Missing Names: ' + csvStats.namesMissing);
  
  // Show stats in review container
  prepForPost(dataToPost);
  displayReviewStats(csvStats, hasHeader);
  switchToReview(csvStats);
}

/*
Helper function: Inserts a hidden input element ready for posting to server
Input: Array of objects that contain parsed contacts
*/
function prepForPost(dataToPost) {
  var data = JSON.stringify(dataToPost);
  var inputField = $('<input type="hidden" name="contacts" />').val(data);
  $('#csv-upload-form-review-post').append(inputField);
}

/*
Helper function: Displays notices and warnings when on the review page
Input: Hash object containing stats from parsing a raw CSV
*/
function displayReviewStats(csvStats, hasHeader) {
  var reviewContainer = $('#csv-upload-form-review');
  // Show required notices
  reviewContainer.append(makeAlert('scanned', csvStats));
  reviewContainer.append(makeAlert('info', csvStats));

  // Show optional notices
  if (!hasHeader) {
    reviewContainer.append(makeAlert('no-header'));
  }
  if (csvStats.namesMissing) {
    reviewContainer.append(makeAlert('missing-names', csvStats));
  }
  if (csvStats.emailsMissing) {
    reviewContainer.append(makeAlert('missing-emails', csvStats));
  }
}

/*
Helper function: Creates a <p> element with desired stat styled by a certain type
Input: type (string), stat (integer)
TODO: Use a frontend framework (angular) instead to dynamically update
*/
function makeAlert(type, csvStats) {
  if (type === 'scanned') {
    return '<p class="success-note">Scanned ' + csvStats.totalContacts + ' contacts!</p>';
  }
  else if (type === 'info') {
    if (csvStats.emailCount === 0) {
      return '<p class="alert alert-info">Found ' + csvStats.emailCount + ' emails ' +
        'and ' + csvStats.nameCount + ' names. I cannot handle any contacts ' + 
        'without emails!</p>';
    }
    else {
      return '<p class="alert alert-info">Found ' + csvStats.emailCount + ' emails ' +
        'and ' + csvStats.nameCount + ' names. Click upload to send your ' +
        'contacts to the server.</p>';
    }
  }
  else if (type === 'no-header') {
    return '<p class="alert alert-warning">Your CSV does not have a header! ' +
      'I cannot pick out names if you do not have one. :(</p>';
  }
  else if (type === 'missing-names') {
    return '<p class="alert alert-warning">' + csvStats.namesMissing + ' of ' +
      'your contacts are missing names!</p>';
  }
  else if (type === 'missing-emails') {
    return '<p class="alert alert-danger">' + csvStats.emailsMissing + ' of ' +
      'your contacts are missing emails! These contacts will not be uploaded ' + 
      'since we cannot process them without an email.</p>'
  }
}

// Helper function: Alters elements on page so we appear to be in paste state
function switchToPaste() {
  console.log('switchToPaste: Switching to paste state');
  // Hide the paste textarea
  $('#csv-upload-form').removeClass('hidden');
  $('#csv-upload-form-review').addClass('hidden');
  // Dump generated alerts and hidden inputs
  $('#csv-upload-form-review').empty();
  $('#csv-upload-form-review-post').empty();

  // Unbind all click events
  $('.csv-upload-step').off('click');
  $('.csv-upload-step.paste').removeClass('active');
  $('.csv-upload-step.review').addClass('inactive');

  // Update action button state
  $('.csv-upload-action-button.paste').removeClass('hidden');
  $('.csv-upload-action-button.review').addClass('hidden');
}

// Helper function: Alters elements on page so we appear to be in review state
function switchToReview(csvStats) {
  var postFormHasData = $('#csv-upload-form-review-post').children();
  console.log('switchToReview: Switching to review state');
  // Hide the paste textarea
  $('#csv-upload-form').addClass('hidden');
  $('#csv-upload-form-review').removeClass('hidden');

  // Update button(step) states
  $('.csv-upload-step.paste').on('click', function () {
    switchToPaste();
  });
  $('.csv-upload-step.paste').addClass('active');
  $('.csv-upload-step.review').removeClass('inactive');

  // Update action button state
  $('.csv-upload-action-button.paste').addClass('hidden');
  // Allow upload button if we have actual data to upload
  if (postFormHasData && csvStats.emailCount > 0) {
    $('.csv-upload-action-button.review').removeClass('hidden');
  }
}

// Helper function: Executes when user hits upload. Hides upload button.
function startUpload() {
  $('.csv-upload-action-button.review').addClass('hidden');
  $('.csv-upload-action-button.upload').removeClass('hidden');
  $('#csv-upload-form-review-post').submit();
}

/*
Helper function: converts raw pasted csv into a more manageable format
  with comma delimiters.

Input: Raw csv value from a textarea element.
Output: Array with comma-delimited data. Each row represents a row in the 
  original csv.
*/
function convertTabsIntoCommas(pastedData) {
  var rows = pastedData.split('\n');
  var delimitedData = [];

  for (var i = 0; i < rows.length; i++) {
    var find = '(\t(?=(?:(?:[^"]*"){2})*[^"]*$))';
    var regex = new RegExp (find, 'g');
    var delimitedRow = rows[i].replace(regex, ',');
    delimitedData.push(delimitedRow);
  }

  // Oh regex likes to insert empty strings which JS will count towards array length
  if (delimitedData[0]) {
    return delimitedData;
  }
  else {
    return [];
  }
}
