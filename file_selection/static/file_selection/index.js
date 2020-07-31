// Remove data from local storage to avoid being able to revisit page and see outdated information
var existingDisplayMode = localStorage.getItem('mode');
localStorage.clear();
if (existingDisplayMode != null) {
    localStorage.setItem('mode', existingDisplayMode);
}

$(document).ready(function () {
    // Checks if user has preset preference for color mode
    var darkMode;

    if (localStorage.getItem('mode') == 'light') {
        initialize('light');
        darkMode = false;
    } else {
        initialize('dark');
        darkMode = true;
    }


    function initialize(type) {
        /*
        Set the inital color base on users' preference
        */
        if (type == 'dark') {
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#1A1E24';
            //document.getElementsByTagName('body')[0].style.backgroundImage = 'url("https://i.imgur.com/uEPMJ0H.jpg"), linear-gradient(rgba(0, 0, 0, 0.7),rgba(0, 0, 0, 0.7))';
            document.getElementsByTagName('body')[0].style.color = 'rgb(210, 210, 210)';
        } else {
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            document.getElementsByTagName('body')[0].style.backgroundImage = 'url("https://i.imgur.com/uEPMJ0H.jpg"), linear-gradient(rgba(255, 255, 255, 0.1),rgba(255, 255, 255, 0.1))';
            document.getElementsByTagName('body')[0].style.color = 'black';
        }
    }


    // Allows users to switch between to light and dark mode
    $('#darkMode').click(function () {
        if (!darkMode) {
            localStorage.setItem('mode', 'dark');
            document.getElementById('darkMode').innerHTML = 'Light Mode';
            document.getElementsByTagName('body')[0].style.backgroundImage = "url('https://i.imgur.com/uEPMJ0H.jpg'), linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7))";
            document.getElementById('tagline').style.color = 'rgb(210, 210, 210)';
            darkMode = true;
        } else {
            localStorage.setItem('mode', 'light');
            document.getElementById('darkMode').innerHTML = 'Dark Mode';
            document.getElementsByTagName('body')[0].style.backgroundImage = "url('https://i.imgur.com/uEPMJ0H.jpg'), linear-gradient(rgba(255,255,255,0.1),rgba(255,255,255,0.1))";
            document.getElementById('tagline').style.color = 'black';
            darkMode = false;
        }
    });
});