function barChart(data){

  var fullwidth = 650,
      fullheight = 340;

   var margin = {top: 20, right:10, bottom: 1, left: 10},
      width = fullwidth - margin.right - margin.left;
      height = fullheight - margin.top - margin.bottom;

			// Set up the range here - my output sizes for my bars - from 0 to width.
    var xScale = d3.scale.linear()
        .range([0, width/2]);

    var yScale = d3.scale.ordinal()
        .rangeRoundBands([0, height], .03);

    var formatPercent = d3.format("%");

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("top")
        .ticks(5)
        .tickFormat(formatPercent)
        .outerTickSize([2]);


    var svg = d3.select("#barChart").append("svg")
          .attr("class", "barsvg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis");

    svg.append("g")
        .attr("class", "y axis");

				data.sort(function(a, b) {
					return d3.descending(+a.number, +b.number); // make numeric
				});

				// set up the domain here, from the data i read in. I'm starting at 0, not min.
        xScale.domain([ 0, d3.max(data, function(d) {
    					return +d.number ;
    				})]);

        yScale.domain(data.map(function(d) { return d.reason; }));

    var bar = svg.selectAll(".bar")
        .data(data,function(d) { return d.reason; }); // key function!

    var barCreate = bar.enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(0," + yScale(d.reason) + ")"; })
        .style("fill-opacity", 2);

    barCreate.append("rect")
        //.attr("width", age && function(d) { return x(d[age]); })
        .attr("width", function(d) {
 						return xScale(+d.number); // use your scale here:
 					})
        .attr("height", yScale.rangeBand()/2);

        barCreate.append("text")
            .attr("class", "label")
            .attr("x", -3)
            .attr("y", yScale.rangeBand()/3)

            .attr("dy", "0.08em")
            .attr("text-anchor", "end")
            .text(function(d) { return d.reason; });


        barCreate.append("text")
            .attr("class", "value")
            .attr("x", function(d) {
     						return xScale(+d.number);
            })
            .attr("y", yScale.rangeBand() / 3)
            .attr("dx",".45em")
            .attr("dy", ".2em")
            .attr("text-anchor", "front")
            .text(function(d) { return formatPercent(d.number); });

        function make_x_axis() {
            return d3.svg.axis()
                .scale(xScale)
                .orient("top")
                .ticks(5)
        }

        svg.append("g")
		        .attr("class", "grid1")
            .call(make_x_axis()
		            .tickSize(-height, 0, 0)
		            .tickFormat("")
		        )

    svg.transition().select(".x.axis")
        .duration(1000)
        .call(xAxis);
}
