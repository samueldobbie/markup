var colors = [
    "#7B68EE", "#FFD700", "#FFA500", "#DC143C", "#FFC0CB", "#00BFFF", "#FFA07A",
    "#C71585", "#32CD32", "#48D1CC", "#FF6347", "#2E8B57", "#FF69B4", "#008B8B",
    "#FFF0F5", "#FFFACD", "#E6E6FA", "#B22222", "#4169E1", "#C0C0C0"
];

var annotationList;
var offsetList = [];
var entityId = 1;
var attributeId = 1;
var darkMode;

// Function to get csrftoken from cookie
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


// Function to set Request Header with `CSRFTOKEN`
function setRequestHeader(csrftoken){
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}


// Return to homepage if an invalid document is selected // TO-DO: Do this during the setup stage
function validateDocumentSelection(documentText) {
    if (documentText == null || documentText.trim() == '') {
        alert('This document is empty. Redirecting to the homepage!')
        location.href = '/';
    }
}


// Parse configuration values from file and display entity list
function parseConfigurationValues(configText) {
    var addEntities = false;
    var entityList = [];
    var configKey = '';
    var configValues = [];
    var configSentences = configText.split('\n');
    for (var i = 0; i < configSentences.length; i++) {
        var sent = configSentences[i];

        if (sent == '') {
            continue;
        }

        if (addEntities) {
            entityList.push(sent);
        }

        if (sent.length >= 3 && sent[0] == '[' && sent[sent.length - 1] == ']') {
            if (configKey != '') {
                if (document.getElementById(configKey) != null) {
                    for (var j = 0; j < configValues.length; j++) {
                        // TO-DO: Replace styling with classes
                        document.getElementById(configKey).innerHTML += '<p style="margin:0; margin-top:3px; padding:0;"><input type="radio" id="' + configValues[j] + '-radio" name="' + configKey + '" value="' + configValues[j] + '-radio"> <label colorIndex="' + j + '"style="border-radius:5px; padding:0 5px; background-color:' + colors[j] + '; color:black;" class="l" for="' + configValues[j] + '-radio">' + configValues[j] + '</label> </p>';
                    }
                    document.getElementById(configKey).innerHTML += '<br>';
                }
                configValues = [];
            }
            configKey = sent.slice(1, sent.length - 1);

            if (addEntities) {
                addEntities = false;
            }

            if (configKey.toLowerCase() == 'entities') {
                addEntities = true;
            }
            continue;
        }
        configValues.push(sent);
    }

    if (entityList.length - 1 >= 0) {
        entityList.splice(entityList.length - 1, 1);
    }

    return [configValues, entityList];
}


// Display configuration values
function displayConfigurationValues(configValues, entityList) {
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
                    document.getElementById('attribute-checkboxes').innerHTML += '<p style="margin:0; padding:0;"> <input type="checkbox" id="{{ val }}" name="{{ key }}" value="{{ val }}"> <label for="{{ val }}">{{ val }}</label> </p>';
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
                    document.getElementById('attribute-dropdowns').innerHTML += '<p style="margin:0; padding:0;"><input style="outline:none; padding:5px; border:radius:5px;" type="text" list="' + newVals[1] + newVals[0] + '" placeholder="' + newVals[1] + '" name="values" class="dropdown" style="padding:2px;"/><datalist id="' + newVals[1] + newVals[0] + '">' + dropdownOptionHtml + '</datalist></p>';
                }
            }
        }
    }
    return [configArgs, configVals];
}


// Checks if user has preset preference for display mode
function checkUserDisplayPreference() {
    if (localStorage.getItem('mode') == 'light') {
        document.getElementById('darkMode').innerHTML = 'Dark Mode';
        backgroundColor = '#f7f7f7';
        textColor = 'black';
        darkMode = false;

        $('.sectionTitle').css({
            'color': textColor
        });
    } else {
        document.getElementById('darkMode').innerHTML = 'Light Mode';
        for (var i = 0; i < document.getElementsByTagName('select').length; i++) {
            document.getElementById(document.getElementsByTagName('select')[i].id).style.backgroundColor = 'white';
        }
        backgroundColor = '#333';
        textColor = 'rgb(210, 210, 210)';

        $('.sectionTitle').css({
            'color': textColor
        });

        darkMode = true;
    }

    $('body').css({
        'background-color': backgroundColor,
        'color': textColor
    });

    $('.inlineAnnotation').each(function () {
        $(this).css('color', 'black');
    });

    $('.displayedAnnotation').each(function () {
        $(this).css('color', 'black');
    });
}


// Allows users to switch between to light and dark mode
function switchDisplayMode() {
    if (!darkMode) {
        localStorage.setItem('mode', 'dark');
        checkUserDisplayPreference();
    } else {
        localStorage.setItem('mode', 'light');
        checkUserDisplayPreference();
    }
}


// Toggle display of specified attributes
function toggleAttributeDisplay(vals, type, data) {
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


// Toggle check-status of specified attributes
function toggleAttributeCheck(vals, data) {
    for (var i = 0; i < vals.length; i++) {
        $('#' + vals[i].id).prop('checked', data);
    }
}


// Reset specified dropdown lists
function resetDropdowns(vals) {
    for (var i = 0; i < vals.length; i++) {
        document.getElementById(vals[i].id).selectedIndex = 0;
    }
}


function highlightRange(entityValue, attributeValues, startIndex, endIndex, trueStartIndex, trueEndIndex) {
    setSelectionRange(document.getElementById('file-data'), startIndex, endIndex);
    populateAnnotations(entityValue, attributeValues, trueStartIndex, trueEndIndex);
}


function setSelectionRange(el, start, end) {
    if (document.createRange && window.getSelection) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var textNodes = getTextNodesIn(el);
        var foundStart = false;
        var charCount = 0, endCharCount;

        for (var i = 0, textNode; textNode = textNodes[i++];) {
            endCharCount = charCount + textNode.length;
            if (!foundStart && start >= charCount && (start < endCharCount || (start == endCharCount && i <= textNodes.length))) {
                range.setStart(textNode, start - charCount);
                foundStart = true;
            }
            if (foundStart && end <= endCharCount) {
                range.setEnd(textNode, end - charCount);
                break;
            }
            charCount = endCharCount;
        }

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(true);
        textRange.moveEnd('character', end);
        textRange.moveStart('character', start);
        textRange.select();
    }
}


