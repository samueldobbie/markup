$(document).ready(function () {
    /* Default file selection options */

    $('#setup-type-dropdown').change(function () {
        // Display components based on selected upload method
        const openMethod = $(this).val();
        if (openMethod == 'single') {
            $('#file-selection-container').show();
            $('#folder-selection-container').hide();
        } else {
            $('#file-selection-container').hide();
            $('#folder-selection-container').show();
        }
        localStorage.setItem('openMethod', openMethod);
    });

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

    $('#document-file-opener').change(function () { storeSingleFile('document') });

    $('#annotation-file-opener').change(function () { storeSingleFile('annotation') });

    $('#config-file-opener').change(function() { storeSingleFile('config') });

    $('#ontology-file-opener').change(function () { useCustomOntology('file') });

    $('#ontology-file-dropdown').change(function () { useExistingOntology('file') });

    $('#annotation-file-remover').click(function () {
        // Remove file
        localStorage.removeItem('annotationText0');
        $('#annotation-file-opener').val('');
        $('#annotation-file-name').text('');

        // Reset component styling
        $('#annotation-file-remover').hide();
        $('#annotation-file-opener-container').css('border', 'none');
    });

    $('#start-annotating-file').click(function() {
        startAnnotating('file');
    });

    /* Multiple file selection options */

    $('#folder-file-opener').change(function () {
        const fileList = $('#folder-file-opener')[0].files;

        // Store documents and config text
        let docIndex = 0;
        let docIndicies = {};
        for (let i = 0; i < fileList.length; i++) {
            const docType = getDocType(fileList[i]);
            const docName = getDocName(fileList[i]);
            
            if (docType == 'conf') {
                storeFile(fileList[i], 'configText');
            } else if (docType == 'txt') {
                storeFile(fileList[i], 'docText' + docIndex, 'lineBreakType' + docIndex);
                localStorage.setItem('docName' + docIndex, docName);
                docIndicies[docName] = docIndex; 
                docIndex++;
            }
        }

        // Map annotations to relevant document
        for (let i = 0; i < fileList.length; i++) {
            const docType = getDocType(fileList[i]);
            const docName = getDocName(fileList[i]);

            if (docType == 'ann') {
                storeFile(fileList[i], 'annotationText' + docIndicies[docName]);
            }
        }
        localStorage.setItem('docCount', docIndex);

        // Display folder name and update component
        const folderName = fileList[0].webkitRelativePath.split('/')[0];
        $('#folder-file-name').text(folderName);
        updateCompleteComponent('folder-file-opener-container');
    });

    $('#ontology-folder-dropdown').change(function () {
        useExistingOntology('folder');
    });
    
    $('#ontology-folder-opener').change(function () {
        useCustomOntology('folder');
    });

    $('#start-annotating-folder').click(function() {
        startAnnotating('folder');
    });

    /* Ontology file upload options */

    $('#umls-verification-exit').click(function () {
        // Hide authentication panel
        $('#umls-verification-form-container').hide();
        $('#setup-type-container').show();

        // Show ontology selection
        const type = $('#setup-type-dropdown').val() == 'single' ? 'file' : 'folder';
        $('#' + type + '-selection-container').show();
        $('#ontology-' + type + '-dropdown').prop('selectedIndex', 0);
    });

    $('#umls-verification-form').submit(function (e) {
        // Hide form and show loader
        $('#umls-verification-form').hide();
        $('#umls-verification-loader').show();

        $.ajax({
            type: 'POST',
            url: '/annotate/setup-umls/',
            data: getFormData($('#umls-verification-form')),
            success: function(response) {
                if (response == 'True') {
                    authoriseUser();
                } else {
                    denyUser();
                }
                // Reset authentication forms
                $('#umls-verification-loader').hide();
                $('#umls-verification-form').show();
                $('.verification-form-field').val('');
            }
        });
        // Prevent submission
        e.preventDefault();
    });
});

function toggleAdvancedOptions(type) {
    if ($('#expand-' + type + '-message').text() == '+ Advanced options') {
        $('#advanced-' + type + '-options').slideDown();
        $('#expand-' + type + '-message').text('- Advanced options');
    } else {
        $('#advanced-' + type + '-options').slideUp();
        $('#expand-' + type + '-message').text('+ Advanced options');
    }
}

function authoriseUser() {
    // Return to setup
    $('#umls-verification-form-container').hide();
    $('#setup-type-container').show();

    // Update ontology component
    const type = $('#setup-type-dropdown').val() == 'single' ? 'file' : 'folder';
    $('#' + type + '-selection-container').show();
    updateCompleteComponent('ontology-' + type + '-opener-container');
}

function denyUser() {
    // Show error message
    $('#umls-verification-form-container').css({'border': '1px solid red'});
    $('#umls-verification-form-invalid-credentials').show();
}

function getFormData(form) {
    // Serialize form data
    return form.serializeArray().reduce(
        function(object, item) {
            object[item.name] = item.value;
            return object;
        }, {}
    );
}

function useCustomOntology(type) {
    // Setup and show ontology
    const file = $('#ontology-' + type + '-opener').files[0];
    $('#ontology-' + type + '-name').text(getDocName(file));
    setupCustomOntology(file, type);
}

function useExistingOntology(type) {
    const ontology = $('#ontology-' + type + '-dropdown').val();

    if (ontology != 'default') {
        // Hide components and show authentication form
        $('#setup-type-container').hide();
        $('#' + type + '-selection-container').hide();
        $('#' + ontology + '-verification-form-container').show();
    } else if (!$('#ontology-' + type + '-opener').val()) {
        resetCompleteComponent('ontology-' + type + '-opener-container');
    }
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

function setupCustomOntology(file, type) {
    // Show loader and wait message
    toggleOntologyComponents(type);

    // Construct simstring database with ontology data
    let reader = new FileReader();
    reader.onload = function () {
        $.ajax({
            type: 'POST',
            url: '/annotate/setup-custom-ontology/',
            data: {
                'ontologyData': reader.result,
            },
            success: function () {
                // Hide loader and wait message
                toggleOntologyComponents(type);
                updateCompleteComponent('ontology-' + type + '-opener-container');
            }
        });
    };

    reader.readAsText(file);
}

function toggleOntologyComponents(type) {
    // Hide loader
    $('#' + type + '-ontology-options').toggle();
    $('#' + type + '-ontology-loader').toggle();

    // Prevent moving to annotation page and display wait message
    $('#start-annotating-' + type).toggle();
    $('#ontology-wait-message-' + type).toggle();
}

function updateCompleteComponent(id) {
    $('#' + id).css('border', '1px solid #33FFB5');
    $('#' + id).attr('complete', 'true');
}

function resetCompleteComponent(id) {
    $('#' + id).css('border', '');
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
