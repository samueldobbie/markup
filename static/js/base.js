const display = {
    html: document.getElementsByTagName('html')[0],

    initalize() {
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', 'light');
        }
        this.update(localStorage.getItem('theme'));
    },
    
    toggle() {
        if (localStorage.getItem('theme') == 'light') {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
        this.update(localStorage.getItem('theme'));
    },
    
    update(theme) {
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
        if (window.location.href.indexOf('annotate') == -1) {
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
    }
}

display.initalize();
request.setHeader();
session.new();
