$(document).ready(function () {
    setupSession(isNewSession=true);
});

function setupSession(isNewSession) {
    // Validate doc inputs
    validateSession();

    // Add doc, configs and annotations to display
    populateSession(isNewSession);

    // TODO Add event listerners

    // TODO get annotation suggestions

    // TODO update export url
}

function validateSession() {
    const configText = localStorage.getItem('configText');

    // Validate config file
    if (configText == null || configText.trim() == '') {
        alert('You need to provide a valid config file. Read the docs for more info.');
        window.location = '/setup';
    }

    // TODO further validation
}

function populateSession(isNewSession) {
    const openDocId = localStorage.getItem('openDocId');
    const docName = localStorage.getItem('docName' + openDocId);
    const docText = localStorage.getItem('docText' + openDocId);

    if (isNewSession) {
        setupScrollbars();
        setupNavigationMenu();

        // TODO Populate entities / attributes (initial only)
    }

    // TODO Update annotations

    // Update title, doc text and active nav item
    $('title')[0].innerText = docName + ' - Markup';
    $('#file-data').text(docText);
    $('#switch-file-dropdown').prop('selectedIndex', openDocId);
}

function setupNavigationMenu() {
    const openMethod = localStorage.getItem('openMethod');
    const docCount = localStorage.getItem('docCount');

    if (openMethod == 'multiple') {
        // Show additional options in navbar
        $('#move-to-previous-file').show();
        $('#move-to-next-file').show();
        $('#switch-file').show();

        // Populate dropdown in navbar
        for (let i = 0; i < docCount; i++) {
            $('<option/>', {
                'documentId': i,
                'text': localStorage.getItem('docName' + i)
            }).appendTo('#switch-file-dropdown');
        }
    }

    bindNavigationEvents();
}

function bindNavigationEvents() {
    const docCount = parseInt(localStorage.getItem('docCount'));

    // Navigate between docs via dropdown
    $('#switch-file-dropdown').change(function () {
        const updatedId = $('option:selected', this).attr('documentId');
        switchFile(updatedId);
    });

    // Navigate to next doc via arrow
    $('#move-to-next-file').click(function () {
        const openDocId = localStorage.getItem('openDocId');
        const updatedId = parseInt(openDocId) + 1;

        if (updatedId < docCount) switchFile(updatedId);
    });

    // Navigate to previous doc via arrow
    $('#move-to-previous-file').click(function () {
        const openDocId = localStorage.getItem('openDocId');
        const updatedId = parseInt(openDocId) - 1;

        if (updatedId >= 0) switchFile(updatedId);
    });
}

function switchFile(updatedId) {
    localStorage.setItem('openDocId', updatedId);
    setupSession(isInitialSetup=false);
    //switchSuggestionPanel();
    //getAnnotationSuggestions();
}

function setupScrollbars() {
    // Add scroll bar to each panel
    new PerfectScrollbar(document.getElementById('config-data'));
    new PerfectScrollbar(document.getElementById('file-data'));
    new PerfectScrollbar(document.getElementById('annotation-data'));
}







/*
function populateAnnotationList() {
const docCount = localStorage.getItem('docCount');

// Store parsed annotations for each doc
for (let docId = 0; docId <= docCount; docId++) {
    annotationList.push(parseAnnotations(docId));
}
}

function parseAnnotations(docId) {
const annText = localStorage.getItem('annotationText' + docId);
const annSentences = annText != null ? annText.split('\n') : null;

// Ensure a valid ann file exists
if (annText == null || annText.trim() == '') return [];

// Parse annotations from ann text
let parsedAnns = [];
let currentAnn = [];
for (let i = 0; i < annSentences.length; i++) {
    if (annSentences[i][0] == 'T' && currentAnn.length != 0) {
        parsedAnns.push(currentAnn);
        currentAnn = [];
    }

    if (annSentences[i][0] == 'T' || annSentences[i][0] == 'A') {
        currentAnn.push([annSentences[i] + '\n']);
    }
}
parsedAnns.push(currentAnn);

return parsedAnns;
}

function parseConfigs() {
const configText = localStorage.getItem('configText');
const configSents = configText.split('\n');

let attributes = [];
let entities = [];
let isEntity = false;

for (let i = 0; i < configSents.length; i++) {
    const sent = configSents[i];
    const sentSize = sent.length;

    if (sent == '') continue;

    // Add to relevant config list
    if (isEntity && sent[0] != '[' && !entities.includes(sent)) {
        entities.push(sent);
    } else if (sent[0] != '[') {
        attributes.push(sent);
    }

    // Check for category (e.g. [entities])
    if (sentSize >= 3 && sent[0] == '[' && sent[sentSize - 1] == ']') {
        // Check for entity category
        if (sent.slice(1, sentSize - 1).toLowerCase() == 'entities') {
            isEntity = true;
        } else if (isEntity) {
            isEntity = false;
        }
    }
}

return [entities, attributes];
}

function injectEntities(entityList) {
for (let i = 0; i < entityList.length; i++) {
    const entityName = entityList[i];
    const entityRow = $('<p/>', {'class': 'config-value-row'});

    $('<input/>', {
        'type': 'radio',
        'id': entityName + '-radio',
        'name': 'entities',
        'value': entityName + '-radio'
    }).appendTo(entityRow);
    
    $('<label/>', {
        'colorIndex': i,
        'class': 'config-label',
        'for': entityName + '-radio',
        'text': entityName,
        'css': {
            'background-color': colors[i]
        }
    }).appendTo(entityRow);
    
    $('#entities').append(entityRow);        
}
$('#entities').append('<br>');
}

function enableFileNavigation() {
const docCount = parseInt(localStorage.getItem('docCount'));

// Navigate between docs via dropdown
$('#switch-file-dropdown').change(function () {
    switchFile($('option:selected', this).attr('documentId'));
});

// Navigate to next doc via arrow
$('#move-to-next-file').click(function () {
    const updatedId = parseInt(localStorage.getItem('openDocId')) + 1;
    if (updatedId < docCount) switchFile(updatedId);
});

// Navigate to previous doc via arrow
$('#move-to-previous-file').click(function () {
    const updatedId = parseInt(localStorage.getItem('openDocId')) - 1;
    if (updatedId >= 0) switchFile(updatedId);
});
}
*/
