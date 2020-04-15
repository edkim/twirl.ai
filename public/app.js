/*
 *  app.js retrieves all of the data for the client-side.
 *  Data is from DB, or CSV files if user doesn't have any saved data yet.
 *  The data is then passed to other functions to initialize charts and jexcel for manual input.
 */


let metricValues = [] // Global MetricValues array for talking to DB [{date, metric_id, value, is_forecast}]
let MV = [] // Global MetricValues array for d3
let forecastData = [] // Siimlar to MV except for future dates and values
let MVByMonth = {} // Global MetricValues by month



const parseDateCSV = d3.timeParse("%m/%d/%Y")
// const parseDateSS = d3.timeParse("%Y-%m-%d 00:00:00") // TO DO: Delete
// const formatDate = d3.timeFormat("%b %Y")
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
            currentAR: Number(d["AR - Current"].replace(/[^0-9.-]+/g, "")),
            pastDueAR: Number(d["AR - Past Due"].replace(/[^0-9.-]+/g, "")),
            balance: Number(d["Ending Balance"].replace(/[^0-9.-]+/g, "")),
        })

        MVByMonth[date] = {
            bookings: Number(d["Bookings"].replace(/[^0-9.-]+/g, "")),
            expenses: Number(d["Expenses"].replace(/[^0-9.-]+/g, "")),
            cashCollected: Number(d["Cash Collected"].replace(/[^0-9.-]+/g, "")),
            billings: Number(d["Billings"].replace(/[^0-9.-]+/g, "")),
            currentAR: Number(d["AR - Current"].replace(/[^0-9.-]+/g, "")),
            pastDueAR: Number(d["AR - Past Due"].replace(/[^0-9.-]+/g, "")),
            balance: Number(d["Ending Balance"].replace(/[^0-9.-]+/g, "")),
        }

        // TODO: Test posting to DB
        metricValues.push({ "date": MV["date"], "metric_id": 1, "value": MV["bookings"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 2, "value": MV["expenses"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 3, "value": MV["cashCollected"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 4, "value": MV["balance"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 5, "value": MV["billings"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 6, "value": MV["currentAR"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 7, "value": MV["pastDueAR"], "is_forecast": false })
    })

    initializeSpreadsheet(MV)
    updateBookings(MV)
    updateAR(MV)
    updateExpenses(MV)
    updateBalance(MV)
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

// Override keyboard interaction for jexcel. Copy & Paste still works.
// jexcel.keyDownControls = function (e) {
//     return // Don't let user tab to create new columns
// }