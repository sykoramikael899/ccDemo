// Currency data
const currencies = [
    { code: "AUD", name: "Australský dolar", nameEn: "Australian Dollar" },
    { code: "BGN", name: "Bulharský lev", nameEn: "Bulgarian Lev" },
    { code: "BRL", name: "Brazilský real", nameEn: "Brazilian Real" },
    { code: "CAD", name: "Kanadský dolar", nameEn: "Canadian Dollar" },
    { code: "CHF", name: "Švýcarský frank", nameEn: "Swiss Franc" },
    { code: "CNY", name: "Čínský juan", nameEn: "Chinese Yuan" },
    { code: "CZK", name: "Česká koruna", nameEn: "Czech Koruna" },
    { code: "DKK", name: "Dánská koruna", nameEn: "Danish Krone" },
    { code: "EUR", name: "Euro", nameEn: "Euro" },
    { code: "GBP", name: "Britská libra", nameEn: "British Pound" },
    { code: "HKD", name: "Hongkongský dolar", nameEn: "Hong Kong Dollar" },
    { code: "HUF", name: "Maďarský forint", nameEn: "Hungarian Forint" },
    { code: "IDR", name: "Indonéská rupie", nameEn: "Indonesian Rupiah" },
    { code: "ILS", name: "Izraelský šekel", nameEn: "Israeli Shekel" },
    { code: "INR", name: "Indická rupie", nameEn: "Indian Rupee" },
    { code: "ISK", name: "Islandská koruna", nameEn: "Icelandic Krona" },
    { code: "JPY", name: "Japonský jen", nameEn: "Japanese Yen" },
    { code: "KRW", name: "Jihokorejský won", nameEn: "South Korean Won" },
    { code: "MXN", name: "Mexické peso", nameEn: "Mexican Peso" },
    { code: "MYR", name: "Malajsijský ringgit", nameEn: "Malaysian Ringgit" },
    { code: "NOK", name: "Norská koruna", nameEn: "Norwegian Krone" },
    { code: "NZD", name: "Novozélandský dolar", nameEn: "New Zealand Dollar" },
    { code: "PHP", name: "Filipínské peso", nameEn: "Philippine Peso" },
    { code: "PLN", name: "Polský zlotý", nameEn: "Polish Zloty" },
    { code: "RON", name: "Rumunský lei", nameEn: "Romanian Leu" },
    { code: "SEK", name: "Švédská koruna", nameEn: "Swedish Krona" },
    { code: "SGD", name: "Singapurský dolar", nameEn: "Singapore Dollar" },
    { code: "THB", name: "Thajský baht", nameEn: "Thai Baht" },
    { code: "TRY", name: "Turecká lira", nameEn: "Turkish Lira" },
    { code: "USD", name: "Americký dolar", nameEn: "US Dollar" },
    { code: "XDR", name: "MMF", nameEn: "IMF" },
    { code: "ZAR", name: "Jihoafrický rand", nameEn: "South African Rand" }
];

// Global variables
let currentLanguage = 'cs';
let currentRates = null;

// DOM elements
const form = document.getElementById('conversion-form');
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const swapBtn = document.getElementById('swap-currencies');
const rateInfo = document.getElementById('rate-info');
const resultSection = document.getElementById('conversion-result');
const resultText = document.getElementById('result-text');
const rateDetails = document.getElementById('rate-details');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');
const langCsBtn = document.getElementById('lang-cs');
const langEnBtn = document.getElementById('lang-en');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    populateCurrencyDropdowns();
    setupEventListeners();
    setDefaultCurrencies();
});

// Populate currency dropdowns
function populateCurrencyDropdowns() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    
    // Clear existing options except first
    fromSelect.innerHTML = '<option value="" data-cs="Vyberte měnu" data-en="Select currency">Vyberte měnu</option>';
    toSelect.innerHTML = '<option value="" data-cs="Vyberte měnu" data-en="Select currency">Vyberte měnu</option>';
    
    currencies.forEach(currency => {
        const fromOption = document.createElement('option');
        const toOption = document.createElement('option');
        
        fromOption.value = currency.code;
        toOption.value = currency.code;
        
        const displayName = currentLanguage === 'cs' ? currency.name : currency.nameEn;
        const text = `${currency.code} (${displayName})`;
        
        fromOption.textContent = text;
        toOption.textContent = text;
        
        fromSelect.appendChild(fromOption);
        toSelect.appendChild(toOption);
    });
}

