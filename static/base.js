function clearLocalStorage() {
    /*
    Clear local storage (excl. display preference) to prevent
    outdated information from being displayed upon revisiting
    */
    if (window.location.href.indexOf('annotate') == -1) {
        // Clear storage (excl. display preference)
        var displayMode = localStorage.getItem('mode');
        localStorage.clear();
        if (displayMode) {
            localStorage.setItem('mode', displayMode);
        }
    
        resetOntologyToDefault();
    }
}


function resetOntologyToDefault() {
    /*
    Set selected ontology to null
    */
    $.ajax({
        type: 'POST',
        url: '/reset-ontology'
    });
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

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

setRequestHeader(getCookie('csrftoken'));

clearLocalStorage();