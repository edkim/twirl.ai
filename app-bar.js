// const data = await d3.csv("bookings.csv");
// console.log(data);

var margin = { top: 20, right: 20, bottom: 70, left: 40 },
  width = 600 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom



// var y = d3.scaleLinear().range([height, 0]);

// var xAxis = d3.svg.axis()
//   .scale(x)
//   .orient("bottom")
//   .tickFormat(d3.time.format("%Y-%m"));

// var yAxis = d3.svg.axis()
//   .scale(y)
//   .orient("left")
//   .ticks(10);

var parseTime = d3.timeParse("%m/%d/%Y")

// var svg = d3.select("body").append("svg")
//   .attr("width", width + margin.left + margin.right)
//   .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//   .attr("transform",
//     "translate(" + margin.left + "," + margin.top + ")");

d3.csv("bookings.csv").then((data) => {
  // console.log(data["Amount"], Number(data["Amount"].replace(/[^0-9.-]+/g, "")))

  // Change Amount from a currency string to a number
  data.map(d => {
    
    d["Date"] = parseTime(d["Date"])
    d["Amount"] = Number(d["Amount"].replace(/[^0-9.-]+/g, ""))
    return d
  })
  for (var row of data) {
    console.log(row["Date"])
    // console.log(row["Amount"], Number(row["Amount"].replace(/[^0-9.-]+/g, "")))
    
  }
  
  // THIS WORKS EXCEPT FOR width of each bar is ???????
  // var x = d3.scaleTime()
  //   .domain(d3.extent(data, d => d["Date"]))
  //   .range([margin.left, width - margin.right])


  // x = d3.scaleBand()
  //   .domain([new Date("Tue Oct 31 2017 00:00:00 GMT-0400"), new Date("Tue Mar 31 2020 00:00:00 GMT-0400")])
  //   .range([margin.left, width - margin.right])
  //   .padding(0.1)

  // WHY ONLY 3 Bands?
  var x = d3.scaleBand()
    .domain(d3.extent(data, d => d["Date"]))
    .rangeRound([0, width])

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d["Amount"])])
    .range([height - margin.bottom, margin.top])

  xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat('%b %Y')))

  yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, data.format))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
      .attr("x", -margin.left)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text(data.y))


  // const svg = d3.create("svg")
  //   .attr("viewBox", [0, 0, width, height]);


  // console.log('svg', svg)
  var svg = d3.select("body")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])

  svg.append("g")
    .attr("fill", "steelblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d, i) => x(i))
    .attr("y", d => y(d["Amount"]))
    .attr("height", d => y(0) - y(d["Amount"]))
    .attr("width", x.bandwidth())

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.65em")
    .attr("transform", "rotate(-45)");

  svg.append("g")
    .call(yAxis);


  // d3.select("body").append("svg")
  // .attr("width", width + margin.left + margin.right)
  // .attr("height", height + margin.top + margin.bottom)
  // .append("g")
  // .attr("transform",
  //   "translate(" + margin.left + "," + margin.top + ")")
  //   .append("g")
  //   .attr("fill", "steelblue")
  //   .selectAll("rect")
  //   .data(data)
  //   .join("rect")
  //   .attr("x", (d, i) => x(i))
  //   .attr("y", d => y(d["Amount"]))
  //   .attr("height", d => y(0) - y(d["Amount"]))
  //   .attr("width", x.bandwidth())
  //   .append("g")
  //   .call(xAxis)
  //   .append("g")
  //   .call(yAxis)

})