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
    
    // Buttons
    const getStartedBtn = document.getElementById('getStartedBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    const headerSignupBtn = document.getElementById('headerSignupBtn');
    const goToSignupLink = document.getElementById('goToSignupLink');
    const goToLoginLink = document.getElementById('goToLoginLink');
    const continueBtn = document.getElementById('continueBtn');
    
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
                                        addWelcomeExpense();
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
    
    // === FORM HANDLERS ===
    async function handleLogin(event) {
        event.preventDefault();
        
        if (!validateLoginForm()) return;
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        showLoading('Signing you in...');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
            const savedUser = localStorage.getItem('walletwise_user');
            let userExists = false;
            
            if (savedUser) {
                const existingUser = JSON.parse(savedUser);
                if (existingUser.username === username || username === 'demo') {
                    userExists = true;
                }
            }
            
            if (userExists || username === 'demo') {
                currentUser = {
                    username: username,
                    email: `${username}@example.com`,
                    joinedDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                
                localStorage.setItem('walletwise_user', JSON.stringify(currentUser));
                
                hideLoading();
                showLoginSuccess();
                showToast(`Welcome back, ${username}!`, 'success');
                showWelcomeAnimation(username);
                
                loginForm.reset();
                
                setTimeout(() => {
                    showPage('dashboard');
                    loadExpenses();
                    loadSavings();
                }, 3200);
                
            } else {
                hideLoading();
                showToast('Invalid username or password. Try "demo" as username.', 'error');
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
            const savedUser = localStorage.getItem('walletwise_user');
            let usernameTaken = false;
            
            if (savedUser) {
                const existingUser = JSON.parse(savedUser);
                if (existingUser.username === username) {
                    usernameTaken = true;
                }
            }
            
            if (usernameTaken) {
                hideLoading();
                showToast('Username already taken. Please choose another.', 'error');
                const usernameInput = document.getElementById('signupUsername');
                usernameInput.classList.add('error');
            } else {
                currentUser = {
                    username: username,
                    email: email,
                    joinedDate: new Date().toISOString(),
                    recoveryStart: new Date().toISOString(),
                    initialBudget: shoppingBudget,
                    achievements: ['first_account']
                };
                
                localStorage.setItem('walletwise_user', JSON.stringify(currentUser));
                
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
                
            }
            
        } catch (error) {
            hideLoading();
            showToast('An error occurred during signup. Please try again.', 'error');
            console.error('Signup error:', error);
        }
    }
    
    async function handleAddExpense(event) {
        event.preventDefault();
        
        if (!validateExpenseForm()) return;
        
        const date = document.getElementById('expenseDate').value;
        const platform = document.getElementById('shoppingPlatform').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDescription').value.trim();
        const purchaseType = document.getElementById('purchaseType').value;
        
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
                message = `Purchase logged successfully`;
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
                        No shopping expenses logged yet. Start tracking to see insights!
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
            shoppingPatternElement.innerHTML = `You shop most on <strong>${getMostCommonShoppingDay()}</strong> between <strong>${getMostCommonShoppingTime()}</strong>`;
        }
        
        if (emotionalTriggersElement) {
            emotionalTriggersElement.innerHTML = `${getImpulsePercentage()}% of your impulse buys occur when you're <strong>bored</strong> or <strong>stressed</strong>`;
        }
        
        if (reductionPercentElement) {
            reductionPercentElement.textContent = `${calculateReductionPercentage()}%`;
        }
    }
    
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
                <div class="savings-item-amount">+₱${entry.amount.toFixed(0)}</div>
            </div>
        `).join('');
    }
    
    function getSavingsSource(source) {
        const sources = {
            'impulse_avoided': 'Impulse Avoided',
            'budget_leftover': 'Budget Leftover',
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
    
    function saveSavings() {
        if (currentUser) {
            localStorage.setItem(`walletwise_savings_${currentUser.username}`, JSON.stringify(savings));
        }
    }
    
    function loadSavings() {
        if (currentUser) {
            const saved = localStorage.getItem(`walletwise_savings_${currentUser.username}`);
            if (saved) {
                try {
                    savings = JSON.parse(saved);
                    updateSavingsDisplay();
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
        
        if (pageName === 'dashboard' && currentUser) {
            updateUserDisplay();
            updateExpenseTable();
            updateShoppingInsights();
            updateBudgetDisplay();
            updateSavingsDisplay();
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
            localStorage.removeItem('walletwise_user');
            showPage('landing');
            showToast("See you soon! Keep making smart spending choices!", 'info');
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
        
        // Enhanced dashboard buttons
        document.querySelectorAll('.cart-review-btn, .time-block-btn, .progress-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('cart-review-btn')) {
                    const savingsAmount = Math.round(2000 * 0.2); // 20% of cart value
                    addSavingsEntry(savingsAmount, 'impulse_avoided', '24-hour rule applied on cart items');
                    
                    showSuccess(
                        `Excellent discipline! 🎉\n\nYou avoided ₱2,000 in impulse purchases by reviewing your cart.\n\n₱${savingsAmount} has been added to your Savings Wallet!\n\nRemember: Wait 24 hours before making impulse purchases.`,
                        'View Savings'
                    );
                } else if (this.classList.contains('time-block-btn')) {
                    showSuccess(
                        `Time block activated! ⏰\n\nShopping websites will be blocked between 8-10 PM.\n\nYou'll get a reminder to avoid shopping during these high-risk hours.\n\nThis helps break the habit of late-night shopping.`,
                        'Continue'
                    );
                } else if (this.classList.contains('progress-btn')) {
                    showSuccess(
                        `Your Progress Report 📊\n\n• Impulse buys reduced by 65%\n• Monthly savings: ₱2,500\n• Budget adherence: 92%\n• Savings goal progress: ${Math.round((savings.balance / savings.goal) * 100)}%\n\nKeep up the great work! Your financial freedom is getting closer!`,
                        'View Details'
                    );
                }
            });
        });
    }
    
    // === DATA PERSISTENCE ===
    function loadExpenses() {
        if (currentUser) {
            const saved = localStorage.getItem(`walletwise_expenses_${currentUser.username}`);
            if (saved) {
                try {
                    expenses = JSON.parse(saved);
                    updateExpenseTable();
                    updateShoppingInsights();
                    updateBudgetDisplay();
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
    
    // === SAMPLE DATA ===
    function loadSampleShoppingData() {
        const sampleExpenses = [
            {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                platform: 'shopee',
                description: 'Wireless Earbuds',
                category: 'electronics',
                amount: 1200,
                purchaseType: 'impulse'
            },
            {
                id: 2,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                platform: 'lazada',
                description: 'Winter Jacket',
                category: 'fashion',
                amount: 2500,
                purchaseType: 'impulse'
            },
            {
                id: 3,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                platform: 'foodpanda',
                description: 'Weekly Groceries',
                category: 'food',
                amount: 3800,
                purchaseType: 'planned'
            }
        ];
        
        expenses.push(...sampleExpenses);
        updateExpenseTable();
        updateShoppingInsights();
        updateBudgetDisplay();
        saveExpenses();
        
        // Add sample savings
        addSavingsEntry(500, 'impulse_avoided', 'Avoided unnecessary gadgets');
        addSavingsEntry(800, 'budget_leftover', 'Monthly budget savings');
    }
    
    function addWelcomeExpense() {
        const welcomeExpense = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            platform: 'other',
            description: 'Welcome to WalletWise! Start tracking your shopping expenses.',
            category: 'other',
            amount: 0,
            purchaseType: 'planned'
        };
        
        expenses.push(welcomeExpense);
        updateExpenseTable();
        saveExpenses();
    }
    
    // === INITIALIZATION ===
    function initApp() {
        const savedUser = localStorage.getItem('walletwise_user');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                showPage('dashboard');
                loadExpenses();
                loadSavings();
                setupEventListeners();
                setupInputValidation();
                setupSavingsModals();
            } catch (error) {
                localStorage.removeItem('walletwise_user');
                showPage('landing');
                setupEventListeners();
                setupInputValidation();
                setupSavingsModals();
            }
        } else {
            showPage('landing');
            setupEventListeners();
            setupInputValidation();
            setupSavingsModals();
        }
        
        const today = new Date().toISOString().split('T')[0];
        if (document.getElementById('expenseDate')) {
            document.getElementById('expenseDate').value = today;
        }
        
        if (expenses.length === 0) {
            loadSampleShoppingData();
        }
        
        if (!localStorage.getItem('walletwise_welcome_shown')) {
            setTimeout(() => {
                showToast('Welcome to WalletWise! Start controlling your online shopping today.', 'info', 5000);
                localStorage.setItem('walletwise_welcome_shown', 'true');
            }, 1000);
        }
    }
    
    // Start the app
    initApp();
    
    console.log("✅ WalletWise Online Shopping Control with Savings Wallet ready!");
});