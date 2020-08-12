$(document).ready(function () {
    onPageLoad();
});


function onPageLoad(initalLoad=true) {
    // Read local data of files user selected
    var documentOpenType = localStorage.getItem('documentOpenType');
    var documentCount = localStorage.getItem('documentCount');

    var documentText = localStorage.getItem('documentText' + currentDocumentId);
    var configText = localStorage.getItem('configText');

    setRequestHeader(getCookie('csrftoken'));

    if (initalLoad) {
        if (documentOpenType == 'multiple') {
            // Display arrows to move forward or backwards by file
            document.getElementById('move-to-previous-file').style.display = '';
            document.getElementById('move-to-next-file').style.display = '';

            // Display dropdown menu to jump between files
            document.getElementById('switch-file').style.display = '';
    
            // Populate navigation menu
            for (var i = 0; i < documentCount; i++) {
                document.getElementById('switch-file-dropdown').innerHTML += '<option value="' + localStorage.getItem('fileName' + currentDocumentId) + '" documentId="' + i + '">' + localStorage.getItem('fileName' + i) + '</option>';
            }
        }    

        annotationList = [];
        for (var i = 0; i <= documentCount; i++) {
            annotationList.push([]);
        }

        for (var j = 0; j <= documentCount; j++) {
            var currentAnnotationText = localStorage.getItem('annotationText' + j);
            if (currentAnnotationText != null) {
                parseExistingAnnotations(currentAnnotationText, j);
            }
        }
    }

    // Set page title to open document file name
    document.getElementsByTagName('title')[0].innerText = localStorage.getItem('fileName' + currentDocumentId) + ' - Markup';

    // Check that documentText is not empty, otherwise return to homepage
    validateDocumentSelection(documentText);

    // Display selected documentText
    document.getElementById('file-data').innerText = documentText;

    if (initalLoad) {
        // Parse data from configuration file
        var parsedConfigData = parseConfigurationData(configText);
        entityList = parsedConfigData[0];
        var attributeSentences = parsedConfigData[1];

        // Display entity configuration list
        displayEntityConfigurations(entityList);

        // Display attributes configuration list
        var detailedConfigValues = displayAttributeConfigurations(entityList, attributeSentences);
        var configArgs = detailedConfigValues[0];
        var configVals = detailedConfigValues[1];

        // Update display based on users' preference
        updateDisplayMode();

        // Allow users to change the display mode
        $('#darkMode').click(switchDisplayMode);

        // Get all configuration elements for manipulation
        var attributeCheckboxes = $('input[type=checkbox]');
        var attributeRadiobuttons = $('input[type=radio]');
        var attributeDropdowns = $('input[name=values]');

        // Initialise all configurations boxes
        toggleAttributeDisplay(attributeCheckboxes, 'checkbox', 'none');
        toggleAttributeDisplay(attributeDropdowns, 'dropdown', 'none');

        // Display correct attributes upon clicking an entity
        $('input[type=radio]').click({
            'configArgs': configArgs,
            'configVals': configVals,
            'attributeCheckboxes': attributeCheckboxes,
            'attributeDropdowns': attributeDropdowns
        }, displayDynamicAttributes);

        // Change colour of highlighted text
        $('#file-data').mouseup(function () {
            changeHighlightedTextColor();
        });

        // Display information about annotation and adjust brightness on hover (annotation-data panel)
        $('#annotation-data').mouseover(function (e) {
            adjustAnnotationUponHover(e.target.id, 'annotation-data');
        });

        // Display information about annotation and adjust brightness on hover (file-data panel)
        $('#file-data').mouseover(function (e) {
            adjustAnnotationUponHover(e.target.id, 'file-data');
        });

        // Enable navigation between opened files via dropdown selection
        $('#switch-file-dropdown').change(function () {
            currentDocumentId = $('option:selected', this).attr('documentId');
            onPageLoad(false);
            switchSuggestionPanel();
            getAnnotationSuggestions();
        });
        
        // Move to next when multiple documents opened
        $('#move-to-next-file').click(function () {
            if (currentDocumentId < documentCount-1) {
                currentDocumentId++;
                document.getElementById('switch-file-dropdown').selectedIndex = currentDocumentId;
                onPageLoad(false);
                switchSuggestionPanel();
                getAnnotationSuggestions();
            }
        });

        // Move to previous when multiple documents opened
        $('#move-to-previous-file').click(function () {
            if (currentDocumentId > 0) {
                currentDocumentId--;
                document.getElementById('switch-file-dropdown').selectedIndex = currentDocumentId;
                onPageLoad(false);
                switchSuggestionPanel();
                getAnnotationSuggestions();
            }
        });

        // Prevent highlighting of move-to-next-file arrow button on double click
        $('#move-to-next-file').mousedown(function(e){ e.preventDefault(); });

        // Prevent highlighting of move-to-previous-file arrow button on double click
        $('#move-to-previous-file').mousedown(function(e){ e.preventDefault(); });

        // Allow users to add an annotation
        $('#add-annotation').click({
            'attributeCheckboxes': attributeCheckboxes,
            'attributeDropdowns': attributeDropdowns,
            'attributeRadiobuttons': attributeRadiobuttons
        }, addAnnotation);

        // Suggest most relevant UMLS matches based on highlighted term 
        $('#file-data').mouseup({'type': 'match-list'}, suggestCui);

        // Suggest most relevant UMLS matches based on searched term
        $('#search-dict').on('input', {'type': 'search-list'}, suggestCui);

        // Prompt user to save annotations before leaving page
        $('a[name=nav-element]').click(function() {
            $(window).bind('beforeunload', function(){
                return 'You have unsaved changes, are you sure you want to leave?';
            });
        });

        // Predict annotations for open document
        getAnnotationSuggestions();
    }

    // Load annotations from current annotationList
    loadExistingAnnotations();

    // Add blob link to export annotations
    updateAnnotationFileURL();
    
    // Add events to all annotation dropdowns
    bindCollapsibleEvents();
}

