$(document).ready(function () {
    $('#variable-dropdown').change(function () {
        // Show fields based on dropdown selection
        if ($(this).val() == 'text') {
            $('#variable-text-value').show();
            $('#variable-numerical-range').hide();
        } else {
            $('#variable-text-value').hide();
            $('#variable-numerical-range').show();
        }
    });

    $('#range-input').on('input', function () {
        form.updateQuantityValue(this.value);
    });

    $('#add-variable').click(function () {
        let variable = {
            'type': $('#variable-dropdown').val(),
            'name': $('#variable-name').val().toLowerCase().trim(),
        };

        // Parse input values
        if (variable.type == 'text') {
            variable.values = inputParser.getTextValues();
        } else {
            variable.values = inputParser.getNumericValues();
        }

        // Validate input
        if (!inputValidator.isValidVariable(variable)) return;

        // Display variable
        $('#variable-list').append(
            form.constructElement(variable.name, 'variable')
        );

        // Add variable to existing and output lists
        form.existingVariables.push(variable.name);
        form.variables.push(variable);

        // Clear input fields and enable deletion
        form.clearVariableFields();
        form.bindEvents();
    });

    
    $('#add-template').click(function () {
        const input = $('#template-input').val().trim();
        const target = $('#template-target').val().trim();
        const template = input + '\t' + target;

        // Validate input
        if (!inputValidator.isValidTemplate(input, target, template)) return;

        // Display template
        $('#template-list').append(
            form.constructElement(input, 'template')
        );

        // Add template to output list
        form.templates.push(template);

        // Clear input fields and enable deletion
        form.clearTemplateFields();
        form.bindEvents();
    });


    $('#generate-training-data').click(function () {
        // Validate generation inputs
        if (!inputValidator.isValidGenerator()) return;

        // Generate and export training data
        dataGenerator.generate();
        form.updateExportUrl();
        document.getElementById('export-training-data').click();
    });


    // Add tooltips to option headlines
    $('.training-tooltip').simpletooltip({
        position: 'right',
        border_color: 'white',
        color: '#1A1E24',
        background_color: 'white',
        border_width: 4
    });
});

const inputParser = {
    getTextValues() {
        let outputValues = [];
        let rawValues = $('#variable-text-value').val().split(',');

        // Tokenise and clean input values
        for (valueIndex in rawValues) {
            const value = rawValues[valueIndex].trim();
            if (value != '') {
                outputValues.push(value);
            }
        }
        return outputValues;
    },
    
    getNumericValues() {
        const low = parseInt($('#numerical-range-low').val());
        const high = parseInt($('#numerical-range-high').val());
        const step = parseInt($('#numerical-range-step').val());

        // Check that all numerical fields have been populated
        if (isNaN(low) || isNaN(high) || isNaN(step)) {
            alert('Numerical range fields cannot be empty.');
            return;
        }

        // Check that valid range has been entered
        if (low > high) {
            alert('Must enter a valid numerical range.');
            return;
        }

        // Generate range values
        let outputValues = [];
        for (let value = low; value <= high; value += step) {
            outputValues.push(value);
        }
        return outputValues;
    },
}

const inputValidator = {
    isValidVariable(variable) {
        // Check that field is not empty
        if (variable.name == '') {
            alert('Variable name cannot be empty.');
            return false;
        }

        // Check that name doesn't already exist
        if (form.existingVariables.includes(variable.name)) {
            alert('Variable name already exists!');
            return false;
        }
        
        // Validate input values
        if (variable.values.length == 0) {
            alert('Variable values cannot be empty.');
            return false;
        }
        return true;
    },

    isValidTemplate(input, target, template) {
        // Validate template input
        if (input == '' || target == '') {
            alert('Sentence template and target output required.');
            return false;
        }

        // Check that template hasn't already been added
        if (form.templates.includes(template)) {
            alert('Template already exists.');
            return false;
        }
        return true;
    },

    isValidGenerator() {
        if (form.templates.length == 0) {
            alert('Need at least one template.');
            return false;
        }

        if (form.quantity == 0) {
            alert('Need a generation quantity greater than zero.');
            return false;
        }
        return true;
    },
}

const form = {
    quantity: 0,
    templates: [],
    variables: [],
    existingVariables: [],

    clearVariableFields() {
        $('#variable-name').val('');
        $('#variable-text-value').val('');
        $('#numerical-range-low').val('');
        $('#numerical-range-high').val('');
        $('#numerical-range-step').val('');
    },
    
    clearTemplateFields() {
        $('#template-input').val('');
        $('#template-target').val('');
    },
    
    updateQuantityValue(value) {
        $('#quantity-range-value').text(value);
        this.quantity = value;
    },

    bindEvents() {
        // Enable deletion of added elements
        $('.added-element').click(function () {
            const text = $(this).text();
            const type = $(this).attr('type');
    
            // Remove from output list
            if (type == 'variable') {
                form.variables.splice(form.existingVariables.indexOf(text), 1);
                form.existingVariables.splice(form.existingVariables.indexOf(text), 1);
            } else {
                form.templates.splice(form.templates.indexOf(text), 1);
            }
            // Remove from display list
            $(this).remove();
        });
    },

    updateExportUrl() {
        let saveButton = document.getElementById('export-training-data');
        let blob = new Blob(dataGenerator.data, {type: 'text/plain'});
        window.URL.revokeObjectURL(saveButton.href);
        saveButton.href = URL.createObjectURL(blob);
        saveButton.download = 'training-data.txt';
    },

    constructElement(text, type) {
        return (
            '<span class="added-element" type="' + type + '">' +
                text +
            '</span>'
        );
    },
}

const dataGenerator = {
    data: new Set(),

    generate() {
        const quantity = form.quantity;
        const templates = form.templates;
        const variables = form.variables;
        const existingVariables = form.existingVariables;

        for (let i = 0; i < quantity; i++) {
            // Pick random sentence template
            const templateIndex = this.getRandomIndex(templates.length);
            const template = templates[templateIndex];
            const templateComponents = template.split('${');

            let dataInstance = '';
            let generatedValues = {};

            // Populate template with random variable values
            for (let j = 0; j < templateComponents.length; j++) {
                const component = templateComponents[j].split('}');
                
                for (let k = 0; k < component.length; k++) {

                    const token = component[k].toLowerCase().trim();
                    const tokenIndex = existingVariables.indexOf(token);
    
                    // Check whether the token is a variable
                    if (tokenIndex != -1) {
                        if (!(token in generatedValues)) {
                            const values = variables[tokenIndex].values;
                            const valueIndex = this.getRandomIndex(values.length);
                            generatedValues[token] = values[valueIndex];
                        }
                        // Ensure consistent values are used for each template
                        dataInstance += generatedValues[token];
                    } else {
                        dataInstance += component[k];
                    }
                }
            }
            dataInstance += '\n';
            this.data.add(dataInstance);
        }
    },

    getRandomIndex(max) {
        return Math.floor(Math.random() * max);
    },
}
