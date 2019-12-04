var colors = [
    "#33FFB5", "#7B68EE", "#FFD700", "#FFA500", "#DC143C", "#FFC0CB", "#00BFFF",
    "#FFA07A", "#C71585", "#32CD32", "#48D1CC", "#FF6347", "#2E8B57", "#FF69B4",
    "#008B8B", "#FFF0F5", "#FFFACD", "#E6E6FA", "#B22222", "#4169E1", "#C0C0C0"
];

var annotationList;
var offsetList = [];
var entityId = 1;
var attributeId = 1;
var darkMode;

// Return to homepage if no / invalid document selected
function validateDocumentSelection(documentText) {
    if (documentText == null || documentText.trim() == '') {
        alert('There was an issue loading your document. Redirecting to the homepage!')
        location.href = '/';
    }
}


// Parse config values from file and display 'entities' radiobutton list
function parseConfigValues(configText) {
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
                        document.getElementById(configKey).innerHTML += '<p style="margin:0; margin-top:3px; padding:0;"><input type="radio" id="' + configValues[j] + '_radio" name="' + configKey + '" value="' + configValues[j] + '_radio"> <label colorIndex="' + j + '"style="border-radius:5px; padding:0 5px; background-color:' + colors[j] + '; color:black;" class="l" for="' + configValues[j] + '_radio">' + configValues[j] + '</label> </p>';
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
                    document.getElementById('attributeCheckboxes').innerHTML += '<p style="margin:0; padding:0;"> <input type="checkbox" id="{{ val }}" name="{{ key }}" value="{{ val }}"> <label for="{{ val }}">{{ val }}</label> </p>';
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
                    document.getElementById('attributeDropdowns').innerHTML += '<p style="margin:0; padding:0;"><input style="outline:none; padding:5px; border:radius:5px;" type="text" list="' + newVals[1] + newVals[0] + '" placeholder="' + newVals[1] + '" name="values" class="drop-down" style="padding:2px;"/><datalist id="' + newVals[1] + newVals[0] + '">' + dropdownOptionHtml + '</datalist></p>';
                }
            }
        }
    }
    return [configArgs, configVals];
}


// Checks if user has preset preference for display mode
function checkUserDisplayPreference() {
    if (localStorage.getItem('mode') == 'light') {
        setDisplayMode('light');
        darkMode = false;
    } else {
        setDisplayMode('dark');
        darkMode = true;
    }
}


// Sets display mode based on users stored preference
function setDisplayMode(type) {
    var backgroundColor = '';
    var textColor = '';

    if (type == 'dark') {
        document.getElementById('darkMode').innerHTML = 'Light Mode';
        for (var i = 0; i < document.getElementsByTagName('select').length; i++) {
            document.getElementById(document.getElementsByTagName('select')[i].id).style.backgroundColor = 'white';
        }
        backgroundColor = '#333';
        textColor = 'rgb(210, 210, 210)';
        var spans = $('span');
        for (var i = 0; i < spans.length; i++) {
            spans[i].style.color = 'black';
        }
    } else {
        document.getElementById('darkMode').innerHTML = 'Dark Mode';
        backgroundColor = 'white';
        textColor = 'black';
    }

    $('body').css({
        'background-color': backgroundColor,
        'color': textColor
    });

    $('.sectionTitle').css({
        'color': textColor
    });
}


