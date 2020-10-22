$(document).ready(function () {
    setupSession(isInitalSetup=true);
});

function setupSession(isInitalSetup) {
    // Ensure session is valid or return to setup
    validateSession();

    // Setup session display
    configureDisplay(isInitalSetup);

    if (isInitalSetup) {
        // Get existing annotations
        populateAnnotationList();

        // Parse entity and attribute configs
        const configs = parseConfigs();
        entityList = configs[0];
        attributeSentences = configs[1];

        // Inject entities into config panel
        injectEntities(entityList);

        // Inject attributes into config panel
        const configVals = injectAttributes(entityList, attributeSentences);

        // Get all configuration elements for manipulation
        var attributeCheckboxes = $('input[type=checkbox]');
        var attributeRadiobuttons = $('input[type=radio]');
        var attributeDropdowns = $('input[name=values]');

        // Initialise all configurations boxes
        toggleAttributeDisplay('checkbox', 'none');
        toggleAttributeDisplay('dropdown', 'none');

        // Display relevant attributes upon entity selection
        $('input[type=radio]').click({
            'configArgs': configVals[0],
            'configVals': configVals[1],
            'attributeCheckboxes': attributeCheckboxes,
            'attributeDropdowns': attributeDropdowns
        }, displayAttributes);

        // Update display of selected entity
        $('input[type=radio]').click({
            'attributeCheckboxes': attributeCheckboxes,
            'attributeDropdowns': attributeDropdowns,
            'attributeRadiobuttons': attributeRadiobuttons
        }, updateSelectedEntity);

        // Change colour of highlighted text
        $('#file-data').mouseup(highlightText);

        // Display annotation data and adjust brightness in annotation panel
        $('#annotation-data').mouseover(function (e) {
            adjustAnnotationUponHover(e.target.id, 'annotation-data');
        });

        // Display annotation data and adjust brightness in file panel
        $('#file-data').mouseover(function (e) {
            adjustAnnotationUponHover(e.target.id, 'file-data');
        });

        enableFileNavigation();

        // Allow users to add an annotation
        $('#add-annotation').click({
            'attributeCheckboxes': attributeCheckboxes,
            'attributeDropdowns': attributeDropdowns,
            'attributeRadiobuttons': attributeRadiobuttons
        }, addAnnotation);

        // Suggest most relevant UMLS matches based on highlighted term 
        $('#file-data').mouseup({'type': 'highlight'}, suggestCui);

        // Suggest most relevant UMLS matches based on searched term
        $('#ontology-search-input-field').on('input', {'type': 'search'}, suggestCui);

        // Prompt user to save annotations before leaving page
        $('a[name=nav-element]').click(function() {
            $(window).bind('beforeunload', function(){
                return 'You have unsaved changes, are you sure you want to leave?';
            });
        });

        getAnnotationSuggestions();
    }
    // Load existing annotations for open document
    loadExistingAnnotations();

    // Add blob link to export annotations
    updateExportUrl();
    
    // Add events to annotation dropdowns
    bindCollapsibleEvents();
}

function validateSession() {
    const configText = localStorage.getItem('configText');

    // Validate config file
    if (configText == null || configText.trim() == '') {
        alert('You need to provide a valid config file. Read the docs for more info.');
        window.location = '/setup';
    }
}

function configureDisplay(isInitalSetup) {
    const openDocId = localStorage.getItem('openDocId');
    const openMethod = localStorage.getItem('openMethod');
    const docCount = localStorage.getItem('docCount');

    if (isInitalSetup) {
        constructScrollbars();

        // Enable multi-doc features
        if (openMethod == 'multiple') {
            enableMultiDocFeatures(openDocId, docCount);
        }
    }
    // Update title and doc text
    const docName = localStorage.getItem('docName' + openDocId);
    const docText = localStorage.getItem('docText' + openDocId);

    $('title')[0].innerText = docName + ' - Markup';
    $('#file-data').text(docText);

    // Select active doc in nav dropdown
    $('#switch-file-dropdown').prop('selectedIndex', openDocId);
}

function constructScrollbars() {
    // Add scroll bar to each panel
    new PerfectScrollbar(document.getElementById('config-data'));
    new PerfectScrollbar(document.getElementById('file-data'));
    new PerfectScrollbar(document.getElementById('annotation-data'));
}

