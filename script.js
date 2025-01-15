// Matrix background animation
function setupMatrixBackground() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    // Configuração do canvas em tela cheia
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Caracteres para o efeito Matrix (katakana japonês + alguns números)
    const katakana = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789";
    const letters = katakana.split('');

    // Configuração das colunas
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Array para manter o controle de cada coluna
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = {
            y: Math.random() * -100, // Posição Y inicial aleatória acima da tela
            speed: Math.random() * 0.5 + 0.5, // Velocidade aleatória
            lastUpdate: 0,
            chars: [], // Array para armazenar os caracteres da coluna
            length: Math.floor(Math.random() * 20) + 10, // Comprimento da "cauda"
            brightHead: true // Controle para o caractere brilhante na cabeça
        };
        // Preenche a coluna com caracteres aleatórios
        for (let j = 0; j < drops[i].length; j++) {
            drops[i].chars[j] = letters[Math.floor(Math.random() * letters.length)];
        }
    }

    // Função para trocar caracteres aleatoriamente
    function changeCharacter() {
        return letters[Math.floor(Math.random() * letters.length)];
    }

    // Função principal de desenho
    function draw(timestamp) {
        // Cria o efeito de "fade" das letras anteriores
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + 'px monospace';

        // Atualiza e desenha cada coluna
        drops.forEach((drop, i) => {
            // Atualiza a posição baseada na velocidade
            drop.y += drop.speed;

            // Desenha cada caractere na coluna
            for (let j = 0; j < drop.chars.length; j++) {
                const y = drop.y - (j * fontSize);
                
                // Só desenha se estiver dentro da tela
                if (y > 0 && y < canvas.height) {
                    // Define a cor e opacidade baseada na posição
                    if (j === 0 && drop.brightHead) {
                        // Cabeça da coluna (mais brilhante)
                        ctx.fillStyle = '#fff';
                    } else {
                        // Corpo da coluna (tom de verde com fade)
                        const alpha = 1 - (j / drop.chars.length);
                        ctx.fillStyle = `rgba(0, 255, 70, ${alpha})`;
                    }
                    
                    // Desenha o caractere
                    ctx.fillText(drop.chars[j], i * fontSize, y);
                }
            }

            // Chance de mudar caracteres aleatoriamente
            if (Math.random() < 0.02) {
                const randomIndex = Math.floor(Math.random() * drop.chars.length);
                drop.chars[randomIndex] = changeCharacter();
            }

            // Reseta a coluna quando sai da tela
            if (drop.y - (drop.chars.length * fontSize) > canvas.height) {
                drop.y = -100;
                drop.speed = Math.random() * 0.5 + 0.5;
                drop.length = Math.floor(Math.random() * 20) + 10;
                drop.chars = [];
                for (let j = 0; j < drop.length; j++) {
                    drop.chars[j] = changeCharacter();
                }
            }
        });

        requestAnimationFrame(draw);
    }

    // Inicia a animação
    requestAnimationFrame(draw);
}

// Authentication and User Management
const MASTER_USER = 'Torahz';
const MASTER_PASS = 'N4m3l3ssr34p3r';

// Initialize users in localStorage if not exists
if (!localStorage.getItem('users')) {
    const initialUsers = {
        [MASTER_USER]: MASTER_PASS
    };
    localStorage.setItem('users', JSON.stringify(initialUsers));
}

function authenticate() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users[username] && users[username] === password) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        
        // Show admin controls only for master user
        if (username === MASTER_USER) {
            document.getElementById('admin-controls').classList.remove('hidden');
        }
        
        localStorage.setItem('currentUser', username);
        localStorage.setItem('authenticated', 'true');
    } else {
        alert('Invalid credentials');
    }
}

function logout() {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('currentUser');
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('admin-controls').classList.add('hidden');
}

// Admin Panel Functions
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
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;
    
    if (!newUsername || !newPassword) {
        alert('Please fill in both username and password');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users[newUsername]) {
        alert('Username already exists');
        return;
    }
    
    users[newUsername] = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Clear input fields
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    
    alert('User added successfully');
    updateUsersList();
}

function deleteUser(username) {
    if (username === MASTER_USER) {
        alert('Cannot delete master user');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    delete users[username];
    localStorage.setItem('users', JSON.stringify(users));
    updateUsersList();
}

function updateUsersList() {
    const usersContainer = document.getElementById('users-container');
    const users = JSON.parse(localStorage.getItem('users'));
    
    let html = '<ul class="users-list">';
    for (const username in users) {
        html += `
            <li class="user-item">
                ${username}
                ${username !== MASTER_USER ? 
                    `<button onclick="deleteUser('${username}')" class="terminal-button small">Delete</button>` : 
                    '<span class="master-badge">Master</span>'}
            </li>
        `;
    }
    html += '</ul>';
    
    usersContainer.innerHTML = html;
}

// Encryption/Decryption functions
function processEncryption() {
    const method = document.getElementById('method').value;
    const input = document.getElementById('input-text').value;
    const resultContainer = document.getElementById('text-result');
    const qrContainer = document.getElementById('qr-result');
    
    qrContainer.innerHTML = '';
    let result = '';

    switch(method) {
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
                height: 128
            });
            return;
    }

    resultContainer.textContent = result;
}

function processDecryption() {
    const method = document.getElementById('method').value;
    const input = document.getElementById('input-text').value;
    const resultContainer = document.getElementById('text-result');
    
    if (method === 'sha256') {
        resultContainer.textContent = 'SHA256 cannot be decrypted';
        return;
    }

    let result = '';
    try {
        switch(method) {
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

// PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    });
}

// Initialize
window.onload = () => {
    setupMatrixBackground();
    
    // Check authentication status
    if (localStorage.getItem('authenticated') === 'true') {
        const currentUser = localStorage.getItem('currentUser');
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        
        // Show admin controls if master user
        if (currentUser === MASTER_USER) {
            document.getElementById('admin-controls').classList.remove('hidden');
        }
    }
};