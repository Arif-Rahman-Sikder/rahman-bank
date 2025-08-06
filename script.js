document.addEventListener('DOMContentLoaded', () => {
    // Initialize from localStorage
    let balance = parseFloat(localStorage.getItem('balance')) || 1240;
    let deposits = parseFloat(localStorage.getItem('deposits')) || 0;
    let withdrawals = parseFloat(localStorage.getItem('withdrawals')) || 0;
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const loginArea = document.getElementById('login-area');
    const transactionArea = document.getElementById('transaction-area');
    const loginBtn = document.getElementById('login');
    const depositBtn = document.getElementById('addDeposit');
    const withdrawBtn = document.getElementById('addWithdraw');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const errorMessage = document.getElementById('errorMessage');
    const ctx = document.getElementById('transactionChart').getContext('2d');

    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Deposits',
                    data: [],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: false,
                    pointRadius: 5
                },
                {
                    label: 'Withdrawals',
                    data: [],
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    fill: false,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    mode: 'nearest',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += `$${context.parsed.y.toFixed(2)}`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Update UI and chart with initial values
    updateUI();

    // Login button event handler
    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (email && password) {
            loginArea.classList.add('hidden');
            transactionArea.classList.remove('hidden');
            localStorage.setItem('isLoggedIn', 'true');
        } else {
            showError('Please enter both email and password');
        }
    });

    // Check login state
    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginArea.classList.add('hidden');
        transactionArea.classList.remove('hidden');
    }

    // Deposit button event handler
    depositBtn.addEventListener('click', () => {
        const depositNumber = getInputNumber('depositAmount');
        if (isValidAmount(depositNumber)) {
            deposits += depositNumber;
            balance += depositNumber;
            transactions.push({ type: 'Deposit', amount: depositNumber, date: new Date().toISOString() });
            updateUI();
            document.getElementById('depositAmount').value = '';
            saveToLocalStorage();
        } else {
            showError('Please enter a valid positive amount');
        }
    });

    // Withdraw button event handler
    withdrawBtn.addEventListener('click', () => {
        const withdrawNumber = getInputNumber('withdrawAmount');
        if (isValidAmount(withdrawNumber)) {
            if (withdrawNumber <= balance) {
                withdrawals += withdrawNumber;
                balance -= withdrawNumber;
                transactions.push({ type: 'Withdrawal', amount: withdrawNumber, date: new Date().toISOString() });
                updateUI();
                document.getElementById('withdrawAmount').value = '';
                saveToLocalStorage();
            } else {
                showError('Insufficient balance');
            }
        } else {
            showError('Please enter a valid positive amount');
        }
    });

    // Clear history button event handler
    clearHistoryBtn.addEventListener('click', () => {
        transactions = [];
        deposits = 0;
        withdrawals = 0;
        balance = 1240;
        updateUI();
        saveToLocalStorage();
    });

    function getInputNumber(id) {
        const amount = document.getElementById(id).value;
        return parseFloat(amount) || 0;
    }

    function isValidAmount(amount) {
        return !isNaN(amount) && amount > 0;
    }

    function updateUI() {
        document.getElementById('currentDeposit').innerText = deposits.toFixed(2);
        document.getElementById('currentWithdraw').innerText = withdrawals.toFixed(2);
        document.getElementById('currentBalance').innerText = balance.toFixed(2);

        const historyList = document.getElementById('transactionHistory');
        historyList.innerHTML = '';
        transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.className = 'p-2 bg-gray-50 rounded-md';
            li.innerText = `${transaction.type}: $${transaction.amount.toFixed(2)} on ${new Date(transaction.date).toLocaleString()}`;
            historyList.appendChild(li);
        });

        // Update chart data
        const depositData = transactions
            .filter(t => t.type === 'Deposit')
            .map(t => ({ x: new Date(t.date), y: t.amount }));
        const withdrawalData = transactions
            .filter(t => t.type === 'Withdrawal')
            .map(t => ({ x: new Date(t.date), y: t.amount }));

        chart.data.datasets[0].data = depositData;
        chart.data.datasets[1].data = withdrawalData;
        chart.update();
    }

    function showError(message) {
        errorMessage.innerText = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => errorMessage.classList.add('hidden'), 3000);
    }

    function saveToLocalStorage() {
        localStorage.setItem('balance', balance);
        localStorage.setItem('deposits', deposits);
        localStorage.setItem('withdrawals', withdrawals);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
});