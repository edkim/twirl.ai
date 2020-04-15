const CURRENT_COLLECTION_RATE = 0.6
const PAST_DUE_COLLECTION_RATE = 0.5
let forecastCashCollections = {}


let updateBalance = function() {} // Will be defined later
let updateAR = function(data) {
    let pastDueARByMonth = {}

    // TO DO: Make update function transition new values instead of entirely replacing the chart
    d3.select("#ar-chart svg").remove()
    const arChart = d3.select("#ar-chart")
        .append("svg")
        .attr("viewBox", [0, 0, width / 2, height])

    const arMargin = { top: 20, right: 0, bottom: 70, left: 60 },
        arWidth = 300 - arMargin.left - arMargin.right,
        arHeight = 300 - arMargin.top - arMargin.bottom


    const xScale = d3.scaleTime().range([arMargin.left, arWidth - arMargin.right])
    const yScale = d3.scaleLinear().rangeRound([arHeight - arMargin.bottom, arMargin.top])

    //Find the most recent date and add 12 months to extend the chart into the future
    const mostRecentDate = new Date(d3.max(data, (d) => {
        return d.date
    }))

    let forecastEndDate = new Date(mostRecentDate)
    forecastEndDate = forecastEndDate.setFullYear(forecastEndDate.getFullYear() + 1)


    const firstDate = d3.min(data, (d) => {
        return d.date
    })

    let forecastData = []
    
    let previousMonth = new Date(mostRecentDate)
    let futureMonth = new Date(mostRecentDate)
    // while (futureMonth < forecastEndDate) {
    //     previousMonth = futureMonth
    //     if (futureMonth.getMonth() == 11) {
    //         futureMonth = new Date(futureMonth.getFullYear() + 1, 1, 0);
    //     } else {
    //         futureMonth = new Date(futureMonth.getFullYear(), futureMonth.getMonth() + 2, 0);
    //     }

    //     let futureCashCollected = Math.round(CURRENT_COLLECTION_RATE * forecastBillings[previousMonth] + PAST_DUE_COLLECTION_RATE * pastDueARByMonth[previousMonth])
    //     pastDueARByMonth[futureMonth] = (1 - PAST_DUE_COLLECTION_RATE) * pastDueARByMonth[previousMonth] + (1 - CURRENT_COLLECTION_RATE) * forecastBillings[previousMonth]

    //     forecastCashCollections[futureMonth] = futureCashCollected
    //     forecastData.push({
    //         date: futureMonth,
    //         cashCollected: futureCashCollected
    //     })
    // }

    xScale.domain([firstDate, forecastEndDate])
    yScale.domain([0, d3.max(data, function (d) {
        console.log(d.cashCollected)
        return d.cashCollected
    })])

    const yaxis = d3.axisLeft()
        .scale(yScale)

    const xaxis = d3.axisBottom()
        .scale(xScale)
        .ticks(d3.timeMonth.every(3))
        .tickFormat(d3.timeFormat('%b %Y'))

    // x-axis
    arChart.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${arHeight - arMargin.bottom})`)
        .call(xaxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // y-axis
    arChart.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${arMargin.left},0)`)
        .call(yaxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".75em")
        .attr("y", 6)
        .style("text-anchor", "end")
        .text("Cash Collected")

    // Add historical data as a line plot
    const line = d3.line()
        .x(function (d, i) { return xScale(d.date) })
        .y(function (d) { return yScale(d.cashCollected) })
        .curve(d3.curveMonotoneX)

    arChart.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line); 


    // Attach a circle to each datapoint 
    arChart.selectAll(".dot")
        .data(data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return yScale(d.cashCollected) })
        .attr("r", 2)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)


    // Add dots for forecasted values
    arChart.selectAll(".forecast-dot")
        .data(forecastData)
        .enter().append("circle")
        .attr("class", "forecast-dot")
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return yScale(d.cashCollected) })
        .attr("r", 2)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)

    // Create Event Handlers for mouse
    function handleMouseOver(d, i) {  // Add interactivity

        d3.select(this).attr({
            fill: "orange",
        });

        arChart.append("text")
            .attr("id", "t-" + i)
            .attr("x", function () { return xScale(d.date) - 30 })
            .attr("y", function () { return yScale(d.cashCollected) - 15 })
            .text(() => {
                return [formatDate(d.date), "$" + d.cashCollected]
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
}