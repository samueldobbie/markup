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
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    return decodeURIComponent(cookie.substring(name.length + 1));
                }
            }
        }
    },
}

const session = {
    new() {
        this.clearLocalStorage();
        this.resetOntology();
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
    }
}

display.initalize();
request.setHeader();
session.new();