function enableMultiDocFeatures(openDocId, docCount) {
    $('#move-to-previous-file').show();
    $('#move-to-next-file').show();
    $('#switch-file').show();

    // Populate nav dropdown
    for (let i = 0; i < docCount; i++) {
        $('<option/>', {
            'documentId': i,
            'text': localStorage.getItem('docName' + i)
        }).appendTo('#switch-file-dropdown');
    }
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

function switchFile(newId) {
    localStorage.setItem('openDocId', newId);
    setupSession(isInitialSetup=false);
    switchSuggestionPanel();
    getAnnotationSuggestions();
}

function parseAttributes(attributeSents) {
    /*
    Parse attribute arguments and values
    from attribute sentences
    */

    /*
    var attributeValues = [];
    for (var i = 0; i < attributeSentences.length; i++) {
        var attributeSentence = attributeSentences[i];
        if (attributeSentence.trim() == '') {
            continue;
        }

        var argumentComponents = attributeSentence.split('Arg:');
        var attributeName = argumentComponents[0].trim();
        var valueComponents = [];
        if (argumentComponents.length > 1) {
            valueComponents = argumentComponents[1].split('Value:');
        }

        // Populate argument list
        if (valueComponents.length > 0) {
            var arguments = valueComponents[0].split(',');
            for (var j = 0; j < arguments.length; j++) {
                var argumentList = [];
                argumentList.push(argsSplit[0].trim());

                if (valsSplit[0].split(',')[j].trim() != '') {
                    argumentList.push(valsSplit[0].split(',')[j].trim());
                }

                if (argumentList.length > 1) {
                    configArgs.push(argumentList);
                    document.getElementById('attribute-checkboxes').innerHTML += '<p style="margin:0; padding:0;"> <input type="checkbox" id="{{ val }}" name="{{ key }}" value="{{ val }}"> <label for="{{ val }}">{{ val }}</label> </p>';
                }


                var attributeValue = [];
                // Enable use of global entities
                if (arguments[j].toLowerCase().trim() == '<entity>') {
                    attributeValue = [attributeName];
                    for (var k = 0; k < entityList.length; k++) {
                        attributeValue.push(entityList[k]);
                    }
                    break;
                }
                attributeValue.push(arguments[j].trim());
            }
            document.getElementById('attribute-checkboxes').innerHTML += '<p style="margin:0; padding:0;"> <input type="checkbox" id="{{ val }}" name="{{ key }}" value="{{ val }}"> <label for="{{ val }}">{{ val }}</label> </p>';
            }
        }
        
        // Populate the value list
        if (valueComponents.length > 1) {
            var values = valueComponents[1].split('|');
            for (var j = 0; j < values.length; j++) {
                attributeValue.push(values[i]);
            }
        }

        // Add attibute values to output list
        if (attributeValue != []) {
            attributeValues.push(attributeValue);
        }
    }

    return attributeValues;
    */
}

function injectAttributes(entityList, configValues) {
    /*
    Display attribute configuration list in side panel
    */
    var configArgs = [];
    var configVals = [];
    for (var i = 0; i < configValues.length; i++) {
        var argsSplit = configValues[i].split('Arg:');
        configValues[i] = argsSplit[0].trim();

        var valsSplit = '';

        if (argsSplit.length > 1) {
            valsSplit = argsSplit[1].split('Value:');
        }

        if (valsSplit == 1) {
            for (var j = 0; j < valsSplit[0].split(','); i++) {
                var newArgs = [];
                newArgs.push(argsSplit[0].trim());

                if (valsSplit[0].split(',')[j].trim() != '') {
                    newArgs.push(valsSplit[0].split(',')[j].trim());
                }

                if (newArgs.length > 1) {
                    configArgs.push(newArgs);
                    document.getElementById('attribute-checkboxes').innerHTML += '<p><input type="checkbox" id="{{ val }}" name="{{ key }}" value="{{ val }}"> <label for="{{ val }}">{{ val }}</label> </p>';
                }
            }
        }

        if (valsSplit.length == 2) {
            var argsList = [];

            for (var k = 0; k < valsSplit[0].split(',').length; k++) {
                if (valsSplit[0].split(',')[k].toLowerCase().trim() == '<entity>') {
                    // deal with global entities
                    for (var p = 0; p < entityList.length; p++) {
                        argsList.push(entityList[p]);
                    }
                    break;
                }
                if (valsSplit[0].split(',')[k].trim() != '') {
                    argsList.push(valsSplit[0].split(',')[k].trim());
                }
            }

            for (var q = 0; q < argsList.length; q++) {
                var newVals = [];
                newVals.push(argsList[q]);
                newVals.push(argsSplit[0].trim());

                for (var x = 0; x < valsSplit[1].split('|').length; x++) {
                    if (valsSplit[1].split('|')[x].trim() != '') {
                        newVals.push(valsSplit[1].split('|')[x].trim());
                    }
                }

                if (newVals.length > 1) {
                    configVals.push(newVals);
                    var dropdownOptionHtml = '';
                    for (var v = 2; v < newVals.length; v++) {
                        dropdownOptionHtml += '<option value="' + newVals[1] + ': ' + newVals[v] + '">' + newVals[v] + '</option>';
                    }
                    document.getElementById('attribute-dropdowns').innerHTML += '<p><input type="text" list="' + newVals[1] + newVals[0] + '" placeholder="' + newVals[1] + '" name="values" class="dropdown input-field"><datalist id="' + newVals[1] + newVals[0] + '">' + dropdownOptionHtml + '</datalist></p>';
                }
            }
        }
    }
    return [configArgs, configVals];
}

function toggleAttributeDisplay(type, value) {
    // Update display of specified attributes
    if (type == 'checkbox') {
        const checkboxes = $('input[type=checkbox]');

        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].style.display = value;
            checkboxes[i].labels[0].style.display = value;
        }
    } else if (type == 'dropdown') {
        $('input[name=values]').css('display', value);
        $('input[name=values]').val('');
    }
}


function toggleAttributeCheck(vals, data) {
    /*
    Toggle check-status of specified attributes
    */
    for (var i = 0; i < vals.length; i++) {
        $('#' + vals[i].id).prop('checked', data);
    }
}


function resetAttributeValues() {
    /*
    Reset all dropdown lists
    to their default values
    */

    for (var i = 0; i < $('select').length; i++) {
        var currentSelectId = $('select')[i].id;

        if (currentSelectId == 'match-list') {
            // Empty dropdown list
            document.getElementById(currentSelectId).options.length = 0;

            // Display default option
            var defaultOption = document.createElement('option');
            defaultOption.text = 'No match';
            document.getElementById(currentSelectId).add(defaultOption);
        }

        if (currentSelectId != 'switch-file-dropdown') {
            document.getElementById(currentSelectId).selectedIndex = 0;
        }
    }
}


