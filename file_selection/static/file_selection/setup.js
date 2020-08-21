$(document).ready(function () {
    $('#darkMode').click(function () {
        /*
        Enable switching between display modes
        */
        if (localStorage.getItem('mode') == 'dark') {
            localStorage.setItem('mode', 'light');
        } else {
            localStorage.setItem('mode', 'dark');
        }
        updateDisplayMode();
    });


    $('#setup-type-dropdown').change(function () {
        /*
        Show single or multiple selection options
        based on file quantity
        */

       // clearLocalStorage();

        var selectedValue = this.value;
        if (selectedValue == 'single') {
            $('#single-document-selection-container').show();
            $('#multiple-document-selection-container').hide();
        } else {
            $('#single-document-selection-container').hide();
            $('#multiple-document-selection-container').show();
        }

        // Store file selection type locally
        localStorage.setItem('documentOpenType', selectedValue);
    });


    $('#document-file-opener').change(function () {
        // Store selected file locally
        storeFileDataLocally(document.getElementById('document-file-opener').files[0], 'documentText' + 0, 'lineBreakType' + 0);
        
        localStorage.setItem('fileName' + 0, document.getElementById('document-file-opener').files[0].name.split('.').slice(0, -1).join('.'));
        localStorage.setItem('documentCount', 0);

        // Display name of file next to upload button
        document.getElementById('document-file-name').innerText = document.getElementById('document-file-opener').files[0].name;
        
        // Change color of component
        updateCompleteComponent('document-file-opener-container');
    });


    $('#annotation-file-opener').change(function () {
        // Store file data locally
        storeFileDataLocally(document.getElementById('annotation-file-opener').files[0], 'annotationText' + 0);

        // Display name of file next to upload button
        document.getElementById('annotation-file-name').innerText = document.getElementById('annotation-file-opener').files[0].name;
        
        // Display remove button
        document.getElementById('annotation-file-remover').style.display = '';
        
        // Change color of component
        updateCompleteComponent('annotation-file-opener-container');
    });


    $('#annotation-file-remover').click(function () {
        // Remove uploaded file
        document.getElementById('annotation-file-opener').value = '';

        // Remove name of file from span
        document.getElementById('annotation-file-name').innerText = '';

        // Remove uploaded file from localStorage
        localStorage.removeItem('annotationText' + 0);

        // Hide remove button
        document.getElementById('annotation-file-remover').style.display = 'none';

        // Change color of component
        document.getElementById('annotation-file-opener-container').style.border = 'none';
    });


    $('#configuration-file-opener').change(function () {
        // Store file data locally
        storeFileDataLocally(document.getElementById('configuration-file-opener').files[0], 'configText');

        // Display name of file next to upload button
        document.getElementById('configuration-file-name').innerText = document.getElementById('configuration-file-opener').files[0].name;
        
        // Change color of component
        updateCompleteComponent('configuration-file-opener-container');
    });


    $('#ontology-file-dropdown').change(function () {
        /*
        Display ontology login authentication panel
        */
        var selectedValue = this.value;
        if (selectedValue != 'default') {
            $('#setup-type-container').hide();
            $('#single-document-selection-container').hide();
            $('#' + selectedValue + '-verification-form-container').show();
        } else if (!$('#ontology-file-opener').val()) {
            resetCompleteComponent('ontology-file-opener-container');
            resetOntologyToDefault();
        }
    });


    $('#ontology-file-opener').change(function () {
        // Display name of file next to upload button
        document.getElementById('ontology-file-name').innerText = document.getElementById('ontology-file-opener').files[0].name;

        // Setup ontology
        setupCustomOntology(document.getElementById('ontology-file-opener').files[0], 'single');
    });


    $('#start-annotating-file').click(function () {
        var complete = true;
        for (var i = 0; i < document.getElementsByClassName('option-file-container').length; i++) {
            if (document.getElementsByClassName('option-file-container')[i].getAttribute('complete') != 'true') {
                document.getElementsByClassName('option-file-container')[i].style.border = '1px solid red';
                complete = false;
            }
        }

        if (complete) {
            location.href = '/annotate';
        }
    });


    /*** Multiple document section ***/

    $('#multiple-document-selection').click(function () {
        $('.file-selection-container').fadeOut();

        sleep(500).then(() => {
            $('.multiple-document-selection-container').fadeIn();
        });

        // Store file selection type locally
        localStorage.setItem('documentOpenType', 'multiple');
    });


    $('#folder-file-opener').change(function () {
        var documentCount = 0;
        var documentIndex = {};
        var documentFileList = document.getElementById('folder-file-opener').files;

        for (var i = 0; i < documentFileList.length; i++) {
            if (documentFileList[i].name.split('.').includes('txt')) {
                documentIndex[documentFileList[i].name.split('.')[0]] = documentCount; 
                storeFileDataLocally(documentFileList[i], 'documentText' + documentCount, 'lineBreakType' + documentCount);
                localStorage.setItem('fileName' + documentCount, documentFileList[i].name.split('.').slice(0, -1).join('.'));
                documentCount++;
            } else if (documentFileList[i].name.split('.').includes('conf')) {
                storeFileDataLocally(documentFileList[i], 'configText');
            }
        }

        for (var j = 0; j < documentFileList.length; j++) {
            if (documentFileList[j].name.split('.').includes('ann')) {
                var index = documentIndex[documentFileList[j].name.split('.')[0]];
                storeFileDataLocally(documentFileList[j], 'annotationText' + index);
            }
        }
        localStorage.setItem('documentCount', documentCount);

        // Display name of folder next to upload button
        // May need to be done differently on non-Chrome browsers
        document.getElementById('folder-file-name').innerText = document.getElementById('folder-file-opener').files[0].webkitRelativePath.split('/')[0];
        
        // Change color of component
        updateCompleteComponent('folder-file-opener-container');
    });


    $('#ontology-folder-dropdown').change(function () {
        var selectedValue = this.value;
        if (selectedValue != 'default') {
            $('#setup-type-container').hide();
            $('#multiple-document-selection-container').hide();
            $('#' + selectedValue + '-verification-form-container').show();
        } else if (!$('#ontology-folder-opener').val()) {
            resetCompleteComponent('ontology-folder-opener-container');
            resetOntologyToDefault();
        }
    });

    
    $('#ontology-folder-opener').change(function () {
        // Display name of file next to upload button
        document.getElementById('ontology-folder-name').innerText = document.getElementById('ontology-folder-opener').files[0].name;
        
        // Setup ontology
        setupCustomOntology(document.getElementById('ontology-folder-opener').files[0], 'multiple');
    });


    $('#start-annotating-folder').click(function () {
        var complete = true;
        for (var i = 0; i < document.getElementsByClassName('option-folder-container').length; i++) {
            if (document.getElementsByClassName('option-folder-container')[i].getAttribute('complete') != 'true') {
                document.getElementsByClassName('option-folder-container')[i].style.border = '1px solid red';
                complete = false;
            }
        }

        if (complete) {
            location.href = '/annotate';
        }
    });


    $('#umls-verification-exit').click(function () {
        $('#umls-verification-form-container').hide();
        $('#setup-type-container').show();
        if ($('#setup-type-dropdown').val() == 'single') {
            $('#single-document-selection-container').show();
            $('#ontology-file-dropdown').prop('selectedIndex', 0);
        } else {
            $('#multiple-document-selection-container').show();
            $('#ontology-folder-dropdown').prop('selectedIndex', 0);
        }
    });


    $('#umls-verification-form').submit(function (e) {
        // Prevent submission
        e.preventDefault();

        // Hide form and show verification loader
        $('#umls-verification-form').hide();
        $('#umls-verification-loader').show();

        // Serialize form data
        var formData = $('#umls-verification-form').serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});

        $.ajax({
            type: 'POST',
            url: '~/setup-umls-if-valid',
            data: formData,
            success: function(response) {
                if (response == 'True') {
                    // Return back to setup with updated ontology component
                    $('#umls-verification-form-container').hide();
                    $('#setup-type-container').show();
                    if ($('#setup-type-dropdown').val() == 'single') {
                        $('#single-document-selection-container').show();
                        updateCompleteComponent('ontology-file-opener-container');
                    } else {
                        $('#multiple-document-selection-container').show();
                        updateCompleteComponent('ontology-folder-opener-container');
                    }
                } else {
                    $('#umls-verification-form-container').css({'border': '1px solid red'});
                    $('#umls-verification-form-invalid-credentials').show();
                }
                // Hide verification loader and show form
                $('#umls-verification-loader').hide();
                $('#umls-verification-form').show();

                // Clear input forms
                $('.verification-form-field').val('');
            }
        });
    });
    
    // Initialize display mode based on users' preference
    updateDisplayMode();

    // Set setup type to complete by default
    updateCompleteComponent('setup-type-container');

    $('.setup-tooltip').simpletooltip({
        position: 'right',
        border_color: 'white',
        color: '#1A1E24',
        background_color: 'white',
        border_width: 4
    });
});


