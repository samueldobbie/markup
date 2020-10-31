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
    const lineBreakValue = (lineBreakType == 'windows') ? 2 : 1;

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
    const lineBreakValue = (lineBreakType == 'windows') ? 2 : 1;
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
    resetAnnotationEvents();

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

    // Suggest ontology matches based on selected text 
    $('#file-data').mouseup({
        'type': 'highlight'
    }, suggestOntologyMapping);

    // Suggest ontology matches based on search text
    $('#ontology-search-input-field').on('input', {
        'type': 'search'
    }, suggestOntologyMapping);

    // Prompt user to save annotations before exiting session
    $('a[class=nav-item]').click(function() {
        $(window).bind('beforeunload', function() {
            return 'Changes you made may not be saved.';
        });
    });

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

    function selectAnnotationText() {
        // Change colour of text highlighted by the user
        if (window.getSelection() == '') {
            resetSelectedText();
        } else {
            updatedSelectedText();
        }
    }

    function resetSelectedText() {
        // Reset session
        $('#highlighted').replaceWith(function () { return this.innerHTML; });            
        if ($('#highlighted')[0] != null) {
            setupSession(isNewSession=false);
        }
    }

    function updatedSelectedText() {
        // Get selected text and range
        const selectionText = window.getSelection().toString();
        const selectionRange = window.getSelection().getRangeAt(0);

        // Get range of text before selection
        const preSelectionRange = selectionRange.cloneRange();
        preSelectionRange.selectNodeContents(document.getElementById('file-data'));
        preSelectionRange.setEnd(selectionRange.startContainer, selectionRange.startOffset);

        // Get length of selection and pre-text (excl. newline chars)
        const selectionLength = selectionRange.toString().replace(/\n/g, '').length;
        const preSelectionLength = preSelectionRange.toString().replace(/\n/g, '').length;

        // Colour-highlight selected text
        document.getElementById('file-data').contentEditable = 'true';
        document.execCommand('insertHTML', false, '<span id="highlighted">' + selectionText + '</span>');
        document.getElementById('file-data').contentEditable = 'false';

        addManualAnnotationEvent(
            selectionText,
            selectionLength,
            preSelectionLength
        );
    }

    function addManualAnnotationEvent(selectionText, selectionLength, preSelectionLength) {
        // Reset manual annotation event
        $('#add-annotation').unbind();

        // Enable adding of manual annotation to selection
        $('#add-annotation').click({
            'selectionText': selectionText,
            'selectionLength': selectionLength,
            'preSelectionLength': preSelectionLength
        }, addManualAnnotation);
    }

    function addManualAnnotation(event) {
        // Annotation-specific data
        const selectionText = event.data.selectionText;
        const selectionLength = event.data.selectionLength;
        const preSelectionLength = event.data.preSelectionLength;

        // Check whether selection is valid
        if (isValidAnnotation(selectionText)) {
            constructManualAnnotation(selectionText, selectionLength, preSelectionLength);
            resetAnnotationSelections();
            setupSession(isNewSession=false);
        }
    }

    function isValidAnnotation(selectionText) {
        // Check whether a valid span of text has been selected
        let validSelection = selectionText != null && selectionText.trim() != '';

        // Ensure an entity has been selected
        let validEntity = false;
        const entityRadiobuttons = $('input[name=entities]');
        for (let i = 0; i < entityRadiobuttons.length; i++) {
            if (entityRadiobuttons[i].checked) {
                validEntity = true;
                break;
            }
        }
        // Display error messages
        if (!validEntity) alert('You must select an entity.');
        if (!validSelection) alert('You must highlight a span of text.');

        return validEntity && validSelection;
    }

    function constructManualAnnotation(selectionText, selectionLength, preSelectionLength) {   
        const annotation = [];

        // Convert highlight indicies to CRLF / LF indicies
        const indicies = highlightToTrueIndicies(preSelectionLength, selectionLength);
        const startIndex = indicies[0];
        const endIndex = indicies[1];

        // Add formatted entity
        const formattedEntity = getFormattedEntity(
            selectionText,
            startIndex,
            endIndex
        );
        annotation.push([formattedEntity]);

        // Add formatted attributes
        const formattedAttributes = getFormattedAttributes();
        for (let i = 0; i < formattedAttributes.length; i++) {
            annotation.push([formattedAttributes[i]]);
        }

        // Add formatted annotation to global array
        addFormattedAnnotation(annotation, startIndex);

        // updateSuggestionModels(entityValue);        
    }

    function getFormattedEntity(selectionText, startIndex, endIndex) {
        // Construct formatted entity
        const id = $('input[type=radio]:checked')[0].id;
        const entity = id.substring(0, id.length - 6);
        return `T${entityId++}\t${entity} ${startIndex} ${endIndex}\t${normaliseText(selectionText)}\n`;
    }

    function getFormattedAttributes() {
        const result = [];

        // Construct attributes from checkboxes
        const checkboxes = $('input[type=checkbox]:checked');
        for (let i = 0; i < checkboxes.length; i++) {
            const key = checkboxes[i].id;
            result.push(formatAttribute('checkbox', key));
        }

        // Construct attributes from dropdowns
        const dropdowns = $('input[name=values]');
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].value != '') {
                const kv = getKeyValuePair(dropdowns[i]);
                result.push(formatAttribute('dropdown', kv[0], kv[1]));
            }
        }

        // Get chosen option(s) from ontology (if not default)
        // var matchList = document.getElementById('match-list');

        // var options = [
        //     [matchList.options[matchList.selectedIndex].text, matchList.options[matchList.selectedIndex].title]
        // ];

        // for (var i = 0; i < options.length; i++) {
        //     var optionWords = options[i][0].split(' ');
        //     if (!((optionWords[optionWords.length - 2] == 'matches' && optionWords[optionWords.length - 1] == 'found') || options[i][0] == 'No match')) {
        //         var optionText = options[i][0];
        //         var optionCode = options[i][1].split(' ')[1];

        //         var term = 'A' + attributeId + '\tCUIPhrase' + ' T' + (entityId - 1) + ' ' + normaliseText(optionText) + '\n';
        //         attributeData.push(term);
        //         attributeValues.push('CUIPhrase: ', optionText, '\n');
        //         attributeId++;

        //         var cui = 'A' + attributeId + '\tCUI' + ' T' + (entityId - 1) + ' ' + optionCode + '\n';
        //         attributeData.push(cui);
        //         attributeValues.push('CUI: ', optionCode, '\n');
        //         attributeId++;
        //     }
        // }

        return result;
    }

    function formatAttribute(type, key, value=null) {
        if (type == 'checkbox') {
            return `A${attributeId++}\t${normaliseText(key)} T${entityId - 1}\n`;
        }
        return `A${attributeId++}\t${normaliseText(key)} T${entityId - 1} ${normaliseText(value)}\n`;
    }

    function normaliseText(raw) {
        // Replace spaces with hyphens
        if (!raw) return null;
        return raw.split(/<br>|\s|\n/).join('-');
    }

    function getKeyValuePair(dropdown) {
        let pair = dropdown.value.split(': ');
        if (pair.length == 1) {
            pair = [dropdown.getAttribute('placeholder'), pair[0]];
        }
        return pair;
    }

    function addFormattedAnnotation(annotation, startIndex) {
        const openDocId = localStorage.getItem('openDocId');

        if (annotations[openDocId].length == 0) {
            annotations[openDocId].push(annotation);
        } else {        
            // Add annotation in order as it appears in doc
            for (let i = 0; i < annotations[openDocId].length; i++) {
                if (startIndex < parseInt(annotations[openDocId][i][0][0].split(' ')[1])) {
                    annotations[openDocId].splice(i, 0, annotation);
                    return;
                }

                if (i == annotations[openDocId].length - 1) {
                    annotations[openDocId].push(annotation);
                    return;
                }
            }
        }
    }

    function updateSuggestionModels(entityValue) {
        // Pass selection text into active learner
        if (entityValue == 'Prescription') {
            teachActiveLearner(selectionText, 1);
        }
    }

    function resetAnnotationSelections() {
        // Removes selection of newly-annotated text
        window.getSelection().removeAllRanges();

        // Reset all selections
        $('input[name=values]').css('display', 'none');
        $('input[name=values]').val('');
        $('#ontology-search-input-field').val('');
        $('#config-data')[0].scrollTop = 0;
        removeEntityStyling();
        activeEntity = '';
    }

    function suggestOntologyMapping(event) {
        // Get relevant matches from defined ontology
        const queryType = event.data.type;
        const dropdown = $('#match-list')[0];
        const inputText = getInputText(queryType);

        // Ignore invalid inputs
        if (inputText == '' || inputText.split(' ').length > 8) return;

        displayOntologySuggestions(dropdown, inputText);
    }

    function getInputText(queryType) {
        if (queryType == 'highlight') {
            if (window.getSelection().anchorNode != null)
                return anchordNode.textContent.trim();
        } else {
            return $('#ontology-search-input-field').val().trim();
        }
        return '';
    }

    function displayOntologySuggestions(dropdown, inputText) {
        $.ajax({
            type: 'GET',
            url: 'suggest-cui/',
            async: false,
            data: {inputText: inputText},
            success: function (response) {
                dropdown.options.length = 0;
                populateOntologyDropdown(
                    JSON.parse(response),
                    dropdown
                );
            }
        });
    }

    function populateOntologyDropdown(matches, dropdown) {
        if (matches.length > 0 && matches[0] != '') {
            // Add match count
            const count = document.createElement('option');
            count.text = matches.length + ' matches found';
            dropdown.add(count);

            // Add matches
            for (let i = 0; i < matches.length; i++) {
                const match = document.createElement('option');
                match.text = matches[i].split(' :: ')[0];
                match.title = matches[i].split(' :: ')[1];
                dropdown.add(match);
            }
            return;
        }
        // Add default option
        const option = document.createElement('option');
        option.text = 'No match';
        dropdown.add(option);
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

    function resetAnnotationEvents() {
        $('#file-data').unbind();    
        $('.collapsible').unbind();
        $('#annotation-data').unbind();
        $('#ontology-search-input-field').unbind();
        $('a[name=nav-element]').unbind();
    }

    function removeEntityStyling() {
        $('.config-label').each(function() {
            $(this).css({
                marginLeft: '0',
                transition : 'margin 300ms'
            });
        });
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
let activeEntity = '';
let colors = getColors(entities.length);

const ENTITY_TAG = 'T';
const ATTRIBUTE_TAG = 'A';

// End session if cookies are disabled
session.validateCookies();
