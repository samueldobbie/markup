$(document).ready(function () {
    setupSession(isNewSession=true);
    $('#RunIAAAll').click(function () {
        runAllIAA();
    });
    $('#RunIAAAll2').click(function () {
        runIAAEntities();
    });
    $('#ViewDifferenceOnly').click(function () {
        ViewDifferenceOnly();
    });

    $('#ViewAllAnnotations').click(function () {
        setupSession(isNewSession=false);
        $('#ViewDifferenceOnly').show()
        $('#ViewAllAnnotations').hide()
    });
});

function setupSession(isNewSession) {
    validateSession();
    populateSessionDisplay(isNewSession);
    // updateExportDocument();
}

function validateSession() {
    const configText = localStorage.getItem('configText');
    const firstdocName0 = localStorage.getItem('firstdocName0');
    const seconddocName0 = localStorage.getItem('seconddocName0');

    // Validate config file
    if (configText == null || configText.trim() == '') {
        alert('You need to provide a valid config file. Read the docs for more info.');
        window.location = '/compare';
    }
    // TODO further validation
    // Vaidate that text one and text two is there
    if (firstdocName0 == null) {
        alert('You need to select a folder for the first annotations');
        window.location = '/compare';
    }

    if (seconddocName0 == null) {
        alert('You need to select a folder for the second annotations');
        window.location = '/compare';
    }
}

function populateSessionDisplay(isNewSession) {
    if (isNewSession) initializeSession();
    updateOngoingSession();
}

function initializeSession() {
    initializeIds();
    parseAndStoreAnnotations1();
    parseAndStoreAnnotations2();
    setupScrollbars();
    setupNavigationMenu();
    setupConfigs();
    //suggestDocumentAnnotations();
    // function here to send and display outputs from IAA
    IAA();
}

function initializeIds() {
    const docCount = localStorage.getItem('docCount');
    for (let i = 0; i <= docCount; i++) {
        entityIds.push(1);
        attributeIds.push(1);
    }
}
//probs need annotation 1 and annotation 2 -- will also make easier to spilt up on lhs
function parseAndStoreAnnotations1() {
    const docCount = localStorage.getItem('docCount');

    // Store parsed annotations for each doc
    for (let docId = 0; docId <= docCount; docId++) {
        annotations1.push(parseDocumentAnnotations1(docId));
    }
}

function parseAndStoreAnnotations2() {
    const docCount = localStorage.getItem('docCount');

    // Store parsed annotations for each doc
    for (let docId = 0; docId <= docCount; docId++) {
        annotations2.push(parseDocumentAnnotations2(docId));
    }
}
// need to double up for first and second or update the scrip
function parseDocumentAnnotations1(docId) {
    const annText = localStorage.getItem('firstannotationText' + docId);
    const annSentences = annText != null ? annText.split('\n') : null;

    // Ensure a valid ann file exists
    if (annText == null || annText.trim() == '') return [];

    // Parse annotations from ann text
    let parsedAnns1 = [];
    let currentAnn1 = [];
    for (let i = 0; i < annSentences.length; i++) {
        if (annSentences[i][0] == ENTITY_TAG && currentAnn1.length != 0) {
            parsedAnns1.push(currentAnn1);
            currentAnn1 = [];
        }

        if (annSentences[i][0] == ENTITY_TAG || annSentences[i][0] == ATTRIBUTE_TAG) {
            currentAnn1.push([annSentences[i] + '\n']);
        }
    }
    parsedAnns1.push(currentAnn1);

    return parsedAnns1;
}

function parseDocumentAnnotations2(docId) {
    const annText = localStorage.getItem('secondannotationText' + docId);
    const annSentences = annText != null ? annText.split('\n') : null;

    // Ensure a valid ann file exists
    if (annText == null || annText.trim() == '') return [];

    // Parse annotations from ann text
    let parsedAnns2 = [];
    let currentAnn2 = [];
    for (let i = 0; i < annSentences.length; i++) {
        if (annSentences[i][0] == ENTITY_TAG && currentAnn2.length != 0) {
            parsedAnns2.push(currentAnn2);
            currentAnn2 = [];
        }

        if (annSentences[i][0] == ENTITY_TAG || annSentences[i][0] == ATTRIBUTE_TAG) {
            currentAnn2.push([annSentences[i] + '\n']);
        }
    }
    parsedAnns2.push(currentAnn2);

    return parsedAnns2;
}

function setupScrollbars() {
    // Add scroll bar to each panel
    //new PerfectScrollbar($('#config-data')[0]);
    new PerfectScrollbar($('#file-data-1')[0]);
    new PerfectScrollbar($('#file-data-2')[0]);
    new PerfectScrollbar($('#annotation-data')[0]);
    //new PerfectScrollbar($('#annotation-data-file1')[0]);
   // new PerfectScrollbar($('#annotation-data-file2')[0]);
}

function setupNavigationMenu() {
    const openMethod = 'multiple';
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
                'text': localStorage.getItem('firstdocName' + i)
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
    setupSession(isNewSession=false);
    $('#ViewDifferenceOnly').show()
    $('#ViewAllAnnotations').hide()
    //suggestDocumentAnnotations();
}

function setupConfigs() {
    // Parse entity and attribute configs
    const configs = parseConfigs();
    entities = configs[0];
    attributes = parseAttributeValues(configs[1]);

    // Inject entities and attributes to config panel
    injectEntities();
    injectAttributes();

    // Enable configs selection events
    bindConfigEvents();
}

//config stuff
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
//config stuff
function parseAttributeValues(attributeSentences) {
    const attributes = [];
    const globalAttributes = [];

    for (let i = 0; i < attributeSentences.length; i++) {
        // Parse data within attribute sentence
        const sent = attributeSentences[i];
        const name = sent.split('Arg:')[0].trim();
        const entity = sent.split('Arg:')[1].split(',')[0].trim();
        const values = sent.split('Value:')[1].trim().split('|');

        // Produce array of global attributes
        if (entity.toLowerCase() == '<entity>' ) {
            globalAttributes.push([name, values]);
            continue;
        }
        // Add new attribute
        attributes.push([name, entity].concat(values));

        // TODO re-introduce checkbox attribute parsing
    }
    // Add global attributes
    return attributes.concat(parseGlobalAttributes(globalAttributes));
}
//config stuff
function parseGlobalAttributes(globalAttributes) {
    // Add global attributes to each entity
    const result = [];

    for (let i = 0; i < entities.length; i++) {
        for (let j = 0; j < globalAttributes.length; j++) {
            const name = globalAttributes[j][0];
            const entity = entities[i];
            const values = globalAttributes[j][1];
            result.push([name, entity].concat(values));
        }
    }
    return result;
}
//config stuff
function injectEntities() {
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
//config stuff
function injectAttributes() {
    for (let i = 0; i < attributes.length; i++) {
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
                'value': attributes[i][0] + ': ' + attributes[i][j],
                'text': attributes[i][j]
            }).appendTo(datalist);
        }
        datalist.appendTo(row);

        // Add attribute to config panel
        row.appendTo('#attribute-dropdowns');        
    }
}
//config stuff
function bindConfigEvents() {
    // Display relevant attributes for selected entity
    $('input[type=radio]').click(displayAttributes);

    // Show active entity
    $('input[type=radio]').click(styleSelectedEntity);
}

//config stuff
function displayAttributes() {
    // Get selected entity
    const entity = $(this).context.id.substring(0, $(this).context.id.length - 6);

    // Show relevant attributes
    $('input[name=values]').hide();
    $('input[attribute-for="' + entity + '"').show();
    // TODO add checkboxes
}
//config stuff
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
//config stuff
function resetEntityStyle() {
    $('.config-label').css({
        marginLeft: '0',
        transition : 'margin 300ms'
    });
}

function updateOngoingSession() {
    openNewDocument();
    displayDocumentAnnotations();
    bindAnnotationEvents(); //Need to have click for showing attributes
    IAA(); 
}