function populateAnnotationDisplay(entityValue, attributeValues, highlightStartIndex, highlightEndIndex, annotationIdentifier) {
    /*
    Select the span of text highlighted by
    the user and display the selected annotation
    */
    setSelectionRange(document.getElementById('file-data'), highlightStartIndex, highlightEndIndex);
    displayAnnotation(entityValue, attributeValues, annotationIdentifier);
}


function setSelectionRange(element, startIndex, endIndex) {
    /*
    Set the selection range to match the
    span of text highlighted by the user
    */

    if (document.createRange && window.getSelection) {
        var range = document.createRange();
        range.selectNodeContents(element);

        var textNodes = getTextNodesIn(element);

        var foundStart = false;
        var charCount = 0;
        var endCharCount;
        for (var i = 0; i < textNodes.length; i++) {
            var textNode = textNodes[i];
            endCharCount = charCount + textNode.length;

            if (!foundStart && startIndex >= charCount && (startIndex < endCharCount)) {
                range.setStart(textNode, startIndex - charCount);
                foundStart = true;
            }
            if (foundStart && endIndex <= endCharCount) {
                range.setEnd(textNode, endIndex - charCount);
                break;
            }
            charCount = endCharCount;
        }
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(element);
        textRange.collapse(true);
        textRange.moveStart('character', startIndex);
        textRange.moveEnd('character', endIndex);
        textRange.select();
    }
}


function getTextNodesIn(node) {
    /*
    Helper function for updating the selection range
    */
    var textNodes = [];
    if (node.nodeType == 3) {
        textNodes.push(node);
    } else {
        var children = node.childNodes;
        for (var i = 0, len = children.length; i < len; ++i) {
            textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
        }
    }
    return textNodes;
}


function displayAnnotation(entityValue, attributeValues, annotationIdentifier) {
    /*
    Set the current selection range to
    display a chosen annotation class
    */
    var highlighted = window.getSelection().toString();

    // Get highlight color based on selected entity
    for (var i = 0; i < $('label').length; i++) {
        if ($('label')[i].innerText == entityValue) {
            highlightColor = colors[$('label')[i].getAttribute('colorIndex')];
            break;
        }
    }

    // Add annotation inline within the open document
    document.getElementById('file-data').contentEditable = 'true';
    document.execCommand('insertHTML', false, '<span class="annotation inline-annotation" id="' + annotationIdentifier + '-aid" style="background-color:' + highlightColor + '; color:black;">' + highlighted + '</span>');
    document.getElementById('file-data').contentEditable = 'false';

    // Keep track of offets for each annotation
    offsetList.push([annotationIdentifier, entityValue, attributeValues, highlighted]);

    // Construct annotation to be added to the annotation display panel
    var annotationClass = 'class="annotation displayed-annotation collapsible" output-id="T' + entityId + '"';
    var annotationId = 'id="' + annotationIdentifier + '"';
    var annotationStyle = 'style="background-color:' + highlightColor + ';'
    if (localStorage.getItem('theme') == 'dark') {
        annotationStyle += 'color: #1A1E24;"';
    } else {
        annotationStyle += '"'
    }

    // Add a dropdown that shows the attribute values of an annotation upon click
    var contentDiv = '<div for="annotation-' + annotationIdentifier + '" class="content"><p>';   
    for (var i = 0; i < attributeValues.length; i++) {
        contentDiv += '<p class="annotation-attribute" onClick="editAnnotation(this);">' + attributeValues[i] + '</p>';
    }
    // Add delete button
    contentDiv += '<div class="annotation-option-container"><a annotation-id="' + annotationIdentifier + '" class="annotation-icon delete-icon" onClick="deleteAnnotation(this);"><i class="fas fa-trash"></i></a></div></p></div>';
    
    // Display the section title based on the annotation entity category
    document.getElementById(entityValue + '-section').style.display = '';

    // Inject constructed annotation into display panel 
    document.getElementById(entityValue + '-section').innerHTML += '<p ' + annotationClass + ' ' + annotationId + ' ' + annotationStyle + '>' + highlighted + '</p>' + contentDiv;
}


function updateSelectedEntity(event) {
    var attributeCheckboxes = event.data.attributeCheckboxes;
    var attributeRadiobuttons = event.data.attributeRadiobuttons;
    var attributeDropdowns = event.data.attributeDropdowns;

    removeEntityStyling();

    if (activeEntity == $(this).val()) {
        activeEntity = '';

        // Deselect and remove hiding of all attributes
        toggleAttributeCheck(attributeCheckboxes, false);
        toggleAttributeCheck(attributeRadiobuttons, false);
        toggleAttributeDisplay('checkbox', 'none');
        toggleAttributeDisplay('dropdown', 'none');
        resetAttributeValues();
    } else {
        activeEntity = $(this).val();

        // Style selected entity
        $(this).next().css({
            marginLeft: '5%',
            transition : 'margin 300ms'
        });
    }
}


function removeEntityStyling() {
    // Remove styles from all entities
    $('.config-label').each(function() {
        $(this).css({
            marginLeft: '0',
            transition : 'margin 300ms'
        });
    });
}


