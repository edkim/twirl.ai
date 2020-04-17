/*
 *  app.js retrieves all of the data for the client-side.
 *  Data is from DB, or CSV files if user doesn't have any saved data yet.
 *  The data is then passed to other functions to initialize charts and jexcel for manual input.
 */


let MVDB = [] // Global MetricValues array for talking to DB [{date, metric_id, value, is_forecast}]
let MV = [] // Global MetricValues array for d3
let lastDataDate, forecastEndDate // Global for the last date for which we have historical data



const parseDateCSV = d3.timeParse("%m/%d/%Y")
const formatDateSS = d3.timeFormat("%Y-%m-%d 00:00:00") // Format needed for jExcel spreadsheet

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
            // currentAR: Number(d["AR - Current"].replace(/[^0-9.-]+/g, "")),
            // pastDueAR: Number(d["AR - Past Due"].replace(/[^0-9.-]+/g, "")),
            balance: Number(d["Ending Balance"].replace(/[^0-9.-]+/g, "")),
            is_forecast: false,
        })
    })

    lastDataDate = new Date(d3.max(historicalData(), (d) => {
        return d.date
    }))
    
    // 12 month forecast horizon
    forecastEndDate = new Date(lastDataDate.getFullYear() + 1, lastDataDate.getMonth(), 0)
    
    let sample = [MV[0], MV[1]]
    // d3.json('/api/metricValues', {
    //     method: "POST",
    //     body: JSON.stringify({
    //         date: sample.date,
    //         bookings: sample.bookings,
    //         expenses: sample.expenses,
    //         cash_collected: sample.cashCollected,
    //         billings: sample.billings,
    //         balance: sample.balance,
    //         is_forecast: sample.is_forecast,
    //     }),
    //     headers: {
    //         "Content-type": "application/json; charset=UTF-8"
    //     }
    // })

    d3.json('/api/metricValues/bulk', {
        method: "POST",
        body: JSON.stringify(sample),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })

    initializeSpreadsheet(MV)
    updateMetric("bookings")
    updateMetric("expenses")
    updateMetric("cashCollected")
    updateMetric("balance")
})

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


// Override keyboard interaction for jexcel. Copy & Paste still works.
// jexcel.keyDownControls = function (e) {
//     return // Don't let user tab to create new columns
// }