function IAA() {
    let docID = localStorage.getItem('openDocId');
    let variable = {
        'ann1': localStorage.getItem('firstannotationText' + docID),
        'ann2': localStorage.getItem('secondannotationText' + docID),
    };
    if (variable.ann1 == "" && variable.ann2 == "") {
        $('#precision').empty()
        $('#recall').empty()
        $('#f1Score').empty()
        // $('#cohensKappa').empty()
        $('#precision').append('<div id = "precision-score">Precision = N/A <div/>');
        $('#recall').append('<div id = "recall-score">Recall = N/A <div/>');
        $('#f1Score').append('<div id = "f1Score-score">F1-Score = N/A <div/>');
        // $('#cohensKappa').append('<div id = "CohensKappa-score">Cohen\'s Kappa = N/A <div/>');
    } else {
        $.ajax({
            type: 'POST',
            url: 'run-IAA/',
            data: {
                'ann1': variable.ann1,
                'ann2': variable.ann2,
            }, success: function(response) {
                let results = [];
                results = JSON.parse(response);

                if (results.length != 0) {
                    addIAAtoDisplay(results);
                }
            }
        });
    }
}

function runAllIAA() {
    let numberofDocs = parseInt(localStorage.getItem('docCount'));
    ann1 = [];
    ann2 = [];
    for (let i = 0; i < numberofDocs; i++) {
        ann1[i] = localStorage.getItem('firstannotationText' + i)
        ann2[i] = localStorage.getItem('secondannotationText' + i)
    }
    //console.log(ann1);
    $.ajax({
        type: 'POST',
        url: 'run-IAA-all/',
        data: {
                'annFiles1': ann1,
                'annFiles2': ann2,
        }, success: function(response) {
            let results = [];
            results = JSON.parse(response);

            if (results.length != 0) {
                //console.log(results);
                averageF1 = results[1];
                $('#AllCorpus').empty();// This also removes the button to run the command (which is many kind-of neat)
                $('#AllCorpus').append('<div id = "averageF1" style = "padding-top: 5px">Whole Corpus F1-score = ' + averageF1 +'<div/>');
            }
        }
    });
}

function runIAAEntities() {
    //let docID = localStorage.getItem('openDocId');
    let numberofDocs = parseInt(localStorage.getItem('docCount'));
    ann1 = [];
    ann2 = [];
    names = []
    for (let i = 0; i < numberofDocs; i++) {
        ann1[i] = localStorage.getItem('firstannotationText' + i)
        ann2[i] = localStorage.getItem('secondannotationText' + i)
        names[i] = localStorage.getItem('firstdocName' + i)
    }
    $.ajax({
        type: 'POST',
        url: 'run-IAA-entities/',
        data: {
                'annFiles1': ann1,
                'annFiles2': ann2,
                'letterNames': names,
        }, success: function(response) {
            let results = [];
            results = JSON.parse(response);

            if (results.length != 0) {
                console.log(results);
                var myWindow = window.open("", "myWindow"); 
                myWindow.document.write(results);            
            }
        }
    });
}

function ViewDifferenceOnly() {
    let docID = localStorage.getItem('openDocId');
    let variable = {
        'ann1': localStorage.getItem('firstannotationText' + docID),
        'ann2': localStorage.getItem('secondannotationText' + docID),
    };

    $.ajax({
        type: 'POST',
        url: 'view-Difference-Only/',
        data: {
            'ann1': variable.ann1,
            'ann2': variable.ann2,
        }, success: function(response) {
            let results = [];
            results = JSON.parse(response);

            if (results.length != 0) {
                anndiff1 = results[0]
                anndiff2 = results[1]

                parsedDiffAnns1 = parseDiffAnnotations(anndiff1)
                parsedDiffAnns2 = parseDiffAnnotations(anndiff2)

                // reset annotation panel
                openNewDocument();
                resetAnnotationPanel();

                // Add annotations
                for (let i = 0; i < parsedDiffAnns1.length; i++) {
                    const annotationData1 = getAnnotationData1(parsedDiffAnns1[i], i);
                    addAnnotationToDisplay1(annotationData1);
                }
                for (let i = 0; i < parsedDiffAnns2.length; i++) {
                    const annotationData1 = getAnnotationData2(parsedDiffAnns2[i], i);
                    addAnnotationToDisplay2(annotationData1);
                }

                $('.collapsible').on('click', function() {
                    const collapsible = $(this);
                    const content = collapsible.next();
            
                    collapsible.toggleClass('active');
                    if (collapsible.hasClass('active') ) {
                        content.slideDown(200);
                    } else {
                        content.slideUp(200);
                    };
                });


                // So they can edit - decided that they shouldn't be able to do this
                //$('.annotation-attribute').click(editAnnotation);

                // add button to return to original
                $('#ViewDifferenceOnly').hide()
                $('#ViewAllAnnotations').show()
            }
        }
    });
}

function parseDiffAnnotations(annText) {
    const annSentences = annText != null ? annText.split('\n') : null;

    // Ensure a valid ann file exists
    if (annText == null || annText.trim() == '') return [];

    // Parse annotations from ann text
    let parsedDiffAnns1 = [];
    let currentDiffAnn1 = [];
    for (let i = 0; i < annSentences.length; i++) {
        if (annSentences[i][0] == ENTITY_TAG && currentDiffAnn1.length != 0) {
            parsedDiffAnns1.push(currentDiffAnn1);
            currentDiffAnn1 = [];
        }

        if (annSentences[i][0] == ENTITY_TAG || annSentences[i][0] == ATTRIBUTE_TAG) {
            currentDiffAnn1.push([annSentences[i] + '\n']);
        }
    }
    parsedDiffAnns1.push(currentDiffAnn1);

    return parsedDiffAnns1;
}

function addIAAtoDisplay(results) {
    let precision = results[0];
    let recall = results[1];
    let f1Score = results[2];
    //let cohensKappa = results[3];
    $('#precision').empty()
    $('#recall').empty()
    $('#f1Score').empty()
    // $('#cohensKappa').empty()
    $('#precision').append('<div id = "precision-score">Precision = ' + precision +'<div/>');
    $('#recall').append('<div id = "recall-score">Recall = ' + recall +'<div/>');
    $('#f1Score').append('<div id = "f1Score-score">F1-Score = ' + f1Score + '<div/>');
    // $('#cohensKappa').append('<div id = "CohensKappa-score">Cohen\'s Kappa = ' + cohensKappa + '<div/>');
    
}

//needs to be doubled
function openNewDocument() {
    const openDocId = localStorage.getItem('openDocId');
    const docName = localStorage.getItem('firstdocName' + openDocId);
    const docText1 = localStorage.getItem('firstdocText' + openDocId);
    const docText2 = localStorage.getItem('seconddocText' + openDocId);

    // Update title, doc text and active nav item
    $('title')[0].innerText = docName + ' - Markup - Compare';
    $('#file-data-1').text(docText1);
    $('#file-data-2').text(docText2);
    $('#switch-file-dropdown').prop('selectedIndex', openDocId);
}


function displayDocumentAnnotations() {
    const openDocId = localStorage.getItem('openDocId');

    resetAnnotationPanel();

    // Parse and inject annotation data 
    for (let i = 0; i < annotations1[openDocId].length; i++) {
        const annotationData1 = getAnnotationData1(annotations1[openDocId][i], i);
        addAnnotationToDisplay1(annotationData1);
    }
//doubled here 
    for (let j = 0; j < annotations2[openDocId].length; j++) {
        const annotationData2 = getAnnotationData2(annotations2[openDocId][j], j);
        addAnnotationToDisplay2(annotationData2);
    }
    entityIds[openDocId]++;
    attributeIds[openDocId]++;

    window.getSelection().removeAllRanges();
}