function displayAttributes(event) {
    /*
    Dynamically display attributes
    based on the chosen entity
    */
    var configArgs = event.data.configArgs;
    var configVals = event.data.configVals;
    var attributeCheckboxes = event.data.attributeCheckboxes;
    var attributeDropdowns = event.data.attributeDropdowns;

    // Get selected radio button id
    var selected = $(this).context.id.substring(0, $(this).context.id.length - 6);

    // Deselect and remove hiding of all attributes
    toggleAttributeCheck(attributeCheckboxes, false);
    toggleAttributeDisplay('checkbox', '');
    toggleAttributeDisplay('dropdown', '');

    // Determine which checkboxes should be displayed
    var visibleCheckboxes = [];
    for (var i = 0; i < configArgs.length; i++) {
        if (configArgs[i][1] == selected) {
            visibleCheckboxes.push(configArgs[i][0]);
        }
    }

    // Determine which dropdowns should be displayed
    var visibleDropdowns = [];
    for (var i = 0; i < configVals.length; i++) {
        if (configVals[i][0] == selected) {
            visibleDropdowns.push(configVals[i][1] + configVals[i][0]);
        }
    }

    // Hide all unwanted checkboxes
    for (var i = 0; i < attributeCheckboxes.length; i++) {
        if (!visibleCheckboxes.includes(attributeCheckboxes[i].id)) {
            attributeCheckboxes[i].style.display = 'none';
            attributeCheckboxes[i].labels[0].style.display = 'none';
        }
    }

    // Hide all unwanted dropdowns
    for (var i = 0; i < attributeDropdowns.length; i++) {
        if (!visibleDropdowns.includes(attributeDropdowns[i].list.id)) {
            attributeDropdowns[i].style.display = 'none';
        }
    }
}


function updateExportUrl() {
    /*
    Construct a blob with the most up-to-date
    annotation list and map it to the save button
    */
    const openDocId = localStorage.getItem('openDocId');
    var saveButton = document.getElementById('save-annotation-file');
    var docName = localStorage.getItem('docName' + openDocId) + '.ann';

    // Construct list to be output
    var outputList = [];
    var annotationText = '';
    for (var i = 0; i < annotationList[openDocId].length; i++) {
        if (annotationList[openDocId][i].length > 1) {
            for (var j = 0; j < annotationList[openDocId][i].length; j++) {
                outputList.push(annotationList[openDocId][i][j]);
                annotationText += annotationList[openDocId][i][j];
            }
        } else {
            outputList.push(annotationList[openDocId][i]);
            annotationText += annotationList[openDocId][i];
        }
    }
    // Construct blob file
    var blob = new Blob(outputList, {type: 'text/plain'});

    // Release existing blob URL
    window.URL.revokeObjectURL(saveButton.href);

    // Map save button to most recent blob URL
    saveButton.href = URL.createObjectURL(blob);
    saveButton.download = docName;

    // Store annotations locally to avoid loss upon refreshing
    localStorage.setItem('annotationText' + openDocId, annotationText);
}


function highlightText() {
    /*
    Change colour of text highlighted by the user

    Context: This is done automatically, but to enable the user
    to be able to provide input into attribute text fields without
    losing their selection, this has to be performed manually
    */

    const openDocId = localStorage.getItem('openDocId');

    if (window.getSelection() == '') {
        // Prevent annotations from disappearing from display upon highlighting over them
        if (document.getElementById('highlighted') != null) {
            // Ignore selection
            $('#highlighted').replaceWith(function () { return this.innerHTML; });

            // Reset document text to default
            document.getElementById('file-data').innerText = localStorage.getItem('docText' + openDocId);

            // Repopulate all annotations and re-bind all events
            loadExistingAnnotations();
            bindCollapsibleEvents();
        } else {
            // Ignore selection
            $('#highlighted').replaceWith(function () { return this.innerHTML; });
        }
    } else {
        if (document.getElementById('highlighted') != null) {
            $('#highlighted').replaceWith(function () { return this.innerHTML; });
        }

        // Get selected text and index range
        var documentElement = document.getElementById('file-data');
        highlightText = window.getSelection().toString();
        var highlightRange = window.getSelection().getRangeAt(0);

        var preCaretRange = highlightRange.cloneRange();
        preCaretRange.selectNodeContents(documentElement);
        preCaretRange.setEnd(highlightRange.startContainer, highlightRange.startOffset);

        // Get length of selected text and precaret (excluding newline characters)
        highlightTextLength = highlightRange.toString().replace(/\n/g, '').length;
        preCaretStringLength = preCaretRange.toString().replace(/\n/g, '').length;

        // Color-highlight selected text
        document.getElementById('file-data').contentEditable = 'true';
        document.execCommand('insertHTML', false, '<span id="highlighted" style="background-color: rgb(79, 120, 255); color: white;">' + highlightText + '</span>');
        document.getElementById('file-data').contentEditable = 'false';
    }
}


