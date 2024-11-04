// Global variables
let username = '';
let userId = '';
let coinBalance = 0.00;
let transactionHistory = [];
let receivedCodes = [];
let cryptoRates = {
    'BERK': { min: 0.5, max: 2.0, current: 1.0 }
};


// Initialize the application
function init() {
    const savedData = getCookie('userData');
    if (savedData) {
        try {
            const data = JSON.parse(decodeURIComponent(savedData));
            loadUserDataFromDecrypted(data);
            document.getElementById('sign-in-up').style.display = 'none';
            document.getElementById('app-header').style.display = 'block';
            document.getElementById('tab-bar').style.display = 'flex';
            document.getElementById('main-content').style.display = 'block';
            showSection('account');
            startMarketSimulation();
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

function loadSavedData() {
    const savedData = getCookie('userData');
    if (savedData) {
        try {
            const data = JSON.parse(decodeURIComponent(savedData));
            loadUserDataFromDecrypted(data);
            document.getElementById('sign-in-up').style.display = 'none';
            document.getElementById('app-header').style.display = 'block';
            document.getElementById('tab-bar').style.display = 'flex';
            document.getElementById('main-content').style.display = 'block';
            showSection('account');
        } catch (e) {
            console.error('Error loading saved data:', e);
            showAlert('Error loading saved data. Please sign in again.');
        }
    }
}


// Authentication Functions
function showAuthTab(tab) {
    document.getElementById('sign-up-form').style.display = tab === 'sign-up' ? 'flex' : 'none';
    document.getElementById('sign-in-form').style.display = tab === 'sign-in' ? 'flex' : 'none';
    
    const tabs = document.querySelectorAll('.auth-tabs button');
    tabs.forEach(t => t.classList.remove('active'));
    tabs[tab === 'sign-up' ? 0 : 1].classList.add('active');
}

function generateUserId() {
    return 'BON-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Authentication Functions
function signIn() {
    const inputUserId = document.getElementById('userId').value;
    const inputEncryptedData = document.getElementById('encryptedData').value;

    if (!inputUserId || !inputEncryptedData) {
        showAlert('Please enter both User ID and encrypted data.');
        return;
    }

    try {
        const decryptedBytes = CryptoJS.AES.decrypt(inputEncryptedData, inputUserId);
        const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
        
        if (decryptedData.userId === inputUserId) {
            loadUserDataFromDecrypted(decryptedData);
            document.getElementById('sign-in-up').style.display = 'none';
            document.getElementById('app-header').style.display = 'block';
            document.getElementById('tab-bar').style.display = 'flex';
            document.getElementById('main-content').style.display = 'block';
            showSection('account');
            saveUserData();
            showAlert('Signed in successfully!');
        } else {
            showAlert('Invalid User ID or encrypted data.');
        }
    } catch (e) {
        showAlert('Invalid encrypted data. Please try again.');
    }
}

function loadUserDataFromDecrypted(data) {
    username = data.username;
    userId = data.userId;
    coinBalance = data.coinBalance;
    transactionHistory = data.transactionHistory || [];
    receivedCodes = data.receivedCodes || [];
    
    document.getElementById('display-username').textContent = username;
    document.getElementById('display-userId').textContent = userId;
    document.getElementById('coin-balance').textContent = coinBalance;
    updateAccountSection();
}


function signUp() {
    username = document.getElementById('username').value;
    if (username) {
        userId = generateUserId();
        coinBalance = 0.00; // Starting balance
        document.getElementById('display-username').textContent = username;
        document.getElementById('display-userId').textContent = userId;
        document.getElementById('sign-in-up').style.display = 'none';
        document.getElementById('app-header').style.display = 'block';
        document.getElementById('tab-bar').style.display = 'flex';
        document.getElementById('main-content').style.display = 'block';
        showSection('account');
        saveUserData();
        startMarketSimulation();
        showAlert('Account created successfully!');
    } else {
        showAlert('Please enter a username.');
    }
}

function loadUserDataFromDecrypted(data) {
    username = data.username;
    userId = data.userId;
    coinBalance = data.coinBalance;
    transactionHistory = data.transactionHistory || [];
    receivedCodes = data.receivedCodes || [];
    
    document.getElementById('display-username').textContent = username;
    document.getElementById('display-userId').textContent = userId;
    document.getElementById('coin-balance').textContent = coinBalance;
    updateAccountSection();
}

// UI Functions
function showSection(section) {
    const sections = ['account', 'transfer', 'receive', 'assets', 'market'];
    sections.forEach(s => {
        document.getElementById(`${s}-section`).style.display = s === section ? 'block' : 'none';
    });
    
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach((tab, index) => {
        tab.classList.toggle('active', sections[index] === section);
    });
    
    if (section === 'account') {
        updateAccountSection();
    } else if (section === 'assets') {
        updateAssetsSection();
    } else if (section === 'market') {
        updateMarketSection();
    }
}

function updateAccountSection() {
    document.getElementById('account-username').textContent = username;
    document.getElementById('account-userId').textContent = userId;
    const userData = {
        username,
        userId,
        coinBalance,
        transactionHistory,
        receivedCodes
    };
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(userData), userId).toString();
    document.getElementById('user-encrypted-data').value = encryptedData;
    document.getElementById('coin-balance').textContent = coinBalance;
}

function updateAssetsSection() {
    document.getElementById('berk-balance').textContent = coinBalance;
    const berkValue = (coinBalance * cryptoRates.BERK.current).toFixed(2);
    document.getElementById('berk-value').textContent = `$${berkValue}`;
}

function updateMarketSection() {
    const marketList = document.getElementById('market-rates');
    marketList.innerHTML = '';
    
    Object.entries(cryptoRates).forEach(([crypto, data]) => {
        const marketItem = document.createElement('div');
        marketItem.className = 'market-item';
        marketItem.innerHTML = `
            <span class="crypto-name">${crypto}</span>
            <span class="crypto-price">$${data.current.toFixed(4)}</span>
            <span class="crypto-change ${data.change > 0 ? 'positive' : 'negative'}">
                ${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%
            </span>
        `;
        marketList.appendChild(marketItem);
    });
}

/// Crypto configuration object
const cryptoConfig = {
    BERK: {
        targetPrice: 0.000005,  // Target price for BERK
        volatility: 0.05,      // 2% volatility
        priceRange: 0.5      // Allow 20% deviation from target price
    },
    // Add other crypto configurations as needed
};


// Market Simulation
function startMarketSimulation() {
    // Initialize crypto rates with configured values
    initializeCryptoRates();
    
    // Initial update
    updateMarketPrices();
    
    // Update every second
    setInterval(() => {
        updateMarketPrices();
    }, 1000);
}

function initializeCryptoRates() {
    // Initialize BERK with configured target price
    if (cryptoRates.BERK) {
        cryptoRates.BERK.current = cryptoConfig.BERK.targetPrice;
        cryptoRates.BERK.min = cryptoConfig.BERK.targetPrice * (1 - cryptoConfig.BERK.priceRange);
        cryptoRates.BERK.max = cryptoConfig.BERK.targetPrice * (1 + cryptoConfig.BERK.priceRange);
        cryptoRates.BERK.previousPrice = cryptoConfig.BERK.targetPrice;
    }
}

function updateMarketPrices() {
    Object.keys(cryptoRates).forEach(crypto => {
        const rate = cryptoRates[crypto];
        rate.previousPrice = rate.current;
        
        // Get crypto-specific volatility or use default
        const volatility = (crypto === 'BERK') 
            ? cryptoConfig.BERK.volatility 
            : 0.02; // Default volatility for other cryptos
        
        // More dynamic price movement
        const randomFactor = (Math.random() - 0.01) * 2; // -1 to 1
        const change = randomFactor * volatility;
        
        // For BERK, add mean reversion towards target price
        if (crypto === 'BERK') {
            const currentDeviation = (rate.current - cryptoConfig.BERK.targetPrice) / cryptoConfig.BERK.targetPrice;
            const meanReversionFactor = -currentDeviation * 0.1; // Adjust strength of mean reversion
            rate.current = Math.max(
                rate.min,
                Math.min(rate.max, rate.current * (1 + change + meanReversionFactor))
            );
        } else {
            // Original calculation for other cryptos
            rate.current = Math.max(
                rate.min,
                Math.min(rate.max, rate.current * (0.99 + change))
            );
        }
        
        rate.change = ((rate.current - rate.previousPrice) / rate.previousPrice) * 100;
    });
    
    updateMarketSection();
    updateAssetsSection();
}

function updateMarketSection() {
    const marketList = document.getElementById('market-rates');
    marketList.innerHTML = '';
    
    Object.entries(cryptoRates).forEach(([crypto, data]) => {
        const priceChange = ((data.current - data.previousPrice) / data.previousPrice) * 100;
        const priceColor = priceChange > 0 ? '#4CAF50' : priceChange < 0 ? '#FF5252' : '#888888';
        
        const marketItem = document.createElement('div');
        marketItem.className = 'market-item';
        marketItem.innerHTML = `
            <span class="crypto-name">${crypto}</span>
            <span class="crypto-price" style="color: ${priceColor}">
                $${data.current.toFixed(crypto === 'BERK' ? 4 : 2)}
            </span>
            <span class="crypto-change" style="color: ${priceColor}">
                ${priceChange > 0 ? '↑' : priceChange < 0 ? '↓' : ''}
                ${Math.abs(priceChange).toFixed(2)}%
            </span>
        `;
        marketList.appendChild(marketItem);
    });
}

// Add CSS styles for market items
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .market-item {
        transition: background-color 0.3s ease;
        padding: 15px;
        border-radius: 8px;
        background-color: var(--card-background);
        margin-bottom: 10px;
    }
    
    .crypto-price, .crypto-change {
        font-weight: bold;
        transition: color 0.3s ease;
    }
    
    .market-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
`;
document.head.appendChild(styleSheet);
// Utility Functions
// Save data function
function saveUserData() {
    const userData = {
        username,
        userId,
        coinBalance,
        transactionHistory,
        receivedCodes
    };
    setCookie('userData', encodeURIComponent(JSON.stringify(userData)), 30);
    updateAccountSection();
}
function showAlert(message) {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = message;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alertContainer.removeChild(alert), 300);
    }, 3000);
}

function copyEncryptedData() {
    const encryptedData = document.getElementById('user-encrypted-data');
    encryptedData.select();
    document.execCommand('copy');
    showAlert('Encrypted data copied to clipboard!');
}

function copyTransactionCode() {
    const transactionCode = document.getElementById('transaction-code');
    transactionCode.select();
    document.execCommand('copy');
    showAlert('Transaction code copied to clipboard!');
}

// Cookie Functions
// Cookie functions
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict; Secure`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}


// Transaction Functions
function transferBerks() {
    const recipientName = document.getElementById('recipient-name').value;
    const recipientId = document.getElementById('recipient-id').value;
    const transferAmount = parseInt(document.getElementById('transfer-amount').value, 10);

    // Validate input fields
    if (!recipientName || !recipientId || isNaN(transferAmount)) {
        showAlert('Please fill in all fields.');
        return;
    }

    if (recipientId === userId) {
        showAlert('You cannot transfer BERKS to yourself.');
        return;
    }

    if (transferAmount < 1) {
        showAlert('Transfer amount must be at least 1 BERK.');
        return;
    }

    if (transferAmount + 50 > coinBalance) {
        showAlert('Insufficient balance to complete the transaction.');
        return;
    }

    // Check transaction limit
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentTransactions = transactionHistory.filter(transaction => transaction.timestamp > oneHourAgo);
    
    if (recentTransactions.length >= 50) {
        showAlert('Transaction limit reached. You can only make 50 transfers per hour.');
        return;
    }

    // Create a transaction code
    const transactionCode = CryptoJS.AES.encrypt(
        JSON.stringify({ recipientId, amount: transferAmount, senderName: username }),
        recipientId
    ).toString();

    // Update coin balance
    coinBalance -= (transferAmount + 50);
    document.getElementById('coin-balance').textContent = coinBalance;

    // Record the transaction with timestamp
    transactionHistory.push({ timestamp: Date.now(), recipientId, amount: transferAmount });

    // Display the transaction code in a box
    document.getElementById('transaction-code').value = transactionCode;
    document.getElementById('transaction-code-container').style.display = 'block';

    // Show success alert
    showAlert(`Transfer successful! You sent ${transferAmount} BERKS to ${recipientName}.`);

    // Save user data after successful transfer
    saveUserData();
}

function receiveBerks() {
    const receiveCode = document.getElementById('receive-code').value;

    if (!receiveCode) {
        showAlert('Please enter a valid transaction code.');
        return;
    }

    // Check if the code has already been used
    if (receivedCodes.includes(receiveCode)) {
        showAlert('This transaction code has already been used.');
        return;
    }

    try {
        const decryptedBytes = CryptoJS.AES.decrypt(receiveCode, userId);
        const transactionData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

        if (transactionData.recipientId !== userId) {
            showAlert('Transaction code does not match your User ID.');
            return;
        }

        coinBalance += transactionData.amount;
        document.getElementById('coin-balance').textContent = coinBalance;

        // Add the code to the history
        receivedCodes.push(receiveCode);
        saveUserData();

        showAlert(`You have received ${transactionData.amount} BERKS from ${transactionData.senderName}.`);
        
    } catch (e) {
        showAlert('Invalid transaction code. Please try again.');
    }
}

// Initialize the application when the page loads

// Initialize the application when the page loads
window.addEventListener('load', init);