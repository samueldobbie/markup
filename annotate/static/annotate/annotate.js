
$(document).ready(function () {

    var checkboxes = $("input[type=checkbox]");
    var checkboxNum = checkboxes.length;
    for(var i=0; i<checkboxNum; i++) {
        checkboxes[i].style.display = "none";
        checkboxes[i].labels[0].style.display = "none";
    }

    var entityIndex = 1;
    var relationIndex = 1;
    var eventIndex = 1;
    var attributeIndex = 1;
    var allAnnotations = [];
    var offsets = [];

    $('#addAnnotation').click(function () {
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
        for (var i = 0; i < offsets.length; i++) {
            if ((startIndex >= offsets[i][0] && startIndex <= offsets[i][1]) || (endIndex >= offsets[i][0] && endIndex <= offsets[i][1])) {
                highlightColor = 'rgb(35, 200, 130)';
                break;
            }
        }

        // Color-highlight selected text
        document.getElementById('file_data').contentEditable = 'true';
        document.execCommand('insertHTML', false, '<span id="' + startIndex + '_' + endIndex + '_aid" style="background-color:' + highlightColor + '; color:black;">' + highlighted + '</span>');
        document.getElementById('file_data').contentEditable = 'false';

        var ent_hover_info = [];
        var att_hover_info = [];
        var rel_hover_info = [];
        var eve_hover_info = [];

        // Get chosen option from dropdown and ignore if default selected or no matches found
        var suggestionList = document.getElementById('matchList');
        var option = suggestionList.options[suggestionList.selectedIndex].text;
        var optionWords = option.split(' ');

        if ((optionWords[optionWords.length - 2] == 'matches' && optionWords[optionWords.length - 1] == 'found') || option == 'No match') {
            option = '';
        } else {
            var annotationData = 'Test1' + '\t' + option + " " + startIndex + " " + endIndex + "\t" + highlighted + '\n';

            $.ajax({
                type: "GET",
                url: "~/write_match_to_ann",
                data: {annotations: annotationData, match: option, ann_filename: dict['ann_filename'] }
            });
        }

        // Format annotation(s) to be in stand-off format
        var annotation = [];
        for (k in dict) {
            if (k != 'file_data' && k != 'ann_filename') {
                if (document.querySelector('input[name=' + k + ']:checked') != null) {
                    // Implement relations to same annotation properly
                    var annotationValue = document.querySelector('input[name=' + k + ']:checked').value;
                    var id = "";
                    if (k == 'entities') {
                        id = "T" + entityIndex;
                        ent_hover_info.push(annotationValue);
                        entityIndex++;
                    } else if (k == 'attributes') {
                        id = "A" + attributeIndex;
                        att_hover_info.push(annotationValue);
                        attributeIndex++;
                    } else if (k == 'relation') {
                        id = "R" + relationIndex;
                        rel_hover_info.push(annotationValue);
                        relationIndex++;
                    } else if (k == 'events') {
                        id = "E" + eventIndex;
                        eve_hover_info.push(annotationValue);
                        eventIndex++;
                    } else {
                        continue;
                    }

                    // TO-Do: Implement correct stand-off formatting
                    var annotationData = id + '\t' + annotationValue + " " + startIndex + " " + endIndex + "\t" + highlighted + '\n';

                    // Save annotations to .ann file
                    $.ajax({
                        type: "GET",
                        url: "~/write_to_ann",
                        data: {annotations: annotationData, ann_filename: dict['ann_filename'] }
                    });
                    annotation.push([annotationData]);
                }
            }
        }
        // Keep track of offets for each annotation
        offsets.push([startIndex, endIndex, ent_hover_info, att_hover_info, rel_hover_info, eve_hover_info, highlighted]);

        //Add annotaion to current-annotataion list
        allAnnotations.push(annotation);

        // Add annotation to annotaion_data display
        var annotationClass = 'class="test"';
        var annotationId = 'id="' + startIndex + '_' + endIndex + '"';
        var annotationStyle = 'style="border-radius:5px; background-color:#33FFB5; font-family:\'Nunito\'; padding:10px; border:2px solid #333; display:inline-block; clear:both; float:left; '
        if (darkMode) {
            annotationStyle += 'color:black;"';
        } else {
            annotationStyle += '"'
        }
            document.getElementById('annotation_data').innerHTML += '<p ' + annotationClass + ' ' + annotationId + ' ' + annotationStyle + '>' + highlighted + '</p>';

        // Removes selection of newly-annotated text
        window.getSelection().removeAllRanges();
    });


    // Clear radio and checkbox button selections
    $('#clearSelections').click(function () {
        for (k in dict) {
            if (k != 'file_data' && k != 'ann_filename') {
                if (document.querySelector('input[name=' + k + ']:checked') != null) {
                    document.querySelector('input[name=' + k + ']:checked').checked = false;
                }
            }
        }
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
        for (var i = 0; i < offsets.length; i++) {
            if (offsets[i][0] == startIndex && offsets[i][1] == endIndex) {
                allAnnotations.splice(i, 1);
                offsets.splice(i, 1);

                // Removes annotation from annotation_data display
                var elem = document.getElementById(id);
                elem.parentElement.removeChild(elem);

                return;
            }
        };
    });


    function hoverInfo(id, type) {
        var indicies = id.split("_");
        var startIndex = indicies[0];
        var endIndex = indicies[1];
        if (id != type) {
            for (var i = 0; i < offsets.length; i++) {
                if (offsets[i][0] == startIndex && offsets[i][1] == endIndex) {

                    for (var j = 2; j <= 5; j++) {
                        if (offsets[i][j].length == 0) {
                            offsets[i][j] = 'None';
                        }
                    }
                    // To-do: deal with more than one value
                    document.getElementById(id).title = "Text: " + offsets[i][6] + "\nEntity: " + offsets[i][2] + "\nAttributes: " + offsets[i][3] + "\nRelations: " + offsets[i][4] + "\nEvents: " + offsets[i][5];
                    return;
                }
            };
        } 
    }


    // Display information about annotation on hover of annotation_data display
    $("#annotation_data").mouseover(function(eventObj) {
        hoverInfo(eventObj.target.id, 'annotation_data');
    });


    // Display information about annotation on hover of file_data display
    $("#file_data").mouseover(function(eventObj) {
        hoverInfo(eventObj.target.id, 'file_data') ;
    });


    // Prevent deselection of text when deleting annotation
    $('#annotation_data').mousedown(function() {
        return false;
    });


    // Prevent deselection of text when selecting configuration
    $('#config_data_options').mousedown(function() {
        return false;
    });


    var darkMode = false;
    // Allows users to switch to dark mode
    $('#darkMode').click(function () {
        var backgroundColor = '';
        var textColor = '';

        if (!darkMode) {
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            backgroundColor = '#333';
            textColor = 'rgb(210, 210, 210)';
            darkMode = true;
        } else {
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            backgroundColor = 'white';
            textColor = 'black';
            darkMode = false;
        }

        // To-do: Deal with text coloring issue when annotating then switching
        $('body').css({
            "background-color": backgroundColor,
            "color" : textColor
        });

    });


    // Suggest most relevant UMLS matches based on highlighted term 
    $('#file_data').mouseup(function () {
        var term = window.getSelection().toString();

        $.ajax({
            type: "GET",
            url: "~/suggest_cui",
            data: {selectedTerm: term.toLowerCase()}
        }).done(function(data){
            // Empty drop-down list
            document.getElementById('matchList').options.length = 0;
            if (data != '') {
                var arr = data.split(',');
                var matchList = document.getElementById('matchList');
                var count = 0;
                var newOption = document.createElement("option");
                newOption.text = '';
                matchList.add(newOption);
                for (var i=0; i < arr.length; i++) {
                    newOption = document.createElement("option");
                    newOption.text = arr[i];
                    matchList.add(newOption);
                    count = i;
                }
                count++;
                matchList.childNodes[0].nextElementSibling.text = count + " matches found";
            }

            if (document.getElementById('matchList').options.length == 0) {
                var matchList = document.getElementById('matchList');
                var option = document.createElement("option");
                option.text = "No match";
                matchList.add(option);
            }
        });
    });

    
    // Dynamic entity / attribute configurations
    var conditionalSelectionBoxes = JSON.parse(dict['args'].replace(/&#39;/gi, '"'));
    $("input[type=radio]").click(function () {
        // Get selected radiobutton id
        var selected = $(this).context.id;
        var checkboxes = $("input[type=checkbox]");
        var checkboxNum = checkboxes.length;
        
        for(var i=0; i<checkboxNum; i++) {
            checkboxes[i].style.display = "";
            checkboxes[i].labels[0].style.display = "";
        }

        var visible = [];
        for(var i=0; i<conditionalSelectionBoxes.length; i++) {
            if (conditionalSelectionBoxes[i][1] == selected) {
                visible.push(conditionalSelectionBoxes[i][0]);
            }
        }

        for(var i=0; i<checkboxNum; i++) {
            if (!visible.includes(checkboxes[i].id)) {
                checkboxes[i].style.display = "none";
                checkboxes[i].labels[0].style.display = "none";
            }
        }
    });
});
