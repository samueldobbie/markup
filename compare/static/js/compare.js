$(document).ready(function () {

    // Toggle advanced settings display
    $('.expand-message').click(function () {
        const parentId = $(this).parent().attr('id');
        const type = parentId == 'expand-folder-options' ? 'folder' : 'file';
        toggleAdvancedOptions(type);
    });

    // Show tooltips
    $('.setup-tooltip').simpletooltip({
        position: 'right',
        border_color: 'white',
        color: '#1A1E24',
        background_color: 'white',
        border_width: 4
    });

    // Set setup type to complete by default
    updateCompleteComponent('setup-type-container');

    /* Single file selection options */

    //$('#document-file-opener').change(function () { storeSingleFile('document') });

    //$('#annotation-file-opener').change(function () { storeSingleFile('annotation') });

    $('#config-file-opener').change(function() { storeSingleFile('config') });

    //$('#ontology-file-opener').change(function () { useCustomOntology('file') });

    //$('#ontology-file-dropdown').change(function () { useExistingOntology('file') });

    $('#annotation-file-remover').click(function () {
        // Remove file
        localStorage.removeItem('annotationText0');
        $('#annotation-file-opener').val('');
        $('#annotation-file-name').text('');

        // Reset component styling
        $('#annotation-file-remover').hide();
        $('#annotation-file-opener-container').css('border', 'none');
    });

    // $('#start-annotating-file').click(function() {
    //     startAnnotating('file');
    // });

    /* Multiple file selection options */

    $('#folder-file-opener-1').change(function () {
        const fileList = $('#folder-file-opener-1')[0].files;

        // Store documents and config text
        let docIndex = 0;
        let docIndicies = {};
        for (let i = 0; i < fileList.length; i++) {
            const docType = getDocType(fileList[i]);
            const docName = getDocName(fileList[i]);
            
            if (docType == 'txt') {
                storeFile(fileList[i], 'firstdocText' + docIndex, 'firstlineBreakType' + docIndex);
                localStorage.setItem('first' + 'docName' + docIndex, docName);
                docIndicies[docName] = docIndex; 
                docIndex++;
            }
        }

        // Map annotations to relevant document
        for (let i = 0; i < fileList.length; i++) {
            const docType = getDocType(fileList[i]);
            const docName = getDocName(fileList[i]);

            if (docType == 'ann') {
                storeFile(fileList[i],'first' +  'annotationText' + docIndicies[docName]);
            }
        }
        localStorage.setItem('docCount', docIndex);

        // Display folder name and update component
        const folderName = fileList[0].webkitRelativePath.split('/')[0];
        $('#folder-file-name-1').text(folderName);
        updateCompleteComponent('folder-file-opener-container-1');
    });

    $('#folder-file-opener-2').change(function () {
        const fileList = $('#folder-file-opener-2')[0].files;

        // Store documents and config text
        let docIndex = 0;
        let docIndicies = {};
        for (let i = 0; i < fileList.length; i++) {
            const docType = getDocType(fileList[i]);
            const docName = getDocName(fileList[i]);
            
            if (docType == 'txt') {
                storeFile(fileList[i], 'seconddocText' + docIndex, 'secondlineBreakType' + docIndex);
                localStorage.setItem('second' + 'docName' + docIndex, docName);
                docIndicies[docName] = docIndex; 
                docIndex++;
            }
        }

        // Map annotations to relevant document
        for (let i = 0; i < fileList.length; i++) {
            const docType = getDocType(fileList[i]);
            const docName = getDocName(fileList[i]);

            if (docType == 'ann') {
                storeFile(fileList[i], 'second' + 'annotationText' + docIndicies[docName]);
            }
        }
        localStorage.setItem('docCount', docIndex);

        // Display folder name and update component
        const folderName = fileList[0].webkitRelativePath.split('/')[0];
        $('#folder-file-name-2').text(folderName);
        updateCompleteComponent('folder-file-opener-container-2');
    });

//CHANGE TO COMPARE
    $('#start-comparing').click(function() {
        startCompare();
    });
});
    
function startCompare() {
    // Set default open document
    localStorage.setItem('openDocId', 0);

    // Verify all required components are complete
    let ready = true;
    $('.option-' + 'folder' + '-container' - '1').each(function() {
        if ($(this).attr('complete') != 'true') {
            $(this).css('border', '1px solid red');
            ready = false;
        }
    });
    $('.option-' + 'folder' + '-container' - '2').each(function() {
        if ($(this).attr('complete') != 'true') {
            $(this).css('border', '1px solid red');
            ready = false;
        }
    });
    $('.option-' + 'folder' + '-container').each(function() {
        if ($(this).attr('complete') != 'true') {
            $(this).css('border', '1px solid red');
            ready = false;
        }
    });
    // Move to annotation page
    if (ready) location.href = '/compare/iaa';
}




function getDocType(file) {
    const docName = file.name.split('.');
    if (docName.includes('txt')) {
        return 'txt';
    } else if (docName.includes('conf')) {
        return 'conf';
    } else if (docName.includes('ann')) {
        return 'ann';
    }
    return 'unknown';
}

function storeSingleFile(type) {
    const file = $('#' + type + '-file-opener')[0].files[0];
    const docName = getDocName(file);

    if (type == 'annotation') {
        storeFile(file, 'annotationText0');
        $('#annotation-file-remover').show();
    } else if (type == 'document') {
        storeFile(file, 'docText0', 'lineBreakType0');
        localStorage.setItem('docCount', 0);
        localStorage.setItem('docName0', docName);
    } else if (type == 'config') {
        storeFile(file, 'configText');
    }

    $('#' + type + '-file-name').text(docName);
    updateCompleteComponent(type + '-file-opener-container');
}

function startAnnotating(type) {
    // Set default open document
    localStorage.setItem('openDocId', 0);

    // Verify all required components are complete
    let ready = true;
    $('.option-' + type + '-container').each(function() {
        if ($(this).attr('complete') != 'true') {
            $(this).css('border', '1px solid red');
            ready = false;
        }
    });
    // Move to annotation page
    if (ready) location.href = '/annotate';
}

function getDocName(file) {
    return file.name.split('.').slice(0, -1).join('.');
}





function updateCompleteComponent(id) {
    $('#' + id).css('border', '1px solid #33FFB5');
    $('#' + id).attr('complete', 'true');
}

function detectLineBreakType(text) {
    if (text.indexOf('\r\n') !== -1) {
        return 'windows';
    } else if (text.indexOf('\r') !== -1) {
        return 'mac';
    } else if (text.indexOf('\n') !== -1) {
        return 'linux';
    }
    return 'unknown';
}

function convertLineBreakType(text, convertFrom, convertTo) {
    if (convertFrom == 'windows' && convertTo == 'linux') {
        return text.replace(/\r\n/g, '\n');
    }
    return text;
}

function storeFile(file, fileStorageName, lineBreakStorageName=null) {
    let reader = new FileReader();

    reader.onload = function () {
        let fileText = reader.result;

        // Convert from CRLF to LF
        if (fileStorageName == 'configText' && detectLineBreakType(fileText) == 'windows') {
            fileText = convertLineBreakType(fileText, 'windows', 'linux');
        }

        // Store data locally
        if (lineBreakStorageName) {
            localStorage.setItem(lineBreakStorageName, detectLineBreakType(fileText));
        }
        localStorage.setItem(fileStorageName, fileText);
    };

    reader.readAsText(file);
}

// End session if cookies are disabled
session.validateCookies();
