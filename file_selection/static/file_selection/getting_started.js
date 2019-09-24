// Remove data from local storage to avoid being able to revisit page and see outdated information
localStorage.removeItem('documentText');
localStorage.removeItem('annotationText');
localStorage.removeItem('configText');

var salt;
if (localStorage.getItem('salt') != null) {
    salt = localStorage.getItem('salt');
} else {
    salt = generateSalt(25);
    localStorage.setItem('salt', salt);
}

$(document).ready(function () {
    var darkMode;
    var documentOpenType;
    var documentFileList;
    var annotationFileList;
    var configFileList;
    var myCipher = cipher(salt);


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
        reader.onload = function () {
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


    document.getElementById('dictionaryFileOpener').onchange = function () {
        dictionaryFileList = document.getElementById('dictionaryFileOpener').files;

        var encryptedDictionary = {};

        for (var i=0; i <= dictionaryFileList[0].size; i += (5 * 1024 * 1024)) {
            var reader = new FileReader();
            reader.readAsBinaryString(dictionaryFileList[0].slice(i, i + 5 * 1024 * 1024));

            reader.onloadend = function () {
                var unencryptedDictionary = reader.result.split('\n');
                for (var i = 0; i < unencryptedDictionary.length; i++) {
                    let values = unencryptedDictionary[i].split('\t');
                    if (values.length == 2 && values[0] != null && values[0] != '' && values[1] != null && values[1] != '') {
                        encryptedDictionary[myCipher(values[0])] = myCipher(values[1]);
                    }
                }
            }
        }

        sleep(10000).then(() => {
            $.ajax({
                type: 'POST',
                url: '/setup-dictionary',
                data: {
                    'dict': JSON.stringify(encryptedDictionary), 
                    csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value
                }
            });
            sleep(10000).then(() => {
                startAnnotating();
            });
        });
    };
});

function generateSalt(length) {
    var salt = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,./<>?;<:"|[]{}"';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        salt += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return salt;
}


let cipher = salt => {
    let textToChars = text => text.split('').map(c => c.charCodeAt(0))
    let byteHex = n => ("0" + Number(n).toString(16)).substr(-2)
    let applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code)

    return text => text.split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('')
}

// remove localStorage dictionary

function startAnnotating() {
    location.href = '/annotate';
}


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}