// Allows users to switch between to light and dark mode
function switchDisplayMode() {
    var textColor = '';
    if (!darkMode) {
        localStorage.setItem('mode', 'dark');
        document.getElementById('darkMode').innerHTML = 'Light Mode';
        document.getElementById('file_data').style.color = 'rgb(210, 210, 210)';
        document.getElementById('config_data_options').style.color = 'white';
        document.getElementById('annotation_data').style.color = 'black';
        document.getElementsByTagName('body')[0].style.backgroundColor = '#333';
        for (var i = 0; i < document.getElementsByTagName('select').length; i++) {
            document.getElementById(document.getElementsByTagName('select')[i].id).style.backgroundColor = 'white';
        }
        var spans = $('span');
        for (var i = 0; i < spans.length; i++) {
            spans[i].style.color = 'black';
        }
        textColor = 'rgb(210, 210, 210)';
        darkMode = true;
    } else {
        localStorage.setItem('mode', 'light');
        document.getElementById('darkMode').innerHTML = 'Dark Mode';
        document.getElementById('file_data').style.color = 'black';
        document.getElementById('config_data_options').style.color = 'black';
        document.getElementById('annotation_data').style.color = 'black';
        document.getElementsByTagName('body')[0].style.backgroundColor = 'white';
        textColor = 'black';
        darkMode = false;
    }

    $('.sectionTitle').css({
        'color': textColor
    });
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


function highlightRange(entityValue, attributeValues, start, end) {
    setSelectionRange(document.getElementById('file_data'), start, end);
    populateAnnotations(entityValue, attributeValues, start, end);
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
        }
    }

    // Color-highlight selected text
    document.getElementById('file_data').contentEditable = 'true';
    document.execCommand('insertHTML', false, '<span id="' + startIndex + '_' + endIndex + '_aid" style="background-color:' + highlightColor + '; color:black;">' + highlighted + '</span>');
    document.getElementById('file_data').contentEditable = 'false';

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

    // Add annotation to annotaion_data display
    var annotationClass = 'class="displayedAnnotation"';
    var annotationId = 'id="' + startIndex + '_' + endIndex + '"';
    var annotationStyle = 'style="background-color:' + highlightColor + '; font-family:\'Nunito\'; padding:2px;'
    if (darkMode) {
        annotationStyle += 'color:black;"';
    } else {
        annotationStyle += '"'
    }
    document.getElementById(entityValue + '_section').style.display = '';
    document.getElementById(entityValue + '_section').innerHTML += '<p ' + annotationClass + ' ' + annotationId + ' ' + annotationStyle + '>' + highlighted + '</p>';
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
    var a = document.getElementById('saveAnnotationFile');
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


var next = false;
// Change colour of highlighted text
function changeHighlightedTextColor() {
    if (window.getSelection() == '') {
        // Prevent annotations from being visually disappearing upon highlighting over them
        if (document.getElementById('highlighted') != null) {
            $('#highlighted').replaceWith(function () { return this.innerHTML; });
            document.getElementById('file_data').innerText = localStorage.getItem('documentText' + currentDocumentId);
            loadExistingAnnotations();
        } else {
            $('#highlighted').replaceWith(function () { return this.innerHTML; });
        }
    } else {
        if (document.getElementById('highlighted') != null) {
            $('#highlighted').replaceWith(function () { return this.innerHTML; });
        }

        var highlighted = window.getSelection().toString();

        var doc = document.getElementById('file_data');
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(doc);
        preCaretRange.setEnd(range.startContainer, range.startOffset);

        var documentText = doc.innerText;
        var startIndex = 0;
        var preCaretRangeLength = preCaretRange.toString().replace(/\n/g, "").length;
        for (var i=0; i<documentText.length; i++) {
            if (preCaretRangeLength == 0) {
                while (documentText[i] == '\n') {
                    console.log('secondary', documentText[i], 'startIndex', startIndex);
                    startIndex++;
                    i++;
                }
                break;
            }
            
            if (documentText[i] != '\n') {
                preCaretRangeLength--;
            }
            startIndex++;
        }

        var endIndex = startIndex;
        var highlightedLength = range.toString().replace(/\n/g, "").length;
        for (var i=startIndex; i<documentText.length; i++) {
            if (highlightedLength == 0) {
                break;
            }
            
            if (documentText[i] != '\n') {
                highlightedLength--;
            }
            endIndex++;
        }

        // Color-highlight selected text
        document.getElementById('file_data').contentEditable = 'true';
        document.execCommand('insertHTML', false, '<span id="highlighted" class="' + startIndex + '_' + endIndex + '" style="background-color: rgb(79, 120, 255); opacity: 0.9">' + highlighted + '</span>');
        document.getElementById('file_data').contentEditable = 'false';
    }
}