function trueToHighlightIndicies(trueStartIndex, trueEndIndex) {
    /*
    Convert the true indicies (those that include newline characters)
    to highlight indicies (those that exclude newline characters). Calculation
    can be performed for either LF and CRLF newline types for documents
    created across various operating systems
    */

    const openDocId = localStorage.getItem('openDocId');

    var lineBreakValue = 1;
    if (localStorage.getItem('lineBreakType' + openDocId) == 'windows') {
        lineBreakValue = 2;
    }

    var documentNodes = document.getElementById('file-data').childNodes;
    var docText = '';
    for (var i = 0; i < documentNodes.length; i++) {
        if (documentNodes[i].nodeType == 3) {
            docText += documentNodes[i].textContent;
        } else if ($(documentNodes[i]).is('span')) {
            for (var j = 0; j < documentNodes[i].innerText.length; j++) {
                if (documentNodes[i].innerText[j] == '\n') {
                    for (var k = 0; k < lineBreakValue; k++) {
                        docText += '*';
                    }
                } else {
                    docText += documentNodes[i].innerText[j];
                }
            }
        } else {
            for (var k = 0; k < lineBreakValue; k++) {
                docText += '_';
            }
        }
    }

    var highlightStartIndex = trueStartIndex;
    var highlightEndIndex = trueEndIndex;
    for (var i = 0; i < trueEndIndex; i++) {
        if (i <= trueStartIndex && (docText[i] == '_' || docText == '*')) {
            highlightStartIndex--;
            highlightEndIndex--;
        } else if (i > trueStartIndex && docText[i] == '_') {
            highlightEndIndex--;
        }
    }

    return [highlightStartIndex, highlightEndIndex];
}


function highlightToTrueIndicies(preCaretStringLength, highlightTextLength) {
    /*
    Convert the highlight indicies (those that exclude newline characters)
    to true indicies (those that include newline characters). Calculation
    can be performed for either LF and CRLF (Linux & Windows) newline types,
    depending on the document type
    */

    const openDocId = localStorage.getItem('openDocId');

    var lineBreakValue = 1;
    if (localStorage.getItem('lineBreakType' + openDocId) == 'windows') {
        lineBreakValue = 2;
    }

    var docText = document.getElementById('file-data').innerText;

    var trueStartIndex = 0;
    var trueEndIndex;
    for (var i = 0; i < docText.length; i++) {
        if (preCaretStringLength == 0) {
            while (docText[i] == '\n') {
                trueStartIndex += lineBreakValue;
                i++;
            }

            trueEndIndex = trueStartIndex;
            while (highlightTextLength > 0) {
                if (docText[i] == '\n') {
                    trueEndIndex += lineBreakValue;
                } else {
                    highlightTextLength--;
                    trueEndIndex++;
                }
                i++;
            }
            break;
        } else if (docText[i] == '\n') {
            trueStartIndex += lineBreakValue;
        } else {
            preCaretStringLength--;
            trueStartIndex++;
        }
    }

    return [trueStartIndex, trueEndIndex];
}


