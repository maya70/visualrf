(function($P){
	'use strict',
	$P.ParallelView = $P.defineClass(
			null,
			function ParallelView(config){
				//console.log(config);
				var self = this; 
				self.data = config.data;
				self.mins = config.mins;
				self.maxs = config.maxs; 
				self.selected = self.data; 
				//self.colors = config.colors;
				self.classes = config.classes; 
				self.colors = ["red",
								"blue",
								"orange",
								"#80cdc1"];
				console.log(self.mins);
				console.log(self.maxs);
				//connect to OpenCPU
				//ocpu.seturl("http://192.168.1.11/ocpu/library/randomForest/R");
				
				/*var req = ocpu.rpc("hello", {
         					 myname : ' myname'
        					}, function(output){
          					console.log(output);
        					});*/
        		d3.json('./data/vatanen_prf.json', function(proto){
        			self.proto = [];
        			for(var p=0; p < proto.length; p++){
        				var temp = {};
        				for(var key in proto[p]){
        					//console.log(self.data[0]);
        					for(var kd in self.data[0]){
        						//var key1 = key.split(".").join("|");
        						if(key === kd)
        							temp[key] = proto[p][key];
        					}
        				}
        				temp['sampleID'] = 0;
        				temp['outcome'] = proto[p]['country'];
        				self.proto.push(temp);
        			}
        			self.drawAxes();
        		});
				

			},
			{
			updateLines: function(selection){
				var self = this; 
				self.selected = selection;
				self.foreground.style("display", function(d){
					return self.selected.indexOf(d.sampleID)>=0? null : 'none';
					});
				self.prototypes.style("display", function(d){
					return self.selected.indexOf(d.sampleID)>=0? null : 'none';
					});
			},
			destroy: function(){
				var self=this;
				if(self.svg){ 
					d3.select("#para").selectAll("svg").remove(); 
					self.svg.remove(); 
				}
			},
			drawAxes: function(){

				var self = this;
				var data = self.data;
				var w = 600; //document.body.clientWidth; 
				var margin = {top: 30, right: 40, bottom: 10, left: 40},
				    width = w - margin.left - margin.right,
				    height = 150 - margin.top - margin.bottom;

				var xscale = d3.scale.ordinal().rangePoints([0, width], 1),
				    yscale = {},
				    dragging = {};

				var line = d3.svg.line(),
				    axis = d3.svg.axis().orient("left"),
				    background,
				    foreground, 
				    prototype;


				self.svg = d3.select("#para").append("svg")
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				  .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				// Extract the list of dimensions and create a scale for each.
					var dims = Object.keys(data[0]);
					xscale.domain(dimensions = dims.filter(function(k){
						return (_.isNumber(data[0][k])) && (k !== "outcome") && (k !== "sampleID")  && (yscale[k] = // (k === "outcome") ?  d3.scale.ordinal().domain([self.mins[k], self.maxs[k]]).rangePoints([height, 0])  : 
					              d3.scale.linear().domain([self.mins[k], self.maxs[k]]).range([height, 0])); 	     
					}));

				 // Color map for patient classes (outcomes)
				 var colorMap = {};
				 //var ccount = dims.length + 1;  // get unused colors from brewer
				 var ccount = 0; 
				 for(var key in self.classes)
				 {
				 	colorMap[key] = self.colors[ccount];
				 	ccount++; 
				 }
				 // Add grey background lines for context.
				  background = self.svg.append("g")
				      .attr("class", "background")
				    .selectAll("path")
				      .data(data)
				    .enter().append("path")
				      .attr("d", path);

				  // Add foreground lines for focus.
				  foreground = self.svg.append("g")
				      .attr("class", "foreground")
				    .selectAll("path")
				      .data(data)
				    .enter().append("path")
				      .attr("d", path)
				      .style("stroke", function(d){
				      	 return colorMap[d.outcome];})
				      .style("opacity", 0.3);

				   // Add foreground lines for prototypes.
				  prototype = self.svg.append("g")
				      .attr("class", "foreground")
				    .selectAll("path")
				      .data(self.proto)
				    .enter().append("path")
				      .attr("d", path)
				      .style("stroke", function(d){
				      	 return  colorMap[d.outcome];})
				      .style("stroke-width", 3)
				      .style("opacity", 1);

				  // Add a group element for each dimension.
				  var g = self.svg.selectAll(".dimension")
				      .data(dimensions)
				    .enter().append("g")
				      .attr("class", "dimension")
				      .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
				      .call(d3.behavior.drag()
				        .origin(function(d) { return {x: xscale(d)}; })
				        .on("dragstart", function(d) {
				          dragging[d] = xscale(d);
				          background.attr("visibility", "hidden");
				        })
				        .on("drag", function(d) {
				          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
				          foreground.attr("d", path);
				          prototype.attr("d", path);
				          dimensions.sort(function(a, b) { return position(a) - position(b); });
				          xscale.domain(dimensions);
				          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
				        })
				        .on("dragend", function(d) {
				          delete dragging[d];
				          transition(d3.select(this)).attr("transform", "translate(" + xscale(d) + ")");
				          transition(foreground).attr("d", path);
				          transition(prototype).attr("d", path);
				          background
				              .attr("d", path)
				            .transition()
				              .delay(500)
				              .duration(0)
				              .attr("visibility", null);
				        }));

				      // Add an axis and title.
					  g.append("g")
					      .attr("class", "axis")
					      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
					    .append("text")
					      .style("text-anchor", "middle")
					      .attr("y", -9)
					      .text(function(d) { 
					      	var s = d.split("|");
					      	return s[s.length-1]; });

					  // Add and store a brush for each axis.
					  g.append("g")
					      .attr("class", "brush")
					      .each(function(d) {
					        d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brushstart", brushstart).on("brush", brush));
					      })
					    .selectAll("rect")
					      .attr("x", -8)
					      .attr("width", 16);
					 // Returns the path for a given data point.
					function path(d) {
					 
					  return line(dimensions.map(function(p) {
					  	 return [position(p), yscale[p](d[p])]; }));
					  
					}
					function position(d) {
						  var v = dragging[d];
						  return v == null ? xscale(d) : v;
					}
					function brushstart() {
						  d3.event.sourceEvent.stopPropagation();
					}
					function brush() {
					  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
					      extents = actives.map(function(p) { return yscale[p].brush.extent(); });
					  foreground.style("display", function(d) {
					    return actives.every(function(p, i) {
					      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
					    }) ? null : "none";
					  });
					}
					function transition(g) {
					  return g.transition().duration(500);
					}
					self.foreground = foreground;
					self.prototypes = prototype;
					
				}

				
		});
})(PATREE);