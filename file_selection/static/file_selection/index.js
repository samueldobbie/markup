$(document).ready(function () {
    $('#darkMode').click(function () {
        /*
        Enable switching between display modes
        */
        if (localStorage.getItem('mode') == 'dark') {
            localStorage.setItem('mode', 'light');
        } else {
            localStorage.setItem('mode', 'dark');
        }
        updateDisplayMode();
    });

    $('#try-demo').click(function () {
        /*
        Enable users to try out a demo of markup annotation
        */
        setupDemoDocuments();
        setupDemoConfig();
        setupDemoOntology();

        location.href = '/annotate';
    });

    // Initialize display mode based on users' preference
    updateDisplayMode();
});


function updateDisplayMode() {
    /*
    Updates the display mode based on the users' preference
    */
    var backgroundColor, color;

    if (localStorage.getItem('mode') == 'dark') {
        document.getElementById('darkMode').innerHTML = 'Light Mode';
        backgroundColor = '#1A1E24';
        color = 'white';
    } else {
        document.getElementById('darkMode').innerHTML = 'Dark Mode';
        backgroundColor = '#f1f1f1';
        color = '#1A1E24';
    }

    $('body').css({
        'background-color': backgroundColor
    });

    $('nav').css({
        'background-color': backgroundColor
    });

    $('.nav-logo').css({
        'color': color
    });

    $('.nav-item').css({
        'color': color
    });

    $('.tagline-component').css({
        'color': color
    });

    $('#try-demo').css({
        'color': color
    });
}


function setupDemoDocuments() {
    $.ajax({
        type: 'POST',
        async: false,
        url: '~/setup-demo-documents',
        data: {'csrfmiddlewaretoken': getCookie('csrftoken')},
        success: function (response) {
            var data = JSON.parse(response);
            var documentCount = data.length;

            console.log(data);
            console.log(documentCount);
            
            if (documentCount > 1) {
                localStorage.setItem('documentOpenType', 'multiple');
            } else {
                localStorage.setItem('documentOpenType', 'single');
            }
            localStorage.setItem('documentCount', documentCount);

            for (var i = 0; i < documentCount; i++) {
                localStorage.setItem('fileName' + i, 'TestDoc' + i + '.txt');
                localStorage.setItem('documentText' + i, data[i]);
            }
        }
    });
}


function setupDemoConfig() {
    $.ajax({
        type: 'POST',
        async: false,
        url: '~/setup-demo-config',
        data: {'csrfmiddlewaretoken': getCookie('csrftoken')},
        success: function (response) {
            localStorage.setItem('configText', response);
        }
    });
}


function setupDemoOntology() {
    $.ajax({
        type: 'POST',
        async: false,
        url: '~/setup-demo-ontology',
        data: {
            'csrfmiddlewaretoken': getCookie('csrftoken')
        }
    });
}