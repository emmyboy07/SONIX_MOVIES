// Register form logic
document.getElementById('register-form')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Get existing users from localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if the user already exists
    if (users.some(user => user.email === email)) {
        document.getElementById('error-message').textContent = 'User already exists!';
        return;
    }

    // Register the user
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful! Please log in.');
    window.location.href = 'login.html';
});

// Login form logic
document.getElementById('login-form')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Get existing users from localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if the user exists
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        // Store logged-in user in sessionStorage
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));

        // Redirect to the index page
        window.location.href = 'index.html';
    } else {
        document.getElementById('error-message').textContent = 'Invalid email or password!';
    }
});

// Check if user is logged in before allowing access to index.html
if (window.location.pathname === '/index.html' && !sessionStorage.getItem('loggedInUser')) {
    window.location.href = 'login.html';  // Redirect to login if not logged in
}