function getAnnotationData1(annotation, annotationIndex) {
    const annotationData = {
        'attributeValues': [],
        'annotationIndex': annotationIndex
    }

    for (let i = 0; i < annotation.length; i++) {
        const rowComponents = annotation[i][0].split('\t');
        const rowData = rowComponents[1].split(' ');
        const tag = rowComponents[0][0];
        const tagId = parseInt(rowComponents[0][1]);

        if (tag == ENTITY_TAG) {
            addEntityData1(rowData, tagId, annotationData);
        } else if (tag == ATTRIBUTE_TAG) {
            addAttributeData(rowData, tagId, annotationData);
        }
    }
    return annotationData;
}

function getAnnotationData2(annotation, annotationIndex) {
    const annotationData = {
        'attributeValues': [],
        'annotationIndex': annotationIndex
    }

    for (let i = 0; i < annotation.length; i++) {
        const rowComponents = annotation[i][0].split('\t');
        const rowData = rowComponents[1].split(' ');
        const tag = rowComponents[0][0];
        const tagId = parseInt(rowComponents[0][1]);

        if (tag == ENTITY_TAG) {
            addEntityData2(rowData, tagId, annotationData);
        } else if (tag == ATTRIBUTE_TAG) {
            addAttributeData(rowData, tagId, annotationData);
        }
    }
    return annotationData;
}

function addEntityData1(entityData, tagId, annotationData) {
    // Increase global entity id based on no. of entities
    const openDocId = localStorage.getItem('openDocId');
    entityIds[openDocId] = Math.max(entityIds[openDocId], tagId);

    // Convert doc indicies (incl. linebreaks) to selection indicies
    const indicies = trueToHighlightIndicies1(
        parseInt(entityData[1]),
        parseInt(entityData[2])
    );

    // Include entity data
    annotationData['entityValue'] = entityData[0];
    annotationData['highlightStartIndex'] = indicies[0];
    annotationData['highlightEndIndex'] = indicies[1];
}

function addEntityData2(entityData, tagId, annotationData) {
    // Increase global entity id based on no. of entities
    const openDocId = localStorage.getItem('openDocId');
    entityIds[openDocId] = Math.max(entityIds[openDocId], tagId);

    // Convert doc indicies (incl. linebreaks) to selection indicies
    const indicies = trueToHighlightIndicies2(
        parseInt(entityData[1]),
        parseInt(entityData[2])
    );

    // Include entity data
    annotationData['entityValue'] = entityData[0];
    annotationData['highlightStartIndex'] = indicies[0];
    annotationData['highlightEndIndex'] = indicies[1];
}

function addAttributeData(attributeData, tagId, annotationData) {
    // Increase global attribute id based on no. of attributes
    const openDocId = localStorage.getItem('openDocId');
    attributeIds[openDocId] = Math.max(attributeIds[openDocId], tagId);

    // Include attribute data
    annotationData['attributeValues'].push(
        attributeData[0] + ': ' + attributeData[2]
    );
}

function resetAnnotationPanel() {
    // Empty annotation panel (excl. suggestions)
    const IAAAll = $('#AllCorpus').detach();
    const IAAAll2 = $('#AllCorpus2').detach();
    const ViewDifferenceOnlyButton = $('#ViewDifferenceOnlyButton').detach();
    const suggestions = $('#IAA').detach();
    //const IAAAll = $('#AllCorpus').detach();
    // $('#annotation-data-file1').empty().append(suggestions);
    // $('#annotation-data-file2').empty().append(suggestions);
    $('#annotation-data').empty().append(IAAAll2);
    $('#annotation-data').append(ViewDifferenceOnlyButton);
    $('#annotation-data').append(IAAAll);
    $('#annotation-data').append(suggestions);
    // Add section titles to annotation panel - dont need here
    //const annotator1 = '<div id = "annotations-1">Annotator 1<div/>'
    // $('#annotation-data-file1').append(annotator1);
    //const annotator2 = '<div id = "annotations-2">Annotator 2<div/>'
    // $('#annotation-data-file2').append(annotator2);

    for (let i = 0; i < entities.length; i++) {
        const id = entities[i] + '-section';
            // Create the tumorPresent annotation container
            // How to get name as text here?
        $('<div/>', {
            'id': id,
            'text': entities[i],
            'css': {
                'display': 'none',
                'padding': '5px',
                'padding-top': '0px',
                'padding-left': '0px',
            }
        }).appendTo('#annotation-data');
        // add annotator 1 to it
        $('#' + id).append('<div id = "' + entities[i] +'-annotations-1" style= "padding: 5px;">Annotator 1 <div/>');
        // add dropdown when clicked to it
        $('<p/>', {
            'class': 'section-title',
            'text': entities[i]
        }).appendTo('<div id = "' + entities[i] +'-annotations-1">Annotator 1<div/>');

        $('#' + id).append('<div id = "' + entities[i] +'-annotations-2" style= "padding: 5px;">Annotator 2<div/>');

        $('<p/>', {
            'class': 'section-title',
            'text': entities[i]
        }).appendTo('<div id = "' + entities[i] +'-annotations-2">Annotator 2<div/>');
    }

    // for (let i = 0; i < entities.length; i++) {
    //     const id = entities[i] + '-section-2';

    //     $('<div/>', {
    //         'id': id,
    //         'css': {
    //             'display': 'none'
    //         }
    //     }).appendTo('#annotation-data-file2');

    //     $('<p/>', {
    //         'class': 'section-title',
    //         'text': entities[i]
    //     }).appendTo('#' + id);
    // }

    // Empty offsets
    offsets1.length = 0;
    offsets2.length = 0;
}
//adds to text
//need to get annotationData1 from first file and annotationData2 from second
function addAnnotationToDisplay1(annotationData1) {
    // Highlight text span within doc
    selectAnnotationTextSpan1(
        annotationData1['highlightStartIndex'],
        annotationData1['highlightEndIndex']
    );

    // Inject annotation at selected text span
    injectAnnotation1(
        annotationData1['entityValue'],
        annotationData1['attributeValues'],
        annotationData1['annotationIndex']
    );
}

function addAnnotationToDisplay2(annotationData2) {
    // Highlight text span within doc
    selectAnnotationTextSpan2(
        annotationData2['highlightStartIndex'],
        annotationData2['highlightEndIndex']
    );

    // Inject annotation at selected text span
    injectAnnotation2(
        annotationData2['entityValue'],
        annotationData2['attributeValues'],
        annotationData2['annotationIndex']
    );
}

function selectAnnotationTextSpan1(startIndex, endIndex) {
    if (document.createRange && window.getSelection) {
        selectDocumentRange1(startIndex, endIndex);
    } else if (document.selection && document.body.createTextRange) {
        selectTextRange1(startIndex, endIndex);
    }
}

function selectAnnotationTextSpan2(startIndex, endIndex) {
    if (document.createRange && window.getSelection) {
        selectDocumentRange2(startIndex, endIndex);
    } else if (document.selection && document.body.createTextRange) {
        selectTextRange2(startIndex, endIndex);
    }
}


function selectDocumentRange1(startIndex, endIndex) {
    const range = getSelectionRange1(startIndex, endIndex);
    setSelectionRange1(range);
}

function selectDocumentRange2(startIndex, endIndex) {
    const range = getSelectionRange2(startIndex, endIndex);
    setSelectionRange2(range);
}
//doubled - commented out for now
function getSelectionRange1(startIndex, endIndex) {
    const docHtml = $('#file-data-1')[0];
    //const docHtml2 = $('#file-data-2')[0];
    const range = document.createRange();
    const textNodes1 = getTextNodes(docHtml);
    //const textNodes2 = getTextNodes(docHtml2);

    // Initialize range
    range.selectNodeContents(docHtml);

    // Update start and end of range
    let isStartOfSelection = false;
    let startCharIndex = 0;
    let endCharIndex = 0;
    for (let i = 0; i < textNodes1.length; i++) {
        const textNode = textNodes1[i];
        
        endCharIndex = startCharIndex + textNode.length;

        // Set start of range
        if (!isStartOfSelection && startIndex >= startCharIndex && startIndex < endCharIndex) {
            range.setStart(textNode, startIndex - startCharIndex);
            isStartOfSelection = true;
        }

        // Set end of range
        if (isStartOfSelection && endIndex <= endCharIndex) {
            range.setEnd(textNode, endIndex - startCharIndex);
            break;
        }
        startCharIndex = endCharIndex;
    }
    return range;
}

