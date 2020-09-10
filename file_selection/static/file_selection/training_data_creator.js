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


    $('#add-variable').click(function () {
        /*
        Add variable for use in sentence
        template during training data generation
        */

        var variable = {};
        variable['type'] = $('#variable-dropdown').val();
        variable['name'] = $('#variable-name').val().toLowerCase().trim();

        // Check that valid name has been entered
        if (variable['name'] == '') {
            alert('Variable name cannot be empty.');
            return;
        }

        // Check that variable name hasn't already been used
        if (addedVariableNames.includes(variable['name'])) {
            alert('Variable name already exists!');
            return;
        }


        // Parse input values
        variable['values'] = [];
        if (variable['type'] == 'text') {
            // Tokenise and clean input values
            var values = $('#variable-text-value').val().split(',');
            for (valueIndex in values) {
                var value = values[valueIndex].trim();
                if (value != '') {
                    variable['values'].push(values[valueIndex].trim());
                }
            }
            
            if (variable['values'].length == 0) {
                alert('Values cannot be empty.');
                return;
            }
        } else {
            var low = parseInt($('#numerical-range-low').val());
            var high = parseInt($('#numerical-range-high').val());
            var step = parseInt($('#numerical-range-step').val());

            // Check that all numerical fields have been populated
            if (isNaN(low) || isNaN(high) || isNaN(step)) {
                alert('Numerical range fields cannot be empty.');
                return;
            }

            // Check that valid range has been entered
            if (low > high) {
                alert('Low value cannot be greater than the high value.');
                return;
            }

            // Generate range values
            for (var i = low; i <= high; i += step) {
                variable['values'].push(i);
            }
        }

        // Clear input fields
        $('#variable-name').val('');
        $('#variable-text-value').val('');
        $('#numerical-range-low').val('');
        $('#numerical-range-high').val('');
        $('#numerical-range-step').val('');

        // Prevent variable name from being re-used        
        addedVariableNames.push(variable['name']);

        // Add variable to global list
        variables.push(variable);

        // Add variable to display
        document.getElementById('variable-list').innerHTML += '<span class="added-element" type="variable">' + variable['name'] + '</span>';
    
        // Add event for deleting variable
        bindEvents();
    });


    $('#add-template').click(function () {
        /*
        Add template for use during training
        data generation
        */

        // Get input data
        var template = $('#template-input').val().trim();

        // Check that template hasn't already been added
        if (templates.includes(template)) {
            alert('Template already exists.');
            return;
        }

        // Validate template input
        if (template == '') {
            alert('Template cannot be empty.');
            return;
        }

        // Clear input field
        $('#template-input').val('');

        // Add template to global list
        templates.push(template);

        // Add template to display
        document.getElementById('template-list').innerHTML += '<span class="added-element" type="template">' + template + '</span>';
    
        // Add event for deleting template
        bindEvents();
    });


    $('#generate-training-data').click(function () {
        // Generate data
        for (var i = 0; i < quantity; i++) {
            console.log(i);
            // Pick random sentence template
            var template = templates[getRandomIndex(templates.length)];
    
            // Populate template with appropiate variable values
            var populatedTemplate = '';
            var templateComponents = template.split('${');
            for (var j = 0; j < templateComponents.length; j++) {
                var templateComponent = templateComponents[j].split('}')
                for (var k = 0; k < templateComponent.length; k++) {
                    var variableIndex = addedVariableNames.indexOf(templateComponent[k].toLowerCase().trim());
                    if (variableIndex != -1) {
                        var variableValues = variables[variableIndex]['values'];
                        populatedTemplate += variableValues[getRandomIndex(variableValues.length)];
                    } else {
                        populatedTemplate += templateComponent[k];
                    }
                }
            }
            populatedTemplate += '\n';
    
            // Add training data
            trainingData.add(populatedTemplate);
        }

        // Enable generated data to be exported
        updateTrainingFileURL();

        $('#generate-training-data').hide();
        $('#export-training-data').show();
    });


    function bindEvents() {
        /*
        Enable added elements to
        be deleted upon selection
        */

        $('.added-element').click(function () {
            // Get variable name
            var elementText = $(this).text();
            var elementType = $(this).attr('type');

            // Remove element from output list
            if (elementType == 'variable') {
                var variableIndex = addedVariableNames.indexOf(elementText);
                variables.splice(variableIndex, 1);
                addedVariableNames.splice(variableIndex, 1);
            } else {
                // Remove template from output list
                var templateIndex = templates.indexOf(elementText);
                templates.splice(templateIndex, 1);
            }

            // Delete element from display list
            $(this).remove();
        });
    }

    // Add tooltips to option headlines
    $('.training-tooltip').simpletooltip({
        position: 'right',
        border_color: 'white',
        color: '#1A1E24',
        background_color: 'white',
        border_width: 4
    });


    // Initialize display mode based on users' preference
    updateDisplayMode();
});


function updateDisplayMode() {
    /*
    Updates the display mode based on the users' preference
    */
    var targetBackgroundColor, color;

    if (localStorage.getItem('mode') == 'dark') {
        document.getElementById('darkMode').innerHTML = 'Light Mode';
        targetBackgroundColor = '#1A1E24';
        color = 'white';
    } else {
        document.getElementById('darkMode').innerHTML = 'Dark Mode';
        targetBackgroundColor = '#f1f1f1';
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
    quantity = value;
}


function getRandomIndex(max) {
    return Math.floor(Math.random() * max);
}


function updateTrainingFileURL() {
    var saveButton = document.getElementById('export-training-data');
    var fileName = 'training-data.txt';
    var contentType = 'text/plain';
    var blob = new Blob(trainingData, {type: contentType});

    window.URL.revokeObjectURL(saveButton.href);
    saveButton.href = URL.createObjectURL(blob);
    saveButton.download = fileName;
}

var addedVariableNames = [];
var variables = [];
var templates = [];
var quantity = 0;
var trainingData = new Set();
