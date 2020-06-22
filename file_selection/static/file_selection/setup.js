// Remove data from local storage to avoid being able to revisit page and see outdated information
var existingDisplayMode = localStorage.getItem('mode');
localStorage.clear();
if (existingDisplayMode != null) {
    localStorage.setItem('mode', existingDisplayMode);
}

$(document).ready(function () {
    var darkMode;

    // Sets inital color mode based on users stored preference (light or dark mode)
    toggleDisplayMode();

    // Allows users to switch between to light and dark mode
    function toggleDisplayMode() {
        // Checks if user has pre-set display preference
        if (localStorage.getItem('mode') == 'light') {
            type = 'light';
            darkMode = false;
        } else {
            type = 'dark';
            darkMode = true;
        }

        // Updates document elements based on display mode
        if (type == 'dark') {
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#333';
            document.getElementsByTagName('body')[0].style.color = '#fff';
            for (var i = 0; i < document.getElementsByClassName('option-container').length; i++) {
                document.getElementsByClassName('option-container')[i].style.color = 'white';
                document.getElementsByClassName('option-container')[i].style.backgroundColor = 'rgb(31, 31, 31);';
            }
        } else {
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#fff';
            document.getElementsByTagName('body')[0].style.color = 'black';
            for (var i = 0; i < document.getElementsByClassName('option-container').length; i++) {
                document.getElementsByClassName('option-container')[i].style.color = '#333';
                document.getElementsByClassName('option-container')[i].style.backgroundColor = 'rgba(240, 240, 240, 0.164)';
            }
        }
    }


    // Update display mode upon selection
    $('#darkMode').click(function () {
        if (!darkMode) {
            localStorage.setItem('mode', 'dark');
            toggleDisplayMode();
        } else {
            localStorage.setItem('mode', 'light');
            toggleDisplayMode();
        }
    });

    
    /*** Demo documents selection ***/
    $('#try-demo').click(function () {        
        localStorage.setItem('documentOpenType', 'multiple');

        localStorage.setItem('documentCount', 2);

        localStorage.setItem('fileName' + 0, 'FirstTestDoc.txt');
        localStorage.setItem('fileName' + 1, 'SecondTestDoc.txt');

        localStorage.setItem('documentText' + 0, testDocOneText);
        localStorage.setItem('documentText' + 1, testDocTwoText);

        localStorage.setItem('configText', testConfigText);

        location.href = '/annotate';
    });


    /*** Single document section ***/

    $('#single-document-selection').click(function () {
        $(".file-selection-container").fadeOut();

        sleep(500).then(() => {
            $(".single-document-selection-container").fadeIn();
        });

        // Store file selection type locally
        localStorage.setItem('documentOpenType', 'single');
    });


    $('#document-file-opener').change(function () {
        // Store file data locally
        storeFileDataLocally(document.getElementById('document-file-opener').files[0], 'documentText' + 0, 'lineBreakType' + 0);
        localStorage.setItem('fileName' + 0, document.getElementById('document-file-opener').files[0].name.split(".").slice(0, -1).join("."));
        localStorage.setItem('documentCount', 0);

        // Display name of file next to upload button
        document.getElementById('document-file-name').innerText = document.getElementById('document-file-opener').files[0].name;
        
        // Change colour of component
        updateComponentColour('document-file-opener-container');
    });


    $('#annotation-file-opener').change(function () {
        // Store file data locally
        storeFileDataLocally(document.getElementById('annotation-file-opener').files[0], 'annotationText' + 0);

        // Display name of file next to upload button
        document.getElementById('annotation-file-name').innerText = document.getElementById('annotation-file-opener').files[0].name;
        
        // Display remove button
        document.getElementById('annotation-file-remover').style.display = '';
        
        // Change colour of component
        updateComponentColour('annotation-file-opener-container');
    });


    $('#annotation-file-remover').click(function () {
        // Remove uploaded file
        document.getElementById('annotation-file-opener').value = '';

        // Remove name of file from span
        document.getElementById('annotation-file-name').innerText = '';

        // Remove uploaded file from localStorage
        localStorage.removeItem('annotationText' + 0);

        // Hide remove button
        document.getElementById('annotation-file-remover').style.display = 'none';

        // Change colour of component
        document.getElementById('annotation-file-opener-container').style.border = '1px solid #333';
    });


    $('#configuration-file-opener').change(function () {
        // Store file data locally
        storeFileDataLocally(document.getElementById('configuration-file-opener').files[0], 'configText');

        // Display name of file next to upload button
        document.getElementById('configuration-file-name').innerText = document.getElementById('configuration-file-opener').files[0].name;
        
        // Change colour of component
        updateComponentColour('configuration-file-opener-container');
    });


    $("#ontology-file-dropdown").change(function () {
        var selectedValue = this.value;
        if (selectedValue != 'Choose Pre-loaded') {
            // Setup ontology
            setupPreloadedOntology(selectedValue);

            // Change colour of component
            updateComponentColour('ontology-file-opener-container');
        }
    });


    $('#ontology-file-opener').change(function () {
        // Display name of file next to upload button
        document.getElementById('ontology-file-name').innerText = document.getElementById('ontology-file-opener').files[0].name;

        // Setup ontology
        setupCustomOntology(document.getElementById('ontology-file-opener').files[0]);

        // Change colour of component
        updateComponentColour('ontology-file-opener-container');
    });


    $('#start-annotating-file').click(function () {
        var complete = true;
        for (var i = 0; i < document.getElementsByClassName('option-file-container').length; i++) {
            if (document.getElementsByClassName('option-file-container')[i].getAttribute('complete') != 'true') {
                document.getElementsByClassName('option-file-container')[i].style.border = '1px solid red';
                complete = false;
            }
        }

        if (complete) {
            location.href = '/annotate';
        }
    });


    /*** Multiple document section ***/

    $('#multiple-document-selection').click(function () {
        $(".file-selection-container").fadeOut();

        sleep(500).then(() => {
            $(".multiple-document-selection-container").fadeIn();
        });

        // Store file selection type locally
        localStorage.setItem('documentOpenType', 'multiple');
    });


    $('#folder-file-opener').change(function () {
        var documentCount = 0;
        var documentIndex = {};
        var documentFileList = document.getElementById('folder-file-opener').files;

        for (var i=0; i<documentFileList.length; i++) {
            if (documentFileList[i].name.split('.').includes('txt')) {
                documentIndex[documentFileList[i].name.split('.')[0]] = documentCount; 
                storeFileDataLocally(documentFileList[i], 'documentText' + documentCount, 'lineBreakType' + documentCount);
                localStorage.setItem('fileName' + documentCount, documentFileList[i].name.split(".").slice(0, -1).join("."));
                documentCount++;
            } else if (documentFileList[i].name.split('.').includes('conf')) {
                storeFileDataLocally(documentFileList[i], 'configText');
            }
        }

        for (var j=0; j<documentFileList.length; j++) {
            if (documentFileList[j].name.split('.').includes('ann')) {
                var index = documentIndex[documentFileList[j].name.split('.')[0]];
                storeFileDataLocally(documentFileList[j], 'annotationText' + index);
            }
        }
        localStorage.setItem('documentCount', documentCount);

        // Display name of folder next to upload button
        // May need to be done differently on non-Chrome browsers
        document.getElementById('folder-file-name').innerText = document.getElementById('folder-file-opener').files[0].webkitRelativePath.split('/')[0];
        
        // Change colour of component
        updateComponentColour('folder-file-opener-container');
    });


    $("#ontology-folder-dropdown").change(function () {
        var selectedValue = this.value;
        if (selectedValue != 'Choose Pre-loaded') {
            // Setup ontology
            setupPreloadedOntology(selectedValue);

            // Change colour of component
            updateComponentColour('ontology-folder-opener-container');
        }
    });

    
    $('#ontology-folder-opener').change(function () {
        // Display name of file next to upload button
        document.getElementById('ontology-folder-name').innerText = document.getElementById('ontology-folder-opener').files[0].name;
        
        // Setup ontology
        setupCustomOntology(document.getElementById('ontology-folder-opener').files[0]);

        // Change colour of component
        updateComponentColour('ontology-folder-opener-container');
    });


    $('#start-annotating-folder').click(function () {
        var complete = true;
        for (var i = 0; i < document.getElementsByClassName('option-folder-container').length; i++) {
            if (document.getElementsByClassName('option-folder-container')[i].getAttribute('complete') != 'true') {
                document.getElementsByClassName('option-folder-container')[i].style.border = '1px solid red';
                complete = false;
            }
        }

        if (complete) {
            location.href = '/annotate';
        }
    });
});