function validateDocumentSelection(documentText) {
    /*
    Return to homepage if an invalid document is selected
    */
    if (documentText == null || documentText.trim() == '') {
        alert('This document is empty. Please double-check the file you selected.');
    }
}


function parseConfigurationData(configText) {
    /*
    Parse configuration data from specified config file
    */

    var configSentences = configText.split('\n');
    var configValues = [];
    var configKey = '';

    var entityList = [];
    var isEntitySentence = false;

    for (var i = 0; i < configSentences.length; i++) {
        var configSentence = configSentences[i];

        if (configSentence == '') {
            continue;
        }

        if (isEntitySentence && configSentence[0] != '[') {
            entityList.push(configSentence);
        } else if (configSentence[0] != '[') {
            configValues.push(configSentence);
        }

        // Check for list title (e.g. [entities], [attributes]) within sentence
        if (configSentence.length >= 3 && configSentence[0] == '[' && configSentence[configSentence.length - 1] == ']') {
            configKey = configSentence.slice(1, configSentence.length - 1);

            // Check whether following lines contain entity data
            if (configKey.toLowerCase() == 'entities') {
                isEntitySentence = true;
            } else if (isEntitySentence) {
                isEntitySentence = false;
            }
            continue;
        }
    }

    return [entityList, configValues];
}


