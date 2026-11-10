// Theme Toggle
// Switches between the default and dark color themes defined in css/style.css
// Based on: https://dev.to/codedgar/how-to-create-a-dark-theme-system-in-5-minutes-or-less-with-vanilla-js-2922

let theme_toggler = document.querySelector('#theme_toggler');

// Toggle the dark_mode class on click and save the choice
theme_toggler.addEventListener('click', function () {
    document.body.classList.toggle('dark_mode');

    if (document.body.classList.contains('dark_mode')) {
        localStorage.setItem('website_theme', 'dark_mode');
    } else {
        localStorage.setItem('website_theme', 'default');
    }
});

// Load the saved theme so it carries across pages and visits
function retrieve_theme() {
    let theme = localStorage.getItem('website_theme');

    if (theme != null) {
        document.body.classList.remove('default', 'dark_mode');
        document.body.classList.add(theme);
    }
}

retrieve_theme();

// Keep other open tabs in sync when the theme changes
window.addEventListener('storage', function () {
    retrieve_theme();
}, false);
