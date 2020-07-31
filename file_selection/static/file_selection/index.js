// Clear local storage to outdated information from being displayed upon revisiting
var tempMode = localStorage.getItem('mode');
localStorage.clear();
if (tempMode) {
    localStorage.setItem('mode', tempMode);
}

$(document).ready(function () {
    function updateDisplayMode() {
        /*
        Set the inital color base on users' preference
        */
        var backgroundColor, color;

        if (localStorage.getItem('mode') == 'dark') {
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            backgroundColor = '#1A1E24';
            color = 'white';
        } else {
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            backgroundColor = '#f1f1f1';
            color = '#1A1E24';
        }

        $('body').css({
            'background-color': backgroundColor
        });

        $('nav').css({
            'background-color': backgroundColor
        });

        $('.nav-item').css({
            'color': color
        });

        $('.tagline-component').css({
            'color': color
        });
    }

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

    // Initialize display mode based on users' preference
    updateDisplayMode();
});