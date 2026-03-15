const API_KEY = 'YOUR_API_KEY'; // Replace with a real OpenWeatherMap API Key
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const historyList = document.getElementById('historyList');
const eventLog = document.getElementById('eventLog');

// 1. Console Logger for Event Loop Visualization
function logEvent(message, type = 'system') {
    const p = document.createElement('p');
    p.className = `log-entry ${type}`;
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    eventLog.prepend(p);
}

// 2. Local Storage Management
function updateHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    if (!history.includes(city)) {
        history.unshift(city); // Add to the beginning
        if (history.length > 5) history.pop(); // Keep only last 5 searches
        localStorage.setItem('weatherHistory', JSON.stringify(history));
    }
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    historyList.innerHTML = history.map(city => 
        `<span class="history-chip" onclick="fetchWeather('${city}')">${city}</span>`
    ).join('');
}

// 3. Asynchronous Weather Fetch
async function fetchWeather(city) {
    logEvent("Sync: Click event detected, calling fetchWeather()", "sync");
    weatherResult.innerHTML = "Fetching data...";

    try {
        // Show MacroTask behavior
        setTimeout(() => logEvent("Async: setTimeout (MacroTask) completed", "async"), 0);

        logEvent("Sync: Before fetch() call", "sync");
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
        
        logEvent("Async: Promise resolved (MicroTask)", "async");

        if (!response.ok) {
            throw new Error("City not found or API error");
        }

        const data = await response.json();
        displayWeather(data);
        updateHistory(city);

    } catch (error) {
        weatherResult.innerHTML = `<p style="color: #f87171;">Error: ${error.message}</p>`;
        logEvent(`Async Error: ${error.message}`, "async");
    }

    logEvent("Sync: fetchWeather() execution completed", "sync");
}

function displayWeather(data) {
    weatherResult.innerHTML = `
        <div class="weather-data">
            <h2 style="margin-top:0;">${data.name}, ${data.sys.country}</h2>
            <p><strong>Temperature:</strong> ${data.main.temp} Celsius</p>
            <p><strong>Condition:</strong> ${data.weather[0].main}</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
        </div>
    `;
}

// 4. Initial Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        cityInput.value = '';
    }
});

// Allow Enter key to search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    }
});

window.onload = renderHistory;
