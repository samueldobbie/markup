
$(document).ready(function () {

    var allAnnotations = [];
    var allMatches = [];
    var offsets = [];

    // Hide all attributes until entity is selected
    var checkboxes = $("input[type=checkbox]");
    var checkboxNum = checkboxes.length;
    for(var i=0; i<checkboxNum; i++) {
        checkboxes[i].style.display = "none";
        checkboxes[i].labels[0].style.display = "none";
    }


    var entityId = 1;
    var attributeId = 1;
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

        // Output annotation in stand-off format
        var annotation = [];
        var entityHoverInfo = [];
        var attributeHoverInfo = [];

        // Add entity data to annotation list and hover info
        var entityValue = $("input[type=radio]:checked")[0].id;
        entityHoverInfo.push(entityValue);
        entityData = 'T' + entityId + '\t' + entityValue + ' ' + startIndex + ' ' + endIndex + '\t' + highlighted + '\n';
        entityId++;

        annotation.push([entityData]);

        // Prepare attribute data to annotation list and add hover info
        var attributeValues = [];
        var attributeData = [];
        for (var i=0; i < $("input[type=checkbox]:checked").length; i++) {
            attributeValues.push($("input[type=checkbox]:checked")[i].id);
            attributeData.push('A' + attributeId + '\t' + $("input[type=checkbox]:checked")[i].id + ' T' + (entityId - 1) + '\n');
            attributeId++;
        }
        attributeHoverInfo.push(attributeValues);

        // Get chosen option cui from dropdown and ignore if default selected or no matches found
        var suggestionList = document.getElementById('matchList');
        var option = suggestionList.options[suggestionList.selectedIndex].text;
        var optionWords = option.split(' ');

        if (!((optionWords[optionWords.length - 2] == 'matches' && optionWords[optionWords.length - 1] == 'found') || option == 'No match')) {
            $.ajax({
                type: "GET",
                url: "~/write_match_to_ann",
                async: false,
                data: { match: option },
                success: function (response) {
                    var term = 'A' + attributeId + '\t' + option + ' T' + (entityId - 1) + '\n';
                    attributeData.push(term);
                    attributeId++;

                    var cui = 'A' + attributeId + '\t' + response.replace(/['"]+/g, '') + ' T' + (entityId - 1) + '\n';
                    attributeId++;
                    attributeData.push(cui);
                }
            });
        }

        // Add attributes to annotaiton list
        for (var i=0; i<attributeData.length; i++) {
            annotation.push([attributeData[i]]);
        }

        // Keep track of offets for each annotation
        offsets.push([startIndex, endIndex, entityHoverInfo, attributeHoverInfo, highlighted]);

        // Add annotations to current-annotation list
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

        writeToAnn();
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

                writeToAnn();

                // Removes annotation from annotation_data display
                var elem = document.getElementById(id);
                elem.parentElement.removeChild(elem);

                return;
            }
        };
    });


    function removeAnnFile() {
        $.ajax({
            type: 'GET',
            async: false,
            url: '~/remove_ann_file',
            data: {ann_filename: dict['ann_filename'] }
        });
    }


    // Save annotations to .ann file
    function writeToAnn() {
        removeAnnFile();
        for(var i=0; i<allAnnotations.length; i++) {
            for(var j=0; j<allAnnotations[i].length; j++) {
                $.ajax({
                    type: 'GET',
                    async: false,
                    url: '~/write_to_ann',
                    data: {annotations: allAnnotations[i][j][0], ann_filename: dict['ann_filename'] }
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
            for (var i = 0; i < offsets.length; i++) {
                if (offsets[i][0] == startIndex && offsets[i][1] == endIndex) {
                    for (var j = 2; j < 5; j++) {
                        if (offsets[i][j].length == 0) {
                            offsets[i][j] = 'None';
                        }
                    }
                    document.getElementById(id).title = "Text: " + offsets[i][4] + "\nEntity: " + offsets[i][2] + "\nAttributes: " + offsets[i][3];
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


    var darkMode;
    if (localStorage.getItem("mode") == "dark") {
        initializeColor("dark");
        darkMode = true;
    } else {
        initializeColor("light");
        darkMode = false;
    }
    // Sets inital color mode based on users preference (light vs. dark mode)
    function initializeColor(type) {
        var backgroundColor = '';
        var textColor = '';

        if (type == "dark") {
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            backgroundColor = '#333';
            textColor = 'rgb(210, 210, 210)';
        } else {
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            backgroundColor = 'white';
            textColor = 'black';
        }

        // To-do: Deal with text coloring issue when annotating then switching
        $('body').css({
            "background-color": backgroundColor,
            "color" : textColor
        });
    }


    // Allows users to switch to dark mode
    $('#darkMode').click(function () {
        var backgroundColor = '';
        var textColor = '';

        if (!darkMode) {
            localStorage.setItem("mode", "dark");
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            backgroundColor = '#333';
            textColor = 'rgb(210, 210, 210)';
            darkMode = true;
        } else {
            localStorage.setItem("mode", "light");
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

        // Deselect all checkboxes and remove hiding of all attributes
        for(var i=0; i<checkboxNum; i++) {
            $('#' + checkboxes[i].id).prop('checked', false);
            checkboxes[i].style.display = "";
            checkboxes[i].labels[0].style.display = "";
        }

        // Determine which attributes should be displayed
        var visible = [];
        for(var i=0; i<conditionalSelectionBoxes.length; i++) {
            if (conditionalSelectionBoxes[i][1] == selected) {
                visible.push(conditionalSelectionBoxes[i][0]);
            }
        }

        // Hide all unwanted attributes
        for(var i=0; i<checkboxNum; i++) {
            if (!visible.includes(checkboxes[i].id)) {
                checkboxes[i].style.display = "none";
                checkboxes[i].labels[0].style.display = "none";
            }
        }
    });
});

