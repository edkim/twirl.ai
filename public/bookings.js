const margin = { top: 20, right: 20, bottom: 70, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom

const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]);

function updateBookings(data) {

    d3.select("#bookings-chart svg").remove() // Clear any existing bookings chart
    const svg = d3.select("#bookings-chart")
        .append("svg")
        .attr("viewBox", [0, 0, width, height])

    setupAxes(svg, data, "bookings")
    addLines(svg, data, "bookings")



}

function setupAxes(svg, data, metric) {
    //Find the most recent date and add 12 months to extend the chart into the future
    const mostRecentDate = new Date(d3.max(data, (d) => {
        return d.date
    }))

    let forecastEndDate = new Date(mostRecentDate.getFullYear() + 1, mostRecentDate.getMonth(), 0)

    const firstDate = d3.min(data, (d) => {
        return d.date
    })

    const linearRegression = d3.regressionLinear()
        .x(d => d.date)
        .y(d => d[metric])


    const slope = linearRegression(data).a
    const yIntercept = linearRegression(data).b

    let forecastMonth = new Date(mostRecentDate)
    while (forecastMonth < forecastEndDate) {
        if (forecastMonth.getMonth() == 11) {
            forecastMonth = new Date(forecastMonth.getFullYear() + 1, 1, 0);
        } else {
            forecastMonth = new Date(forecastMonth.getFullYear(), forecastMonth.getMonth() + 2, 0);
        }
        let futureValue = Math.round(slope * forecastMonth + yIntercept)

        let idx = forecastData.findIndex(x => x.date.getTime() === forecastMonth.getTime())
        if (idx == -1) { // Insert new entry into forecastData
            forecastData.push({
                date: forecastMonth,
                [metric]: futureValue,
            })
        } else {
            forecastData[idx][metric] = futureValue
        }
    }
    console.log(metric, forecastData)

    xScale.domain([firstDate, forecastEndDate])
    yScale.domain([0, d3.max(forecastData, function (d) {
        return d[metric]
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
        .text(toTitleCase(metric))

}

function addLines(svg, data, metric) {
    // Add historical data as a line plot
    const line = d3.line()
        .x(function (d, i) { return xScale(d.date) })
        .y(function (d) { return yScale(d[metric]) })
        .curve(d3.curveMonotoneX)

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .on("mouseover", mouseoverLine)
        .on("mouseout", mouseoutLine)
        .on("click", () => { modal.style.display = "block" })

    // Attach a circle to each datapoint 
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return yScale(d[metric]) })
        .attr("r", 2)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)


    const forecastLine = d3.line()
        .x(function (d, i) { return xScale(d.date) })
        .y(function (d) { return yScale(d[metric]) })
        .curve(d3.curveMonotoneX)


    // Regression line (suggested forecast #1)
    svg.append("path")
        .datum(forecastData)
        .attr("class", "forecast-line")
        .attr("id", "forecast1")
        .attr("d", forecastLine)

    // Add dots for forecasted values
    svg.selectAll(".forecast-dot")
        .data(forecastData)
        .enter().append("circle")
        .attr("class", "forecast-dot")
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return yScale(d[metric]) })
        .attr("r", 2)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)

    // Add dragging effects
    d3.selectAll(`#${metric}-chart .forecast-dot`).call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd))
    function dragStart() {
        d3.select(this).raise().attr("r", 4)
    }
    function dragging(d) {
        // TODO: Make a lasso to select multiple forecast points
        if (d3.event.sourceEvent.shiftKey) {
            d3.selectAll(`#${metric}-chart .forecast-dot`).each(function (d, i) {
                d3.select(this).attr("cy", d.y = d3.event.y)
                d.value = Math.round(yScale.invert(d.y))
            })
        } else {
            d3.select(this).attr("cy", d.y = d3.event.y)
            d.value = Math.round(yScale.invert(d.y))
        }
        d3.select("#forecast1").attr("d", forecastLine)
    }
    function dragEnd(d) {
        d3.select(this).attr("r", 2)

        // TODO: update forecasted billings based on new bookings
        for (var f of forecastData) {
            let dateLastYear = new Date(f.date.getFullYear() - 1, f.date.getMonth(), 0)
            forecastBillings[f.date] = f.value + forecastBillings[dateLastYear]
        }
        updateAR()
    }

    function mouseoverLine(d, i) {
        this.style.stroke = "#c6c600"
    }
    function mouseoutLine(d, i) {
        this.style.stroke = "orange"
    }
    // Create Event Handlers for mouse
    function handleMouseOver(d, i) {

        d3.select(this).attr({
            fill: "orange",
        });

        svg.append("text")
            .attr("id", "t-" + i)
            .attr("x", function () { return xScale(d.date) - 30 })
            .attr("y", function () { return yScale(d[metric]) - 15 })
            .text(() => {
                return [formatDate(d.date), " $" + d[metric]]
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

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}