function getSelectionRange2(startIndex, endIndex) {
    const docHtml = $('#file-data-2')[0];
    //const docHtml2 = $('#file-data-2')[0];
    const range = document.createRange();
    const textNodes1 = getTextNodes(docHtml);
    //const textNodes2 = getTextNodes(docHtml2);

    // Initialize range
    range.selectNodeContents(docHtml);

    // Update start and end of range
    let isStartOfSelection = false;
    let startCharIndex = 0;
    let endCharIndex = 0;
    for (let i = 0; i < textNodes1.length; i++) {
        const textNode = textNodes1[i];
        
        endCharIndex = startCharIndex + textNode.length;

        // Set start of range
        if (!isStartOfSelection && startIndex >= startCharIndex && startIndex < endCharIndex) {
            range.setStart(textNode, startIndex - startCharIndex);
            isStartOfSelection = true;
        }

        // Set end of range
        if (isStartOfSelection && endIndex <= endCharIndex) {
            range.setEnd(textNode, endIndex - startCharIndex);
            break;
        }
        startCharIndex = endCharIndex;
    }
    return range;
}

function getTextNodes(node) {
    const nodes = [];

    if (node.nodeType == Node.TEXT_NODE) {
        nodes.push(node);
        return nodes;
    }

    const childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
        nodes.push.apply(nodes, getTextNodes(childNodes[i]));
    }
    return nodes;
}

function setSelectionRange1(range) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function setSelectionRange2(range) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function selectTextRange1(startIndex, endIndex) {
    const docHtml = $('#file-data-1')[0];
    const range = document.body.createTextRange();
    range.moveToElementText(docHtml);
    range.collapse(true);
    range.moveStart('character', startIndex);
    range.moveEnd('character', endIndex);
    range.select();
}

function selectTextRange2(startIndex, endIndex) {
    const docHtml = $('#file-data-2')[0];
    const range = document.body.createTextRange();
    range.moveToElementText(docHtml);
    range.collapse(true);
    range.moveStart('character', startIndex);
    range.moveEnd('character', endIndex);
    range.select();
}

function injectAnnotation1(entityValue, attributeValues, annotationIndex) {
    const selection = window.getSelection().toString();
    const entityColor = getEntityColor(entityValue);

    // Display annotation at selection range
    //doubled this
    injectInlineAnnotation1(annotationIndex, selection, entityColor);
    injectPanelAnnotation1(entityValue, attributeValues, annotationIndex, selection, entityColor, false);

    // Keep track of offets for each annotation
    offsets1.push([annotationIndex, entityValue, attributeValues, selection]);
}

function injectAnnotation2(entityValue, attributeValues, annotationIndex) {
    const selection = window.getSelection().toString();
    const entityColor = getEntityColor(entityValue);

    // Display annotation at selection range
    //doubled this
    injectInlineAnnotation2(annotationIndex, selection, entityColor);
    injectPanelAnnotation2(entityValue, attributeValues, annotationIndex, selection, entityColor, false);

    // Keep track of offets for each annotation
    offsets2.push([annotationIndex, entityValue, attributeValues, selection]);
}


function getEntityColor(entity) {
    const entityLabels = $('label');
    for (let i = 0; i < entityLabels.length; i++) {
        const entityLabel = entityLabels[i].innerText;

        if (entityLabel == entity) {
            const colorIndex = entityLabels[i].getAttribute('colorIndex');
            return colors[colorIndex];
        }
    }
}
//-aid1 and -aid2 needed 
function injectInlineAnnotation1(annotationIndex, selection, entityColor) {
    // Construct inline annotation
    const annotationHTML = $('<span/>', {
        'class': 'annotation inline-annotation',
        'id': 'first-' + annotationIndex + '-aid',
        'text': selection,
        'css': {
            'background-color': entityColor,
            'color': 'black'
        }
    }).prop('outerHTML');

    // Add inline annotation
    // Where annotations are added to text
    $('#file-data-1').attr('contenteditable', 'true');
    document.execCommand('insertHTML', false, annotationHTML);
    $('#file-data-1').attr('contenteditable', 'false');
}

function injectInlineAnnotation2(annotationIndex, selection, entityColor) {
    // Construct inline annotation
    const annotationHTML = $('<span/>', {
        'class': 'annotation inline-annotation',
        'id': 'second-' + annotationIndex + '-aid',
        'text': selection,
        'css': {
            'background-color': entityColor,
            'color': 'black'
        }
    }).prop('outerHTML');

    // Add inline annotation
    // Where annotations are added to text
    $('#file-data-2').attr('contenteditable', 'true');
    document.execCommand('insertHTML', false, annotationHTML);
    $('#file-data-2').attr('contenteditable', 'false');
}

function injectPanelAnnotation1(entityValue, attributeValues, annotationIndex, selection, entityColor, isSuggestion) {
    let sectionId1 = '#' + entityValue;
    // Show section title
    if (!isSuggestion) {
        sectionId1 += '-annotations-1';
        $('#' + entityValue).show()
    }
    let originalcontainer = '#' + entityValue + '-section';
    $(originalcontainer).show()
    // Add annotation with annotation text
    constructPanelAnnotation1(annotationIndex, selection, attributeValues, entityColor, isSuggestion).appendTo(sectionId1);

    // Add dropdown with annotation values
    constructContentContainer(annotationIndex, attributeValues, isSuggestion).appendTo(sectionId1);

}

function injectPanelAnnotation2(entityValue, attributeValues, annotationIndex, selection, entityColor, isSuggestion) {
    let sectionId2 = '#' + entityValue;
    // Show section title

    if (!isSuggestion) {
        sectionId2 += '-annotations-2';
        $(sectionId2).show()
    }
    let originalcontainer = '#' + entityValue + '-section';;
    $(originalcontainer).show()
    // Add annotation with annotation text
    constructPanelAnnotation2(annotationIndex, selection, attributeValues, entityColor, isSuggestion).appendTo(sectionId2);

    // Add dropdown with annotation values
    constructContentContainer(annotationIndex, attributeValues, isSuggestion).appendTo(sectionId2);

}

function constructPanelAnnotation1(annotationIndex, selection, attributeValues, entityColor, isSuggestion) {
    const annotation = $('<p/>', {
        'class': 'annotation displayed-annotation collapsible',
        'id': "first-" + annotationIndex,
        'text': selection,
        'css': {
            'background-color': entityColor,
            'color': '#1A1E24'
        }
    });

    if (isSuggestion) {
        // Add attribute values to annotation
        for (let i = 0; i < attributeValues.length; i++) {
            const kv = attributeValues[i].split(': ');
            $(annotation).attr(kv[0], kv[1]);
        }
        $(annotation).addClass('suggestion');
    } else {
        const openDocId = localStorage.getItem('openDocId');
        $(annotation).attr('output-id', ENTITY_TAG + entityIds[openDocId]);
    }

    return annotation;
}

function constructPanelAnnotation2(annotationIndex, selection, attributeValues, entityColor, isSuggestion) {
    const annotation = $('<p/>', {
        'class': 'annotation displayed-annotation collapsible',
        'id': "second-" + annotationIndex,
        'text': selection,
        'css': {
            'background-color': entityColor,
            'color': '#1A1E24'
        }
    });

    if (isSuggestion) {
        // Add attribute values to annotation
        for (let i = 0; i < attributeValues.length; i++) {
            const kv = attributeValues[i].split(': ');
            $(annotation).attr(kv[0], kv[1]);
        }
        $(annotation).addClass('suggestion');
    } else {
        const openDocId = localStorage.getItem('openDocId');
        $(annotation).attr('output-id', ENTITY_TAG + entityIds[openDocId]);
    }

    return annotation;
}

