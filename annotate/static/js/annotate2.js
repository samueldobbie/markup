$(document).ready(function () {
    setupSession(isNewSession=true);
});

function setupSession(isNewSession) {
    validateSession();
    populateSessionDisplay(isNewSession);
    updateExportDocument();
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

function populateSessionDisplay(isNewSession) {
    if (isNewSession) {
        initializeSession();
    }
    updateOngoingSession();
}

function initializeSession() {
    parseAndStoreAnnotations();
    setupScrollbars();
    setupNavigationMenu();
    setupConfigs();
}

function parseAndStoreAnnotations() {
    const docCount = localStorage.getItem('docCount');

    // Store parsed annotations for each doc
    for (let docId = 0; docId <= docCount; docId++) {
        annotations.push(parseDocumentAnnotations(docId));
    }
}

function parseDocumentAnnotations(docId) {
    const annText = localStorage.getItem('annotationText' + docId);
    const annSentences = annText != null ? annText.split('\n') : null;

    // Ensure a valid ann file exists
    if (annText == null || annText.trim() == '') return [];

    // Parse annotations from ann text
    let parsedAnns = [];
    let currentAnn = [];
    for (let i = 0; i < annSentences.length; i++) {
        if (annSentences[i][0] == ENTITY_TAG && currentAnn.length != 0) {
            parsedAnns.push(currentAnn);
            currentAnn = [];
        }

        if (annSentences[i][0] == ENTITY_TAG || annSentences[i][0] == ATTRIBUTE_TAG) {
            currentAnn.push([annSentences[i] + '\n']);
        }
    }
    parsedAnns.push(currentAnn);

    return parsedAnns;
}

function setupScrollbars() {
    // Add scroll bar to each panel
    new PerfectScrollbar($('#config-data')[0]);
    new PerfectScrollbar($('#file-data')[0]);
    new PerfectScrollbar($('#annotation-data')[0]);
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
        setupSession(isNewSession=false);
        //switchSuggestionPanel();
        //getAnnotationSuggestions();
    }
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

function updateOngoingSession() {
    openNewDocument();
    displayDocumentAnnotations();
    bindAnnotationEvents();
    suggestDocumentAnnotations();
}

function openNewDocument() {
    const openDocId = localStorage.getItem('openDocId');
    const docName = localStorage.getItem('docName' + openDocId);
    const docText = localStorage.getItem('docText' + openDocId);

    // Update title, doc text and active nav item
    $('title')[0].innerText = docName + ' - Markup';
    $('#file-data').text(docText);
    $('#switch-file-dropdown').prop('selectedIndex', openDocId);
}

function displayDocumentAnnotations() {
    const openDocId = localStorage.getItem('openDocId');

    resetAnnotationPanel();

    // Parse and inject annotation data 
    for (let i = 0; i < annotations[openDocId].length; i++) {
        const annotationData = getAnnotationData(annotations[openDocId][i], i);
        addAnnotationToDisplay(annotationData);
    }
    entityId++;
    attributeId++;

    window.getSelection().removeAllRanges();
}


function getAnnotationData(annotation, annotationIndex) {
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
            addEntityData(rowData, tagId, annotationData);
        } else if (tag == ATTRIBUTE_TAG) {
            addAttributeData(rowData, tagId, annotationData);
        }
    }
    return annotationData;
}

