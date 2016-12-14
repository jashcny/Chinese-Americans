// <!DOCTYPE html>
// <!-- mod of Mike Bostock's block http://bl.ocks.org/mbostock/3020685 -->
// <meta charset="utf-8">
// <style>
//
// body {
//   font: 12px sans-serif;
//   padding: 50px;
// }
//
// .axis path,
// .axis line {
//   fill: none;
//   stroke: #000;
//   shape-rendering: crispEdges;
// }
//
// .tooltip {
//   position: absolute;
//   z-index: 10;
// }
//
// .tooltip p {
//   font-size: 15px;
//   font-family: 'Raleway', sans-serif;
//   background-color: rgba(255,255,255,0.8);
//   line-height: 1.8em;
//   border: rgb(210,210,210) 2px solid;
//   padding-left: 20px;
//   width: 190px;
//   height: 80px;
// }
//
// </style>
// <body>
//
//   <h2>Stacked Area Chart of South African Child Deaths from Issues</h2>
//
//   <p><a href="http://apps.who.int/gho/data/node.main.ghe100-by-cause?lang=en">WHO data</a>, deaths of children 0-4 years old in selected South African countries.</p>
//
//   <div id="chart"></div>
//
//   <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js"></script>
//   <script>
function EB5(data){
var dateFormat = d3.time.format("%Y");

var fullwidth = 960,
  fullheight = 500;

var margin = {top: 20, right: 30, bottom: 30, left: 60},
    width = fullwidth - margin.left - margin.right,
    height = fullheight - margin.top - margin.bottom;

var xScale = d3.time.scale()
    .range([0, width]);

var yScale = d3.scale.linear()
    .range([height, 0]);

var colorScale = d3.scale.category20b();

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(10);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

var stack = d3.layout.stack()
    .offset("zero") // try "silhouette" next, that's a streamgraph!
    //.order("inside-out")  // try this and see what you think
    .values(function(d) { console.log(d); return d.values; })
    .x(function(d) { return dateFormat.parse(d.Year);})
    .y(function(d) { console.log(d); return +d.Issues; });

// use the result of the stack to draw the shapes using area
var area = d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { return xScale(dateFormat.parse(d.Year)); })
    .y0(function(d) { return yScale(d.y0); })
    .y1(function(d) { return yScale(d.y0 + d.y); });


    			var tooltip4 = d3.select("body")
          	.append("div")
          	.attr("class", "mytooltip4");

var svg = d3.select("#EB5").append("svg")
    .attr("width", fullwidth )
    .attr("height", fullheight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  var dataset =  d3.nest()
    .key(function(d) {
      return d.Country; })
    .sortKeys(d3.descending)  // alphabetic order from top layer - Zambia at bottom
    .sortValues(function (a, b) { return (dateFormat.parse(a.Year)) - (dateFormat.parse(b.Year))})
    .entries(data);

  console.log(dataset);

  var layers = stack(dataset);
  console.log("layers", layers);  // it adds a y and y0 to the data values.

  // reset these after doing the layer stacking.
  xScale.domain(d3.extent(data, function(d) { return dateFormat.parse(d.Year); }));
  yScale.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]); // highest combo

  svg.selectAll(".layer")
      .data(layers)
      .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d, i) { return colorScale(i); })
      .on("mouseover", mouseoverFunc)
      .on("mousemove", mousemoveFunc)
      .on("mouseout",	mouseoutFunc); // just count off

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);



// This is tooltip




function mouseoverFunc(d) {
  d3.select(this)
    .transition()
    .style("stroke", "white");


  tooltip4
    .style("display", null) // this removes the display none setting from it
    .html("<p>Country: " + d.key  +
          "<br>Year: " + d.Year +
          "<br>Subscription: " + d.values[0] + "</p>");
  }

function mousemoveFunc(d) {
  tooltip4
    .style("top", (d3.event.pageY - 10) + "px" )
    .style("left", (d3.event.pageX + 10) + "px");
  }

function mouseoutFunc(d) {
  d3.select(this)
    .transition()
    .style("stroke", "none");
  tooltip4
  .style("display", "none");
}  //
 }
