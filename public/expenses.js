let expensesByMonth = {}

function updateExpenses(data) {
    const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]);
    
    d3.select("#expenses-chart svg").remove() // Clear existing chart, if any
    const svg = d3.select("#expenses-chart")
        .append("svg")
        .attr("viewBox", [0, 0, width, height])

    setupAxes(svg, data, "expenses", xScale, yScale)
    addLines(svg, data, "expenses", xScale, yScale)
}