function addEntityData(entityData, tagId, annotationData) {
    // Increase global entity id based on no. of entities
    entityId = Math.max(entityId, tagId);

    // Convert doc indicies (incl. linebreaks) to selection indicies
    const indicies = trueToHighlightIndicies(
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
    attributeId = Math.max(attributeId, tagId);

    // Include attribute data
    annotationData['attributeValues'].push(
        attributeData[0] + ': ' + attributeData[2]
    );
}

function resetAnnotationPanel() {
    // Empty annotation panel (excl. suggestions)
    const suggestions = $('#annotation-suggestion-container').detach();
    $('#annotation-data').empty().append(suggestions);
    
    // Add section titles to annotation panel
    for (let i = 0; i < entities.length; i++) {
        const id = entities[i] + '-section';

        $('<div/>', {
            'id': id,
            'css': {
                'display': 'none'
            }
        }).appendTo('#annotation-data');

        $('<p/>', {
            'class': 'section-title',
            'text': entities[i]
        }).appendTo('#' + id);
    }

    // Empty offsets
    offsets.length = 0;
}

function addAnnotationToDisplay(annotationData) {
    // Highlight text span within doc
    selectAnnotationTextSpan(
        annotationData['highlightStartIndex'],
        annotationData['highlightEndIndex']
    );

    // Inject annotation at selected text span
    injectAnnotation(
        annotationData['entityValue'],
        annotationData['attributeValues'],
        annotationData['annotationIndex']
    );
}


function selectAnnotationTextSpan(startIndex, endIndex) {
    if (document.createRange && window.getSelection) {
        selectDocumentRange(startIndex, endIndex);
    } else if (document.selection && document.body.createTextRange) {
        selectTextRange(startIndex, endIndex);
    }
}

function selectDocumentRange(startIndex, endIndex) {
    const range = getSelectionRange(startIndex, endIndex);
    setSelectionRange(range);
}

function getSelectionRange(startIndex, endIndex) {
    const docHtml = $('#file-data')[0];
    const range = document.createRange();
    const textNodes = getTextNodes(docHtml);

    // Initialize range
    range.selectNodeContents(docHtml);

    // Update start and end of range
    let isStartOfSelection = false;
    let startCharIndex = 0;
    let endCharIndex = 0;
    for (let i = 0; i < textNodes.length; i++) {
        const textNode = textNodes[i];
        
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

function setSelectionRange(range) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function selectTextRange(startIndex, endIndex) {
    const docHtml = $('#file-data')[0];
    const range = document.body.createTextRange();
    range.moveToElementText(docHtml);
    range.collapse(true);
    range.moveStart('character', startIndex);
    range.moveEnd('character', endIndex);
    range.select();
}

function injectAnnotation(entityValue, attributeValues, annotationIndex) {
    const selection = window.getSelection().toString();
    const entityColor = getEntityColor(entityValue);

    // Display annotation at selection range
    injectInlineAnnotation(annotationIndex, selection, entityColor);
    injectPanelAnnotation(entityValue, attributeValues, annotationIndex, selection, entityColor);

    // Keep track of offets for each annotation
    offsets.push([annotationIndex, entityValue, attributeValues, selection]);
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

function injectInlineAnnotation(annotationIndex, selection, entityColor) {
    // Construct inline annotation
    const annotationHTML = $('<span/>', {
        'class': 'annotation inline-annotation',
        'id': annotationIndex + '-aid',
        'text': selection,
        'css': {
            'background-color': entityColor,
            'color': 'black'
        }
    }).prop('outerHTML');

    // Add inline annotation
    $('#file-data').attr('contenteditable', 'true');
    document.execCommand('insertHTML', false, annotationHTML);
    $('#file-data').attr('contenteditable', 'false');
}

function injectPanelAnnotation(entityValue, attributeValues, annotationIndex, selection, entityColor) {
    const sectionId = '#' + entityValue + '-section';

    // Show section title
    $(sectionId).show()

    // Add annotation with annotation text
    constructPanelAnnotation(annotationIndex, selection, entityColor).appendTo(sectionId);

    // Add dropdown with annotation values
    constructContentContainer(annotationIndex, attributeValues).appendTo(sectionId);
}

function constructPanelAnnotation(annotationIndex, selection, entityColor) {
    return $('<p/>', {
        'class': 'annotation displayed-annotation collapsible',
        'id': annotationIndex,
        'output-id': ENTITY_TAG + entityId,
        'text': selection,
        'css': {
            'background-color': entityColor,
            'color': '#1A1E24'
        }
    });
}

function constructContentContainer(annotationIndex, attributeValues) {
    const contentContainer = $('<div/>', {
        'class': 'content',
        'for': 'annotation-' + annotationIndex
    });

    for (let i = 0; i < attributeValues.length; i++) {
        $('<p/>', {
            'class': 'annotation-attribute',
            'text': attributeValues[i],
            'onClick': 'editAnnotation(this)'
        }).appendTo(contentContainer);
    }

    // Container for delete, edit, etc.
    const optionContainer = $('<div/>', {
        'class': 'annotation-option-container',
        'annotation-id': annotationIndex,

    }).appendTo(contentContainer);

    // Add delete button
    const deleteButton = $('<a/>', {
        'class': 'annotation-icon delete-icon',
        'annotation-id': annotationIndex,
        'onClick': 'deleteAnnotation(this)'
    }).appendTo(optionContainer);

    // Add delete icon
    $('<i/>', {
        'class': 'fas fa-trash'
    }).appendTo(deleteButton);

    return contentContainer;
}

function editAnnotation(element) {
    // TODO
}

function deleteAnnotation(element) {
    // Remove annotation and offset
    const openDocId = localStorage.getItem('openDocId');
    const annotationId = parseInt($(element).attr('annotation-id'));

    // Finds correct annotation index and remove
    for (var i = 0; i < offsets.length; i++) {
        if (offsets[i][0] == annotationId) {
            annotations[openDocId].splice(i, 1);
            offsets.splice(i, 1);
            break;
        }
    }

    // Update session
    setupSession(isNewSession=false);
}

function trueToHighlightIndicies(trueStartIndex, trueEndIndex) {
    /*
    Convert true indicies (incl. newlines) to highlight indicies
    (excl. newlines) based on doc type (LF or CRLF)
    */
    const docText = getNormalisedDocText();
    return getHighlightIndicies(docText, trueStartIndex, trueEndIndex);
}

function getNormalisedDocText() {
    /*
    Return document text where newline chars have been replaced
    by some number of regular chars based on the doc type (LF or CRLF)
    */
    const openDocId = localStorage.getItem('openDocId');
    const lineBreakType = localStorage.getItem('lineBreakType' + openDocId);
    const lineBreakValue = (lineBreakType == 'windows') ? 1 : 2;

    let docText = '';

    for (let i = 0; i < $('#file-data').children().length; i++) {
        const node = $('#file-data').children()[i];
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


function highlightToTrueIndicies(preSelectionLength, selectionLength) {
    /*
    Convert highlight indicies (excl. newlines) to true indicies
    (incl. newlines) based on doc type (LF or CRLF)
    */
    const openDocId = localStorage.getItem('openDocId');
    const lineBreakType = localStorage.getItem('lineBreakType' + openDocId);
    const lineBreakValue = (lineBreakType == 'windows') ? 1 : 2;
    const docText = $('#file-data').text();

    let trueStartIndex = 0;
    let trueEndIndex = 0;
    for (let i = 0; i < docText.length; i++) {
        if (preSelectionLength == 0) {
            while (docText[i] == '\n') {
                trueStartIndex += lineBreakValue;
                i++;
            }

            trueEndIndex = trueStartIndex;
            while (selectionLength > 0) {
                if (docText[i] == '\n') {
                    trueEndIndex += lineBreakValue;
                } else {
                    selectionLength--;
                    trueEndIndex++;
                }
                i++;
            }
            break;
        } else if (docText[i] == '\n') {
            trueStartIndex += lineBreakValue;
        } else {
            preSelectionLength--;
            trueStartIndex++;
        }
    }
    return [trueStartIndex, trueEndIndex];
}

function bindAnnotationEvents() {
    let selectionLength, preSelectionLength;

    // Update colour of highlighted text
    $('#file-data').mouseup(selectAnnotationText);

    // Update active annotation in file panel
    $('#file-data').mouseover(function (e) {
        updateAnnotationOnHover(e.target.id, 'file-data');
    });

    // Update active annotation in annotation panel
    $('#annotation-data').mouseover(function (e) {
        updateAnnotationOnHover(e.target.id, 'annotation-data');
    });

    // // Suggest most relevant UMLS matches based on highlighted term 
    // $('#file-data').mouseup({'type': 'highlight'}, suggestCui);

    // // Suggest most relevant UMLS matches based on searched term
    // $('#ontology-search-input-field').on('input', {'type': 'search'}, suggestCui);

    // Prompt user to save annotations before ending session
    $('a[name=nav-element]').click(function() {
        $(window).bind('beforeunload', function(){
            return 'You have unsaved annotations, are you sure you want to leave?';
        });
    });

    function selectAnnotationText() {
        // Change colour of text highlighted by the user

        const openDocId = localStorage.getItem('openDocId');
        const docText = localStorage.getItem('docText' + openDocId);

        // Ignore selection
        $('#highlighted').replaceWith(function () { return this.innerHTML; });

        if (window.getSelection() == '') {
            // Reset document text to default
            $('#file-data').text(docText);
        } else {
            // Get selected text and range
            const selectionText = window.getSelection().toString();
            const selectionRange = window.getSelection().getRangeAt(0);

            // Get range of text before selection
            const preSelectionRange = selectionRange.cloneRange();
            preSelectionRange.selectNodeContents(document.getElementById('file-data'));
            preSelectionRange.setEnd(selectionRange.startContainer, selectionRange.startOffset);

            // Colour-highlight selected text
            document.getElementById('file-data').contentEditable = 'true';
            document.execCommand('insertHTML', false, '<span id="highlighted">' + selectionText + '</span>');
            document.getElementById('file-data').contentEditable = 'false';

            // Get length of selection and pre-text (excl. newline chars)
            const selectionLength = selectionRange.toString().replace(/\n/g, '').length;
            const preSelectionLength = preSelectionRange.toString().replace(/\n/g, '').length;

            $('#add-annotation').click({
                'selectionText': selectionText,
                'selectionLength': selectionLength,
                'preSelectionLength': preSelectionLength,
            }, addManualAnnotation);
        }
    }

    function updateAnnotationOnHover(id, type) {
        /*
        Display information about annotation and
        adjust brightness upon hover of both annotation-data
        and file-data panels
        */
    
        // Reset annotations to original brightness
        var annotations = $.merge($('.inline-annotation'), $('.displayed-annotation'));
        for (var i = 0; i < annotations.length; i++) {
            annotations[i].style.filter = 'brightness(100%)';
        }
    
        // Ignore hover over non-annotation elements
        if (id == '' || id == type || id == 'highlighted' ||
            (id.split('-').length > 1 && id.split('-')[1] != 'aid')) {
            return;
        }
    
        var targetAnnotationIdentifier = id.split('-')[0];
    
        // Increase brightness of inline and displayed target annotation
        if (document.getElementById(targetAnnotationIdentifier) != null &&
            document.getElementById(targetAnnotationIdentifier + '-aid') != null) {
            document.getElementById(targetAnnotationIdentifier).style.filter = 'brightness(115%)';
            document.getElementById(targetAnnotationIdentifier + '-aid').style.filter = 'brightness(115%)';
        }
    
        // Add hover information to target annotation
        for (var i = 0; i < offsets.length; i++) {
            if (offsets[i][0] == targetAnnotationIdentifier) {
                var title = 'Entity: ' + offsets[i][1] + '\n';
                for (var j = 0; j < offsets[i][2].length; j++) {
                    title += offsets[i][2][j];
                }
                document.getElementById(id).title = title;
                return;
            }
        }
    }

    function addManualAnnotation(event) {
        const openDocId = localStorage.getItem('openDocId');

        const selectionText = event.data.selectionText;
        const selectionLength = event.data.selectionLength;
        const preSelectionLength = event.data.preSelectionLength;

        var attributeRadiobuttons = $('.config-label');
        var attributeDropdowns = $('input[name=values]');

        var trueIndicies = highlightToTrueIndicies(preSelectionLength, selectionLength);
        var trueStartIndex = trueIndicies[0];
        var trueEndIndex = trueIndicies[1];
    
        console.log('selectionText', selectionText);
        console.log('preSelectionLength', preSelectionLength);
        console.log('preSelectionLength', preSelectionLength);
        console.log('trueStartIndex', trueStartIndex);
        console.log('trueEndIndex', trueEndIndex);

        // Check whether selection is valid
        if (!validateAnnotationSelection(selectionText, attributeRadiobuttons)) {
            alert('Invalid annotation - have you highlighted a span of text and chosen an entity?');
            return;
        }
    
        var annotation = [];
        var attributeValues = [];
        var attributeData = [];
    
        // Construct formatted entity data
        var entityValue = $('input[type=radio]:checked')[0].id.substring(0, $('input[type=radio]:checked')[0].id.length - 6);
        entityData = 'T' + entityId + '\t' + entityValue + ' ' + trueStartIndex + ' ' + trueEndIndex + '\t' + underscoreString(selectionText) + '\n';
        entityId++;
    
        annotation.push([entityData]);
    
        // Construct formatted attribute data from checkboxes
        for (var i = 0; i < $('input[type=checkbox]:checked').length; i++) {
            var checkedAttribute = underscoreString($('input[type=checkbox]:checked')[i].id);
            attributeValues.push(checkedAttribute);
            attributeData.push('A' + attributeId + '\t' + checkedAttribute + ' T' + (entityId - 1) + '\n');
            attributeId++;
        }
    
        // Construct formatted attribute data from attribute dropdowns
        for (var i = 0; i < attributeDropdowns.length; i++) {
            if (attributeDropdowns[i].value != '') {
                var attributeKeyValue = attributeDropdowns[i].value.split(': ');
                if (attributeKeyValue.length == 1) {
                    attributeKeyValue = [attributeDropdowns[i].getAttribute('placeholder'), attributeKeyValue[0]];
                }
                var attributeKey = attributeKeyValue[0];
                var attributeValue = underscoreString(attributeKeyValue[1]);
                attributeValues.push(attributeKey + ': ', attributeValue + '\n');
                attributeData.push('A' + attributeId + '\t' + attributeKey + ' T' + (entityId - 1) + ' ' + attributeValue + '\n');
                attributeId++;
            }
        }
    
        // Get chosen option(s) from ontology (if not default)
        var matchList = document.getElementById('match-list');
    
        var options = [
            [matchList.options[matchList.selectedIndex].text, matchList.options[matchList.selectedIndex].title]
        ];
    
        for (var i = 0; i < options.length; i++) {
            var optionWords = options[i][0].split(' ');
            if (!((optionWords[optionWords.length - 2] == 'matches' && optionWords[optionWords.length - 1] == 'found') || options[i][0] == 'No match')) {
                var optionText = options[i][0];
                var optionCode = options[i][1].split(' ')[1];
    
                var term = 'A' + attributeId + '\tCUIPhrase' + ' T' + (entityId - 1) + ' ' + underscoreString(optionText) + '\n';
                attributeData.push(term);
                attributeValues.push('CUIPhrase: ', optionText, '\n');
                attributeId++;
    
                var cui = 'A' + attributeId + '\tCUI' + ' T' + (entityId - 1) + ' ' + optionCode + '\n';
                attributeData.push(cui);
                attributeValues.push('CUI: ', optionCode, '\n');
                attributeId++;
            }
        }
    
        // Add attributes to annotation
        for (var i = 0; i < attributeData.length; i++) {
            annotation.push([attributeData[i]]);
        }
    
        // Add annotation to annotation list in order as it appears in the document
        if (annotations[openDocId].length == 0) {
            annotations[openDocId].push(annotation);
        } else {
            for (var i = 0; i < annotations[openDocId].length; i++) {
                if (trueStartIndex < parseInt(annotations[openDocId][i][0][0].split(' ')[1])) {
                    annotations[openDocId].splice(i, 0, annotation);
                    break;
                } 
                
                if (i == (annotations[openDocId].length - 1)) {
                    annotations[openDocId].push(annotation);
                    break;
                }
            }
        }
    
        // Removes selection of newly-annotated text
        window.getSelection().removeAllRanges();
    
        // Reset all selections
        // $('input[name=values]').css('display', value);
        // $('input[name=values]').val('');

        // toggleAttributeCheck(attributeCheckboxes, false);
        // toggleAttributeCheck(attributeRadiobuttons, false);
        // toggleAttributeDisplay('checkbox', 'none');
        // toggleAttributeDisplay('dropdown', 'none');


        // resetAttributeValues();
        // removeEntityStyling();
        activeEntity = '';
    
        // Reset scroll of config section
        document.getElementById('config-data').scrollTop = 0;
    
        // Clear ontology search field
        document.getElementById('ontology-search-input-field').value = '';
    
        // Feed prescription sentences into active learner
        if (entityValue == 'Prescription') {
            teachActiveLearner(selectionText, 1);
        }
    
        setupSession(isNewSession=false);
    }
    
    function validateAnnotationSelection(highlighted, attributeRadiobuttons) {
        var validAnnotation = false;
        for (var i = 0; i < attributeRadiobuttons.length; i++) {
            if (attributeRadiobuttons[i].checked) {
                validAnnotation = true;
                break;
            }
        }
    
        if (validAnnotation && highlighted != null && highlighted.trim() != '') {
            return true;
        }
        return false;
    }
    
    function underscoreString(string) {
        string = string.split('<br>').join('-');
        string = string.split(' ').join('-');
        string = string.split('\n').join('-');
        return string;
    }
}

function suggestDocumentAnnotations() {

}

function updateExportDocument() {
    const output = getAnnotationOutput();
    storeAnnotationsLocally(output);
    updateExportUrl(output);
}

function storeAnnotationsLocally(output) {
    const openDocId = localStorage.getItem('openDocId');
    localStorage.setItem('annotationText' + openDocId, output.join(''));
}

function getAnnotationOutput() {
    const openDocId = localStorage.getItem('openDocId');

    const output = [];
    for (let i = 0; i < annotations[openDocId].length; i++) {
        if (annotations[openDocId][i].length > 1) {
            for (let j = 0; j < annotations[openDocId][i].length; j++) {
                output.push(annotations[openDocId][i][j]);
            }
        } else {
            output.push(annotations[openDocId][i]);
        }
    }
    return output;
}

function updateExportUrl(output) {
    const openDocId = localStorage.getItem('openDocId');
    const docName = localStorage.getItem('docName' + openDocId) + '.ann';
    const exportButton = document.getElementById('save-annotation-file');

    // Release existing blob url
    window.URL.revokeObjectURL(exportButton.href);

    // Construct blob file and map to export button
    const blob = new Blob(output, {type: 'text/plain'});
    exportButton.href = URL.createObjectURL(blob);
    exportButton.download = docName;
}

let entityId = 1;
let attributeId = 1;
let annotations = [];
let offsets = [];
let entities = [];
let attributes = [];
let colors = getColors(entities.length);

const ENTITY_TAG = 'T';
const ATTRIBUTE_TAG = 'A';

// End session if cookies are disabled
session.validateCookies();