function constructContentContainer(annotationIndex, attributeValues, isSuggestion) {
    const contentContainer = $('<div/>', {
        'class': 'content',
        'style': 'display: none;',
    });

    if (isSuggestion) {
        $(contentContainer).attr('for', annotationIndex);
        $(contentContainer).addClass('suggestion-content');
    } else {
        $(contentContainer).attr('for', 'annotation-' + annotationIndex);
    }

    const attributeClass = isSuggestion ? 'suggestion-attribute' : 'annotation-attribute';
    for (let i = 0; i < attributeValues.length; i++) {
        $('<p/>', {
            'class': 'attribute ' + attributeClass,
            'text': attributeValues[i]
            //'onClick': 'editAnnotation()' // No editing availible, code commented out, wouldn't want to be able to change just compare
        }).appendTo(contentContainer);
    }

    // COMMENTED OUT - DONT WANT TO BE ABLE TO EDIT(DELETE) ANNOTATIONS IN THIS VIEW
    //Container for annotation options
    // const optionContainer = $('<div/>', {
    //     'class': 'annotation-option-container',
    //     'annotation-id': annotationIndex,

    // }).appendTo(contentContainer);
    
    // // Create and add buttons
    // let buttonTypes = isSuggestion ? ['reject', 'accept'] : ['delete'];
    // for (let i = 0; i < buttonTypes.length; i++) {
    //     constructButton(
    //         buttonTypes[i],
    //         annotationIndex
    //     ).appendTo(optionContainer);
    // }

    return contentContainer;
}

function constructButton(type, annotationIndex) {
    // Create new button
    const button = $('<a/>', {
        'class': 'annotation-icon ' + type + '-icon',
        'annotation-id': annotationIndex,
        'onClick': type + 'Annotation(this)'
    })

    // Add icon to button
    const icon = $('<i/>', {'class': 'fas'});
    if (type == 'accept') {
        $(icon).addClass(' fa-check');
    } else {
        $(icon).addClass(' fa-trash');
    }
    icon.appendTo(button);

    return button;
}
// THIS WORK BUT DECIDED THEY SHOULDN'T BE ABLE TO USE IT
// function editAnnotation() {
//     const name = $(this).text().split(': ')[0].trim();
//     const value = $(this).text().split(': ')[1].trim();
//     const updatedValue = prompt('Updated value (' + name + ')', value);

//     if (updatedValue && updatedValue.trim() != '') {
//         $(this).text(name + ': ' + updatedValue);
//     }

//     const forId = $(this).parent().attr('for');
//     $('#' + forId).attr(name, updatedValue);
// }

// function deleteAnnotation(element) {
//     // Remove annotation and offset
//     const openDocId = localStorage.getItem('openDocId');
//     const annotationId = parseInt($(element).attr('annotation-id'));

//     // Finds correct annotation index and remove
//     for (let i = 0; i < offsets.length; i++) {
//         if (offsets[i][0] == annotationId) {
//             annotations1[openDocId].splice(i, 1);
//             offsets.splice(i, 1);
//             break;
//         }
//     }
//     // Update session
//     setupSession(isNewSession=false);
// }

function trueToHighlightIndicies1(trueStartIndex, trueEndIndex) {
    /*
    Convert true indicies (incl. newlines) to highlight indicies
    (excl. newlines) based on doc type (LF or CRLF)
    */
    const docText = getNormalisedDocText1();
    return getHighlightIndicies(docText, trueStartIndex, trueEndIndex);
}

function trueToHighlightIndicies2(trueStartIndex, trueEndIndex) {
    /*
    Convert true indicies (incl. newlines) to highlight indicies
    (excl. newlines) based on doc type (LF or CRLF)
    */
    const docText = getNormalisedDocText2();
    return getHighlightIndicies(docText, trueStartIndex, trueEndIndex);
}

function getNormalisedDocText1() {
    /*
    Return document text where newline chars have been replaced
    by some number of regular chars based on the doc type (LF or CRLF)
    */
    const openDocId = localStorage.getItem('openDocId');
    const lineBreakType = localStorage.getItem('firstlineBreakType' + openDocId);

    const lineBreakValue = (lineBreakType == 'windows') ? 2 : 1;

    let docText = '';

    for (let i = 0; i < $('#file-data-1').children().length; i++) {
        const node = $('#file-data-1').children()[i];
        const isSpan = $(node).is('span');

        if (node.nodeType == Node.TEXT_NODE) {
            docText += node.textContent;
        } else if (!isSpan) {
            docText += '_'.repeat(lineBreakValue);
        } else {
            for (let j = 0; j < node.innerText.length; j++) {
                if (node.innerText[j] == '\n') {
                    docText += '*'.repeat(lineBreakValue)
                } else {
                    docText += node.innerText[j];
                }
            }
        }
    }
    return docText;
}

function getNormalisedDocText2() {
    /*
    Return document text where newline chars have been replaced
    by some number of regular chars based on the doc type (LF or CRLF)
    */
    const openDocId = localStorage.getItem('openDocId');
    const lineBreakType = localStorage.getItem('secondlineBreakType' + openDocId);

    const lineBreakValue = (lineBreakType == 'windows') ? 2 : 1;

    let docText = '';

    for (let i = 0; i < $('#file-data-2').children().length; i++) {
        const node = $('#file-data-2').children()[i];
        const isSpan = $(node).is('span');

        if (node.nodeType == Node.TEXT_NODE) {
            docText += node.textContent;
        } else if (!isSpan) {
            docText += '_'.repeat(lineBreakValue);
        } else {
            for (let j = 0; j < node.innerText.length; j++) {
                if (node.innerText[j] == '\n') {
                    docText += '*'.repeat(lineBreakValue)
                } else {
                    docText += node.innerText[j];
                }
            }
        }
    }
    return docText;
}

function getHighlightIndicies(docText, trueStartIndex, trueEndIndex) {
    let highlightStartIndex = trueStartIndex;
    let highlightEndIndex = trueEndIndex;

    for (let i = 0; i < trueEndIndex; i++) {
        if (i > trueStartIndex && docText[i] == '_') {
            highlightEndIndex--;
        } else if (i <= trueStartIndex && (docText[i] == '_' || docText == '*')) {
            highlightStartIndex--;
            highlightEndIndex--;
        }
    }
    return [highlightStartIndex, highlightEndIndex];
}

// DOESN't do anything now
function highlightToTrueIndicies(preSelectionLength, selectionLength) {
    /*
    Convert highlight indicies (excl. newlines) to true indicies
    (incl. newlines) based on doc type (LF or CRLF)
    */

    // docText 1 and docText2 needed...

    const openDocId = localStorage.getItem('openDocId');
    const lineBreakType = localStorage.getItem('lineBreakType' + openDocId);
    const lineBreakValue = (lineBreakType == 'windows') ? 2 : 1;
    const docText = $('#file-data').text();

    let trueStartIndex = 0;
    let trueEndIndex = 0;
    for (let i = 0; i < docText.length; i++) {
        if (preSelectionLength == 0) {
            while (docText[i] == '\n') {
                trueStartIndex++;
                i++;
            }

            trueEndIndex = trueStartIndex;
            while (selectionLength > 0) {
                if (docText[i] == '\n') {
                    trueEndIndex++;
                } else {
                    selectionLength--;
                    trueEndIndex++;
                }
                i++;
            }
            break;
        } else if (docText[i] == '\n') {
            trueStartIndex++;
        } else {
            preSelectionLength--;
            trueStartIndex++;
        }
    }
    return [trueStartIndex, trueEndIndex];
}

