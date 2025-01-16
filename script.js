// Play/Pause Music
let isMusicPlaying = false;
function toggleMusic() {
    const audio = document.getElementById('background-music');
    isMusicPlaying = !isMusicPlaying;
    const musicButton = document.getElementById('music-button');
    if (isMusicPlaying) {
        audio.play();
        musicButton.textContent = 'II'; // Ícone de pause estilo Matrix
    } else {
        audio.pause();
        musicButton.textContent = '>'; // Ícone de play estilo Matrix
    }
}

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

// Adjust text size to fit container
function adjustFontSize(container) {
    const maxWidth = container.offsetWidth;
    let fontSize = 16;
    container.style.fontSize = `${fontSize}px`;

    while (container.scrollWidth > maxWidth && fontSize > 10) {
        fontSize--;
        container.style.fontSize = `${fontSize}px`;
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
        
        // Exibe o Admin Panel apenas se o superuser estiver logado
        if (username === 'torahz') {
            document.getElementById('admin-controls').classList.remove('hidden');
        } else {
            document.getElementById('admin-controls').classList.add('hidden');
        }

        localStorage.setItem('currentUser', username);
        toggleMusic(); // Inicia a música
    } else {
        alert('Invalid username or password');
    }
}

// Logout the user
function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
    const audio = document.getElementById('background-music');
    audio.pause(); // Para a música
    isMusicPlaying = false;
    document.getElementById('music-button').textContent = '>'; // Reset Play button
}

// Process encryption
function processEncryption() {
    const method = document.getElementById('method').value;
    const input = document.getElementById('input-text').value.trim();
    const resultContainer = document.getElementById('text-result');
    const qrContainer = document.getElementById('qr-result');

    qrContainer.innerHTML = '';
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

// Process decryption
function processDecryption() {
    const method = document.getElementById('method').value;
    const input = document.getElementById('input-text').value.trim();
    const resultContainer = document.getElementById('text-result');

    if (method === 'sha256') {
        resultContainer.textContent = 'SHA256 is a one-way hash and cannot be decrypted.';
        adjustFontSize(resultContainer);
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
                resultContainer.textContent = 'Use a QR code scanner to decrypt.';
                return;
        }
        resultContainer.textContent = result;
    } catch (error) {
        resultContainer.textContent = 'Invalid input for decryption';
    }
    adjustFontSize(resultContainer);
}

// Admin Panel functions
function toggleAdminPanel() {
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('admin-section').classList.remove('hidden');
    updateUsersList();
}

function returnToApp() {
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
}

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

function deleteUser(username) {
    if (username === 'torahz') {
        alert('Cannot delete the superuser');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};
    delete users[username];
    localStorage.setItem('users', JSON.stringify(users));
    alert(`User ${username} removed successfully`);
    updateUsersList();
}

function updateUsersList() {
    const usersContainer = document.getElementById('users-container');
    const users = JSON.parse(localStorage.getItem('users')) || {};
    usersContainer.innerHTML = Object.keys(users)
        .map(user => `
            <li>
                ${user} 
                ${user !== 'torahz' ? `<button onclick="deleteUser('${user}')">Remove</button>` : ''}
            </li>
        `)
        .join('');
}

// Initialize the app
window.onload = () => {
    setupMatrixBackground();

    // Ensure superuser credentials exist securely
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (!users['torahz']) {
        users['torahz'] = '$nmlss';
        localStorage.setItem('users', JSON.stringify(users));
    }
};
// PWA Installation Handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installButton = document.getElementById('install-button');
    installButton.style.display = 'block';

    installButton.addEventListener('click', () => {
        installButton.style.display = 'none';
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}