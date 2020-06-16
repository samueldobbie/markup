// Remove data from local storage to avoid being able to revisit page and see outdated information
var existingDisplayMode = localStorage.getItem('mode');
localStorage.clear();
if (existingDisplayMode != null) {
    localStorage.setItem('mode', existingDisplayMode);
}

$(document).ready(function () {
    var darkMode;

    // Sets inital color mode based on users stored preference (light or dark mode)
    toggleDisplayMode();

    // Allows users to switch between to light and dark mode
    function toggleDisplayMode() {
        // Checks if user has pre-set display preference
        if (localStorage.getItem('mode') == 'light') {
            type = 'light';
            darkMode = false;
        } else {
            type = 'dark';
            darkMode = true;
        }

        // Updates document elements based on display mode
        if (type == 'dark') {
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#333';
            document.getElementsByTagName('body')[0].style.color = '#fff';
            for (var i = 0; i < document.getElementsByClassName('option-container').length; i++) {
                document.getElementsByClassName('option-container')[i].style.color = 'white';
                document.getElementsByClassName('option-container')[i].style.backgroundColor = 'rgb(31, 31, 31);';
            }
        } else {
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#fff';
            document.getElementsByTagName('body')[0].style.color = 'black';
            for (var i = 0; i < document.getElementsByClassName('option-container').length; i++) {
                document.getElementsByClassName('option-container')[i].style.color = '#333';
                document.getElementsByClassName('option-container')[i].style.backgroundColor = 'rgba(240, 240, 240, 0.164)';
            }
        }
    }


    // Update display mode upon selection
    $('#darkMode').click(function () {
        if (!darkMode) {
            localStorage.setItem('mode', 'dark');
            toggleDisplayMode();
        } else {
            localStorage.setItem('mode', 'light');
            toggleDisplayMode();
        }
    });


    /*** Single document section ***/

    $('#single-document-selection').click(function () {
        $(".file-selection-container").fadeOut();

        sleep(500).then(() => {
            $(".single-document-selection-container").fadeIn();
        });

        // Store file selection type locally
        localStorage.setItem('documentOpenType', 'single');
    });


    $('#document-file-opener').change(function () {
        // Store file data locally
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
        document.getElementById('annotation-file-opener-container').style.border = '1px solid #333';
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
        if (selectedValue != 'Choose Pre-loaded') {
            // Setup ontology
            setupPreloadedOntology(selectedValue);

            // Change colour of component
            updateComponentColour('ontology-file-opener-container');
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
        if (selectedValue != 'Choose Pre-loaded') {
            // Setup ontology
            setupPreloadedOntology(selectedValue);

            // Change colour of component
            updateComponentColour('ontology-folder-opener-container');
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
});


function setupPreloadedOntology(selectedOntology) {
    $.ajax({
        type: 'POST',
        url: '~/setup-preloaded-ontology',
        data: {
            'selectedOntology': selectedOntology,
            'csrfmiddlewaretoken': getCookie('csrftoken')
        }
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


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
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


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function csrfSafeMethod(method) {
    // These HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


// Function to set Request Header with 'CSRFTOKEN'
function setRequestHeader(csrftoken){
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}