function bindAnnotationEvents() {
//     resetAnnotationEvents();

//     // Update colour of highlighted text
//     $('#file-data-1').mouseup(selectAnnotationText);
//     $('#file-data-2').mouseup(selectAnnotationText);

    // Update active annotation in file panel
    $('#file-data-1').mouseover(function (e) {
        updateAnnotationOnHover(e.target.id, 'file-data-1');
    });

    $('#file-data-2').mouseover(function (e) {
        updateAnnotationOnHover(e.target.id, 'file-data-2');
    });

    // Update active annotation in annotation panel
    $('#annotation-data').mouseover(function (e) {
        updateAnnotationOnHover(e.target.id, 'annotation-data');
    });

//     // Suggest ontology matches based on selected text 
//     // $('#file-data').mouseup({
//     //     'type': 'highlight'
//     // }, suggestOntologyMapping);

//     // // Suggest ontology matches based on search text
//     // $('#ontology-search-input-field').on('input', {
//     //     'type': 'search'
//     // }, suggestOntologyMapping);

//     // Prompt user to save annotations before exiting session
//     $('a[class=nav-item]').click(function() {
//         $(window).bind('beforeunload', function() {
//             return 'Changes you made may not be saved.';
//         });
//     });

    // Add event to collapsibles
    $('.collapsible').on('click', function() {
        const collapsible = $(this);
        const content = collapsible.next();

        collapsible.toggleClass('active');
        if (collapsible.hasClass('active') ) {
            content.slideDown(200);
        } else {
            content.slideUp(200);
        };
    });



//     // $('.suggestion').mouseenter(function () {
//     //     // Restore original doc event
//     //     const currentHTML = $('#file-data').html();
//     //     $('.suggestion').mouseleave(function () {
//     //         $('#file-data').html(currentHTML);
//     //     });

//     //     // Highlight suggestion text in yellow
//     //     highlightSuggestionText($(this).text());
//     // });

//     // $('.suggestion-attribute').click(editSuggestion);
}

// function highlightSuggestionText(suggestionText) {
//     const openDocId = localStorage.getItem('openDocId');
//     const docText = localStorage.getItem('docText' + openDocId);
//     const updatedHTML = $('#file-data').text(docText).html();
//     const suggestionIndex = updatedHTML.indexOf(suggestionText);

//     // Highlight suggestion in html
//     if (suggestionIndex > -1) { 
//         $('#file-data').html(
//             updatedHTML.substring(0, suggestionIndex) +
//             '<span class="highlighted-suggestion">' + suggestionText + '</span>' +
//             updatedHTML.substring(suggestionIndex + suggestionText.length)
//         );
//     }
// }

// function selectAnnotationText() {
//     // Change colour of text highlighted by the user
//     if (window.getSelection() == '') {
//         resetSelectedText();
//     } else {
//         updatedSelectedText();
//     }
// }

// function resetSelectedText() {
//     // Reset session
//     $('#highlighted').replaceWith(function () { return this.innerHTML; });            
//     if ($('#highlighted')[0] != null) {
//         setupSession(isNewSession=false);
//     }
// }

// function updatedSelectedText() {
//     // Get selected text and range
//     const selectionText = window.getSelection().toString();
//     const selectionRange = window.getSelection().getRangeAt(0);

//     // Get range of text before selection
//     const preSelectionRange = selectionRange.cloneRange();
//     preSelectionRange.selectNodeContents(document.getElementById('file-data'));
//     preSelectionRange.setEnd(selectionRange.startContainer, selectionRange.startOffset);

//     // Get length of selection and pre-text (excl. newline chars)
//     const selectionLength = selectionRange.toString().replace(/\n/g, '').length;
//     const preSelectionLength = preSelectionRange.toString().replace(/\n/g, '').length;

//     // Colour-highlight selected text
//     document.getElementById('file-data').contentEditable = 'true';
//     document.execCommand('insertHTML', false, '<span id="highlighted">' + selectionText + '</span>');
//     document.getElementById('file-data').contentEditable = 'false';

//     bindManualAnnotationEvent(
//         selectionText,
//         selectionLength,
//         preSelectionLength
//     );
// }

// function bindManualAnnotationEvent(selectionText, selectionLength, preSelectionLength) {
//     // Reset manual annotation event
//     $('#add-annotation').unbind();

//     // Enable adding of manual annotation to selection
//     $('#add-annotation').click({
//         'selectionText': selectionText,
//         'selectionLength': selectionLength,
//         'preSelectionLength': preSelectionLength
//     }, addManualAnnotation);
// }

// function addManualAnnotation(event) {
//     // Annotation-specific data
//     const selectionText = event.data.selectionText;
//     const selectionLength = event.data.selectionLength;
//     const preSelectionLength = event.data.preSelectionLength;

//     // Check whether selection is valid
//     if (isValidAnnotation(selectionText)) {
//         constructManualAnnotation(selectionText, selectionLength, preSelectionLength);
//         resetAnnotationSelections();
//         setupSession(isNewSession=false);
//     }
// }

// function isValidAnnotation(selectionText) {
//     // Check whether a valid span of text has been selected
//     let validSelection = selectionText != null && selectionText.trim() != '';

//     // Ensure an entity has been selected
//     let validEntity = false;
//     const entityRadiobuttons = $('input[name=entities]');
//     for (let i = 0; i < entityRadiobuttons.length; i++) {
//         if (entityRadiobuttons[i].checked) {
//             validEntity = true;
//             break;
//         }
//     }
//     // Display error messages
//     if (!validEntity) alert('You must select an entity.');
//     if (!validSelection) alert('You must highlight a span of text.');

//     return validEntity && validSelection;
// }

// function constructManualAnnotation(selectionText, selectionLength, preSelectionLength) {   
//     const annotation = [];

//     // Convert highlight indicies to CRLF / LF indicies
//     const indicies = highlightToTrueIndicies(preSelectionLength, selectionLength);
//     const startIndex = indicies[0];
//     const endIndex = indicies[1];

//     // Add formatted entity
//     const formattedEntity = getFormattedEntity(
//         selectionText,
//         startIndex,
//         endIndex
//     );
//     annotation.push([formattedEntity]);

//     // Add formatted attributes
//     const formattedAttributes = getFormattedAttributes();
//     for (let i = 0; i < formattedAttributes.length; i++) {
//         annotation.push([formattedAttributes[i]]);
//     }

//     // Add formatted annotation to global array
//     addFormattedAnnotation(annotation, startIndex);

//     // TODO feedback manual annoation into models 
//     // updateSuggestionModels(entityValue, selectionText, 'positive');      
// }

// function getFormattedEntity(selectionText, startIndex, endIndex) {
//     // Construct formatted entity
//     const openDocId = localStorage.getItem('openDocId');
//     const id = $('input[type=radio]:checked')[0].id;
//     const entity = id.substring(0, id.length - 6);
//     return `T${entityIds[openDocId]++}\t${entity} ${startIndex} ${endIndex}\t${normaliseText(selectionText)}\n`;
// }

// function getFormattedAttributes() {
//     const result = [];

//     // Construct attributes from checkboxes
//     const checkboxes = $('input[type=checkbox]:checked');
//     for (let i = 0; i < checkboxes.length; i++) {
//         const key = checkboxes[i].id;
//         result.push(formatAttribute('checkbox', key));
//     }

//     // Construct attributes from dropdowns
//     const attributeDropdowns = $('input[name=values]');
//     for (let i = 0; i < attributeDropdowns.length; i++) {
//         if (attributeDropdowns[i].value != '') {
//             const kv = getKeyValuePair(attributeDropdowns[i]);
//             result.push(formatAttribute('dropdown', kv[0], kv[1]));
//         }
//     }

//     // Construct attributes from ontology mapping
//     const ontologyOption = $('#match-list')[0].options[$('#match-list')[0].selectedIndex];
//     if (isValidOntologyMapping(ontologyOption.text)) {
//         const ontologyCode = ontologyOption.title.split(' ')[1];
//         result.push(formatAttribute('ontology', 'CUIPhrase', ontologyOption.text));
//         result.push(formatAttribute('ontology', 'CUI', ontologyCode));
//     }

