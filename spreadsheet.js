function initializeSpreadsheet(data, bookingsData) {
    window.spreadsheet = jexcel(document.getElementById('spreadsheet'), {
        data: data,
        columns: [
            {
                type: 'calendar',
                title: 'Date',
                options: { format: "MM/DD/YYYY" },
                width: 90
            },
            {
                type: 'numeric',
                title: 'Bookings',
                mask: '$#,##',
                width: 80,
                decimal: ','
            },
        ],
        onafterchanges: function () {
            console.log(this.data, bookingsData) // Update historical data in chart
            let i = 0;
            for (var d of bookingsData) {
                d["Date"] = this.data[i][0]
                d["Amount"] = this.data[i][1].toString()
                i++
            }
            updateBookings(bookingsData, d3.timeParse("%Y-%m-%d 00:00:00"))
        }
    })
}

