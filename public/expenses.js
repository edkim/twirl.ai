let expensesByMonth = {}


function initializeExpenses() {
    d3.csv("expenses.csv").then((data) => {
        data.map(d => {
            d.date = parseTime(d["Date"])
            d.value = Number(d["Amount"].replace(/[^0-9.-]+/g, ""))

            expensesByMonth[d.date] = d.value

            return d
        })

        updateExpenses(data)
    })
}

function updateExpenses(data) {
    d3.select("#expenses-chart svg").remove() // Clear existing chart, if any
    const svg = d3.select("#expenses-chart")
        .append("svg")
        .attr("viewBox", [0, 0, width, height])

    const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]);

    //Find the most recent date and add 12 months to extend the chart into the future
    const mostRecentDate = new Date(d3.max(data, (d) => {
        return d.date
    }))

    let forecastEndDate = new Date(mostRecentDate)
    forecastEndDate = forecastEndDate.setFullYear(forecastEndDate.getFullYear() + 1)


    const firstDate = d3.min(data, (d) => {
        return d.date
    })

    // TODO Extract this regression code into shared function
    const linearRegression = d3.regressionLinear()
        .x(d => d.date)
        .y(d => d.value)

    const slope = linearRegression(data).a
    const yIntercept = linearRegression(data).b
    let forecastData = []

    let futureMonth = new Date(mostRecentDate)
    while (futureMonth < forecastEndDate) {
        if (futureMonth.getMonth() == 11) {
            futureMonth = new Date(futureMonth.getFullYear() + 1, 1, 0);
        } else {
            futureMonth = new Date(futureMonth.getFullYear(), futureMonth.getMonth() + 2, 0);
        }
        let futureValue = Math.round(slope * futureMonth + yIntercept)

        expensesByMonth[futureMonth] = futureValue
        forecastData.push({
            date: futureMonth,
            value: futureValue
        })

    }

    console.log(expensesByMonth)

    xScale.domain([firstDate, forecastEndDate])
    yScale.domain([0, d3.max(forecastData, function (d) {
        return d.value
    })])

    const yaxis = d3.axisLeft()
        .scale(yScale)

    const xaxis = d3.axisBottom()
        .scale(xScale)
        .ticks(d3.timeMonth.every(3))
        .tickFormat(d3.timeFormat('%b %Y'))

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xaxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");



    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yaxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".75em")
        .attr("y", 6)
        .style("text-anchor", "end")
        .text("Expenses")


    // Add historical data as a line plot
    const line = d3.line()
        .x(function (d, i) { return xScale(d.date) })
        .y(function (d) { return yScale(d.value) })
        .curve(d3.curveMonotoneX)

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .on("click", () => { modal.style.display = "block" })

    // Attach a circle to each datapoint 
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle") 
        .attr("class", "dot")
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return yScale(d.value) })
        .attr("r", 2)


    // Add suggested forecast line
    const forecastLine = d3.line()
        .x(function (d, i) { return xScale(d.date) })
        .y(function (d) { return yScale(d.value) })
        .curve(d3.curveMonotoneX)


    // Regression line (suggested forecast #1)
    // svg.append("path")
    //     .datum(data.slice(-1).concat(forecastData))
    //     .attr("class", "forecast-line")
    //     .attr("id", "expense-forecast")
    //     .attr("d", forecastLine)

    // // Add dots for forecasted values
    // svg.selectAll(".forecast-dot")
    //     .data(forecastData)
    //     .enter().append("circle")
    //     .attr("class", "forecast-dot")
    //     .attr("cx", function (d) { return xScale(d.date) })
    //     .attr("cy", function (d) { return yScale(d.value) })
    //     .attr("r", 2)
    //     .on("mouseover", handleMouseOver)
    //     .on("mouseout", handleMouseOut)

    // Add dragging effects
    d3.selectAll("#expenses-chart .forecast-dot").call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd))
    function dragStart() {
        d3.select(this).raise().attr("r", 4)
    }
    function dragging(d) {
        // TODO: Make a lasso to select multiple forecast points
        if (d3.event.sourceEvent.shiftKey) {
            d3.selectAll("#expenses-chart .forecast-dot").each(function (d, i) {
                d3.select(this).attr("cy", d.y = d3.event.y)
                d.value = Math.round(yScale.invert(d.y))
            })
        } else {
            d3.select(this).attr("cy", d.y = d3.event.y)
            d.value = Math.round(yScale.invert(d.y))
        }
        d3.select("#expense-forecast").attr("d", forecastLine)
    }
    function dragEnd(d) {
        d3.select(this).attr("r", 2)
        for (var f of forecastData) {
            expensesByMonth[f.date] = f.value
        }
        updateBalance()
    }

    // Create Event Handlers for mouse
    function handleMouseOver(d, i) {

        d3.select(this).attr({
            fill: "orange",
        });

        svg.append("text")
            .attr("id", "t-" + i)
            .attr("x", function () { return xScale(d.date) - 30 })
            .attr("y", function () { return yScale(d.value) - 15 })
            .text(() => {
                return [formatDate(d.date), "$" + d.value]
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