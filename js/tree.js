(function($P){
'use strict'
 	$P.DetailView = $P.defineClass(
 			null,
 			function DetailView(config){
 				var self = this; 
				console.log(config.tree);
				var width = 400;
				var height = 300; 
				self.colorMap = config.colorMap;
				self.classNames = [];
				self.classes = config.classes;
				//self.selectedPwayID = config.pway;
				self.dispatch = config.dispatch; 
				    
				self.dataView = config.dataView; 
				for(var key in self.classes){
					self.classNames.push(key);
				}
			var textureGenerators = [
	            function(){
	              return textures.lines().thicker();
	            },
	            function(){
	              return textures.circles().size(5);
	            },
	            function(){
	              return textures.paths().d("squares").size(8);
	            }
	          ],
          
          // Create a scale that encapsulates texture mappings.
          textureScale = d3.scale.ordinal()
            .domain(["0", "1", "2"])
            .range(textureGenerators),

          // Create a scale that encapsulates colors.
          // Colors from http://colorbrewer2.org/
          colorScale = d3.scale.ordinal()
            .domain(["A", "B", "C"])
            .range(["black", "#d95f02", "#7570b3"]);
          
          // Create a nested ordinal scale for color and texture.
          self.colorTextureScale = d3.scale.ordinal()
      
            // The first level is for color.
            .domain(colorScale.domain())
            .range(colorScale.range().map(function(color){
              
              // The second level is for texture.
              return d3.scale.ordinal()
                .domain(textureScale.domain())
                .range(textureScale.range().map(function(generateTexture){

                  // Generate a new texture for each (color, texture) pair.
                  return colorizeTexture(generateTexture(), color);
                }))
            }));


		      // Makes the given texture appear as the given color.
		      function colorizeTexture(texture, color){
			        // Use stroke, present on all textures.
			        var texture = texture.stroke(color);
			        // Use fill, present only on some textures (e.g. "circles", not "lines").
			        if(texture.fill){
			          texture.fill(color);
			        }
			        return texture;
			      }
		      
		      self.treeByLevel = {};
		      	self.width = width;
		      	self.height = height; 
				self.drawPathTree(width, height, config.tree);
 			},
 			{
 				destroy: function(){
 					var self=this; 
 					if(self.svg) self.svg.remove();
 				},
 				updateView:function(tree){
 					var self = this; 
 					//var article = d3.select("article");
 					//article.remove();
 					//article = d3.select("body").append("article");
 					if(self.svg) {
 						
 						d3.select("article").selectAll("*").remove(); 
 						self.svg.remove();
 						/*d3.select("article").append("button")
 											.attr("id","showLinksBut").attr("x", 10).attr("y",20)
 											.text("Show Links" );*/

 					    }
 					self.drawPathTree(self.width, self.height, tree );
 				},

 				drawPathTree:function(w,h,root){
					var self = this; 
					var width = w,
			            height = h;
			      	var color = d3.scale.category20();
			      	var margin = {top: 20, right: 10, bottom: 20, left: 30};
			    	self.svg = d3.select("article").append("svg")
			          .attr("width", width)
			          .attr("height", height)
			          .append("g")
			          .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
			          .attr("max-width", "90%");

			        // Initialize defs for each (texture, color) pair.
				      self.colorTextureScale.range().forEach(function(scale){
				        scale.range().forEach(self.svg.call, self.svg);
				      });
				      
				    var wi = width * 0.6; 
			        var partition = d3.layout.partition()
								    .size([wi, height * 0.85])
								    .value(function(d) { return d.size; })
								    .sort(null);
			        var nodes = partition.nodes(root);
			        var svgNodes = self.svg.selectAll(".dnode")
						        	.data(nodes)
						        	.enter().append("g");
					var div = d3.select("body").append("div")
									.attr("class", "tooltip2")
									.style("opacity", 0);

				    	
					var rect = svgNodes.append("rect")
						        	.attr("class", "dnode")
						            .attr("x", function(d) { 
						            	return d.x; })
						            .attr("y", function(d) {
						            	 return d.y; })
						            .attr("width", function(d) { 
						            	return d.dx;  })
						            .attr("height", function(d) { 
						            	return d.dy; })
						            .style("fill", function(d) { 
						            	   var color;
						            	   if(!d.children) color = 'lightgrey';
						            	   else color = self.colorMap[d.name];
						            	return color; })
						            .style("stroke-width", '5px')
						            .style("stroke", function(d) { 
						            	var border = (d.isLeaf<0)? 'white': 'white';
						            	return border; })
						            .on("click",selectLines)
						            .on('mouseover', function(d){
											div.transition()		
								                .duration(200)		
								                .style("opacity", .9);		
							            	div	.html(function(){
							            		var str;
							            		if(typeof d.name === "string"){
							            			str = d.name.split("|");
							            			str = str[str.length-1];
							            		}
							            		else
							            			str = "leaf"; 

							            		return "<strong> Feature: </strong> " +str+ "<br/> <strong>Cutoff: </strong>"+d.cut;})	
								                .style("left", (d3.event.pageX) -50 + "px")		
								                .style("top", (d3.event.pageY + 28) + "px");	
										})
										.on('mouseout', function(d){
											div.transition()		
							                .duration(500)		
							                .style("opacity", 0);	
										});
							
						        
						        svgNodes.each(function(n,i){
						        	var start = 5;
    								self.svg.append("rect")
    										.datum(n)
								        	.attr("class", "dnodesub")
								            .attr("x", function(d){
								            		var st = n.x+start;
								            		var w = n.dx-10; 
								            		var dx = w/n.size*n.cl1;
								            		start += (dx > 0? dx : 0);
								            		//console.log(n);
								            		//console.log(start);
								            	return st;
								            	})
								            .attr("y", n.y+10)
								            .attr("width", function(d) { 
								            	var w =(n.dx-10); 
								            	return (w/n.size*n.cl1)>0? w/n.size*n.cl1 : 1;  })
								            .attr("height", function(d) { 
								            	return n.dy-20; })
								            .style("fill", function(d) { 
								            	return self.colorTextureScale("A")(self.classes[0]).url(); })
								            .style("stroke-width", '2px')
								            .style("stroke", function(d) { 
								            	return self.colorMap[n.name]; })
								            .on("click", selectLines);
								            
						        	self.svg.append("rect")
						        			.datum(n)
								        	.attr("class", "dnodesub")
								            .attr("x", function(d){
								            		var st = n.x+start;
								            		var w = (n.dx-10); 
								            		var dx = w/n.size*n.cl2;
								            		start += (dx > 0? dx : 0);
								            		//console.log(n);
								            		//console.log(start);
								            	return st;
								            	})
								            .attr("y", n.y+10)
								            .attr("width", function(d) { 
								            	var w =(n.dx-10); 
								            	return (w/n.size*n.cl2)>0? w/n.size*n.cl2 : 1 ;  })
								            .attr("height", function(d) { 
								            	return n.dy-20; })
								            .style("fill", function(d) { 
								            	return self.colorTextureScale("A")(self.classes[1]).url(); })
								            .style("stroke-width", '2px')
								            .style("stroke", function(d) { 
								            	return self.colorMap[n.name]; })
								            .on("click", selectLines);
								    							            	
						        		 
						        });
				    var but = d3.select("button").on("click", showConnections);
				    function selectLines(d){
				    	//self.dataView.updateLines(d.samples);
				    	console.log("Firing filter event!!");
				    	self.dispatch.filterlines(d.samples);
				    }
					function showConnections(d){
						console.log("CLICK");
						document.getElementById("showLinksBut").disabled = true;
						buildTreeLevels();
						//var x = d3.scale.linear().range([0,w/2]);
						//var y = d3.scale.linear().range([0,h/2]);
						//x.domain([d.x, d.x + d.dx]);
						//y.domain([0, d.dy]).range([0,d.dy/2]);

						rect.transition()
						      .duration(750)
						      .attr("y", function(d) { 
						      	// determine position of the rectangle based on this node's rank in a level
						      	var numNodes = self.treeByLevel[d.y].length;
						      	var nheight = parseInt(d.dy/numNodes);
						      	var index = self.treeByLevel[d.y].indexOf(d.name);
						      	
						      	return d.y + index * nheight;
						       })
						      .attr("height", function(d) { 	
						      	var numNodes = self.treeByLevel[d.y].length;
						      	var nheight = parseInt(d.dy/numNodes);
						      	var index = self.treeByLevel[d.y].indexOf(d.name);
						      	d.y = d.y + index * nheight;

						      	return parseInt(d.dy/numNodes);
						       });
						var displayLinks = [];
						//read links from file
						$P.getJSON('./php/load_pathway_links.php',
									function(jsonLinks){
										for(var i=0; i < jsonLinks.length; i++){
											//find the first node occurrence of the src and the dest genes
											var srcx = -1;
											var srcy = -1;
											var dstx = -1;
											var dsty = -1;
											var color = '';
											nodes.forEach(function(node,nodeId){
												if(node.split_var === jsonLinks[i].src && srcx < 0)
													{   srcx = node.x + node.dx;
														srcy = node.y;
														color = self.colorMap[node.split_var];}
												else if(node.split_var === jsonLinks[i].dst && dstx < 0)
													{	dstx = node.x + node.dx -10;
														dsty = node.y;}
											});
											if(srcx >= 0 && dstx >= 0)  // both src and dst genes exist in this tree
												var link = {'srcx': srcx, 'srcy': srcy, 'dstx': dstx, 'dsty': dsty, 'color': color, 
															'xinc': (Math.random()*100), 'yinc': (Math.random()*10)   };
												displayLinks.push(link);

										}
									},
									{
										type: 'GET',
			                            data: {
			                                    pindex: self.selectedPwayID
			                                  }

									});
						
						var yoffset = 10; 
						var svgLinks = self.svg.selectAll('.link')
										.data(displayLinks)
										.enter().append('g');
						svgLinks.append('line')
								 .attr('class', 'link')
								 .attr('x1', function(d){ 
								 	return d.srcx;})
								 .attr('y1', function(d){ 
								 	return d.srcy+yoffset+d.yinc;})
								 .attr('x2', function(d){ 
								 	return width * 0.7 + d.xinc;})
								 .attr('y2', function(d){ 
								 	return d.srcy + yoffset+d.yinc;})
								 .style("stroke-width", '5px')
								 .style('stroke', function(d){ 
								 	return d.color;});
						svgLinks.append('line')
								 .attr('class', 'link')
								 .attr('x1', function(d){ 
								 	return width * 0.7 + d.xinc;})
								 .attr('y1', function(d){ 
								 	return d.srcy + yoffset + d.yinc;})
								 .attr('x2', function(d){ 
								 	return width * 0.7 + d.xinc;})
								 .attr('y2', function(d){ 
								 	return d.dsty + yoffset+ d.yinc;})
								 .style("stroke-width", '5px')
								 .style('stroke', function(d){ 
								 	return d.color;});
						svgLinks.append('line')
								 .attr('class', 'link')
								 .attr('x1', function(d){ 
								 	return width * 0.7 + d.xinc;})
								 .attr('y1', function(d){ 
								 	return d.dsty + yoffset + d.yinc;})
								 .attr('x2', function(d){ 
								 	return d.dstx;})
								 .attr('y2', function(d){ 
								 	return d.dsty+ yoffset + d.yinc;})
								 .style("stroke-width", '5px')
								 .style('stroke', function(d){ 
								 	return d.color;});


					}     

					function buildTreeLevels(){
						nodes.forEach(function(node, nodeId){
							self.treeByLevel[node.y]? self.treeByLevel[node.y].push(node.name): (self.treeByLevel[node.y]=[node.name]);
						});
						console.log(self.treeByLevel);
					}

					 self.svg.selectAll(".label")
					      .data(nodes.filter(function(d) { return d.dx > 6; }))
					    .enter().append("text")
					      .attr("class", "label")
					      .attr("dy", ".35em")
					      .attr("transform", function(d) { return "translate(" + (d.x + 12) + "," + (d.y + d.dy - 10) + ")rotate(-90)"; })
					      .text(function(d) { 
					      	var t = (d.isLeaf<0)? '': d.split_var;
					      	return t; })
					      .on("click", selectLines);
																
				}
 			});

})(PATREE); 