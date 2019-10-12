// Remove data from local storage to avoid being able to revisit page and see outdated information
localStorage.removeItem('documentText');
localStorage.removeItem('annotationText');
localStorage.removeItem('configText');
localStorage.removeItem('documentOpenType');
localStorage.removeItem('documentCount');


$(document).ready(function () {
    var darkMode;
    var documentOpenType;

    // Checks if user has preset preference for color mode
    if (localStorage.getItem('mode') == 'light') {
        initialize('light');
        darkMode = false;
    } else {
        initialize('dark');
        darkMode = true;
    }


    // Sets inital color mode based on users stored preference (light or dark mode)
    function initialize(type) {
        if (type == 'dark') {
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#333';
            document.getElementsByTagName('body')[0].style.color = '#fff';
        } else {
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            document.getElementsByTagName('body')[0].style.backgroundImage = '#fff';
            document.getElementsByTagName('body')[0].style.color = 'black';
        }
    }


    // Allows users to switch between to light and dark mode
    $('#darkMode').click(function () {
        if (!darkMode) {
            localStorage.setItem('mode', 'dark');
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#333';
            document.getElementsByTagName('body')[0].style.color = '#fff';
            darkMode = true;
        } else {
            localStorage.setItem('mode', 'light');
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#fff';
            document.getElementsByTagName('body')[0].style.color = 'black';
            darkMode = false;
        }
    });


    $('#aSingleDoc').click(function () {
        documentOpenType = 'single';

        $("#questionOne").fadeOut();
        $("#aSingleDoc").fadeOut();
        $("#multipleDocs").fadeOut();

        sleep(500).then(() => {
            $("#questionTwoA").fadeIn();
            $("#documentFileOpenerOverlay").fadeIn();
        });

        localStorage.setItem('documentOpenType', documentOpenType);
    });


    $('#multipleDocs').click(function () {
        documentOpenType = 'multiple';

        $("#questionOne").fadeOut();
        $("#aSingleDoc").fadeOut();
        $("#multipleDocs").fadeOut();

        sleep(500).then(() => {
            $("#questionTwoB").fadeIn();
            $("#documentFolderOpener").fadeIn();
            $("#multipleFileSpec").fadeIn();
        });

        localStorage.setItem('documentOpenType', documentOpenType);
    });


    document.getElementById('documentFileOpener').onchange = function () {
        $("#questionTwoA").fadeOut();
        $("#documentFileOpenerOverlay").fadeOut();

        sleep(500).then(() => {
            $("#questionThreeA").fadeIn();
            $("#configFileOpenerOverlay").fadeIn();
            $("#configFileCreator").fadeIn();
        });

        storeFileDataLocally(document.getElementById('documentFileOpener').files[0], 'documentText');
    }


    document.getElementById('documentFolderOpener').onchange = function () {
        $("#questionTwoB").fadeOut();
        $("#documentFolderOpener").fadeOut();
        $("#multipleFileSpec").fadeOut();

        sleep(500).then(() => {
            $("#questionFive").fadeIn();
            $("#dictionaryOptions").fadeIn();
        });

        var documentCount = 0;
        documentFileList = document.getElementById('documentFolderOpener').files;
        for (var i=0; i<documentFileList.length; i++) {
            if (documentFileList[i].name.split('.')[1] == 'txt') {
                documentCount++;
                storeFileDataLocally(documentFileList[i], 'documentText' + documentCount);
            } else if (documentFileList[i].name.split('.')[1] == 'ann') {
                storeFileDataLocally(documentFileList[i], 'annotationText' + documentCount);
            } else if (documentFileList[i].name.split('.')[1] == 'conf') {
                storeFileDataLocally(documentFileList[i], 'configText');
            }
        }
        localStorage.setItem('documentCount', documentCount);
    }


    document.getElementById('configFileOpener').onchange = function () {
        $("#questionThreeA").fadeOut();
        $("#configFileOpenerOverlay").fadeOut();
        $("#configFileCreator").fadeOut();

        sleep(500).then(() => {
            $("#questionFourA").fadeIn();
            $("#annotationFileOpenerOverlay").fadeIn();
            $("#skipAnnotationFileOpening").fadeIn();
        });

        storeFileDataLocally(document.getElementById('configFileOpener').files[0], 'configText');
    }


    document.getElementById('annotationFileOpener').onchange = function () {
        $("#questionFourA").fadeOut();
        $("#annotationFileOpenerOverlay").fadeOut();
        $("#skipAnnotationFileOpening").fadeOut();

        sleep(500).then(() => {
            $("#questionFive").fadeIn();
            $("#dictionaryOptions").fadeIn();
        });

        storeFileDataLocally(document.getElementById('annotationFileOpener').files[0], 'annotationText');
    }


    $('#skipAnnotationFileOpening').click(function () {
        $("#questionFourA").fadeOut();
        $("#annotationFileOpenerOverlay").fadeOut();
        $("#skipAnnotationFileOpening").fadeOut();

        sleep(500).then(() => {
            $("#questionFive").fadeIn();
            $("#dictionaryOptions").fadeIn();
        });
    });


    $('.dictionaryOption').click(function (e) {
        var dictionarySelection = e.target.id;

        if (dictionarySelection != 'userDictionary') {
            $("#questionFive").fadeOut();
            $("#dictionaryOptions").fadeOut();

            sleep(500).then(() => {
                $("#finishedQuestions").fadeIn();
                $.ajax({
                    type: 'POST',
                    url: '/setup-dictionary',
                    data: {
                        'dictionarySelection': dictionarySelection,
                        csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value
                    },
                    success: startAnnotating()
                });
            });
        }
    });


    document.getElementById('dictionaryFileOpener').onchange = function () {
        var dictionaryFileList = document.getElementById('dictionaryFileOpener').files;
        var dataSlice = 10*1024*1024;
        var dictionaryData = [];
        var completedLoadCount = 0;
        var requiredLoadCount = Math.ceil(dictionaryFileList[0].size / dataSlice);

        document.getElementById("loader").style.display = "";
        document.getElementById("questionFive").style.display = "none";
        document.getElementById("dictionaryOptions").style.display = "none";

        for (var i=0; i<dictionaryFileList[0].size; i+=dataSlice) {
            var reader = new FileReader();
            reader.onload = function () {
                var split = reader.result.split('\n');
                for (var j=0; j<split.length; j++) {
                    dictionaryData.push(split[j]);
                    if (j == split.length-1) {
                        completedLoadCount++;
                    }
                }
                if (completedLoadCount == requiredLoadCount) {
                    $.ajax({
                        type: 'POST',
                        url: '/setup-dictionary',
                        data: {
                            'dictionarySelection': 'userDictionary',
                            'dictionaryData': JSON.stringify(dictionaryData), 
                            csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value
                        },
                        success: function(response) {
                            startAnnotating();
                        }
                    });
                }
            }
            reader.readAsBinaryString(dictionaryFileList[0].slice(i, i+dataSlice));
        }
    }
});


function startAnnotating() {
    location.href = '/annotate';
}


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


function storeFileDataLocally(file, localStorageName) {
    var reader = new FileReader();
    reader.onload = function () {
        localStorage.setItem(localStorageName, reader.result);
    };
    reader.readAsText(file);
}
