(function($P){
	'use strict'
	$P.GeneHierarchy = $P.defineClass(
			null,
			function GeneHierarchy(config){
				var self=this;
				var fs = require('fs'),
    				RandomForestClassifier = require('random-forest-classifier').RandomForestClassifier;
				self.selectedLevel = '';
				self.selectedNodes = [];
				self.groups = [];
				self.selectionON = false;
				d3.csv('./data/variables.csv', function(data){
					self.data = data;
					self.readImportance();					
				});
			},
			{
				readImportance: function(){
					var self=this;
					d3.json('./data/vatanen_imp.json', function(imp){
						self.importance = imp;
						for(var i=0; i< self.importance.length; i++){
							var temp = self.importance[i]['name'].split('|');
							self.importance[i]['name'] = temp[temp.length-1];
						}
						console.log(self.importance);
						self.selectionButton = d3.select("#selection-butt");
						self.selectionButton.on("click", function(){
							if(!self.selectionON ){
								self.selectionON = true;
								self.selectedNodes = [];
							}
							else {
								self.selectionON = false;
								self.groups.push(self.selectedNodes);
								// send selected nodes to RF
								self.callRF();
								self.selectedNodes = [];
							}
						});
						self.buildHierarchy();

					});
				},
				callRF: function(){
					// send the current values in self.selectedNodes to RF 

				},
				getGLevelNodes: function(node, leaves){
					var self=this;
					if(!node.children){
						var index = leaves.findIndex(x => x.id==node.id);
						if(index < 0 && node.name.includes("g__")) {
							leaves.push(node);
							return leaves;
						}
						else
							return leaves;
					}
					else{
						for(var child=0; child < node.children.length; child++) {
							if(node.children.length>0) self.getGLevelNodes(node.children[child], leaves);}
						return leaves;
					}

				},
				
				findParent: function(i, root, gene1, gene2){
 							var self=this;
 							if(root.name === gene1){
 								if(root.children.indexOf(gene2)>=0) // gene already exists as a child
 										return;
 								root.children.push({id: i, name: gene2, children:[]});
 								return;
 							}
 							else 
	 							for(var child=0; child< root.children.length; child++){
 									if(root.children.length>0) self.findParent(i, root.children[child], gene1, gene2);
 								}
 					},
 						
				buildHierarchy: function(){
					var self=this;
					var tree=[];
					tree[0]={};
					tree[0].id= 0; 
					tree[0].name='k__Bacteria';
					tree[0].children = [];
					var height = 600;
					var width = 600;

					for(var i=0; i < self.data.length; i++){
						var genes = self.data[i].name.split("|");
						var g = genes.length - 1;
						var pnode = self.findParent(i, tree[0], genes[g-1], genes[g]);
						//if(pnode) pnode.children.push({id: i, name: genes[g], children:[] });
					}
					console.log(tree[0]);
					var root = tree[0];
					self.width = width;
					self.height = height;
					self.drawHierarchy((width-100), (height-100), root);	
				},
				drawHierarchy: function (width, height, root) {
					var self = this;
					self.svg = d3.select(".attrhierarchy").append("svg")
										.attr("width", width)
										.attr("height", height)
										.append("g")
										.attr("transform", "translate("+ (width/2)+","+ (height/2) +")");
					
					self.levels = [ {name:'Genus', value: '#f7f7f7',  r: 6.5*(width/14)},
									{name:'Family', value:'#d9d9d9',  r: 5*(width/14)},
									{name:'Order', value: '#bdbdbd',  r: 4*(width/14)},
									{name:'Class', value:'#969696',  r: 3*(width/14) },
									{name:'Phylum', value: '#636363', r: 2*(width/14)}];
					
					var div = d3.select("body").append("div")
									.attr("class", "tooltip")
									.style("opacity", 0);

					self.arcspecs = [];
					for(var a=0; a< self.levels.length; a++){
						var newarc = d3.svg.arc()
										.innerRadius((self.levels[a].r-(width/12)))
										.outerRadius(self.levels[a].r)
										.startAngle(0)
										.endAngle(Math.PI*2);
						self.arcspecs.push(newarc);
						var arc = self.svg.append("path")
									.attr("class", "arc")
									.attr("d", newarc)
									.style("fill", function(d){return self.levels[a].value; })
									.style("opacity", .3);
						  arc.datum(self.levels[a]);

						  arc.on('mouseover', function(d){
								var c = d3.select(this);
								c.style("opacity", 1.0);
								div.transition()		
					                .duration(200)		
					                .style("opacity", .9);		
					            div	.html("<strong> Level: </strong> <br/>" +d.name)	
					                .style("left", (d3.event.pageX) + "px")		
					                .style("top", (d3.event.pageY - 28) + "px");								
							})
							.on('mouseout', function(d){
								var c = d3.select(this);
								if(d.name !== self.selectedLevel){
									c.style("opacity", 0.3);
									}
								div.transition()		
					                .duration(500)		
					                .style("opacity", 0);	

							})
							.on('click', function(d){
								self.selectedLevel = d.name;
								d3.selectAll(".arc").style("opacity", 0.3);
								d3.select(this).style("opacity", 1.0);
							});
					}
										
					self.drawRadialCluster((width-100), (height-100), root);
					//self.selectNodes();
					//self.drawCluster(width, height, root);					
				},
				getImportanceRange: function(){
					var self=this;
					var maxA_RF=0, maxA_RE=0, maxA_EF=0;
					var maxG_RF=0, maxG_RE=0, maxG_EF=0;
					var minA_RF=10000000, minA_RE=10000000, minA_EF=10000000;
					var minG_RF=10000000, minG_RE=10000090, minG_EF=10000000;
					for(var i=0; i < self.importance.length; i++){
						var temp= self.importance[i];
						if(temp['MDA_RF'] < minA_RF) minA_RF = temp['MDA_RF'];
						if(temp['MDA_RF'] > maxA_RF) maxA_RF = temp['MDA_RF'];
						if(temp['MDA_RE'] < minA_RE) minA_RE = temp['MDA_RE'];
						if(temp['MDA_RE'] > maxA_RE) maxA_RE = temp['MDA_RE'];
						if(temp['MDA_EF'] < minA_EF) minA_EF = temp['MDA_EF'];
						if(temp['MDA_EF'] > maxA_EF) maxA_EF = temp['MDA_EF'];

						if(temp['MDG_RF'] < minG_RF) minG_RF = temp['MDG_RF'];
						if(temp['MDG_RF'] > maxG_RF) maxG_RF = temp['MDG_RF'];
						if(temp['MDG_RE'] < minG_RE) minG_RE = temp['MDG_RE'];
						if(temp['MDG_RE'] > maxG_RE) maxG_RE = temp['MDG_RE'];
						if(temp['MDG_EF'] < minG_EF) minG_EF = temp['MDG_EF'];
						if(temp['MDG_EF'] > maxG_EF) maxG_EF = temp['MDG_EF'];
					}
					self.ranges = {
						minA_RF: minA_RF,
						minA_RE: minA_RE,
						minA_EF: minA_EF,
						maxA_RF: maxA_RF,
						maxA_RE: maxA_RE,
						maxA_EF: maxA_EF,
						minG_RF: minG_RF,
						minG_RE: minG_RE,
						minG_EF: minG_EF,
						maxG_RF: maxG_RF,
						maxG_RE: maxG_RE,
						maxG_EF: maxG_EF,
						minA_total: (minA_RF < minA_RE? (minA_RF < minA_EF? minA_RF: minA_EF): (minA_RE < minA_EF? minA_RE: minA_EF)),
						maxA_total: (maxA_RF > maxA_RE? (maxA_RF > maxA_EF? maxA_RF: maxA_EF): (maxA_RE > maxA_EF? maxA_RE: maxA_EF))
					};
				},
				selectNodes: function(){
					var self=this;
					d3.select(".attrhierarchy").on("mousedown", function(){
						if(!d3.event.ctrlKey){
							d3.selectAll('g.selected').classed("selected", false);
						}
						var p = d3.mouse( this);
						console.log(p);
						/*self.svg.append("rect")
							.attr({
								rx : 6,
								ry: 6,
								class: "selection",
								x: p[0],
								y: p[1],
								width: 0,
								height:0
							});*/
						var origin = 250;
						

						//var prad = self.project(p[0], p[1], origin);
						var prad = self.project(0, 20, origin);
						console.log(prad);

						var newarc = d3.svg.arc()
										.innerRadius((self.levels[3].r-(self.width/12)))
										.outerRadius(self.levels[3].r)
										.startAngle(0)
										.endAngle(prad);
						
						var arc = self.svg.append("path")
									.attr("class", "selection")
									.attr("d", newarc)
									.style("fill", function(d){return "red"; })
									.style("opacity", .6);
						
					})
					.on("mousemove", function(){
						var s = self.svg.select("rect.selection");
						//console.log(s.empty());
						if(!s.empty()){
							var p=d3.mouse(this);
							console.log(p[0],p[1]);
							/*var	d={
									x: parseInt(s.attr("x"), 10),
									y: parseInt(s.attr("y"), 10),
									width: parseInt(s.attr("width"), 10),
									height: parseInt(s.attr("height"), 10)
								};

							var	move = {
									x: p[0] - d.x,
									y: p[1] - d.y
								};
							if( move.x < 1 || (move.x*2<d.width)) {
					            d.x = p[0];
					            d.width -= move.x;
					        } else {
					            d.width = move.x;       
					        }

					        if( move.y < 1 || (move.y*2<d.height)) {
					            d.y = p[1];
					            d.height -= move.y;
					        } else {
					            d.height = move.y;       
					        }
					       s.attr(d)
					        .attr("transform", "translate(-250,-250)");*/
					        
					        // deselect all temporary selected state objects
					        d3.selectAll('g.node.selection.selected').classed("selected", false);
					        d3.selectAll('g.node').each(function(state_data,i){
					        	  console.log("state data: "+state_data);
					        	 if( !d3.select( this).classed( "selected") && 
					                 // inner circle inside selection frame
					                state_data.x >=d.x && state_data.x <=d.x+d.width && 
					                state_data.y >=d.y && state_data.y <=d.y+d.height) 
					        	 {
					                d3.select( this)
						                .classed( "selection", true)
						                .classed( "selected", true);
					            }
					        });
						}
					})
					.on("mouseup", function(){
						    // remove selection frame
						    self.svg.selectAll( "rect.selection").remove();

						        // remove temporary selection marker class
						    d3.selectAll( 'g.node.selection').classed( "selection", false);
					})
					.on("mouseout", function(){
						 if( d3.event.relatedTarget && d3.event.relatedTarget.tagName=='HTML') {
					            // remove selection frame
					        self.svg.selectAll( "rect.selection").remove();
					            // remove temporary selection marker class
					        d3.selectAll( 'g.node.selection').classed( "selection", false);
					    }
					});
				},
				drawRadialCluster: function(width, height, root){
					var self = this;
					var cluster = d3.layout.cluster()
										.size([width, height])
										.separation(function(a,b) { return (a.parent === b.parent? 3:4)/a.depth; });
					
					var nodes = cluster.nodes(root);
					var links = cluster.links(nodes);
					self.getImportanceRange();
					var link = self.svg.selectAll(".link")
									.data(links)
									.enter().append("path")
									.attr("class", ".link")
									.attr("d", function(d){
										//console.log(d);
										/*return "M" + [d.target.x, (d.target.depth*50)]
												+ "C" + [d.target.x, (d.target.depth*50+d.source.depth*50)/2]
												+ " " + [d.source.x, (d.target.depth*50 + d.source.depth*50)/2]
												+ " " + [d.source.x, d.source.depth*50];*/
										return "M" + project(d.target.x, (d.target.depth ===0? d.target.depth: (d.target.depth+0.7))*(width/6))
												+ "C" + project(d.target.x, ((d.target.depth===0? d.target.depth: d.target.depth+0.7)*(width/6)+(d.source.depth===0? d.source.depth: d.source.depth+0.7)*(width/6))/2)
												+ " " + project(d.source.x, ((d.target.depth===0? d.target.depth: d.target.depth+0.7)*(width/6) + (d.source.depth===0? d.source.depth: d.source.depth+0.7)*(width/6))/2)
												+ " " + project(d.source.x, (d.source.depth===0? d.source.depth: d.source.depth+0.7)*(width/6));
									})
									//.attr("transform", "translate(-200,-200)")
									.style("fill", "none")
									.style("stroke", "black");

					var div = d3.select("body").append("div")
									.attr("class", "tooltip2")
									.style("opacity", 0);


					self.nodes = self.svg.selectAll(".node")
								.data(nodes)
								.enter().append("g")
								.attr("class", function(d) {
												return "node" + (d.children? " internal": " leaf");
								})
								.attr("transform", function(d){ return "translate("+project(d.x , ((d.depth===0? d.depth: (d.depth+0.7)) * (width/6)))+")";})
								.on('mouseover', function(d){
									div.transition()		
						                .duration(200)		
						                .style("opacity", .9);		
					            	div	.html("<strong> Entity: </strong> <br/>" +d.name)	
						                .style("left", (d3.event.pageX) -50 + "px")		
						                .style("top", (d3.event.pageY + 28) + "px");	
								})
								.on('mouseout', function(d){
									div.transition()		
					                .duration(500)		
					                .style("opacity", 0);	
								});
					
					var scaleFactor = 1.8;

					self.leaves= self.svg.selectAll(".leaf");

					self.leaves.append("line")
						.attr("x1", function(d){
							if(d.name.includes("g__"))
								{
									return (d.y*0.01 * Math.cos((d.x-90)/180*Math.PI));
								}
							else
								return 0;
						})
						.attr("y1", function(d){
							if(d.name.includes("g__"))
								{
									return (d.y*0.01*Math.sin((d.x-90)/180*Math.PI));
								}
							else
								return 0;
						})
						.attr("x2", function(d){
							if(d.name.includes("g__"))
								{
									return (d.y*0.04 * Math.cos((d.x-90)/180*Math.PI));
								}
							else
								return 0;
						})
						.attr("y2", function(d){
							//console.log(d);
							if(d.name.includes("g__"))
								{
									return (d.y*0.04*Math.sin((d.x-90)/180*Math.PI));}
							else
								return 0;
						})
						.style("stroke-width", 5)
						.style("stroke", "red")
						.style("opacity", function(d){
							if(d.name.includes("g__"))
								{
									var index = self.importance.findIndex(x => x.name==d.name);
									var scale = self.importance[index]['MDA_RF'];
									//scale = (scale - self.ranges['minA_RF']) / (self.ranges['maxA_RF'] - self.ranges['minA_RF']);
									scale = (scale - self.ranges['minA_total']) / (self.ranges['maxA_total'] - self.ranges['minA_total']);
									//var logimp = d3.scale.log()
									//		.domain([1.0, 10.0])
									//		.range([0.0, 1.0]);	
									return scale*scaleFactor;}
							else
								return 0;
						})
						.on('click', function(d){
								var index = self.importance.findIndex(x => x.name==d.name);
								var imp = self.importance[index]['MDA_RF'];
								console.log(imp);
								div.transition()		
					                .duration(200)		
					                .style("opacity", .9);		
				            	div	.html("<strong> MDA = </strong> <br/>" + imp)	
					                .style("left", (d3.event.pageX) -50 + "px")		
					                .style("top", (d3.event.pageY + 28) + "px");	
					            d3.event.stopPropagation();				
							
						});


						self.svg.selectAll(".leaf")
						.append("line")
						.attr("x1", function(d){
							if(d.name.includes("g__"))
								return (d.y*0.04 * Math.cos((d.x-90)/180*Math.PI));
							else
								return 0;
								})
						.attr("y1", function(d){
							//console.log(d);
							if(d.name.includes("g__"))
								{
									return (d.y*0.04*Math.sin((d.x-90)/180*Math.PI));}
							else
								return 0;
							})
						.attr("x2", function(d){
							if(d.name.includes("g__"))
								{
									return (d.y*0.07 * Math.cos((d.x-90)/180*Math.PI));
								}
							else
								return 0;
						})
						.attr("y2", function(d){
							//console.log(d);
							if(d.name.includes("g__"))
								{
									return (d.y*0.07*Math.sin((d.x-90)/180*Math.PI));}
							else
								return 0;
						})
						.style("stroke-width", 5)
						.style("stroke", "green")
						.style("opacity", function(d){
							if(d.name.includes("g__"))
								{
									var index = self.importance.findIndex(x => x.name==d.name);
									var scale = self.importance[index]['MDA_RE'];
									//scale = (scale - self.ranges['minA_RE']) / (self.ranges['maxA_RE'] - self.ranges['minA_RE']);
									scale = (scale - self.ranges['minA_total']) / (self.ranges['maxA_total'] - self.ranges['minA_total']);
									return scale*scaleFactor;
								}
							else
								return 0;
						})
						.on('click', function(d){
							var index = self.importance.findIndex(x => x.name==d.name);
							var imp = self.importance[index]['MDA_RE'];
							console.log(imp);
							div.transition()		
				                .duration(200)		
				                .style("opacity", .9);		
			            	div	.html("<strong> MDA = </strong> <br/>" + imp)	
				                .style("left", (d3.event.pageX) -50 + "px")		
				                .style("top", (d3.event.pageY + 28) + "px");					
							d3.event.stopPropagation();	
						});

						self.svg.selectAll(".leaf")
						.append("line")
						.attr("x1", function(d){
							if(d.name.includes("g__"))
								{
									return (d.y*0.07 * Math.cos((d.x-90)/180*Math.PI));
								}
									else
										return 0;
								})
								.attr("y1", function(d){
									//console.log(d);
									if(d.name.includes("g__"))
										{
											return (d.y*0.07*Math.sin((d.x-90)/180*Math.PI));}
									else
										return 0;
								})
								.attr("x2", function(d){
									if(d.name.includes("g__"))
										{
											return (d.y*0.1 * Math.cos((d.x-90)/180*Math.PI));
										}
									else
										return 0;
								})
						.attr("y2", function(d){
							//console.log(d);
							if(d.name.includes("g__"))
								{
									return (d.y*0.1*Math.sin((d.x-90)/180*Math.PI));}
							else
								return 0;
						})
						.style("stroke-width", 5)
						.style("stroke", "blue")
						.style("opacity", function(d){
							if(d.name.includes("g__"))
								{
									var index = self.importance.findIndex(x => x.name==d.name);
									var scale = self.importance[index]['MDA_EF'];
									//scale = (scale - self.ranges['minA_EF']) / (self.ranges['maxA_EF'] - self.ranges['minA_EF']);
									scale = (scale - self.ranges['minA_total']) / (self.ranges['maxA_total'] - self.ranges['minA_total']);
									return scale* scaleFactor;}
							else
								return 0;
						})
						.on('click', function(d){
							var index = self.importance.findIndex(x => x.name==d.name);
							var imp = self.importance[index]['MDA_EF'];
							console.log(imp);
							div.transition()		
				                .duration(200)		
				                .style("opacity", .9);		
			            	div	.html("<strong> MDA = </strong> <br/>" + imp)	
				                .style("left", (d3.event.pageX) -50 + "px")		
				                .style("top", (d3.event.pageY + 28) + "px");					
							d3.event.stopPropagation();	
						});

						//self.nodes.call(self.drag);
					self.nodeCircles = self.nodes.append("circle")
						.attr("r", 2.5)
						.on("click", function(d){
							if(self.selectionON){
								self.addSelectedNode(d, this);
							}
						});


						
				function project(x, y){
						var angle = (x - 90)/180 * Math.PI, radius = (y * 0.5);
						return [radius*Math.cos(angle), radius*Math.sin(angle)];
						}
				}, 
				addSelectedNode: function(node, d3node){
					var self=this;
					// chech to see if node was already selected
					console.log(node);
					var index = self.selectedNodes.findIndex(x => x.id == node.id);
					if(index < 0){
							// TODO: select leaf-level nodes under this node
							var leaves = [];
							leaves = self.getGLevelNodes(node, leaves); 
							//console.log(leaves);
							if(!node.children) self.selectedNodes.push(node);
							else
								self.selectedNodes.push(leaves);
							console.log(self.nodeCircles[0]);
							d3.select(d3node).style("fill", "yellow")
														.style("stroke", "cyan")
														.style("stroke-width", 2);
						}
					else{
						// TODO: deselect leaf-level nodes under this node
						//deselect node
						self.selectedNodes.splice(index,1);
						d3.select(d3node).style("fill", "black")
														.style("stroke", "black")
														.style("stroke-width", 0.1);
					}
					console.log(self.selectedNodes);
				},
				project: function(x, y, origin){
						if(x>origin && y < origin) // first quadrant
							{x -= origin;
							 y = origin - y;}
						x = x /180 * Math.PI;
						y = y /180 * Math.PI; 

						var r = Math.sqrt((x*x)+(y*y));
						var angle = Math.acos((x/r));
						return angle; 
						
				},
				drawCluster: function(width, height, root){
					var self = this; 
					self.svg = d3.select(".attrhierarchy").append("svg")
										.attr("width", width)
										.attr("height", height)
										.append("g")
										.attr("transform", "translate(40,0)");
					
					var cluster = d3.layout.cluster()
											.size([height,width-200]);
					var diagonal = d3.svg.diagonal()
									.projection(function(d){ return [d.y,d.x];});
					
					var nodes = cluster.nodes(root);
					console.log( nodes);
					var links = cluster.links(nodes);
					var link = self.svg.selectAll(".link")
									.data(links)
									.enter().append("path")
										.attr("class", "link")
										.attr("d", diagonal)
										.style("fill","none")
										.style("stroke",function(d){
											return d.source.name=== 'root'? "none":"black";
										});
					var node = self.svg.selectAll(".node")
									.data(nodes)
									.enter().append("g")
									.attr("class", "node")
									.attr("transform", function(d) {
										var shift = d.depth * (width/6);
										return  "translate(" + d.y + "," + d.x + ")";});
					node.append("circle")
								.attr("r",function(d){
									return 3.5;
								})
								.style("fill", function(d){ 
									return "red";});
					/*node.append("text")
							.attr("dx", function(d){ return d.children? -8:8;})
							.attr("dy",3)
							.style("text-anchor", function(d){ return d.children? "end": "start";})
							.text( function(d){ return d.name === 'root'? '': d.name;}); 
							*/
				
				}

			}
		);
	var hier = new $P.GeneHierarchy();
})(PATREE);