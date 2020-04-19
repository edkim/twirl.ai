const margin = { top: 20, right: 20, bottom: 70, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom

const DRAG_THRESHOLD = 0.05 // Trigger special drag behavior at 5% distance from dragged object
let isDragging = false

function setupAxes(svg, metric, xScale, yScale) {
    const firstDate = d3.min(historicalData(), (d) => {
        return d.date
    })

    makeForecast(metric)

    xScale.domain([firstDate, forecastEndDate])
    yScale.domain([0, d3.max(MV, function (d) {
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

function addLines(svg, metric, xScale, yScale) {
    // Add historical data as a line plot
    const line = d3.line()
        .x(function (d, i) { return xScale(d.date) })
        .y(function (d) { return yScale(d[metric]) })
        .curve(d3.curveMonotoneX)

    svg.append("path")
        .datum(historicalData())
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .on("mouseover", mouseoverLine)
        .on("mouseout", mouseoutLine)
        .on("click", () => { modal.style.display = "block" })

    // Attach a circle to each datapoint 
    svg.selectAll(".dot")
        .data(historicalData())
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
        .datum(historicalData().slice(-1).concat(forecastData())) // Add the last historical data point to connect the lines
        .attr("class", "forecast-line")
        .attr("id", `forecast1-${metric}`)
        .attr("d", forecastLine)

    // Add dots for forecasted values
    svg.selectAll(`.forecast-dot .${metric}`)
        .data(forecastData())
        .enter().append("circle")
        .attr("class", `forecast-dot .${metric}`)
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

    function dragStart(d, i) {
        isDragging = true
        d3.select(this).raise().attr("r", 4)
        d3.select("#t-" + i).remove();  // Remove text location

        svg.append("text")
            .attr("id", "d-" + i)
            .attr("x", function () { return xScale(d.date) - 30 })
            .attr("y", function () { return yScale(d[metric]) - 15 })
            .text(() => {
                return [d3.timeFormat("%b %Y")((d.date)), " $" + d[metric]]
            })
            .attr("font-size", 8)
    }
    function dragging(d, i) {
        // TODO: Make a lasso to select multiple forecast points
        // TODO: Make scale dynamic somehow?
        if (d3.event.sourceEvent.shiftKey) {
            d3.selectAll(`#${metric}-chart .forecast-dot`).each(function (d, i) {
                d3.select(this).attr("cy", d3.event.y)
                d[metric] = Math.round(yScale.invert(d3.event.y))
            })
        } else {
            d3.select(this).attr("cy", d3.event.y)
            d[metric] = Math.round(yScale.invert(d3.event.y))
            let selectedX = d3.select(this).attr("cx")
            let selectedY = d3.select(this).attr("cy")
            let cursorDistancePct = (d3.event.x - selectedX) / selectedX // acts as line slope
            let selectedIdx = MV.findIndex(mv => mv.date.getTime() === d.date.getTime())
            
            // Drag cursor past drag action threshold to the left - linear growth
            if (cursorDistancePct < -1 * DRAG_THRESHOLD) {
                let newY

                d3.selectAll(`#${metric}-chart .forecast-dot`).each(function (f, i) {
                    let cx = d3.select(this).attr("cx")

                    if (cx > selectedX) { // only change points to the right of dragged point
                        d3.select(this).attr("class", "forecast-dot curving")

                        let xDistance = cx - selectedX

                        
                        if (cursorDistancePct > -2 * DRAG_THRESHOLD) { // Make all points the same Y Value
                            newY = selectedY
                        } else {
                            newY = parseFloat(selectedY) + xDistance * (cursorDistancePct + 2 * DRAG_THRESHOLD)
                        }
                        

                        d3.select(this).attr("cy", newY)
                        f[metric] = Math.round(yScale.invert(newY))
                    }
                })
            }

            // Drag cursor past drag action threshold to the right - exponential growth
            if (cursorDistancePct > DRAG_THRESHOLD) {

                d3.selectAll(`#${metric}-chart .forecast-dot`).each(function (f, i) {
                    let fIndex = MV.findIndex(mv => mv.date.getTime() === f.date.getTime())
                    
                    if (fIndex > selectedIdx) { // only change points to the right of dragged point
                        d3.select(this).attr("class", "forecast-dot curving")

                        if (cursorDistancePct < 2 * DRAG_THRESHOLD) { // Make all points the same Y Value
                            f[metric] = d[metric]
                        } else {
                            let exponent = cursorDistancePct - 2 * DRAG_THRESHOLD
                            f[metric] = Math.round(d[metric] * Math.pow(1 + exponent, fIndex - selectedIdx))
                        }

                        d3.select(this).attr("cy", yScale(f[metric]))
                    }
                })


            }
        }
        d3.select(`#forecast1-${metric}`).attr("d", forecastLine)
        d3.select("#d-" + i).text(() => {
            return [d3.timeFormat("%b %Y")((d.date)), " $" + d[metric]]
        })


    }
    function dragEnd(d, i) {
        isDragging = false
        d3.select(this).attr("r", 2)
        d3.select("#d-" + i).remove();  // Remove text location
        d3.selectAll(`#${metric}-chart .forecast-dot`).each(function (f, i) {
            d3.select(this).attr("class", "forecast-dot") // reset styles
        })

        syncForecasts()
        updateMetric("cashCollected")
        updateMetric("balance")

        // TODO: Update scale
    }

    function mouseoverLine(d, i) {
        this.style.stroke = "#c6c600"
    }
    function mouseoutLine(d, i) {
        this.style.stroke = "orange"
    }
    
    function handleMouseOver(d, i) { // Add hover text
        if (!isDragging) {
            svg.append("text")
                .attr("id", "t-" + i)
                .attr("x", function () { return xScale(d.date) - 30 })
                .attr("y", function () { return yScale(d[metric]) - 15 })
                .text(() => {
                    return [d3.timeFormat("%b %Y")((d.date)), " $" + d[metric]]
                })
                .attr("font-size", 8)
        }
    }

    function handleMouseOut(d, i) {
        d3.select("#t-" + i).remove();  // Remove hover text
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