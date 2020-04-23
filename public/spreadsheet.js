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
                options: { format: "MM/DD/YYYY" },
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
                title: 'Cash Collected',
                mask: '$#,##',
                width: 120,
            },
            {
                type: 'numeric',
                title: 'Billings',
                mask: '$#,##',
                width: 80,
            },
            {
                type: 'numeric',
                title: 'AR - Current',
                mask: '$#,##',
                width: 120,
            },
            {
                type: 'numeric',
                title: 'AR - Past Due',
                mask: '$#,##',
                width: 120,
            },
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
            console.log("spreadsheet data", this.data)
        },
    })
}