function updateDisplayMode() {
    /*
    Updates the display mode based on the users' preference
    */
    var targetBackgroundColor, oppositeBackgroundColor, color;

    if (localStorage.getItem('mode') == 'dark') {
        document.getElementById('darkMode').innerHTML = 'Light Mode';
        targetBackgroundColor = '#1A1E24';
        oppositeBackgroundColor = '#f1f1f1';
        color = 'white';
    } else {
        document.getElementById('darkMode').innerHTML = 'Dark Mode';
        targetBackgroundColor = '#f1f1f1';
        oppositeBackgroundColor = '#1A1E24';
        color = '#1A1E24';
    }

    $('body').css({
        'background-color': targetBackgroundColor
    });

    $('nav').css({
        'background-color': targetBackgroundColor
    });

    $('.nav-logo').css({
        'color': color
    });

    $('.nav-item').css({
        'color': color
    });

    $('.option-container').css({
        'color': color,
        'background-color': targetBackgroundColor,
    });

    $('.ontology-wait-message').css({
        'color': oppositeBackgroundColor
    });

    var loaderDivs = document.getElementsByClassName('lds-ellipsis');
    for (var i = 0; i < loaderDivs.length; i++) {
        for (var j = 0; j < loaderDivs[i].childNodes.length; j++) {
            loaderDivs[i].childNodes[j].style.background = oppositeBackgroundColor;
        }
    }
}


