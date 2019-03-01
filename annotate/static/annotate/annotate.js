
$(document).ready(function () {


    var entityIndex = 1;
    var relationIndex = 1;
    var eventIndex = 1;
    var attributeIndex = 1;
    var allAnnotations = [];
    var offsets = [];
    
    $('#addAnnotation').click(function () {
        var highlighted = window.getSelection().toString();
        
        if (highlighted == '') { return; };
        
        // Get start and end indicies (offsets) of selected text
        var doc = document.getElementById('file_data');
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(doc);
        preCaretRange.setEnd(range.startContainer, range.startOffset);

        startIndex = preCaretRange.toString().length;
        endIndex = startIndex + range.toString().length;

        // Color-highlight selected text
        document.getElementById('file_data').contentEditable = 'true';
        document.execCommand('backColor', false, '#33FFB5');
        document.execCommand('foreColor', false, 'black');
        document.getElementById('file_data').contentEditable = 'false';        

        var ent_hover_info = [];
        var att_hover_info = [];
        var rel_hover_info = [];
        var eve_hover_info = [];

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
        offsets.push([startIndex, endIndex, ent_hover_info, att_hover_info, rel_hover_info, eve_hover_info]);

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


    /*
    // Add ability to hide or show stopwords
    //var stopwordsHidden = false;
    //var stopwords = [deleted];
    $('#hideStopwords').click(function () {
        var wordColor = '';
        if (!stopwordsHidden) {
            wordColor = '#efeff5';
            document.getElementById('hideStopwords').innerText = "Show Stopwords";
            stopwordsHidden = true;
        } else {
            wordColor = 'black';
            document.getElementById('hideStopwords').innerText = "Hide Stopwords";
            stopwordsHidden = false;
        }

        for (var i = 0; i < stopwords.length; i++) {
            var myElements = document.querySelectorAll("." + stopwords[i]);
            for (var j = 0; j < myElements.length; j++) {
                myElements[j].style.color = wordColor;
            }
        }
    });
    */


    // Delete clicked annotation
    $('#annotation_data').on('click', '.test', function (event) {
        var indicies = event.target.id.split("_");
        var startIndex = indicies[0];
        var endIndex = indicies[1];

        document.getElementById('file_data').contentEditable = 'true';
        document.execCommand('RemoveFormat', false, null);
        document.getElementById('file_data').contentEditable = 'false';

        // Finds correct annotation index based on offset list and removes
        for (var i = 0; i < offsets.length; i++) {
            if (offsets[i][0] == startIndex && offsets[i][1] == endIndex) {
                allAnnotations.splice(i, 1);
                offsets.splice(i, 1);

                // Removes annotation from annotation_data display
                var elem = document.getElementById(event.target.id);
                elem.parentElement.removeChild(elem);

                // Remove highlight from annotation

                return;
            }
        };
    });


    // Display information about annotation on hover
    $("#annotation_data").mouseover(function(eventObj) {
        var id = eventObj.target.id;
        var indicies = event.target.id.split("_");
        var startIndex = indicies[0];
        var endIndex = indicies[1];
        if (id != 'annotation_data') {
            for (var i = 0; i < offsets.length; i++) {
                if (offsets[i][0] == startIndex && offsets[i][1] == endIndex) {

                    for (var j = 2; j <= 5; j++) {
                        if (offsets[i][j].length == 0) {
                            offsets[i][j] = 'None';
                        }
                    }
                    // To-do: deal with more than one value
                    document.getElementById(id).title = "Entity: " + offsets[i][2] + "\nAttributes: " + offsets[i][3] + "\nRelations: " + offsets[i][4] + "\nEvents: " + offsets[i][5];
                    return;
                }
            };
        } 
    });


    // Prevent deselection of text when deleting annotation
    $('#annotation_data').mousedown(function() {
        return false;
    });


    // Prevent deselection of text when selecting configuration
    $('#config_data').mousedown(function() {
        return false;
    });

    var darkMode = false;
    var backgroundColor = '';
    var textColor = '';
    // Allows users to switch to darkm mode
    $('#darkMode').click(function () {
        if (!darkMode) {
            backgroundColor = '#333';
            textColor = 'rgb(210, 210, 210)';
            darkMode = true;
        } else {
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
});
