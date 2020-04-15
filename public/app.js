/*
 *  app.js retrieves all of the data for the client-side.
 *  Data is from DB, or CSV files if user doesn't have any saved data yet.
 *  The data is then passed to other functions to initialize charts and jexcel for manual input.
 */


let metricValues = [] // Global array for talking to DB [{date, metric_id, value, is_forecast}]
let MV = {} // Global MetricValues map for client-side use
let MVSS = [] 
let spreadsheetData = []


const parseDateCSV = d3.timeParse("%m/%d/%Y")
const parseDateSS = d3.timeParse("%Y-%m-%d 00:00:00") // TO DO: Delete
const formatDate = d3.timeFormat("%b %Y")
const formatDateSS = d3.timeFormat("%Y-%m-%d 00:00:00") // Format needed for jExcel spreadsheet

d3.csv("sample_data.csv").then((csvData) => {
    
    csvData.map(d => {
        let date = parseDateCSV(d["Date"]), // Date object for use in most places
            ssDate = formatDateSS(date) // String for jExcel use

        MVSS.push([
            date,
            ssDate,
            Number(d["Bookings"].replace(/[^0-9.-]+/g, "")),
            Number(d["Expenses"].replace(/[^0-9.-]+/g, "")),
            Number(d["Cash Collected"].replace(/[^0-9.-]+/g, "")),
            Number(d["Billings"].replace(/[^0-9.-]+/g, "")),
            Number(d["AR - Current"].replace(/[^0-9.-]+/g, "")),
            Number(d["AR - Past Due"].replace(/[^0-9.-]+/g, "")),
            Number(d["Ending Balance"].replace(/[^0-9.-]+/g, "")),
        ])
        // console.log("MV", MV)

        MV[date] = {
            bookings: Number(d["Bookings"].replace(/[^0-9.-]+/g, "")),
            expenses: Number(d["Expenses"].replace(/[^0-9.-]+/g, "")),
            cashCollected: Number(d["Cash Collected"].replace(/[^0-9.-]+/g, "")),
            billings: Number(d["Billings"].replace(/[^0-9.-]+/g, "")),
            currentAR: Number(d["AR - Current"].replace(/[^0-9.-]+/g, "")),
            pastDueAR: Number(d["AR - Past Due"].replace(/[^0-9.-]+/g, "")),
            balance: Number(d["Ending Balance"].replace(/[^0-9.-]+/g, "")),
        }

        // console.log(MV[date]);
        // MV["bookings"] = Number(d["Bookings"].replace(/[^0-9.-]+/g, ""))
        // MV["expenses"] = Number(d["Expenses"].replace(/[^0-9.-]+/g, ""))
        // MV["cashCollected"] = Number(d["Cash Collected"].replace(/[^0-9.-]+/g, ""))
        // MV["billings"] = Number(d["Billings"].replace(/[^0-9.-]+/g, ""))
        // MV["currentAR"] = Number(d["AR - Current"].replace(/[^0-9.-]+/g, ""))
        // MV["pastDueAR"] = Number(d["AR - Past Due"].replace(/[^0-9.-]+/g, ""))
        // MV["balance"] = Number(d["Ending Balance"].replace(/[^0-9.-]+/g, ""))

        // TODO: Test posting to DB
        metricValues.push({ "date": MV["date"], "metric_id": 1, "value": MV["bookings"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 2, "value": MV["expenses"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 3, "value": MV["cashCollected"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 4, "value": MV["balance"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 5, "value": MV["billings"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 6, "value": MV["currentAR"], "is_forecast": false })
        metricValues.push({ "date": MV["date"], "metric_id": 7, "value": MV["pastDueAR"], "is_forecast": false })
    })

    initializeSpreadsheet(MVSS)
    updateBookings(MV)
    updateAR(MV)
    updateExpenses(MV)
})

// initializeExpenses()


// //TODO Clean this shit up
// function cleanBookingsData(data, dateParser) {
//     data.map(d => {
//         d.date = dateParser(d["Date"])
//         d.value = Number(d["Amount"].replace(/[^0-9.-]+/g, ""))
//         d.expectedBillings = Number(d["Expected billings"].replace(/[^0-9.-]+/g, ""))

//         forecastBillings[d.date] = d.expectedBillings
//         spreadsheetData.push([formatSpreadsheetDate(d.date), d.value])
//         return d
//     })

//     return data
// }

// var modal = document.getElementById('modal')
// modal.onclick = function () {
//     modal.style.display = "none";
// }
// var spreadsheet = document.getElementById('spreadsheet')
// spreadsheet.onclick = function (e) {
//     e.stopPropagation() // Prevents click on spreadsheet from closing modal
// }

// // Override keyboard interaction for jexcel. Copy & Paste still works.
// jexcel.keyDownControls = function (e) {
//     return // Don't let user tab to create new columns
// }