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
        
        localStorage.setItem('fileName' + 0, document.getElementById('document-file-opener').files[0].name.split(".").slice(0, -1).join("."));
        localStorage.setItem('documentCount', 0);

        // Display name of file next to upload button
        document.getElementById('document-file-name').innerText = document.getElementById('document-file-opener').files[0].name;
        
        // Change colour of component
        updateComponentColour('document-file-opener-container');
    });


    $('#annotation-file-opener').change(function () {
        // Store file data locally
        storeFileDataLocally(document.getElementById('annotation-file-opener').files[0], 'annotationText' + 0);

        // Display name of file next to upload button
        document.getElementById('annotation-file-name').innerText = document.getElementById('annotation-file-opener').files[0].name;
        
        // Display remove button
        document.getElementById('annotation-file-remover').style.display = '';
        
        // Change colour of component
        updateComponentColour('annotation-file-opener-container');
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

        // Change colour of component
        document.getElementById('annotation-file-opener-container').style.border = 'none';
    });


    $('#configuration-file-opener').change(function () {
        // Store file data locally
        storeFileDataLocally(document.getElementById('configuration-file-opener').files[0], 'configText');

        // Display name of file next to upload button
        document.getElementById('configuration-file-name').innerText = document.getElementById('configuration-file-opener').files[0].name;
        
        // Change colour of component
        updateComponentColour('configuration-file-opener-container');
    });


    $("#ontology-file-dropdown").change(function () {
        var selectedValue = this.value;
        if (selectedValue != 'Choose pre-loaded') {
            // Verify user access to ontology and setup
            $('#' + selectedValue + '-verification-form-container').fadeIn();
        }
    });


    $('#ontology-file-opener').change(function () {
        // Display name of file next to upload button
        document.getElementById('ontology-file-name').innerText = document.getElementById('ontology-file-opener').files[0].name;

        // Setup ontology
        setupCustomOntology(document.getElementById('ontology-file-opener').files[0]);

        // Change colour of component
        updateComponentColour('ontology-file-opener-container');
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
        $(".file-selection-container").fadeOut();

        sleep(500).then(() => {
            $(".multiple-document-selection-container").fadeIn();
        });

        // Store file selection type locally
        localStorage.setItem('documentOpenType', 'multiple');
    });


    $('#folder-file-opener').change(function () {
        var documentCount = 0;
        var documentIndex = {};
        var documentFileList = document.getElementById('folder-file-opener').files;

        for (var i=0; i<documentFileList.length; i++) {
            if (documentFileList[i].name.split('.').includes('txt')) {
                documentIndex[documentFileList[i].name.split('.')[0]] = documentCount; 
                storeFileDataLocally(documentFileList[i], 'documentText' + documentCount, 'lineBreakType' + documentCount);
                localStorage.setItem('fileName' + documentCount, documentFileList[i].name.split(".").slice(0, -1).join("."));
                documentCount++;
            } else if (documentFileList[i].name.split('.').includes('conf')) {
                storeFileDataLocally(documentFileList[i], 'configText');
            }
        }

        for (var j=0; j<documentFileList.length; j++) {
            if (documentFileList[j].name.split('.').includes('ann')) {
                var index = documentIndex[documentFileList[j].name.split('.')[0]];
                storeFileDataLocally(documentFileList[j], 'annotationText' + index);
            }
        }
        localStorage.setItem('documentCount', documentCount);

        // Display name of folder next to upload button
        // May need to be done differently on non-Chrome browsers
        document.getElementById('folder-file-name').innerText = document.getElementById('folder-file-opener').files[0].webkitRelativePath.split('/')[0];
        
        // Change colour of component
        updateComponentColour('folder-file-opener-container');
    });


    $("#ontology-folder-dropdown").change(function () {
        var selectedValue = this.value;
        if (selectedValue != 'Choose pre-loaded') {
            // Verify ontology access and setup
            $('#' + selectedValue + '-verification-form-container').fadeIn();
        }
    });

    
    $('#ontology-folder-opener').change(function () {
        // Display name of file next to upload button
        document.getElementById('ontology-folder-name').innerText = document.getElementById('ontology-folder-opener').files[0].name;
        
        // Setup ontology
        setupCustomOntology(document.getElementById('ontology-folder-opener').files[0]);

        // Change colour of component
        updateComponentColour('ontology-folder-opener-container');
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
        $('#umls-verification-form-container').fadeOut();
        $('#ontology-file-dropdown').prop('selectedIndex', 0);
        $('#ontology-folder-dropdown').prop('selectedIndex', 0);
    });


    $('#umls-verification-form').submit(function (e) {
        e.preventDefault();

        var formData = $('#umls-verification-form').serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});

        $.ajax({
            type: 'POST',
            url: '~/is-valid-umls-user',
            data: formData,
            success: function(response) {
                if (response == 'True') {
                    $('#umls-verification-form-container').fadeOut();

                    // Change colour of component
                    updateComponentColour('ontology-file-opener-container');

                    // Change colour of component
                    updateComponentColour('ontology-folder-opener-container');
                } else {
                    $('#umls-verification-form-invalid-credentials').fadeIn();
                }
            }
        });
    });

    
    // Initialize display mode based on users' preference
    updateDisplayMode();

    updateComponentColour('setup-type-container');
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
}


function setupCustomOntology(file) {
    var reader = new FileReader();
    reader.onload = function () {
        $.ajax({
            type: 'POST',
            url: '~/setup-custom-ontology',
            data: {
                'ontologyData': reader.result,
                'csrfmiddlewaretoken': getCookie('csrftoken')
            }
        });
    };
    reader.readAsText(file);
}


function updateComponentColour(id) {
    document.getElementById(id).style.border = '1px solid #33FFB5';
    document.getElementById(id).setAttribute('complete', 'true');
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


function storeFileDataLocally(file, fileStorageName, lineBreakStorageName=null) {
    setRequestHeader(getCookie('csrftoken'));

    if (file.type == 'application/pdf') {
        var fileReader = new FileReader();
        fileReader.onload = function() {

            //Step 4:turn array buffer into typed array
            var typedarray = new Uint8Array(this.result);
    
            //Step 5:PDFJS should be able to read this
            PDFJS.getDocument(typedarray).then(function(pdf) {
                console.log(pdf);
            });
        };
        //Step 3:Read the file as ArrayBuffer
        fileReader.readAsArrayBuffer(file);
    } else {
        var reader = new FileReader();
        reader.onload = function () {
            localStorage.setItem(fileStorageName, reader.result);
            if (lineBreakStorageName) {
                localStorage.setItem(lineBreakStorageName, detectLineBreakType(reader.result));
            }
        };
        reader.readAsText(file);
    }
}
