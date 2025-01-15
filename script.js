// Matrix background animation
function setupMatrixBackground() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const katakana = "アカサタナハマヤラワ0123456789";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0F0";
        ctx.font = `${fontSize}px monospace`;
        drops.forEach((y, x) => {
            const text = katakana[Math.floor(Math.random() * katakana.length)];
            ctx.fillText(text, x * fontSize, y * fontSize);
            if (y * fontSize > canvas.height && Math.random() > 0.975) {
                drops[x] = 0;
            }
            drops[x]++;
        });
    }
    setInterval(draw, 50);
}

// Constants for the master user
const MASTER_USER = 'torahz';
const MASTER_PASS = '$nmlss';

// Ensure the master user exists in localStorage
function initializeMasterUser() {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (!users[MASTER_USER]) {
        users[MASTER_USER] = MASTER_PASS;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Authenticate the user
function authenticate() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[username] && users[username] === password) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        if (username === MASTER_USER) {
            document.getElementById('admin-controls').classList.remove('hidden');
        }
        localStorage.setItem('currentUser', username);
    } else {
        alert('Invalid username or password');
    }
}

// Log out the current user
function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('admin-controls').classList.add('hidden');
}

// Toggle the admin panel visibility
function toggleAdminPanel() {
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('admin-section').classList.remove('hidden');
    updateUsersList();
}

// Return to the main app section
function returnToApp() {
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
}

// Add a new user
function addNewUser() {
    const newUsername = document.getElementById('new-username').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    if (!newUsername || !newPassword) {
        alert('Please fill in both username and password');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[newUsername]) {
        alert('Username already exists');
        return;
    }

    users[newUsername] = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    alert('User added successfully');
    updateUsersList();
}

// Remove a user
function deleteUser(username) {
    if (username === MASTER_USER) {
        alert('Cannot delete the master user');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};
    delete users[username];
    localStorage.setItem('users', JSON.stringify(users));
    alert(`User ${username} removed successfully`);
    updateUsersList();
}

// Update the user list in the admin panel
function updateUsersList() {
    const usersContainer = document.getElementById('users-container');
    const users = JSON.parse(localStorage.getItem('users')) || {};
    usersContainer.innerHTML = Object.keys(users)
        .map(user => `
            <li>
                ${user} 
                ${user !== MASTER_USER ? `<button onclick="deleteUser('${user}')">Remove</button>` : ''}
            </li>
        `)
        .join('');
}

// Encryption and decryption logic
function processEncryption() {
    const method = document.getElementById('method').value;
    const input = document.getElementById('input-text').value.trim();
    const resultContainer = document.getElementById('text-result');
    const qrContainer = document.getElementById('qr-result');

    qrContainer.innerHTML = ''; // Clear previous QR codes
    let result = '';

    switch (method) {
        case 'sha256':
            result = CryptoJS.SHA256(input).toString();
            break;
        case 'base64':
            result = btoa(input);
            break;
        case 'aes':
            result = CryptoJS.AES.encrypt(input, 'secret-key').toString();
            break;
        case 'qr':
            resultContainer.textContent = '';
            new QRCode(qrContainer, {
                text: input,
                width: 128,
                height: 128,
            });
            return;
    }

    resultContainer.textContent = result;
    adjustFontSize(resultContainer);
}

// Adjust font size to prevent overflow
function adjustFontSize(container) {
    const maxWidth = container.offsetWidth;
    let fontSize = 16;
    container.style.fontSize = `${fontSize}px`;

    while (container.scrollWidth > maxWidth && fontSize > 10) {
        fontSize--;
        container.style.fontSize = `${fontSize}px`;
    }
}

function processDecryption() {
    const method = document.getElementById('method').value;
    const input = document.getElementById('input-text').value.trim();
    const resultContainer = document.getElementById('text-result');

    if (method === 'sha256') {
        resultContainer.textContent = 'SHA256 cannot be decrypted';
        return;
    }

    let result = '';
    try {
        switch (method) {
            case 'base64':
                result = atob(input);
                break;
            case 'aes':
                const decrypted = CryptoJS.AES.decrypt(input, 'secret-key');
                result = decrypted.toString(CryptoJS.enc.Utf8);
                break;
            case 'qr':
                resultContainer.textContent = 'Use a QR code scanner to decrypt';
                return;
        }
        resultContainer.textContent = result;
    } catch (error) {
        resultContainer.textContent = 'Invalid input for decryption';
    }
}

// Initialize the app
window.onload = () => {
    setupMatrixBackground();
    initializeMasterUser();
};
