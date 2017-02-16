queue()
  .defer(d3.json, "data/us-states.json")
  .defer(d3.json, "data/world-110m.json")
  .defer(d3.json, "data/sankey.json")
  .defer(d3.csv, "data/chinesePopulationByState.csv")
  .defer(d3.csv, "data/populationChange.csv")
  .defer(d3.csv, "data/degree.csv")
  .defer(d3.csv, "data/reasons.csv")
  // .defer(d3.csv, "data/remittanceByCountry.csv")
  .defer(d3.csv, "data/methods.csv")
  .defer(d3.csv, "data/top10City.csv")
  .defer(d3.csv, "data/EEB5.csv")
  .await(ready);

function ready(error, us, world, remittanceFlow,states, allPopulation, generalDegree, moveReasons, visaMethod,top10City, compareEB5) {
  if (error) { console.log(error); }
  //
  stateMap(us, states);

  lineChart(allPopulation);
  piechart(generalDegree);
  barChart(moveReasons);
  // worldMap(world,chineseRemittance);
  // top10Table(top10City);
  sankeyCharts(remittanceFlow);
  // EB5(compareEB5);
  smallMultiples(visaMethod);
  // display();
}




d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
