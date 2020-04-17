function updateMetric(metric) {
    const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    d3.select(`#${metric}-chart`).remove() // Clear any existing chart
    
    d3.select('body')
        .append("div")
        .attr("id", `${metric}-chart`)
    
    const svg = d3.select(`#${metric}-chart`)
        .append("svg")
        .attr("viewBox", [0, 0, width, height])

    setupAxes(svg, metric, xScale, yScale)
    addLines(svg, metric, xScale, yScale)
}

function makeForecast(metric) {
    let forecastMonth = new Date(lastDataDate)

    switch(metric) {
        case "cashCollected":
            CURRENT_COLLECTION_RATE = 0.8 // TODO: Let user adjust, or base on historical collections

            while (forecastMonth < forecastEndDate) {
                let previousMonth = forecastMonth
                forecastMonth = nextMonth(forecastMonth)

                let previousMonthForecasts = MV.find(x => x.date.getTime() == previousMonth.getTime())
                if (previousMonthForecasts && previousMonthForecasts.billings) { // previous month Billings forecast exists
                    billingsLastMonth = previousMonthForecasts.billings
                } else { 
                    console.error("Last month's billings data found")
                }
                // use last month's forecast billings
                let futureCashCollected = Math.round(CURRENT_COLLECTION_RATE * billingsLastMonth) // TODO: Add pastDue AR
                // pastDueARByMonth[forecastMonth] = (1 - PAST_DUE_COLLECTION_RATE) * pastDueARByMonth[previousMonth] + (1 - CURRENT_COLLECTION_RATE) * forecastBillings
                updateMV(metric, forecastMonth, futureCashCollected)
            }
        case "balance":
            while (forecastMonth < forecastEndDate) {
                let previousMonth = forecastMonth
                forecastMonth = nextMonth(forecastMonth)

                let previousMonthForecasts = MV.find(x => x.date.getTime() == previousMonth.getTime())
                if (previousMonthForecasts && previousMonthForecasts.balance) { // previous month Billings forecast exists
                    previousBalance = previousMonthForecasts.balance
                } else {
                    console.error("no previous balance data or forecast found")
                }

                let forecastMonthData = MV.find(x => x.date.getTime() == forecastMonth.getTime())
                if (forecastMonthData && forecastMonthData.expenses && forecastMonthData.cashCollected) {
                    forecastExpenses = forecastMonthData.expenses
                    forecastCashCollected = forecastMonthData.cashCollected
                } else {
                    console.error("no previous expense data or forecast found")
                }
                let forecastBalance = previousBalance + forecastCashCollected - forecastExpenses

                updateMV(metric, forecastMonth, forecastBalance)
            }
        default: // Forecast is based on a linear regression
            const linearRegression = d3.regressionLinear()
                .x(d => d.date)
                .y(d => d[metric])

            const slope = linearRegression(historicalData()).a
            const yIntercept = linearRegression(historicalData()).b


            while (forecastMonth < forecastEndDate) {
                forecastMonth = nextMonth(forecastMonth)
                let forecastValue = Math.round(slope * forecastMonth + yIntercept)

                updateMV(metric, forecastMonth, forecastValue)

                if (metric == "bookings") { // Add bookings to billings from prior year and store as billings forecast
                    // TODO: Account for churn
                    let fData = MV.find(x => x.date.getTime() == forecastMonth.getTime())
                    let dateLastYear = new Date(fData.date.getFullYear() - 1, fData.date.getMonth(), 0)
                    let forecastBillings = fData.bookings + MV.find(x => x.date.getTime() == dateLastYear.getTime()).billings
                    updateMV("billings", forecastMonth, forecastBillings)
                }
            }


    } 
}

function nextMonth(month) {
    if (month.getMonth() == 11) {
        month = new Date(month.getFullYear() + 1, 1, 0);
    } else {
        month = new Date(month.getFullYear(), month.getMonth() + 2, 0);
    }
    return month
}

function updateMV(metric, forecastMonth, forecastValue) {
    let idx = MV.findIndex(x => x.date.getTime() === forecastMonth.getTime())
    if (idx == -1) { // Insert new forecast entry accessible using forecastData()
        MV.push({
            date: forecastMonth,
            [metric]: forecastValue,
            is_forecast: true
        })
    } else {
        MV[idx][metric] = forecastValue
    }
}

// When base metrics change, we should update calculated metrics (i.e. bookings should update bililngs)
function syncForecasts() {
    forecastData().forEach(f => {
        let dateLastYear = new Date(f.date.getFullYear() - 1, f.date.getMonth(), 0)
        f.billings = f.bookings + MV.find(x => x.date.getTime() == dateLastYear.getTime()).billings
    })
}