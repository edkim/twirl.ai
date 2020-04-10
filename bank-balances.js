const bankChart = d3.select("#bank-chart")
    .append("svg")
    .attr("viewBox", [0, 0, width/2, height])

// TO DO: Make update function transition new values instead of entirely replacing the chart
updateBalance = function() {
    let expensesByMonth = {}
    let balanceByMonth = {}

    d3.select("#bank-chart svg").remove()
    const bankChart = d3.select("#bank-chart")
        .append("svg")
        .attr("viewBox", [0, 0, width / 2, height])

    d3.csv("bank_balances.csv").then((data) => {

        const margin = { top: 20, right: 0, bottom: 70, left: 60 },
            width = 300 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom

        data.map(d => {
            d.date = parseTime(d["Date"])
            d.balance = Number(d["Ending Balance"].replace(/[^0-9.-]+/g, ""))
            d.expenses = Number(d["Debits"].replace(/[^0-9.-]+/g, ""))
            d.balanceChange = Number(d["Change in Cash"].replace(/[^0-9.-]+/g, ""))

            expensesByMonth[d.date] = d.expenses
            balanceByMonth[d.date] = d.balance
            return d
        })

        const xScale = d3.scaleTime().range([margin.left, width - margin.right])
        const yScale = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top])

        //Find the most recent date and add 12 months to extend the chart into the future
        const mostRecentDate = new Date(d3.max(data, (d) => {
            return d.date
        }))

        let forecastEndDate = new Date(mostRecentDate).setFullYear(mostRecentDate.getFullYear() + 1)


        const firstDate = d3.min(data, (d) => {
            return d.date
        })

        let forecastData = []

        let previousMonth = new Date(mostRecentDate)
        let futureMonth = new Date(mostRecentDate)
        while (futureMonth < forecastEndDate) {
            previousMonth = futureMonth
            if (futureMonth.getMonth() == 11) {
                futureMonth = new Date(futureMonth.getFullYear() + 1, 1, 0);
            } else {
                futureMonth = new Date(futureMonth.getFullYear(), futureMonth.getMonth() + 2, 0);
            }

            if (expensesByMonth[futureMonth] === undefined) {
                expensesByMonth[futureMonth] = expensesByMonth[previousMonth]
            }

            let futureBalance = Math.round(balanceByMonth[previousMonth] + forecastCashCollections[futureMonth] - expensesByMonth[futureMonth])
            balanceByMonth[futureMonth] = futureBalance

            forecastData.push({
                date: futureMonth,
                balance: futureBalance
            })
        }

        xScale.domain([firstDate, forecastEndDate])
        yScale.domain([0, d3.max(data, function (d) {
            return d.balance
        })])

        const yaxis = d3.axisLeft()
            .scale(yScale)

        const xaxis = d3.axisBottom()
            .scale(xScale)
            .ticks(d3.timeMonth.every(3))
            .tickFormat(d3.timeFormat('%b %Y'))

        // x-axis
        bankChart.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(xaxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.5em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // y-axis
        bankChart.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yaxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", ".75em")
            .attr("y", 6)
            .style("text-anchor", "end")
            .text("Cash Balance")

        // Add historical data as a line plot
        const line = d3.line()
            .x(function (d, i) { return xScale(d.date) })
            .y(function (d) { return yScale(d.balance) })
            .curve(d3.curveMonotoneX)

        bankChart.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line); 

        // Attach a circle to each datapoint 
        bankChart.selectAll(".dot")
            .data(data)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function (d) { return xScale(d.date) })
            .attr("cy", function (d) { return yScale(d.balance) })
            .attr("r", 2)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)


        // Add dots for forecasted values
        bankChart.selectAll(".forecast-dot")
            .data(forecastData)
            .enter().append("circle")
            .attr("class", "forecast-dot")
            .attr("cx", function (d) { return xScale(d.date) })
            .attr("cy", function (d) { return yScale(d.balance) })
            .attr("r", 2)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)

        // Create Event Handlers for mouse
        function handleMouseOver(d, i) {  // Add interactivity

            d3.select(this).attr({
                fill: "orange",
            });

            bankChart.append("text")
                .attr("id", "t-" + i)
                .attr("x", function () { return xScale(d.date) - 30 })
                .attr("y", function () { return yScale(d.balance) - 15 })
                .text(() => {
                    return [formatDate(d.date), "$" + d.balance]
                })
                .attr("font-size", 8)
        }

        function handleMouseOut(d, i) {
            d3.select(this).attr({
                fill: "green",
            });

            // Select text by id and then remove
            d3.select("#t-" + i).remove();  // Remove text location
        }
    })
}
updateBalance()