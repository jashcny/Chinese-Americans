

      function lineChart(allPopulation){
			//Dimensions and padding
			var fullwidth = 1000;
			var fullheight = 600;
			var margin = {top: 20, right:140, bottom: 80, left:100};

			var width = fullwidth - margin.left - margin.right;
			var height = fullheight - margin.top - margin.bottom;

			//Set up date formatting and years
			var dateFormat = d3.time.format("%Y");

var dateFormat2 = d3.time.format("%Ys");

var numberFormat=d3.format(",");

			//Set up scales
			var xScale = d3.time.scale()
								.range([ 0, width ]);

			var yScale = d3.scale.linear()
								.range([ 0, height ]);

			//Configure axis generators
			var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom")
							.ticks(20)
							.tickFormat(function(d) {
								return dateFormat2(d);
							})
							.outerTickSize([1]);

			var yAxis = d3.svg.axis()
							.scale(yScale)
							.orient("left")
							.ticks(10)
							.outerTickSize([0])
							.innerTickSize([0]);



			//Configure line generator
			// each line dataset must have a d.year and a d.numbers for this to work.
			var line = d3.svg.line()
				.x(function(d) {
					return xScale(dateFormat.parse(d.year));
				})
				.y(function(d) {
					return yScale(+d.numbers);
				});



			//Create the empty SVG image
			var svg = d3.select("#lineChart")
						.append("svg")
						.attr("width", fullwidth)
						.attr("height", fullheight)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


			var tooltip1 = d3.select("body").append("div").attr("class", "mytooltip1");


				function make_y_axis() {
				    return d3.svg.axis()
				        .scale(yScale)
				        .orient("left")
				        .ticks(12)
				}


				//New array with all the years, for referencing later
			var test = d3.keys(allPopulation[0])
			var years = d3.keys(allPopulation[0]).slice(0,20-1);
			console.log(test);
			console.log(years);

				//Create a new, empty array to hold our restructured dataset
				var dataset = [];

				//Loop once for each row in data
				allPopulation.forEach(function (d, i) {

					var countryPopulation= [];

					//Loop through all the years - and get the emissions for this data element
					years.forEach(function (y) {

						// If value is not empty
						if (d[y]) {
							//Add a new object to the new emissions data array - for year, numbers
							countryPopulation.push({
								country: d.CountryName, // we can put the country in here too. It won't hurt.
								year: y,
								numbers: d[y]  // this is the value for, for example, d["2004"]
 							});
						}

					});

					//Create new object with this country's name and empty array
					// d is the current data row... from data.forEach above.
					dataset.push( {
						country: d.CountryName,
						population: countryPopulation // we just built this!
						} );

				});

				//Uncomment to log the original data to the console
				// console.log(data);

				//Uncomment to log the newly restructured dataset to the console
				console.log(dataset);


				//Set scale domains - max and mine of the years
				xScale.domain(
					d3.extent(years, function(d) {
						return dateFormat.parse(d);
					}));

				// max of emissions to 0 (reversed, remember)
				yScale.domain([
					d3.max(dataset, function(d) {
						return d3.max(d.population, function(d) {
							return +d.numbers;
						});
					}),
					0
				]);


				//Make a group for each country
				var groups = svg.selectAll("g")
					.data(dataset)
					.enter()
					.append("g");

				//Within each group, create a new line/path,
				//binding just the emissions data to each one
				groups.selectAll("path")
					.data(function(d) { // because there's a group with data already...
						return [d.population]; // it has to be an array for the line function
					})
					.enter()
					.append("path")
					.attr("class", "linegroups")
					.attr("d", line)
					.attr("stroke",function(d){
						 console.log(d);
						 console.log(d[0]);
						if(d[0].country === "Mainland China"){
							return "#CB0000";}
							else if(d[0].country === "Hong Kong"){
								return "#EB8A44";}
                else if(d[0].country === "United Kingdom"){
  								return "#4C3F54";}
							else if(d[0].country === "Taiwan"){
									return "#1995AD";}
						else {
							return "#BFDCCF";}
						});

					groups.on("mouseover",HoverIn)
								.on("mouseout",HoverOut);

			// Tooltip dots

			var SMcircles = groups.selectAll("dots")
								.data(function(d) { // because there's a group with data already...
											return d.population; // NOT an array here.
								})
								.enter()
								.append("circle")
                .attr("class", "dots");

				SMcircles.attr("cx", function(d) {
						return xScale(dateFormat.parse(d.year));
					})
					.attr("cy", function(d) {
						return yScale(d.numbers);
					})
					.attr("r", 1.5)
          .style("fill","#DDDEDE")
					.style("opacity", 0.9); // this is optional - if you want visible dots or not!

				// Adding a subtle animation to increase the dot size when over it!

				SMcircles
					.on("mouseover", mouseoverFunc)
					.on("mousemove", mousemoveFunc)
					.on("mouseout",	mouseoutFunc);

			// We're putting the text label at the group level, where the country name was originally.
			//We can access data here, because it's already attached!
			// We use the scales to position labels at end of line.
			groups.append("text")
	      .attr("x", function(d) {
	      	if (d.population.length != 0) {
		      	var lastYear = d.population[d.population.length-1].year;
		      	return xScale(dateFormat.parse(lastYear));
		      }
	      })
	      .attr("y", function(d) {
	      	if (d.population.length != 0) {
		      	var lastnumbers = d.population[d.population.length-1].numbers;
		      	return yScale(+lastnumbers);
	      	}
	      })
	      .attr("dx", "3px")
	      .text(function(d) {
	      			return d.country;
	      		})
				.attr("dy",function(d){
					if (d.country === "Mainland China"){
						return "-0.4em";}
						else if (d.country === "Taiwan"){
							return "-0.25em";}
					  else if (d.country === "France"){
						  return "0.55em";}
						else if (d.country === "India"){
							return "0.5em";}
						else {
							return "0.3em"
						}
				})
	      .attr("class", "linelabel");

	 						svg.append("text")
							.attr("class", "xlabel")
							.attr("transform", "translate(" + (margin.left + width / 2) + " ," +
											 (height + margin.bottom) + ")")
							.style("text-anchor", "middle")
						  .attr("dy", "-25")
							.attr("dx","-148")
							.attr("font-size","17px")
						  .text("Decade");


			       	svg.append("text")
							.attr("transform", "rotate(-90)")
							.attr("y", 10 - margin.left)
							.attr("x", 20 - (height / 2))
							.attr("dy", "0.2em")
							.attr("font-size","19px")
							.attr("font-family","Ubuntu")
							.style("text-anchor", "middle")
							.text("Population");

				//Axes
				svg.append("g")
					.attr("class", "xAxis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);

				var yt=svg.append("g")
				.attr("class", "yAxis")
				.call(yAxis)

				yt.selectAll("text")
	    		.attr("x", -15)
	    		.attr("dy", 3.5);

				svg.append("g")
		        .attr("class", "grid")
            .call(make_y_axis()
		            .tickSize(-width, 0, 0)
		            .tickFormat("")
		        )



				function mouseoverFunc(d) {

					d3.select(this)
						.transition()
						.duration(700)
						.style("opacity", 1)
						.attr("r", 7.5);


					tooltip1
						.style("display", null) // this removes the display none setting from it
						.html("<p><strong>Region of last residence: </strong>" + d.country +
									"<br><strong>Decade: </strong>" + d.year +"s"+
								  "<br><strong>Number: </strong>" + numberFormat(d.numbers) + "</p>");
					}

				function mousemoveFunc(d) {
					 tooltip1
						.style("top", (d3.event.pageY - 10) + "px" )
						.style("left", (d3.event.pageX + 10) + "px");
					}

				function mouseoutFunc(d) {

					d3.select(this)
						.transition()
						.style("opacity", 0.3)
						.attr("r", 1.5);
			    tooltip1.style("display", "none");
				}  // this sets it to invisible!

					function HoverIn(d){
							 d3.select(this).select("path")
									 .attr("id", "focused");
							 d3.select(this).select("text")
									 .attr("id", "focused");
							 }

							 function HoverOut(d) {
							d3.select(this).select("path")
									 .attr("id", null);
							 d3.select(this).select("text")
									 .attr("id", null);
			  }

}