function addAnnotation(event) {
    const openDocId = localStorage.getItem('openDocId');

    var attributeCheckboxes = event.data.attributeCheckboxes;
    var attributeRadiobuttons = event.data.attributeRadiobuttons;
    var attributeDropdowns = event.data.attributeDropdowns;

    var trueIndicies = highlightToTrueIndicies(preCaretStringLength, highlightTextLength);
    var trueStartIndex = trueIndicies[0];
    var trueEndIndex = trueIndicies[1];

    // Check whether selection is valid
    if (!validateAnnotationSelection(highlightText, attributeRadiobuttons)) {
        alert('Invalid annotation - have you highlighted a span of text and chosen an entity?');
        return;
    }

    var annotation = [];
    var attributeValues = [];
    var attributeData = [];

    // Construct formatted entity data
    var entityValue = $('input[type=radio]:checked')[0].id.substring(0, $('input[type=radio]:checked')[0].id.length - 6);
    entityData = 'T' + entityId + '\t' + entityValue + ' ' + trueStartIndex + ' ' + trueEndIndex + '\t' + underscoreString(highlightText) + '\n';
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
    if (annotationList[openDocId].length == 0) {
        annotationList[openDocId].push(annotation);
    } else {
        for (var i = 0; i < annotationList[openDocId].length; i++) {
            if (trueStartIndex < parseInt(annotationList[openDocId][i][0][0].split(' ')[1])) {
                annotationList[openDocId].splice(i, 0, annotation);
                break;
            } 
            
            if (i == (annotationList[openDocId].length - 1)) {
                annotationList[openDocId].push(annotation);
                break;
            }
        }
    }

    // Removes selection of newly-annotated text
    window.getSelection().removeAllRanges();

    // Reset all selections
    toggleAttributeCheck(attributeCheckboxes, false);
    toggleAttributeCheck(attributeRadiobuttons, false);
    toggleAttributeDisplay('checkbox', 'none');
    toggleAttributeDisplay('dropdown', 'none');
    resetAttributeValues();
    removeEntityStyling();
    activeEntity = '';

    // Reset scroll of config section
    document.getElementById('config-data').scrollTop = 0;

    // Clear ontology search field
    document.getElementById('ontology-search-input-field').value = '';

    // Feed prescription sentences into active learner
    if (entityValue == 'Prescription') {
        teachActiveLearner(highlightText, 1);
    }

    setupSession(isInitialSetup=false);
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

// Load annotations if user supplied existing annotation file
function loadExistingAnnotations() {
    const openDocId = localStorage.getItem('openDocId');

    // Reset annotation display list
    var save = $('#annotation-suggestion-container').detach();
    $('#annotation-data').empty().append(save);

    // Get open document text
    document.getElementById('file-data').innerText = localStorage.getItem('docText' + openDocId);

    // Add section titles to annotation panel
    for (var i = 0; i < entityList.length; i++) {
        document.getElementById('annotation-data').innerHTML += "<div id='" + entityList[i] + "-section' style='display:none;'><p class='section-title'>" + entityList[i] + "</p></div>";
    }

    // TO-DO: validate ann file annotations before trying to populate

    // Reset offset list
    offsetList = [];

    // Parse annotation data and populate annotation display
    var annotationIdentifier = 0;
    for (var i = 0; i < annotationList[openDocId].length; i++) {
        var attributeValues = [];
        var entityValue = '';
        var trueStartIndex = 0;
        var trueEndIndex = 0;
        var highlightStartIndex = 0;
        var highlightEndIndex = 0;

        for (var j = 0; j < annotationList[openDocId][i].length; j++) {
            var annotationWords = annotationList[openDocId][i][j][0].split('\t');
            var data = annotationWords[1].split(' ');

            if (annotationWords[0][0] == 'T') {
                var annotationId = parseInt(annotationWords[0].split('T')[1]);
                if (annotationId > entityId) {
                    entityId = annotationId
                }
                entityValue = data[0];

                trueStartIndex = parseInt(data[1]);
                trueEndIndex = parseInt(data[2]);

                var highlightIndicies = trueToHighlightIndicies(trueStartIndex, trueEndIndex);
                highlightStartIndex = highlightIndicies[0];
                highlightEndIndex = highlightIndicies[1];
            }
            
            if (annotationWords[0][0] == 'A') {
                var annotationId = parseInt(annotationWords[0].split('A')[1]);
                if (annotationId > attributeId) {
                    attributeId = annotationId
                }
                attributeValues.push(data[0] + ': ' + data[2]);
            }
        }
        populateAnnotationDisplay(entityValue, attributeValues, highlightStartIndex, highlightEndIndex, annotationIdentifier);
        annotationIdentifier++;
    }
    entityId++;
    attributeId++;

    window.getSelection().removeAllRanges();
}


function deleteAnnotation(event) {
    /*
    Delete clicked annotation from
    annotation and offset lists
    */

    const openDocId = localStorage.getItem('openDocId');

    var targetAnnotationIdentifier = parseInt(event.getAttribute('annotation-id'));

    // Finds correct annotation index based on offset list and removes annotation
    for (var i = 0; i < offsetList.length; i++) {
        if (offsetList[i][0] == targetAnnotationIdentifier) {
            annotationList[openDocId].splice(i, 1);
            offsetList.splice(i, 1);
            break;
        }
    }
    setupSession(isInitialSetup=false);
}


function adjustAnnotationUponHover(id, type) {
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
    for (var i = 0; i < offsetList.length; i++) {
        if (offsetList[i][0] == targetAnnotationIdentifier) {
            var title = 'Entity: ' + offsetList[i][1] + '\n';
            for (var j = 0; j < offsetList[i][2].length; j++) {
                title += offsetList[i][2][j];
            }
            document.getElementById(id).title = title;
            return;
        }
    }
}


function suggestCui(event) {
    /*
    Populate dropdown wthin relevant matches
    from ontology based on specified text
    */

    var queryType = event.data.type;
    var dropdown = document.getElementById('match-list');

    // Get input text from appropiate source
    var selectedTerm;
    if (queryType == 'highlight') {
        if (window.getSelection().anchorNode == null) {
            return;
        }
        selectedTerm = window.getSelection().anchorNode.textContent;
    } else if (queryType == 'search') {
        selectedTerm = document.getElementById('ontology-search-input-field').value;
    }

    // Prevent mapping of long sentences
    if (selectedTerm == null || selectedTerm.split(' ').length > 8) {
        return;
    }

    $.ajax({
        type: 'POST',
        url: 'suggest-cui/',
        async: false,
        data: {
            selectedTerm: selectedTerm
        },
        success: function (response) {
            // Empty dropdown list
            dropdown.options.length = 0;

            var matches = JSON.parse(response);
            if (matches.length > 0 && matches[0] != '') {
                // Display number of matches in dropdown
                var option = document.createElement('option');
                option.text = matches.length + ' matches found';
                dropdown.add(option);

                // Add matches to dropdown
                for (var i = 0; i < matches.length; i++) {
                    option = document.createElement('option');
                    option.text = matches[i].split(' :: ')[0];
                    option.title = matches[i].split(' :: ')[1];
                    dropdown.add(option);
                }
            } else {
                // Display default option in dropdown
                var option = document.createElement('option');
                option.text = 'No match';
                dropdown.add(option);
            }
        }
    });
}


function bindCollapsibleEvents() {
    /*
    Display collapsible upon clicking an annotation
    in the annotation display panel, to show the
    annotations' attributes
    */

    // Prevent mutliple bindings of same event
    $('.collapsible').unbind('click');

    // Add event to collapsibles
    $('.collapsible').on('click', function() {
        var collapsible = $(this);
        var content = collapsible.next();
        collapsible.toggleClass('active');
        if (collapsible.hasClass('active') ) {
            content.slideDown(200);
        } else {
            content.slideUp(200);
        };
    });

    showSuggestionInDocument();
}


function getAnnotationSuggestions() {
    const openDocId = localStorage.getItem('openDocId');

    // Reset suggestion quantity value and display loader
    document.getElementById('annotation-suggestion-quantity-value').innerText = '';
    document.getElementById('annotation-suggestion-quantity-loader').style.display = '';

    // Get open document text and existing annotations
    var docText = localStorage.getItem('docText' + openDocId);
    var docAnnotations = [];
    for (var i = 0; i < annotationList[openDocId].length; i++) {
        docAnnotations.push(annotationList[openDocId][i][0][0].split('\t')[2].trim());
    }

    predictionAjaxRequest = $.ajax({
        type: 'POST',
        async: true,
        url: 'suggest-annotations/',
        data: { 
            'docText': docText,
            'docAnnotations': JSON.stringify(docAnnotations)
        },
        success: function (response) {
            // Hide loader
            document.getElementById('annotation-suggestion-quantity-loader').style.display = 'none';

            // Parse suggestions
            var suggestions = JSON.parse(response);

            // Hide no suggestion message if suggestion(s) exist
            if (suggestions.length > 0) {
                // Display number of suggestions
                document.getElementById('annotation-suggestion-quantity-value').innerText = suggestions.length + ' annotation suggestions';

                // Get Prescription highlight color
                var entityType = 'Prescription';
                for (var i = 0; i < $('label').length; i++) {
                    if ($('label')[i].innerText == entityType) {
                        var highlightColor = colors[$('label')[i].getAttribute('colorIndex')];
                        break;
                    }
                }

                // Construct and display suggestions
                for (var i = 0; i < suggestions.length; i++) {
                    // Construct suggestion container
                    var suggestionId = 'suggestion-' + i;
                    var suggestionClass = 'class="annotation displayed-annotation collapsible suggestion"';
                    var suggestionStyle = 'style="background-color:' + highlightColor + ';'
                    if (localStorage.getItem('theme') == 'dark') {
                        suggestionStyle += 'color: #1A1E24;"';
                    } else {
                        suggestionStyle += '"'
                    }

                    // Populate collapsible with suggestion attributes
                    var suggestionAttributes = '';
                    var contentDiv = '<div for="' + suggestionId + '" class="content" style="background-color: #f1f1f1;"><p>';
                    for (var key in suggestions[i]) {
                        if (key != 'sentence' && suggestions[i][key]) {
                            contentDiv += '<p class="annotation-attribute" onClick="editSuggestion(this);">' + key + ': ' + suggestions[i][key] + '</p>';
                            suggestionAttributes += ' ' + key + '="' + suggestions[i][key] + '"';
                        }
                    }
                    
                    // Add accept and reject buttons to collapsible
                    contentDiv += '<div class="suggestion-option-container"><a suggestion-id=' + suggestionId + ' onClick="rejectSuggestion(this);"><button class="main-button suggestion-button red-button"><i class="fas fa-times"></i></button></a>';
                    contentDiv += '<a suggestion-id=' + suggestionId + ' onClick="acceptSuggestion(this);"><button class="main-button suggestion-button green-button"><i class="fas fa-check"></i></button></a></div></p></div>'

                    // Add suggestion to display
                    document.getElementById('annotation-suggestion-list').innerHTML += '<p id=' + suggestionId + ' ' + suggestionClass + ' ' + suggestionStyle + ' ' + suggestionAttributes + '>' + suggestions[i]['sentence'] + '</p>' + contentDiv;
                }
            } else {
                // Reset suggestions
                document.getElementById('annotation-suggestion-quantity-value').innerText = 'No annotation suggestions';
                document.getElementById('annotation-suggestion-list').innerText = '';
            }
        }
    }).done(function () {
        bindCollapsibleEvents();
    });
}


// Add annotation to annotation list upon acceptance of suggestion
function acceptSuggestion(event) {
    var suggestionId = event.getAttribute('suggestion-id');

    // Get accepted annotation
    var annotation = document.getElementById(suggestionId);
    // var annotationText = annotation.innerText;

    // Remove collapsible assocaited with accepted annotation
    for (var i = 0; i < annotation.parentNode.childNodes.length; i++) {
        if (annotation.parentNode.childNodes[i].getAttribute('for') == suggestionId) {
            annotation.parentNode.removeChild(annotation.parentNode.childNodes[i]);
        }
    }
    // Remove from suggestion list
    annotation.parentNode.removeChild(annotation);

    // Select text to annotate
    window.find(annotation.innerText);
    highlightText();

    // Set Prescription entity
    document.getElementById('Prescription-radio').click();

    // Populate Prescription attributes
    var attributeDropdowns = $('input[name=values]');
    for (var i = 0; i < attributeDropdowns.length; i++) {
        if (attributeDropdowns[i].getAttribute('list') == 'DrugNamePrescription') {
            attributeDropdowns[i].value = annotation.getAttribute('DrugName');
        } else if (attributeDropdowns[i].getAttribute('list') == 'DrugDosePrescription') {
            attributeDropdowns[i].value = annotation.getAttribute('DrugDose');
        } else if (attributeDropdowns[i].getAttribute('list') == 'DoseUnitPrescription') {
            attributeDropdowns[i].value = annotation.getAttribute('DoseUnit');
        } else if (attributeDropdowns[i].getAttribute('list') == 'FrequencyPrescription') {
            attributeDropdowns[i].value = annotation.getAttribute('Frequency');
        }
    }

    // Populate ontology dropdown with best matches
    $('#ontology-search-input-field').val(annotation.getAttribute('CUIPhrase')).trigger('input');

    // Select best match from ontology dropdown
    if (document.getElementById('match-list').length > 1) {
        document.getElementById('match-list').selectedIndex = 1;
    }

    // Add annotation
    document.getElementById('add-annotation').click();

    // Update count of annotations in suggestion panel
    updateSuggestionCount();
    
    // Train active learner
    // teachActiveLearner(annotationText, 1);
}


function editAnnotation(element) {
    /*
    const name = $(element).text().split(': ')[0].trim();
    const value = $(element).text().split(': ')[1].trim();
    const updatedValue = prompt('Updated value (' + name + ')', value);

    if (updatedValue) {
        $(element).text(name + ': ' + updatedValue);
    }

    const forId = $(element).parent().attr('for').split('-')[1];
    const targetId = $('#' + forId).attr('output-id');
    for (let i = 0; i < annotationList[openDocId].length; i++) {
        const annotation = annotationList[openDocId][i];
        const annotationId = annotation[0][0].split('\t')[0];
        const annotationName = annotation[0][0].split('\t')[1].split(' ')[0];

        if (annotationId == targetId && annotationName == name) {
            for (let j = 1; j < annotation.length; j++) {
                let components = annotation[j][0].split('\t');
                if (name == components[1].split(' ')[0]) {
                    let subComponents = components[1].split(' ');
                    subComponents[2] = updatedValue + '\n';
                    components[1] = subComponents.join(' ');
                }
                annotationList[openDocId][i][j] = [components.join('\t')];
            }
            updateExportUrl();
            break;
        }
    }
    */
}

function showSuggestionInDocument() {
    const openDocId = localStorage.getItem('openDocId');

    var currentHTML;

    $('.suggestion').mouseenter(function () {
        // Hide annotations
        currentHTML = $('#file-data').html();
        $('#file-data').text(
            localStorage.getItem('docText' + openDocId)
        );
        let updatedHTML = $('#file-data').html();

        // Get location of suggestion
        let suggestionText = $(this).text();
        let index = updatedHTML.indexOf(suggestionText);

        if (index > -1) { 
            // Construct updated html with highlighted suggestion
            updatedHTML = (
                updatedHTML.substring(0, index) +
                    '<span style="background-color: yellow;">' +
                    updatedHTML.substring(index, index + suggestionText.length) +
                    '</span>' +
                    updatedHTML.substring(index + suggestionText.length)
            );
            // Update document
            $('#file-data').html(updatedHTML);
        }
    });

    $('.suggestion').mouseleave(function () {
        $('#file-data').html(currentHTML);
    });
}


function editSuggestion(element) {
    const name = $(element).text().split(': ')[0].trim();
    const value = $(element).text().split(': ')[1].trim();
    const updatedValue = prompt('Updated value (' + name + ')', value);

    if (updatedValue) {
        $(element).text(name + ': ' + updatedValue);
    }

    const forId = $(element).parent().attr('for');
    $('#' + forId).attr(name, updatedValue);
}


function rejectSuggestion(element) {
    var suggestionId = element.getAttribute('suggestion-id');

    // Get rejected annotation
    var annotation = document.getElementById(suggestionId);

    // Train active learner
    teachActiveLearner(annotation.innerText, 0);
    
    // Remove collapsible assocaited with rejected annotation
    for (var i = 0; i < annotation.parentNode.childNodes.length; i++) {
        if (annotation.parentNode.childNodes[i].getAttribute('for') == suggestionId) {
            annotation.parentNode.removeChild(annotation.parentNode.childNodes[i]);
        }
    }
    // Remove rejected annotation
    annotation.parentNode.removeChild(annotation);

    // Update count of annotations in suggestion panel
    updateSuggestionCount();
}


function updateSuggestionCount() {
    /*
    Update the count of annotations in
    suggestion panel upon accepting or 
    rejecting a suggestion
    */

    var quantity = document.getElementById('annotation-suggestion-quantity-value').innerText.split(' ')[0];
    if (quantity - 1 > 0) {
        if (quantity - 1 == 1) {
            document.getElementById('annotation-suggestion-quantity-value').innerText = '1 annotation suggestion';
        } else {
            document.getElementById('annotation-suggestion-quantity-value').innerText = quantity - 1 + ' annotation suggestions';
        }
    } else {
        document.getElementById('annotation-suggestion-quantity-value').innerText = 'No annotation suggestions';
        resetSuggestionCollapsible();
    }
}


function teachActiveLearner(sentence, label) {
    $.ajax({
        type: 'POST',
        url: 'teach-active-learner/',
        data: {
            'sentence': sentence,
            'label': label
        }
    });
}


function switchSuggestionPanel() {
    // Remove suggestions from list
    document.getElementById('annotation-suggestion-list').innerText = '';

    // Close suggestion collapsible
    resetSuggestionCollapsible();

    // Abort any ongoing annotation predictions
    predictionAjaxRequest.abort();
}


function resetSuggestionCollapsible() {
    /*
    Close suggestion collapsible if open
    */
    var collapsible = $('#annotation-suggestion-quantity');
    var content = collapsible.next();
    collapsible.toggleClass('active');
    content.slideUp(200);
}

var activeEntity;
var predictionAjaxRequest;
var annotationList = [];
var entityList = [];
var offsetList = [];
var entityId = 1;
var attributeId = 1;
var highlightText, highlightTextLength, preCaretStringLength;
var colors = [
    '#7B68EE', '#FFD700', '#FFA500', '#DC143C', '#FFC0CB', '#00BFFF', '#FFA07A',
    '#C71585', '#32CD32', '#48D1CC', '#FF6347', '#8FE3B4', '#FF69B4', '#008B8B',
    '#FF0066', '#0088FF', '#44FF00', '#FF8080', '#E6DAAC', '#FFF0F5', '#FFFACD',
    '#E6E6FA', '#B22222', '#4169E1', '#C0C0C0', 
];