function parseAttributeData(attributeSentences) {
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


function displayEntityConfigurations(entityList) {
    /*
    Display entity configuration list in side panel
    */
    for (var i = 0; i < entityList.length; i++) {
        document.getElementById('entities').innerHTML += '<p class="config-value-row"><input type="radio" id="' + entityList[i] + '-radio" name="entities" value="' + entityList[i] + '-radio"><label colorIndex="' + i + '"style="background-color:' + colors[i] + ';" class="config-label" for="' + entityList[i] + '-radio">' + entityList[i] + '</label></p>';
    }
    document.getElementById('entities').innerHTML += '<br>';
}


function displayAttributeConfigurations(entityList, configValues) {
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


function updateDisplayMode() {
    /*
    Updates display mode based on users' preference
    */
    var backgroundColor, oppositeBackgroundColor, similarBackgroundColor, color;

    if (localStorage.getItem('mode') == 'dark') {
        document.getElementById('darkMode').innerHTML = 'Light Mode';
        backgroundColor = '#1A1E24';
        oppositeBackgroundColor = '#f1f1f1';
        similarBackgroundColor = '#31363d'
        color = 'white';
    } else {
        document.getElementById('darkMode').innerHTML = 'Dark Mode';
        backgroundColor = '#f1f1f1';
        oppositeBackgroundColor = '#1A1E24';
        similarBackgroundColor = '#e7e7e7';
        color = '#1A1E24';
    }

    $('body').css({
        'background-color': backgroundColor,
        'color': color
    });

    $('nav').css({
        'background-color': backgroundColor
    });

    $('.nav-logo').css({
        'color': color
    });

    $('.nav-item').css({
        'color': color
    });

    $('.nav-item-arrow').css({
        'color': '#33FFB5'
    });

    $('.section-title').css({
        'color': color
    });

    $('.inline-annotation').each(function () {
        $(this).css('color', 'black');
    });

    $('.displayed-annotation').each(function () {
        $(this).css('color', 'black');
    });

    $('#annotation-suggestion-quantity').css({
        'background-color': similarBackgroundColor,
        'color': color
    });

    $('#annotation-suggestion-list').css({
        'backgroundColor': similarBackgroundColor
    });

    var loaderDivs = document.getElementsByClassName('lds-ellipsis');
    for (var i = 0; i < loaderDivs.length; i++) {
        for (var j = 0; j < loaderDivs[i].childNodes.length; j++) {
            loaderDivs[i].childNodes[j].style.background = oppositeBackgroundColor;
        }
    }
}


function switchDisplayMode() {
    /*
    Enable users to switch between
    light and dark display modes
    */
    if (localStorage.getItem('mode') == 'dark') {
        localStorage.setItem('mode', 'light');
    } else {
        localStorage.setItem('mode', 'dark');
    }
    updateDisplayMode();
}


function toggleAttributeDisplay(vals, type, data) {
    /*
    Toggle display of specified attributes
    */
    for (var i = 0; i < vals.length; i++) {
        if (type == 'checkbox') {
            vals[i].style.display = data;
            vals[i].labels[0].style.display = data;
        } else if (type == 'dropdown') {
            vals[i].style.display = data;
            vals[i].value = '';
        }
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


function resetDropdowns() {
    /*
    Reset all dropdown lists
    to their default values
    */

    for (var i = 0; i < $('select').length; i++) {
        var currentSelectId = $('select')[i].id;

        if (currentSelectId == 'match-list' || currentSelectId == 'search-list') {
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
    var annotationClass = 'class="annotation displayed-annotation collapsible"';
    var annotationId = 'id="' + annotationIdentifier + '"';
    var annotationStyle = 'style="background-color:' + highlightColor + ';'
    if (localStorage.getItem('mode') == 'dark') {
        annotationStyle += 'color: #1A1E24;"';
    } else {
        annotationStyle += '"'
    }

    // Add a dropdown that shows the attribute values of an annotation upon click
    var contentDiv = '<div class="content"><p>';   
    for (var i = 0; i < attributeValues.length; i++) {
        contentDiv += '<p class="annotation-attribute">' + attributeValues[i] + '</p>';
    }
    // Add edit and delete buttons
    contentDiv += '<a annotation-id="' + annotationIdentifier + '" class="annotation-icon delete-icon" onClick="deleteAnnotation(this);"><i class="fas fa-trash"></i></a>';
    contentDiv += '<a annotation-id="' + annotationIdentifier + '" class="annotation-icon edit-icon" onClick="alert(\'Ability to edit coming soon!\');"><i class="fas fa-edit"></i></a></p></div>';
    
    // Display the section title based on the annotation entity category
    document.getElementById(entityValue + '-section').style.display = '';

    // Inject constructed annotation into display panel 
    document.getElementById(entityValue + '-section').innerHTML += '<p ' + annotationClass + ' ' + annotationId + ' ' + annotationStyle + '>' + highlighted + '</p>' + contentDiv;
}


function displayDynamicAttributes(event) {
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
    toggleAttributeDisplay(attributeCheckboxes, 'checkbox', '');
    toggleAttributeDisplay(attributeDropdowns, 'dropdown', '');

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


function updateAnnotationFileURL() {
    /*
    Construct a blob with the most up-to-date
    annotation list and map it to the save button
    */
    var saveButton = document.getElementById('save-annotation-file');
    var fileName = localStorage.getItem('fileName' + currentDocumentId) + '.ann';

    // Construct list to be output
    var outputList = [];
    var annotationText = '';
    for (var i = 0; i < annotationList[currentDocumentId].length; i++) {
        if (annotationList[currentDocumentId][i].length > 1) {
            for (var j = 0; j < annotationList[currentDocumentId][i].length; j++) {
                outputList.push(annotationList[currentDocumentId][i][j]);
                annotationText += annotationList[currentDocumentId][i][j];
            }
        } else {
            outputList.push(annotationList[currentDocumentId][i]);
            annotationText += annotationList[currentDocumentId][i];
        }
    }
    // Construct blob file
    var blob = new Blob(outputList, {type: 'text/plain'});

    // Release existing blob URL
    window.URL.revokeObjectURL(saveButton.href);

    // Map save button to most recent blob URL
    saveButton.href = URL.createObjectURL(blob);
    saveButton.download = fileName;

    // Store annotations locally to avoid loss upon refreshing
    localStorage.setItem('annotationText' + currentDocumentId, annotationText);
}


function changeHighlightedTextColor() {
    /*
    Change colour of text highlighted by the user

    Context: This is done automatically, but to enable the user
    to be able to provide input into attribute text fields without
    losing their selection, this has to be performed manually
    */

    if (window.getSelection() == '') {
        // Prevent annotations from disappearing from display upon highlighting over them
        if (document.getElementById('highlighted') != null) {
            // Ignore selection
            $('#highlighted').replaceWith(function () { return this.innerHTML; });

            // Reset document text to default
            document.getElementById('file-data').innerText = localStorage.getItem('documentText' + currentDocumentId);

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
    var lineBreakValue = 1;
    if (localStorage.getItem('lineBreakType' + currentDocumentId) == 'windows') {
       lineBreakValue = 2;
    }

    var documentNodes = document.getElementById('file-data').childNodes;
    var documentText = '';
    for (var i = 0; i < documentNodes.length; i++) {
        if (documentNodes[i].nodeType == 3) {
            documentText += documentNodes[i].textContent;
        } else if ($(documentNodes[i]).is('span')) {
            for (var j = 0; j < documentNodes[i].innerText.length; j++) {
                if (documentNodes[i].innerText[j] == '\n') {
                    for (var k = 0; k < lineBreakValue; k++) {
                        documentText += '*';
                    }
                } else {
                    documentText += documentNodes[i].innerText[j];
                }
            }
        } else {
            for (var k = 0; k < lineBreakValue; k++) {
                documentText += '_';
            }
        }
    }
    console.log(documentText);

    var highlightStartIndex = trueStartIndex;
    var highlightEndIndex = trueEndIndex;
    for (var i = 0; i < trueEndIndex; i++) {
        if (i <= trueStartIndex && (documentText[i] == '_' || documentText == '*')) {
            highlightStartIndex--;
            highlightEndIndex--;
        } else if (i > trueStartIndex && documentText[i] == '_') {
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
    var lineBreakValue = 1;
    if (localStorage.getItem('lineBreakType' + currentDocumentId) == 'windows') {
        lineBreakValue = 2;
    }

    var documentText = document.getElementById('file-data').innerText;

    var trueStartIndex = 0;
    var trueEndIndex;
    for (var i = 0; i < documentText.length; i++) {
        if (preCaretStringLength == 0) {
            while (documentText[i] == '\n') {
                trueStartIndex += lineBreakValue;
                i++;
            }

            trueEndIndex = trueStartIndex;
            while (highlightTextLength > 0) {
                if (documentText[i] == '\n') {
                    trueEndIndex += lineBreakValue;
                } else {
                    highlightTextLength--;
                    trueEndIndex++;
                }
                i++;
            }
            break;
        } else if (documentText[i] == '\n') {
            trueStartIndex += lineBreakValue;
        } else {
            preCaretStringLength--;
            trueStartIndex++;
        }
    }

    return [trueStartIndex, trueEndIndex];
}


function addAnnotation(event) {
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
    var searchList = document.getElementById('search-list');

    var options = [
        [matchList.options[matchList.selectedIndex].text, matchList.options[matchList.selectedIndex].title],
        [searchList.options[searchList.selectedIndex].text, searchList.options[searchList.selectedIndex].title]
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
    if (annotationList[currentDocumentId].length == 0) {
        annotationList[currentDocumentId].push(annotation);
    } else {
        for (var i = 0; i < annotationList[currentDocumentId].length; i++) {
            if (trueStartIndex < parseInt(annotationList[currentDocumentId][i][0][0].split(' ')[1])) {
                annotationList[currentDocumentId].splice(i, 0, annotation);
                break;
            } 
            
            if (i == (annotationList[currentDocumentId].length - 1)) {
                annotationList[currentDocumentId].push(annotation);
                break;
            }
        }
    }

    // Removes selection of newly-annotated text
    window.getSelection().removeAllRanges();

    // Reset all selections
    toggleAttributeCheck(attributeCheckboxes, false);
    toggleAttributeCheck(attributeRadiobuttons, false);
    toggleAttributeDisplay(attributeCheckboxes, 'checkbox', 'none');
    toggleAttributeDisplay(attributeDropdowns, 'dropdown', 'none');
    resetDropdowns();

    // Clear ontology search field
    document.getElementById('search-dict').value = '';

    onPageLoad(false);
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
function parseExistingAnnotations(annotationText, documentId) {
    if (annotationText == null || annotationText.trim() == '') { return; }

    var annotationSentences = annotationText.split('\n');

    annotation = [];
    for (var i = 0; i < annotationSentences.length; i++) {
        if (annotationSentences[i][0] == 'T' && annotation.length != 0) {
            annotationList[documentId].push(annotation);
            annotation = [];
            annotation.push([annotationSentences[i] + '\n']);
        } else if (annotationSentences[i][0] == 'T') {
            annotation.push([annotationSentences[i] + '\n']);
        } else if (annotationSentences[i][0] == 'A') {
            annotation.push([annotationSentences[i] + '\n']);
        }
    }
    annotationList[documentId].push(annotation);
}


// Load annotations if user supplied existing annotation file
function loadExistingAnnotations() {
    // Reset annotation display list
    var save = $('#annotation-suggestion-container').detach();
    $('#annotation-data').empty().append(save);

    // Get open document text
    document.getElementById('file-data').innerText = localStorage.getItem('documentText' + currentDocumentId);

    // Add section titles to annotation panel
    for (var i = 0; i < entityList.length; i++) {
        document.getElementById('annotation-data').innerHTML += "<div id='" + entityList[i] + "-section' style='display:none;'><p class='section-title'>" + entityList[i] + "</p></div>";
    }

    // TO-DO: validate ann file annotations before trying to populate

    // Reset offset list
    offsetList = [];

    // Parse annotation data and populate annotation display
    var annotationIdentifier = 0;
    for (var i = 0; i < annotationList[currentDocumentId].length; i++) {
        var attributeValues = [];
        var entityValue = '';
        var trueStartIndex = 0;
        var trueEndIndex = 0;
        var highlightStartIndex = 0;
        var highlightEndIndex = 0;

        for (var j = 0; j < annotationList[currentDocumentId][i].length; j++) {
            var annotationWords = annotationList[currentDocumentId][i][j][0].split('\t');
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

    var targetAnnotationIdentifier = parseInt(event.getAttribute('annotation-id'));

    // Finds correct annotation index based on offset list and removes annotation
    for (var i = 0; i < offsetList.length; i++) {
        if (offsetList[i][0] == targetAnnotationIdentifier) {
            annotationList[currentDocumentId].splice(i, 1);
            offsetList.splice(i, 1);
            break;
        }
    }
    onPageLoad(false);
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

    var dropdownId = event.data.type;
    var dropdown = document.getElementById(dropdownId);

    // Get input text from appropiate source
    var selectedTerm;
    if (dropdownId == 'match-list') {
        if (window.getSelection().anchorNode == null) {
            return;
        }
        selectedTerm = window.getSelection().anchorNode.textContent;
    } else if (dropdownId == 'search-list') {
        selectedTerm = document.getElementById('search-dict').value;
    }

    // Prevent mapping of long sentences
    if (selectedTerm.split(' ').length > 8) {
        return;
    }

    $.ajax({
        type: 'POST',
        url: '~/suggest-cui',
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
            }else {
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
    $('.collapsible').on('click', function(e) {
        var collapsible = $(this);
        var content = collapsible.next();
        collapsible.toggleClass('active');
        if (collapsible.hasClass('active') ) {
            content.slideDown(200);
        } else {
            content.slideUp(200);
        };
    });
}


function getAnnotationSuggestions() {
    // Reset suggestion quantity value and display loader
    document.getElementById('annotation-suggestion-quantity-value').innerText = '';
    document.getElementById('annotation-suggestion-quantity-loader').style.display = '';

    // Get open document text and existing annotations
    var documentText = localStorage.getItem('documentText' + currentDocumentId);
    var documentAnnotations = [];
    for (var i = 0; i < $('.displayed-annotation').length; i++) {
        documentAnnotations.push($('.displayed-annotation')[i].innerText);
    }

    suggestAnnotationAjaxRequest = $.ajax({
        type: 'POST',
        url: '~/suggest-annotations',
        data: { 
            'documentText': documentText,
            'documentAnnotations': JSON.stringify(documentAnnotations)
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
                    var suggestionClass = 'class="annotation displayed-annotation collapsible"';
                    var suggestionStyle = 'style="background-color:' + highlightColor + ';'
                    if (localStorage.getItem('mode') == 'dark') {
                        suggestionStyle += 'color: #1A1E24;"';
                    } else {
                        suggestionStyle += '"'
                    }

                    // Populate collapsible with suggestion attributes
                    var suggestionAttributes = '';
                    var contentDiv = '<div for="' + suggestionId + '" class="content"><p>';
                    for (var key in suggestions[i]) {
                        if (key != 'sentence' && suggestions[i][key]) {
                            contentDiv += '<p class="annotation-attribute">' + key + ': ' + suggestions[i][key] + '</p>';
                            suggestionAttributes += ' ' + key + '="' + suggestions[i][key] + '"';
                        }
                    }
                    
                    // Add accept and reject buttons to collapsible
                    contentDiv += '<div class="suggestion-option-container"><a suggestion-id=' + suggestionId + ' onClick="rejectSuggestion(this);"><button class="main-button red-button" style="font-size: 15px; width: 2.5vw; cursor: pointer;"><i class="fas fa-times"></i></button></a>';
                    contentDiv += '<a suggestion-id=' + suggestionId + ' onClick="acceptSuggestion(this);"><button class="main-button green-button" style="font-size: 15px; width: 2.5vw; cursor: pointer;"><i class="fas fa-check"></i></button></a></div></p></div>'

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
        // Add events to all suggestion dropdowns
        bindCollapsibleEvents();
    });
}


// Add annotation to annotation list upon acceptance of suggestion
function acceptSuggestion(event) {
    var suggestionId = event.getAttribute('suggestion-id');

    // Get accepted annotation
    var annotation = document.getElementById(suggestionId);

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
    changeHighlightedTextColor();

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
    $('#search-dict').val(annotation.getAttribute('CUIPhrase')).trigger('input');

    // Select best match from ontology dropdown
    if (document.getElementById('search-list').length > 1) {
        document.getElementById('search-list').selectedIndex = 1;
    }

    // Add annotation
    document.getElementById('add-annotation').click();

    // Update count of annotations in suggestion panel
    updateAnnotationSuggestions();
}


function rejectSuggestion(event) {
    var suggestionId = event.getAttribute('suggestion-id');

    // Get rejected annotation
    var annotation = document.getElementById(suggestionId);
    
    // Remove collapsible assocaited with rejected annotation
    for (var i = 0; i < annotation.parentNode.childNodes.length; i++) {
        if (annotation.parentNode.childNodes[i].getAttribute('for') == suggestionId) {
            annotation.parentNode.removeChild(annotation.parentNode.childNodes[i]);
        }
    }
    // Remove rejected annotation
    annotation.parentNode.removeChild(annotation);

    // Update count of annotations in suggestion panel
    updateAnnotationSuggestions();
}


function updateAnnotationSuggestions() {
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


function switchSuggestionPanel() {
    // Remove suggestions from list
    document.getElementById('annotation-suggestion-list').innerText = '';

    // Close suggestion collapsible
    resetSuggestionCollapsible();

    // Abort any ongoing annotation predictions
    suggestAnnotationAjaxRequest.abort();
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


// Define global variables here just to make it clear they're in global scope
var suggestAnnotationAjaxRequest;
var annotationList, entityList;
var offsetList = [];
var currentDocumentId = 0;
var entityId = 1;
var attributeId = 1;
var highlightText, highlightTextLength, preCaretStringLength;
var colors = [
    '#7B68EE', '#FFD700', '#FFA500', '#DC143C', '#FFC0CB', '#00BFFF', '#FFA07A',
    '#C71585', '#32CD32', '#48D1CC', '#FF6347', '#8FE3B4', '#FF69B4', '#008B8B',
    '#FFF0F5', '#FFFACD', '#E6E6FA', '#B22222', '#4169E1', '#C0C0C0'
];
