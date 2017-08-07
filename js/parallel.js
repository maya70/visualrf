(function($P){
	'use strict',
	$P.ParallelView = $P.defineClass(
			null,
			function ParallelView(config){
				//console.log(config);
				var self = this; 
				self.data = config.data;
				self.permanentData = config.data; 
				self.mins = config.mins;
				self.maxs = config.maxs; 
				self.selected = self.data; 
				self.rf = config.rf; 
				self.classColors = config.classColors; 
				//self.colors = config.colors;
				self.classes = config.classes; 
				self.colors = ["red",
								"blue",
								"orange",
								"#80cdc1"];
				//console.log(self.mins);
				//console.log(self.maxs);
				d3.select("#clean-butt").on("click", function(){
					self.keep();
				});
				d3.select("#remove-butt").on("click", function(){
					self.remove();
				});
				d3.select("#export-butt").on("click", function(){
					self.export();
				});
				d3.select("#revert-butt").on("click", function(){
					self.revert(); 
				});
				d3.select("#save-butt").on("click", function(){
					self.save();
				});
				d3.select("#meta-butt").on("click", function(){
					self.meta();
				});
				self.dispatch = config.dispatch; 
				self.filtered = false; 

				self.fcolorMap = config.colors;
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
        			//self.destroy();
        			self.drawAxes();
        		});
				

			},
			{
			updateLines: function(selection){
				var self = this; 
				self.selected = selection;
				 // Get lines within extents
			  	var selected = 
					  	self.data.filter(function(d) {
					       var result = self.selected.indexOf(d.sampleID)>=0;
					      return result;
					    });
				self.drawAxes(selected);
				//self.foreground.style("display", function(d){
				//	return self.selected.indexOf(d.sampleID)>=0? null : 'none';
				//	});
				//self.prototypes.style("display", function(d){
				//	return self.selected.indexOf(d.sampleID)>=0? null : 'none';
				//	});
			},
			destroy: function(){
				var self=this;
				//d3.selectAll("rect").remove();
				d3.select("#para").selectAll("svg").selectAll("*").remove();
				//if(self.svg){ 
					//d3.select("#para").selectAll("svg").selectAll(".dimension").remove();
				//	self.svg.remove(); 
				//}
			},
			destroyMeta: function(){
				var self = this;
				d3.select("#metadata-container").selectAll("svg").selectAll("*").remove(); 
				d3.selectAll(".axis-meta").remove();
				d3.selectAll(".axis-label-meta").remove();
				d3.selectAll(".rect-meta").remove();
			},
			setMinMax: function(){
			   var self = this;
			   var p = self.data[0];
	           self.mins = {};
	           self.maxs = {};
	           var axes = Object.keys(p);
	           axes.forEach(function(axis){
							self.mins[axis] = p[axis];
							self.maxs[axis] = p[axis];
						});
	           self.data.forEach(function(record){
		           	axes.forEach(function(axis){
									if(self.mins[axis] > record[axis]) self.mins[axis] = record[axis];
									else if(self.maxs[axis] < record[axis]) self.maxs[axis] = record[axis];
								});
				});
			},
			keep: function(){
				var self = this;
				//console.log("Clean button pressed");
				self.data = self.selected;
				self.setMinMax();
				self.destroy();
			    self.drawAxes();
			},
			remove: function(){
				var self = this;
				self.data = self.data.filter( function( el ) {
				  return self.selected.indexOf( el ) < 0;
				  });
				self.setMinMax();
				self.destroy();
			    self.drawAxes();	
			},
			revert: function(){
				var self = this;
				self.data = self.permanentData; 
				self.rf.revertToOriginal(); 
				self.setMinMax();
				self.destroy();
			    self.drawAxes();	
			},
			export: function(){
				var self = this;
				self.rf.setExported(self.data);
			},
			save: function(filename){
				 var self = this;
				 var data = self.rf.getExported();
				 if(!data) {
				        console.error('Console.save: No data');
				        alert("Please export data first!");
				        return;
				    }

				    if(!filename) filename = 'samples.json';

				    if(typeof data === "object"){
				        data = JSON.stringify(data, undefined, 4);
				    }

				    var blob = new Blob([data], {type: 'text/json'}),
				        e    = document.createEvent('MouseEvents'),
				        a    = document.createElement('a');

				    a.download = filename;
				    a.href = window.URL.createObjectURL(blob);
				    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
				    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				    a.dispatchEvent(e);
			},
			meta: function(){
				// get the file name for the metadata
				var self = this;
				self.destroyMeta();
				var filename = self.rf.metaData();
				d3.json(filename, function(data){
					self.metadata = data;
					self.metadata_selection = [];
					// select only the records that correspond to the exported data 
					var exp = self.rf.getExported();
					if(!exp){
						alert("Please export data first!");
				        return;
					}
					
					for(var i = 0; i < exp.length; i++){
						self.metadata_selection.push(data[parseInt(exp[i]['sampleID'])]);
					}

					/*self.metadata_selection = [];
					var exID = [];
					d3.json('./data/subset61.json', function(subdata){
						
						for(var j = 0; j < subdata.length; j++)
							{
								exID.push(parseInt(subdata[j]['sampleID']));
								//self.metadata_selection.push(data[parseInt(subdata[j]['sampleID'])]);
							}
						for(var k =0; k < data.length; k++){
							if(exID.indexOf(k) < 0)
								self.metadata_selection.push(data[k]);
						}
					
					});*/
					console.log(self.metadata_selection);
					self.showMeta = true;
					self.drawAxes2();
				});

			},
			drawAxes: function(filtered){
				var self = this;
				var data = self.data;
				var numFeatures = Object.keys(data[0]).length;
				var width = (numFeatures <=10)? 660 : (numFeatures+1)*80+60;
				//var margin = {top: 30, right: 40, bottom: 10, left: 140};				 
				var height = 200;
				var xscale = d3.scale.ordinal().rangePoints([0, width], 1),
				    yscale = {},
				    dragging = {};
				var m = [60, 00, 10, 0],
				 	w = width - m[1] - m[3],
    			 	h = height - m[0] - m[2],
					line = d3.svg.line(),
				    axis = d3.svg.axis().orient("left"),
				    background,
				    foreground,
				    legend,
				    highlighted,
				    dimensions,
				    render_speed = 50,
				    brush_count = 0,
				    excluded_groups = [],
				    prototype;
			
				d3.select("#para")
					.style("height", (h + m[0] + m[2]) + "px");

				d3.selectAll("#background")
				    .attr("width", w+ m[1] + m[3]+ 100)
				    .attr("height", h)
				    .style("padding", m.join("px ") + "px");

				d3.selectAll("#foreground")
				    .attr("width", w+ m[1] + m[3]+ 100)
				    .attr("height", h)
				    .style("padding", m.join("px ") + "px");

				d3.selectAll("#highlight")
				    .attr("width", w+ m[1] + m[3]+ 100)
				    .attr("height", h)
				    .style("padding", m.join("px ") + "px");

				d3.selectAll("#svg1")
				    .attr("width", w+ m[1] + m[3]+ 100)
				    .attr("height", h);


				// Foreground canvas for primary view
				foreground = document.getElementById('foreground').getContext('2d');
				foreground.globalCompositeOperation = "destination-over";
				foreground.strokeStyle = "rgba(0,100,160,0.1)";
				foreground.lineWidth = 1.7;
				foreground.fillText("Loading...",w/2,h/2);

				// Highlight canvas for temporary interactions
				highlighted = document.getElementById('highlight').getContext('2d');
				highlighted.strokeStyle = "rgba(0,100,160,1)";
				highlighted.lineWidth = 4;

				// Background canvas
				background = document.getElementById('background').getContext('2d');
				background.strokeStyle = "rgba(0,100,160,0.1)";
				background.lineWidth = 1.7;

				self.svg = d3.select("#svg1").append("svg")
				    .attr("width", w + m[1] + m[3]+ 1000)
				    .attr("height", h + m[0] + m[2])
				    .attr("x", 0)
				    .attr("y", 0)
				  .append("g")
				    .attr("transform", "translate(" + m[1] + "," + m[0] + ")");

				// Extract the list of dimensions and create a scale for each.
					var dims = Object.keys(data[0]);
					xscale.domain(dimensions = dims.filter(function(k){
						return (_.isNumber(data[0][k])) && (k !== "outcome") && (k !== "sampleID")  && (yscale[k] = // (k === "outcome") ?  d3.scale.ordinal().domain([self.mins[k], self.maxs[k]]).rangePoints([height, 0])  : 
					              d3.scale.linear().domain([self.mins[k], self.maxs[k]]).range([h, 0])); 	     
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
				
				  // Add a group element for each dimension.				  
				  //console.log(self.svg.selectAll(".dimension"));
				  var g = self.svg.selectAll(".dimension")
				      .data(dimensions)
				    .enter().append("g")
				      .attr("class", "dimension")
				      .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
				      .on("filter", function(){
				        	console.log("FILTER EVENT!!!!!!");
				        })
				      .call(d3.behavior.drag()
				        //.origin(function(d) { return {x: xscale(d)}; })
				        .on("dragstart", function(d) {
				          dragging[d] = this.__origin__ = xscale(d);
				          this.__dragged__ = false;
				          d3.select("#foreground").style("opacity", "0.35");
				        })
				        .on("drag", function(d) {
				          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
				          //foreground.attr("d", path);
				          //prototype.attr("d", path);
				          dimensions.sort(function(a, b) { return position(a) - position(b); });
				          xscale.domain(dimensions);
				          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
				          brush_count++;
				          this.__dragged__ = true;

				           // Feedback for axis deletion if dropped
				          if (dragging[d] < 12 || dragging[d] > w-12) {
				            d3.select(this).select(".background").style("fill", "#b00");
				          } else {
				            d3.select(this).select(".background").style("fill", null);
				          }
								         
				        })
				        .on("dragend", function(d) {
				           if (!this.__dragged__) {
						            // no movement, invert axis
						           // var extent = invert_axis(d);

						          } else {
						            // reorder axes
						            d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
						            var extent = yscale[d].brush.extent();
						          }

						         
				         //transition(d3.select(this)).attr("transform", "translate(" + xscale(d) + ")");
				          //transition(foreground).attr("d", path);
				          //transition(prototype).attr("d", path);
				         /* background
				              .attr("d", path)
				            .transition()
				              .delay(500)
				              .duration(0)
				              .attr("visibility", null);*/
				           ///////
				            // TODO required to avoid a bug
					          xscale.domain(dimensions);
					         // update_ticks(d, extent);

					          // rerender
					          d3.select("#foreground").style("opacity", null);
					          brush();
					          delete this.__dragged__;
					          delete this.__origin__;
					          delete dragging[d];
				        }));

				       var formatter = d3.format(',.0f');
 					   var logFormatter = d3.format('.3f');
 
				      // Add an axis and title.
					 var gsvg= g.append("svg:g")
					      .attr("class", "axis")
					      .attr("id", "gsvg")
					      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
					      .attr("transform", "translate(0,0)");
      					
      					gsvg.append("svg:text")
					      .style("text-anchor", "middle")
					      .attr("y", function(d,i) { return i%2 == 0 ? -14 : -30 } )
					      .attr("x",0)
					      .attr("class", "axis-label")
					      .text(function(d) { 
					      	var s = d.split("|");
					      	return s[s.length-1]; })
					      .style("font-weight", "bold");
					   
      					d3.selectAll("#gsvg")  
					      .append("rect")
					      	.attr("x", function(d){ return this.parentNode.getBBox().x - 5;})
					      	.attr("y", function(d, i){ 
					      		//console.log(this.parentNode);
					      		return i%2 === 0 ? this.parentNode.getBBox().y - 5: this.parentNode.getBBox().y - 5;})
					      	.attr("width", function(d){ return this.parentNode.getBBox().width + 10;})
					      	.attr("height", function(d) {return 20;})
					      	.style("stroke", "lightgrey")
					      	.style("stroke-width", 2)
					      	.style("fill", function(d){
					      		return self.fcolorMap[d];
					      	})
					      	.style("opacity", 0.7);
					     
					      
					  // Add and store a brush for each axis.
					  g.append("g")
					      .attr("class", "brush")
					      .each(function(d) {
					        d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush));
					      })
					    .selectAll("rect")
					      .attr("x", -8)
					      .attr("width", 16)
					      .append("title")
        					.text("Drag up or down to brush along this axis");

        			self.dispatch.on("filterlines", function(samples){
        				// remove any existing brush and its effects
        				self.selected =
							  	self.data.filter(function(d) {
							       var result = samples.indexOf(d.sampleID)>=0;
							      return result;
							    });	
						//console.log(self.selected);
						xscale.domain(dimensions);
						self.filtered = true; 
				        // rerender
				        d3.select("#foreground").style("opacity", null);
				        brush();
				       				
        				});

        			brush();
					 // Returns the path for a given data point.
					
					 
					// Feedback on rendering progress
					function render_stats(i,n,render_speed) {
					  d3.select("#rendered-count").text(i);
					  d3.select("#rendered-bar")
					    .style("width", (100*i/n) + "%");
					  d3.select("#render-speed").text(render_speed);
					}

					function path(d, ctx, color, proto) {

					  if (color) {
					  	var op = proto? 0.1 : 0.7;
					  	color = (color === "red"? "rgba(255, 0, 0,"+ op+ ")": "rgba(0, 0, 255,"+ op+ ")" );
					  	ctx.strokeStyle = color;
					  }
					  ctx.lineWidth = proto? 14: 1.7;
					  
					  ctx.beginPath();
					  var x0 = xscale(0),
					      y0 = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
					  ctx.moveTo(x0,y0);
					  dimensions.map(function(p,i) {
					    var x = xscale(p) - (i===0? 11: 0),
					        y = yscale[p](d[p]);
					    var cp1x = x - 0.88*(x-x0);
					    var cp1y = y0;
					    var cp2x = x - 0.12*(x-x0);
					    var cp2y = y;
					    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
					    x0 = x;
					    y0 = y;
					  });
					  ctx.lineTo(x0+3, y0);                               // right edge
					  ctx.stroke();
					}
					function position(d) {
						  var v = dragging[d];
						  return v == null ? xscale(d) : v;
					}
					// Get polylines within extents
					function actives() {
					  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
					      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

					  // filter extents and excluded groups
					  var selected = [];
					  data
					    .filter(function(d) {
					      return !_.contains(excluded_groups, d.Hospital);
					    })
					    .map(function(d) {
					    return actives.every(function(p, i) {
					      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
					    }) ? selected.push(d) : null;
					  });

					  // free text search
					  var query = d3.select("#search")[0][0].value;
					  if (query > 0) {
					    selected = search(selected, query);
					  }

					  return selected;
					}
					function brush() {
					  brush_count++;
					  var actives = dimensions.filter(function(p) { 
					  					return  yscale[p].brush && !yscale[p].brush.empty(); }),
					      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

					  // hack to hide ticks beyond extent
					  var b = d3.selectAll('.dimension')[0]
					    .forEach(function(element, i) {
					      var dimension = d3.select(element).data()[0];
					      if (_.include(actives, dimension)) {
					        var extent = extents[actives.indexOf(dimension)];
					        d3.select(element)
					          .selectAll('text')
					          .style('font-weight', 'bold')
					          .style('font-size', '13px')
					          .style('display', function() { 
					            var value = d3.select(this).data();
					            return extent[0] <= value && value <= extent[1] ? null : "none"
					          });
						      } else {
						        d3.select(element)
						          .selectAll('text')
						          .style('font-size', null)
						          .style('font-weight', null)
						          .style('display', null);
						      }
						      d3.select(element)
						        .selectAll('.axis-label')
						        .style('display', null);
						 });
					    
					 
						  // bold dimensions with label
						  d3.selectAll('.axis-label')
						    .style("font-weight", function(dimension) {
						      if (_.include(actives, dimension.name)) return "bold";
						      return null;
						    });

						  // Get lines within extents
						  var selected = [];
						  if(!self.filtered){
	  						  data.filter(function(d) {
	  						       var result = true;
	  						      return result;
	  						    })
	  						    .map(function(d) {
	  						      return actives.every(function(p, dimension) {
	  						        return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1];
	  						      }) ? selected.push(d) : null;
	  						    });
	  						}
	  						else{
	  							selected = self.selected;
	  							self.filtered = false;
	  					   	}

							 /*
							  if (selected.length < data.length && selected.length > 0) {
							    d3.select("#keep-data").attr("disabled", null);
							    d3.select("#exclude-data").attr("disabled", null);
							  } else {
							    d3.select("#keep-data").attr("disabled", "disabled");
							    d3.select("#exclude-data").attr("disabled", "disabled");
							  };*/

							  // total by Medicare status
							  
							var hash = {"Class 1": 0,
							            "Class 2": 1
							            };

							  var tallies = {}; // _(selected).groupBy(function(d) {return d.Therapy;});
							  tallies['Class 1'] = [];
							  tallies['Class 2'] = [];
							  
							 
							  // include empty groups
							  //_(colors).each(function(v,k) { tallies[k] = tallies[k] || []; });
							  
							  //******//

							  // Render selected lines
							  paths(selected, foreground, brush_count, true);
							}

					
				// Adjusts rendering speed 
				function optimize(timer) {
				  var delta = (new Date()).getTime() - timer;
				  render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
				  render_speed = Math.min(render_speed, 300);
				  return (new Date()).getTime();
				}
				  // render polylines i to i+render_speed 
					function render_range(selection, i, max, opacity) {
					  selection.slice(i,max).forEach(function(d) {
					    //var col = colorMap[d.outcome];
					    var col = self.classColors[d.outcome];
					     //(d['outcome'] === self.classes[0])? color2(d.Therapy,opacity) : color(d.Therapy,opacity);
					    path(d, foreground,col);
					  });
					  self.proto.forEach(function(p){
					  	var col =colorMap[p.outcome];
					  	path(p, foreground, col, true);
					  });
					};

				// render a set of polylines on a canvas
				function paths(selected, ctx, count) {
				  var n = selected.length,
				      i = 0,
				      opacity = d3.min([2/Math.pow(n,0.3),1]),
				      timer = (new Date()).getTime();

				  self.selected = selected;
				  selection_stats( n, data.length)

				  shuffled_data = _.shuffle(selected);

				  //data_table(shuffled_data.slice(0,108));

				  ctx.clearRect(0,0,w+1,h+1);

				  // render all lines until finished or a new brush event
				  function animloop(){
				    if (i >= n || count < brush_count) return true;
				    var max = d3.min([i+render_speed, n]);
				    render_range(shuffled_data, i, max, opacity);
				    render_stats(max,n,render_speed);
				    i = max;
				    timer = optimize(timer);  // adjusts render_speed
				  };

				  d3.timer(animloop);

				  // Feedback on selection
					function selection_stats(n, total) {
					  d3.select("#data-count").text(total);
					  d3.select("#selected-count").text(n);
					  d3.select("#selected-bar").style("width", (100*n/total) + "%");
					}
					
				}
				self.foreground = foreground;
				self.prototypes = prototype;
					

			},
			drawAxes2: function(filtered){
				var self = this;
				var data = self.metadata;
				var numFeatures = Object.keys(data[0]).length;
				var width = (numFeatures <=10)? 660 : numFeatures*80+60;
				//var margin = {top: 30, right: 40, bottom: 10, left: 140};				 
				var height = 300;
				var xscale = d3.scale.ordinal().rangePoints([0, width], 1),
				    yscale = {},
				    dragging = {};
				var m = [60, 60, 10, 0],
				 	w = width - m[1] - m[3],
    			 	h = height - m[0] - m[2],
					line = d3.svg.line(),
				    axis = d3.svg.axis().orient("left"),
				    background,
				    foreground,
				    legend,
				    highlighted,
				    dimensions,
				    render_speed = 50,
				    brush_count = 0,
				    excluded_groups = [],
				    prototype;
			
				d3.select("#meta-container")
					.style("height", (h + m[0] + m[2]) + "px");

				d3.selectAll("#background-meta")
				    .attr("width", w+ m[1] + m[3]+ 100)
				    .attr("height", h)
				    .style("padding", m.join("px ") + "px");

				d3.selectAll("#foreground-meta")
				    .attr("width", w+ m[1] + m[3]+ 100)
				    .attr("height", h)
				    .style("padding", m.join("px ") + "px");

				d3.selectAll("#highlight-meta")
				    .attr("width", w+ m[1] + m[3]+ 100)
				    .attr("height", h)
				    .style("padding", m.join("px ") + "px");

				d3.selectAll("#svg-meta")
				    .attr("width", w+ m[1] + m[3]+ 100)
				    .attr("height", height);


				// Foreground canvas for primary view
				foreground = document.getElementById('foreground-meta').getContext('2d');
				foreground.globalCompositeOperation = "destination-over";
				foreground.strokeStyle = "rgba(0,100,160,0.1)";
				foreground.lineWidth = 1.7;
				foreground.fillText("Loading...",w/2,h/2);

				// Highlight canvas for temporary interactions
				highlighted = document.getElementById('highlight-meta').getContext('2d');
				highlighted.strokeStyle = "rgba(0,100,160,1)";
				highlighted.lineWidth = 4;

				// Background canvas
				background = document.getElementById('background-meta').getContext('2d');
				background.strokeStyle = "rgba(0,100,160,0.1)";
				background.lineWidth = 1.7;

				self.svgMeta = d3.select("#svg-meta").append("svg")
				    .attr("width", w + m[1] + m[3]+ 1000)
				    .attr("height", h + m[0] + m[2])
				    .attr("x", 0)
				    .attr("y", 0)
				  .append("g")
				    .attr("transform", "translate(" + m[1] + "," + m[0] + ")");

				// Extract the list of dimensions and create a scale for each.
					var dims = Object.keys(data[0]);
					/*xscale.domain(dimensions = dims.filter(function(k){
						return (_.isNumber(data[0][k])) && (k !== "outcome") && (k !== "sampleID")  && (yscale[k] = // (k === "outcome") ?  d3.scale.ordinal().domain([self.mins[k], self.maxs[k]]).rangePoints([height, 0])  : 
					              d3.scale.linear().domain([self.mins[k], self.maxs[k]]).range([h, 0])); 	     
					}));*/
					xscale.domain(dimensions = d3.keys(data[0]).filter(function (d) {
		                if(_.isNumber(data[0][d][0])){
		                    return ( yscale[d] = d3.scale.linear()
		                        				.domain(d3.extent(data, function (p) {
								                            return +p[d];
								                        }))
		                        				.range([h, 0]));
		                }
		                else { //if( typeof data[0][d][0] === "string"){
		                    console.log(data.map(function(s){ 
		                            return s[d];}).sort());
		                    return (yscale[d] = d3.scale.ordinal()
						                        .domain(data.map(function(s){ 
						                            return s[d];}).sort())
						                        .rangePoints([0,h]));
		                }
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
				
				
				  // Add a group element for each dimension.				  
				  //console.log(self.svg.selectAll(".dimension"));
				  var g = self.svgMeta.selectAll(".dimension-meta")
				      .data(dimensions)
				    .enter().append("g")
				      .attr("class", "dimension-meta")
				      .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
				      .on("filter", function(){
				        	console.log("FILTER EVENT!!!!!!");
				        })
				      .call(d3.behavior.drag()
				        //.origin(function(d) { return {x: xscale(d)}; })
				        .on("dragstart", function(d) {
				          dragging[d] = this.__origin__ = xscale(d);
				          this.__dragged__ = false;
				          d3.select("#foreground-meta").style("opacity", "0.35");
				        })
				        .on("drag", function(d) {
				          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
				          //foreground.attr("d", path);
				          //prototype.attr("d", path);
				          dimensions.sort(function(a, b) { return position(a) - position(b); });
				          xscale.domain(dimensions);
				          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
				          brush_count++;
				          this.__dragged__ = true;

				           // Feedback for axis deletion if dropped
				          if (dragging[d] < 12 || dragging[d] > w-12) {
				            d3.select(this).select(".background-meta").style("fill", "#b00");
				          } else {
				            d3.select(this).select(".background-meta").style("fill", null);
				          }
								         
				        })
				        .on("dragend", function(d) {
				           if (!this.__dragged__) {
						            // no movement, invert axis
						           // var extent = invert_axis(d);

						          } else {
						            // reorder axes
						            d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
						            var extent = yscale[d].brush.extent();
						          }

						         
				            // TODO required to avoid a bug
					          xscale.domain(dimensions);
					         // update_ticks(d, extent);

					          // rerender
					          d3.select("#foreground-meta").style("opacity", null);
					          brush();
					          delete this.__dragged__;
					          delete this.__origin__;
					          delete dragging[d];
				        }));

				     var formatter = d3.format(',.0f');
 					 var logFormatter = d3.format('.3f');
 
				      // Add an axis and title.
					 var gsvg= g.append("svg:g")
					      .attr("class", "axis-meta")
					      .attr("id", "gsvg-meta")
					      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
					      .attr("transform", "translate(0,0)")
					      .attr("fill", 'none')
					      .attr("stroke", "black");
      					
      					gsvg.append("svg:text")
					      .style("text-anchor", "middle")
					      .attr("y", function(d,i) { return i%2 == 0 ? -14 : -30 } )
					      .attr("x",0)
					      .attr("class", "axis-label-meta")
					      .text(function(d) { 
					      	var s = d.split("|");
					      	return s[s.length-1]; })
					      .style("font-weight", "bold");
					   
      					d3.selectAll("#gsvg-meta")  
					      .append("rect")
					        .attr("class", "rect-meta")
					      	.attr("x", function(d){ 
					      		return  this.parentNode.getBBox().x - 5;
					      	})
					      	.attr("y", function(d, i){ 
					      		//console.log(this.parentNode);
					      		return i%2 === 0 ? this.parentNode.getBBox().y - 5: this.parentNode.getBBox().y - 5;})
					      	.attr("width", function(d){ return this.parentNode.getBBox().width + 10;})
					      	.attr("height", function(d) {return 20;})
					      	.style("stroke", "lightgrey")
					      	.style("stroke-width", 2)
					      	.style("fill", function(d){
					      		//return self.fcolorMap[d];
					      		return 'none';
					      	})
					      	.style("opacity", 0.9);
					     
					   
					  // Add and store a brush for each axis.
					  g.append("g")
					      .attr("class", "brush-meta")
					      .each(function(d) {
					        d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush));
					      })
					    .selectAll(".rect-meta")
					      .attr("x", -8)
					      .attr("width", 16)
					      .append("title")
        					.text("Drag up or down to brush along this axis");

        			self.dispatch.on("filterlines", function(samples){
        				// remove any existing brush and its effects
        				self.selected =
							  	self.data.filter(function(d) {
							       var result = samples.indexOf(d.sampleID)>=0;
							      return result;
							    });	
						//console.log(self.selected);
						xscale.domain(dimensions);
						self.filtered = true; 
				        // rerender
				        d3.select("#foreground-meta").style("opacity", null);
				        brush();
				       				
        				});

        			brush();
					 // Returns the path for a given data point.
					
					 
					
					function path(d, ctx, color, proto) {

					  if (color) {
					  	var op = proto? 0.1 : 0.7;
					  	color = (color === "red"? "rgba(255, 0, 0,"+ op+ ")": "rgba(0, 0, 255,"+ op+ ")" );
					  	ctx.strokeStyle = color;
					  }
					  ctx.lineWidth = proto? 14: 1.7;
					  
					  ctx.beginPath();
					  var x0 = xscale(0),
					      y0 = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
					  ctx.moveTo(x0,y0);
					  dimensions.map(function(p,i) {
					    var x = xscale(p)+ (i===0? 50: 60),
					        y = yscale[p](d[p]);
					    var cp1x = x - 0.88*(x-x0);
					    var cp1y = y0;
					    var cp2x = x - 0.12*(x-x0);
					    var cp2y = y;
					    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
					    x0 = x;
					    y0 = y;
					  });
					  ctx.lineTo(x0+3, y0);                               // right edge
					  ctx.stroke();
					}
					function position(d) {
						  var v = dragging[d];
						  return v == null ? xscale(d) : v;
					}
					// Get polylines within extents
					function actives() {
					  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
					      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

					  // filter extents and excluded groups
					  var selected = [];
					  data
					    .filter(function(d) {
					      return !_.contains(excluded_groups, d.Hospital);
					    })
					    .map(function(d) {
					    return actives.every(function(p, i) {
					      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
					    }) ? selected.push(d) : null;
					  });

					  // free text search
					  var query = d3.select("#search")[0][0].value;
					  if (query > 0) {
					    selected = search(selected, query);
					  }

					  return selected;
					}
					function brush() {
					  brush_count++;
					  var actives = dimensions.filter(function(p) { 
					  					return  yscale[p].brush && !yscale[p].brush.empty(); }),
					      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

					  // hack to hide ticks beyond extent
					  var b = d3.selectAll('.dimension-meta')[0]
					    .forEach(function(element, i) {
					      var dimension = d3.select(element).data()[0];
					      if (_.include(actives, dimension)) {
					        var extent = extents[actives.indexOf(dimension)];
					        d3.select(element)
					          .selectAll('text')
					          .style('font-weight', 'bold')
					          .style('font-size', '13px')
					          .style('display', function() { 
					            var value = d3.select(this).data();
					            return extent[0] <= value && value <= extent[1] ? null : "none"
					          });
						      } else {
						        d3.select(element)
						          .selectAll('text')
						          .style('font-size', null)
						          .style('font-weight', null)
						          .style('display', null);
						      }
						      d3.select(element)
						        .selectAll('.axis-label-meta')
						        .style('display', null);
						 });
					    
					 
						  // bold dimensions with label
						  d3.selectAll('.axis-label-meta')
						    .style("font-weight", function(dimension) {
						      if (_.include(actives, dimension.name)) return "bold";
						      return null;
						    });

						  // Get lines within extents
						  	var selected = self.metadata_selection;
						  	
						  	// Render selected lines
							  paths(selected, foreground, brush_count, true);
							}

					
				// Adjusts rendering speed 
				function optimize(timer) {
				  var delta = (new Date()).getTime() - timer;
				  render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
				  render_speed = Math.min(render_speed, 300);
				  return (new Date()).getTime();
				}
				  // render polylines i to i+render_speed 
				function render_range(selection, i, max, opacity) {
				  selection.slice(i,max).forEach(function(d) {
				    //var col = colorMap[d.outcome];
				    var col = self.classColors[d.outcome];
				     //(d['outcome'] === self.classes[0])? color2(d.Therapy,opacity) : color(d.Therapy,opacity);
				    path(d, foreground,col);
				  });
				 
				};

				// render a set of polylines on a canvas
				function paths(selected, ctx, count) {
				  var n = selected.length,
				      i = 0,
				      opacity = d3.min([2/Math.pow(n,0.3),1]),
				      timer = (new Date()).getTime();

				  self.selected = selected;
				  //selection_stats( n, data.length)

				  shuffled_data = _.shuffle(selected);
				  ctx.clearRect(0,0,w+1,h+1);

				  // render all lines until finished or a new brush event
				  function animloop(){
				    if (i >= n || count < brush_count) return true;
				    var max = d3.min([i+render_speed, n]);

				    render_range(shuffled_data, i, max, opacity);
				    //render_stats(max,n,render_speed);
				    i = max;
				    timer = optimize(timer);  // adjusts render_speed
				  };

				  d3.timer(animloop);
	  	
				}
				self.foreground = foreground;
				self.prototypes = prototype;
					

			}
		
				
		});
})(PATREE);