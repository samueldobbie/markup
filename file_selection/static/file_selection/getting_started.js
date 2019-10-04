// Remove data from local storage to avoid being able to revisit page and see outdated information
localStorage.removeItem('documentText');
localStorage.removeItem('annotationText');
localStorage.removeItem('configText');
localStorage.removeItem('documentOpenType');


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
            $("#documentFolderOpenerOverlay").fadeIn();
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

        storeFileDataLocally('documentFileOpener', 'documentText');
    }


    document.getElementById('documentFolderOpener').onchange = function () {
        $("#questionTwoB").fadeOut();
        $("#documentFolderOpenerOverlay").fadeOut();

        sleep(500).then(() => {
            $("#questionFive").fadeIn();
            $("#dictionaryOptions").fadeIn();
        });

        documentFileList = document.getElementById('documentFolderOpener').files;
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

        storeFileDataLocally('configFileOpener', 'configText');
    }


    document.getElementById('annotationFileOpener').onchange = function () {
        $("#questionFourA").fadeOut();
        $("#annotationFileOpenerOverlay").fadeOut();
        $("#skipAnnotationFileOpening").fadeOut();

        sleep(500).then(() => {
            $("#questionFive").fadeIn();
            $("#dictionaryOptions").fadeIn();
        });

        storeFileDataLocally('annotationFileOpener' , 'annotationText');
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
        } else {
            /*
            $("#questionFive").fadeOut();
            $('.dictionaryOption').click(function (e) {
                dictionaryFileList = document.getElementById('dictionaryFileOpener').files;

                for (var i=0; i<dictionaryFileList[0].size; i += 5*1024*1024) {
                    var reader = new FileReader();
                    reader.readAsBinaryString(dictionaryFileList[0].slice(i, 5*1024*1024));
                }

                reader.onloadend = function () {
                    $.ajax({
                        type: 'POST',
                        url: '/setup-dictionary',
                        data: {
                            'dictionary': JSON.stringify(reader.result), 
                            csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value
                        }
                    });
                }

                sleep(30000).then(() => {
                    startAnnotating();
                });
            };
            */
        }
    });
});


function startAnnotating() {
    location.href = '/annotate';
}


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


function storeFileDataLocally(fileOpenerId, localStorageName) {
    fileList = document.getElementById(fileOpenerId).files;

    var reader = new FileReader();
    reader.onload = function () {
        localStorage.setItem(localStorageName, reader.result);
    };

    reader.readAsText(fileList[0]);
}
