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

    updateDisplayMode();
});

function updateDisplayMode() {
    /*
    Updates the display mode based on the users' preference
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

    $('.nav-logo').css({
        'color': color
    });

    $('.nav-item').css({
        'color': color
    });

    $('.doc-message').css({
        'color': color
    });
}