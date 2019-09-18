$(document).ready(function () {
    // Checks if user has preset preference for color mode
    var darkMode;
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

    var openType;
    var documentFileList;
    var annotationFileList;
    var configFileList;
    var dictionarySelection;

    $('#aSingleDoc').click(function () {
        openType = 'single';

        $("#questionOne").fadeOut();
        $("#aSingleDoc").fadeOut();
        $("#multipleDocs").fadeOut();

        sleep(500).then(() => {
            $("#questionTwoA").fadeIn();
            $("#documentFileOpenerOverlay").fadeIn();
        });
    });

    $('#multipleDocs').click(function () {
        openType = 'multiple';

        $("#questionOne").fadeOut();
        $("#aSingleDoc").fadeOut();
        $("#multipleDocs").fadeOut();

        sleep(500).then(() => {
            $("#questionTwoB").fadeIn();
            $("#documentFolderOpenerOverlay").fadeIn();
        });
    });

    document.getElementById('documentFileOpener').onchange = function() {
        $("#questionTwoA").fadeOut();
        $("#documentFileOpenerOverlay").fadeOut();

        sleep(500).then(() => {
            $("#questionThreeA").fadeIn();
            $("#configFileOpenerOverlay").fadeIn();
            $("#configFileCreator").fadeIn();
        });

        documentFileList = document.getElementById('documentFileOpener').files;
    }

    document.getElementById('documentFolderOpener').onchange = function() {
        $("#questionTwoB").fadeOut();
        $("#documentFolderOpenerOverlay").fadeOut();

        sleep(500).then(() => {
            $("#questionFive").fadeIn();
            $("#dictionaryOptions").fadeIn();
        });

        documentFileList = document.getElementById('documentFolderOpener').files;
    }

    document.getElementById('configFileOpener').onchange = function() {
        $("#questionThreeA").fadeOut();
        $("#configFileOpenerOverlay").fadeOut();
        $("#configFileCreator").fadeOut();
        
        sleep(500).then(() => {
            $("#questionFourA").fadeIn();
            $("#annotationFileOpenerOverlay").fadeIn();
            $("#skipAnnotationFileOpening").fadeIn();
        });

        configFileList = document.getElementById('configFileOpener').files;
    }

    document.getElementById('annotationFileOpener').onchange = function() {
        $("#questionFourA").fadeOut();
        $("#annotationFileOpenerOverlay").fadeOut();
        $("#skipAnnotationFileOpening").fadeOut();
        
        sleep(500).then(() => {
            $("#questionFive").fadeIn();
            $("#dictionaryOptions").fadeIn();
        });

        annotationFileList = document.getElementById('annotationFileOpener').files;
    }

    $('#skipAnnotationFileOpening').click(function() {
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
            });
        } else {
            $("#questionFive").fadeOut();
        }

        if (openType == 'single') {
            console.log(documentFileList);
            console.log(annotationFileList);
            console.log(configFileList);
            console.log(dictionarySelection);
        } else if (openType == 'multiple') {
            console.log(documentFileList);
            console.log(dictionarySelection);
        }
    });
});

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


/*
var reader = new FileReader();
    
reader.addEventListener('load', function (e) {
    console.log(e.target.result);
});
            
reader.readAsBinaryString(documentFileList[0]);
*/