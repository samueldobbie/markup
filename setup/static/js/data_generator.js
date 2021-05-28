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

    $('#config-file-opener').change(function() {theme = localStorage.getItem("theme");//get current theme
        localStorage.clear();//Clear local storage of all data (including theme = dark/light)
        localStorage.setItem("theme", theme);// resets the theme
        storeSingleFile('config');//Save the config file
        $('#config-entity').show();//Show the Entities drop down
        $('#config-feature').hide();//Hide features (for when loading different conf file)
        $("#config-entity option").remove();//delete past entities from old conf file if there
        $('#config-entity').append('<option value = "" selected="selected" disabled="disabled"> Entities </option>'); //Add default value of 'Entities'
        $("#config-feature option").remove();//delete past features from old conf file if there
        $('#config-feature').append('<option value = "" selected="selected" disabled="disabled"> Features </option>');//Add default value of 'Features'
        $('#config-entity-2').show();//Show the second Entities drop down
        $('#config-feature-2').hide();//Hide second features (for when loading different conf file)
        $("#config-entity-2 option").remove();//delete past entities from old conf file if there
        $('#config-entity-2').append('<option value = "" selected="selected" disabled="disabled"> Entities </option>'); //Add default value of 'Entities'
        $("#config-feature-2 option").remove();//delete past features from old conf file if there
        $('#config-feature-2').append('<option value = "" selected="selected" disabled="disabled"> Features </option>');//Add default value of 'Features'

    });

    $('#config-entity').click(function() {
        if (document.getElementById("config-entity").value == "") {//If empty i.e first time opening
            $("#config-entity option").remove();// clear them when clicking
            const configs = parseConfigs();//get entities and attributes from config
            entities = configs[0];//get entitises 
            attributes = parseAttributeValues(configs[1]); //get attributes
            for (let i = 0; i < entities.length; i++) {//adding in the entities to the drop down
                value = entities[i]
                newEntity = "<option value = " + value + "> " + value + " </option>"
                $('#config-entity').append(newEntity);
                attributesSave = [];//Creating localStorage for entities with each of its features 
                for (let j = 0; j < attributes.length; j++) {
                    attributeEntity = attributes[j][1];
                    attribute = attributes[j][0];
                    if (attributeEntity == value) {
                        attributesSave.push(attribute);
                    };
                };
                localStorage.setItem(value, attributesSave);
            };
            $('#config-feature').show();//just show the features and remove any old values
            $("#config-feature option").remove();
            $('#config-feature').append('<option value = "" selected="selected" disabled="disabled"> Features </option>');//Add default value of 'Features'
        } else {
            $('#config-feature').show();//just show the features and remove any old values
            $("#config-feature option").remove();
            $('#config-feature').append('<option value = "" selected="selected" disabled="disabled"> Features </option>');//Add default value of 'Features'
        }
    });

    $('#config-feature').click(function() {
        if (document.getElementById("config-feature").value == "") {
            $("#config-feature option").remove();// remove any old values
            $('#config-feature').append('<option value = "" selected="selected" disabled="disabled"> Features </option>');//Add default value of 'Features'
            var entity = document.getElementById("config-entity").value;//get the entity
            attributes = localStorage.getItem(entity);
            for (let i = 0; i < attributes.split(",").length; i++) {//get attributes for the entity and add to the dropdown
                value = attributes.split(",")[i];
                newEntity = "<option value = " + value + "> " + value + " </option>";
                $('#config-feature').append(newEntity);
                };                
            $('#config-feature').show();
        } else {
            $('#config-feature').show();//just show the features and remove any old values if its already been populated
        }
    });


    $('#config-feature').change(function() {//when dropdown changes (select one of the options)
            var feature = document.getElementById("config-feature").value;// get the new value
            document.getElementById('variable-name').value = feature;// add the value to the variables name
        });


    $('#config-entity-2').click(function() {
        if (document.getElementById("config-entity-2").value == "") {//If empty i.e first time opening
            $("#config-entity-2 option").remove();// clear them when clicking
            const configs = parseConfigs();//get entities and attributes from config
            entities = configs[0];//get entitises 
            attributes = parseAttributeValues(configs[1]); //get attributes
            for (let i = 0; i < entities.length; i++) {//adding in the entities to the drop down
                value = entities[i]
                newEntity = "<option value = " + value + "> " + value + " </option>"
                $('#config-entity-2').append(newEntity);
                attributesSave = [];//Creating localStorage for entities with each of its features 
                for (let j = 0; j < attributes.length; j++) {
                    attributeEntity = attributes[j][1];
                    attribute = attributes[j][0];
                    if (attributeEntity == value) {
                        attributesSave.push(attribute);
                    };
                };
                localStorage.setItem(value, attributesSave);
            };
            $('#config-feature-2').show();//just show the features and remove any old values
            $("#config-feature-2 option").remove();
            $('#config-feature-2').append('<option value = "" selected="selected" disabled="disabled"> Features </option>');//Add default value of 'Features'
        } else {
            $('#config-feature-2').show();//just show the features and remove any old values
            $("#config-feature-2 option").remove();
            $('#config-feature-2').append('<option value = "" selected="selected" disabled="disabled"> Features </option>');//Add default value of 'Features'
        }
    });

    $('#config-feature-2').click(function() {
        if (document.getElementById("config-feature-2").value == "") {
            $("#config-feature-2 option").remove();// remove any old values
            $('#config-feature-2').append('<option value = "" selected="selected" disabled="disabled"> Features </option>');//Add default value of 'Features'
            var entity = document.getElementById("config-entity-2").value;//get the entity
            attributes = localStorage.getItem(entity);
            for (let i = 0; i < attributes.split(",").length; i++) {//get attributes for the entity and add to the dropdown
                value = attributes.split(",")[i];
                newEntity = "<option value = " + value + "> " + value + " </option>";
                $('#config-feature-2').append(newEntity);
                };                
            $('#config-feature-2').show();
            $('#add-to-input').show();
            $('#add-to-target').show();
        } else {
            $('#config-feature-2').show();//just show the features and remove any old values if its already been populated
            $('#add-to-input').show();
            $('#add-to-target').show();
        }
    });

    $('#add-to-input').click(function() {
        value = document.getElementById('template-input').value;
        feature = document.getElementById('config-feature-2').value;
        document.getElementById('template-input').value = value + "${" + feature + "}";
    });

    $('#add-to-target').click(function() {
        value = document.getElementById('template-target').value;
        feature = document.getElementById('config-feature-2').value;
        document.getElementById('template-target').value = value + feature + " :${" + feature + "};";
    });


    //To-do Create button that will add the feature to the template inputs

    // function autoFill() {
    //     document.getElementById('input1').value = "My Text Input"; This but get what the value was 
    //                         then add the new string and replace the value as this oldValue + string
    //                         with needs for the funny String:${string}; stuff also as another button (should work...)

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
                var uniquelength = $('#umls-display-table tr').length;
                var alllength = $('#umls-display-table-all tr').length;
                let Unique_results = [];
                result = JSON.parse(response);

                 if (result.length == 0) {
                    UMLS.displayNoResults();
                }
                else {
                    if (displayMethod == 'Unique') {
                        if (uniquelength > 0) {
                            $("#umls-display-table").find("tr:gt(0)").remove();
                        } 
                        for (let i = 0; i < result.length; i++) {
                            let string = result[i][3];
                            if (dupeCheck.includes(string.toLowerCase()) == false) {
                            dupeCheck.push(string.toLowerCase());
                            Unique_results.push(result[i]);
                            }
                        }
                        if (Unique_results.length < 21) {
                            $('#no-results').css('display', 'none');
                            $('#table-unique').css('display', 'block');
                            $('#next-20-unique').css('display', 'none');
                            $('#previous-20-unique-1st').css('display', 'none');
                            $('#previous-20-unique').css('display', 'none');
                            UMLS.displayUMLS(Unique_results);
                        }
                        else {
                            n = 0;
                            $('#no-results').css('display', 'none');
                            $('#table-unique').css('display', 'block');
                            $('#next-20-unique').css('display', 'none');
                            $('#previous-20-unique-1st').css('display', 'none');
                            $('#previous-20-unique').css('display', 'none');
                            UMLS.displayUMLS20(Unique_results);
                        }
                    //var Unique_results2 = Unique_results;
                    }
                    else {
                        if (alllength > 0) {
                            $("#umls-display-table-all").find("tr:gt(0)").remove();
                        }
                        if (result.length < 21) {
                            $('#no-results').css('display', 'none');
                            $('#table-all').css('display', 'block');
                            $('#previous-20-all-1st').css('display', 'none');
                            $('#previous-20-all').css('display', 'none');
                            $('#next-20-all').css('display', 'none');
                            UMLS.displayALLUMLS(result);
                        }
                        else {
                            n = 0;
                            $('#no-results').css('display', 'none');
                            $('#table-all').css('display', 'block');
                            $('#next-20-all').css('display', 'none');
                            $('#previous-20-all-1st').css('display', 'none');
                            $('#previous-20-all').css('display', 'none');
                            UMLS.displayALLUMLS20(result);
                        }
                    //var result2 = result;
                    }
                }
            }
            
        });

        //nn = 0;    
        //UMLS.next20Unique(Unique_results2);

        //nnn = 0;
        //UMLS.next20All(result);

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



        
    $('#next-20-unique-1st').click(function () {
        nnn = 20;
        $('#previous-20-unique').css('display', '')
        $("#umls-display-table").find("tr:gt(0)").remove();
        if (Unique_results2.length > 21 + nnn) {
            for (let i = 0 + nnn; i < 19 + nnn; i++) {
                let target = '#umls-display-table tbody';
                let string = Unique_results2[i][3];
                let cui = Unique_results2[i][0];
                let rowID = "row" + i
                let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
                $(target).append(newRow);
                $('#next-20-unique').css('display', '');
            }
        } 
        else {
            for (let i = 0 + nnn; i < Unique_results2.length; i++) {
                let target = '#umls-display-table tbody';
                let string = Unique_results2[i][3];
                let cui = Unique_results2[i][0];
                let rowID = "row" + i
                let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
                $(target).append(newRow);
            }
        }
        $('#next-20-unique-1st').css('display', 'none');
    });


    $('#next-20-unique').click(function () {
        nnn = nnn + 20;
            $("#umls-display-table").find("tr:gt(0)").remove();
            if (Unique_results2.length > 21 + nnn) {
                for (let i = 0 + nnn; i < 19 + nnn; i++) {
                    let target = '#umls-display-table tbody';
                    let string = Unique_results2[i][3];
                    let cui = Unique_results2[i][0];
                    let rowID = "row" + i
                    let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
                    $(target).append(newRow);
                }
            } 
            else {
                for (let i = 0 + nnn; i < Unique_results2.length; i++) {
                    let target = '#umls-display-table tbody';
                    let string = Unique_results2[i][3];
                    let cui = Unique_results2[i][0];
                    let rowID = "row" + i
                    let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
                    $(target).append(newRow);
                    $('#next-20-unique').css('display', 'block');
                }
            }
    });


    $('#previous-20-unique').click(function() {
        if (nnn < 21) {
            nnn = nnn - 20;
            if (nnn == 0) {
                $("#umls-display-table").find("tr:gt(0)").remove();
                for (let i = 0; i < 19; i++) {
                    let target = '#umls-display-table tbody';
                    let string = Unique_results2[i][3];
                    let cui = Unique_results2[i][0];
                    let rowID = "row" + i
                    let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
                    $(target).append(newRow); 
                }
                $('#next-20-unique').css('display', 'none');
                $('#next-20-unique-1st').css('display', '');
                $('#previous-20-unique').css('display','none');
            }
            else {
                $("#umls-display-table").find("tr:gt(0)").remove();
                for (let i = 0; i < 19; i++) {
                    let target = '#umls-display-table tbody';
                    let string = Unique_results2[i][3];
                    let cui = Unique_results2[i][0];
                    let rowID = "row" + i
                    let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
                    $(target).append(newRow); 
                }
                $('#next-20-unique').css('display', 'none');
                $('#next-20-unique-1st').css('display', 'none');
                $('#previous-20-unique').css('display','none');
            }
        }
        else {
            nnn = nnn - 20;
            $("#umls-display-table").find("tr:gt(0)").remove();
            for (let i = 0 + nnn; i < 19 + nnn; i++) {
                let target = '#umls-display-table tbody';
                let string = Unique_results2[i][3];
                let cui = Unique_results2[i][0];
                let rowID = "row" + i
                let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
                $(target).append(newRow);
            }
            $('#next-20-unique').css('display', '');
        }
    });

    $('#next-20-all-1st').click(function () {
        n = 20;
        $('#previous-20-all').css('display', '')
        $("#umls-display-table-all").find("tr:gt(0)").remove();
        if (result2.length > 21 + n) {
            for (let i = 0 + n; i < 19 + n; i++) {
                let target = '#umls-display-table-all tbody';
                let string = result2[i][3];
                let cui = result2[i][0];
                let sab = result2[i][1];
                let code = result2[i][2];
                let rowID = "row" + i
                let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td><td>" + sab + "</td><td>" + code + "</td></tr>";
                $(target).append(newRow);
                $('#next-20-all').css('display', '');
            }
        } 
        else {
            for (let i = 0 + n; i < result2.length; i++) {
                let target = '#umls-display-table-all tbody';
                let string = result2[i][3];
                let cui = result2[i][0];
                let sab = result2[i][1];
                let code = result2[i][2];
                let rowID = "row" + i
                let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td><td>" + sab + "</td><td>" + code + "</td></tr>";
                $(target).append(newRow);
            }
        }
        $('#next-20-all-1st').css('display', 'none');
    });


        
    $('#next-20-all').click(function () {
        n = n + 20;
        $('#previous-20-all').css('display', '')
            $("#umls-display-table-all").find("tr:gt(0)").remove();
            if (result2.length > 21 + n) {
                for (let i = 0 + n; i < 19 + n; i++) {
                    let target = '#umls-display-table-all tbody';
                    let string = result2[i][3];
                    let cui = result2[i][0];
                    let sab = result2[i][1];
                    let code = result2[i][2];
                    let rowID = "row" + i
                    let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td><td>" + sab + "</td><td>" + code + "</td></tr>";
                    $(target).append(newRow);
                }
            } 
            else {
                for (let i = 0 + n; i < result2.length; i++) {
                    let target = '#umls-display-table-all tbody';
                    let string = result2[i][3];
                    let cui = result2[i][0];
                    let sab = result2[i][1];
                    let code = result2[i][2];
                    let rowID = "row" + i
                    let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td><td>" + sab + "</td><td>" + code + "</td></tr>";
                    $(target).append(newRow);
                    $('#next-20-all').css('display', 'none');
                }
            }
    });
    


    $('#previous-20-all').click(function() {
        if (n < 21) {
            n = n - 20;
            if (n == 0){
                $("#umls-display-table-all").find("tr:gt(0)").remove();
                for (let i = 0; i < 19; i++) {
                    let target = '#umls-display-table-all tbody';
                    let string = result2[i][3];
                    let cui = result2[i][0];
                    let sab = result2[i][1];
                    let code = result2[i][2];
                    let rowID = "row" + i
                    let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td><td>" + sab + "</td><td>" + code + "</td></tr>";
                    $(target).append(newRow); 
                    }
                $('#next-20-all').css('display', 'none');
                $('#next-20-all-1st').css('display', '');
                $('#previous-20-all').css('display','none'); 
                } 
            else {
                $("#umls-display-table-all").find("tr:gt(0)").remove();
                for (let i = 0; i < 19; i++) {
                    let target = '#umls-display-table-all tbody';
                    let string = result2[i][3];
                    let cui = result2[i][0];
                    let sab = result2[i][1];
                    let code = result2[i][2];
                    let rowID = "row" + i
                    let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td><td>" + sab + "</td><td>" + code + "</td></tr>";
                    $(target).append(newRow); 
                    }
                $('#next-20-all').css('display', '');
                $('#next-20-all-1st').css('display', 'none');
                $('#previous-20-all').css('display','');
            }
            
        }
        else {
            n = n - 20;
            $("#umls-display-table-all").find("tr:gt(0)").remove();
            for (let i = 0 + n; i < 19 + n; i++) {
                let target = '#umls-display-table-all tbody';
                let string = result2[i][3];
                let cui = result2[i][0];
                let sab = result2[i][1];
                let code = result2[i][2];
                let rowID = "row" + i
                let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td><td>" + sab + "</td><td>" + code + "</td></tr>";
                $(target).append(newRow);
            }
            $('#next-20-all').css('display', '');
        }
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

function parseConfigs() {
    const configText = localStorage.getItem('configText');
    const configSents = configText.split('\n');

    let entities = [];
    let isEntity = false;
    let attributeSentences = [];

    for (let i = 0; i < configSents.length; i++) {
        const sent = configSents[i];
        const sentSize = sent.length;

        if (sent == '') continue;

        // Add to relevant config list
        if (isEntity && sent[0] != '[' && !entities.includes(sent)) {
            entities.push(sent);
        } else if (sent[0] != '[') {
            attributeSentences.push(sent);
        }

        // Check for category (e.g. [entities])
        if (sentSize >= 3 && sent[0] == '[' && sent[sentSize - 1] == ']') {
            // Check for entity category
            if (sent.slice(1, sentSize - 1).toLowerCase() == 'entities') {
                isEntity = true;
            } else if (isEntity) {
                isEntity = false;
            }
        }
    }
    return [entities, attributeSentences];
}

function parseAttributeValues(attributeSentences) {
    const attributes = [];
    const globalAttributes = [];

    for (let i = 0; i < attributeSentences.length; i++) {
        // Parse data within attribute sentence
        const sent = attributeSentences[i];
        const name = sent.split('Arg:')[0].trim();
        const entity = sent.split('Arg:')[1].split(',')[0].trim();
        const values = sent.split('Value:')[1].trim().split('|');

        // Produce array of global attributes
        if (entity.toLowerCase() == '<entity>' ) {
            globalAttributes.push([name, values]);
            continue;
        }
        // Add new attribute
        attributes.push([name, entity]);//.concat(values));

        // TODO re-introduce checkbox attribute parsing
    }
    // Add global attributes
    return attributes.concat(parseGlobalAttributes(globalAttributes));
}

function parseGlobalAttributes(globalAttributes) {
    // Add global attributes to each entity
    const result = [];

    for (let i = 0; i < entities.length; i++) {
        for (let j = 0; j < globalAttributes.length; j++) {
            const name = globalAttributes[j][0];
            const entity = entities[i];
            const values = globalAttributes[j][1];
            result.push([name, entity]);//.concat(values));
        }
    }
    return result;
}

function storeSingleFile(type) {
    const file = $('#' + type + '-file-opener')[0].files[0];
    const docName = getDocName(file);

    if (type == 'config') {
        storeFile(file, 'configText');
        const configText = storeFile(file, 'configText');
        return configText;
    }

    $('#' + 'config-file-opener').text(docName);
    updateCompleteComponent('config-file-opener');
    return configText;
}

function getDocName(file) {
    return file.name.split('.').slice(0, -1).join('.');
}

function detectLineBreakType(text) {
    if (text.indexOf('\r\n') !== -1) {
        return 'windows';
    } else if (text.indexOf('\r') !== -1) {
        return 'mac';
    } else if (text.indexOf('\n') !== -1) {
        return 'linux';
    }
    return 'unknown';
}

function updateCompleteComponent(id) {
    $('#' + id).css('border', '1px solid #33FFB5');
    $('#' + id).attr('complete', 'true');
}


function convertLineBreakType(text, convertFrom, convertTo) {
    if (convertFrom == 'windows' && convertTo == 'linux') {
        return text.replace(/\r\n/g, '\n');
    }
    return text;
}


function storeFile(file, fileStorageName, lineBreakStorageName=null) {
    let reader = new FileReader();

    reader.onload = function () {
        let fileText = reader.result;//Here is where File Text First Created stop1

        // Convert from CRLF to LF
        if (fileStorageName == 'configText' && detectLineBreakType(fileText) == 'windows') { //stop2
            fileText = convertLineBreakType(fileText, 'windows', 'linux');
        }

        // Store data locally
        if (lineBreakStorageName) {
            localStorage.setItem(lineBreakStorageName, detectLineBreakType(fileText));
        }
        localStorage.setItem(fileStorageName, fileText);
        return fileText;
    };

    reader.readAsText(file);
    const fileText = reader.result;
    return fileText;
}

// function getFileData() {
//     fileText2 = "";
//     fileText = "";
//     const file = $('#' + 'config' + '-file-opener')[0].files[0];
//     let reader = new FileReader();
//     reader.onload = function () {
//         const fileText = reader.result;//Here is where File Text First Created stop1

//         // Convert from CRLF to LF
//         if (detectLineBreakType(fileText) == 'windows') { //stop2
//             const fileText = convertLineBreakType(fileText, 'windows', 'linux');
//         }
//         fileText.replace(fileText);
//         return fileText;
//     };
//     reader.readAsText(file);
//     return fileText;
// }

//From local storage get the conf file - get entities and attributes for each entity - add to config-entity and config-feature

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
        Unique_results2 = umls_table
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
        Unique_results2 = umls_table;
        nnn = 20;
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
        result2 = umls_table
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
        result2 = umls_table;
        nn = 20;
    },

    

    // next20Unique(umls_table) {
    //     $('#next-20-unique').click(function () {
    //         let nn = nn + 20;
    //         $("#umls-display-table").find("tr:gt(0)").remove();
    //         for (let i = 0 + nn; i < 19 + nn; i++) {
    //             let target = '#umls-display-table tbody';
    //             let string = umls_table[i][3];
    //             let cui = umls_table[i][0];
    //             let rowID = "row" + i
    //             let newRow = "<tr  id =" + rowID + "><td>" + string + "</td><td>" + cui + "</td></tr>";
    //             $(target).append(newRow);
    //             }
    //         table = umls_table
    //     });
    // },


    //next20All(result);
}

// End session if cookies are disabled
session.validateCookies();
