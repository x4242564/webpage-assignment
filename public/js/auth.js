// Login status in the nav
// Asks the server (/profile) who is logged in, then shows their username
// and swaps the "Log in" link for "Log out". Visitors who aren't logged in see "Guest".

let nav_username = document.querySelector('#nav_username');
let auth_link = document.querySelector('#auth_link');

fetch('/profile')
    .then(function (response) {
        return response.json();
    })
    .then(function (profile) {
        nav_username.textContent = profile.username;

        if (profile.loggedIn) {
            auth_link.textContent = 'Log out';
            auth_link.href = '/logout';
        } else {
            auth_link.textContent = 'Log in';
            auth_link.href = 'login.html';
        }
    })
    .catch(function () {
        // Server not reachable (e.g. page opened as a file): leave the Guest defaults
    });
