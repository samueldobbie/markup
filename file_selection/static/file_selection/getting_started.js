// Remove data from local storage to avoid being able to revisit page and see outdated information
localStorage.removeItem('documentText');
localStorage.removeItem('annotationText');
localStorage.removeItem('configText');
localStorage.removeItem('dictionarySelection');

$(document).ready(function () {
    var darkMode;
    var documentOpenType;
    var documentFileList;
    var annotationFileList;
    var configFileList;
    var dictionarySelection;


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

    /*
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
    */


    document.getElementById('documentFileOpener').onchange = function () {
        $("#questionTwoA").fadeOut();
        $("#documentFileOpenerOverlay").fadeOut();

        sleep(500).then(() => {
            $("#questionThreeA").fadeIn();
            $("#configFileOpenerOverlay").fadeIn();
            $("#configFileCreator").fadeIn();
        });

        documentFileList = document.getElementById('documentFileOpener').files;

        var reader = new FileReader();
        reader.onload = function (e) {
            localStorage.setItem('documentText', reader.result);
        };

        reader.readAsText(documentFileList[0]);
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

        configFileList = document.getElementById('configFileOpener').files;

        var reader = new FileReader();
        reader.onload = function (e) {
            localStorage.setItem('configText', reader.result);
        };

        reader.readAsBinaryString(configFileList[0]);
    }


    document.getElementById('annotationFileOpener').onchange = function () {
        $("#questionFourA").fadeOut();
        $("#annotationFileOpenerOverlay").fadeOut();
        $("#skipAnnotationFileOpening").fadeOut();

        sleep(500).then(() => {
            $("#questionFive").fadeIn();
            $("#dictionaryOptions").fadeIn();
        });

        annotationFileList = document.getElementById('annotationFileOpener').files;

        var reader = new FileReader();
        reader.onload = function (e) {
            localStorage.setItem('annotationText', reader.result);
        };

        reader.readAsBinaryString(annotationFileList[0]);
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
        dictionarySelection = e.target.id;

        if (dictionarySelection != 'userDictionary') {
            $("#questionFive").fadeOut();
            $("#dictionaryOptions").fadeOut();

            sleep(500).then(() => {
                $("#finishedQuestions").fadeIn();
                startAnnotating();
            });
        } else {
            $("#questionFive").fadeOut();
            // Add user dictionary path
        }

        localStorage.setItem('dictionarySelection', dictionarySelection);
    });


    function startAnnotating() {
        location.href = '/annotate';
    }


    function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
});