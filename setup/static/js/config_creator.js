$(document).ready(function () {
    $('#add-entity').click(addEntity);

    $('#add-attribute').click(addAttribute);

    // Add tooltips to option headlines
    $('.config-tooltip').simpletooltip({
        position: 'right',
        border_color: 'white',
        color: '#1A1E24',
        background_color: 'white',
        border_width: 4
    });
});

function addEntity() {
    const entity = $('#entity-name').val().trim();

    if (isValidEntity(entity)) {
        // Hide empty message and display output list
        $('#empty-container-message').hide();
        $('#output-list-container').show();

        // Add entity to output list
        entityList.push(entity + '\n');

        // Add entity to display list
        $('<span/>', {
            'class': 'item',
            'name': 'entity',
            'text': entity,
            'css': {
                'background-color': colors.pop()
            }
        }).appendTo('#entity-list');
        // TODO add to drop down
        addToEntityDropDown();
        updateExportUrl();
        bindEvents();
    }

    resetInputForms('entity');
}

function addAttribute() {
    const name = $('#attribute-name').val().trim();
    const relation = $('#attribute-relation').val().trim();
    const dropdown = $('#attribute-dropdown').val().split(',');

    // Construct formatted attribute string
    const attribute = getAttributeString(name, relation, dropdown);

    if (attribute) {
        // Validate related entities
        if (entityList.indexOf(relation + '\n') == -1) {
            alert('You need to add the related entity before using it in an attribute.');
            return;
        }

        // Hide empty message and display output lists
        $('#empty-container-message').hide();
        $('#output-list-container').show();

        // Add constructed attribute to output list
        attributeList.push(attribute + '\n');

        // Add attribute to display list
        $('<span/>', {
            'class': 'item',
            'attribute-for': relation,
            'text': attribute,
            'css': {
                'background-color': getEntityColor(relation)
            }
        }).appendTo('#attribute-list');

        updateExportUrl();
        bindEvents();
    }

    resetInputForms('attribute');
}

function addToEntityDropDown() {
    let entityToAdd = document.getElementById('entity-name').value;
    newEntity = "<option value = " + entityToAdd + " id = dropdown-" + entityToAdd +"> " + entityToAdd + " </option>";
    $('#attribute-relation').append(newEntity);
}

function updateExportUrl() {
    let saveButton = document.getElementById('save-configuration-file');
    let blob = new Blob(entityList.concat(attributeList), {type: 'text/plain'});
    window.URL.revokeObjectURL(saveButton.href);
    saveButton.href = URL.createObjectURL(blob);
    saveButton.download = 'annotation.conf';
}

function bindEvents() {
    // Enable element deletion
    $('.item').click(function () {
        const element = $(this);
        const elementText = element.text() + '\n';
        const listType = element.parent().attr('id');

        // Remove element from output list
        if (listType == 'entity-list') {
            removeEntity(element, elementText);
        } else {
            removeAttribute(elementText);
        }

        // Remove from display and update output
        removeDisplayedElement(element);
        updateExportUrl();
    });
}

function resetInputForms(type) {
    if (type == 'entity') {
        $('#entity-name').val('');
    } else {
        $('#attribute-name').val('');
        $('#attribute-relation').val('');
        $('#attribute-dropdown').val('');
    }
}

function getAttributeString(name, relation, dropdown) {
    let attribute = name + ' ' + 'Arg:' + relation + ', Value:';
    for (let i = 0; i < dropdown.length; i++) {
        if (i != dropdown.length - 1) {
            attribute += dropdown[i].trim() + "|";
        } else {
            attribute += dropdown[i].trim();
        }
    }
    return attribute;
}

function isValidEntity(entity) {
    return entity != '' && !entityList.includes(entity + '\n');
}

function removeEntity(element, elementText) {
    // Make entity color available again
    colors.push(element.css('background-color'));

    // Remove from entity list
    for (let i = 0; i < entityList.length; i++) {
        if (entityList[i] == elementText) {
            entityList.splice(i, 1);
            break;
        }
    }
    // remove entity from drop down
    removeFromDropDown(elementText);
    // Remove attributes that relate to selected entity
    removeRelatedAttributes(elementText);

    // Remove related attributes from display
    $('span[attribute-for=' + elementText + ']').each(function () {
        $(this).remove();
    });
}

function removeFromDropDown(elementText) {
    let elementText2 = elementText.split('\n')[0];
    let elementToRemove = '#attribute-relation option[value='+ elementText2 +']';
    // Removing the placeholder then re-adding refreshes it as the default value after deleting
    // Before, if selected a option then deleted - it became a blank box
    $('#attribute-relation option[value="placeholder"]').remove();
    $(elementToRemove).remove();
    $('#attribute-relation').append('<option disabled hidden selected value="placeholder">Related entity (e.g. Seizure)</option>');
}

function removeAttribute(elementText) {
    for (let i = 0; i < attributeList.length; i++) {
        if (attributeList[i] == elementText) {
            attributeList.splice(i, 1);
            break;
        }
    }
}

function removeRelatedAttributes(elementText) {
    let index = attributeList.length - 1;
    while (index > 0) {
        const attributeComponent = attributeList[index].split('Arg:')[1];
        const relatedEntity = attributeComponent.split(', Value:')[0] + '\n';
        if (relatedEntity == elementText) {
            attributeList.splice(index, 1);
        }
        index--;
    }
}

function removeDisplayedElement(element) {
    // Remove from display
    element.remove();

    // Show message if list is empty
    if (entityList.length == 1 && attributeList.length == 1) {
        $('#empty-container-message').show();
        $('#output-list-container').hide();
    }
}

function getEntityColor(name) {
    let color;
    $('span[name="entity"]').each(function () {
        if ($(this).text() == name) {
            color = $(this).css('background-color');
        }
    });
    return color;
}

// Initalize entity and attribute lists with default headers
let entityList = ['[entities]\n'];
let attributeList = ['[attributes]\n'];

// Colors to be used for entities and attributes in output list
let colors = getColors(100);

// End session if cookies are disabled
session.validateCookies();
