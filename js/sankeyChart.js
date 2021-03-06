function sankeyCharts(remittanceFlow){


  d3.sankey = function() {
    var sankey = {},
        nodeWidth = 24,
        nodePadding = 8,
        size = [1, 1],
        nodes = [],
        links = [];

    sankey.nodeWidth = function(_) {
      if (!arguments.length) return nodeWidth;
      nodeWidth = +_;
      return sankey;
    };

    sankey.nodePadding = function(_) {
      if (!arguments.length) return nodePadding;
      nodePadding = +_;
      return sankey;
    };

    sankey.nodes = function(_) {
      if (!arguments.length) return nodes;
      nodes = _;
      return sankey;
    };

    sankey.links = function(_) {
      if (!arguments.length) return links;
      links = _;
      return sankey;
    };

    sankey.size = function(_) {
      if (!arguments.length) return size;
      size = _;
      return sankey;
    };

    sankey.layout = function(iterations) {
      computeNodeLinks();
      computeNodeValues();
      computeNodeBreadths();
      computeNodeDepths(iterations);
      computeLinkDepths();
      return sankey;
    };

    sankey.relayout = function() {
      computeLinkDepths();
      return sankey;
    };

    sankey.link = function() {
      var curvature = .5;

      function link(d) {
        var x0 = d.source.x + d.source.dx,
            x1 = d.target.x,
            xi = d3.interpolateNumber(x0, x1),
            x2 = xi(curvature),
            x3 = xi(1 - curvature),
            y0 = d.source.y + d.sy + d.dy / 2,
            y1 = d.target.y + d.ty + d.dy / 2;
        return "M" + x0 + "," + y0
             + "C" + x2 + "," + y0
             + " " + x3 + "," + y1
             + " " + x1 + "," + y1;
      }

      link.curvature = function(_) {
        if (!arguments.length) return curvature;
        curvature = +_;
        return link;
      };

      return link;
    };

    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
      nodes.forEach(function(node) {
        node.sourceLinks = [];
        node.targetLinks = [];
      });
      links.forEach(function(link) {
        var source = link.source,
            target = link.target;
        if (typeof source === "number") source = link.source = nodes[link.source];
        if (typeof target === "number") target = link.target = nodes[link.target];
        source.sourceLinks.push(link);
        target.targetLinks.push(link);
      });
    }

    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
      nodes.forEach(function(node) {
        node.value = Math.max(
          d3.sum(node.sourceLinks, value),
          d3.sum(node.targetLinks, value)
        );
      });
    }

    // Iteratively assign the breadth (x-position) for each node.
    // Nodes are assigned the maximum breadth of incoming neighbors plus one;
    // nodes with no incoming links are assigned breadth zero, while
    // nodes with no outgoing links are assigned the maximum breadth.
    function computeNodeBreadths() {
      var remainingNodes = nodes,
          nextNodes,
          x = 0;

      while (remainingNodes.length) {
        nextNodes = [];
        remainingNodes.forEach(function(node) {
          node.x = x;
          node.dx = nodeWidth;
          node.sourceLinks.forEach(function(link) {
            nextNodes.push(link.target);
          });
        });
        remainingNodes = nextNodes;
        ++x;
      }

      //
      moveSinksRight(x);
      scaleNodeBreadths((width - nodeWidth) / (x - 1));
    }

    function moveSourcesRight() {
      nodes.forEach(function(node) {
        if (!node.targetLinks.length) {
          node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
        }
      });
    }

    function moveSinksRight(x) {
      nodes.forEach(function(node) {
        if (!node.sourceLinks.length) {
          node.x = x - 1;
        }
      });
    }

    function scaleNodeBreadths(kx) {
      nodes.forEach(function(node) {
        node.x *= kx;
      });
    }

    function computeNodeDepths(iterations) {
      var nodesByBreadth = d3.nest()
          .key(function(d) { return d.x; })
          .sortKeys(d3.ascending)
          .entries(nodes)
          .map(function(d) { return d.values; });

      //
      initializeNodeDepth();
      // resolveCollisions();
      for (var alpha = 1; iterations > 0; --iterations) {
        relaxRightToLeft(alpha *= .99);
        resolveCollisions();
        relaxLeftToRight(alpha);
        resolveCollisions();
      }

      function initializeNodeDepth() {
        var ky = d3.min(nodesByBreadth, function(nodes) {
          return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
        });

        nodesByBreadth.forEach(function(nodes) {
          nodes.forEach(function(node, i) {
            node.y = i;
            node.dy = node.value * ky;
          });
        });

        links.forEach(function(link) {
          link.dy = link.value * ky;
        });
      }

      function relaxLeftToRight(alpha) {
        nodesByBreadth.forEach(function(nodes, breadth) {
          nodes.forEach(function(node) {
            if (node.targetLinks.length) {
              var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });

        function weightedSource(link) {
          return center(link.source) * link.value;
        }
      }

      function relaxRightToLeft(alpha) {
        nodesByBreadth.slice().reverse().forEach(function(nodes) {
          nodes.forEach(function(node) {
            if (node.sourceLinks.length) {
              var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });

        function weightedTarget(link) {
          return center(link.target) * link.value;
        }
      }

      function resolveCollisions() {
        nodesByBreadth.forEach(function(nodes) {
          var node,
              dy,
              y0 = 0,
              n = nodes.length,
              i;

          // Push any overlapping nodes down.
          nodes.sort(ascendingDepth);
          for (i = 0; i < n; ++i) {
            node = nodes[i];
            dy = y0 - node.y;
            if (dy > 0) node.y += dy;
            y0 = node.y + node.dy + nodePadding;
          }

          // If the bottommost node goes outside the bounds, push it back up.
          dy = y0 - nodePadding - size[1];
          if (dy > 0) {
            y0 = node.y -= dy;

            // Push any overlapping nodes back up.
            for (i = n - 2; i >= 0; --i) {
              node = nodes[i];
              dy = node.y + node.dy + nodePadding - y0;
              if (dy > 0) node.y -= dy;
              y0 = node.y;
            }
          }
        });
      }

      function ascendingDepth(a, b) {
        return  b.y-a.y;
      }
    }

    function computeLinkDepths() {
      nodes.forEach(function(node) {
        node.sourceLinks.sort(ascendingTargetDepth);
        node.targetLinks.sort(ascendingSourceDepth);
      });
      nodes.forEach(function(node) {
        var sy = 0, ty = 0;
        node.sourceLinks.forEach(function(link) {
          link.sy = sy;
          sy += link.dy;
        });
        node.targetLinks.forEach(function(link) {
          link.ty = ty;
          ty += link.dy;
        });
      });

      function ascendingSourceDepth(a, b) {
        return a.source.y - b.source.y;
      }

      function ascendingTargetDepth(a, b) {
        return a.target.y - b.target.y;
      }
    }

    function center(node) {
      return node.y + node.dy / 2;
    }

    function value(link) {
      return link.value;
    }

    return sankey;
  };


  var margin = {top: 10, right: 80, bottom: 10, left: 180},
      fullWidth = 970,
      fullHeight = 440,
      width = 970 - margin.left - margin.right,
      height = 440 - margin.top - margin.bottom;

  var numberFormat=d3.format(",");
  var tooltip6 = d3.select("body").append("div").attr("class", "mytooltip6");

  // append the svg canvas to the page
  var svg = d3.select("#SankeyRemittance").append("svg")
      .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight)
      .attr("preserveAspectRatio", "xMinYMin slice")
      .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  // Set the sankey diagram properties
  var sankey = d3.sankey()
      .nodeWidth(36)
      .nodePadding(15)
      .size([width, height]);

  var path = sankey.link();


      var nodeChart = {};
      remittanceFlow.nodes.forEach(function(x) { nodeChart[x.name] = x; });
      remittanceFlow.links = remittanceFlow.links.map(function(x) {
        return {
          source: nodeChart[x.source],
          target: nodeChart[x.target],
          value: x.value,
          color: x.color
        };
      });

      // remittanceFlow.links
            console.log(remittanceFlow.links)
    sankey
        .nodes(remittanceFlow.nodes)
        .links(remittanceFlow.links)
        .layout(32);

  // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(remittanceFlow.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke", function(d){return d.color;})
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });


        link.on("mouseover", mouseoverFunc)
  			.on("mousemove", mousemoveFunc)
  			.on("mouseout",	mouseoutFunc);



  // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(remittanceFlow.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
  		  return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() {
  		  this.parentNode.appendChild(this); })
        .on("drag", dragmove));

  // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
  		  return d.color ; });

  // add in the title for the nodes
    node.append("text")
        .attr("x", 40)
        .attr("y", function(d) {return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
        .attr("x",sankey.nodeWidth()-40)
        .attr("text-anchor", "end");

    d3.select(window).on('resize', resize);

    function resize() {

    }

        // node.append("text")
        //     .attr("dx", function(d){if (d.name=="China"){return "-8em";}else{return "-9em";}})
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", function(d) { return d.dy/8 })
        //     .attr("dy", ".35em")
        //     .attr("text-anchor", "end")
        //     .style("fill","white")
        //     .text(
        //     function(d){if (d.name=="China"||d.name=="United States") { return numberFormat(d.value) ; }})
        //     // .filter(function(d) { return d.x < width / 2; })
        //     .attr("x", 6 + sankey.nodeWidth())
        //     .attr("text-anchor", "start");




        				function mouseoverFunc(d) {

        					d3.select(this)
        						.transition()
        						.duration(700)
        						.style("opacity", 1)
        						.attr("r", 7.5);


        					tooltip6
        						.style("display", null) // this removes the display none setting from it
        						.html("<p><strong>Region: </strong> " + d.source.name +"→"+ d.target.name +
        								  "<br><strong>Remittance: </strong>" + numberFormat(d.value) + "</p>");
        					}

        				function mousemoveFunc(d) {
        					 tooltip6
        						.style("top", (d3.event.pageY - 10) + "px" )
        						.style("left", (d3.event.pageX + 10) + "px");
        					}

        				function mouseoutFunc(d) {

        					d3.select(this)
        						.transition()
        						.attr("r", 1.5);
        			    tooltip6.style("display", "none");
        				}  // this sets it to invisible!

  // the function for moving the nodes
    function dragmove(d) {
      d3.select(this).attr("transform",
          "translate(" + (
          	   d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
          	) + "," + (
                     d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
              ) + ")");
      sankey.relayout();
      link.attr("d", path);
    }

    function mouseoverFunc(d) {

      d3.select(this)
        .transition()
        .duration(700)
        .style("opacity", 1)
        .attr("r", 7.5);


      tooltip6
        .style("display", null) // this removes the display none setting from it
        .html("<p><strong>Region: </strong> " + d.source.name +"→"+ d.target.name +
              "<br><strong>Remittance: </strong>" + numberFormat(d.value) + " million dollars"+"</p>");
      }

    function mousemoveFunc(d) {
       tooltip6
        .style("top", (d3.event.pageY - 10) + "px" )
        .style("left", (d3.event.pageX + 10) + "px");
      }

    function mouseoutFunc(d) {

      d3.select(this)
        .transition()
        .attr("r", 1.5);
      tooltip6.style("display", "none");
    }  // this sets it to invisible!

    // the function for moving the nodes
    function dragmove(d) {
    d3.select(this).attr("transform",
    "translate(" + (
    d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
    ) + "," + (
         d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
    ) + ")");
    sankey.relayout();
    link.attr("d", path);
    }



  // the function for moving the nodes
  function dragmove(d) {
  d3.select(this).attr("transform",
  "translate(" + (
   d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
  ) + "," + (
         d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
  ) + ")");
  sankey.relayout();
  link.attr("d", path);
  }



}