// Set default currencies
function setDefaultCurrencies() {
    fromCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'CZK';
    loadRateInfo();
}

// Setup event listeners
function setupEventListeners() {
    // Language switching
    langCsBtn.addEventListener('click', () => switchLanguage('cs'));
    langEnBtn.addEventListener('click', () => switchLanguage('en'));
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Currency swap
    swapBtn.addEventListener('click', swapCurrencies);
    
    // Currency change events
    fromCurrencySelect.addEventListener('change', loadRateInfo);
    toCurrencySelect.addEventListener('change', loadRateInfo);
}

// Language switching
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update all elements with data attributes
    document.querySelectorAll('[data-cs][data-en]').forEach(element => {
        if (element.tagName === 'OPTION' || element.tagName === 'INPUT') {
            if (element.hasAttribute('placeholder')) {
                element.placeholder = element.getAttribute(`data-${lang}`);
            } else {
                element.textContent = element.getAttribute(`data-${lang}`);
            }
        } else {
            element.textContent = element.getAttribute(`data-${lang}`);
        }
    });
    
    // Update title
    document.title = document.querySelector('.logo').textContent;
    
    // Repopulate currency dropdowns with new language
    const fromValue = fromCurrencySelect.value;
    const toValue = toCurrencySelect.value;
    
    populateCurrencyDropdowns();
    
    fromCurrencySelect.value = fromValue;
    toCurrencySelect.value = toValue;
    
    // Update rate info if available
    if (currentRates && fromValue && toValue) {
        displayRateInfo(fromValue, toValue);
    }
}

// Load and display rate information
async function loadRateInfo() {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (!fromCurrency || !toCurrency) {
        hideRateInfo();
        return;
    }
    
    try {
        const response = await fetch('https://data.kurzy.cz/json/meny/b[6].json', {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch rates: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        currentRates = Array.isArray(data) ? data[0] : data;
        displayRateInfo(fromCurrency, toCurrency);
        
    } catch (error) {
        console.error('Error loading exchange rates:', error);
        rateInfo.textContent = `Exchange rate information temporarily unavailable`;
        rateInfo.classList.remove('hidden');
    }
}

// Display rate information
function displayRateInfo(fromCurrency, toCurrency) {
    if (!currentRates || !currentRates.kurzy) {
        hideRateInfo();
        return;
    }
    
    let rateText = '';
    
    if (fromCurrency === 'CZK' && currentRates.kurzy[toCurrency]) {
        const rate = currentRates.kurzy[toCurrency];
        const exchangeRate = (rate.jednotka / rate.dev_stred).toFixed(4);
        
        rateText = `1 CZK = ${exchangeRate} ${toCurrency}`;
        
    } else if (toCurrency === 'CZK' && currentRates.kurzy[fromCurrency]) {
        const rate = currentRates.kurzy[fromCurrency];
        const exchangeRate = (rate.dev_stred / rate.jednotka).toFixed(2);
        
        rateText = `1 ${fromCurrency} = ${exchangeRate} CZK`;
        
    } else if (currentRates.kurzy[fromCurrency] && currentRates.kurzy[toCurrency]) {
        // Cross-currency calculation through CZK
        const fromRate = currentRates.kurzy[fromCurrency];
        const toRate = currentRates.kurzy[toCurrency];
        
        const fromToCzk = fromRate.dev_stred / fromRate.jednotka;
        const czkToTo = toRate.jednotka / toRate.dev_stred;
        const exchangeRate = (fromToCzk * czkToTo).toFixed(4);
        
        rateText = `1 ${fromCurrency} = ${exchangeRate} ${toCurrency}`;
    }
    
    if (rateText) {
        // Add date information if available
        const dateInfo = currentRates.denc ? ` (${currentRates.denc})` : '';
        rateInfo.textContent = rateText + dateInfo;
        rateInfo.classList.remove('hidden');
    } else {
        hideRateInfo();
    }
}

// Hide rate information
function hideRateInfo() {
    rateInfo.classList.add('hidden');
}

// Swap currencies
function swapCurrencies() {
    const fromValue = fromCurrencySelect.value;
    const toValue = toCurrencySelect.value;
    
    fromCurrencySelect.value = toValue;
    toCurrencySelect.value = fromValue;
    
    loadRateInfo();
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    // Validation
    if (!amount || amount <= 0) {
        showError(currentLanguage === 'cs' ? 'Zadejte platnou částku' : 'Please enter a valid amount');
        return;
    }
    
    if (!fromCurrency || !toCurrency) {
        showError(currentLanguage === 'cs' ? 'Vyberte obě měny' : 'Please select both currencies');
        return;
    }
    
    if (fromCurrency === toCurrency) {
        showError(currentLanguage === 'cs' ? 'Vyberte různé měny' : 'Please select different currencies');
        return;
    }
    
    // Show loading
    showLoading();
    
    try {
        const response = await fetch('https://mike8nine.app.n8n.cloud/webhook/da05aab5-15e1-4964-96c1-9c56a641c40d', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{
                fromCurrency: fromCurrency,
                Units: amount,
                toCurrency: toCurrency
            }])
        });
        
        if (!response.ok) {
            throw new Error('Conversion request failed');
        }
        
        const data = await response.json();
        console.log('Webhook response:', data);
        
        // Handle different response structures
        let result;
        if (Array.isArray(data) && data.length > 0) {
            result = data[0];
        } else if (data && typeof data === 'object') {
            result = data;
        } else {
            throw new Error('Invalid response format');
        }
        
        displayConversionResult(result);
        
    } catch (error) {
        console.error('Conversion error:', error);
        showError(currentLanguage === 'cs' ? 
            'Chyba při převodu měn. Zkuste to znovu.' : 
            'Currency conversion error. Please try again.');
    } finally {
        hideLoading();
    }
}

