
$(document).ready(function () {
    var annotationList = [];
    var offsetList = [];
    var entityId = 1;
    var attributeId = 1;

    var attributeCheckboxes = $("input[type=checkbox]");
    var attributeRadiobuttons = $("input[type=radio]");
    var attributeDropdowns = $("input[name=values]");
    var allDropdowns = $("select");
    var darkMode;

    // Checks if user has preset preference for color mode
    if (localStorage.getItem("mode") == "light") {
        initializeColor("light");
        darkMode = false;
    } else {
        initializeColor("dark");
        darkMode = true;
    }

    // Sets inital color mode based on users stored preference (light or dark mode)
    function initializeColor(type) {
        var backgroundColor = '';
        var textColor = '';

        if (type == "dark") {
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            for (var i = 0; i < document.getElementsByTagName('select').length; i++) {
                document.getElementById(document.getElementsByTagName('select')[i].id).style.backgroundColor = 'white';
            }
            backgroundColor = '#333';
            textColor = 'rgb(210, 210, 210)';
        } else {
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            backgroundColor = 'white';
            textColor = 'black';
        }

        $('body').css({
            "background-color": backgroundColor,
            "color": textColor
        });
    }

    // Toggle display of specified attributes
    function toggleAttributeDisplay(vals, type, data) {
        for (var i = 0; i < vals.length; i++) {
            if (type == "checkbox") {
                vals[i].style.display = data;
                vals[i].labels[0].style.display = data;
            } else if (type == "dropdown") {
                vals[i].style.display = data;
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

    toggleAttributeDisplay(attributeCheckboxes, "checkbox", "none");
    toggleAttributeDisplay(attributeDropdowns, "dropdown", "none");

    // Load annotations if there's an existing ann file
    $.ajax({
        type: "GET",
        url: "~/load_existing",
        async: false,
        data: { ann_filename: dict['ann_filename'] },
        success: function (response) {
            response = JSON.parse(response);

            if (response == null || response.length == 0) { return; }

            annotation = [];
            for (var i = 0; i < response.length; i++) {
                if (response[i][0] == "T" && annotation.length != 0) {
                    annotationList.push(annotation);
                    annotation = [];
                    annotation.push([response[i] + '\n']);
                } else if (response[i][0] == "T") {
                    annotation.push([response[i] + '\n']);
                } else if (response[i][0] == "A") {
                    annotation.push([response[i] + '\n']);
                }
            }
            annotationList.push(annotation);

            for (var i = 0; i < annotationList.length; i++) {
                var attributeValues = [];
                var entityValue = '';
                var start = 0;
                var end = 0;
                for (var j = 0; j < annotationList[i].length; j++) {
                    var annotationWords = annotationList[i][j][0].split("\t");
                    var data = annotationWords[1].split(" ");

                    if (annotationWords[0][0] == "T") {
                        var annotationId = parseInt(annotationWords[0].split('T')[1]);
                        if (annotationId > entityId) {
                            entityId = annotationId
                        }
                        entityValue = data[0];
                        start = data[1];
                        end = data[2];
                    }

                    if (annotationWords[0][0] == "A") {
                        var annotationId = parseInt(annotationWords[0].split('A')[1]);
                        if (annotationId > attributeId) {
                            attributeId = annotationId
                        }
                        attributeValues.push([data[0]]);
                    }
                }
                highlightRange(entityValue, attributeValues, start, end);
            }
            entityId++;
            attributeId++;
            window.getSelection().removeAllRanges();
        }
    });


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
            textRange.moveEnd("character", end);
            textRange.moveStart("character", start);
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

        // Change annotation color if there's an overlap between two annotations
        highlightColor = '#33FFB5';

        // Color-highlight selected text
        document.getElementById('file_data').contentEditable = 'true';
        document.execCommand('insertHTML', false, '<span id="' + startIndex + '_' + endIndex + '_aid" style="background-color:' + highlightColor + '; color:black; border-radius:5px; padding:2px;">' + highlighted + '</span>');
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
        var annotationClass = 'class="test"';
        var annotationId = 'id="' + startIndex + '_' + endIndex + '"';
        var annotationStyle = 'style="border-radius:5px; background-color:#33FFB5; font-family:\'Nunito\'; padding:5px; display:inline-block; clear:both; float:left; '
        if (darkMode) {
            annotationStyle += 'color:black;"';
        } else {
            annotationStyle += '"'
        }
        document.getElementById('annotation_data').innerHTML += '<p ' + annotationClass + ' ' + annotationId + ' ' + annotationStyle + '>' + highlighted + '</p>';
    };


    $('#addAnnotation').click(function () {
        var highlightedIndicies = document.getElementById('highlighted').className.split('_');
        setSelectionRange(document.getElementById('file_data'), highlightedIndicies[0], highlightedIndicies[1]);

        var highlighted = window.getSelection().toString();

        // Check whether selected text is valid
        var validAnnotation = false;
        for (k in dict) {
            if (k != 'file_data' && k != 'ann_filename') {
                if (document.querySelector('input[name=' + k + ']:checked') != null) {
                    validAnnotation = true;
                    break;
                }
            }
        }

        if (!validAnnotation || highlighted == '') { return; }

        // Get start and end indicies (offsets) of selected text
        var doc = document.getElementById('file_data');
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(doc);
        preCaretRange.setEnd(range.startContainer, range.startOffset);

        startIndex = preCaretRange.toString().length;
        endIndex = startIndex + range.toString().length;

        // Change annotation color if there's an overlap between two annotations
        highlightColor = '#33FFB5';
        for (var i = 0; i < offsetList.length; i++) {
            if ((startIndex >= offsetList[i][0] && startIndex <= offsetList[i][1]) || (endIndex >= offsetList[i][0] && endIndex <= offsetList[i][1])) {
                highlightColor = 'rgb(35, 200, 130)';
                break;
            }
        }

        // Color-highlight selected text
        document.getElementById('file_data').contentEditable = 'true';
        document.execCommand('insertHTML', false, '<span id="' + startIndex + '_' + endIndex + '_aid" style="background-color:' + highlightColor + '; color:black; border-radius:5px; padding:2px;">' + highlighted + '</span>');
        document.getElementById('file_data').contentEditable = 'false';

        // Output annotation in stand-off format
        var annotation = [];
        var entityHoverInfo = [];
        var attributeHoverInfo = [];

        // Add entity data to annotation list and hover info
        var entityValue = $("input[type=radio]:checked")[0].id.substring(0, $("input[type=radio]:checked")[0].id.length - 6);
        entityHoverInfo.push(entityValue);
        entityData = 'T' + entityId + '\t' + entityValue + ' ' + startIndex + ' ' + endIndex + '\t' + underscoreString(highlighted) + '\n';
        entityId++;

        annotation.push([entityData]);

        // Prepare attribute data to annotation list and add hover info
        var attributeValues = [];
        var attributeData = [];
        for (var i = 0; i < $("input[type=checkbox]:checked").length; i++) {
            var checkedAttribute = underscoreString($("input[type=checkbox]:checked")[i].id);
            attributeValues.push(checkedAttribute);
            attributeData.push('A' + attributeId + '\t' + checkedAttribute + ' T' + (entityId - 1) + '\n');
            attributeId++;
        }
        attributeHoverInfo.push(attributeValues);

        for (var i = 0; i < attributeDropdowns.length; i++) {
            var currentSelect = attributeDropdowns[i];
            var currentValue = currentSelect.value.split(': ');
            if (currentValue.length > 1) {
                currentValue = underscoreString(currentValue[1]);
            } else {
                currentValue = underscoreString(currentValue[0]);
            }

            var chosenField = currentSelect.list.options[0].value.split(': ')[1];

            if (currentValue != "") {
                attributeValues.push(currentValue);
                attributeData.push('A' + attributeId + '\t' + chosenField + ' T' + (entityId - 1) + ' ' + currentValue + '\n');
                attributeId++;
            }
        }

        for (var i = 0; i < $("select").length; i++) {
            var currentSelect = $("select")[i];
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
                type: "GET",
                url: "~/get_cui",
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
                type: "GET",
                url: "~/get_cui",
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
        offsetList.push([startIndex, endIndex, entityHoverInfo, attributeHoverInfo, highlighted]);

        // Add annotations to current-annotation list
        annotationList.push(annotation);

        // Add annotation to annotaion_data display
        var annotationClass = 'class="test"';
        var annotationId = 'id="' + startIndex + '_' + endIndex + '"';
        var annotationStyle = 'style="border-radius:5px; background-color:#33FFB5; font-family:\'Nunito\'; padding:5px; display:inline-block; clear:both; float:left; ';
        if (darkMode) {
            annotationStyle += 'color:black;"';
        } else {
            annotationStyle += '"'
        }
        document.getElementById('annotation_data').innerHTML += '<p ' + annotationClass + ' ' + annotationId + ' ' + annotationStyle + '>' + highlighted + '</p>';

        // Removes selection of newly-annotated text
        window.getSelection().removeAllRanges();

        toggleAttributeCheck(attributeCheckboxes, false);
        toggleAttributeCheck(attributeRadiobuttons, false);
        toggleAttributeDisplay(attributeCheckboxes, "checkbox", "none");
        toggleAttributeDisplay(attributeDropdowns, "dropdown", "none");
        resetDropdowns(allDropdowns);

        writeToAnn();
        location.reload();
    });


    // Delete clicked annotation
    $('#annotation_data').on('click', '.test', function (event) {
        var id = event.target.id;
        var indicies = id.split("_");
        var startIndex = indicies[0];
        var endIndex = indicies[1];

        // Remove span tag from file_data text
        document.getElementById(id + '_aid').outerHTML = document.getElementById(id + '_aid').innerHTML;

        // Finds correct annotation index based on offset list and removes
        for (var i = 0; i < offsetList.length; i++) {
            if (offsetList[i][0] == startIndex && offsetList[i][1] == endIndex) {
                annotationList.splice(i, 1);
                offsetList.splice(i, 1);

                writeToAnn();

                // Removes annotation from annotation_data display
                var elem = document.getElementById(id);
                elem.parentElement.removeChild(elem);
                return;
            }
        };
    });


    // Remove annotate file in order to update with newest annotations (To-do: update existing ann file without removal)
    function deleteFile(fn) {
        $.ajax({
            type: 'GET',
            async: false,
            url: '~/delete_file',
            data: {file_name: fn}
        });
    }


    // Save annotations to .ann file
    function writeToAnn() {
        deleteFile(dict['ann_filename']);
        for (var i = 0; i < annotationList.length; i++) {
            for (var j = 0; j < annotationList[i].length; j++) {
                $.ajax({
                    type: 'GET',
                    async: false,
                    url: '~/write_to_file',
                    data: { annotations: annotationList[i][j][0], file_name: dict['ann_filename']}
                });
            }
        }
    }


    // Display information about chosen annotation on hover
    function hoverInfo(id, type) {
        var indicies = id.split("_");
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
                    document.getElementById(id).title = "Text: " + offsetList[i][4] + "\nEntity: " + offsetList[i][2] + "\nAttributes: " + offsetList[i][3];
                    //document.getElementById(id).style.backgroundColor = "blue";
                    //document.getElementById(id + '_aid').style.backgroundColor = "blue";
                    return;
                }
            };
        }
    }


    // Display information about annotation on hover of annotation_data display
    $("#annotation_data").mouseover(function (eventObj) {
        hoverInfo(eventObj.target.id, 'annotation_data');
    });


    // Display information about annotation on hover of file_data display
    $("#file_data").mouseover(function (eventObj) {
        hoverInfo(eventObj.target.id, 'file_data');
    });


    // Prevent deselection of text when deleting annotation
    $('#annotation_data').mousedown(function () {
        return false;
    });


    // Allows users to switch between to light and dark mode
    $('#darkMode').click(function () {
        if (!darkMode) {
            localStorage.setItem("mode", "dark");
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            document.getElementById('file_data').style.color = 'rgb(210, 210, 210)';
            document.getElementById('config_data_options').style.color = 'white';
            document.getElementById('annotation_data').style.color = 'black';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#333';
            for (var i = 0; i < document.getElementsByTagName('select').length; i++) {
                document.getElementById(document.getElementsByTagName('select')[i].id).style.backgroundColor = 'white';
            }
            var spans = $('span');
            for (var i = 0; i<spans.length; i++) {
                spans[i].style.color = 'black';
            }
            darkMode = true;
        } else {
            localStorage.setItem("mode", "light");
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            document.getElementById('file_data').style.color = 'black';
            document.getElementById('config_data_options').style.color = 'black';
            document.getElementById('annotation_data').style.color = 'black';
            document.getElementsByTagName('body')[0].style.backgroundColor = 'white';
            darkMode = false;
        }
    });


    // Suggest most relevant UMLS matches based on highlighted term 
    $('#file_data').mouseup(function () {
        suggest_cui(window.getSelection().toString(), 'matchList');
    });


    // Dynamic entity / attribute configurations
    var argBoxes = JSON.parse(dict['args'].replace(/&#39;/gi, '"'));
    var valBoxes = JSON.parse(dict['vals'].replace(/&#39;/gi, '"'));
    $("input[type=radio]").click(function () {
        // Get selected radiobutton id
        var selected = $(this).context.id.substring(0, $(this).context.id.length - 6);

        // Deselect and remove hiding of all attributes
        toggleAttributeCheck(attributeCheckboxes, false);
        toggleAttributeDisplay(attributeCheckboxes, "checkbox", "");
        toggleAttributeDisplay(attributeDropdowns, "dropdown", "");

        // Determine which attributes should be displayed
        var visibleCheckboxes = [];
        for (var i = 0; i < argBoxes.length; i++) {
            if (argBoxes[i][1] == selected) {
                visibleCheckboxes.push(argBoxes[i][0]);
            }
        }

        var visibleDropdowns = [];
        for (var i = 0; i < valBoxes.length; i++) {
            if (valBoxes[i][0] == selected) {
                visibleDropdowns.push(valBoxes[i][1] + valBoxes[i][0]);
            }
        }

        // Hide all unwanted attributes
        for (var i = 0; i < attributeCheckboxes.length; i++) {
            if (!visibleCheckboxes.includes(attributeCheckboxes[i].id)) {
                attributeCheckboxes[i].style.display = "none";
                attributeCheckboxes[i].labels[0].style.display = "none";
            }
        }
        
        // Hide all unwanted attributes
        for (var i = 0; i < attributeDropdowns.length; i++) {
            if (!visibleDropdowns.includes(attributeDropdowns[i].list.id)) {
                attributeDropdowns[i].style.display = "none";
            }
        }
    });


    // Move to next when multiple documents opened
    $('#nextFile').click(function () {
        $.ajax({
            type: 'GET',
            async: false,
            url: '~/move_to_next_file',
            success: function (data) {
                window.location.href = data;
            }
        });
    });


    // Move to previous when multiple documents opened
    $('#previousFile').click(function () {
        $.ajax({
            type: 'GET',
            async: false,
            url: '~/move_to_previous_file',
            success: function (data) {
                window.location.href = data;
            }
        });
    });


    // Automatically annotate the document
    $('#autoAnnotate').click(function () {
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

            annotationList.push([["T" + entityId + "\tDOB " + startIndex + " " + endIndex + "\t" + annotations[i][0] + '\n'], ["A" + attributeId + "\t" + annotations[i][1] + "\tT" + entityId + "\n"], ["A" + (attributeId + 1) + "\t" + annotations[i][2] + "\tT" + entityId + "\n"]]);

            entityId++;
            attributeId++;
            attributeId++;

            setSelectionRange(document.getElementById('file_data'), startIndex, endIndex);
            populateAnnotations("DOB", attributeValues, startIndex, endIndex);
        }
        writeToAnn();
        location.reload();
    });


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
    $('#file_data').bind("contextmenu", function () {
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


    $('#searchDictBtn').click(function () {
        //console.log(alert($('#myFrame').contents().find('#searchDict').val()));
        suggest_cui(document.getElementById('searchDict').value, 'searchList');
    });


    function suggest_cui(inp, type) {
        $.ajax({
            type: "GET",
            url: "~/suggest_cui",
            data: { selectedTerm: inp.toLowerCase() }
        }).done(function (data) {
            // Empty drop-down list
            document.getElementById(type).options.length = 0;
            if (data != '') {
                var arr = data.split('***');
                var searchList = document.getElementById(type);
                var count = 0;
                var newOption = document.createElement("option");
                newOption.text = '';
                searchList.add(newOption);
                for (var i = 0; i < arr.length; i++) {
                    newOption = document.createElement("option");
                    newOption.text = arr[i];
                    searchList.add(newOption);
                    count = i;
                }
                count++;
                searchList.childNodes[0].nextElementSibling.text = count + " matches found";
            }

            if (document.getElementById(type).options.length == 0) {
                var searchList = document.getElementById(type);
                var option = document.createElement("option");
                option.text = "No match";
                searchList.add(option);
            }
        });
    }


    function underscoreString(string) {
        string = string.split(' ').join('_');
        return string.split('\n').join('_');
    }

    // Change annotation to new colour when hovered over in annotation data
    $('#annotation_data p').mouseover(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = "pink";
        document.getElementById(e.target.id + "_aid").style.backgroundColor = "pink";
    });

    // Return annotation to existing colour when stop hovering over in annotation data
    $('#annotation_data p').mouseout(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = "#33FFB5";
        document.getElementById(e.target.id + "_aid").style.backgroundColor = "#33FFB5";
    });

    // Change annotation to new colour when hovered over in file data
    $('#file_data span').mouseover(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = "pink";
        document.getElementById(e.target.id.split("_aid")[0]).style.backgroundColor = "pink";
    });

    // Change annotation to new colour when stop hovering over in file data
    $('#file_data span').mouseout(function (e) {
        document.getElementById(e.target.id).style.backgroundColor = "#33FFB5";
        document.getElementById(e.target.id.split("_aid")[0]).style.backgroundColor = "#33FFB5";
    });

    $('#file_data').mouseup(function () {
        if (window.getSelection() == "") {
            $("#highlighted").replaceWith(function() { return this.innerHTML; });
        } else {
            if (document.getElementById('highlighted') != null) {
                $("#highlighted").replaceWith(function() { return this.innerHTML; });
            }
            var highlighted = window.getSelection().toString();
            var doc = document.getElementById('file_data');
            var range = window.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
    
            preCaretRange.selectNodeContents(doc);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
    
            startIndex = preCaretRange.toString().length;
            endIndex = startIndex + range.toString().length;
    
            highlightColor = '#33FFB5';
    
            // Color-highlight selected text
            document.getElementById('file_data').contentEditable = 'true';
            document.execCommand('insertHTML', false, '<span id="highlighted" class="' + startIndex + '_' + endIndex + '" style="background-color: rgb(79, 120, 255); opacity: 0.9">' + highlighted + '</span>');
            document.getElementById('file_data').contentEditable = 'false';

            //setSelectionRange(document.getElementById('file_data'), startIndex, endIndex);
        }
    });


    $("#exportHighlighted").click(function() {
        var entities = [];
        var annotations = [];

        var addedEntities = [];
        var addedAnnotations = [];
        var cleanedAnnotation = '';
        var entity = '';
        for (var i=0; i<annotationList.length; i++) {
            var annotationData = annotationList[i][0][0].split('\t');
            if (annotationData[0][0] == 'T') {
                entity = annotationData[1].split(' ');
                entity.pop();
                entity.pop();
                entities.push(entity.join(' '));
                annotations.push(annotationData[annotationData.length - 1].split('_').join(' '));
            }
        }

        for (var i=0; i<entities.length; i++) {
            deleteFile(entities[i] + '.txt');
        }

        for (var i=0; i<entities.length; i++) {
            entity = entities[i];
            cleanedAnnotation = annotations[i];
            if (!addedEntities.includes(entity) || !addedAnnotations.includes(cleanedAnnotation)) {
                addedEntities.push(entity);
                addedAnnotations.push(cleanedAnnotation);

                $.ajax({
                    type: 'GET',
                    async: false,
                    url: '~/write_to_file',
                    data: { annotations: cleanedAnnotation, file_name: entity + '.txt'}
                });
            }
        }
    });


    $("#loadUserDictionary").click(function() {
        $.ajax({
            type: 'GET',
            async: false,
            url: '~/load_user_dictionary'
        });
    });
});

