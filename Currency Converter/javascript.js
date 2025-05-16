// Main module
const CurrencyApp = (() => {
    // Cache of frequently used DOM elements
    const DOM = { // Elements
        amount: document.getElementById('amount'),
        fromCurrency: document.getElementById('fromCurrency'),
        toCurrency: document.getElementById('toCurrency'),
        fromFlag: document.getElementById('fromFlag'),
        toFlag: document.getElementById('toFlag'),
        swapButton: document.getElementById('swapButton'),
        resultValue: document.getElementById('resultValue'),
        resultCurrency: document.getElementById('resultCurrency'),
        rateInfo: document.getElementById('rateInfo'),
        calcToggle: document.getElementById('calculatorToggle'),
        calcContainer: document.getElementById('calculatorContainer'),
        calcDisplay: document.getElementById('calcDisplay'),
        userNotes: document.getElementById('userNotes'),
        tickerScroll: document.getElementById('tickerScroll')
    };

    // Currency data
    const currencies = [ // Data
        { code: 'USD', name: 'US Dollar', flag: 'us' },
        { code: 'EUR', name: 'Euro', flag: 'eu' },
        { code: 'ILS', name: 'Israeli Shekel', flag: 'il' },
        { code: 'JPY', name: 'Japanese Yen', flag: 'jp' },
        { code: 'GBP', name: 'British Pound', flag: 'gb' },
        { code: 'CHF', name: 'Swiss Franc', flag: 'ch' },
        { code: 'CAD', name: 'Canadian Dollar', flag: 'ca' },
        { code: 'AUD', name: 'Australian Dollar', flag: 'au' },
        { code: 'CNY', name: 'Chinese Yuan', flag: 'cn' },
        { code: 'INR', name: 'Indian Rupee', flag: 'in' },
        { code: 'BRL', name: 'Brazilian Real', flag: 'br' },
        { code: 'RUB', name: 'Russian Ruble', flag: 'ru' },
        { code: 'KRW', name: 'South Korean Won', flag: 'kr' },
        { code: 'SGD', name: 'Singapore Dollar', flag: 'sg' },
        { code: 'NZD', name: 'New Zealand Dollar', flag: 'nz' },
        { code: 'MXN', name: 'Mexican Peso', flag: 'mx' },
        { code: 'HKD', name: 'Hong Kong Dollar', flag: 'hk' },
        { code: 'TRY', name: 'Turkish Lira', flag: 'tr' },
        { code: 'AED', name: 'United Arab Emirates Dirham', flag: 'ae' },
        { code: 'ZAR', name: 'South African Rand', flag: 'za' }
    ];

    // Exchange rates (relative to USD)
    const exchangeRates = { // Rates
        'USD': 1,
        'EUR': 0.9208,
        'ILS': 3.7082,
        'JPY': 156.78,
        'GBP': 0.7976,
        'CHF': 0.9142,
        'CAD': 1.3682,
        'AUD': 1.5247,
        'CNY': 7.2481,
        'INR': 83.467,
        'BRL': 5.1243,
        'RUB': 92.536,
        'KRW': 1367.24,
        'SGD': 1.3546,
        'NZD': 1.6547,
        'MXN': 16.7328,
        'HKD': 7.8132,
        'TRY': 32.1537,
        'AED': 3.6725,
        'ZAR': 18.5821
    };

    // Calculator
    const calculator = { // Calc
        value: '0',
        pendingOperation: null,
        storedValue: 0,
        resetDisplay: false
    };

    // Rates animation
    const tickerConfig = { // Ticker
        animationId: null,
        speed: 1.5,
        position: 0,
        previousRates: {}
    };

    /**
     * Initialize currency selectors with sorted options
     */
    const initializeCurrencySelectors = () => { // Setup
        // Create a fragment to optimize DOM performance
        const fragmentFrom = document.createDocumentFragment();
        const fragmentTo = document.createDocumentFragment();
        
        // Sort currencies by name
        const sortedCurrencies = [...currencies].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        // Add options at once
        sortedCurrencies.forEach(currency => {
            const optionTextContent = `${currency.code} - ${currency.name}`;
            
            const optionFrom = document.createElement('option');
            optionFrom.value = currency.code;
            optionFrom.textContent = optionTextContent;
            fragmentFrom.appendChild(optionFrom);
            
            const optionTo = document.createElement('option');
            optionTo.value = currency.code;
            optionTo.textContent = optionTextContent;
            fragmentTo.appendChild(optionTo);
        });
        
        // DOM insertion for each selector
        DOM.fromCurrency.appendChild(fragmentFrom);
        DOM.toCurrency.appendChild(fragmentTo);
        
        // Default values
        DOM.fromCurrency.value = 'USD';
        DOM.toCurrency.value = 'EUR';
        
        // Initialize
        updateFlags();
    };

    /**
     * Update the flags of selected currencies
     */
    const updateFlags = () => { // Flags
        const fromCode = DOM.fromCurrency.value;
        const toCode = DOM.toCurrency.value;
        
        const getFlagUrl = (code) => {
            const currency = currencies.find(c => c.code === code);
            return currency 
                ? `url('https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/${currency.flag.toLowerCase()}.svg')`
                : '';
        };
        
        // Batch update to avoid additional reflows
        requestAnimationFrame(() => {
            DOM.fromFlag.style.backgroundImage = getFlagUrl(fromCode);
            DOM.toFlag.style.backgroundImage = getFlagUrl(toCode);
        });
    };

    /**
     * Convert currency and update display
     */
    const convertCurrency = () => { // Convert
        // Get and validate amount
        const amount = parseFloat(DOM.amount.value) || 0;
        const fromCurrency = DOM.fromCurrency.value;
        const toCurrency = DOM.toCurrency.value;
        
        // Conversion rates
        const fromRate = exchangeRates[fromCurrency] || 1;
        const toRate = exchangeRates[toCurrency] || 1;
        
        // Calculate converted amount
        const convertedAmount = (amount / fromRate) * toRate;
        const formattedAmount = convertedAmount.toFixed(2);
        
        // Calculate exchange rate for 1 unit
        const rate = (1 / fromRate) * toRate;
        const formattedRate = rate.toFixed(4);
        
        // Update interface in a single operation to optimize performance
        requestAnimationFrame(() => {
            DOM.resultValue.textContent = formattedAmount;
            DOM.resultCurrency.textContent = toCurrency;
            DOM.rateInfo.textContent = `1 ${fromCurrency} = ${formattedRate} ${toCurrency}`;
        });
    };

    /**
     * Swap selected currencies
     */
    const swapCurrencies = () => { // Swap
        // Exchange values
        [DOM.fromCurrency.value, DOM.toCurrency.value] = 
            [DOM.toCurrency.value, DOM.fromCurrency.value];
        
        // Update interface
        updateFlags();
        convertCurrency();
        
        // Button animation
        DOM.swapButton.classList.add('rotating');
        setTimeout(() => {
            DOM.swapButton.classList.remove('rotating');
        }, 500);
    };

    /**
     * Setup live exchange rates animation
     */
    const setupLiveRates = () => { // Live
        // Select all rate elements at once
        const rateElements = {};
        const rateIds = ['eurUsd', 'usdJpy', 'gbpUsd', 'usdIls', 'audUsd', 
                         'eurGbp', 'usdCad', 'usdChf', 'nzdUsd', 'usdCny'];
        
        // Create a cache of elements and initialize previous rates
        rateIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                rateElements[id] = element;
                tickerConfig.previousRates[id] = parseFloat(element.textContent);
            }
        });
        
        // Periodic rate updates
        setInterval(() => {
            // Process all rates in a single operation
            const updates = [];
            
            for (const [id, element] of Object.entries(rateElements)) {
                const currentValue = parseFloat(element.textContent);
                
                // Calculate variation with amplitude adapted to the currency
                const isLargeRate = id.includes('Jpy') || id.includes('Cny');
                const variation = (Math.random() - 0.5) * 0.002 * (isLargeRate ? 20 : 1);
                
                // New value
                const newValue = currentValue + variation;
                const direction = newValue > tickerConfig.previousRates[id] ? 'up' : 'down';
                
                updates.push({
                    element,
                    newValue,
                    direction,
                    id
                });
                
                // Update previous rate
                tickerConfig.previousRates[id] = newValue;
            }
            
            // Perform all DOM updates in a single operation
            requestAnimationFrame(() => {
                updates.forEach(update => {
                    // Update value
                    update.element.textContent = update.newValue.toFixed(4);
                    
                    // Update direction (up/down)
                    const parentItem = update.element.closest('.ticker-item');
                    if (parentItem) {
                        const icon = parentItem.querySelector('i');
                        
                        if (update.direction === 'up') {
                            parentItem.classList.remove('down');
                            parentItem.classList.add('up');
                            if (icon) icon.className = 'fas fa-arrow-up';
                        } else {
                            parentItem.classList.remove('up');
                            parentItem.classList.add('down');
                            if (icon) icon.className = 'fas fa-arrow-down';
                        }
                    }
                });
            });
        }, 3000);
    };

    /**
     * Setup currency ticker animation
     */
    const setupTickerAnimation = () => { // Animate
        if (!DOM.tickerScroll) return;
        
        // Initialize position
        tickerConfig.position = window.innerWidth;
        
        const animate = () => {
            tickerConfig.position -= tickerConfig.speed;
            
            // Reset position if needed
            if (tickerConfig.position < -DOM.tickerScroll.offsetWidth) {
                tickerConfig.position = window.innerWidth;
            }
            
            // Position with transform
            DOM.tickerScroll.style.transform = `translateX(${tickerConfig.position}px)`;
            
            // Continue animation
            tickerConfig.animationId = requestAnimationFrame(animate);
        };
        
        // Start animation
        tickerConfig.animationId = requestAnimationFrame(animate);
        
        // Pause/resume event handling
        if (DOM.tickerScroll) {
            DOM.tickerScroll.addEventListener('mouseenter', () => {
                cancelAnimationFrame(tickerConfig.animationId);
            });
            
            DOM.tickerScroll.addEventListener('mouseleave', () => {
                tickerConfig.animationId = requestAnimationFrame(animate);
            });
        }
        
        // Resize
        window.addEventListener('resize', () => {
            tickerConfig.position = window.innerWidth;
        });
    };

    /**
     * Calculator functions
     */
    const calculatorFunctions = { // Math
        toggleCalculator: () => {
            DOM.calcContainer.classList.toggle('collapsed');
        },
        
        updateDisplay: () => {
            DOM.calcDisplay.textContent = calculator.value;
        },
        
        clear: () => {
            calculator.value = '0';
            calculator.pendingOperation = null;
            calculator.storedValue = 0;
            calculator.resetDisplay = false;
            calculatorFunctions.updateDisplay();
        },
        
        handleKeyPress: (key) => {
            // Reset display if needed
            if (calculator.resetDisplay) {
                calculator.value = '0';
                calculator.resetDisplay = false;
            }
            
            // Process different key types
            if (key.dataset.value !== undefined) {
                // Numbers and decimal point
                if (calculator.value === '0' && key.dataset.value !== '.') {
                    calculator.value = key.dataset.value;
                } else if (key.dataset.value === '.' && calculator.value.includes('.')) {
                    // Avoid multiple decimal points
                    return;
                } else {
                    calculator.value += key.dataset.value;
                }
            } else if (key.dataset.action) {
                const action = key.dataset.action;
                
                switch (action) {
                    case 'clear':
                        calculatorFunctions.clear();
                        return;
                    case 'backspace':
                        if (calculator.value.length > 1) {
                            calculator.value = calculator.value.slice(0, -1);
                        } else {
                            calculator.value = '0';
                        }
                        break;
                    case 'percent':
                        calculator.value = (parseFloat(calculator.value) / 100).toString();
                        break;
                    case 'add':
                    case 'subtract':
                    case 'multiply':
                    case 'divide':
                        calculatorFunctions.executeOperation();
                        calculator.pendingOperation = action;
                        calculator.storedValue = parseFloat(calculator.value);
                        calculator.resetDisplay = true;
                        break;
                    case 'calculate':
                        calculatorFunctions.executeOperation();
                        calculator.pendingOperation = null;
                        calculator.resetDisplay = true;
                        break;
                }
            }
            
            calculatorFunctions.updateDisplay();
        },
        
        executeOperation: () => {
            if (!calculator.pendingOperation) return;
            
            const currentValue = parseFloat(calculator.value);
            const operations = {
                'add': (a, b) => a + b,
                'subtract': (a, b) => a - b,
                'multiply': (a, b) => a * b,
                'divide': (a, b) => a / b
            };
            
            // Execute operation
            const operation = operations[calculator.pendingOperation];
            if (operation) {
                let result = operation(calculator.storedValue, currentValue);
                
                // Format result
                calculator.value = result.toString();
                if (calculator.value.includes('.') && calculator.value.split('.')[1].length > 8) {
                    calculator.value = result.toFixed(8);
                }
            }
        },
        
        copyResultToCalculator: () => {
            calculator.value = DOM.resultValue.textContent;
            calculatorFunctions.updateDisplay();
            DOM.calcContainer.classList.remove('collapsed');
        },
        
        copyCalculatorToAmount: () => {
            DOM.amount.value = parseFloat(calculator.value);
            convertCurrency();
        }
    };

    /**
     * User notes management with localStorage
     */
    const setupNotesFeatures = () => { // Notes
        if (!DOM.userNotes) return;
        
        // Use delay before saving to avoid too frequent operations
        let saveTimeout;
        
        // Load notes from localStorage
        try {
            const savedNotes = localStorage.getItem('currencyEliteNotes');
            if (savedNotes) {
                DOM.userNotes.value = savedNotes;
            }
        } catch (e) {
            console.warn('Unable to load notes:', e);
        }
        
        // Save notes with debounce to optimize performance
        DOM.userNotes.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                try {
                    localStorage.setItem('currencyEliteNotes', DOM.userNotes.value);
                } catch (e) {
                    console.warn('Unable to save notes:', e);
                }
            }, 300);
        });
    };

    /**
     * Add all event listeners
     */
    const setupEventListeners = () => { // Events
        // Currency converter
        DOM.amount.addEventListener('input', convertCurrency);
        DOM.fromCurrency.addEventListener('change', () => {
            updateFlags();
            convertCurrency();
        });
        DOM.toCurrency.addEventListener('change', () => {
            updateFlags();
            convertCurrency();
        });
        DOM.swapButton.addEventListener('click', swapCurrencies);
        
        // Keyboard support for swap (for accessibility)
        DOM.swapButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                swapCurrencies();
            }
        });
        
        // Calculator
        DOM.calcToggle.addEventListener('click', calculatorFunctions.toggleCalculator);
        
        // Double-click on result
        DOM.resultValue.addEventListener('dblclick', calculatorFunctions.copyResultToCalculator);
        
        // Double-click on calculator display
        DOM.calcDisplay.addEventListener('dblclick', calculatorFunctions.copyCalculatorToAmount);
        
        // Calculator keys - using event delegation
        document.querySelector('.calculator-keys')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                calculatorFunctions.handleKeyPress(e.target);
            }
        });
        
        // Physical keyboard support for calculator
        document.addEventListener('keydown', (e) => {
            // If calculator is visible
            if (!DOM.calcContainer.classList.contains('collapsed')) {
                const key = e.key;
                
                // Prevent default behavior for numeric keys
                if (/[\d.+\-*/=]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
                    e.preventDefault();
                    
                    // Map keyboard keys to calculator keys
                    if (/\d/.test(key)) {
                        // Numeric keys
                        const numKey = document.querySelector(`.key[data-value="${key}"]`);
                        if (numKey) calculatorFunctions.handleKeyPress(numKey);
                    } else {
                        // Special keys
                        const keyMap = {
                            '.': '.', 
                            '+': 'add', 
                            '-': 'subtract', 
                            '*': 'multiply', 
                            '/': 'divide',
                            'Enter': 'calculate', 
                            '=': 'calculate',
                            'Escape': 'clear',
                            'Backspace': 'backspace'
                        };
                        
                        if (keyMap[key]) {
                            const actionKey = document.querySelector(`.key[data-action="${keyMap[key]}"]`);
                            if (actionKey) calculatorFunctions.handleKeyPress(actionKey);
                        }
                    }
                }
            }
        });
    };

    /**
     * Initialize the application
     */
    const init = () => { // Init
        try {
            initializeCurrencySelectors();
            convertCurrency();
            setupEventListeners();
            setupLiveRates();
            setupTickerAnimation();
            setupNotesFeatures();
            
            // For debugging
            console.log('CurrencyElite initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    };

    // Public API
    return {
        init
    };
})();

// Launch application on DOM load
document.addEventListener('DOMContentLoaded', CurrencyApp.init);