//     return result;
// }

// function formatAttribute(type, key, value=null) {
//     const openDocId = localStorage.getItem('openDocId');
//     if (type == 'checkbox') {
//         return `A${attributeIds[openDocId]++}\t${normaliseText(key)} T${entityIds[openDocId] - 1}\n`;
//     }
//     return `A${attributeIds[openDocId]++}\t${normaliseText(key)} T${entityIds[openDocId] - 1} ${normaliseText(value)}\n`;
// }

// function normaliseText(raw) {
//     // Replace spaces with hyphens
//     if (!raw) return null;
//     return raw.split(/<br>|\s|\n/).join('-');
// }

// function getKeyValuePair(dropdown) {
//     let pair = dropdown.value.split(': ');
//     if (pair.length == 1) {
//         pair = [dropdown.getAttribute('placeholder'), pair[0]];
//     }
//     return pair;
// }

// function isValidOntologyMapping(ontologyText) {
//     const words = ontologyText.split(' ');
//     return !((
//         words[words.length - 2] == 'matches' &&
//         words[words.length - 1] == 'found'
//     ) || ontologyText == 'No match');
// }

// function addFormattedAnnotation(annotation, startIndex) {
//     const openDocId = localStorage.getItem('openDocId');

//     if (annotations1[openDocId].length == 0) {
//         annotations1[openDocId].push(annotation);
//     } else {        
//         // Add annotation in order as it appears in doc
//         for (let i = 0; i < annotations1[openDocId].length; i++) {
//             if (startIndex < parseInt(annotations1[openDocId][i][0][0].split(' ')[1])) {
//                 annotations1[openDocId].splice(i, 0, annotation);
//                 return;
//             }

//             if (i == annotations1[openDocId].length - 1) {
//                 annotations1[openDocId].push(annotation);
//                 return;
//             }
//         }
//     }
// }

// function updateSuggestionModels(entityValue, selectionText, classification) {
//     const classLabel = classification == 'positive' ? 1 : 0;
//     if (entityValue.toLowerCase() == 'prescription') {
//         teachActiveLearner(selectionText, classLabel);
//     }
//     // TODO allow more than prescriptions to be added
//     // TODO update RNN
// }

// function resetAnnotationSelections() {
//     // Removes selection of newly-annotated text
//     window.getSelection().removeAllRanges();

//     // Reset all selections
//     $('input[name=values]').css('display', 'none');
//     $('input[name=values]').val('');
//     $('#config-data')[0].scrollTop = 0;
//     $('#match-list')[0].options.length = 1;
//     $('#match-list')[0].options[0].innerText = 'No match';
//     $('#ontology-search-input-field').val('');
//     removeEntityStyling();
//     activeEntity = '';
// }

// function suggestOntologyMapping(event) {
//     // Get relevant matches from defined ontology
//     const queryType = event.data.type;
//     const dropdown = $('#match-list')[0];
//     const inputText = getInputText(queryType);

//     // Ignore invalid inputs
//     if (inputText == '' || inputText.split(' ').length > 8) return;

//     displayOntologySuggestions(dropdown, inputText);
// }

// function getInputText(queryType) {
//     if (queryType == 'highlight') {
//         if (window.getSelection().anchorNode != null)
//             return window.getSelection().anchorNode.textContent.trim();
//     } else {
//         return $('#ontology-search-input-field').val().trim();
//     }
//     return '';
// }

// function displayOntologySuggestions(dropdown, inputText) {
//     $.ajax({
//         type: 'GET',
//         url: 'suggest-cui/',
//         async: false,
//         data: {inputText: inputText},
//         success: function (response) {
//             dropdown.options.length = 0;
//             populateOntologyDropdown(JSON.parse(response), dropdown);
//         }
//     });
// }

// function populateOntologyDropdown(matches, dropdown) {
//     if (matches.length > 0 && matches[0] != '') {
//         // Add match count
//         const count = document.createElement('option');
//         count.text = matches.length + ' matches found';
//         dropdown.add(count);

//         // Add matches
//         for (let i = 0; i < matches.length; i++) {
//             const match = document.createElement('option');
//             match.text = matches[i].split(' :: ')[0];
//             match.title = matches[i].split(' :: ')[1];
//             dropdown.add(match);
//         }
//         return;
//     }
//     // Add default option
//     const option = document.createElement('option');
//     option.text = 'No match';
//     dropdown.add(option);
// }

function updateAnnotationOnHover(id, type) {
    // Reset brightness of all annotations to 100%
    resetAnnotationBrightness();
    // Add emphasis to active annotation + display data
    if (isAnnotationElement(id, type)) {
        if (id.split('-')[0] == "first"||id.split('-')[0] == "second"){
            var annotationIndex = id.split('-')[1];
        } else {
            var annotationIndex = id.split('-')[0];
        }
        if (id.split('-')[0] == "first"){
            updateHoverBrightness1(annotationIndex);
        } else if (id.split('-')[0] == "second"){
            updateHoverBrightness2(annotationIndex);
        } else {
            updateHoverBrightness1(annotationIndex);
            updateHoverBrightness2(annotationIndex);
        }
        // updateHoverBrightness1(annotationIndex);
        // updateHoverBrightness2(annotationIndex);
        updateHoverData(id, annotationIndex);
    }
}

function resetAnnotationBrightness() {
    // Get all displayed annotations
    const inline = $('.inline-annotation');
    const panel = $('.displayed-annotation');
    const elements = $.merge(inline, panel);

    // Reset brightness to 100%
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.filter = 'brightness(100%)';
    }
}

function isAnnotationElement(id, type) {
    // Check whether the hovered over element is an annotation
    return !(
        id == '' || id == type || id == 'highlighted' ||
        (id.split('-').length > 1 && id.split('-')[1] != 'aid' && id.split('-')[0] != 'first'  && id.split('-')[0] != 'second')
    );
}
//-aid1 and -aid2 needed
function updateHoverBrightness1(annotationIndex) {
    const id = '#first-' + annotationIndex;
    if ($(id) != null && $(id + '-aid') != null) {
        $(id).css('filter', 'brightness(115%)');
        $(id + '-aid').css('filter', 'brightness(115%)');
    }
}

function updateHoverBrightness2(annotationIndex) {
    const id = '#second-' + annotationIndex;
    if ($(id) != null && $(id + '-aid') != null) {
        $(id).css('filter', 'brightness(115%)');
        $(id + '-aid').css('filter', 'brightness(115%)');
    }
}

function updateHoverData(id, annotationIndex) {
    if (id.split("-")[0] == 'first') {
        for (let i = 0; i < offsets1.length; i++) {
            if (offsets1[i][0] == annotationIndex) {
                let title = 'Entity: ' + offsets1[i][1] + '\n';
                for (let j = 0; j < offsets1[i][2].length; j++) {
                    title += offsets1[i][2][j];
                }
                document.getElementById(id).title = title;
                return;
            }
        }
    }
    else {
        for (let i = 0; i < offsets2.length; i++) {
            if (offsets2[i][0] == annotationIndex) {
                let title = 'Entity: ' + offsets2[i][1] + '\n';
                for (let j = 0; j < offsets2[i][2].length; j++) {
                    title += offsets2[i][2][j];
                }
                document.getElementById(id).title = title;
                return;
            }
        }
    }
}



// function resetAnnotationEvents() {
//     $('#file-data').unbind();    
//     $('.collapsible').unbind();
//     $('#annotation-data').unbind();
//     $('#ontology-search-input-field').unbind();
//     $('a[name=nav-element]').unbind();
//     $('.suggestion-attribute').unbind();
// }

// function removeEntityStyling() {
//     $('.config-label').each(function() {
//         $(this).css({
//             marginLeft: '0',
//             transition : 'margin 300ms'
//         });
//     });
// }

