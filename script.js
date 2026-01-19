// WalletWise - Complete Online Shopping Control App with Savings Wallet
document.addEventListener('DOMContentLoaded', function() {
    console.log("🎯 WalletWise - Online Shopping Control");
    
    // === APP STATE ===
    let currentUser = null;
    let expenses = [];
    let shoppingBudget = 15000;
    let savings = {
        balance: 0,
        goal: 10000,
        goalDeadline: null,
        goalPurpose: "Emergency Fund",
        history: [],
        achievements: []
    };
    
    // === NEW FEATURES STATE ===
    let pendingItems = []; // 24-hour pending items
    let timeBlockSettings = {
        active: false,
        startTime: "20:00", // 8 PM
        endTime: "23:00",   // 11 PM
        days: [0, 1, 2, 3, 4, 5, 6], // All days (0=Sun, 6=Sat)
        blockEvening: true,
        blockLateNight: false,
        blockWeekends: false
    };
    
    let progressStats = {
        lastImpulseBuy: null,
        totalSaved: 0,
        impulseReduction: 0,
        streakDays: 0
    };
    
    // === DOM ELEMENTS ===
    const pages = {
        landing: document.getElementById('landingPage'),
        login: document.getElementById('loginPage'),
        signup: document.getElementById('signupPage'),
        dashboard: document.getElementById('dashboardPage')
    };
    
    const navButtons = document.getElementById('navButtons');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const successCelebration = document.querySelector('.success-celebration');
    const welcomeAnimation = document.querySelector('.welcome-animation');
    const toastContainer = document.getElementById('toastContainer');
    
    // New feature modals
    const pendingModal = document.querySelector('.pending-modal');
    const timeblockModal = document.querySelector('.timeblock-modal');
    const progressModal = document.querySelector('.progress-modal');
    const budgetModal = document.querySelector('.budget-modal');
    const transferModal = document.querySelector('.transfer-modal');
    
    // Buttons
    const getStartedBtn = document.getElementById('getStartedBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    const headerSignupBtn = document.getElementById('headerSignupBtn');
    const goToSignupLink = document.getElementById('goToSignupLink');
    const goToLoginLink = document.getElementById('goToLoginLink');
    const continueBtn = document.getElementById('continueBtn');
    
    // NEW: Budget & Transfer buttons
    const editBudgetBtn = document.getElementById('editBudgetBtn');
    const setBudgetBtn = document.getElementById('setBudgetBtn');
    const transferFromSavingsBtn = document.getElementById('transferFromSavingsBtn');
    
    // Control panel buttons
    const cartReviewBtn = document.querySelector('.cart-review-btn');
    const timeBlockBtn = document.querySelector('.time-block-btn');
    const progressBtn = document.querySelector('.progress-btn');
    
    // Forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const expenseForm = document.getElementById('expenseForm');
    
    // Success message containers
    const loginSuccessMessage = document.getElementById('loginSuccessMessage');
    const loginNextSteps = document.getElementById('loginNextSteps');
    const signupSuccessMessage = document.getElementById('signupSuccessMessage');
    const signupProgress = document.getElementById('signupProgress');
    const welcomeAchievement = document.getElementById('welcomeAchievement');
    const signupCompletion = document.getElementById('signupCompletion');
    const expenseSuccessMessage = document.getElementById('expenseSuccessMessage');
    const expenseTips = document.getElementById('expenseTips');
    const budgetAlert = document.getElementById('budgetAlert');
    
    // Dashboard elements
    const expenseTableBody = document.getElementById('expenseTableBody');
    const totalExpensesElement = document.getElementById('totalExpenses');
    const savedAmountElement = document.getElementById('savedAmount');
    const budgetRemainingElement = document.getElementById('budgetRemaining');
    const budgetPercentageElement = document.getElementById('budgetPercentage');
    const totalBudgetElement = document.getElementById('totalBudget');
    const progressFillElement = document.getElementById('progressFill');
    
    // New feature elements
    const pendingCartCount = document.getElementById('pendingCartCount');
    const pendingCartAmount = document.getElementById('pendingCartAmount');
    const blockTime = document.getElementById('blockTime');
    const blockStatusText = document.getElementById('blockStatusText');
    
    // === TOAST NOTIFICATION SYSTEM ===
    function showToast(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ️';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div>
                <strong style="color: #333;">${type.charAt(0).toUpperCase() + type.slice(1)}!</strong>
                <p style="margin-top: 5px; color: #666; font-size: 14px;">${message}</p>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, duration);
    }
    
    // === LOADING SYSTEM ===
    function showLoading(message = 'Loading...') {
        loadingOverlay.querySelector('.loading-text').textContent = message;
        loadingOverlay.classList.add('active');
    }
    
    function hideLoading() {
        loadingOverlay.classList.remove('active');
    }
    
    // === SUCCESS CELEBRATION ===
    function showSuccess(message, buttonText = 'Continue') {
        successCelebration.querySelector('#successMessage').textContent = message;
        successCelebration.querySelector('#continueBtn').textContent = buttonText;
        successCelebration.classList.add('active');
        
        continueBtn.onclick = () => {
            successCelebration.classList.remove('active');
        };
    }
    
    // === WELCOME ANIMATION ===
    function showWelcomeAnimation(username) {
        welcomeAnimation.querySelector('.welcome-text').textContent = `Welcome, ${username}!`;
        welcomeAnimation.classList.add('active');
        
        setTimeout(() => {
            welcomeAnimation.classList.remove('active');
        }, 3000);
    }
    
    // === NEW FEATURES: 24-HOUR PENDING ITEMS ===
    function updatePendingCartDisplay() {
        const count = pendingItems.length;
        const total = pendingItems.reduce((sum, item) => sum + item.amount, 0);
        
        if (pendingCartCount) {
            pendingCartCount.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
        }
        
        if (pendingCartAmount) {
            pendingCartAmount.textContent = total;
        }
        
        // Update the cart review button
        if (cartReviewBtn) {
            cartReviewBtn.querySelector('span').textContent = total;
        }
    }
    
    function addPendingItem(description, platform, amount) {
        const newItem = {
            id: Date.now(),
            description: description,
            platform: platform,
            amount: amount,
            addedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        };
        
        pendingItems.push(newItem);
        updatePendingCartDisplay();
        savePendingItems();
        
        showToast(`Item added to 24-hour waiting list. Think about it!`, 'info');
    }
    
    function removePendingItem(id) {
        const itemIndex = pendingItems.findIndex(item => item.id === id);
        if (itemIndex === -1) return;
        
        const removedItem = pendingItems[itemIndex];
        pendingItems.splice(itemIndex, 1);
        updatePendingCartDisplay();
        savePendingItems();
        
        // Add savings when user removes a pending item
        const savingsAmount = Math.round(removedItem.amount * 0.4);
        addSavingsEntry(savingsAmount, 'impulse_avoided', `Avoided purchase: ${removedItem.description}`);
        
        showToast(`Item removed! ₱${savingsAmount} added to savings!`, 'success');
    }
    
    function buyPendingItem(id) {
        const itemIndex = pendingItems.findIndex(item => item.id === id);
        if (itemIndex === -1) return;
        
        const item = pendingItems[itemIndex];
        
        // Add as an expense
        const newExpense = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            platform: item.platform,
            description: item.description,
            category: 'other',
            amount: item.amount,
            purchaseType: 'planned',
            loggedAt: new Date().toISOString()
        };
        
        addExpense(newExpense);
        
        // Remove from pending
        pendingItems.splice(itemIndex, 1);
        updatePendingCartDisplay();
        savePendingItems();
        
        showToast(`Purchase completed! ₱${item.amount} logged as expense.`, 'success');
    }
    
    function updatePendingItemsDisplay() {
        const pendingList = document.getElementById('pendingList');
        const pendingCount = document.getElementById('pendingCount');
        const pendingTotal = document.getElementById('pendingTotal');
        const potentialSavings = document.getElementById('potentialSavings');
        const buyAllBtn = document.getElementById('buyAllBtn');
        
        if (!pendingList) return;
        
        // Update summary
        if (pendingCount) pendingCount.textContent = pendingItems.length;
        if (pendingTotal) {
            const total = pendingItems.reduce((sum, item) => sum + item.amount, 0);
            pendingTotal.textContent = total;
        }
        if (potentialSavings) {
            const savings = Math.round(pendingItems.reduce((sum, item) => sum + item.amount, 0) * 0.4);
            potentialSavings.textContent = savings;
        }
        if (buyAllBtn) {
            const total = pendingItems.reduce((sum, item) => sum + item.amount, 0);
            buyAllBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Buy All (₱${total})`;
        }
        
        // Clear current list
        pendingList.innerHTML = '';
        
        if (pendingItems.length === 0) {
            pendingList.innerHTML = `
                <div class="empty-pending">
                    <p>No items in 24-hour waiting period. Great self-control! 🎉</p>
                </div>
            `;
            return;
        }
        
        // Add each pending item
        pendingItems.forEach(item => {
            const timeLeft = calculateTimeLeft(item.expiresAt);
            const itemElement = document.createElement('div');
            itemElement.className = 'pending-item';
            itemElement.dataset.id = item.id;
            
            itemElement.innerHTML = `
                <div class="pending-item-header">
                    <div class="pending-item-title">
                        <h5>${item.description}</h5>
                        <span class="pending-item-platform">${getPlatformName(item.platform)}</span>
                    </div>
                    <div class="pending-item-price">₱${item.amount}</div>
                </div>
                
                <div class="pending-item-timer">
                    <div class="timer-icon">⏰</div>
                    <div class="timer-text">
                        <p>Time remaining to decide:</p>
                        <div class="timer-countdown">${timeLeft}</div>
                    </div>
                </div>
                
                <div class="pending-item-actions">
                    <button class="btn btn-success buy-item-btn" data-id="${item.id}">
                        <i class="fas fa-check"></i> Buy Now
                    </button>
                    <button class="btn btn-danger remove-item-btn" data-id="${item.id}">
                        <i class="fas fa-times"></i> Remove
                    </button>
                    <button class="btn btn-outline wait-more-btn" data-id="${item.id}">
                        <i class="fas fa-clock"></i> Wait More
                    </button>
                </div>
            `;
            
            pendingList.appendChild(itemElement);
        });
        
        // Add event listeners
        document.querySelectorAll('.buy-item-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                buyPendingItem(id);
            });
        });
        
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                removePendingItem(id);
            });
        });
        
        document.querySelectorAll('.wait-more-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                extendPendingItem(id);
            });
        });
    }
    
    function calculateTimeLeft(expiresAt) {
        const now = new Date();
        const expireDate = new Date(expiresAt);
        const diffMs = expireDate - now;
        
        if (diffMs <= 0) return "00:00:00";
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function extendPendingItem(id) {
        const item = pendingItems.find(item => item.id === id);
        if (!item) return;
        
        // Add 12 more hours
        const newExpiresAt = new Date(new Date(item.expiresAt).getTime() + 12 * 60 * 60 * 1000);
        item.expiresAt = newExpiresAt.toISOString();
        savePendingItems();
        
        showToast(`Extended waiting period by 12 hours. Good discipline!`, 'info');
        updatePendingItemsDisplay();
    }
    
    // === NEW FEATURES: TIME BLOCK ===
    function updateTimeBlockDisplay() {
        if (blockTime) {
            blockTime.textContent = `${timeBlockSettings.startTime}-${timeBlockSettings.endTime}`;
        }
        
        if (blockStatusText) {
            blockStatusText.textContent = timeBlockSettings.active ? 'Active' : 'Set Block';
        }
        
        // Update modal display
        const timeblockStatus = document.getElementById('timeblockStatus');
        if (timeblockStatus) {
            timeblockStatus.textContent = timeBlockSettings.active ? 'Active - Protection Enabled' : 'Not active';
            timeblockStatus.className = timeBlockSettings.active ? 'status-active' : '';
        }
        
        // Update checkboxes in modal
        const blockEvening = document.getElementById('blockEvening');
        const blockLateNight = document.getElementById('blockLateNight');
        const blockWeekends = document.getElementById('blockWeekends');
        
        if (blockEvening) blockEvening.checked = timeBlockSettings.blockEvening;
        if (blockLateNight) blockLateNight.checked = timeBlockSettings.blockLateNight;
        if (blockWeekends) blockWeekends.checked = timeBlockSettings.blockWeekends;
        
        // Update time inputs
        const blockStart = document.getElementById('blockStart');
        const blockEnd = document.getElementById('blockEnd');
        
        if (blockStart) blockStart.value = timeBlockSettings.startTime;
        if (blockEnd) blockEnd.value = timeBlockSettings.endTime;
        
        // Update day buttons
        document.querySelectorAll('.day-btn').forEach(btn => {
            const day = parseInt(btn.dataset.day);
            if (timeBlockSettings.days.includes(day)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    function checkTimeBlock() {
        if (!timeBlockSettings.active) return false;
        
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentDay = now.getDay();
        
        // Check if current day is blocked
        if (!timeBlockSettings.days.includes(currentDay)) {
            return false;
        }
        
        // Parse start and end times
        const [startHour, startMinute] = timeBlockSettings.startTime.split(':').map(Number);
        const [endHour, endMinute] = timeBlockSettings.endTime.split(':').map(Number);
        
        // Convert current time to minutes since midnight
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;
        
        // Check if current time is within blocked period
        if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
            return true;
        }
        
        return false;
    }
    
    // === NEW FEATURES: PROGRESS REPORT ===
    function updateProgressDisplay() {
        // Calculate progress stats
        const now = new Date();
        let daysSinceImpulse = 0;
        
        if (progressStats.lastImpulseBuy) {
            const lastImpulseDate = new Date(progressStats.lastImpulseBuy);
            const diffTime = Math.abs(now - lastImpulseDate);
            daysSinceImpulse = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        
        // Update modal display
        const progressDays = document.getElementById('progressDays');
        const progressSaved = document.getElementById('progressSaved');
        const progressReduction = document.getElementById('progressReduction');
        
        if (progressDays) progressDays.textContent = daysSinceImpulse;
        if (progressSaved) progressSaved.textContent = progressStats.totalSaved;
        if (progressReduction) progressReduction.textContent = progressStats.impulseReduction;
        
        // Update milestones
        updateMilestones();
        
        // Update chart
        updateSpendingChart();
    }
    
    function updateMilestones() {
        const milestones = document.querySelectorAll('.milestone');
        
        milestones.forEach(milestone => {
            const title = milestone.querySelector('h5').textContent;
            const progressFill = milestone.querySelector('.progress-fill');
            const progressText = milestone.querySelector('span');
            
            let progress = 0;
            let total = 100;
            let current = 0;
            
            if (title === '7 Days Clean') {
                const now = new Date();
                if (progressStats.lastImpulseBuy) {
                    const lastImpulseDate = new Date(progressStats.lastImpulseBuy);
                    const diffTime = Math.abs(now - lastImpulseDate);
                    current = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                }
                total = 7;
                progress = Math.min(100, (current / total) * 100);
                progressText.textContent = `${current}/${total} days`;
            } else if (title === 'Save ₱5,000') {
                current = savings.balance;
                total = 5000;
                progress = Math.min(100, (current / total) * 100);
                progressText.textContent = `₱${current}/₱${total}`;
            } else if (title === 'Reduce by 50%') {
                current = progressStats.impulseReduction;
                total = 50;
                progress = Math.min(100, (current / total) * 100);
                progressText.textContent = `${current}%/50%`;
            }
            
            progressFill.style.width = `${progress}%`;
            
            if (progress >= 100) {
                milestone.dataset.completed = "true";
                milestone.style.backgroundColor = '#e8f5e9';
                milestone.style.borderColor = '#4caf50';
            }
        });
    }
    
    function updateSpendingChart() {
        const ctx = document.getElementById('spendingChart');
        if (!ctx) return;
        
        // Create sample data for the chart
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const data = [12000, 11000, 9000, 8000, 7000, 6500]; // Decreasing spending
        
        // Create chart if it doesn't exist
        if (!window.spendingChart) {
            window.spendingChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Monthly Spending (₱)',
                        data: data,
                        borderColor: '#2d5be3',
                        backgroundColor: 'rgba(45, 91, 227, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        } else {
            // Update existing chart
            window.spendingChart.data.datasets[0].data = data;
            window.spendingChart.update();
        }
    }
    
    // === NEW FEATURES: BUDGET SETTINGS ===
    function updateBudgetDisplay() {
        const currentMonthSpent = getCurrentMonthSpent();
        const remaining = shoppingBudget - currentMonthSpent;
        const percentage = Math.min(100, (currentMonthSpent / shoppingBudget) * 100);
        
        if (budgetRemainingElement) {
            budgetRemainingElement.innerHTML = `<strong>₱${remaining.toFixed(0)}</strong> remaining of ₱${shoppingBudget}`;
        }
        
        if (budgetPercentageElement) {
            budgetPercentageElement.textContent = `${Math.round(percentage)}% Used`;
            
            let emoji = '🎯';
            if (percentage > 80) emoji = '⚠️';
            if (percentage > 100) emoji = '❌';
            
            budgetPercentageElement.nextElementSibling.textContent = `${percentage > 100 ? 'Over budget! ' : 'You\'re on track! '}${emoji}`;
        }
        
        if (totalBudgetElement) {
            totalBudgetElement.textContent = `₱${shoppingBudget}`;
        }
        
        if (progressFillElement) {
            progressFillElement.style.width = `${percentage}%`;
            
            if (percentage > 80) {
                progressFillElement.style.background = '#ffc107';
            } else if (percentage > 100) {
                progressFillElement.style.background = '#dc3545';
            } else {
                progressFillElement.style.background = 'white';
            }
        }
        
        // Update modals
        updateBudgetModals();
        
        // Save budget to localStorage
        saveBudget();
    }
    
    function updateBudgetModals() {
        // Update current budget display in budget modal
        if (document.getElementById('currentBudgetDisplay')) {
            document.getElementById('currentBudgetDisplay').textContent = `₱${shoppingBudget}`;
        }
        
        // Update transfer modal displays
        if (document.getElementById('transferSavingsBalance')) {
            document.getElementById('transferSavingsBalance').textContent = `₱${savings.balance}`;
        }
        if (document.getElementById('transferBudgetBalance')) {
            document.getElementById('transferBudgetBalance').textContent = `₱${shoppingBudget}`;
        }
    }
    
    function setNewBudget(newBudget) {
        if (newBudget < 1000) {
            showToast('Minimum budget is ₱1,000', 'error');
            return false;
        }
        
        const oldBudget = shoppingBudget;
        shoppingBudget = newBudget;
        
        updateBudgetDisplay();
        showToast(`Monthly budget updated from ₱${oldBudget} to ₱${newBudget}`, 'success');
        
        return true;
    }
    
    function transferFromSavings(amount, reason) {
        if (amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return false;
        }
        
        if (amount > savings.balance) {
            showToast(`Insufficient savings! You only have ₱${savings.balance}`, 'error');
            return false;
        }
        
        // Deduct from savings
        savings.balance -= amount;
        
        // Add to savings history as a withdrawal
        const withdrawalEntry = {
            id: Date.now(),
            amount: -amount, // Negative amount for withdrawal
            source: 'budget_transfer',
            description: reason || `Transferred to budget`,
            date: new Date().toISOString().split('T')[0]
        };
        
        savings.history.push(withdrawalEntry);
        
        // Increase budget
        const oldBudget = shoppingBudget;
        shoppingBudget += amount;
        
        // Update displays
        updateSavingsDisplay();
        updateBudgetDisplay();
        
        showToast(`₱${amount} transferred from savings to budget`, 'success');
        return true;
    }
    
    // === SUCCESS MESSAGE FUNCTIONS (Bottom Part) ===
    function showLoginSuccess() {
        if (loginSuccessMessage) {
            loginSuccessMessage.classList.add('show');
            
            setTimeout(() => {
                loginSuccessMessage.classList.remove('show');
            }, 5000);
        }
        
        if (loginNextSteps) {
            loginNextSteps.classList.add('show');
            
            const checkBudgetStep = document.getElementById('checkBudgetStep');
            const addExpenseStep = document.getElementById('addExpenseStep');
            
            if (checkBudgetStep) {
                checkBudgetStep.addEventListener('click', () => {
                    showPage('dashboard');
                    setTimeout(() => {
                        document.querySelector('.budget-section').scrollIntoView({
                            behavior: 'smooth'
                        });
                    }, 100);
                });
            }
            
            if (addExpenseStep) {
                addExpenseStep.addEventListener('click', () => {
                    showPage('dashboard');
                    setTimeout(() => {
                        document.getElementById('expenseDescription').focus();
                    }, 100);
                });
            }
        }
    }
    
    function showSignupSuccess(username) {
        if (signupSuccessMessage) {
            signupSuccessMessage.classList.add('show');
            const successTitle = signupSuccessMessage.querySelector('h4');
            if (successTitle) {
                successTitle.textContent = `Welcome, ${username}!`;
            }
        }
        
        if (signupProgress) {
            signupProgress.classList.add('show');
            
            const percentageEl = signupProgress.querySelector('.percentage');
            const fillEl = signupProgress.querySelector('.tracker-fill');
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += 2;
                if (progress > 100) {
                    progress = 100;
                    clearInterval(interval);
                    
                    setTimeout(() => {
                        if (welcomeAchievement) {
                            welcomeAchievement.classList.add('show');
                        }
                        
                        setTimeout(() => {
                            if (signupCompletion) {
                                signupCompletion.classList.add('show');
                                
                                const goToDashboardBtn = signupCompletion.querySelector('.go-to-dashboard-btn');
                                if (goToDashboardBtn) {
                                    goToDashboardBtn.addEventListener('click', () => {
                                        signupCompletion.classList.remove('show');
                                        showPage('dashboard');
                                    });
                                }
                            }
                        }, 2000);
                    }, 1000);
                }
                
                percentageEl.textContent = `${progress}%`;
                fillEl.style.width = `${progress}%`;
            }, 30);
        }
    }
    
    function showExpenseSuccess(amount, category) {
        if (expenseSuccessMessage) {
            expenseSuccessMessage.classList.add('show');
            
            const messageContent = expenseSuccessMessage.querySelector('p');
            if (messageContent) {
                messageContent.textContent = `₱${amount.toFixed(2)} logged in ${category}. View insights below.`;
            }
            
            setTimeout(() => {
                expenseSuccessMessage.classList.remove('show');
            }, 5000);
        }
        
        if (expenseTips) {
            expenseTips.classList.add('show');
            
            const tips = expenseTips.querySelectorAll('.step-list li');
            tips.forEach((tip, index) => {
                setTimeout(() => {
                    tip.classList.add('completed');
                }, (index + 1) * 1000);
            });
            
            setTimeout(() => {
                expenseTips.classList.remove('show');
            }, 8000);
        }
        
        const currentMonthSpent = getCurrentMonthSpent();
        const budgetPercentage = (currentMonthSpent / shoppingBudget) * 100;
        
        if (budgetAlert && budgetPercentage > 70) {
            budgetAlert.querySelector('p').textContent = 
                `You've used ${Math.round(budgetPercentage)}% of your monthly budget. Consider waiting for next month.`;
            budgetAlert.classList.add('show');
            
            setTimeout(() => {
                budgetAlert.classList.remove('show');
            }, 10000);
        }
    }
    
    function hideAllSuccessMessages() {
        document.querySelectorAll('.form-success-message.show, .success-steps.show, .progress-tracker.show, .achievement-badge.show, .completion-message.show, .next-steps.show').forEach(el => {
            el.classList.remove('show');
        });
    }
    
    // === INPUT VALIDATION ===
    function setupInputValidation() {
        document.querySelectorAll('.form-control').forEach(input => {
            const icon = input.parentNode.querySelector('.input-icon');
            
            input.addEventListener('input', function() {
                validateInput(this);
            });
            
            input.addEventListener('blur', function() {
                validateInput(this);
            });
        });
        
        const passwordInput = document.getElementById('signupPassword');
        if (passwordInput) {
            const strengthBar = passwordInput.parentNode.querySelector('.strength-bar');
            const strengthText = passwordInput.parentNode.querySelector('.strength-text');
            const passwordTooltip = passwordInput.parentNode.querySelector('.password-tooltip');
            
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value, strengthBar, strengthText);
            });
            
            passwordInput.addEventListener('focus', function() {
                if (passwordTooltip) passwordTooltip.classList.add('show');
            });
            
            passwordInput.addEventListener('blur', function() {
                setTimeout(() => {
                    if (passwordTooltip) passwordTooltip.classList.remove('show');
                }, 200);
            });
        }
        
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', function() {
                const password = document.getElementById('signupPassword').value;
                validateConfirmPassword(this, password);
            });
        }
    }
    
    function validateInput(input) {
        const icon = input.parentNode.querySelector('.input-icon');
        let isValid = true;
        
        input.classList.remove('error', 'success');
        if (icon) icon.classList.remove('error', 'success');
        
        if (input.value.trim() === '') {
            isValid = false;
        } else {
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                }
            }
            
            if (input.id.includes('username') && input.value.length < 3) {
                isValid = false;
            }
            
            if (input.type === 'password' && input.value.length < 6) {
                isValid = false;
            }
        }
        
        if (!isValid && input.value.trim() !== '') {
            input.classList.add('error');
            if (icon) {
                icon.classList.add('error');
                icon.textContent = '!';
            }
        } else if (input.value.trim() !== '') {
            input.classList.add('success');
            if (icon) {
                icon.classList.add('success');
                icon.textContent = '✓';
            }
        }
        
        return isValid;
    }
    
    function updatePasswordStrength(password, strengthBar, strengthText) {
        const lengthCheck = document.getElementById('lengthCheck');
        const uppercaseCheck = document.getElementById('uppercaseCheck');
        const numberCheck = document.getElementById('numberCheck');
        const specialCheck = document.getElementById('specialCheck');
        
        let strength = 0;
        let message = 'Very Weak';
        let color = '#dc3545';
        
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        updateCheckmark(lengthCheck, hasLength);
        updateCheckmark(uppercaseCheck, hasUppercase);
        updateCheckmark(numberCheck, hasNumber);
        updateCheckmark(specialCheck, hasSpecial);
        
        if (hasLength) strength += 25;
        if (hasUppercase) strength += 25;
        if (hasNumber) strength += 25;
        if (hasSpecial) strength += 25;
        
        if (strength >= 75) {
            message = 'Strong';
            color = '#4caf50';
        } else if (strength >= 50) {
            message = 'Good';
            color = '#ff9800';
        } else if (strength >= 25) {
            message = 'Weak';
            color = '#ffc107';
        }
        
        if (strengthBar) {
            strengthBar.style.width = strength + '%';
            strengthBar.style.background = color;
        }
        if (strengthText) {
            strengthText.textContent = message;
            strengthText.style.color = color;
        }
    }
    
    function updateCheckmark(element, isValid) {
        if (element) {
            if (isValid) {
                element.classList.add('checked');
                element.textContent = '✓';
            } else {
                element.classList.remove('checked');
                element.textContent = '⨯';
            }
        }
    }
    
    function validateConfirmPassword(input, password) {
        const icon = input.parentNode.querySelector('.input-icon');
        const errorEl = document.getElementById('confirmPasswordError');
        const successEl = document.getElementById('confirmPasswordSuccess');
        
        if (input.value !== password) {
            input.classList.add('error');
            input.classList.remove('success');
            if (icon) {
                icon.classList.add('error');
                icon.classList.remove('success');
                icon.textContent = '!';
            }
            if (errorEl) errorEl.classList.add('show');
            if (successEl) successEl.classList.remove('show');
            return false;
        } else if (input.value.length > 0) {
            input.classList.remove('error');
            input.classList.add('success');
            if (icon) {
                icon.classList.remove('error');
                icon.classList.add('success');
                icon.textContent = '✓';
            }
            if (errorEl) errorEl.classList.remove('show');
            if (successEl) successEl.classList.add('show');
            return true;
        }
        return false;
    }
    
    // === FORM VALIDATION ===
    function validateLoginForm() {
        const username = document.getElementById('loginUsername');
        const password = document.getElementById('loginPassword');
        let isValid = true;
        
        if (!validateInput(username)) isValid = false;
        if (!validateInput(password)) isValid = false;
        
        if (!isValid) {
            showToast('Please fix the errors in the form', 'error');
        }
        
        return isValid;
    }
    
    function validateSignupForm() {
        const username = document.getElementById('signupUsername');
        const email = document.getElementById('signupEmail');
        const password = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        let isValid = true;
        
        if (!validateInput(username)) isValid = false;
        if (!validateInput(email)) isValid = false;
        if (!validateInput(password)) isValid = false;
        if (!validateConfirmPassword(confirmPassword, password.value)) isValid = false;
        
        if (!isValid) {
            showToast('Please fix the errors in the form', 'error');
        }
        
        return isValid;
    }
    
    function validateExpenseForm() {
        const amount = document.getElementById('expenseAmount');
        const category = document.getElementById('expenseCategory');
        const description = document.getElementById('expenseDescription');
        let isValid = true;
        
        if (!amount.value || parseFloat(amount.value) <= 0) {
            amount.classList.add('error');
            isValid = false;
        }
        
        if (!category.value) {
            category.classList.add('error');
            isValid = false;
        }
        
        if (!description.value.trim()) {
            description.classList.add('error');
            isValid = false;
        }
        
        if (!isValid) {
            showToast('Please fill in all required fields', 'error');
        }
        
        return isValid;
    }
    
    // === FIXED: FORM HANDLERS ===
    async function handleLogin(event) {
        event.preventDefault();
        
        if (!validateLoginForm()) return;
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        showLoading('Signing you in...');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
            // Get all saved users
            const savedUsers = JSON.parse(localStorage.getItem('walletwise_users') || '[]');
            
            // Find the user by username
            const existingUser = savedUsers.find(user => user.username === username);
            
            if (existingUser) {
                // SUCCESS: User found!
                currentUser = {
                    username: username,
                    email: existingUser.email || `${username}@example.com`,
                    joinedDate: existingUser.joinedDate || new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                
                // Update last login in the users array
                const updatedUsers = savedUsers.map(user => {
                    if (user.username === username) {
                        return { ...user, lastLogin: new Date().toISOString() };
                    }
                    return user;
                });
                localStorage.setItem('walletwise_users', JSON.stringify(updatedUsers));
                
                // Save as current session
                localStorage.setItem('walletwise_current_user', JSON.stringify(currentUser));
                
                hideLoading();
                showLoginSuccess();
                showToast(`Welcome back, ${username}!`, 'success');
                showWelcomeAnimation(username);
                
                loginForm.reset();
                
                setTimeout(() => {
                    showPage('dashboard');
                    loadAllData();
                }, 3200);
            } else {
                // If we get here, login failed
                hideLoading();
                showToast('Username not found. Please sign up first or check your username.', 'error');
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }
            
        } catch (error) {
            hideLoading();
            showToast('An error occurred. Please try again.', 'error');
            console.error('Login error:', error);
        }
    }
    
    async function handleSignup(event) {
        event.preventDefault();
        
        if (!validateSignupForm()) return;
        
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        
        showLoading('Creating your account...');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            // Get all saved users
            const savedUsers = JSON.parse(localStorage.getItem('walletwise_users') || '[]');
            
            // Check if username already exists
            const existingUser = savedUsers.find(user => user.username === username);
            
            if (existingUser) {
                hideLoading();
                showToast('Username already taken. Please choose another.', 'error');
                const usernameInput = document.getElementById('signupUsername');
                usernameInput.classList.add('error');
                return;
            }
            
            // Create new user
            currentUser = {
                username: username,
                email: email,
                joinedDate: new Date().toISOString(),
                recoveryStart: new Date().toISOString(),
                initialBudget: shoppingBudget,
                achievements: ['first_account']
            };
            
            // Add to users array
            savedUsers.push(currentUser);
            localStorage.setItem('walletwise_users', JSON.stringify(savedUsers));
            
            // Save as current session
            localStorage.setItem('walletwise_current_user', JSON.stringify(currentUser));
            
            hideLoading();
            showSignupSuccess(username);
            showSuccess(
                `Congratulations, ${username}! 🎊\n\nYou've taken the first step towards financial freedom. Your journey to control online shopping starts now!\n\nYour monthly shopping budget is set to ₱${shoppingBudget}.`,
                'Start My Journey'
            );
            
            signupForm.reset();
            document.querySelectorAll('.checkmark').forEach(el => {
                el.classList.remove('checked');
                el.textContent = '⨯';
            });
            document.querySelector('.strength-bar').style.width = '0%';
            document.querySelector('.strength-text').textContent = '';
            
        } catch (error) {
            hideLoading();
            showToast('An error occurred during signup. Please try again.', 'error');
            console.error('Signup error:', error);
        }
    }
    
    async function handleAddExpense(event) {
        event.preventDefault();
        
        if (!validateExpenseForm()) return;
        
        // Check if time block is active
        if (checkTimeBlock()) {
            const proceed = confirm("⏰ Time Block Active!\n\nYou're in a high-risk shopping period. Are you sure you want to make this purchase?\n\nConsider waiting until the time block ends.");
            if (!proceed) {
                showToast('Purchase cancelled due to active time block.', 'warning');
                return;
            }
        }
        
        const date = document.getElementById('expenseDate').value;
        const platform = document.getElementById('shoppingPlatform').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDescription').value.trim();
        const purchaseType = document.getElementById('purchaseType').value;
        
        // Check if impulse purchase - suggest adding to 24-hour list
        if (purchaseType === 'impulse' || purchaseType === 'emotional') {
            const addToPending = confirm(`⚠️ Impulse/Emotional Purchase Detected!\n\nConsider adding this to your 24-hour waiting list:\n\n${description} - ₱${amount}\n\nAdd to 24-hour list instead of buying now?`);
            
            if (addToPending) {
                addPendingItem(description, platform, amount);
                expenseForm.reset();
                document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
                showToast('Item added to 24-hour waiting list! Think about it for a day.', 'success');
                return;
            }
        }
        
        const currentMonthSpent = getCurrentMonthSpent();
        if (currentMonthSpent + amount > shoppingBudget) {
            const proceed = await showBudgetWarning(currentMonthSpent, amount);
            if (!proceed) return;
        }
        
        showLoading('Adding expense...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newExpense = {
            id: Date.now(),
            date: date,
            platform: platform,
            description: description,
            category: category,
            amount: amount,
            purchaseType: purchaseType,
            loggedAt: new Date().toISOString()
        };
        
        addExpense(newExpense);
        
        // Update progress stats for impulse purchases
        if (purchaseType === 'impulse' || purchaseType === 'emotional') {
            progressStats.lastImpulseBuy = new Date().toISOString();
            saveProgressStats();
        }
        
        // Auto-add savings for planned purchases over ₱500
        if (purchaseType === 'planned' && amount > 500) {
            const savingsAmount = Math.round(amount * 0.1);
            addSavingsEntry(savingsAmount, 'budget_leftover', `10% of planned purchase: ${description}`);
        }
        
        hideLoading();
        
        let message = '';
        let type = 'info';
        
        switch(purchaseType) {
            case 'impulse':
                message = `Impulse purchase logged. Consider the 24-hour rule next time!`;
                type = 'warning';
                break;
            case 'emotional':
                message = `Emotional purchase noted. Remember, shopping isn't a solution.`;
                type = 'warning';
                break;
            case 'planned':
                message = `Planned purchase logged. Great discipline!`;
                type = 'success';
                break;
            default:
                message = `Purchase logged successfully`
        }
        
        showExpenseSuccess(amount, getCategoryName(category));
        showToast(`${message} (₱${amount.toFixed(2)})`, type);
        
        expenseForm.classList.add('pulse');
        setTimeout(() => {
            expenseForm.reset();
            document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
            expenseForm.classList.remove('pulse');
        }, 500);
    }
    
    async function showBudgetWarning(currentSpent, newAmount) {
        return new Promise((resolve) => {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'success-celebration';
            warningDiv.innerHTML = `
                <div class="success-icon" style="color: #ff9800;">⚠️</div>
                <h2 style="color: #ff9800; margin-bottom: 10px;">Budget Warning!</h2>
                <p style="color: #666; margin-bottom: 20px; text-align: center;">
                    This purchase will exceed your monthly budget:<br><br>
                    <strong style="font-size: 24px; color: #dc3545;">₱${(currentSpent + newAmount).toFixed(2)} / ₱${shoppingBudget}</strong><br><br>
                    Current spent: ₱${currentSpent.toFixed(2)}<br>
                    This purchase: ₱${newAmount.toFixed(2)}
                </p>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-warning" id="proceedBtn" style="flex: 1;">Proceed Anyway</button>
                    <button class="btn" id="cancelBtn" style="flex: 1; background: #f0f0f0; color: #333;">Cancel</button>
                </div>
            `;
            
            document.body.appendChild(warningDiv);
            warningDiv.classList.add('active');
            
            document.getElementById('proceedBtn').onclick = () => {
                warningDiv.remove();
                resolve(true);
            };
            
            document.getElementById('cancelBtn').onclick = () => {
                warningDiv.remove();
                resolve(false);
            };
        });
    }
    
    // === EXPENSE MANAGEMENT ===
    function addExpense(expense) {
        expenses.push(expense);
        updateExpenseTable();
        updateShoppingInsights();
        updateBudgetDisplay();
        saveExpenses();
        
        const rows = document.querySelectorAll('#expenseTableBody tr');
        if (rows.length > 0) {
            const newRow = rows[0];
            newRow.style.backgroundColor = '#f0fff4';
            setTimeout(() => {
                newRow.style.backgroundColor = '';
            }, 1000);
        }
    }
    
    function deleteExpense(id) {
        const expense = expenses.find(e => e.id === id);
        if (!expense) return;
        
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'success-celebration';
        confirmDiv.innerHTML = `
            <div class="success-icon" style="color: #dc3545;">🗑️</div>
            <h2 style="color: #dc3545; margin-bottom: 10px;">Delete Expense?</h2>
            <p style="color: #666; margin-bottom: 20px; text-align: center;">
                Are you sure you want to delete this expense?<br><br>
                <strong>${expense.description}</strong><br>
                <span style="color: #dc3545; font-size: 20px;">₱${expense.amount.toFixed(2)}</span>
            </p>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-danger" id="confirmDeleteBtn" style="flex: 1;">Delete</button>
                <button class="btn" id="cancelDeleteBtn" style="flex: 1; background: #f0f0f0; color: #333;">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(confirmDiv);
        confirmDiv.classList.add('active');
        
        document.getElementById('confirmDeleteBtn').onclick = () => {
            expenses = expenses.filter(expense => expense.id !== id);
            updateExpenseTable();
            updateShoppingInsights();
            updateBudgetDisplay();
            saveExpenses();
            
            confirmDiv.remove();
            showToast('Expense deleted successfully', 'success');
        };
        
        document.getElementById('cancelDeleteBtn').onclick = () => {
            confirmDiv.remove();
        };
    }
    
    function updateExpenseTable() {
        if (!expenseTableBody) return;
        
        if (expenses.length === 0) {
            expenseTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                        No shopping expenses logged yet. Log your first expense below!
                    </td>
                </tr>
            `;
            return;
        }
        
        const sortedExpenses = [...expenses].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        expenseTableBody.innerHTML = sortedExpenses.map(expense => `
            <tr data-id="${expense.id}">
                <td>${formatDate(expense.date)}</td>
                <td>${getPlatformName(expense.platform)}</td>
                <td>${expense.description}</td>
                <td><span class="category-badge">${getCategoryName(expense.category)}</span></td>
                <td><strong>₱${expense.amount.toFixed(2)}</strong></td>
                <td>${getPurchaseTypeBadge(expense.purchaseType)}</td>
                <td>
                    <button class="delete-btn" data-id="${expense.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteExpense(id);
            });
        });
    }
    
    function filterExpensesByCategory(category) {
        const rows = document.querySelectorAll('#expenseTableBody tr');
        
        rows.forEach(row => {
            if (category === 'all') {
                row.style.display = '';
            } else {
                const categoryCell = row.querySelector('.category-badge');
                if (categoryCell) {
                    const rowCategory = categoryCell.textContent.toLowerCase();
                    if (rowCategory.includes(category)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            }
        });
    }
    
    // === SHOPPING INSIGHTS ===
    function updateShoppingInsights() {
        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        if (totalExpensesElement) {
            totalExpensesElement.textContent = totalSpent.toFixed(2);
        }
        
        const impulsePurchases = expenses.filter(e => e.purchaseType === 'impulse');
        const impulseTotal = impulsePurchases.reduce((sum, expense) => sum + expense.amount, 0);
        const savedAmount = impulseTotal * 0.4;
        
        if (savedAmountElement) {
            savedAmountElement.textContent = `₱${savedAmount.toFixed(0)}`;
        }
        
        const shoppingPatternElement = document.getElementById('shoppingPattern');
        const emotionalTriggersElement = document.getElementById('emotionalTriggers');
        const reductionPercentElement = document.getElementById('reductionPercent');
        
        if (shoppingPatternElement) {
            if (expenses.length === 0) {
                shoppingPatternElement.innerHTML = `Start logging expenses to see your shopping patterns`;
            } else {
                shoppingPatternElement.innerHTML = `You shop most on <strong>${getMostCommonShoppingDay()}</strong> between <strong>${getMostCommonShoppingTime()}</strong>`;
            }
        }
        
        if (emotionalTriggersElement) {
            if (expenses.length === 0) {
                emotionalTriggersElement.innerHTML = `Log expenses to identify your shopping triggers`;
            } else {
                emotionalTriggersElement.innerHTML = `${getImpulsePercentage()}% of your impulse buys occur when you're <strong>bored</strong> or <strong>stressed</strong>`;
            }
        }
        
        if (reductionPercentElement) {
            if (expenses.length < 2) {
                reductionPercentElement.textContent = `0%`;
            } else {
                reductionPercentElement.textContent = `${calculateReductionPercentage()}%`;
            }
        }
    }
    
    // === SAVINGS WALLET FUNCTIONS ===
    function updateSavingsDisplay() {
        // Update balance
        if (document.getElementById('savingsBalance')) {
            document.getElementById('savingsBalance').textContent = `₱${savings.balance.toFixed(0)}`;
        }
        
        // Update percentage
        const percentage = savings.goal > 0 ? Math.min(100, (savings.balance / savings.goal) * 100) : 0;
        if (document.getElementById('savingsPercentage')) {
            document.getElementById('savingsPercentage').textContent = `${Math.round(percentage)}%`;
        }
        
        // Update goal display
        if (document.getElementById('savingsGoalAmount')) {
            document.getElementById('savingsGoalAmount').textContent = `₱${savings.goal.toFixed(0)}`;
        }
        if (document.getElementById('savingsGoal')) {
            document.getElementById('savingsGoal').textContent = `₱${savings.goal.toFixed(0)}`;
        }
        
        // Update progress bar
        if (document.getElementById('goalProgressFill')) {
            document.getElementById('goalProgressFill').style.width = `${percentage}%`;
        }
        
        // Update growth
        const thisMonthGrowth = calculateThisMonthSavings();
        if (document.getElementById('savingsGrowth')) {
            document.getElementById('savingsGrowth').textContent = `+₱${thisMonthGrowth} this month`;
        }
        
        // Update history list
        updateSavingsHistory();
        
        // Update achievements
        updateSavingsAchievements();
        
        // Save to localStorage
        saveSavings();
    }
    
    function calculateThisMonthSavings() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return savings.history.reduce((total, entry) => {
            const entryDate = new Date(entry.date);
            if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
                return total + entry.amount;
            }
            return total;
        }, 0);
    }
    
    function updateSavingsHistory() {
        const savingsList = document.getElementById('savingsList');
        if (!savingsList) return;
        
        if (savings.history.length === 0) {
            savingsList.innerHTML = `
                <div class="empty-savings">
                    <p>No savings yet. Start by avoiding impulse purchases!</p>
                </div>
            `;
            return;
        }
        
        const recentSavings = savings.history.slice(-5).reverse();
        savingsList.innerHTML = recentSavings.map(entry => `
            <div class="savings-item">
                <div class="savings-item-info">
                    <h5>${entry.description}</h5>
                    <p>${formatDate(entry.date)} • ${getSavingsSource(entry.source)}</p>
                </div>
                <div class="savings-item-amount">${entry.amount >= 0 ? '+' : ''}₱${Math.abs(entry.amount).toFixed(0)}</div>
            </div>
        `).join('');
    }
    
    function getSavingsSource(source) {
        const sources = {
            'impulse_avoided': 'Impulse Avoided',
            'budget_leftover': 'Budget Leftover',
            'budget_transfer': 'Budget Transfer',
            'extra_income': 'Extra Income',
            'cashback': 'Cashback',
            'other': 'Other'
        };
        return sources[source] || source;
    }
    
    function updateSavingsAchievements() {
        const achievementsGrid = document.getElementById('savingsAchievements');
        if (!achievementsGrid) return;
        
        // Check achievements
        const achievements = [
            { id: 'first_1000', icon: '🏦', title: 'First ₱1,000', desc: 'Save your first ₱1,000', condition: savings.balance >= 1000 },
            { id: 'goal_reached', icon: '🎯', title: 'Goal Reached', desc: 'Reach your savings goal', condition: savings.balance >= savings.goal },
            { id: 'consistent_saver', icon: '📈', title: 'Consistent Saver', desc: 'Save for 30 days straight', condition: checkConsistentSavings() }
        ];
        
        achievementsGrid.innerHTML = achievements.map(achievement => `
            <div class="achievement-item ${achievement.condition ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <h5>${achievement.title}</h5>
                    <p>${achievement.desc}</p>
                </div>
            </div>
        `).join('');
    }
    
    function checkConsistentSavings() {
        if (savings.history.length < 7) return false;
        
        const dates = savings.history.map(entry => new Date(entry.date).toDateString());
        const uniqueDates = [...new Set(dates)];
        
        return uniqueDates.length >= 30;
    }
    
    function addSavingsEntry(amount, source, description) {
        const newEntry = {
            id: Date.now(),
            amount: amount,
            source: source,
            description: description || `Added to savings`,
            date: new Date().toISOString().split('T')[0]
        };
        
        savings.balance += amount;
        savings.history.push(newEntry);
        
        // Update progress stats
        progressStats.totalSaved += amount;
        saveProgressStats();
        
        updateSavingsDisplay();
        
        // Check for automatic savings from avoided impulse purchases
        if (source === 'impulse_avoided') {
            showToast(`Great! ₱${amount} saved from avoiding impulse purchase!`, 'success');
        }
    }
    
    function setupSavingsModals() {
        const savingsModal = document.querySelector('.savings-modal');
        const goalModal = document.querySelector('.goal-modal');
        const addSavingsBtn = document.getElementById('addSavingsBtn');
        const setGoalBtn = document.getElementById('setGoalBtn');
        const closeModalBtns = document.querySelectorAll('.close-modal, .close-goal-modal, #cancelSavings, #cancelGoal');
        const confirmSavingsBtn = document.getElementById('confirmSavings');
        const confirmGoalBtn = document.getElementById('confirmGoal');
        
        // Open Add Savings Modal
        if (addSavingsBtn) {
            addSavingsBtn.addEventListener('click', () => {
                savingsModal.classList.add('active');
                document.getElementById('savingsAmount').focus();
            });
        }
        
        // Open Set Goal Modal
        if (setGoalBtn) {
            setGoalBtn.addEventListener('click', () => {
                document.getElementById('goalAmount').value = savings.goal;
                document.getElementById('goalPurpose').value = savings.goalPurpose;
                if (savings.goalDeadline) {
                    document.getElementById('goalDeadline').value = savings.goalDeadline;
                }
                goalModal.classList.add('active');
            });
        }
        
        // Close modals
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                savingsModal.classList.remove('active');
                goalModal.classList.remove('active');
            });
        });
        
        // Confirm Add Savings
        if (confirmSavingsBtn) {
            confirmSavingsBtn.addEventListener('click', () => {
                const amount = parseFloat(document.getElementById('savingsAmount').value);
                const source = document.getElementById('savingsSource').value;
                const description = document.getElementById('savingsDescription').value;
                
                if (!amount || amount <= 0) {
                    showToast('Please enter a valid amount', 'error');
                    return;
                }
                
                addSavingsEntry(amount, source, description);
                
                // Reset form
                document.getElementById('savingsAmount').value = '';
                document.getElementById('savingsDescription').value = '';
                
                savingsModal.classList.remove('active');
                showToast(`₱${amount.toFixed(0)} added to your savings wallet!`, 'success');
            });
        }
        
        // Confirm Set Goal
        if (confirmGoalBtn) {
            confirmGoalBtn.addEventListener('click', () => {
                const goal = parseFloat(document.getElementById('goalAmount').value);
                const deadline = document.getElementById('goalDeadline').value;
                const purpose = document.getElementById('goalPurpose').value;
                
                if (!goal || goal <= 0) {
                    showToast('Please enter a valid goal amount', 'error');
                    return;
                }
                
                savings.goal = goal;
                savings.goalDeadline = deadline;
                savings.goalPurpose = purpose;
                
                updateSavingsDisplay();
                goalModal.classList.remove('active');
                
                showToast(`Savings goal updated to ₱${goal.toFixed(0)}!`, 'success');
            });
        }
    }
    
    // === HELPER FUNCTIONS ===
    function getPlatformName(platform) {
        const platforms = {
            'shopee': 'Shopee',
            'lazada': 'Lazada',
            'amazon': 'Amazon',
            'foodpanda': 'FoodPanda',
            'grab': 'GrabFood',
            'other': 'Other'
        };
        return platforms[platform] || platform;
    }
    
    function getCategoryName(category) {
        const categories = {
            'fashion': '👗 Fashion',
            'electronics': '📱 Electronics',
            'food': '🍔 Food',
            'gaming': '🎮 Gaming',
            'home': '🏠 Home',
            'beauty': '💄 Beauty',
            'other': 'Other'
        };
        return categories[category] || category;
    }
    
    function getPurchaseTypeBadge(type) {
        const badges = {
            'planned': '<span style="color: #4caf50; font-weight: bold;">✅ Planned</span>',
            'impulse': '<span style="color: #dc3545; font-weight: bold;">⚠️ Impulse</span>',
            'emotional': '<span style="color: #ff9800; font-weight: bold;">😔 Emotional</span>',
            'necessary': '<span style="color: #2196f3; font-weight: bold;">📋 Necessary</span>'
        };
        return badges[type] || type;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
        });
    }
    
    function getCurrentMonthSpent() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return expenses.reduce((total, expense) => {
            const expenseDate = new Date(expense.date);
            if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
                return total + expense.amount;
            }
            return total;
        }, 0);
    }
    
    function getMostCommonShoppingDay() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            dayCounts[date.getDay()] += expense.amount;
        });
        
        const maxIndex = dayCounts.indexOf(Math.max(...dayCounts));
        return days[maxIndex];
    }
    
    function getMostCommonShoppingTime() {
        return '8-11 PM';
    }
    
    function getImpulsePercentage() {
        const impulseCount = expenses.filter(e => e.purchaseType === 'impulse').length;
        const totalCount = expenses.length;
        
        if (totalCount === 0) return 0;
        return Math.round((impulseCount / totalCount) * 100);
    }
    
    function calculateReductionPercentage() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        const thisMonthImpulse = expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === now.getMonth() && 
                   expenseDate.getFullYear() === now.getFullYear() &&
                   e.purchaseType === 'impulse';
        }).length;
        
        const lastMonthImpulse = expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === lastMonth.getMonth() && 
                   expenseDate.getFullYear() === lastMonth.getFullYear() &&
                   e.purchaseType === 'impulse';
        }).length;
        
        if (lastMonthImpulse === 0) return 0;
        return Math.round(((lastMonthImpulse - thisMonthImpulse) / lastMonthImpulse) * 100);
    }
    
    // === PAGE NAVIGATION ===
    function showPage(pageName) {
        hideAllSuccessMessages();
        
        Object.values(pages).forEach(page => {
            if (page) page.classList.remove('active');
        });
        
        if (pages[pageName]) {
            pages[pageName].classList.add('active');
        }
        
        updateHeaderButtons();
        
        if (pageName === 'dashboard') {
            if (currentUser) {
                // Load data if not already loaded
                loadAllData();
                updateUserDisplay();
                updateExpenseTable();
                updateShoppingInsights();
                updateBudgetDisplay();
                updateSavingsDisplay();
                updatePendingCartDisplay();
                updateTimeBlockDisplay();
                updateProgressDisplay();
                
                // Show empty state guide only if user has no data
                const emptyStateGuide = document.getElementById('emptyStateGuide');
                if (emptyStateGuide) {
                    if (expenses.length === 0 && savings.balance === 0 && pendingItems.length === 0) {
                        emptyStateGuide.style.display = 'block';
                    } else {
                        emptyStateGuide.style.display = 'none';
                    }
                }
            } else {
                // If no user is logged in, go to login page
                showPage('login');
            }
        }
    }
    
    function updateHeaderButtons() {
        if (currentUser) {
            navButtons.innerHTML = `
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-login" id="goToDashboardBtn">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </button>
                    <button class="btn btn-signup" id="headerLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Log Out
                    </button>
                </div>
            `;
            
            const dashboardBtn = document.getElementById('goToDashboardBtn');
            const logoutBtn = document.getElementById('headerLogoutBtn');
            
            if (dashboardBtn) dashboardBtn.addEventListener('click', () => showPage('dashboard'));
            if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
            
        } else {
            if (pages.landing.classList.contains('active')) {
                navButtons.innerHTML = `
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-login" id="headerLoginBtn">
                            <i class="fas fa-sign-in-alt"></i> Log In
                        </button>
                        <button class="btn btn-signup" id="headerSignupBtn">
                            <i class="fas fa-user-plus"></i> Sign Up
                        </button>
                    </div>
                `;
            } else {
                navButtons.innerHTML = `
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-login" id="headerHomeBtn">
                            <i class="fas fa-home"></i> Home
                        </button>
                    </div>
                `;
            }
            
            setTimeout(() => {
                const loginBtn = document.getElementById('headerLoginBtn');
                const signupBtn = document.getElementById('headerSignupBtn');
                const homeBtn = document.getElementById('headerHomeBtn');
                
                if (loginBtn) loginBtn.addEventListener('click', () => showPage('login'));
                if (signupBtn) signupBtn.addEventListener('click', () => showPage('signup'));
                if (homeBtn) homeBtn.addEventListener('click', () => showPage('landing'));
            }, 100);
        }
    }
    
    function updateUserDisplay() {
        if (currentUser && document.getElementById('dashboardUsername')) {
            document.getElementById('dashboardUsername').textContent = currentUser.username;
        }
    }
    
    // === EVENT HANDLERS ===
    function handleLogout() {
        if (confirm('Are you sure you want to log out?\n\nRemember: Your progress is saved and you can continue your journey anytime.')) {
            currentUser = null;
            localStorage.removeItem('walletwise_current_user');
            showPage('landing');
            showToast("See you soon! Keep making smart spending choices!", 'info');
        }
    }
    
    // === NEW: BUDGET & TRANSFER MODALS ===
    function setupBudgetAndTransferModals() {
        const closeBudgetModal = document.querySelector('.close-budget-modal');
        const closeTransferModal = document.querySelector('.close-transfer-modal');
        const cancelBudget = document.getElementById('cancelBudget');
        const cancelTransfer = document.getElementById('cancelTransfer');
        const confirmBudget = document.getElementById('confirmBudget');
        const confirmTransfer = document.getElementById('confirmTransfer');
        
        // Open Budget Modal
        if (editBudgetBtn) {
            editBudgetBtn.addEventListener('click', openBudgetModal);
        }
        
        if (setBudgetBtn) {
            setBudgetBtn.addEventListener('click', openBudgetModal);
        }
        
        function openBudgetModal() {
            document.getElementById('newBudgetAmount').value = shoppingBudget;
            budgetModal.classList.add('active');
            document.getElementById('newBudgetAmount').focus();
        }
        
        // Open Transfer Modal
        if (transferFromSavingsBtn) {
            transferFromSavingsBtn.addEventListener('click', () => {
                updateBudgetModals(); // Update the display first
                transferModal.classList.add('active');
                document.getElementById('transferAmount').focus();
            });
        }
        
        // Close modals
        if (closeBudgetModal) {
            closeBudgetModal.addEventListener('click', () => {
                budgetModal.classList.remove('active');
            });
        }
        
        if (closeTransferModal) {
            closeTransferModal.addEventListener('click', () => {
                transferModal.classList.remove('active');
            });
        }
        
        if (cancelBudget) {
            cancelBudget.addEventListener('click', () => {
                budgetModal.classList.remove('active');
            });
        }
        
        if (cancelTransfer) {
            cancelTransfer.addEventListener('click', () => {
                transferModal.classList.remove('active');
            });
        }
        
        // Confirm Budget Update
        if (confirmBudget) {
            confirmBudget.addEventListener('click', () => {
                const newBudget = parseFloat(document.getElementById('newBudgetAmount').value);
                
                if (!newBudget || newBudget < 1000) {
                    showToast('Please enter a valid budget (minimum ₱1,000)', 'error');
                    return;
                }
                
                if (setNewBudget(newBudget)) {
                    budgetModal.classList.remove('active');
                    document.getElementById('newBudgetAmount').value = '';
                }
            });
        }
        
        // Confirm Transfer
        if (confirmTransfer) {
            confirmTransfer.addEventListener('click', () => {
                const amount = parseFloat(document.getElementById('transferAmount').value);
                const reason = document.getElementById('transferReason').value || 'Transferred to budget';
                
                if (!amount || amount <= 0) {
                    showToast('Please enter a valid amount', 'error');
                    return;
                }
                
                if (transferFromSavings(amount, reason)) {
                    transferModal.classList.remove('active');
                    document.getElementById('transferAmount').value = '';
                    document.getElementById('transferReason').value = '';
                }
            });
        }
    }
    
    function setupNewFeatureModals() {
        // 24-Hour Pending Modal
        const closePendingModal = document.querySelector('.close-pending-modal');
        const buyAllBtn = document.getElementById('buyAllBtn');
        const removeAllBtn = document.getElementById('removeAllBtn');
        
        if (cartReviewBtn) {
            cartReviewBtn.addEventListener('click', () => {
                updatePendingItemsDisplay();
                pendingModal.classList.add('active');
            });
        }
        
        if (closePendingModal) {
            closePendingModal.addEventListener('click', () => {
                pendingModal.classList.remove('active');
            });
        }
        
        if (buyAllBtn) {
            buyAllBtn.addEventListener('click', () => {
                // Buy all pending items
                const itemsToBuy = [...pendingItems];
                pendingItems = [];
                
                itemsToBuy.forEach(item => {
                    const newExpense = {
                        id: Date.now(),
                        date: new Date().toISOString().split('T')[0],
                        platform: item.platform,
                        description: item.description,
                        category: 'other',
                        amount: item.amount,
                        purchaseType: 'planned',
                        loggedAt: new Date().toISOString()
                    };
                    
                    addExpense(newExpense);
                });
                
                updatePendingCartDisplay();
                savePendingItems();
                updatePendingItemsDisplay();
                
                showToast(`All ${itemsToBuy.length} items purchased!`, 'success');
            });
        }
        
        if (removeAllBtn) {
            removeAllBtn.addEventListener('click', () => {
                if (pendingItems.length === 0) return;
                
                const totalAmount = pendingItems.reduce((sum, item) => sum + item.amount, 0);
                const savingsAmount = Math.round(totalAmount * 0.4);
                
                // Remove all items and add savings
                pendingItems = [];
                updatePendingCartDisplay();
                savePendingItems();
                updatePendingItemsDisplay();
                
                addSavingsEntry(savingsAmount, 'impulse_avoided', `Avoided ${pendingItems.length} impulse purchases`);
                
                showToast(`All items removed! ₱${savingsAmount} added to savings!`, 'success');
            });
        }
        
        // Time Block Modal
        const closeTimeblockModal = document.querySelector('.close-timeblock-modal');
        const activateBlockBtn = document.getElementById('activateBlockBtn');
        const deactivateBlockBtn = document.getElementById('deactivateBlockBtn');
        const blockStart = document.getElementById('blockStart');
        const blockEnd = document.getElementById('blockEnd');
        const dayButtons = document.querySelectorAll('.day-btn');
        
        if (timeBlockBtn) {
            timeBlockBtn.addEventListener('click', () => {
                updateTimeBlockDisplay();
                timeblockModal.classList.add('active');
            });
        }
        
        if (closeTimeblockModal) {
            closeTimeblockModal.addEventListener('click', () => {
                timeblockModal.classList.remove('active');
            });
        }
        
        if (activateBlockBtn) {
            activateBlockBtn.addEventListener('click', () => {
                timeBlockSettings.active = true;
                
                // Update settings from form
                if (blockStart) timeBlockSettings.startTime = blockStart.value;
                if (blockEnd) timeBlockSettings.endTime = blockEnd.value;
                
                // Update days from buttons
                const activeDays = [];
                dayButtons.forEach(btn => {
                    if (btn.classList.contains('active')) {
                        activeDays.push(parseInt(btn.dataset.day));
                    }
                });
                timeBlockSettings.days = activeDays;
                
                // Update checkboxes
                const blockEvening = document.getElementById('blockEvening');
                const blockLateNight = document.getElementById('blockLateNight');
                const blockWeekends = document.getElementById('blockWeekends');
                
                if (blockEvening) timeBlockSettings.blockEvening = blockEvening.checked;
                if (blockLateNight) timeBlockSettings.blockLateNight = blockLateNight.checked;
                if (blockWeekends) timeBlockSettings.blockWeekends = blockWeekends.checked;
                
                saveTimeBlockSettings();
                updateTimeBlockDisplay();
                
                showToast('Time block protection activated! 🛡️', 'success');
            });
        }
        
        if (deactivateBlockBtn) {
            deactivateBlockBtn.addEventListener('click', () => {
                timeBlockSettings.active = false;
                saveTimeBlockSettings();
                updateTimeBlockDisplay();
                
                showToast('Time block protection deactivated.', 'info');
            });
        }
        
        // Day button toggles
        dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
            });
        });
        
        // Progress Modal
        const closeProgressModal = document.querySelector('.close-progress-modal');
        
        if (progressBtn) {
            progressBtn.addEventListener('click', () => {
                updateProgressDisplay();
                progressModal.classList.add('active');
            });
        }
        
        if (closeProgressModal) {
            closeProgressModal.addEventListener('click', () => {
                progressModal.classList.remove('active');
            });
        }
    }
    
    function setupEventListeners() {
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => showPage('signup'));
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', handleSignup);
        }
        
        if (expenseForm) {
            expenseForm.addEventListener('submit', handleAddExpense);
        }
        
        if (goToSignupLink) {
            goToSignupLink.addEventListener('click', (event) => {
                event.preventDefault();
                showPage('signup');
            });
        }
        
        if (goToLoginLink) {
            goToLoginLink.addEventListener('click', (event) => {
                event.preventDefault();
                showPage('login');
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                successCelebration.classList.remove('active');
            });
        }
        
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('click', function() {
                document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                filterExpensesByCategory(this.dataset.category);
            });
        });
        
        // Setup all modals
        setupNewFeatureModals();
        setupSavingsModals();
        setupBudgetAndTransferModals();
    }
    
    // === DATA PERSISTENCE ===
    function loadExpenses() {
        if (currentUser) {
            const saved = localStorage.getItem(`walletwise_expenses_${currentUser.username}`);
            if (saved) {
                try {
                    expenses = JSON.parse(saved);
                } catch (error) {
                    console.error("Error loading expenses:", error);
                    expenses = [];
                }
            }
        }
    }
    
    function saveExpenses() {
        if (currentUser) {
            localStorage.setItem(`walletwise_expenses_${currentUser.username}`, JSON.stringify(expenses));
        }
    }
    
    function loadSavings() {
        if (currentUser) {
            const saved = localStorage.getItem(`walletwise_savings_${currentUser.username}`);
            if (saved) {
                try {
                    savings = JSON.parse(saved);
                } catch (error) {
                    console.error("Error loading savings:", error);
                    savings = {
                        balance: 0,
                        goal: 10000,
                        goalDeadline: null,
                        goalPurpose: "Emergency Fund",
                        history: [],
                        achievements: []
                    };
                }
            }
        }
    }
    
    function saveSavings() {
        if (currentUser) {
            localStorage.setItem(`walletwise_savings_${currentUser.username}`, JSON.stringify(savings));
        }
    }
    
    function loadPendingItems() {
        if (currentUser) {
            const saved = localStorage.getItem(`walletwise_pending_${currentUser.username}`);
            if (saved) {
                try {
                    pendingItems = JSON.parse(saved);
                } catch (error) {
                    console.error("Error loading pending items:", error);
                    pendingItems = [];
                }
            }
        }
    }
    
    function savePendingItems() {
        if (currentUser) {
            localStorage.setItem(`walletwise_pending_${currentUser.username}`, JSON.stringify(pendingItems));
        }
    }
    
    function loadTimeBlockSettings() {
        if (currentUser) {
            const saved = localStorage.getItem(`walletwise_timeblock_${currentUser.username}`);
            if (saved) {
                try {
                    timeBlockSettings = JSON.parse(saved);
                } catch (error) {
                    console.error("Error loading time block settings:", error);
                    timeBlockSettings = {
                        active: false,
                        startTime: "20:00",
                        endTime: "23:00",
                        days: [0, 1, 2, 3, 4, 5, 6],
                        blockEvening: true,
                        blockLateNight: false,
                        blockWeekends: false
                    };
                }
            }
        }
    }
    
    function saveTimeBlockSettings() {
        if (currentUser) {
            localStorage.setItem(`walletwise_timeblock_${currentUser.username}`, JSON.stringify(timeBlockSettings));
        }
    }
    
    function loadProgressStats() {
        if (currentUser) {
            const saved = localStorage.getItem(`walletwise_progress_${currentUser.username}`);
            if (saved) {
                try {
                    progressStats = JSON.parse(saved);
                } catch (error) {
                    console.error("Error loading progress stats:", error);
                    progressStats = {
                        lastImpulseBuy: null,
                        totalSaved: 0,
                        impulseReduction: 0,
                        streakDays: 0
                    };
                }
            }
        }
    }
    
    function saveProgressStats() {
        if (currentUser) {
            localStorage.setItem(`walletwise_progress_${currentUser.username}`, JSON.stringify(progressStats));
        }
    }
    
    function loadBudget() {
        if (currentUser) {
            const saved = localStorage.getItem(`walletwise_budget_${currentUser.username}`);
            if (saved) {
                try {
                    shoppingBudget = JSON.parse(saved);
                } catch (error) {
                    console.error("Error loading budget:", error);
                    shoppingBudget = 15000;
                }
            }
        }
    }
    
    function saveBudget() {
        if (currentUser) {
            localStorage.setItem(`walletwise_budget_${currentUser.username}`, JSON.stringify(shoppingBudget));
        }
    }
    
    function loadAllData() {
        if (!currentUser) return;
        
        console.log("📂 Loading all data for user:", currentUser.username);
        
        loadExpenses();
        loadSavings();
        loadPendingItems();
        loadTimeBlockSettings();
        loadProgressStats();
        loadBudget(); // NEW: Load budget
        
        console.log("✅ Data loaded successfully");
        console.log("Expenses:", expenses.length);
        console.log("Savings:", savings.balance);
        console.log("Pending items:", pendingItems.length);
        console.log("Budget:", shoppingBudget);
    }
    
    // === INITIALIZATION - FIXED VERSION ===
    function initApp() {
        console.log("🚀 Initializing WalletWise...");
        
        // Check if user is already logged in from current session
        const savedCurrentUser = localStorage.getItem('walletwise_current_user');
        console.log("🔍 Checking saved current user:", savedCurrentUser);
        
        if (savedCurrentUser) {
            try {
                currentUser = JSON.parse(savedCurrentUser);
                console.log("✅ Current user found:", currentUser.username);
                
                // CRITICAL: Load ALL user data BEFORE showing dashboard
                loadAllData();
                
                // IMPORTANT: Immediately show dashboard
                setTimeout(() => {
                    // Hide all pages first
                    pages.landing.classList.remove('active');
                    pages.login.classList.remove('active');
                    pages.signup.classList.remove('active');
                    pages.dashboard.classList.remove('active');
                    
                    // Show dashboard
                    pages.dashboard.classList.add('active');
                    
                    // Update all displays
                    updateUserDisplay();
                    updateExpenseTable();
                    updateShoppingInsights();
                    updateBudgetDisplay();
                    updateSavingsDisplay();
                    updatePendingCartDisplay();
                    updateTimeBlockDisplay();
                    updateProgressDisplay();
                    updateHeaderButtons();
                    
                    console.log("✅ Dashboard loaded successfully!");
                }, 100);
                
                showToast(`Welcome back, ${currentUser.username}!`, 'success');
                
            } catch (error) {
                console.error("❌ Error loading current user:", error);
                currentUser = null;
                localStorage.removeItem('walletwise_current_user');
                showPage('landing');
            }
        } else {
            console.log("❌ No user found, showing landing page");
            showPage('landing');
        }
        
        // Set current date in expense form
        if (document.getElementById('expenseDate')) {
            document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        }
        
        // Initialize input validation
        setupInputValidation();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize display
        updatePendingCartDisplay();
        updateTimeBlockDisplay();
        updateBudgetModals();
        
        // Start timer for pending items countdown
        setInterval(() => {
            if (pendingModal && pendingModal.classList.contains('active')) {
                updatePendingItemsDisplay();
            }
        }, 1000);
        
        console.log("✅ WalletWise initialized successfully!");
    }
    
    // === START THE APP ===
    initApp();
    
    // === DEBUG FUNCTION ===
    function debugLocalStorage() {
        console.log("🔍 DEBUG: Checking localStorage...");
        console.log("walletwise_current_user:", localStorage.getItem('walletwise_current_user'));
        console.log("walletwise_users:", localStorage.getItem('walletwise_users'));
        
        if (currentUser) {
            console.log("Current user:", currentUser.username);
            console.log("Expenses key:", localStorage.getItem(`walletwise_expenses_${currentUser.username}`));
            console.log("Savings key:", localStorage.getItem(`walletwise_savings_${currentUser.username}`));
            console.log("Budget key:", localStorage.getItem(`walletwise_budget_${currentUser.username}`));
        }
    }
    
    // === EXPORT FOR DEBUGGING ===
    window.WalletWise = {
        appState: {
            currentUser,
            expenses,
            shoppingBudget,
            savings,
            pendingItems,
            timeBlockSettings,
            progressStats
        },
        showPage,
        showToast,
        addExpense,
        deleteExpense,
        updateExpenseTable,
        addPendingItem,
        removePendingItem,
        buyPendingItem,
        setNewBudget,
        transferFromSavings,
        debugLocalStorage
    };
    
    console.log("✅ WalletWise initialized successfully!");
});