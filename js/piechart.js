function piechart(data) {
var m = 35,
    r = 100;

var fullWidth = (r+m) * 4;
var fullHeight = (r+m) * 4;

var color = d3.scale.ordinal()
            .range(["rgba(214,230,244,0.8)","rgba(141,190,218,0.8)","rgba(53,126,186,0.8)","rgba(11,61,138,0.8)"]);


// Define a pie layout: the pie angle encodes the number of flights. Since our
// data is stored in CSV, the numbers are strings which we coerce to numbers.
var pie = d3.layout.pie()
    .value(function(d) { return d.number; })
    .sort(null);

// Define an arc generator. Note the radius is specified here, not the layout.
var arc = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(r);

var labelArc = d3.svg.arc()
    .outerRadius(r+5)
    .innerRadius(r+5);

  // Insert an svg element (with margin) for each airport in our dataset. A
  // child g element translates the origin to the pie center.
var svg = d3.select("#pie")
      .append("svg")
      .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight)
      .attr("preserveAspectRatio", "xMinYMin slice")
      .append("g")
      .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");


var tooltip5 = d3.select("body").append("div").attr("class", "mytooltip5");
  // Pass the nested per-state values to the pie layout. The layout computes
  // the angles for each arc. Another g element will hold the arc and its label.
var g = svg.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
    .attr("class","arc");


         // Add a colored arc path, with a mouseover showing the number.
g.append("path")
.attr("d", arc)
.style("fill", function(d) { return color(d.data.degree); });
            //  .on("mouseover", mouseover1)
            //  .on("mousemove", mousemove1)
            //  .on("mouseout", mouseout1);

var pos = d3.svg.arc().innerRadius(r + 20).outerRadius(r + 20);

g.append("text")
.attr("transform", function(d) { return "translate(" +
 pos.centroid(d) + ")"; })
 .attr("dy", ".35em")
 .attr("font-size",17)
 .style("text-anchor","middle")
 .text(function(d) { return d.data.number+"%"; });



var degreeType = ["No More than High school","Doctor Degree","Master Degree","Bachelor Degree"];

var degreeType_reversed = degreeType.slice().reverse();

var legend = d3.select("#pie").append("svg")
               .attr("class", "pieLegend")
               .attr("width", r*5)
               .attr("height", r+56 )
               .selectAll("g")
               .data(degreeType_reversed)
               .enter().append("g")
               .attr("transform", function(d,i) {
               xOff = (i % 2) * 150
               yOff = Math.floor(i  / 2) * 38
               return "translate(" + xOff/1.3 + "," + yOff/1.3 + ")"});

d3.select(window).on('resize', resize);
      function resize() {
      }

legend.append("rect")
     .attr("width", 18)
     .attr("height", 18)
     .style("fill", color);

legend.append("text")
     .attr("x", 24)
     .attr("y", 9)
     .attr("dy", ".15em")
     .attr("font-size","12px")
     .text(function(d) { return d; });
  //
  // function mouseover1(d) {
  //
  // d3.select(this)
  //   .transition()
  //   .style("stroke", "white")
  //   .style("stroke-width", "1");
  //
  //
  //     tooltip5
  //       .style("display", null) // this removes the display none setting from it
  //       .html("<p>State: " +d.data.degree+
  //             "<br>Number of people: " + d.data.number+"</p>");
  //     }
  //
  // function mousemove1(d) {
  //     tooltip5
  //       .style("top", (d3.event.pdegreeY - 10) + "px" )
  //       .style("left", (d3.event.pdegreeX + 10) + "px");
  //     }
  //
  // function mouseout1(d) {
  //     d3.select(this)
  //       .transition()
  //       .duration(200)
  //       .style("stroke", null);
  //
  //       tooltip5.style("display", "none");
  //     }  // this sets it to invisible!

}
