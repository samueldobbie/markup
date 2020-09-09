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


    $('#add-variable').click(function () {
        /*
        Add variable for use in sentence
        template during training data generation
        */

        // Get input data
        var name = $('#variable-name').val();
        if ($('#variable-dropdown').val() == 'text') {
            var values = $('#variable-text-value').val().split(',');
        } else {
            var low = $('#numerical-range-low').val();
            var high = $('#numerical-range-high').val();
            var step = $('#numerical-range-step').val();
        }

        // Add

        // Clear input fields
        $('#variable-name').val('');
        $('#variable-text-value').val('');
        $('#numerical-range-low').val('');
        $('#numerical-range-high').val('');
        $('#numerical-range-step').val('');

        updateTrainingFileURL();
    });


    $('#add-template').click(function () {
        /*
        Add template for use during training
        data generation
        */

        // Get input data
        var template = $('#template-input').val();

        // Add

        // Clear input field
        $('#template-input').val('');

        updateTrainingFileURL();
    });


    $('#variable-dropdown').change(function () {
        /*
        Display variable fields based on
        dropdown selection
        */
       
        if ($(this).val() == 'text') {
            $('#variable-text-value').show();
            $('#variable-numerical-range').hide();
        } else {
            $('#variable-text-value').hide();
            $('#variable-numerical-range').show();
        }
    });


    function updateTrainingFileURL() {
        var saveButton = document.getElementById('save-training-data');
        var fileName = 'training-data.txt';
        var contentType = 'text/plain';
        var blob = new Blob(trainingData, {type: contentType});

        window.URL.revokeObjectURL(saveButton.href);
        saveButton.href = URL.createObjectURL(blob);
        saveButton.download = fileName;
    }

    // Initialize display mode based on users' preference
    updateDisplayMode();

    // Add tooltips to option headlines
    $('.training-tooltip').simpletooltip({
        position: 'right',
        border_color: 'white',
        color: '#1A1E24',
        background_color: 'white',
        border_width: 4
    });
});

function updateDisplayMode() {
    /*
    Updates the display mode based on the users' preference
    */
    var targetBackgroundColor, oppositeBackgroundColor, color;

    if (localStorage.getItem('mode') == 'dark') {
        document.getElementById('darkMode').innerHTML = 'Light Mode';
        targetBackgroundColor = '#1A1E24';
        oppositeBackgroundColor = '#f1f1f1';
        color = 'white';
    } else {
        document.getElementById('darkMode').innerHTML = 'Dark Mode';
        targetBackgroundColor = '#f1f1f1';
        oppositeBackgroundColor = '#1A1E24';
        color = '#1A1E24';
    }

    $('body').css({
        'background-color': targetBackgroundColor
    });

    $('nav').css({
        'background-color': targetBackgroundColor
    });

    $('.nav-logo').css({
        'color': color
    });

    $('.nav-item').css({
        'color': color
    });

    $('.option-container').css({
        'color': color,
        'background-color': targetBackgroundColor,
    });
}


function updateTextInput(value) {
    document.getElementById('quantity-range-value').innerText = value; 
}


function generateTrainingData() {
    trainingData.push('abc');
}

var trainingData = [];
