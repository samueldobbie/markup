
$(document).ready(function () {


    var entityIndex = 1;
    var relationIndex = 1;
    var eventIndex = 1;
    var attributeIndex = 1;
    var allAnnotations = [];
    var offsets = [];
    var stopwordsHidden = false;
    var stopwords = ["therefore", "see", "able", "yet", "know", "get", "saw", "known", "perhaps", "might", "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];


    $('#addAnnotation').click(function () {
        var highlighted = window.getSelection().toString();

        // Check whether selected text is valid
        var validAnnotation = false;
        for (k in dict) {
            if (k != 'file_data' && k != 'ann_filename') {
                if (document.querySelector('input[name=' + k + ']:checked') != null) {
                    validAnnotation = true;
                }
            }
        }

        if (!validAnnotation || highlighted == '') {
            return;
        }

        // Get start and end indicies (offsets) of selected text
        var div = document.getElementById('file_data');
        var text = div.innerText;

        var sel = getSelection();
        var result = { start: null, end: null };

        if (sel.anchorNode.nodeName == 'DIV') {
            return;
        }

        ['start', 'end'].forEach(which => {
            var counter = 1;
            var tmpNode = div.querySelector('span');
            var node = which == 'start' ? 'anchor' : 'focus';

            if (!sel) return;

            while (tmpNode != sel[node + 'Node'].parentElement) {
                if (tmpNode != null) {
                    result[which] += tmpNode.innerText.length;
                }
                counter++;
                tmpNode = div.querySelector('span:nth-child(' + counter + ')')
            }
            result[which] += sel[node + 'Offset'] + (which == 'start' ? 1 : 0);
        });

        var startIndex, endIndex = 0;
        if (result.start < result.end) {
            startIndex = result.start;
            endIndex = result.end;
        } else {
            startIndex = result.end;
            endIndex = result.start;
        };

        //Add annotaion to current-annotataion list
        var annotation = [];
        // Color-highlight selected text
        document.getElementById('file_data').contentEditable = 'true';
        document.execCommand('backColor', false, '#33FFB5');
        document.getElementById('file_data').contentEditable = 'false';

        // Format annotation(s) to be in stand-off format
        for (k in dict) {
            if (k != 'file_data' && k != 'ann_filename') {
                if (document.querySelector('input[name=' + k + ']:checked') != null) {
                    // Implement relations to same annotation properly
                    var id = "";
                    if (k == 'entities') {
                        id = "T" + entityIndex;
                        entityIndex++;
                    } else if (k == 'attributes') {
                        id = "A" + attributeIndex;
                        attributeIndex++;
                    } else if (k == 'relation') {
                        id = "R" + relationIndex;
                        relationIndex++;
                    } else if (k == 'events') {
                        id = "E" + eventIndex;
                        eventIndex++;
                    }
                    annotation.push([id + '\t' + document.querySelector('input[name=' + k + ']:checked').value + " " + startIndex + " " + endIndex + "\t" + highlighted + '\n']);
                }
            }
        }
        // Keep track of offets for each annotation
        offsets.push([startIndex, endIndex]);
        allAnnotations.push(annotation);

        // Add annotation to annotaion_data display
        document.getElementById('annotation_data').innerHTML += '<p class="test" id="' + startIndex + '_' + endIndex + '" style="background-color:#33FFB5; font-family:\'Nunito\'; padding:10px; border:2px solid #888; display:inline-block; clear:both; float:left;">' + highlighted + '</p>';
        // Un-highlights newly-annotated text
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


    // Gray-out / restore stop words
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


    // Save annotations to .ann file
    var textFile = null;
    $('#saveAnnotations').click(function () {
        var data = new Blob(allAnnotations, {type: 'text/plain'});

        if (textFile != null) {
            window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);
        document.getElementById("downloadButton").href = textFile;
    });

    // Delete clicked annotation
    $('#annotation_data').on('click', '.test', function (event) {
        var indicies = event.target.id.split("_");
        var startIndex = indicies[0];
        var endIndex = indicies[1];

        for (var i = 0; i < offsets.length; i++) {
            if (offsets[i][0] == startIndex && offsets[i][1] == endIndex) {
                allAnnotations.splice(i, 1);
                offsets.splice(i, 1);
                var elem = document.getElementById(event.target.id);
                elem.parentElement.removeChild(elem);
                return;
            }
        };
    });

    
});
