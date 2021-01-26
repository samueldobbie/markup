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

    $('#Method').change(function () {
        // Show fields based on dropdown selection
        if ($(this).val() == 'String') {
            $('#variable-string-name').show();
            $('#variable-CUI-value').hide();
            $('#variable-code-value').hide();
        } else if ($(this).val() == 'CUI'){
            $('#variable-string-name').hide();
            $('#variable-CUI-value').show();
            $('#variable-code-value').hide();
        } else {
            $('#variable-string-name').hide();
            $('#variable-CUI-value').hide();
            $('#variable-code-value').show();
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


    $('#submit-query').click(function () {
        let variable = {
            'Method': $('#Method').val(),
            'Relationship': $('#relationship').val(),
            'InputString': $('#variable-string-name').val(),
            'InputCUI': $('#variable-CUI-value').val(),
            'InputCode': $('#variable-code-value').val(),
        };

        // Parse input values
        if (variable.Method == 'CUI') {
            variable.values = inputParser.getCUI();
        } else if (variable.Method == 'CODE') {
            variable.values = inputParser.getCode();
        } else {
            variable.values = inputParser.getString();
        } 

        // Validate input
        if (variable.Method == 'CUI') {
            if (!inputValidator.isValidCUI(variable)) return;
        } else if (variable.Method == 'CODE') {
            if (!inputValidator.isValidCode(variable)) return;
        } else {
            if (!inputValidator.isValidString(variable)) return;
        } 

        if (variable.Method == 'CUI') {
            variable.input = variable.InputCUI
        } else if (variable.Method == 'CODE') {
            variable.input = variable.InputCode
        } else {
            variable.input = variable.InputString
        }

        // Display variable TODO - Remove/Clear this when added as variable?
        // $('#query-list').append(
        //     form.constructElement(variable.Method +' : ' + variable.input + ', ' + 'Relationship' + ' : ' + variable.Relationship, 'variable')
        // );

        // Add variable to existing and output lists
        form.existingVariables.push(variable.input);
        form.variables.push(variable);
        

        // TODO - Not sure if should push input or all 3 inputs seperatly (first one will need change to python functions)
        // Make into function????
        $.ajax({
            type: 'POST',
            url: 'search-umls/',
            data: {
                'Method': variable.Method,
                'Relationship': variable.Relationship,
                'input': variable.input,
            }, success: function(response) {
                let result = [];
                let dupeCheck = [];
                let displayMethod = $('#displayMethod').val();
                let Unique_results = [];
                result = JSON.parse(response);
                if (result.length == 0) {
                    UMLS.displayNoResults();
                }
                else {
                    if (displayMethod == 'Unique') {
                            for (let i = 0; i < result.length; i++) {
                                let string = result[i][3];
                                if (dupeCheck.includes(string.toLowerCase()) == false) {
                                dupeCheck.push(string.toLowerCase());
                                Unique_results.push(result[i]);
                                }
                            }
                        if (Unique_results.length < 20) {
                            $('#no-results').css('display', 'none');
                            $('#table-unique').css('display', 'block');
                            UMLS.displayUMLS(Unique_results);
                        }
                        else {
                            n = 0;
                            $('#no-results').css('display', 'none');
                            $('#table-unique').css('display', 'block');
                            UMLS.displayUMLS20(Unique_results);
                        }
                    }
                    else {
                        if (result.length < 20) {
                            $('#no-results').css('display', 'none');
                            $('#table-all').css('display', 'block');
                            UMLS.displayALLUMLS(result);
                        }
                        else {
                            n = 0;
                            $('#no-results').css('display', 'none');
                            $('#table-all').css('display', 'block');
                            UMLS.displayALLUMLS20(result);
                        }
                    }
                }
            }
            
        });
            
        

        // Clear input fields and enable deletion
        UMLS.clearUMLSFields();
        UMLS.bindUMLSEvents();
        UMLS.clearUMLSUniqueTable()
        UMLS.clearUMLSAllTable()
    }); 


    $('#add-to-variables-unique').click(function () {
        let variable = {
            'name': $('#variable-name-unique').val().toLowerCase().trim(),
            'type': 'UMLS',
        }; 

        if (variable.type == 'UMLS') {
            variable.values = inputParser.getTablesValue(table);
        } else {
            variable.values = inputParser.getNumericValues();
        }

        // Validate input
        if (!inputValidator.isValidVariable(variable)) return;

        // if isValidVariableTable (i.e has same name) append to value

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
        UMLS.clearUMLSUniqueTable();
        
    });

    $('#add-to-variables-all').click(function () {
        let variable = {
            'name': $('#variable-name-all').val().toLowerCase().trim(),
            'type': 'UMLS',
        }; 

        if (variable.type == 'UMLS') {
            variable.values = inputParser.getTablesValue(table);
        } else {
            variable.values = inputParser.getNumericValues();
        }

        // Validate input
        if (!inputValidator.isValidVariable(variable)) return;

        // if isValidVariableTable (i.e has same name) append to value

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
        UMLS.clearUMLSAllTable();
        
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

    getCUI() {
        let outputValues = [];
        let rawValues = $('#variable-CUI-value').val();

        // Check if valid CUI
        for (valueIndex in rawValues) {
            const value = rawValues[valueIndex].trim();
            if (value != '') {
                outputValues.push(value);
            }
        }
        return outputValues;
    },

    getCode() {
        let outputValues = [];
        let rawValues = $('#variable-code-value').val();

        // Check if valid code
        for (valueIndex in rawValues) {
            const value = rawValues[valueIndex].trim();
            if (value != '') {
                outputValues.push(value);
            }
        }
        return outputValues;
    },

    getString() {
        let outputValues = [];
        let rawValues = $('#variable-string-name').val();

        // check if valid String (make lower case?)
        for (valueIndex in rawValues) {
            const value = rawValues[valueIndex].trim();
            if (value != '') {
                outputValues.push(value);
            }
        }
        return outputValues;
    },

    getTablesValue(table) {
        let set = new Set();
        let outputValues = [];
        let i = 0;
        // check if valid String (make lower case?)
        for (i; i < table.length; i++) {
            let string = table[i][3].toLowerCase()
                set.add(string);
        }
        outputValues = Array.from(set);
        return outputValues;
    },

    // getTablesValue() {
    //     let outputValues = [];
    //     let rawValues = $('#variable-text-value').val().split(',');

    //     // Tokenise and clean input values
    //     for (valueIndex in rawValues) {
    //         const value = rawValues[valueIndex].trim();
    //         if (value != '') {
    //             outputValues.push(value);
    //         }
    //     }
    //     return outputValues;
    // },
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

    isValidCUI(variable) {
        // Check that field is not empty
        if (variable.InputCUI == '') {
            alert('CUIs cannot be blank.');
            return false;
        } 
        else {
            if (variable.InputCUI.split("")[0] != 'C') {
                alert('CUIs must start with a capital C.');
                return false;
            }
        }
        return true;
    },

    isValidCode(variable) {
        // Check that field is not empty
        if (variable.InputCode == '') {
            alert('Codes cannot be blank.');
            return false;
        } 
        return true;
    },

    isValidString(variable) {
        // Check that field is not empty
        if (variable.InputString == '') {
            alert('Strings cannot be empty.');
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

const UMLS = {
    variables: [],

    clearUMLSFields() {
        $('#variable-string-name').val('');
        $('#variable-CUI-value').val('');
        $('#variable-code-value').val('');
    },

    bindUMLSEvents() {
        // Enable deletion of added elements
        $('.added-element').click(function () {
            const text = $(this).text();
            const type = $(this).attr('type');
    
            // Remove from output list
            if (type == 'variable') {
                UMLS.variables.splice(form.existingVariables.indexOf(text), 1);
                $("#umls-display-table").find("tr:gt(0)").remove();
                $('#umls-display-table').css('display', 'none');
                //Also want to remove from table
            } else {
                UMLS.templates.splice(form.templates.indexOf(text), 1);
            }
            // Remove from display list
            $(this).remove();
        });
    },

    clearUMLSUniqueTable() {
        // Enable deletion of added elements
        $('#clear-table-unique').click(function () {
            $("#umls-display-table").find("tr:gt(0)").remove();
            $('#table-unique').css('display', 'none');
        });
    },

    clearUMLSAllTable() {
        // Enable deletion of added elements
        $('#clear-table-all').click(function () {
            $("#umls-display-table-all").find("tr:gt(0)").remove();
            $('#table-all').css('display', 'none');
        });
    },

    displayNoResults() {
        // display 
        $('#no-results').css('display', 'block');
    },

    displayUMLS(umls_table) {
        for (let i = 0; i < umls_table.length; i++) {
            let target = '#umls-display-table tbody';
            let string = umls_table[i][3];
            let cui = umls_table[i][0];
            let rowID = "row" + i
            let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
            $(target).append(newRow);
        }
        table = umls_table
    },

    displayUMLS20(umls_table) {
        for (let i = 0 + n; i < 19 + n; i++) {
            let target = '#umls-display-table tbody';
            let string = umls_table[i][3];
            let cui = umls_table[i][0];
            let rowID = "row" + i
            let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
            $(target).append(newRow);
        }
        table = umls_table
    },

    displayALLUMLS(umls_table) {
        for (let i = 0; i < umls_table.length; i++) {
            let target = '#umls-display-table-all tbody';
            let string = umls_table[i][3];
            let cui = umls_table[i][0];
            let sab = umls_table[i][1];
            let code = umls_table[i][2];
            let rowID = "row" + i
            let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td><td>" + sab + "</td><td>" + code + "</td></tr>";
            $(target).append(newRow);
        }
        table = umls_table
    },

    displayALLUMLS20(umls_table) {
        for (let i = 0 + n; i < 19 + n; i++) {
            let target = '#umls-display-table-all tbody';
            let string = umls_table[i][3];
            let cui = umls_table[i][0];
            let sab = umls_table[i][1];
            let code = umls_table[i][2];
            let rowID = "row" + i
            let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td><td>" + sab + "</td><td>" + code + "</td></tr>";
            $(target).append(newRow);
        }
        table = umls_table
    },
}

// End session if cookies are disabled
session.validateCookies();
