function stateMap(us,states){

    var color = d3.scale.linear()
  .domain(["0.15", "3"])
.range(["#ffffff","#258039"]).interpolate(d3.interpolateLab);

states.forEach(function(state){
var dataPro = state.State;
    var dataValue = +state.Percentage;
    var population = +state.Population;
      var TotalP = +state.totalPopulation;

    us.features.forEach(function(j){
    var usState = j.properties.name;
        if (dataPro == usState){
        j.properties.Percent = dataValue;
        j.properties.Population = population;
        j.properties.totalPopulation = TotalP;
        }
    });

});

    // var center = d3.geo.centroid(china);
    var ratio = 500/960;

        var width = 580;
        var height = 580;

    var projection = d3.geo.albersUsa()
        .scale(width)
        // .center(center)
        .translate([width/2, height/2]);

var numberFormat=d3.format(",");
    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#stateMap").append("svg")
        .attr("width", width + 400)
        .attr("height", height);

     var tooltip2 = d3.select("body")
                            .append("div")
                            .attr("class", "mytooltip2");

    var tooltip3 = d3.select("body")
                            .append("div")
                            .attr("class", "mytooltip3");

    var chinadata = us.features;

      var pop = d3.extent(chinadata, function(d) {return +d.properties.Population});
      var res = d3.extent(chinadata, function(d) {return +d.properties.totalPopulation});
      // setup x
      var xScale = d3.scale.linear().range([100, width - 20]).domain(pop), // value -> display
          xAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(5)
      .orient("bottom")
      .outerTickSize([0]);

      // setup y
      var yScale = d3.scale.linear().range([height-100, 60]).domain(res), // value -> display
          yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .outerTickSize([0]);;

     var x_axis_g = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height -85) + ")")
          .call(xAxis).style('opacity', 0);

      x_axis_g.append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
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
          .style("text-anchor", "end")
          .text("Resident Income");

    var g = svg.append("g");

    var states = g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(chinadata)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) {
            var value = d.properties.Percent;
            if (value) return color(value); });

    var explode_states = g.append("g")
        .attr("id", "explode-states")
        .selectAll("path")
        .data(chinadata)
        .enter().append("path")
        .attr("d", path)
      .style("fill", function(d) {
          var value = d.properties.Percent;
          if (value) return color(value); });

     var default_size = function(d, i) { return 150; };
      var exploder = d3.geo.exploder()
                      .projection(projection)
                      .size(default_size)
                      .position(function(d,i){ return [800, height/2]});
    // Here is the magic!
    // This exploder will create a grid of the states
    // when called on a featurelist selection

   svg.append('g')
    .attr("class", "legendColors")
    .attr("transform", "translate(600,63)");


  var legendColors = d3.legend.color()
    .shapeWidth(40)
    .cells(6)
    .orient("horizontal")
    .labels(["0.1", "0.7", "1.3","1.9", "2.4",">3.0"])
    .scale(color); // our existing color scale

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
            .html("<p> <span style='color:#ff661a; font-size:20px;'>"+"Click the state to get more Info"+"</span>"+ "<br><span style='color:#b35900;'>" + "state:"+" </span>"+ data.properties.name + "<br><span style='color:#b35900;'>"+ "Story:"+"</span>"+data.properties.Percent + "</p>");
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
            .html("<p> <span style='color:#b35900; font-size:20px;'>" + "state:"+" </span>"+ data.properties.name + "<br><span style='color:#b35900; font-size:20px;'>Population:" +"</span>"+ (+data.properties.Population / 1000000)+"million" +"<br><span style='color:#b35900; font-size:20px;'>Per capita disposable income:" +"</span>"+"$"+"</p>");

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

        tooltip2
            .style("display", null)
            .html("<p> <span style='color:#b35900;'>" + "state:"+" </span>"+ data.properties.name + "<br><span style='color:#b35900;'>Population:" +"</span>"+ (+data.properties.Population / 1000000)+"million" +"<br><span style='color:#b35900;'>Per capita disposable income:" +"</span>"+"$"+ "</p>");
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
