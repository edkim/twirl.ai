//Global forecast data model
let forecastBillings = {}

const parseTime = d3.timeParse("%m/%d/%Y")
const formatDate = d3.timeFormat("%b %Y")
const formatSpreadsheetDate = d3.timeFormat("%Y-%m-%d 00:00:00")

let spreadsheetData = []
d3.csv("bookings.csv").then((data) => {

    data = cleanBookingsData(data, d3.timeParse("%m/%d/%Y"))
    initializeSpreadsheet(spreadsheetData, data)
    updateBookings(data, d3.timeParse("%m/%d/%Y"))
})


//TODO Clean this shit up
function cleanBookingsData(data, dateParser) {
    data.map(d => {
        d.date = dateParser(d["Date"])
        d.value = Number(d["Amount"].replace(/[^0-9.-]+/g, ""))
        d.expectedBillings = Number(d["Expected billings"].replace(/[^0-9.-]+/g, ""))

        forecastBillings[d.date] = d.expectedBillings
        spreadsheetData.push([formatSpreadsheetDate(d.date), d.value])
        return d
    })

    return data
}