// Display conversion result
function displayConversionResult(result) {
    hideError();
    
    console.log('Processing result:', result);
    
    // Check if result exists and has the expected properties
    if (!result) {
        showError(currentLanguage === 'cs' ? 
            'Neplatná odpověď ze serveru.' : 
            'Invalid response from server.');
        return;
    }
    
    // Handle successful conversion
    if (result.success === true || result.success === undefined) {
        let conversionText = '';
        
        // Try to get conversion text from the expected properties
        if (result.conversionInfoCZE && result.conversionInfoENG) {
            conversionText = currentLanguage === 'cs' ? 
                result.conversionInfoCZE : 
                result.conversionInfoENG;
        } else if (result.convertedAmount && result.originalAmount && result.fromCurrency && result.toCurrency) {
            // Fallback: construct the message from available data
            if (currentLanguage === 'cs') {
                conversionText = `Za ${result.originalAmount} ${result.fromCurrency} dostanete ${result.convertedAmount} ${result.toCurrency}.`;
            } else {
                conversionText = `For ${result.originalAmount} ${result.fromCurrency} you will get ${result.convertedAmount} ${result.toCurrency}.`;
            }
        } else {
            // Last fallback: show raw result
            conversionText = JSON.stringify(result, null, 2);
        }
        
        resultText.textContent = conversionText;
        
        // Show rate details if available
        let rateText = '';
        if (result.details && result.details.rateInfo && result.conversionDate) {
            rateText = `${result.details.rateInfo} (${result.conversionDate})`;
        } else if (result.exchangeRate && result.conversionDate) {
            rateText = `1 ${result.fromCurrency} = ${result.exchangeRate} ${result.toCurrency} (${result.conversionDate})`;
        }
        
        rateDetails.textContent = rateText;
        resultSection.classList.remove('hidden');
        
    } else {
        showError(currentLanguage === 'cs' ? 
            'Převod se nezdařil. Zkuste to znovu.' : 
            'Conversion failed. Please try again.');
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    resultSection.classList.add('hidden');
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Show loading state
function showLoading() {
    loading.classList.remove('hidden');
    hideError();
    resultSection.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    loading.classList.add('hidden');
}