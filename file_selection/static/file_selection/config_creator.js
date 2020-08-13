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

    $('#add-entity').click(function () {
        /*
        Enable input and adding of entity
        which is displayed in output list
        */

        // Get input entity value
        var entity = document.getElementById('entity-name').value.trim();

        if (entity != '' && !entityList.includes(entity + '\n')) {
            // Hide empty message and display output lists
            $('#empty-container-message').hide();
            $('#output-list-container').show();

            // Add entity to output list
            entityList.push(entity + '\n');

            var backgroundColor = colors[entityList.indexOf(entity + '\n')];

            // Add entity to display list
            document.getElementById('entity-list').innerHTML += '<span class="added-element" style="background-color: ' + backgroundColor + ';">' + entity + '</span>';
            
            updateConfigurationFileURL();
            bindEvents();
        }
        
        // Reset input form
        document.getElementById('entity-name').value = '';
    });


    $('#add-attribute').click(function () {
        /*
        Enable input and adding of attribute
        which is displayed in output list
        */

        // Get input attribute values
        var attributeName = document.getElementById('attribute-name').value.trim();
        var attributeRelation = document.getElementById('attribute-relation').value.trim();
        var attributeDropdown = document.getElementById('attribute-dropdown').value.split(',');

        // Format attribute dropdown values
        var attributeDropdownValues = '';
        for (var i = 0; i < attributeDropdown.length; i++) {
            if (i != attributeDropdown.length-1) {
                attributeDropdownValues += attributeDropdown[i].trim() + "|";
            } else {
                attributeDropdownValues += attributeDropdown[i].trim();
            }
        }

        // Construct correctly formatted attribute string
        var attribute = attributeName + ' ' + 'Arg:' + attributeRelation + ', Value:' + attributeDropdownValues;
        attribute = attribute.trim();

        if (attribute != '') {
            // Ensure the related entity is valid and get its color
            var backgroundColor = '';
            var entityIndex = entityList.indexOf(attributeRelation + '\n');
            if (entityIndex == -1) {
                alert('You need to add the related entity as an entity before using it in an attribute.');
                return;
            } else {
                backgroundColor = colors[entityIndex];
            }

            // Hide empty message and display output lists
            $('#empty-container-message').hide();
            $('#output-list-container').show();

            // Add constructed attribute to output list
            attributeList.push(attribute + "\n");

            // Add attribute to display list
            document.getElementById('attribute-list').innerHTML += '<span class="added-element" style="background-color: ' + backgroundColor + ';">' + attribute + '</span>';
        
            updateConfigurationFileURL();
            bindEvents();
        }

        // Reset input forms
        document.getElementById('attribute-name').value = '';
        document.getElementById('attribute-relation').value = '';
        document.getElementById('attribute-dropdown').value = '';
    });


    function updateConfigurationFileURL() {
        var saveButton = document.getElementById('save-configuration-file');
        var fileName = 'annotation.conf';
        var contentType = 'text/plain';
        var blob = new Blob(entityList.concat(attributeList), {type: contentType});

        window.URL.revokeObjectURL(saveButton.href);
        saveButton.href = URL.createObjectURL(blob);
        saveButton.download = fileName;
    }


    function bindEvents() {
        $('.added-element').click(function () {
            // Get element text
            var elementText = $(this).text() + '\n';

            // Remove element from output list
            var listId = $(this).parent().attr('id');
            if (listId == 'entity-list') {
                for (var i = 0; i < entityList.length; i++) {
                    if (entityList[i] == elementText) {
                        entityList.splice(i, 1);
                        break;
                    }
                }
            } else if (listId == 'attribute-list') {
                for (var i = 0; i < attributeList.length; i++) {
                    if (attributeList[i] == elementText) {
                        attributeList.splice(i, 1);
                        break;
                    }
                }
            }
            // Delete element from display list
            $(this).remove();
        });
    }

    // Initialize display mode based on users' preference
    updateDisplayMode();

    // Add tooltips to option headlines
    $('.config-tooltip').simpletooltip({
        position: 'right',
        border_color: 'white',
        color: '#1A1E24',
        background_color: 'white',
        border_width: 4
    });

    // Initalize entity and attribute lists with default headers
    var entityList = ["[entities]\n"];
    var attributeList = ["[attributes]\n"];

    // Colors to be used for entities and attributes in output list
    var colors = [
        'A1A1A1', '#00BFFF', '#8FE3B4', '#FFC0CB', '#FFA07A', '#7B68EE', '#FFD700',
        '#C71585', '#32CD32', '#48D1CC', '#FF6347', '#FFA500', '#FF69B4', '#008B8B',
        '#FFF0F5', '#FFFACD', '#E6E6FA', '#B22222', '#4169E1', '#C0C0C0'
    ];
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