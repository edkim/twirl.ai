const margin = { top: 20, right: 20, bottom: 70, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom

const parseTime = d3.timeParse("%m/%d/%Y")

const svg = d3.select("body")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])

d3.csv("bookings.csv").then((data) => {
    data.map(d => {
        d.date = parseTime(d["Date"])
        d.value = Number(d["Amount"].replace(/[^0-9.-]+/g, ""))
        return d
    })

    const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]);


    xScale.domain(d3.extent(data, function (d) {
        return d.date
    }))
    yScale.domain([0, d3.max(data, function (d) {
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



    const line = d3.line()
        .x(function (d, i) { return xScale(d.date); }) // set the x values for the line generator
        .y(function (d) {  return yScale(d.value); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line


    // const line = d3.line()
    //     .x(function (d) { return xScale(d.date) })
    //     .y(function (d) { return yScale(d.value) })
    
    svg.append("path")
        .datum(data) // 10. Binds data to the line 
        .attr("class", "line") // Assign a class for styling 
        .attr("d", line); // 11. Calls the line generator 

    // 12. Appends a circle for each datapoint 
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function (d) { return xScale(d.date) })
        .attr("cy", function (d) { return yScale(d.value) })
        .attr("r", 5)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    const linearRegression = d3.regressionLinear()
        .x(d => d.date)
        .y(d => d.value)


    svg.append("line")
        .attr("class", "regression")
        .datum(linearRegression(data))
        .attr("x1", d => xScale(d[0][0]))
        .attr("x2", d => xScale(d[1][0]))
        .attr("y1", d => yScale(d[0][1]))
        .attr("y2", d => yScale(d[1][1]));

})



function handleMouseOver(d, i) {  // Add interactivity
    console.log('svg', d3.select(this))
    // Use D3 to select element, change color and size
    d3.select(this).attr("class", "focus");

    // // Specify where to put label of text
    svg.append("text").attr({
        x: function () { return xScale(d.date) - 30; },
        y: function () { return yScale(d.value) - 15; }
    }).text(function () {
            return [d.date, d.value];  // Value of the text
        });
}

function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    d3.select(this).attr("class", "dot");

    // Select text by id and then remove
    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
}



