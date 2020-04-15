let expensesByMonth = {}

function updateExpenses(data) {
    d3.select("#expenses-chart svg").remove() // Clear existing chart, if any
    const svg = d3.select("#expenses-chart")
        .append("svg")
        .attr("viewBox", [0, 0, width, height])

    setupAxes(svg, data, "expenses")
    addLines(svg, data, "expenses")
}