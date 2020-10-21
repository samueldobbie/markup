$(document).ready(function () {
    setupSession(isNewSession=true);
});

function setupSession(isNewSession) {
    // Validate doc inputs
    validateSession();

    // Get existing annotations
    populateAnnotationList();

    // Add doc, configs and annotations to display
    populateSessionDisplay(isNewSession);

    // Predict and display annotation suggestions
    // predictAnnotations();

    // TODO update export url
    // updateExportUrl();
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

function populateSessionDisplay(isNewSession) {
    const openDocId = localStorage.getItem('openDocId');
    const docName = localStorage.getItem('docName' + openDocId);
    const docText = localStorage.getItem('docText' + openDocId);

    if (isNewSession) {
        setupScrollbars();
        setupNavigationMenu();
        setupConfigs();
    }

    // TODO Update annotations

    // Update title, doc text and active nav item
    $('title')[0].innerText = docName + ' - Markup';
    $('#file-data').text(docText);
    $('#switch-file-dropdown').prop('selectedIndex', openDocId);
}

function setupScrollbars() {
    // Add scroll bar to each panel
    new PerfectScrollbar(document.getElementById('config-data'));
    new PerfectScrollbar(document.getElementById('file-data'));
    new PerfectScrollbar(document.getElementById('annotation-data'));
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

    function switchFile(updatedId) {
        localStorage.setItem('openDocId', updatedId);
        setupSession(isInitialSetup=false);
        //switchSuggestionPanel();
        //getAnnotationSuggestions();
    }
}

function setupConfigs() {
    // Parse entity and attribute configs
    const configs = parseConfigs();
    entities = configs[0];
    attributes = parseAttributeValues(configs[1], entities);

    // Add entities to config panel
    injectEntities(entities);

    // Add attributes to config panel
    injectAttributes(attributes);

    // Add events when selecting entities
    bindConfigEvents();
}

function parseConfigs() {
    const configText = localStorage.getItem('configText');
    const configSents = configText.split('\n');

    let entities = [];
    let isEntity = false;
    let attributeSentences = [];

    for (let i = 0; i < configSents.length; i++) {
        const sent = configSents[i];
        const sentSize = sent.length;

        if (sent == '') continue;

        // Add to relevant config list
        if (isEntity && sent[0] != '[' && !entities.includes(sent)) {
            entities.push(sent);
        } else if (sent[0] != '[') {
            attributeSentences.push(sent);
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
    return [entities, attributeSentences];
}

function parseAttributeValues(attributeSentences, entities) {
    const attributes = [];
    const globalAttributes = [];

    for (let i = 0; i < attributeSentences.length; i++) {
        // Parse data within attribute sentence
        const sent = attributeSentences[i];
        const name = sent.split('Arg:')[0].trim();
        const entity = sent.split('Arg:')[1].split(',')[0].trim();
        const values = sent.split('Value:')[1].trim().split('|');

        // Produce list of global attributes
        if (entity.toLowerCase() == '<entity>' ) {
            globalAttributes.push([name, values]);
            continue;
        }

        // Add attribute to resulting array
        let attribute = [];
        attribute.push(name);
        attribute.push(entity);
        attribute = attribute.concat(values);
        attributes.push(attribute);

        // TODO re-introduce checkbox attribute parsing
    }

    // Add global attributes to each entity
    for (let i = 0; i < entities.length; i++) {
        for (let j = 0; j < globalAttributes.length; j++) {
            let attribute = [];
            attribute.push(globalAttributes[j][0]);
            attribute.push(entities[i]);
            attribute = attribute.concat(globalAttributes[j][1]);
            attributes.push(attribute);
        }
    }

    return attributes;
}

function injectEntities(entities) {
    for (let i = 0; i < entities.length; i++) {
        const name = entities[i];

        // Construct input field
        const row = $('<p/>', {'class': 'config-value-row'});

        $('<input/>', {
            'type': 'radio',
            'id': name + '-radio',
            'name': 'entities',
            'value': name + '-radio'
        }).appendTo(row);
        
        $('<label/>', {
            'colorIndex': i,
            'class': 'config-label',
            'for': name + '-radio',
            'text': name,
            'css': {
                'background-color': colors[i]
            }
        }).appendTo(row);
        
        // Add entity to config panel
        $('#entities').append(row);
    }
    $('#entities').append('<br>');
}

function injectAttributes(attributes) {
    for (let i = 0; i < attributes.length; i++) {
        if (attributes[i][1] == 'ClinicDate')
        console.log(attributes[i]);

        const id = attributes[i][0] + attributes[i][1];

        // Construct input field
        const row = $('<p/>');

        $('<input/>', {
            'type': 'text',
            'list': id,
            'placeholder': attributes[i][0],
            'attribute-for': attributes[i][1],
            'name': 'values',
            'class': 'dropdown input-field',
            'css': {
                'display': 'none'
            }
        }).appendTo(row);

        // Populate datalist with attribute options 
        const datalist = $('<datalist/>', { 'id': id, });
        for (let j = 2; j < attributes[i].length; j++) {
            $('<option/>', {
                'value': attributes[i][0] + ':' + attributes[i][j],
                'text': attributes[i][j]
            }).appendTo(datalist);
        }
        datalist.appendTo(row);

        // Add attribute to config panel
        row.appendTo('#attribute-dropdowns');        
    }
}

function bindConfigEvents() {
    let activeEntity = '';

    // Display relevant attributes for selected entity
    $('input[type=radio]').click(displayAttributes);

    // Show active entity
    $('input[type=radio]').click(styleSelectedEntity);

    function displayAttributes() {
        // Get selected entity
        const entity = $(this).context.id.substring(0, $(this).context.id.length - 6);

        // Show relevant attributes
        $('input[name=values]').hide();
        $('input[attribute-for="' + entity + '"').show();

        // TODO add checkboxes
    }
    
    function styleSelectedEntity() {
        resetEntityStyle();
    
        if (activeEntity == $(this).val()) {
            // Reset entity and attributes
            activeEntity = '';
            $('input[name=values]').val('');
            $('input[name=values]').hide();
        } else {
            // Style active entity
            activeEntity = $(this).val();    
            $(this).next().css({
                marginLeft: '5%',
                transition : 'margin 300ms'
            });
        }
    }
    
    function resetEntityStyle() {
        $('.config-label').css({
            marginLeft: '0',
            transition : 'margin 300ms'
        });
    }
}

const annotationList = [];
const entityList = [];
const colors = [
    '#7B68EE', '#FFD700', '#FFA500', '#DC143C', '#FFC0CB', '#00BFFF', '#FFA07A',
    '#C71585', '#32CD32', '#48D1CC', '#FF6347', '#8FE3B4', '#FF69B4', '#008B8B',
    '#FF0066', '#0088FF', '#44FF00', '#FF8080', '#E6DAAC', '#FFF0F5', '#FFFACD',
    '#E6E6FA', '#B22222', '#4169E1', '#C0C0C0', 
];
