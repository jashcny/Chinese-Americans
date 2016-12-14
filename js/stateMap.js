function stateMap(us,states){

  //  var color = d3.scale.linear().range(["#ffffff","#258039"]).interpolate(d3.interpolateLab);

// var color = d3.scale.orinal()
//  .domain(["0.1729","14.3467"])
// .range(["#D8FFFF","#00A2EA"]);
    // .domain(["0.1729", "0.4", "0.9", "2","4", "14.3467"])

    // .range(["rgb(223,236,221)", "rgb(161,199,160)", "rgb(105,163,107)", "rgb(80,145,83)", "rgb(29,113,40)","rgb(0,59,70)"]);
    // .range(["rgb(223,236,221)", "rgb(0,59,70)"]);


    var color = d3.scale.linear()
    .domain(["0.15", "3.5"])
    .range(["#ffffff","#258039"]).interpolate(d3.interpolateLab);
    var ratio = 500/960;

        var width = 880;
        var height =580;



    var projection = d3.geo.albersUsa()
                       .translate([width/2, height/2])    // translate to center of screen
                       .scale([700]);          // scale things down so see entire US

    var numberFormat=d3.format(",");
    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#stateMap")
                .append("svg")
                .attr("width", width )
                .attr("height", height);

    var tooltip2 = d3.select("body")
                      .append("div")
                      .attr("class", "mytooltip2");

    var tooltip3 = d3.select("body")
                            .append("div")
                            .attr("class", "mytooltip3");
                            				var allPercentage = [];

  //   states.forEach(function(d, i){
  //     // now we add another data object value, a calculated value.
  //   d.Percentage= ((d.Population / d.totalPopulation)*(100)).toFixed(4);
  //           //
  //           //
  //   				// allPercentage.push(d.Percentage);
  //           //
  //           //
  //           // allPercentage.sort(function(a, b) {
  //           //   return d3.ascending(+a.Percentage, +b.Percentage);
  //           // });
  //           // console.log(allPercentage);
  // });


		  console.log(states);

states.forEach(function(state){
  var dataPro = state.State;
      var dataValue = +state.Percentage;
			console.log(dataValue);
      var population = +state.Population;
      var TotalP = +state.totalPopulation;

      us.features.forEach(function(j){
      var usState = j.properties.name;
      	console.log(usState);
          if (dataPro == usState) {
          j.properties.Rate = dataValue;
          j.properties.Population = population;
          j.properties.totalPopulation = TotalP;
          }
      });

  });


    var chineseAmericandata = us.features;

      var pop = d3.extent(chineseAmericandata, function(d) {return +d.properties.Population});
      var TotalP = d3.extent(chineseAmericandata, function(d) {return +d.properties.totalPopulation});
      // setup x
      var xScale = d3.scale.linear().range([100, width - 250]).domain(pop), // value -> display
          xAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(5)
      .orient("bottom")
      .outerTickSize([0]);

      // setup y
      var yScale = d3.scale.linear().range([height-100, 60]).domain(TotalP), // value -> display
          yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .ticks(12)
      .outerTickSize([0]);;

     var x_axis_g = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height -85) + ")")
          .call(xAxis).style('opacity', 0);

      x_axis_g.append("text")
          .attr("class", "label")
          .attr("x", width-180)
          .attr("y", -16)
          .style("text-anchor", "end")
          .text("Population");

      // y-axis
      var y_axis_g = svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(84, 0 )")
          .call(yAxis)
          .style('opacity', 0);

      y_axis_g.append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 12)
          .attr("dy", ".71em")
          .attr("dx","-1.5em")
          .style("text-anchor", "end")
          .text("Total Population");

    var g = svg.append("g");

    var states = g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(chineseAmericandata)
        .enter().append("path")
        .attr("d", path)
        .attr("x",1000)
        .style("fill", function(d) {
            var value = d.properties.Rate;
						console.log(value);
            console.log(d);
             return color(value); });

    var explode_states = g.append("g")
        .attr("id", "explode-states")
        .selectAll("path")
        .data(chineseAmericandata)
        .enter().append("path")
        .attr("d", path)
         .style("fill", function(d) {
          var value = d.properties.Rate;
          if (value) return color(value); });

     var default_size = function(d, i) { return 150; };
      var exploder = d3.geo.exploder()
                      .projection(projection)
                      .size(default_size)
                      .position(function(d,i){ return [800, height/2]});
    // Here is the magic!
    // This exploder will create a grid of the states
    // when called on a featurelist selection


		svg.append("g")
		  .attr("class", "legendColors")
		  .attr("transform", "translate(480, 4)");

		var legendColors = d3.legend.color()
		  .shapeWidth(41)
      .cells(6)
      .labels(["<0.15%", "0.7%", "1.3%","1.9%", "2.4%",">3.0%"])
      // .labels(["<0.15%", "0.4%", "0.9%", "2%","4%", ">14.5%"])
      // .labels(["<0.15%", ">14.5%"])
		  .orient("horizontal")
		  .scale(color);

		svg.select(".legendColors")
		  .call(legendColors);

    function addButton(text, callback) {
        d3.select("#buttons").append('button')
          .text(text)
          .classed("button", true)
          .on('click', function() {
            // clear running animation
            // hide axis
            x_axis_g.transition().duration(500).style('opacity', 0);
            y_axis_g.transition().duration(500).style('opacity', 0);
            // reset to default size
            exploder.size(default_size);
            callback.call(this);
          })
      }

      addButton('scatter', function(d, i) {


        // hide axis
        x_axis_g.transition().duration(500).style('opacity', 1);
        y_axis_g.transition().duration(500).style('opacity', 1);

        states.transition()
              .duration(700)
              .call(
        exploder
            .size(function(d, i) { return 50; })
            .position(function(d, i) {
                  var x = xScale(+d.properties.Population);
                  var y = yScale(+d.properties.totalPopulation);
                  return [x, y];
                })
              );

          explode_states.style("display", "none");

          d3.select("#info").style("display", "none");
          d3.select(".legendColors").style("display", "none");

      });

      addButton('reset', function() {



        explode_states.style("display", null);

        states.transition()
              .duration(700)
              .attr("d", path)
              .attr("transform", "translate(0,0)");

        d3.select("#info").style("display", "none");
          d3.select(".legendColors").style("display", null);

          exploder.position(function(d, i) {
              return [800, height/2-30];
          });

           d3.selectAll('.highlighted-state')
            .transition()
            .duration(700)
            .attr("d", path)
            .attr("transform", "translate(0,0)")
            .each('end', function() {
                d3.select(this).classed('highlighted-state', false)

            })

        d3.select(this)
            .classed('highlighted-state', true)
            .transition()
            .duration(700)
            .call(exploder);

});


    explode_states.on('mouseover', function(){

        console.log("exploded_states mouseover", d3.select(this).data()[0]);
        var data = d3.select(this).data()[0];


        tooltip2
            .style("display", null)
            .html("<p> <span style='color:#ff661a; font-size:20px;'>"+"Click the state to get more Info"+"</span>"+ "<br><span style='color:#b35900;'>" + "state:"+" </span>"+ data.properties.name + "<br><span style='color:#b35900;'>"+ "Percentage: "+" </span>"+ data.properties.Rate + "<br><span style='color:#b35900;'>"+ "</p>");
        });

       explode_states.on('mousemove', function(){

        tooltip2
            .style("top", (d3.event.pageY - 5) + "px" )
            .style("left", (d3.event.pageX + 5) + "px");

   });

   explode_states.on('mouseout', function(){
   tooltip2.style("display", "none");
   });



    explode_states.on('click', function() {

        var data = d3.select(this).data()[0];



        explode_states.style("display", null);

        d3.select("#info").style("display", null);


        d3.select("#info")
            .html("<p><span style='color:#b35900;'>" + "State:"+" </span>"+ data.properties.name + "<br><span style='color:#b35900;'>Population: " +"</span>"+ numberFormat(+data.properties.Population)+"<br><span style='color:#b35900;'>Total Population: " +"</span>"+ numberFormat(+data.properties.totalPopulation) + "</p>");

        d3.selectAll('.highlighted-state')
            .transition()
            .duration(700)
            .attr("d", path)
            .attr("transform", "translate(0,0)")
            .each('end', function() {
                d3.select(this).classed('highlighted-state', false)

            })

        d3.select(this)
            .classed('highlighted-state', true)
            .transition()
            .duration(700)
            .call(exploder);
    });

    d3.selectAll("g#states path").on("mouseover", function(data) {

        tooltip3
            .style("display", null)
            .html("<p> <span style='color:#b35900;'>" + "state:"+" </span>"+ data.properties.name + "<br><span style='color:#b35900;'>Population:" +"</span>"+ numberFormat(+data.properties.Population) +"<br><span style='color:#b35900;'>Total Population:" +"</span>"+ numberFormat(+data.properties.totalPopulation )+ "</p>");
        })
    .on('mousemove', function(){

        tooltip3
            .style("top", (d3.event.pageY - 5) + "px" )
            .style("left", (d3.event.pageX + 5) + "px");

   })
    .on('mouseout', function(){
   tooltip3.style("display", "none");
   });
}
