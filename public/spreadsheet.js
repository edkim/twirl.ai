/*
 * The spreadsheet allows users to view and input historical data
 * jexcel requires very particular setup, including the order of columns
 * The current column order is:
   1. date (hidden)
   2. formatted date
   3. bookings
   4. expenses
   5. billings
   6. cash collected
   7. AR - current
   8. AR - past due
   9. cash balance
   10. is_forecast (hidden)
*/


function initializeSpreadsheet(data) {
    window.spreadsheet = jexcel(document.getElementById('spreadsheet'), {
        data: data,
        columns: [
            {
                type: 'hidden',
                title: `jExcel doesn't like this date`,
            },
            {
                type: 'calendar',
                title: 'Date',
                options: { format: "MM/DD/YYYY", readonly: 0 },
                width: 90
            },
            {
                type: 'numeric',
                title: 'Bookings',
                mask: '$#,##',
                width: 80,
            },
            {
                type: 'numeric',
                title: 'Expenses',
                mask: '$#,##',
                width: 80,
            },
            {
                type: 'numeric',
                title: 'Billings',
                mask: '$#,##',
                width: 80,
            },
            {
                type: 'numeric',
                title: 'Cash Collected',
                mask: '$#,##',
                width: 120,
            },
            // {
            //     type: 'numeric',
            //     title: 'AR - Current',
            //     mask: '$#,##',
            //     width: 120,
            // },
            // {
            //     type: 'numeric',
            //     title: 'AR - Past Due',
            //     mask: '$#,##',
            //     width: 120,
            // },
            {
                type: 'numeric',
                title: 'Cash Balance',
                mask: '$#,##',
                width: 120,
            },
            {
                type: 'hidden',
                title: 'Is forecast',
            },
        ],
        onafterchanges: function () {
            // TODO: Make this work
            spreadsheetToMV(this.data)
        },
    })
}

function spreadsheetToMV(data) {
    MV = [] // Empty out main data object
    let metricMap = {
        2: "bookings",
        3: "expenses",
        4: "billings",
        5: "cashCollected",
        6: "balance",
        7: "is_forecast",
    }
    // TODO: Replace historical data in MV with Spreadsheet values. If error notify user and revert SS values.
    data.map(row => {
        let date = parseDateSS(row[1]) // ssDate
        if (!date) return // Ignore row if there's no date

        let mvRow = {}

        mvRow["date"] = date

        for (var i=2; i < row.length; i++) { // skip date columns
            if (typeof row[i] == "string") {
                // console.log("bookings", Number(row[i].replace(/[^0-9.-]+/g, "")))
                mvRow[metricMap[i]] = Number(row[i].replace(/[^0-9.-]+/g, ""))
            } else {
                mvRow[metricMap[i]] = row[i]
            }
        }

        MV.push(mvRow)
    })
    initializeApp()
    
}