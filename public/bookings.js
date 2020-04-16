function updateBookings() {


    d3.select("#bookings-chart svg").remove() // Clear any existing bookings chart
    const svg = d3.select("#bookings-chart")
        .append("svg")
        .attr("viewBox", [0, 0, width, height])

    setupAxes(svg, "bookings")
    addLines(svg, "bookings")
}



