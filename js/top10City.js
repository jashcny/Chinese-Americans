

function top10Table(data){
				var table = d3.select("#table1").append("table");

        var header = table.append("thead").append("tr");

				var myArray = [];

				var Percentage = [];

				var CityName =[];

				var numberFormat=d3.format(",");

				data.forEach(function(d, i){

				myArray.push([d.City, d.Chinese_Americans, d.Percentage]);

				CityName.push(d.City)

				Percentage.push(d.Percentage);

				});

        var headerObjs = [
					{label:"Top 20 City",sort_type:"string"},
					{label:"Population",sort_type:"int"},
					{label:"Percentage",sort_type:"float"},
				];



					 header
				     .selectAll("th")
						 .data(headerObjs)
						 .enter()
						 .append("th")
						 .attr("data-sort",function(d) {return d.sort_type;})
						 .text(function(d) { return d.label;});

        	var tablebody = table.append("tbody");
					    rows = tablebody.selectAll("tr")
 	 						.data(myArray)
 	 						.enter()
 	 						.append("tr");


			cells = rows.selectAll("td")
				// each row has data associated; we get it and enter it for the cells.
				.data(function(d) {
					return d;
				})
				.enter()
				.append("td")
				.text(function(d) {
					return d;
				});

					$("table").stupidtable();

}
