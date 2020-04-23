/*
 *  app.js retrieves all of the data for the client-side.
 *  Data is from DB, or CSV files if user doesn't have any saved data yet.
 *  The data is then passed to other functions to initialize charts and jexcel for manual input.
 */

let MV = [] // Global MetricValues array for d3
let lastDataDate, forecastEndDate // Global for the last date for which we have historical data


const parseDateCSV = d3.timeParse("%m/%d/%Y")
const parseDateDB = d3.timeParse("%Y-%m-%d")
const formatDateSS = d3.timeFormat("%Y-%m-%d 00:00:00") // Format needed for jExcel spreadsheet

if (document.getElementById("data")) {
    let jsonData = JSON.parse(document.getElementById("data").innerText)
    jsonData.map(d => {
        d.date = parseDateDB(d.date)
        d.ssDate = formatDateSS(d.date)
        d.cashCollected = d.cash_collected
    })
    
    MV = jsonData
    
    // TODO: make spreadsheet work when loading data from DB

    initializeApp()
} else {
    d3.csv("sample_data.csv").then((csvData) => {

        csvData.map(d => {
            let date = parseDateCSV(d["Date"]), // Date object for use in most places
                ssDate = formatDateSS(date) // String for jExcel use

            MV.push({
                date: date,
                ssDate: ssDate,
                bookings: Number(d["Bookings"].replace(/[^0-9.-]+/g, "")),
                expenses: Number(d["Expenses"].replace(/[^0-9.-]+/g, "")),
                cashCollected: Number(d["Cash Collected"].replace(/[^0-9.-]+/g, "")),
                billings: Number(d["Billings"].replace(/[^0-9.-]+/g, "")),
                currentAR: Number(d["AR - Current"].replace(/[^0-9.-]+/g, "")),
                pastDueAR: Number(d["AR - Past Due"].replace(/[^0-9.-]+/g, "")),
                balance: Number(d["Ending Balance"].replace(/[^0-9.-]+/g, "")),
                is_forecast: false,
            })
        })
        console.log("MV", MV)

        initializeApp()
    })
}

function initializeApp() {
    lastDataDate = new Date(d3.max(historicalData(), (d) => {
        return d.date
    }))

    // 12 month forecast horizon
    forecastEndDate = new Date(lastDataDate.getFullYear() + 1, lastDataDate.getMonth(), 0)

    initializeSpreadsheet(MV)
    updateMetric("bookings")
    updateMetric("expenses")
    updateMetric("cashCollected")
    updateMetric("balance")
}

// Modal for spreadsheet input
var modal = document.getElementById('modal')
modal.onclick = function () {
    modal.style.display = "none";
}

// jexcel container - see spreadsheet.js
var spreadsheet = document.getElementById('spreadsheet')
spreadsheet.onclick = function (e) {
    e.stopPropagation() // Prevents click on spreadsheet from closing modal
}

function forecastData() {
    return MV.filter(x => x.is_forecast === true)
}
function historicalData() {
    return MV.filter(x => !x.is_forecast)
}
function saveScenario() {
    let scenarioId = randScenarioId(24, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    MV.map(r => {
        r.scenarioId = scenarioId
    })
    d3.json('/api/metricValues/bulk', {
        method: "POST",
        body: JSON.stringify(MV),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(() => {
        window.history.pushState({saved: true}, `Saved Scenario ${scenarioId}`, `/?id=${scenarioId}`)
        alert("Your scenario has been saved! \n" 
            + "Please bookmark this page or copy the URL below to continue working at a later time: \n\n" 
            + window.location.href)
    })
}
function randScenarioId(length, chars) { // From https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

// Override keyboard interaction for jexcel. Copy & Paste still works.
// jexcel.keyDownControls = function (e) {
//     return // Don't let user tab to create new columns
// }