function setupCustomOntology(file, type) {
    // Display loader
    document.getElementById(type + '-ontology-options').style.display = 'none';
    document.getElementById(type + '-ontology-loader').style.display = '';

    if (type == 'single') {
        // Hide start annotating button + display wait message
        document.getElementById('start-annotating-file').style.display = 'none';
        document.getElementById('ontology-wait-message-file').style.display = '';
    } else if (type == 'multiple') {
        // Hide start annotating button + display wait message
        document.getElementById('start-annotating-folder').style.display = 'none';
        document.getElementById('ontology-wait-message-folder').style.display = '';
    }

    var reader = new FileReader();
    reader.onload = function () {
        $.ajax({
            type: 'POST',
            url: '~/setup-custom-ontology',
            data: {
                'ontologyData': reader.result,
                'csrfmiddlewaretoken': getCookie('csrftoken')
            },
            success: function (result) {
                if (type == 'single') {
                    // Change color of component
                    updateCompleteComponent('ontology-file-opener-container');
                } else if (type == 'multiple') {
                    // Change color of component
                    updateCompleteComponent('ontology-folder-opener-container');
                }

                // Hide loader
                document.getElementById(type + '-ontology-options').style.display = '';
                document.getElementById(type + '-ontology-loader').style.display = 'none';

                if (type == 'single') {
                    // Show start annotating button + hide wait message
                    document.getElementById('start-annotating-file').style.display = '';
                    document.getElementById('ontology-wait-message-file').style.display = 'none';
                } else if (type == 'multiple') {
                    // Show start annotating button + hide wait message
                    document.getElementById('start-annotating-folder').style.display = '';
                    document.getElementById('ontology-wait-message-folder').style.display = 'none';
                }
            }
        });
    };
    reader.readAsText(file);
}


function updateCompleteComponent(id) {
    document.getElementById(id).style.border = '1px solid #33FFB5';
    document.getElementById(id).setAttribute('complete', 'true');
}

function resetCompleteComponent(id) {
    document.getElementById(id).style.border = '';
}


function detectLineBreakType(text) {
    if (text.indexOf('\r\n') !== -1) {
        return 'windows';
    } else if (text.indexOf('\r') !== -1) {
        return 'mac';
    } else if (text.indexOf('\n') !== -1) {
        return 'linux';
    } else {
        return 'unknown';
    }
}


function convertLineBreakType(text, convertFrom, convertTo) {
    if (convertFrom == 'windows' && convertTo == 'linux') {
        return text.replace(/\r\n/g, '\n');
    }
    return text;
}


function storeFileDataLocally(file, fileStorageName, lineBreakStorageName=null) {
    if (file.type == 'application/pdf') {
        var fileReader = new FileReader();
        fileReader.onload = function() {
            // Implement file reading of other formats
        };
        fileReader.readAsArrayBuffer(file);
    } else {
        var reader = new FileReader();
        reader.onload = function () {
            var fileText = reader.result;
            if (fileStorageName == 'configText' && detectLineBreakType(fileText) == 'windows') {
                fileText = convertLineBreakType(fileText, 'windows', 'linux');
            }
            localStorage.setItem(fileStorageName, fileText);
            if (lineBreakStorageName) {
                localStorage.setItem(lineBreakStorageName, detectLineBreakType(fileText));
            }
        };
        reader.readAsText(file);
    }
}
