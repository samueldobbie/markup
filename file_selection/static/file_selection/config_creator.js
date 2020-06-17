// Remove data from local storage to avoid being able to revisit page and see outdated information
var existingDisplayMode = localStorage.getItem('mode');
localStorage.clear();
if (existingDisplayMode != null) {
    localStorage.setItem('mode', existingDisplayMode);
}

$(document).ready(function () {

    var entityList = ["[entities]\n"];
    var attributeList = ["[attributes]\n"];

    // Allows users to switch between light and dark mode
    $('#darkMode').click(function () {
        if (localStorage.getItem('mode') == 'light') {
            updateDisplayMode('dark');
        } else {
            updateDisplayMode('light');
        }
    });


    function updateDisplayMode(mode) {
        if (mode == 'dark') {
            localStorage.setItem('mode', 'dark');
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#333';
            document.getElementsByTagName('body')[0].style.color = '#fff';
            for (var i = 0; i < $('.input-form').length; i++) {
                $('.input-form')[i].style.color = 'white';
            }
        } else {
            localStorage.setItem('mode', 'light');
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#fff';
            document.getElementsByTagName('body')[0].style.color = 'black';
            for (var i = 0; i < $('.input-form').length; i++) {
                $('.input-form')[i].style.color = 'black';
            }
        }
    }


    $('#add-entity').click(function () {
        // Get entity value
        var entity = document.getElementById('entity-name').value;

        // Reset input form
        document.getElementById('entity-name').value = '';

        if (entity.trim() != '') {
            // Add entity to output list
            entityList.push(entity + "\n");

            // Add entity to display list
            document.getElementById('entity-list').innerHTML += '<span class="added-element">' + entity + '</span>';
        }
        updateConfigurationFileURL();
        bindEvents();
    });


    $('#add-attribute').click(function () {
        // Get attribute values
        var attributeName = document.getElementById('attribute-name').value;
        var attributeRelation = document.getElementById('attribute-relation').value;
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

        // Reset input forms
        document.getElementById('attribute-name').value = '';
        document.getElementById('attribute-relation').value = '';
        document.getElementById('attribute-dropdown').value = '';

        if (attribute.trim() != '') {
            // Add constructed attribute to output list
            attributeList.push(attribute + "\n");

            // Add attribute to display list
            document.getElementById('attribute-list').innerHTML += '<span class="added-element">' + attribute + '</span>';
        }
        updateConfigurationFileURL();
        bindEvents();
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
});