function addAnnotation(event) {
    var attributeCheckboxes = event.data.attributeCheckboxes;
    var attributeDropdowns = event.data.attributeDropdowns;
    var attributeRadiobuttons = event.data.attributeRadiobuttons;
    var allDropdowns = event.data.allDropdowns;

    var highlightedIndicies = document.getElementById('highlighted').className.split('_');
    var highlighted = "";
    var tempStartIndex = parseInt(highlightedIndicies[0]);
    var trueStartIndex = parseInt(highlightedIndicies[0]);
    var trueEndIndex = parseInt(highlightedIndicies[1]);
    var startIndex = 0;
    var endIndex = 0;
    var documentText = document.getElementById('file_data').innerText;

    for (var i=0; i<documentText.length; i++) {
        if (tempStartIndex == 0) {
            while (documentText[i] == '\n') {
                startIndex++;
                i++;
            }
            var diff = 0;
            for (var j=trueStartIndex; j< trueEndIndex; j++) {
                if (documentText[j] != '\n') {
                    diff++;
                }
                highlighted += documentText[j];
            }
            endIndex = startIndex + diff;
            break;
        }
        if (documentText[i] != '\n') {
            startIndex++;
        }
        tempStartIndex--;
    }

    setSelectionRange(document.getElementById('file_data'), startIndex, endIndex);

    // Check whether selected text is valid
    if (!validateAnnotationSelection(highlighted, attributeRadiobuttons)) { document.getElementById('entities').style.color = 'red'; return; }

    // Get highlight color
    for (var i=0; i<$('label').length; i++) {
        if ($('label')[i].getAttribute('for') == $('input[type=radio]:checked')[0].id) {
            highlightColor = colors[$('label')[i].getAttribute('colorIndex')];
        }
    }

    /*
    // Change annotation color if there's an overlap between two annotations TODO
    for (var i = 0; i < offsetList.length; i++) {
        if ((startIndex >= offsetList[i][0] && startIndex <= offsetList[i][1]) || (endIndex >= offsetList[i][0] && endIndex <= offsetList[i][1])) {
            highlightColor = 'rgb(35, 200, 130)';
            break;
        }
    }
    */

    // Color-highlight selected text
    document.getElementById('file_data').contentEditable = 'true';
    document.execCommand('insertHTML', false, '<span id="' + trueStartIndex + '_' + trueEndIndex + '_aid" style="background-color:' + highlightColor + '; color:black; padding:2px;">' + highlighted + '</span>');
    document.getElementById('file_data').contentEditable = 'false';

    // Output annotation in stand-off format
    var annotation = [];
    var entityHoverInfo = [];
    var attributeHoverInfo = [];

    // Add entity data to annotation list and hover info
    var entityValue = $('input[type=radio]:checked')[0].id.substring(0, $('input[type=radio]:checked')[0].id.length - 6);
    entityHoverInfo.push(entityValue);
    entityData = 'T' + entityId + '\t' + entityValue + ' ' + trueStartIndex + ' ' + trueEndIndex + '\t' + underscoreString(highlighted) + '\n';
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
    attributeHoverInfo.push(attributeValues);

    for (var i = 0; i < attributeDropdowns.length; i++) {
        var currentSelect = attributeDropdowns[i];
        if (currentSelect.value != '') {
            var currentValue = currentSelect.value.split(': ');

            if (currentValue.length == 1) {
                currentValue = [currentSelect.getAttribute('placeholder'), currentValue[0]];
            }

            var chosenField = currentValue[0];
            currentValue = underscoreString(currentValue[1]);
            attributeValues.push(currentValue);
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
    var suggestionList = document.getElementById('matchList');
    var option = suggestionList.options[suggestionList.selectedIndex].text;
    var optionWords = option.split(' ');

    if (!((optionWords[optionWords.length - 2] == 'matches' && optionWords[optionWords.length - 1] == 'found') || option == 'No match')) {
        $.ajax({
            type: 'GET',
            url: '~/get_cui',
            async: false,
            data: { match: option },
            success: function (response) {
                var term = 'A' + attributeId + '\tCUIPhrase' + ' T' + (entityId - 1) + ' ' + underscoreString(option) + '\n';
                attributeData.push(term);
                attributeId++;

                var cui = 'A' + attributeId + '\tCUI' + ' T' + (entityId - 1) + ' ' + response.replace(/['"]+/g, '') + '\n';
                attributeId++;
                attributeData.push(cui);
            }
        });
    }

    // TEMP: Get chosen option cui from dropdown and ignore if default selected or no matches found
    suggestionList = document.getElementById('searchList');
    option = suggestionList.options[suggestionList.selectedIndex].text;
    optionWords = option.split(' ');

    if (!((optionWords[optionWords.length - 2] == 'matches' && optionWords[optionWords.length - 1] == 'found') || option == 'No match')) {
        $.ajax({
            type: 'GET',
            url: '~/get_cui',
            async: false,
            data: { match: option },
            success: function (response) {
                var term = 'A' + attributeId + '\tCUIPhrase' + ' T' + (entityId - 1) + ' ' + underscoreString(option) + '\n';
                attributeData.push(term);
                attributeId++;

                var cui = 'A' + attributeId + '\tCUI' + ' T' + (entityId - 1) + ' ' + response.replace(/['"]+/g, '') + '\n';
                attributeId++;
                attributeData.push(cui);
            }
        });
    }

    // Add attributes to annotation list
    for (var i = 0; i < attributeData.length; i++) {
        annotation.push([attributeData[i]]);
    }

    // Keep track of offets for each annotation
    offsetList.push([trueStartIndex, trueEndIndex, entityHoverInfo, attributeHoverInfo, highlighted]);

    // Add annotations to current-annotation list
    annotationList[currentDocumentId].push(annotation);

    // Add annotation to annotaion_data display
    var annotationClass = 'class="displayedAnnotation"';
    var annotationId = 'id="' + trueStartIndex + '_' + trueEndIndex + '"';
    var annotationStyle = 'style="background-color:' + highlightColor + '; font-family:\'Nunito\'; padding:2px;';
    if (darkMode) {
        annotationStyle += 'color:black;"';
    } else {
        annotationStyle += '"'
    }
    document.getElementById(entityValue + '_section').style.display = '';
    document.getElementById(entityValue + '_section').innerHTML += '<p ' + annotationClass + ' ' + annotationId + ' ' + annotationStyle + '>' + highlighted + '</p>';

    // Removes selection of newly-annotated text
    window.getSelection().removeAllRanges();

    // Reset all selections and displays
    toggleAttributeCheck(attributeCheckboxes, false);
    toggleAttributeCheck(attributeRadiobuttons, false);
    toggleAttributeDisplay(attributeCheckboxes, 'checkbox', 'none');
    toggleAttributeDisplay(attributeDropdowns, 'dropdown', 'none');
    resetDropdowns(allDropdowns);

    updateAnnotationFileURL();
    //bindEvents();
    document.getElementById('file_data').innerText = localStorage.getItem('documentText' + currentDocumentId);
    loadExistingAnnotations();
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
    } else {
        return false;
    }
}


function underscoreString(string) {
    string = string.split('<br>').join('_');
    string = string.split(' ').join('_');
    string = string.split('\n').join('_');
    return string;
}


// Load annotations if user supplied existing annotation file
function setupExistingAnnotations(annotationText) {
    if (annotationText == null || annotationText.trim() == '') { return; }

    var annotationSentences = annotationText.split('\n');

    annotation = [];
    for (var i = 0; i < annotationSentences.length; i++) {
        if (annotationSentences[i][0] == 'T' && annotation.length != 0) {
            annotationList[currentDocumentId].push(annotation);
            annotation = [];
            annotation.push([annotationSentences[i] + '\n']);
        } else if (annotationSentences[i][0] == 'T') {
            annotation.push([annotationSentences[i] + '\n']);
        } else if (annotationSentences[i][0] == 'A') {
            annotation.push([annotationSentences[i] + '\n']);
        }
    }
    annotationList[currentDocumentId].push(annotation);
}


// Load annotations if user supplied existing annotation file
function loadExistingAnnotations() {
    /*
    // Add sections to annotation_data display
    for (var i=0; i<entityList.length; i++) {
        document.getElementById("annotation_data").innerHTML += "<div id='" + entityList[i] + "_section' style='display:none;'><p class='sectionTitle'>" + entityList[i] + "</p></div>";
    }

    for (var i = 0; i < annotationList[currentDocumentId].length; i++) {
        var attributeValues = [];
        var entityValue = "";
        var startIndex = 0;
        var endIndex = 0;
        for (var j = 0; j < annotationList[currentDocumentId][i].length; j++) {
            var annotationWords = annotationList[currentDocumentId][i][j][0].split('\t');
            var data = annotationWords[1].split(' ');

            if (annotationWords[0][0] == 'T') {
                var annotationId = parseInt(annotationWords[0].split('T')[1]);
                if (annotationId > entityId) {
                    entityId = annotationId
                }
                entityValue = data[0];
                var tempStartIndex = data[1];
                var trueStartIndex = data[1];
                var trueEndIndex = data[2];
                var documentText = document.getElementById('file_data').innerText;
                for (var i=0; i<documentText.length; i++) {
                    if (tempStartIndex == 0) {
                        while (documentText[i] == '\n') {
                            startIndex++;
                            i++;
                        }
                        var diff = 0;
                        for (var j=trueStartIndex; j< trueEndIndex; j++) {
                            if (documentText[j] != '\n') {
                                diff++;
                            }
                        }
                        endIndex = startIndex + diff;
                        break;
                    }
                    if (documentText[i] != '\n') {
                        startIndex++;
                    }
                    tempStartIndex--;
                }
            }

            if (annotationWords[0][0] == 'A') {
                var annotationId = parseInt(annotationWords[0].split('A')[1]);
                if (annotationId > attributeId) {
                    attributeId = annotationId
                }
                attributeValues.push(data[0] + ': ' + data[2]);
            }
        }
        highlightRange(entityValue, attributeValues, startIndex, endIndex);
    }
    entityId++;
    attributeId++;
    window.getSelection().removeAllRanges();

    updateAnnotationFileURL();
    */

    document.getElementById('annotation_data').innerText = '';
    
    // Add sections to annotation_data display
    for (var i=0; i<entityList.length; i++) {
        document.getElementById("annotation_data").innerHTML += "<div id='" + entityList[i] + "_section' style='display:none;'><p class='sectionTitle'>" + entityList[i] + "</p></div>";
    }

    for (var i = 0; i < annotationList[currentDocumentId].length; i++) {
        var attributeValues = [];
        var entityValue = '';
        var startIndex = 0;
        var endIndex = 0;

        console.log(annotationList);

        for (var j = 0; j < annotationList[currentDocumentId][i].length; j++) {
            var annotationWords = annotationList[currentDocumentId][i][j][0].split('\t');
            var data = annotationWords[1].split(' ');

            if (annotationWords[0][0] == 'T') {
                var annotationId = parseInt(annotationWords[0].split('T')[1]);
                if (annotationId > entityId) {
                    entityId = annotationId
                }
                entityValue = data[0];

                var tempStartIndex = parseInt(data[1]);
                var trueStartIndex = parseInt(data[1]);
                var trueEndIndex = parseInt(data[2]);
                var documentText = document.getElementById('file_data').innerText;
                for (var k=0; k<documentText.length; k++) {
                    if (tempStartIndex == 0) {
                        while (documentText[k] == '\n') {
                            startIndex++;
                            k++;
                        }
                        var diff = 0;
                        for (var n=trueStartIndex; n<trueEndIndex; n++) {
                            if (documentText[n] != '\n') {
                                diff++;
                            }
                        }
                        endIndex = startIndex + diff;
                        break;
                    }
                    if (documentText[k] != '\n') {
                        startIndex++;
                    }
                    tempStartIndex--;
                }
            }

            if (annotationWords[0][0] == 'A') {
                var annotationId = parseInt(annotationWords[0].split('A')[1]);
                if (annotationId > attributeId) {
                    attributeId = annotationId
                }
                attributeValues.push(data[0] + ': ' + endIndex);
            }
        }
        console.log('startIndex', startIndex);
        console.log('endIndex', endIndex);
        highlightRange(entityValue, attributeValues, startIndex, endIndex);
    }
    entityId++;
    attributeId++;
    window.getSelection().removeAllRanges();

    updateAnnotationFileURL();
}


// Delete clicked annotation
function deleteClickedAnnotation(event) {
    var id = event.target.id;
    var indicies = id.split('_');
    var startIndex = indicies[0];
    var endIndex = indicies[1];

    // Remove span tag from file_data text
    document.getElementById(id + '_aid').outerHTML = document.getElementById(id + '_aid').innerHTML;

    // Finds correct annotation index based on offset list and removes
    for (var i = 0; i < offsetList.length; i++) {
        if (offsetList[i][0] == startIndex && offsetList[i][1] == endIndex) {
            if (annotationList[currentDocumentId].length == 1) {
                annotationList[currentDocumentId] = [];
            } else {
                annotationList[currentDocumentId].splice(i, 1);
                offsetList.splice(i, 1);
            }

            // Removes annotation from annotation_data display
            var elem = document.getElementById(id);
            elem.parentElement.removeChild(elem);

            updateAnnotationFileURL();
            return;
        }
    }
}


// Display information about chosen annotation on hover
function hoverInfo(id, type) {
    var indicies = id.split('_');
    var startIndex = indicies[0];
    var endIndex = indicies[1];

    if (id != type) {
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


function suggestCui(event) {
    var type = event.data.type;
    var selectedTerm;

    if (type == 'matchList') {
        selectedTerm = window.getSelection().anchorNode.textContent;
    } else if (type == 'searchList') {
        selectedTerm = document.getElementById('searchDict').value
    }

    if (selectedTerm.split(' ').length > 8) {
        return;
    }

    var selectedTerm = selectedTerm.toLowerCase();

    $.ajax({
        type: 'GET',
        url: '~/suggest_cui',
        data: { selectedTerm: selectedTerm }
    }).done(function (data) {
        // Empty drop-down list
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


var currentDocumentId = 0;
$(document).ready(function () {
    onPageLoad();
});


var parsedConfigurationValues, configValues, entityList, detailedConfigurationValues, configArgs, configVals;
function onPageLoad(initalLoad=true) {
    // Read local data of files user selected
    var documentOpenType = localStorage.getItem('documentOpenType');
    var documentCount = localStorage.getItem('documentCount');
    var configText = localStorage.getItem('configText');
    var documentText = localStorage.getItem('documentText' + currentDocumentId);
    
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
                setupExistingAnnotations(currentAnnotationText);
            }
        }
    }

    // Set title to annotation file name
    document.getElementsByTagName('title')[0].innerText = localStorage.getItem('fileName' + currentDocumentId) + " - Markup";

    // Check that documentText isn't empty, otherwise return to homepage
    validateDocumentSelection(documentText);

    // Display selected documentText
    document.getElementById('file_data').innerText = documentText;

    if (initalLoad) {
        // Display 'entities' configuration list
        parsedConfigurationValues = parseConfigValues(configText);
        configValues = parsedConfigurationValues[0];
        entityList = parsedConfigurationValues[1];

        // Display 'attributes' configuration list
        detailedConfigurationValues = displayConfigurationValues(configValues, entityList);
        configArgs = detailedConfigurationValues[0];
        configVals = detailedConfigurationValues[1];

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

        /*
        // Change annotation to new colour when hovered over in annotation data
        $('#annotation_data p').mouseover(function (e) {
            document.getElementById(e.target.id).style.backgroundColor = 'pink';
            document.getElementById(e.target.id + '_aid').style.backgroundColor = 'pink';
        });

        // Return annotation to existing colour when stop hovering over in annotation data
        $('#annotation_data p').mouseout(function (e) {
            document.getElementById(e.target.id).style.backgroundColor = '#33FFB5';
            document.getElementById(e.target.id + '_aid').style.backgroundColor = '#33FFB5';
        });

        // Change annotation to new colour when hovered over in file data
        $('#file_data span').mouseover(function (e) {
            document.getElementById(e.target.id).style.backgroundColor = 'pink';
            document.getElementById(e.target.id.split('_aid')[0]).style.backgroundColor = 'pink';
        });

        // Change annotation to new colour when stop hovering over in file data
        $('#file_data span').mouseout(function (e) {
            document.getElementById(e.target.id).style.backgroundColor = '#33FFB5';
            document.getElementById(e.target.id.split('_aid')[0]).style.backgroundColor = '#33FFB5';
        });
        */

        // Change colour of highlighted text
        $('#file_data').mouseup(changeHighlightedTextColor);

        // Display information about annotation on hover of annotation_data display
        $('#annotation_data').mouseover(function (eventObj) {
            hoverInfo(eventObj.target.id, 'annotation_data');
        });

        // Display information about annotation on hover of file_data display
        $('#file_data').mouseover(function (eventObj) {
            hoverInfo(eventObj.target.id, 'file_data');
        });

        // Allow users to add an annotation
        $('#addAnnotation').click({
            'attributeCheckboxes': attributeCheckboxes,
            'attributeDropdowns': attributeDropdowns,
            'attributeRadiobuttons': attributeRadiobuttons,
            'allDropdowns': allDropdowns
        }, addAnnotation);

        // Allow users to delete clicked annotation
        $('#annotation_data').on('click', '.displayedAnnotation', deleteClickedAnnotation);

        // Suggest most relevant UMLS matches based on highlighted term 
        $('#file_data').mouseup({ 'type': 'matchList' }, suggestCui);

        // Suggest most relevant UMLS matches based on searched term
        // Add delay to avoid too many requests
        $('#searchDict').keyup({ 'type': 'searchList' }, suggestCui);

        // Reset color of entities (which changes upon errors)
        $('input[name=entities]').click(resetEntityColor);

        // Automatically suggest annotations
        //$('#autoAnnotate').click(autoAnnotate);

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
    }
    /*
    else {
        bindEvents();
    }
    */

    // Load annotations from current annotationList
    loadExistingAnnotations();
}


function bindEvents() {
    // Change annotation to new colour when hovered over in annotation data
    $('#annotation_data p').mouseover(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = 'pink';
        document.getElementById(e.target.id + '_aid').style.backgroundColor = 'pink';
    });

    // Return annotation to existing colour when stop hovering over in annotation data
    $('#annotation_data p').mouseout(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = '#33FFB5';
        document.getElementById(e.target.id + '_aid').style.backgroundColor = '#33FFB5';
    });

    // Change annotation to new colour when hovered over in file data
    $('#file_data span').mouseover(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = 'pink';
        document.getElementById(e.target.id.split('_aid')[0]).style.backgroundColor = 'pink';
    });

    // Change annotation to new colour when stop hovering over in file data
    $('#file_data span').mouseout(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = '#33FFB5';
        document.getElementById(e.target.id.split('_aid')[0]).style.backgroundColor = '#33FFB5';
    });
}


/*
// Automatically annotate the document
function autoAnnotate() {
    var text = document.getElementById('file_data').innerHTML;
    var annotations = null;

    $.ajax({
        type: 'GET',
        async: false,
        url: '~/auto_annotate',
        data: { 'document_text': text },
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

        setSelectionRange(document.getElementById('file_data'), startIndex, endIndex);
        populateAnnotations('DOB', attributeValues, startIndex, endIndex);
    }
    //location.reload();
}


var clicks = 0;
$('#file_data').click(function () {
    if (window.getSelection().toString() == '' && clicks >= 2) {
        clicks = 0;
        return;
    }

    clicks++;

    if (clicks >= 3) {
        var doc = document.getElementById('file_data');
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
        setSelectionRange(document.getElementById('file_data'), startIndex, endIndex);
    }
});


// FIX SINCE ALLOWING MULTIPLE FOCUS
$('#file_data').bind('contextmenu', function () {
    // TO-DO: Update UMLS suggestion on right-click

    if (window.getSelection().toString() == '' && clicks >= 2) {
        clicks = 0;
        return;
    }

    if (clicks >= 3) {
        var doc = document.getElementById('file_data');
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

        setSelectionRange(document.getElementById('file_data'), startIndex, endIndex);
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
            annotations.push(annotationData[annotationData.length - 1].split('_').join(' '));
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
                url: '~/write_to_file',
                data: { annotations: cleanedAnnotation, file_name: entity + '.txt' }
            });
        }
    }
});
*/