function getTextNodesIn(node) {
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


function populateAnnotations(entityValue, attributeValues, startIndex, endIndex) {
    var highlighted = window.getSelection().toString();

    // Get highlight color
    for (var i=0; i<$('label').length; i++) {
        if ($('label')[i].innerText == entityValue) {
            highlightColor = colors[$('label')[i].getAttribute('colorIndex')];
            break;
        }
    }

    // Deal with error where ann file contains invalid annotations
    //try {
        // Color-highlight selected text
    document.getElementById('file-data').contentEditable = 'true';
    document.execCommand('insertHTML', false, '<span class="inlineAnnotation" id="' + startIndex + '-' + endIndex + '-aid" style="background-color:' + highlightColor + '; color:black;">' + highlighted + '</span>');
    document.getElementById('file-data').contentEditable = 'false';
    //} catch {
    //    return;
    //}

    var entityHoverInfo = [];
    var attributeHoverInfo = [];

    // Add entity data to annotation list and hover info
    if (entityValue != null) {
        entityHoverInfo.push(entityValue);
    }

    // Prepare attribute data to annotation list and add hover info
    if (attributeValues != null) {
        attributeHoverInfo.push(attributeValues);
    }

    // Keep track of offets for each annotation
    offsetList.push([startIndex, endIndex, entityHoverInfo, attributeHoverInfo, highlighted]);

    // Add annotation to annotaion-data display
    var annotationClass = 'class="displayedAnnotation collapsible"';
    var annotationId = 'id="' + startIndex + '-' + endIndex + '"';
    var annotationStyle = 'style="background-color:' + highlightColor + ';'
    if (darkMode) {
        annotationStyle += 'color:black;"';
    } else {
        annotationStyle += '"'
    }

    var contentDiv = '<div class="content"><p>';

    for (var i = 0; i < attributeHoverInfo[0].length; i++) {
        contentDiv += '<p>' + attributeHoverInfo[0][i] + '</p>';
    }
    
    contentDiv += '<a annotation-id="' + startIndex + '-' + endIndex + '" style="color: red; cursor: pointer;" onClick="deleteClickedAnnotation(this);">Delete annotation</a></p></div>';

    document.getElementById(entityValue + '-section').style.display = '';
    document.getElementById(entityValue + '-section').innerHTML += '<p ' + annotationClass + ' ' + annotationId + ' ' + annotationStyle + '>' + highlighted + '</p>' + contentDiv;
};


// Dynamic attribute displaying based on chosen entity
function displayDynamicAttributes(event) {
    var configArgs = event.data.configArgs;
    var configVals = event.data.configVals;
    var attributeCheckboxes = event.data.attributeCheckboxes;
    var attributeDropdowns = event.data.attributeDropdowns;

    // Get selected radiobutton id
    var selected = $(this).context.id.substring(0, $(this).context.id.length - 6);

    // Deselect and remove hiding of all attributes
    toggleAttributeCheck(attributeCheckboxes, false);
    toggleAttributeDisplay(attributeCheckboxes, 'checkbox', '');
    toggleAttributeDisplay(attributeDropdowns, 'dropdown', '');

    // Determine which attributes should be displayed
    var visibleCheckboxes = [];
    for (var i = 0; i < configArgs.length; i++) {
        if (configArgs[i][1] == selected) {
            visibleCheckboxes.push(configArgs[i][0]);
        }
    }

    var visibleDropdowns = [];
    for (var i = 0; i < configVals.length; i++) {
        if (configVals[i][0] == selected) {
            visibleDropdowns.push(configVals[i][1] + configVals[i][0]);
        }
    }

    // Hide all unwanted attributes
    for (var i = 0; i < attributeCheckboxes.length; i++) {
        if (!visibleCheckboxes.includes(attributeCheckboxes[i].id)) {
            attributeCheckboxes[i].style.display = 'none';
            attributeCheckboxes[i].labels[0].style.display = 'none';
        }
    }

    // Hide all unwanted attributes
    for (var i = 0; i < attributeDropdowns.length; i++) {
        if (!visibleDropdowns.includes(attributeDropdowns[i].list.id)) {
            attributeDropdowns[i].style.display = 'none';
        }
    }
};


function updateAnnotationFileURL() {
    var a = document.getElementById('save-annotation-file');
    var fileName = localStorage.getItem('fileName' + currentDocumentId) + '.ann';
    var contentType = 'text/plain';

    var finalList = [];
    annotationText = '';
    for (var i = 0; i < annotationList[currentDocumentId].length; i++) {
        if (annotationList[currentDocumentId][i].length > 1) {
            for (var j = 0; j < annotationList[currentDocumentId][i].length; j++) {
                finalList.push(annotationList[currentDocumentId][i][j]);
                annotationText += annotationList[currentDocumentId][i][j];
            }
        } else {
            finalList.push(annotationList[currentDocumentId][i]);
            annotationText += annotationList[currentDocumentId][i];
        }
    }

    var blob = new Blob(finalList, { type: contentType });
    window.URL.revokeObjectURL(a.href);
    a.href = URL.createObjectURL(blob);
    a.download = fileName;

    localStorage.setItem('annotationText' + currentDocumentId, annotationText);
}



var highlightText;
var highlightTextLength;
var preCaretStringLength;

// Change colour of highlighted text
function changeHighlightedTextColor() {
    if (window.getSelection() == '') {
        // Prevent annotations from disappearing from visual display upon highlighting over them
        if (document.getElementById('highlighted') != null) {
            $('#highlighted').replaceWith(function () { return this.innerHTML; });
            document.getElementById('file-data').innerText = localStorage.getItem('documentText' + currentDocumentId);
            loadExistingAnnotations();
        } else {
            $('#highlighted').replaceWith(function () { return this.innerHTML; });
        }
    } else {
        if (document.getElementById('highlighted') != null) {
            $('#highlighted').replaceWith(function () { return this.innerHTML; });
        }

        // Create deep copy of current selection
        // currentSelection = jQuery.extend(true, {}, window.getSelection());

        var documentElement = document.getElementById('file-data');

        highlightText = window.getSelection().toString();
        
        var highlightRange = window.getSelection().getRangeAt(0);

        var preCaretRange = highlightRange.cloneRange();
        preCaretRange.selectNodeContents(documentElement);
        preCaretRange.setEnd(highlightRange.startContainer, highlightRange.startOffset);

        highlightTextLength = highlightRange.toString().replace(/\n/g, '').length;
        preCaretStringLength = preCaretRange.toString().replace(/\n/g, '').length;


        // Color-highlight selected text
        document.getElementById('file-data').contentEditable = 'true';
        document.execCommand('insertHTML', false, '<span id="highlighted" style="background-color: rgb(79, 120, 255); opacity: 0.9">' + highlightText + '</span>');
        document.getElementById('file-data').contentEditable = 'false';
    }
}


function isAlphanumeric(char) {
    return "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-".indexOf(char) > -1;
}


function trueToHighlightIndicies(trueStartIndex, trueEndIndex) {
    var documentText = document.getElementById('file-data').innerText;

    var lineBreakValue = 1;
    if (localStorage.getItem('lineBreakType' + currentDocumentId) == 'windows') {
        lineBreakValue = 2;
    }

    var beforeSpanNewlineCount = 0;
    var withinSpanNewlineCount = 0;
    for (var i = 0; i < documentText.length; i++) {
        if (i == trueEndIndex - 1) {
            break;
        } else if (i < trueStartIndex && documentText[i] == '\n') {
            beforeSpanNewlineCount++
        } else if (i >= trueStartIndex && documentText[i] == '\n') {
            withinSpanNewlineCount++;
        }
    }

    var highlightStartIndex = trueStartIndex - (beforeSpanNewlineCount * lineBreakValue);
    var highlightEndIndex = trueEndIndex - ((beforeSpanNewlineCount + withinSpanNewlineCount) * lineBreakValue);

    return [highlightStartIndex, highlightEndIndex];
}


function highlightToTrueIndicies(preCaretStringLength, highlightTextLength) {
    var lineBreakValue = 1;
    if (localStorage.getItem('lineBreakType' + currentDocumentId) == 'windows') {
        lineBreakValue = 2;
    }

    var documentText = document.getElementById('file-data').innerText;

    var trueStartIndex = 0;
    for (var i = 0; i < documentText.length; i++) {
        if (preCaretStringLength == 0) {
            if (documentText[i] == '\n') {
                trueStartIndex += lineBreakValue;
            } else {
                break;
            }
        } else if (documentText[i] == '\n') {
            trueStartIndex += lineBreakValue;
        } else {
            preCaretStringLength--;
            trueStartIndex++;
        }
    }

    var trueEndIndex = trueStartIndex;

    if (trueStartIndex < documentText.length) {
        for (var i = trueStartIndex; i < documentText.length; i++) {
            if (highlightTextLength == 0) {
                break;
            } else if (documentText[i] != '\n') {
                trueEndIndex++;
                highlightTextLength--;
            } else {
                trueEndIndex += lineBreakValue;
            }
        }
    } else {
        trueEndIndex += highlightTextLength;
    }

    return [trueStartIndex, trueEndIndex];
}


function addAnnotation(event) {
    var attributeCheckboxes = event.data.attributeCheckboxes;
    var attributeRadiobuttons = event.data.attributeRadiobuttons;
    var attributeDropdowns = event.data.attributeDropdowns;
    var allDropdowns = event.data.allDropdowns;

    var startIndex = preCaretStringLength;
    var endIndex = highlightTextLength + preCaretStringLength;

    var trueIndicies = highlightToTrueIndicies(preCaretStringLength, highlightTextLength);
    var trueStartIndex = trueIndicies[0];
    var trueEndIndex = trueIndicies[1];

    /*
    TO-DO
    while (isAlphanumeric(documentText[startIndex])) {
        startIndex--;
    }
    while (isAlphanumeric(documentText[endIndex])) {
        endIndex++;
    }
    */

    // Check whether selected text is valid
    if (!validateAnnotationSelection(highlightText, attributeRadiobuttons)) {
        document.getElementById('entities').style.color = 'red';
        return;
    }

    // Get highlight color
    for (var i=0; i<$('label').length; i++) {
        if ($('label')[i].getAttribute('for') == $('input[type=radio]:checked')[0].id) {
            highlightColor = colors[$('label')[i].getAttribute('colorIndex')];
        }
    }

    /*
    // Change annotation color if there's an overlap between two annotations TO-DO
    for (var i = 0; i < offsetList.length; i++) {
        if ((startIndex >= offsetList[i][0] && startIndex <= offsetList[i][1]) || (endIndex >= offsetList[i][0] && endIndex <= offsetList[i][1])) {
            highlightColor = 'rgb(35, 200, 130)';
            break;
        }
    }
    */

    // Color-highlight selected text
    document.getElementById('file-data').contentEditable = 'true';
    document.execCommand('insertHTML', false, '<span class="inlineAnnotation" id="' + trueStartIndex + '-' + trueEndIndex + '-aid" style="background-color:' + highlightColor + '; color:black; padding:2px;">' + highlightText + '</span>');
    document.getElementById('file-data').contentEditable = 'false';

    // Output annotation in stand-off format
    var annotation = [];
    var entityHoverInfo = [];
    var attributeHoverInfo = [];

    // Add entity data to annotation list and hover info
    var entityValue = $('input[type=radio]:checked')[0].id.substring(0, $('input[type=radio]:checked')[0].id.length - 6);
    entityHoverInfo.push(entityValue);
    entityData = 'T' + entityId + '\t' + entityValue + ' ' + trueStartIndex + ' ' + trueEndIndex + '\t' + underscoreString(highlightText) + '\n';
    entityId++;

    annotation.push([entityData]);

    // Prepare attribute data to annotation list and add hover info
    var attributeValues = [];
    var attributeData = [];
    for (var i = 0; i < $('input[type=checkbox]:checked').length; i++) {
        var checkedAttribute = underscoreString($('input[type=checkbox]:checked')[i].id);
        attributeValues.push(checkedAttribute);
        attributeData.push('A' + attributeId + '\t' + checkedAttribute + ' T' + (entityId - 1) + '\n');
        attributeId++;
    }

    for (var i = 0; i < attributeDropdowns.length; i++) {
        var currentSelect = attributeDropdowns[i];
        if (currentSelect.value != '') {
            var currentValue = currentSelect.value.split(': ');

            if (currentValue.length == 1) {
                currentValue = [currentSelect.getAttribute('placeholder'), currentValue[0]];
            }

            var chosenField = currentValue[0];
            currentValue = underscoreString(currentValue[1]);
            attributeValues.push(chosenField + ': ', currentValue + '\n');
            attributeData.push('A' + attributeId + '\t' + chosenField + ' T' + (entityId - 1) + ' ' + currentValue + '\n');
            attributeId++;
        }
    }

    for (var i = 0; i < $('select').length; i++) {
        var currentSelect = $('select')[i];
        var currentValue = underscoreString(currentSelect.options[currentSelect.selectedIndex].value);

        if (currentValue != currentSelect[0].value && currentSelect.id == currentSelect[0].value + entityValue) {
            attributeValues.push(currentValue);
            attributeData.push('A' + attributeId + '\t' + currentSelect.options[0].value + ' T' + (entityId - 1) + ' ' + currentValue + '\n');
            attributeId++;
        }
    }

    // Get chosen option cui from dropdown and ignore if default selected or no matches found
    var suggestionList = document.getElementById('match-list');
    var option = suggestionList.options[suggestionList.selectedIndex].text;
    var optionWords = option.split(' ');

    if (!((optionWords[optionWords.length - 2] == 'matches' && optionWords[optionWords.length - 1] == 'found') || option == 'No match')) {
        var optionData = option.split(' :: ');
        var optionText = optionData[0];
        var optionCode = optionData[1].split(' ')[1];

        var term = 'A' + attributeId + '\tCUIPhrase' + ' T' + (entityId - 1) + ' ' + underscoreString(optionText) + '\n';
        attributeData.push(term);
        attributeValues.push('CUIPhrase: ', optionText, '\n');
        attributeId++;

        var cui = 'A' + attributeId + '\tCUI' + ' T' + (entityId - 1) + ' ' + optionCode + '\n';
        attributeData.push(cui);
        attributeValues.push('CUI: ', optionCode, '\n');
        attributeId++;
    }

    // TEMP: Get chosen option cui from dropdown and ignore if default selected or no matches found
    suggestionList = document.getElementById('search-list');
    option = suggestionList.options[suggestionList.selectedIndex].text;
    optionWords = option.split(' ');

    if (!((optionWords[optionWords.length - 2] == 'matches' && optionWords[optionWords.length - 1] == 'found') || option == 'No match')) {
        var optionData = option.split(' :: ');
        var optionText = optionData[0];
        var optionCode = optionData[1].split(' ')[1];
        
        var term = 'A' + attributeId + '\tCUIPhrase' + ' T' + (entityId - 1) + ' ' + underscoreString(optionText) + '\n';
        attributeData.push(term);
        attributeValues.push('CUIPhrase: ', optionText, '\n');
        attributeId++;

        var cui = 'A' + attributeId + '\tCUI' + ' T' + (entityId - 1) + ' ' + optionCode + '\n';
        attributeData.push(cui);
        attributeValues.push('CUI: ', optionCode, '\n');
        attributeId++;
    }

    attributeHoverInfo.push(attributeValues);

    // Add attributes to annotation list
    for (var i = 0; i < attributeData.length; i++) {
        annotation.push([attributeData[i]]);
    }

    // Add annotations to current-annotation list and offsets to offset list
    if (annotationList[currentDocumentId].length == 0) {
        annotationList[currentDocumentId].push(annotation);
        offsetList.push([trueStartIndex, trueEndIndex, entityHoverInfo, attributeHoverInfo, highlightText]);
    } else {
        for (var i=0; i < annotationList[currentDocumentId].length; i++) {
            if (trueStartIndex > parseInt(annotationList[currentDocumentId][i][0][0].split(' ')[1])) {
                annotationList[currentDocumentId].splice(i, 0, annotation);
                offsetList.splice(i, 0, [trueStartIndex, trueEndIndex, entityHoverInfo, attributeHoverInfo, highlightText]);
                break;
            } 
            
            if (i == (annotationList[currentDocumentId].length - 1)) {
                annotationList[currentDocumentId].push(annotation);
                offsetList.push([trueStartIndex, trueEndIndex, entityHoverInfo, attributeHoverInfo, highlightText]);
                break;
            }
        }
    }

    // Add annotation to annotaion-data display
    var annotationClass = 'class="displayedAnnotation collapsible"';
    var annotationId = 'id="' + trueStartIndex + '-' + trueEndIndex + '"';
    var annotationStyle = 'style="background-color:' + highlightColor + ';';
    if (darkMode) {
        annotationStyle += 'color:black;"';
    } else {
        annotationStyle += '"'
    }

    var contentDiv = '<div class="content"><p>';
    
    for (var i = 0; i < entityHoverInfo.length; i++) {
        contentDiv += '<p>Entity: ' + entityHoverInfo[i] + '</p>';
    }

    for (var i = 0; i < attributeHoverInfo.length; i++) {
        contentDiv += '<p>' + attributeHoverInfo[i] + '</p>';
    }
    
    contentDiv += '<a annotation-id="' + startIndex + '-' + endIndex + '" style="color: red; cursor: pointer;" onClick="deleteClickedAnnotation(this);">Delete annotation</a></p></div>';

    document.getElementById(entityValue + '-section').style.display = '';
    document.getElementById(entityValue + '-section').innerHTML += '<p ' + annotationClass + ' ' + annotationId + ' ' + annotationStyle + '>' + highlightText + '</p>' + contentDiv;

    // Removes selection of newly-annotated text
    window.getSelection().removeAllRanges();

    // Reset all selections and displays
    toggleAttributeCheck(attributeCheckboxes, false);
    toggleAttributeCheck(attributeRadiobuttons, false);
    toggleAttributeDisplay(attributeCheckboxes, 'checkbox', 'none');
    toggleAttributeDisplay(attributeDropdowns, 'dropdown', 'none');
    resetDropdowns(allDropdowns);

    updateAnnotationFileURL();
    loadExistingAnnotations();
    teachModel(highlightText, 1);
    bindCollapsibleEvents();
}


function validateAnnotationSelection(highlighted, attributeRadiobuttons) {
    var validAnnotation = false;
    for (var i = 0; i < attributeRadiobuttons.length; i++) {
        if (attributeRadiobuttons[i].checked) {
            validAnnotation = true;
            break;
        }
    }

    if (validAnnotation && highlighted.trim() != '' && highlighted != null) {
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
function setupExistingAnnotations(annotationText, documentId) {
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
    document.getElementById('annotation-data').innerText = '';
    document.getElementById('file-data').innerText = localStorage.getItem('documentText' + currentDocumentId);

    // Add sections to annotation-data display
    for (var i=0; i<entityList.length; i++) {
        document.getElementById("annotation-data").innerHTML += "<div id='" + entityList[i] + "-section' style='display:none;'><p class='sectionTitle'>" + entityList[i] + "</p></div>";
    }

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
        highlightRange(entityValue, attributeValues, highlightStartIndex, highlightEndIndex, trueStartIndex, trueEndIndex);
    }
    entityId++;
    attributeId++;
    window.getSelection().removeAllRanges();
}


// Delete clicked annotation
function deleteClickedAnnotation(event) {
    var id = event.getAttribute('annotation-id');
    var indicies = id.split('-');

    var targetStartIndex = parseInt(indicies[0]);
    var targetEndIndex = parseInt(indicies[1]);

    // Finds correct annotation index based on offset list and removes
    for (var i = 0; i < annotationList[currentDocumentId].length; i++) {
        var currentStartIndex = parseInt(annotationList[currentDocumentId][i][0][0].split(' ')[1]);
        var currentEndIndex = parseInt(annotationList[currentDocumentId][i][0][0].split(' ')[2].split('\t')[0]);

        if (currentStartIndex == targetStartIndex && currentEndIndex == targetEndIndex) {
            // Remove annotation and offset
            annotationList[currentDocumentId].splice(i, 1);
            offsetList.splice(i, 1);

            updateAnnotationFileURL();
            loadExistingAnnotations();
        }
    }
    bindCollapsibleEvents();
}


// Display information about chosen annotation on hover
function hoverInfo(id, type) {
    var indicies = id.split('-');
    var startIndex = indicies[0];
    var endIndex = indicies[1];

    // Reset inline annotations to original brightness
    var inlineAnnotations = document.getElementsByClassName('inlineAnnotation');
    for (var i = 0; i<inlineAnnotations.length; i++) {
        inlineAnnotations[i].style.filter = 'brightness(100%)';
    }

    // Reset displayed annotations to original brightness
    var displayedAnnotations = document.getElementsByClassName('displayedAnnotation');
    for (var i = 0; i<displayedAnnotations.length; i++) {
        displayedAnnotations[i].style.filter = 'brightness(100%)';
    }

    // Reset section titles to original brightness
    var sectionTitles = document.getElementsByClassName('sectionTitle');
    for (var i = 0; i<sectionTitles.length; i++) {
        sectionTitles[i].style.filter = 'brightness(100%)';
    }

    if (id != type && id != '' && parseInt(startIndex) >= 0 && parseInt(endIndex) >= 0) {
        // Reset brightness of inline and displayed target annotation
        document.getElementById(startIndex + '-' + endIndex).style.filter = 'brightness(115%)';
        document.getElementById(startIndex + '-' + endIndex + '-aid').style.filter = 'brightness(115%)';

        // Add hover information to target annotation
        for (var i = 0; i < offsetList.length; i++) {
            if (offsetList[i][0] == startIndex && offsetList[i][1] == endIndex) {
                for (var j = 2; j < 5; j++) {
                    if (offsetList[i][j].length == 0) {
                        offsetList[i][j] = 'None';
                    }
                }
                var titleString = 'Entity: ' + offsetList[i][2] + '\n';
                for (var k = 0; k < offsetList[i][3][0].length; k++) {
                    titleString += offsetList[i][3][0][k];
                }
                document.getElementById(id).title = titleString;
                return;
            }
        };
    }
}


var delay = function (elem, callback) {
    var timeout = null;
    elem.onmouseover = function() {
        // Set timeout to be a timer which will invoke callback after 1s
        timeout = setTimeout(callback, 1000);
    };

    elem.onmouseout = function() {
        // Clear any timers set to timeout
        clearTimeout(timeout);
    }
};


function suggestCui(event) {
    var type = event.data.type;
    var selectedTerm;

    // Determine mapping type (selection or direct search)
    if (type == 'match-list') {
        if (window.getSelection().anchorNode == null) {
            return;
        }
        selectedTerm = window.getSelection().anchorNode.textContent.toLowerCase();
    } else if (type == 'search-list') {
        selectedTerm = document.getElementById('search-dict').value.toLowerCase();
    }

    // Prevent attempted mapping of long sentences
    if (selectedTerm.split(' ').length > 8) {
        return;
    }

    alert(1);

    $.ajax({
        type: 'GET',
        url: '~/suggest-cui',
        data: { selectedTerm: selectedTerm }
    }).done(function (data) {
        // Empty dropdown list
        document.getElementById(type).options.length = 0;
        if (data != '') {
            var arr = data.split('***');
            var searchList = document.getElementById(type);
            var count = 0;
            var newOption = document.createElement('option');
            newOption.text = '';
            searchList.add(newOption);
            for (var i = 0; i < arr.length; i++) {
                newOption = document.createElement('option');
                newOption.text = arr[i];
                searchList.add(newOption);
                count = i;
            }
            count++;
            searchList.childNodes[0].nextElementSibling.text = count + ' matches found';
        }

        if (document.getElementById(type).options.length == 0) {
            var searchList = document.getElementById(type);
            var option = document.createElement('option');
            option.text = 'No match';
            searchList.add(option);
        }
    });
}


function resetEntityColor() {
    var col;
    if (darkMode == true) {
        col = 'white';
    } else {
        col = 'black';
    }
    document.getElementById('entities').style.color = col;
}


function bindCollapsibleEvents() {
    var coll = document.getElementsByClassName("collapsible");
    var i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    }
}


var currentDocumentId = 0;
$(document).ready(function () {
    onPageLoad();
});


var parsedConfigValues, configValues, entityList, detailedConfigValues, configArgs, configVals;
function onPageLoad(initalLoad=true) {
    // Read local data of files user selected
    var documentOpenType = localStorage.getItem('documentOpenType');
    var documentCount = localStorage.getItem('documentCount');

    var documentText = localStorage.getItem('documentText' + currentDocumentId);
    var configText = localStorage.getItem('configText');

    setRequestHeader(getCookie('csrftoken'));
    
    // Show buttons to navigate between multiple files
    if (documentOpenType == "multiple") {
        document.getElementById('previousFile').style.display = "";
        document.getElementById('nextFile').style.display = "";
    }

    if (initalLoad) {
        annotationList = [];
        for (var i=0; i<=documentCount; i++) {
            annotationList.push([]);
        }

        for (var j=0; j<=documentCount; j++) {
            var currentAnnotationText = localStorage.getItem('annotationText' + j);
            if (currentAnnotationText != null) {
                setupExistingAnnotations(currentAnnotationText, j);
            }
        }
    }

    // Set title to annotation file name
    document.getElementsByTagName('title')[0].innerText = localStorage.getItem('fileName' + currentDocumentId) + " - Markup";

    // Check that documentText isn't empty, otherwise return to homepage
    validateDocumentSelection(documentText);

    // Display selected documentText
    document.getElementById('file-data').innerText = documentText;

    if (initalLoad) {
        // Display 'entities' configuration list
        parsedConfigValues = parseConfigurationValues(configText);
        configValues = parsedConfigValues[0];
        entityList = parsedConfigValues[1];

        // Display 'attributes' configuration list
        detailedConfigValues = displayConfigurationValues(configValues, entityList);
        configArgs = detailedConfigValues[0];
        configVals = detailedConfigValues[1];

        // Check and set users' display mode preference
        checkUserDisplayPreference();

        // Allow users to change the display mode
        $('#darkMode').click(switchDisplayMode);

        // Get all configuration elements for manipulation
        var attributeCheckboxes = $('input[type=checkbox]');
        var attributeRadiobuttons = $('input[type=radio]');
        var attributeDropdowns = $('input[name=values]');
        var allDropdowns = $('select');

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
        $('#file-data').mouseup(changeHighlightedTextColor);

        // Display information about annotation on hover of annotation-data display
        $('#annotation-data').mouseover(function (eventObj) {
            hoverInfo(eventObj.target.id, 'annotation-data');
        });

        // Display information about annotation on hover of file-data display
        $('#file-data').mouseover(function (eventObj) {
            hoverInfo(eventObj.target.id, 'file-data');
        });

        // Allow users to add an annotation
        $('#add-annotation').click({
            'attributeCheckboxes': attributeCheckboxes,
            'attributeDropdowns': attributeDropdowns,
            'attributeRadiobuttons': attributeRadiobuttons,
            'allDropdowns': allDropdowns
        }, addAnnotation);

        // Allow users to see suggested annotations
        $('#view-suggestions').click(function () {
            viewSuggestions();
        });

        $('#train-annotation-suggestions').click(function () {
            trainModel();
        });

        $('#stop-training').click(function () {
            stopTraining();
        });

        $('#stop-viewing').click(function () {
            stopViewing();
        });

        // Allow users to delete clicked annotation
        // $('#annotation-data').on('click', '.displayedAnnotation', deleteClickedAnnotation);

        // Suggest most relevant UMLS matches based on highlighted term 
        $('#file-data').mouseup({'type': 'match-list'}, suggestCui);

        // Suggest most relevant UMLS matches based on searched term
        // Add delay to avoid too many requests
        $('#search-dict').keyup({'type': 'search-list'}, suggestCui);

        // Reset color of entities (which changes upon errors)
        $('input[name=entities]').click(resetEntityColor);

        // Prompt user to save annotations before leaving page
        $('a[name=nav-element]').click(function() {
            $(window).bind('beforeunload', function(){
                return 'You have unsaved changes, are you sure you want to leave?';
            });
        });

        // Move to next when multiple documents opened
        $('#nextFile').click(function () {
            if (currentDocumentId < documentCount-1) {
                currentDocumentId++;
                onPageLoad(false);
            }
        });

        // Move to previous when multiple documents opened
        $('#previousFile').click(function () {
            if (currentDocumentId > 0) {
                currentDocumentId--;
                onPageLoad(false);
            }
        });

        // Prevent highlighting of nextFile arrow button on double click
        $('#nextFile').mousedown(function(e){ e.preventDefault(); });

        // Prevent highlighting of previousFile arrow button on double click
        $('#previousFile').mousedown(function(e){ e.preventDefault(); });

        $('#good-annotation').click(function() {
            teachModel(null, 1);
            queryActiveLearner(currentTxtFile);
        });
        
        $('#bad-annotation').click(function() {
            teachModel(null, 0);
            queryActiveLearner(currentTxtFile);
        });

        // Initialise active learner
        initialiseActiveLearner(documentCount);
    }

    // Load annotations from current annotationList
    updateAnnotationFileURL();
    loadExistingAnnotations();

    bindCollapsibleEvents();
}


function teachModel(instance, label) {
    $.ajax({
        type: 'POST',
        async: false,
        data: {
            'instance': instance,
            'label': label,
        },
        url: '~/teach-active-learner'
    });
}


var currentTxtFile;
function trainModel() {
    document.getElementById('file-data').style.display = 'none';
    document.getElementById('train-annotation-suggestions').style.display = 'none';
    document.getElementById('view-suggestions').style.display = 'none';
    document.getElementById('config-data-options').style.display = 'none';
    document.getElementById('annotation-data').style.display = 'none';
    document.getElementById('train-model').style.display = '';
    document.getElementById('stop-training').style.display = '';

    // Change this to whatever the pool is for X
    currentTxtFile = localStorage.getItem('documentText' + currentDocumentId);
    queryActiveLearner(currentTxtFile);
}


function stopTraining() {
    document.getElementById('file-data').style.display = '';
    document.getElementById('train-annotation-suggestions').style.display = '';
    document.getElementById('view-suggestions').style.display = '';
    document.getElementById('config-data-options').style.display = '';
    document.getElementById('annotation-data').style.display = '';
    document.getElementById('train-model').style.display = 'none';
    document.getElementById('stop-training').style.display = 'none';
}


function viewSuggestions() {
    document.getElementById('file-data').style.display = 'none';
    document.getElementById('train-annotation-suggestions').style.display = 'none';
    document.getElementById('view-suggestions').style.display = 'none';
    document.getElementById('config-data-options').style.display = 'none';
    document.getElementById('annotation-data').style.display = 'none';
    document.getElementById('view-suggestions-list').style.display = '';
    document.getElementById('stop-viewing').style.display = '';
    
    // Loading -- TO-DO: get vectorized ngrams in the background to make it quicker
    sleep(500).then(() => {
        getAnnotationSuggestions();
    });
}


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


function stopViewing() {
    document.getElementById('file-data').style.display = '';
    document.getElementById('train-annotation-suggestions').style.display = '';
    document.getElementById('view-suggestions').style.display = '';
    document.getElementById('config-data-options').style.display = '';
    document.getElementById('annotation-data').style.display = '';
    document.getElementById('suggestion-list').innerText = '';
    document.getElementById('loading').style.display = '';
    document.getElementById('no-suggestions').style.display = 'none';
    document.getElementById('view-suggestions-list').style.display = 'none';
    document.getElementById('stop-viewing').style.display = 'none';
}

var abc = 5;
function queryActiveLearner(currentTxtFile) {
    /*
    var sentences = currentTxtFile.split('\n');
    var finalSentences = [];
    for (var i=0; i<sentences.length; i++) {
        if (sentences[i].trim() != '') {
            finalSentences.push(sentences[i].trim());
        }
    }
    document.getElementById('train-model-term').innerText = finalSentences[abc];
    abc++;
    */
    
    $.ajax({
        type: 'POST',
        async: false,
        url: '~/query-active-learner',
        data: {
            'txtFile': currentTxtFile,
        },
        success: function (response) {
            var result = response.split('***');
            document.getElementById('train-model-term').queryId = result[0];
            document.getElementById('train-model-term').innerText = result[1];
        }
    });
}


function initialiseActiveLearner(documentCount) {
    var txtFiles = [];
    var annFiles = [];
    for (var i=0; i<=documentCount; i++) {
        var documentText = localStorage.getItem('documentText' + i);
        var annotationText = localStorage.getItem('annotationText' + i);
        if (documentText != null && annotationText != null) {  
            txtFiles.push(documentText);
            annFiles.push(annotationText);
        }
    }

    $.ajax({
        type: 'POST',
        async: false,
        url: '~/initialise-active-learner',
        data: JSON.stringify({ 
            'txtFiles': txtFiles,
            'annFiles': annFiles,
        })
    });
}


function getAnnotationSuggestions() {
    // Only show suggestions if they haven't already been annotated

    var txtFile = localStorage.getItem('documentText' + currentDocumentId);
    var currentAnnotations = localStorage.getItem('annotationText' + currentDocumentId);

    // Get annotation suggestions
    $.ajax({
        type: 'POST',
        async: false,
        url: '~/get-annotation-suggestions',
        data: { 
            'txtFile': txtFile,
            'currentAnnotations': currentAnnotations,
        },
        success: function (response) {
            document.getElementById("loading").style.display = "none";

            var suggestions = JSON.parse(response);

            var suggestionCount = suggestions.length;
            if (suggestionCount == 0) {
                document.getElementById("no-suggestions").style.display = "";
            }

            for (var i=0; i<suggestionCount; i++) {
                document.getElementById('suggestion-list').innerHTML += '<br><span drugName="' + suggestions[i][1] + '" drugDose="' + suggestions[i][2] + '" drugUnit="' + suggestions[i][3] + '" frequency="' + suggestions[i][4] + '" class="suggestion standard-text" style="display:inline-block; background-color: #33FFB5; margin:15px; border-radius:15px; padding:5px;">' + suggestions[i][0] + '</span>';
            }
        }
    });
    
    $('.suggestion').click(function () {
        var documentText = document.getElementById('file-data').innerText;

        var highlighted = this.innerText;

        var highlightedIndex = 0;
        var startIndex = 0;

        for (var i=0; i<documentText.length; i++) {
            startIndex++;
            if (highlightedIndex == highlighted.length) {
                startIndex++;
                break;
            } else if (highlighted[highlightedIndex] == documentText[i]) {
                highlightedIndex++;
            } else {
                highlightedIndex = 0;
            }
        }
        var endIndex = startIndex + highlighted.length;

        // Output annotation in stand-off format
        var annotation = [];
        var entityHoverInfo = [];
        var attributeHoverInfo = [];

        // Add entity data to annotation list and hover info
        var entityValue = 'Prescription';
        entityHoverInfo.push(entityValue);
        entityData = 'T' + entityId + '\t' + entityValue + ' ' + startIndex + ' ' + endIndex + '\t' + underscoreString(highlighted) + '\n';
        entityId++;

        annotation.push([entityData]);

        // Prepare attribute data to annotation list and add hover info
        var attributeValues = [];
        var attributeData = [];

        var chosenField = 'DrugName';
        var currentValue = this.getAttribute('drugName');
        attributeValues.push(chosenField + ': ', currentValue + '\n');
        attributeData.push('A' + attributeId + '\t' + chosenField + ' T' + (entityId - 1) + ' ' + currentValue + '\n');
        attributeId++;

        chosenField = 'DrugDose';
        currentValue = this.getAttribute('drugDose');
        attributeValues.push(chosenField + ': ', currentValue + '\n');
        attributeData.push('A' + attributeId + '\t' + chosenField + ' T' + (entityId - 1) + ' ' + currentValue + '\n');
        attributeId++;

        chosenField = 'DrugUnit';
        currentValue = this.getAttribute('drugUnit');
        attributeValues.push(chosenField + ': ', currentValue + '\n');
        attributeData.push('A' + attributeId + '\t' + chosenField + ' T' + (entityId - 1) + ' ' + currentValue + '\n');
        attributeId++;

        chosenField = 'Frequency';
        currentValue = this.getAttribute('frequency');

        if (currentValue.trim() != '') {
            attributeValues.push(chosenField + ': ', currentValue + '\n');
            attributeData.push('A' + attributeId + '\t' + chosenField + ' T' + (entityId - 1) + ' ' + currentValue + '\n');
            attributeId++;
        }

        attributeHoverInfo.push(attributeValues);
    
        // Add attributes to annotation list
        for (var i = 0; i < attributeData.length; i++) {
            annotation.push([attributeData[i]]);
        }

        // Add annotations to current-annotation list and offsets to offset list
        if (annotationList[currentDocumentId].length == 0) {
            annotationList[currentDocumentId].push(annotation);
            offsetList.push([startIndex, endIndex, entityHoverInfo, attributeHoverInfo, highlighted]);
        } else {
            for (var i=0; i < annotationList[currentDocumentId].length; i++) {
                if (startIndex > parseInt(annotationList[currentDocumentId][i][0][0].split(' ')[1])) {
                    annotationList[currentDocumentId].splice(i, 0, annotation);
                    offsetList.splice(i, 0, [startIndex, endIndex, entityHoverInfo, attributeHoverInfo, highlighted]);
                    break;
                } 
                
                if (i == (annotationList[currentDocumentId].length - 1)) {
                    annotationList[currentDocumentId].push(annotation);
                    offsetList.push([startIndex, endIndex, entityHoverInfo, attributeHoverInfo, highlighted]);
                    break;
                }
            }
        }

        updateAnnotationFileURL();
        loadExistingAnnotations();
        teachModel(highlighted, 1);
        location.reload();

    });

}



/*
// Change annotation to new colour when hovered over in annotation data
function bindEvents() {
    //filter: brightness(50%);
    $('.displayedAnnotation').mouseover(function (e) {
        alert(2);
        document.getElementById(e.target.id).style.backgroundColor = 'pink';
        document.getElementById(e.target.id + '-aid').style.backgroundColor = 'pink';
    });

    // Return annotation to existing colour when stop hovering over in annotation data
    $('#annotation-data p').mouseout(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = '#33FFB5';
        document.getElementById(e.target.id + '-aid').style.backgroundColor = '#33FFB5';
    });

    // Change annotation to new colour when hovered over in file data
    $('#file-data span').mouseover(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = 'pink';
        document.getElementById(e.target.id.split('-aid')[0]).style.backgroundColor = 'pink';
    });

    // Change annotation to new colour when stop hovering over in file data
    $('#file-data span').mouseout(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = '#33FFB5';
        document.getElementById(e.target.id.split('-aid')[0]).style.backgroundColor = '#33FFB5';
    });
}


// Automatically annotate the document
function autoAnnotate() {
    var text = document.getElementById('file-data').innerHTML;
    var annotations = null;

    $.ajax({
        type: 'GET',
        async: false,
        url: '~/auto-annotate',
        data: { 'document-text': text },
        success: function (response) {
            annotations = JSON.parse(response);
        }
    });

    for (var i = 0; i < annotations.length; i++) {
        var startIndex = text.indexOf(annotations[i][0]);
        var endIndex = startIndex + annotations[i][0].length;
        var attributeValues = [[annotations[i][1]], [annotations[i][2]]];

        if (startIndex == -1) {
            continue;
        }

        annotationList.push([['T' + entityId + '\tDOB ' + startIndex + ' ' + endIndex + '\t' + annotations[i][0] + '\n'], ['A' + attributeId + '\t' + annotations[i][1] + '\tT' + entityId + '\n'], ['A' + (attributeId + 1) + '\t' + annotations[i][2] + '\tT' + entityId + '\n']]);

        entityId++;
        attributeId++;
        attributeId++;

        setSelectionRange(document.getElementById('file-data'), startIndex, endIndex);
        populateAnnotations('DOB', attributeValues, startIndex, endIndex);
    }
    //location.reload();
}


var clicks = 0;
$('#file-data').click(function () {
    if (window.getSelection().toString() == '' && clicks >= 2) {
        clicks = 0;
        return;
    }

    clicks++;

    if (clicks >= 3) {
        var doc = document.getElementById('file-data');
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(doc);
        preCaretRange.setEnd(range.startContainer, range.startOffset);

        startIndex = preCaretRange.toString().length;
        endIndex = startIndex + range.toString().length;
        endIndex++;

        while (doc.innerText[endIndex] != ' ' &&
            doc.innerText[endIndex] != '' &&
            doc.innerText[endIndex] != '.' &&
            doc.innerText[endIndex] != '\n' &&
            doc.innerText[endIndex] != '!' &&
            doc.innerText[endIndex] != ',' &&
            doc.innerText[endIndex] != ';' &&
            doc.innerText[endIndex] != ':' &&
            doc.innerText[endIndex] != '?') {
            endIndex++;
        }
        setSelectionRange(document.getElementById('file-data'), startIndex, endIndex);
    }
});


// FIX SINCE ALLOWING MULTIPLE FOCUS
$('#file-data').bind('contextmenu', function () {
    // TO-DO: Update UMLS suggestion on right-click

    if (window.getSelection().toString() == '' && clicks >= 2) {
        clicks = 0;
        return;
    }

    if (clicks >= 3) {
        var doc = document.getElementById('file-data');
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(doc);
        preCaretRange.setEnd(range.startContainer, range.startOffset);

        startIndex = preCaretRange.toString().length;
        endIndex = startIndex + range.toString().length;
        endIndex--;

        while (doc.innerText[endIndex] != ' ' &&
            doc.innerText[endIndex] != '' &&
            doc.innerText[endIndex] != '.' &&
            doc.innerText[endIndex] != '\n' &&
            doc.innerText[endIndex] != '!' &&
            doc.innerText[endIndex] != ',' &&
            doc.innerText[endIndex] != ';' &&
            doc.innerText[endIndex] != ':' &&
            doc.innerText[endIndex] != '?') {
            endIndex--;
        }

        setSelectionRange(document.getElementById('file-data'), startIndex, endIndex);
    }
    return false;
});


$('#exportHighlighted').click(function () {
    var entities = [];
    var annotations = [];

    var addedEntities = [];
    var addedAnnotations = [];
    var cleanedAnnotation = '';
    var entity = '';
    for (var i = 0; i < annotationList.length; i++) {
        var annotationData = annotationList[i][0][0].split('\t');
        if (annotationData[0][0] == 'T') {
            entity = annotationData[1].split(' ');
            entity.pop();
            entity.pop();
            entities.push(entity.join(' '));
            annotations.push(annotationData[annotationData.length - 1].split('-').join(' '));
        }
    }

    for (var i = 0; i < entities.length; i++) {
        deleteFile(entities[i] + '.txt');
    }

    for (var i = 0; i < entities.length; i++) {
        entity = entities[i];
        cleanedAnnotation = annotations[i];
        if (!addedEntities.includes(entity) || !addedAnnotations.includes(cleanedAnnotation)) {
            addedEntities.push(entity);
            addedAnnotations.push(cleanedAnnotation);

            $.ajax({
                type: 'GET',
                async: false,
                url: '~/write-to-file',
                data: { annotations: cleanedAnnotation, file-name: entity + '.txt' }
            });
        }
    }
});
*/
