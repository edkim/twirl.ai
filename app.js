const margin = { top: 20, right: 20, bottom: 70, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom

const parseTime = d3.timeParse("%m/%d/%Y")

const svg = d3.select("body")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])


d3.csv("bookings.csv").then((data) => {
    // data.splice(-1,1)
    data.map(d => {
        d.date = parseTime(d["Date"])
        d.value = Number(d["Amount"].replace(/[^0-9.-]+/g, ""))
        return d
    })

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
        let futureValue = slope * futureMonth + yIntercept
        forecastData.push({
            date: futureMonth,
            value: futureValue
        })
    }

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
        .text("Bookings")



    // Add historical data as a line plot
    const line = d3.line()
        .x(function (d, i) { return xScale(d.date) })
        .y(function (d) { return yScale(d.value) })
        .curve(d3.curveMonotoneX)
    
    svg.append("path")
        .datum(data) 
        .attr("class", "line") 
        .attr("d", line); 

    // Attach a circle to each datapoint 
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return yScale(d.value) })
        .attr("r", 2)

    // Add vertical line separating past and present    
    svg.append("line")
        .attr("class", "present-day")
        .attr("x1", xScale(Date.now()))
        .attr("x2", xScale(Date.now()))
        .attr("y1", yScale(0))
        .attr("y2", yScale(d3.max(forecastData, function (d) {
            return d.value
        })))


    const forecastLine = d3.line()
        .x(function(d, i) { return xScale(d.date) })
        .y(function(d) { return yScale(d.value) })
        .curve(d3.curveMonotoneX)


    svg.append("path")
        .datum(forecastData)
        .attr("class", "forecast-line")
        .attr("id", "forecast1")
        .attr("d", forecastLine);

    // Regression line (suggested forecast #1)
    const lastForecast = forecastData[forecastData.length - 1]
    // svg.append("line")
    //     .attr("class", "forecast")
    //     .attr("x1", xScale(forecastData[0].date))
    //     .attr("x2", xScale(lastForecast.date))
    //     .attr("y1", yScale(forecastData[0].value))
    //     .attr("y2", yScale(lastForecast.value))

    // Add dots for forecasted values
    svg.selectAll(".forecast-dot")
        .data(forecastData)
        .enter().append("circle") 
        .attr("class", "forecast-dot")
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return yScale(d.value) })
        .attr("r", 2)

    // Line connecting most recent data point to forecast
    const lastDataPoint = data[data.length - 1]
    svg.append("line")
        .attr("class", "forecast-line")
        .attr("x1", xScale(lastDataPoint.date))
        .attr("x2", xScale(forecastData[0].date))
        .attr("y1", yScale(lastDataPoint.value))
        .attr("y2", yScale(forecastData[0].value))

    // Line continuing most recent value (suggested forecast #2)
    svg.append("line")
        .attr("class", "forecast-line")
        .attr("x1", xScale(lastDataPoint.date))
        .attr("x2", xScale(lastForecast.date))
        .attr("y1", yScale(lastDataPoint.value))
        .attr("y2", yScale(lastDataPoint.value))

    // let forecast2Data = {}
    for (var f of forecastData) {
        svg.append("circle") 
            .attr("class", "forecast-dot") 
            .attr("cx", xScale(f.date))
            .attr("cy", yScale(lastDataPoint.value))
            .attr("r", 2)
        // forecast2Data.push({
        //     date: f.date,
        //     value: lastDataPoint.value
        // })
    }

    // Add dragging effects
    d3.selectAll(".forecast-dot").call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd))
    function dragStart() {
        d3.select(this).raise().attr("r", 4)
        console.log(forecastData)
    }
    function dragging(d) {
        d3.select(this).attr("cy", d.y = d3.event.y)
        d.value = yScale.invert(d.y)
    }
    function dragEnd(d) {
        d3.select(this).attr("r", 2)
        console.log(forecastData)
        d3.select("#forecast1").attr("d", forecastLine)
        //TODO recalculate forecast line
    }

})

