function initializeSpreadsheet(data) {
    console.log("spreadsheet", data)
    
    window.spreadsheet = jexcel(document.getElementById('spreadsheet'), {
        data: prepareDate(data),
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
        // onafterchanges: function () {
        //     let i = 0;
        //     for (var d of bookingsData) {
        //         d["Date"] = this.data[i][0]
        //         d["Amount"] = this.data[i][1].toString()
        //         i++
        //     }
        //     updateBookings(bookingsData, d3.timeParse("%Y-%m-%d 00:00:00"))
        // },
    })

    function prepareDate(data) {
        // console.log("data", data)
        // return data.map(d => {
        //     return {
        //         date: formatDateSS(d.date),
        //         bookings: d.value,
        //     }
        // })
        // return data
    }
}

