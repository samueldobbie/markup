const display = {
    html: document.getElementsByTagName('html')[0],

    initalize() {
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', 'light');
        }
        this.update();
    },
    
    toggle() {
        if (localStorage.getItem('theme') == 'light') {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
        this.update();
    },
    
    update() {
        const theme = localStorage.getItem('theme');

        this.html.dataset.theme = theme;
        
        if (theme == 'light') {
            $('#theme-toggle').text('Dark Mode');
        } else {
            $('#theme-toggle').text('Light Mode');
        }
    }
}

const request = {
    setHeader() {
        const csrftoken = this.getCookie('csrftoken');
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                const isSafeMethod = (/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type));
                if (!isSafeMethod && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
    },

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    },
}

const session = {
    new() {
        if (this.isValidPage()) {
            this.clearLocalStorage();
            this.resetOntology();
        }
    },

    clearLocalStorage() {
        // Clear all non-theme storage items
        // Huw EDIT TO ADD COMPARE ANNOTATION PAGE similar to when going from setup to annotate
        if (window.location.href.indexOf('annotate') == -1 && window.location.href.indexOf('iaa') == -1) {
            const displayMode = localStorage.getItem('theme');
            localStorage.clear();
            if (displayMode) {
                localStorage.setItem('theme', displayMode);
            }
        }
    },

    resetOntology() {
        $.ajax({
            type: 'POST',
            url: '/annotate/reset-ontology/'
        });
    },

    isValidPage() {
        const components = window.location.pathname.split('/');
        for (let i = components.length - 1; i >= 0; i--) {
            if (components[i] != '') {
                if (components[i] == 'annotate') {
                    return false;
                }
                return true;
            } 
        }
        return true;
    },

    validateCookies(){
        let cookieEnabled = navigator.cookieEnabled;
        if (!cookieEnabled){ 
            document.cookie = 'markup-test-cookie';
            cookieEnabled = document.cookie.indexOf('markup-test-cookie') != -1;
        }
        return cookieEnabled || this.throwCookieError();
    },
    
    throwCookieError(){
        alert('Cookies must be enabled to use Markup.');
        window.location = '/';
    }
}

function getColors(n) {
    const colors = [
        '#7B68EE', '#FFD700', '#FFA500', '#DC143C',
        '#FFC0CB', '#00BFFF', '#FFA07A', '#C71585',
        '#32CD32', '#48D1CC', '#FF6347', '#8FE3B4',
        '#FF69B4', '#008B8B', '#FF0066', '#0088FF',
        '#44FF00', '#FF8080', '#E6DAAC', '#FFF0F5',
        '#FFFACD', '#E6E6FA', '#B22222', '#4169E1',
    ];

    // TODO generate N distinct colors randomly

    return colors;
}

$(document).ready(function () {
    display.initalize();
    request.setHeader();
    session.new();
});