// function suggestDocumentAnnotations() {
//     // Get open document text and existing annotations
//     const openDocId = localStorage.getItem('openDocId');
//     const docText = localStorage.getItem('docText' + openDocId);
//     const annotationTexts = getAnnotationTexts(openDocId);
    
//     // Reset list and display loader
//     prepareSuggestionPanel();

//     $.ajax({
//         type: 'POST',
//         url: 'suggest-annotations/',
//         data: { 
//             'docText': docText,
//             'annotationTexts': JSON.stringify(annotationTexts)
//         }, success: function (response) {
//             // Ensure open doc is the same as when the suggestion service began
//             if (openDocId == localStorage.getItem('openDocId')) {
//                 // Hide loader and add suggestions
//                 $('#annotation-suggestion-quantity-loader').css('display', 'none');
//                 addSuggestionsToDisplay(JSON.parse(response));
//             }
//         }
//     }).done(function () {
//         // Add events to suggestions 
//         bindAnnotationEvents();
//     });
// }

// function prepareSuggestionPanel() {
//     // Reset suggestion quantity value and display loader
//     $('#annotation-suggestion-list').text('');
//     $('#annotation-suggestion-quantity-value').text('');
//     $('#annotation-suggestion-quantity-loader').css('display', '');
// }

// function getAnnotationTexts(openDocId) {
//     let annotationTexts = [];
//     for (let i = 0; i < annotations1[openDocId].length; i++) {
//         annotationTexts.push(
//             annotations1[openDocId][i][0][0].split('\t')[2].trim()
//         );
//     }
//     return annotationTexts;
// }

// function addSuggestionsToDisplay(suggestions) {
//     // Display number of suggestions
//     setSuggestionCount(suggestions.length);

//     // Construct and display suggestions
//     const entityColor = getEntityColor('Prescription');
//     for (let i = 0; i < suggestions.length; i++) {
//         const target = 'annotation-suggestion-list';
//         const selection = suggestions[i]['sentence'];
//         const annotationId = 'suggestion-' + i;
//         const attributeValues = suggestions[i]['attributes'];
//         injectPanelAnnotation(target, attributeValues, annotationId, selection, entityColor, true);
//     }
// }

// function acceptAnnotation(element) {
//     // Get accepted suggestion
//     const suggestionId = $(element).parent().attr('annotation-id');
//     const suggestion = $('#' + suggestionId)[0];

//     // Prepare suggestion annotation
//     removeSuggestion(suggestion, suggestionId);
//     selectSuggestionText(suggestion.innerText);
//     selectSuggestionEntity();
//     selectSuggestionAttributes(suggestion);
//     selectSuggestionOntology(suggestion);
//     decrementSuggestionCount();

//     // Add suggestion
//     $('#add-annotation').click();

//     // Feedback into models
//     updateSuggestionModels('prescription', suggestion.innerText, 'positive');
// }

// function removeSuggestion(suggestion, suggestionId) {
//     // Remove collapsible from accepted suggestion
//     const childNodes = suggestion.parentNode.childNodes;
//     for (let i = 0; i < childNodes.length; i++) {
//         if (childNodes[i].getAttribute('for') == suggestionId) {
//             suggestion.parentNode.removeChild(childNodes[i]);
//         }
//     }
//     // Remove suggestion from list
//     suggestion.parentNode.removeChild(suggestion);
// }

// function selectSuggestionText(suggestionText) {
//     window.find(suggestionText);
//     selectAnnotationText();
// }

// function selectSuggestionEntity() {
//     $('#Prescription-radio').click();
//     // TODO should be able to predict / select any entity type
// }

// function selectSuggestionAttributes(suggestion) {
//     const dropdowns = $('input[name=values]');
//     for (let i = 0; i < dropdowns.length; i++) {
//         const attributeType = dropdowns[i].getAttribute('list');
//         const attributeName = attributeType.slice(0, attributeType.length - 12);
        
//         if (attributeType.indexOf('Prescription') > -1) {
//             dropdowns[i].value = suggestion.getAttribute(attributeName);
//         }
//     }
// }

// function selectSuggestionOntology(suggestion) {
//     // Populate ontology dropdown with best matches
//     $('#ontology-search-input-field').val(suggestion.getAttribute('CUIPhrase')).trigger('input');

//     // Select best match from ontology dropdown
//     if (document.getElementById('match-list').length > 1) {
//         document.getElementById('match-list').selectedIndex = 1;
//     }
// }

// function editSuggestion() {
//     const name = $(this).text().split(': ')[0].trim();
//     const value = $(this).text().split(': ')[1].trim();
//     const updatedValue = prompt('Updated value (' + name + ')', value);

//     if (updatedValue && updatedValue.trim() != '') {
//         $(this).text(name + ': ' + updatedValue);
//     }

//     const forId = $(this).parent().attr('for');
//     $('#' + forId).attr(name, updatedValue);
// }

// function rejectAnnotation(element) {
//     // Get rejected suggestion
//     const suggestionId = $(element).parent().attr('annotation-id');
//     const suggestion = $('#' + suggestionId)[0];;

//     removeSuggestion(suggestion, suggestionId);
//     decrementSuggestionCount();
    
//     // TODO Feedback into models 
//     updateSuggestionModels('prescription', suggestion.innerText, 'negative');
// }

// function decrementSuggestionCount() {
//     const quantity = $('#annotation-suggestion-quantity-value').text().split(' ')[0];
//     setSuggestionCount(quantity - 1);
// }

// function setSuggestionCount(quantity) {
//     const quantityElement = $('#annotation-suggestion-quantity-value');
//     if (quantity > 0) {
//         if (quantity == 1) {
//             quantityElement.text('1 annotation suggestion');
//         } else {
//             quantityElement.text(quantity + ' annotation suggestions');
//         }
//     } else {
//         quantityElement.text('No annotation suggestions');
//         closeSuggestionPanel();
//     }
// }

// function teachActiveLearner(sentence, label) {
//     $.ajax({
//         type: 'POST',
//         url: 'teach-active-learner/',
//         data: {
//             'sentence': sentence,
//             'label': label
//         }
//     });
// }

// function closeSuggestionPanel() {
//     const collapsible = $('#annotation-suggestion-quantity');
//     const content = collapsible.next();
//     collapsible.toggleClass('active');
//     content.slideUp(200);
// }

// function updateExportDocument() {
//     const output = getAnnotationOutput();
//     storeAnnotationsLocally(output);
//     updateExportUrl(output);
// }

// function storeAnnotationsLocally(output) {
//     const openDocId = localStorage.getItem('openDocId');
//     localStorage.setItem('annotationText' + openDocId, output.join(''));
// }

// function getAnnotationOutput() {
//     const openDocId = localStorage.getItem('openDocId');
//     const output = [];
//     for (let i = 0; i < annotations[openDocId].length; i++) {
//         if (annotations[openDocId][i].length > 1) {
//             for (let j = 0; j < annotations[openDocId][i].length; j++) {
//                 output.push(annotations[openDocId][i][j]);
//             }
//         } else {
//             output.push(annotations[openDocId][i]);
//         }
//     }
//     return output;
// }

// function updateExportUrl(output) {
//     const openDocId = localStorage.getItem('openDocId');
//     const docName = localStorage.getItem('docName' + openDocId) + '.ann';
//     const exportButton = document.getElementById('save-annotation-file');

//     // Release existing blob url
//     window.URL.revokeObjectURL(exportButton.href);

//     // Construct blob file and map to export button
//     const blob = new Blob(output, {type: 'text/plain'});
//     exportButton.href = URL.createObjectURL(blob);
//     exportButton.download = docName;
// }

let entityIds = [];
let attributeIds = [];
let annotations1 = [];
let annotations2 = []
let offsets1 = [];
let offsets2 = [];
let entities = [];
let attributes = [];
let activeEntity = '';
let colors = getColors(entities.length);

const ENTITY_TAG = 'T';
const ATTRIBUTE_TAG = 'A';

// End session if cookies are disabled
session.validateCookies();
