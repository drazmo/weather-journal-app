/* Global Variables */
const API_KEY = '<ENTER API KEY>';
const JOURNAL_SERVER = 'http://localhost:3000';
const WEATHER_SERVER = 'http://api.openweathermap.org';

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getMonth() + '.' + d.getDate() + '.' + d.getFullYear();

document.getElementById('generate').addEventListener('click', () => updateWeather());

async function updateWeather() {
    let zipCode = document.getElementById('zip').value;
    let feelings = document.getElementById('feelings').value;
    let countryCode = 'us';

    document.getElementById('error').innerText = '';

    try {
        if (zipCode === null || zipCode === '') throw new Error("form");
        if (feelings === null || feelings === '') throw new Error("form");

        let weather = await getWeather(zipCode, countryCode);
        if (weather === 0) throw new Error('zipcode');
        if (weather === null) throw new Error('weather');

        updateBigWeather(weather);

        let journalEntry = await makeJournalEntry(weather, feelings);
        if (journalEntry === null) throw new Error('journalEntry');

        let journal = await getJournal();
        if (journal === null || journal.length === 0) throw new Error("journal");
        entrys = Object.keys(journal);
        updateLatestEntry(journal[entrys[entrys.length - 1]]);

    } catch (error) {
        console.log("Error saving weather journal.", error);

        if (error.message === "form") {
            document.getElementById('error').innerText = 'Please fill in all fields and try again.';
        } else if (error.message === "weather") {
            document.getElementById('error').innerText = 'Could not get the current weather. Try again later.';
        } else if (error.message === "journalEntry") {
            document.getElementById('error').innerText = 'Could not make journal entry. Try again later.';
        } else if (error.message === "journal") {
            document.getElementById('error').innerText = 'Could get latest journal. Try again later.';
        } else if (error.message === 'zipcode') {
            document.getElementById('error').innerText = 'Could get weather check zip code.';
        }
    }
}

async function makeJournalEntry(weather, feelings) {
    console.log("Make Journal Entry: ", feelings, weather);
    try {
        let tempFahrenheit = Math.floor(weather.main.temp);
        let data = {
            date: newDate,
            temp: tempFahrenheit,
            content: feelings
        }

        let response = await sendJournalEntry(JOURNAL_SERVER + '/journal', data)
        if (response == null) throw new Error("Error sending journal entry.");

        return data;
    } catch (error) {
        console.log('Error making journal entry.', error)
        return null;
    }
}

async function sendJournalEntry(url, data) {
    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.status !== 200) throw new Error("Invalid status code");

        return data;
    } catch (error) {
        console.log('Error making journal entry.', error)
        return null;
    }
}

async function getJournal() {
    try {
        let response = await fetch(JOURNAL_SERVER + '/all')
        if (response.status !== 200) throw new Error("Invalid status code");

        data = await response.json();
        return data.journal;
    } catch (error) {
        console.log('Error getting journal.', error)
        return null;
    }
}

async function getWeather(zipCode, countryCode) {
    try {
        let response = await fetch(`${WEATHER_SERVER}/data/2.5/weather?zip=${zipCode},${countryCode}&appid=${API_KEY}&units=imperial`);
        if (response.status !== 200) throw new Error("Invalid zip code");
        let weather = await response.json();

        return weather;
    } catch (error) {
        console.log('Error getting weather.', error)
        if (error.message === 'Invalid zip code') return 0
        return null;
    }
}

function updateBigWeather(weather) {
    let tempFahrenheit = Math.floor(weather.main.temp);

    document.getElementById('last-temp').innerText = tempFahrenheit
    document.getElementById('big-temp').style.display = 'block';
}

function updateLatestEntry(journalEntry) {
    document.getElementById('title').innerHTML = 'Most Recent Entry';
    document.getElementById('date').innerText = journalEntry.date;
    document.getElementById('temp').innerHTML = journalEntry.temp + '&deg;';
    document.getElementById('content').innerText = journalEntry.content;
}