function setupPreloadedOntology(selectedOntology) {
    $.ajax({
        type: 'POST',
        url: '~/setup-preloaded-ontology',
        data: {
            'selectedOntology': selectedOntology,
            'csrfmiddlewaretoken': getCookie('csrftoken')
        }
    });
}


function setupCustomOntology(file) {
    var reader = new FileReader();
    reader.onload = function () {
        $.ajax({
            type: 'POST',
            url: '~/setup-custom-ontology',
            data: {
                'ontologyData': reader.result,
                'csrfmiddlewaretoken': getCookie('csrftoken')
            }
        });
    };
    reader.readAsText(file);
}


function updateComponentColour(id) {
    document.getElementById(id).style.border = '1px solid #33FFB5';
    document.getElementById(id).setAttribute('complete', 'true');
}


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


function detectLineBreakType(text) {
    if (text.indexOf('\r\n') !== -1) {
        return 'windows';
    } else if (text.indexOf('\r') !== -1) {
        return 'mac';
    } else if (text.indexOf('\n') !== -1) {
        return 'linux';
    } else {
        return 'unknown';
    }
}


function storeFileDataLocally(file, fileStorageName, lineBreakStorageName=null) {
    setRequestHeader(getCookie('csrftoken'));

    if (file.type == 'application/pdf') {
        var fileReader = new FileReader();
        fileReader.onload = function() {

            //Step 4:turn array buffer into typed array
            var typedarray = new Uint8Array(this.result);
    
            //Step 5:PDFJS should be able to read this
            PDFJS.getDocument(typedarray).then(function(pdf) {
                console.log(pdf);
            });
        };
        //Step 3:Read the file as ArrayBuffer
        fileReader.readAsArrayBuffer(file);
    } else {
        var reader = new FileReader();
        reader.onload = function () {
            localStorage.setItem(fileStorageName, reader.result);
            if (lineBreakStorageName) {
                localStorage.setItem(lineBreakStorageName, detectLineBreakType(reader.result));
            }
        };
        reader.readAsText(file);
    }
}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function csrfSafeMethod(method) {
    // These HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


// Function to set Request Header with 'CSRFTOKEN'
function setRequestHeader(csrftoken){
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}

var testDocOneText = `
Contented get distrusts certainty nay are frankness concealed ham. On unaffected resolution on considered of. No thought me husband or colonel forming effects. End sitting shewing who saw besides son musical adapted. Contrasted interested eat alteration pianoforte sympathize was. He families believed if no elegance interest surprise an. It abode wrong miles an so delay plate. She relation own put outlived may disposed. 

Compliment interested discretion estimating on stimulated apartments oh. Dear so sing when in find read of call. As distrusts behaviour abilities defective is. Never at water me might. On formed merits hunted unable merely by mr whence or. Possession the unpleasing simplicity her uncommonly. 

Kindness to he horrible reserved ye. Effect twenty indeed beyond for not had county. The use him without greatly can private. Increasing it unpleasant no of contrasted no continuing. Nothing colonel my no removed in weather. It dissimilar in up devonshire inhabiting. 
`;

var testDocTwoText = `
Manor we shall merit by chief wound no or would. Oh towards between subject passage sending mention or it. Sight happy do burst fruit to woody begin at. Assurance perpetual he in oh determine as. The year paid met him does eyes same. Own marianne improved sociable not out. Thing do sight blush mr an. Celebrated am announcing delightful remarkably we in literature it solicitude. Design use say piqued any gay supply. Front sex match vexed her those great. 

Scarcely on striking packages by so property in delicate. Up or well must less rent read walk so be. Easy sold at do hour sing spot. Any meant has cease too the decay. Since party burst am it match. By or blushes between besides offices noisier as. Sending do brought winding compass in. Paid day till shed only fact age its end. 

Those an equal point no years do. Depend warmth fat but her but played. Shy and subjects wondered trifling pleasant. Prudent cordial comfort do no on colonel as assured chicken. Smart mrs day which begin. Snug do sold mr it if such. Terminated uncommonly at at estimating. Man behaviour met moonlight extremity acuteness direction. 
`;

var testConfigText = `
[entities]
ClinicDate
Date_of_Birth
NHS_number
Pt_PostCode
Hosp_number
Diagnosis
DiagnosedSince
SeizureOnset
EpilepsyCause
SeizureType
SeizureFrequency
Investigations
Prescription
History


[events]
[attributes]
Date Arg:ClinicDate, Value:<ENTITY>
Date Arg:Date_of_Birth, Value:<ENTITY>
NHS_Number Arg:NHS_number, Value:<ENTITY>
PostCode Arg:Pt_PostCode, Value:<ENTITY>
Hosp_Number Arg:Hosp_number, Value:<ENTITY>


EpilepsyCause Arg:EpilepsyCause, Value:Epilepsy_due_to_and_following_traumatic_brain_injury|Epilepsy_due_to_cerebrovascular_accident|Epilepsy_due_to_intracranial_tumour|Epilepsy_due_to_perinatal_anoxic-ischaemic_brain_injury|Epilepsy_due_to_perinatal_stroke|Epilepsy_congenital|Epilepsy_due_to_infectious_disease_of_central_nervous_system


SinceOrDuration Arg:SeizureOnset, Value:Date|Age|Duration
TimeUnit Arg:SeizureOnset, Value:Week|Month|Year
NoOfTimeUnits Arg:SeizureOnset, Value:TypeNumberOnly
Age Arg:SeizureOnset, Value:TypeNumberOnly
AgeLower Arg:SeizureOnset, Value:TypeNumberOnly
AgeUpper Arg:SeizureOnset, Value:TypeNumberOnly
SeizureClassification Arg:SeizureOnset, Value:Epileptic|Uncertain



NumberOfTimePeriods Arg:SeizureFrequency, Value:TypeNumberOnly
TimePeriod Arg:SeizureFrequency, Value:Day|Week|Month|Year
QuantityTotal Arg:SeizureFrequency, Value:TypeNumberOnly
QuantityLowerRange Arg:SeizureFrequency, Value:TypeNumberOnly
QuantityUpperRange Arg:SeizureFrequency, Value:TypeNumberOnly
SinceOrDuration Arg:SeizureFrequency, Value:Date|Age|Duration
TimeUnit Arg:SeizureFrequency, Value:Week|Month|Year
SinceAge Arg:SeizureFrequency, Value:TypeNumberOnly


MRI_Performed Arg:Investigations, Value:Yes|No|Notknown
MRI_Results Arg:Investigations, Value:Normal|Abnormal|Unknown


EEG_Performed Arg:Investigations, Value:Yes|No|Notknown
EEG_Results Arg:Investigations, Value:Normal|Abnormal|Unknown
EEG_Ictal Arg:Investigations, Value:Yes|No
EEG_Type Arg:Investigations, Value:SleepDeprived|VideoTelemetry|Standard|Ambulatory|Prolonged


CT_Performed Arg:Investigations, Value:Yes|No|Notknown
CT_Results Arg:Investigations, Value:Normal|Abnormal|Unknown


DrugName Arg:Prescription, Value:Acetazolamide|Carbamazepine|Clobazam|Clonazepam|EslicarbazepineAcetate|Ethosuximide|Gabapentin|Lacosamide|Lamotrigine|Levetiracetam|Nitrazepam|Oxcarbazepine|Perampanel|Piracetam|Phenobarbital|Phenytoin|Pregabalin|Primidone|Retigabine|Rufinamide|SodiumValproate|Stiripentol|Tiagabine|Topiramate|Vigabatrin|Zonisamide
DrugDose Arg:Prescription, Value:TypeNumberOnly
DoseUnit Arg:Prescription, Value:mgs|gs
Frequency Arg:Prescription, Value:1|2|3|4|As_Required


PersonalHistory Arg:History, Value:Febrile_Seizure|NonPrescriptionDrugs
Comorbidities Arg:History, Value:LearningDifficulties|Parkinsions|Alzheimers|Dementia|MS
FamilyHistory Arg:History, Value:Epilepsy
Surgery Arg:History, Value:EpilepsySurgery|OtherBrainSurgery




Numbers Arg:<ENTITY>, Value:TypeNumberOnly
DayDate Arg:<ENTITY>, Value:0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31
MonthDate Arg:<ENTITY>, Value:0|1|2|3|4|5|6|7|8|9|10|11|12
YearDate Arg:<ENTITY>, Value:0|This_Year|Last_Year|LastClinic|FromBirth|2018|2017|2016|2015|2014|2013|2012|2011|2010|2009|2008|2007|2006|2005|2004|2003|2002|2001|2000|1999|1998|1997|1996|1995|1994|1993|1992|1991|1990|1989|1988|1987|1986|1985|1984|1983|1982|1981|1980|1979|1978|1977|1976|1975|1974|1973|1972|1971|1970|1969|1968|1967|1966|1965|1964|1963|1962|1961|1960|1959|1958|1957|1956|1955|1954|1953|1952|1951|1950|1949|1948|1947|1946|1945|1944|1943|1942|1941|1940|1939|1938|1937|1936|1935|1934|1933|1932|1931|1930|1929|1928|1927|1926|1925|1924|1923|1922|1921|1920|1919

Certainty   Arg:<ENTITY>, Value:1|2|3|4|5
Polarity Arg:<ENTITY>, Value:Affirmed|Negated
`;
