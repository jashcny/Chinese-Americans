function worldMap(world,chineseRemittance) {
var width = 900,
    height = 600;

var numberFormat=d3.format(",");

var projection = d3.geo.mercator()
		.rotate([-10,0]).scale(height/5).translate([width / 2, height / 2]).clipExtent([[0,0.1*height],[width,height*0.85]]);

var path = d3.geo.path()
    .projection(projection);

var regionColor = d3.scale.category20();

var graticule = d3.geo.graticule();

var path = d3.geo.path()
	.projection(projection);

	var tooltip6 = d3.select("body")
		.append("div")
		.attr("class", "mytooltip6");

	var svg = d3.select("#worldMap").append("svg")
    .attr("width", width)
    .attr("height", height);

	svg.append("path")
		.datum(graticule)
		.attr("class", "graticule")
		.attr("d", path);

	svg.insert("path", ".graticule")
		.datum(topojson.feature(world, world.objects.land))
		.attr("class", "land")
		.attr("d", path);

	svg.insert("path", ".graticule")
		.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
		.attr("class", "boundary")
		.attr("d", path);

	drawarcs(svg);

d3.select(self.frameElement).style("height", height + "px");

function drawarcs(svg) {

	var arcs = svg.append("g").selectAll('path.arc').data( chineseRemittance, JSON.stringify );

	arcs
		.enter()
		.append('path')
		.attr('class','arc')
		.style("fill", function(d) {
			return regionColor(d.name);
		})
		.attr('d', function(chineseRemittance) {
			var origin = projection([106.2,31.7]);
			var dest = projection([chineseRemittance.yccord, chineseRemittance.xccord]);
			var mid = [ (origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2];

			//define handle points for Bezier curves. Higher values for curveoffset will generate more pronounced curves.
			var curveoffset = 30,
				midcurve = [mid[0]+curveoffset, mid[1]-curveoffset]

			// the scalar variable is used to scale the curve's derivative into a unit vector
			scalar = Math.sqrt(Math.pow(dest[0],2) - 2*dest[0]*midcurve[0]+Math.pow(midcurve[0],2)+Math.pow(dest[1],2)-2*dest[1]*midcurve[1]+Math.pow(midcurve[1],2));

			// define the arrowpoint: the destination, minus a scaled tangent vector, minus an orthogonal vector scaled to the datum.trade variable
			arrowpoint = [
				dest[0] - ( 0.5*(chineseRemittance.remittance/150)*(dest[0]-midcurve[0]) - (chineseRemittance.remittance/150)*(dest[1]-midcurve[1]) ) / scalar ,
				dest[1] - ( 0.5*(chineseRemittance.remittance/150)*(dest[1]-midcurve[1]) - (chineseRemittance.remittance/150)*(-dest[0]+midcurve[0]) ) / scalar
			];

			// move cursor to origin
			return "M" + origin[0] + ',' + origin[1]
			// smooth curve to offset midpoint
				+ "S" + midcurve[0] + "," + midcurve[1]
			//smooth curve to destination
				+ "," + dest[0] + "," + dest[1]
			//straight line to arrowhead point
				+ "L" + arrowpoint[0] + "," + arrowpoint[1]
			// straight line towards original curve along scaled orthogonal vector (creates notched arrow head)
				+ "l" + (0.3*(chineseRemittance.remittance/150)*(-dest[1]+midcurve[1])/scalar) + "," + (0.3*(chineseRemittance.remittance/150)*(dest[0]-midcurve[0])/scalar)
				// smooth curve to midpoint
				+ "S" + (midcurve[0]) + "," + (midcurve[1])
				//smooth curve to origin
				+ "," + origin[0] + "," + origin[1]
		});




	arcs.exit()
		.transition()
		.style('opacity', 0)
		.remove();


		arcs.on("mouseover", mouseoverFunc)
				.on("mousemove", mousemoveFunc)
				.on("mouseout",	mouseoutFunc);

}



						function mouseoverFunc(d) {

							d3.select(this)
								.transition()
								.style("stroke", "white")
								.style("stroke-width", "1");



							tooltip6
								.style("display", null) // this removes the display none setting from it
								.html("<p>Region: " + d.name+
										  "<br>Remittance: "+"$"+ numberFormat(d.remittance) +" million"+ "</p>");
							}

						function mousemoveFunc(d) {

							tooltip6
								.style("top", (d3.event.pageY - 10) + "px" )
								.style("left", (d3.event.pageX + 10) + "px");
							}

						function mouseoutFunc(d) {

							d3.select(this)
								.transition()
								.style("stroke", null)
								.style("stroke-width", null);
					    tooltip6.style("display", "none");
						}  // this sets it to invisible!

}
