(function($P){
'use strict'
	$P.ThumbView = $P.defineClass(
			null,
			function ThumbView(config){
				var self = this; 
				//console.log("hello"+config);
				self.fTrees = {}; 
				self.treeQs = [];   // array of per-tree quality metric (ROC values: TPR, FPR, Ratio = TPR/FPR)
				self.numTrees = 100; 
				self.selectedTreeID = 1;
				self.selectedPwayID = config.id;
				self.group = config;
				self.trees = self.group.trees;
				self.classes = config.classes;
				self.pdata = config.pdata; 
				self.rfengine = config.rfengine; 
				var data = config.data;
				self.dispatch = d3.dispatch("filterlines");
				self.geneRelations = {};
				self.colorBrewer = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928",
									"#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f",
									"#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999",
									"#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"
									];
				
	           //self.drawThumbs(config);
	           self.createColorMap();
	           
	           var p = data[0];
	           var mins = {}, maxs = {};
	           var axes = Object.keys(p);
	           axes.forEach(function(axis){
							mins[axis] = p[axis];
							maxs[axis] = p[axis];
						});
	           data.forEach(function(record){
	           	axes.forEach(function(axis){
								if(mins[axis] > record[axis]) mins[axis] = record[axis];
								else if(maxs[axis] < record[axis]) maxs[axis] = record[axis];
							});
							
	           });
	           if(!self.dataView)
				self.dataView = new $P.ParallelView({'data':data, 'mins': mins, 'maxs': maxs, 'dispatch': self.dispatch,
													 'colors': self.colorMap, 'classes': self.classes, 'pdata': self.pdata, 'rf': self.rfengine});
			   self.drawIcicles(50,50);
				
			},
			{
				updateControls: function(t){
					var self = this; 
					d3.select("#total-count").text(self.numTrees);
					d3.select("#loaded-count").text(t);
				},
				createColorMap: function(){
					var self = this; 
					if(!self.colorMap){
						console.log("Creating a new color map");
						self.colorMap = {};
						for(var i=0; i < self.group.nodes.length; i++){
							self.colorMap[self.group.nodes[i]] = self.colorBrewer[i];
						}
						
					}
					//self.drawLegend();
				},
				getColorMap: function(){
					var self = this;
					return self.colorMap; 
				},
				drawLegend: function(){
					
				},
				destroy: function(){
					//console.log("Hola");
					var self = this;
					d3.select(".thumbview").selectAll("svg").remove(); 
					if(self.svg) self.svg.remove(); 
					self.displayTree.destroy(); 
					self.dataView.destroy(); 
				},
				drawIcicles: function(w, h){
					var self = this;
					var root = self.group.trees[0];
					console.log(root);
					// Sort trees by quality
					self.group.trees.sort(function(a,b){
						//var acca = (a.tp + a.tn) / (a.tp + a.tn + a.fp + a.fn);
						//var accb = (b.tp + b.tn) / (b.tp + b.tn + b.fp + b.fn);
						var ratioA = (a.tp/(a.tp + a.fn)) / (a.fp/(a.fp + a.tn));
						var ratioB = (b.tp/(b.tp + b.fn)) / (b.fp/(b.fp + b.tn));
						return (parseFloat(ratioB) - parseFloat(ratioA));
					});
					console.log(self.group.trees);
					var color = d3.scale.category20();
			        var margin = {top: 20, right: 10, bottom: 20, left: 10};
			        var centery = (h)/2;
					var centerx = (w)/2;
							      
			        self.svg = d3.select(".thumbview").selectAll("svg")
			        			.data(self.group.trees)
			        			.enter()
			        			.append("svg")
			        			  .attr("width", w + margin.left + margin.right)
							      .attr("height", h + margin.top + margin.bottom)
							      .append("g")
							      //.attr("transform", "translate(" + margin.left + "," + (margin.top + 60) +") rotate(-90)")
							      .attr("transform", function(d){
							      	//console.log(d.treeQ.ratio);
							      	var angle = 1.0;
							      	return "transform", "translate(" + margin.left + "," + (margin.top) +")"
							      	+"translate("+ centerx + "," + centery + ")"
							      	+"rotate("+ angle +")"
							      	+"translate("+ (-centerx)+ "," + (-centery) + ")"; 
							      })
							      .on('click', setHighlight);
					self.svg.append("line")
							.attr("x1", 0)
							.attr("y1", 0)
							.attr("x2", function(d){
								//var fpr = d.fp / (d.fp + d.tn);
								//return fpr * w ;
								var tpr = d.tp / (d.tp + d.fn);
								return centerx * tpr;
							})
							.attr("y2", function(d){
								//var tpr = d.tp / (d.tp + d.fn);
								//return tpr * h * (-1); 
								return 0;
							})
							.style("fill", "black")
							.style("stroke", "black")
							.style("stroke-width", 3)
							.attr("transform", function(d){
								var fpr = d.fp / (d.fp + d.tn);
								var xfpr = fpr * w; 
								var tpr = d.tp / (d.tp + d.fn);
							    var ytpr = tpr * h;
							    console.log(Math.atan(ytpr/xfpr)*180/Math.PI);
							    var angle = (fpr === 0)? -90 : -Math.atan(ytpr/xfpr)*180/Math.PI; 
							      	
								return "translate("+ centerx + "," + 0 + ")"
							      	+"rotate("+ angle +")";
							      	
							});


					var g = self.svg.selectAll("g")
			        		.data(function(d){
			        			var partition = d3.layout.partition()
				          			.size([w, h])
				          			.sort(null)
				          			.value(function(d2) { 
				          					return d2.size; });
				        		return partition.nodes(d);})
			        		.enter().append("g");

			        g.append("rect")
			            .attr("class", "tnode")
			            .attr("x", function(d) { 
			            	return d.x; })
			            .attr("y", function(d) {
			            	 return d.y; })
			            .attr("width", function(d) { 
			            	return d.dx;  })
			            .attr("height", function(d) { 
			            	return d.dy; })
			            .style("fill", function(d) { 
			            	return self.colorMap[d.name]; })
			            .style("stroke", "black");

			        self.selectedTree = self.trees[self.selectedTreeID];
			        self.displayTree = new $P.DetailView({'tree': self.selectedTree, 
				    									   'colorMap': self.colorMap, 
				    									   'classes':self.classes,
														   'pway': self.selectedPwayID,
														   'dataView': self.dataView,
														   'dispatch': self.dispatch });
			        
					function setHighlight(d){
					 	if(!d) d = self.trees[1];
						var id = self.trees.indexOf(d);
						self.trees.forEach(function(tree){
							if(tree.highlighted)
								tree.highlighted = false; 
						});
						d.highlighted = true;
						if(self.highlights) self.highlights.remove(); 
						self.highlights = self.svg.append('rect')
							.filter(function(d){return d.highlighted;})
								.attr('class','light')
								.attr('x', function(d) { return d.x - 10;})
								.attr('y', function(d) { return d.y - 10;})
								.attr('width', function(d) {return w + 10;})
								.attr('height', function(d) {return h + 10;})
								.style('stroke', 'cyan')
								.style('fill', 'cyan')
								.style('opacity', 0.3)
								.style('stroke-width', '5px');

						self.selectedTreeID = id; 
						console.log("Just clicked " + id);
						//console.log(d);
						self.selectedTree = self.trees[self.selectedTreeID];
						if(self.displayTree) self.displayTree.updateView(self.selectedTree);

					 }
 

				},
				drawIcicle: function(w, h){
					var self = this; 
					var width = w,
			            height = h;
			            var root = self.trees[0];
			            console.log(self.trees);
			      var color = d3.scale.category20();
			      var margin = {top: 20, right: 10, bottom: 20, left: 10};

			      var mytemp = d3.select(".thumbview").selectAll("svg");
			      console.log(mytemp); 
			      self.svg = d3.select(".thumbview").selectAll("svg")
			      				.data(self.trees)
							    .enter().append("svg")
							      .attr("width", w + margin.left + margin.right)
							      .attr("height", h + margin.top + margin.bottom)
							    .append("g")
							      //.attr("transform", "translate(" + margin.left + "," + (margin.top + 60) +") rotate(-90)")
							      .attr("transform", function(d){
							      	//console.log(d.treeQ.ratio);
							      	
							      	var centerx = (h)/2;
							      	var centery = (w)/2;
							      	var xfpr = d.treeQ.fpr * w; 
							      	var ytpr = d.treeQ.tpr * h;
							      	console.log(Math.atan(ytpr/xfpr)*180/Math.PI);
							      	var angle = (d.treeQ.ratio === "Inf")? -90 : -Math.atan(ytpr/xfpr)*180/Math.PI; 
							      	return "transform", "translate(" + margin.left + "," + (margin.top) +")"
							      	+"translate("+ centerx + "," + centery + ")"
							      	+"rotate("+ angle +")"
							      	+"translate("+ (-centerx)+ "," + (-centery) + ")"; 
							      })
							      .on('click', setHighlight);
				
				 function setHighlight(d){
				 	if(!d) d = self.trees[1];
					var id = self.trees.indexOf(d);
					self.trees.forEach(function(tree){
						if(tree.highlighted)
							tree.highlighted = false; 
					});
					d.highlighted = true;
					if(self.highlights) self.highlights.remove(); 
					self.highlights = self.svg.append('rect')
						.filter(function(d){return d.highlighted;})
							.attr('class','light')
							.attr('x', function(d) { return d.x - 10;})
							.attr('y', function(d) { return d.y - 10;})
							.attr('width', function(d) {return w + 10;})
							.attr('height', function(d) {return h + 10;})
							.style('stroke', 'cyan')
							.style('fill', 'cyan')
							.style('opacity', 0.3)
							.style('stroke-width', '5px');

					self.selectedTreeID = id; 
					console.log("Just clicked " + id);
					//console.log(d);
					self.selectedTree = self.trees[self.selectedTreeID];
					if(self.displayTree) self.displayTree.updateView(self.selectedTree);

				 }


				/*
			      var svg = d3.select(".thumbview").append("svg")
			          .attr("width", width)
			          .attr("height", height)
			          .append("g")
			          .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");*/
  
			        //var nodes = partition.nodes(root);
			        //setHighlight(); 
			        var g = self.svg.selectAll("g")
			        		.data(function(d){
			        			var partition = d3.layout.partition()
				          			.size([width, height])
				          			.sort(null)
				          			.value(function(d2) { 
				          					return d2.size; });
				        		return partition.nodes(d);})
			        		.enter().append("g");

			        g.append("rect")
			            .attr("class", "tnode")
			            .attr("x", function(d) { 
			            	return d.x; })
			            .attr("y", function(d) {
			            	 return d.y; })
			            .attr("width", function(d) { 
			            	return d.dx;  })
			            .attr("height", function(d) { 
			            	return d.dy; })
			            .style("fill", function(d) { 
			            	return self.colorMap[d.split_var]; })
			            .style("stroke", "black");
			            //.style("fill", function(d) { console.log(getParam(d)); return color((d.children ? d : d.parent).name); });
				},
				submitTree: function(tree, id, pid) {
                 $P.getJSON('./php/submit_tree.php',
                    function(jsonData) {},
                    { 
                    type: 'POST',
                    data: {
                       "id": id , "pid": pid ,"tree": tree
                      }
                    }
                 );
                },
				getNodeInfo: function(datafile, node){
					d3.csv(datafile, function(data){	
						var geneData = $.grep(data, function(e){return e.probeID === node.split_var; });
						console.log(geneData);
					});
				},
				getTreeNode: function(nodeId){

				},
				buildTreeRules: function(tree, rule){
					var self = this; 
					tree.rule = rule;
					//console.log(tree.name);
					if(tree.left > 0){
						self.buildTreeRules(tree.children[0], rule+' && '+tree.split_var+'<='+tree.split_point);
					}
					if(tree.right > 0)
						self.buildTreeRules(tree.children[1], rule+' && '+tree.split_var+'>'+tree.split_point);
				},
				updateTreeCounts:function(tree, patient, patientID){
					var self = this; 
					if(!tree.size) tree.size = 0;
					tree.size++;
					if(!tree.samples) tree.samples = [];
					tree.samples.push(patient.patientID);
					if(!tree.classes) tree.classes = {};
					tree.classes[patient.outcome]? tree.classes[patient.outcome].value +=1 : tree.classes[patient.outcome] = {value:1};
					if(tree.left === 0 || tree.right === 0) return;
					var expOfInterest = patient[tree.split_var];
					if(expOfInterest <= tree.split_point)
						self.updateTreeCounts(tree.children[0], patient, patientID);
					else
						self.updateTreeCounts(tree.children[1], patient, patientID);
				},
				buildTreeQuality(tree){
					var self = this;
					self.leaves = [];
					var classes = Object.keys(self.classes);
					console.log("Classes are "+ classes);
					self.getLeaves(tree, classes);
					
					//console.log(self.leaves);
					//Calculate a score for each leaf:
					/*self.leaves.forEach(function(leaf, leafId){
						//get the true class
						var trueClass = -1;
						var trueClassCount = 0; 
						var totalCount = 0;
						for(var key in leaf.classes){
						   totalCount += leaf.classes[key].value;
                           if(leaf.classes[key].value > trueClassCount)
                           	 {
                           	 	trueClassCount = leaf.classes[key].value;
                           	 	trueClass = key;
                           	 }
						}
						var falseClassCount = totalCount - trueClassCount; 
						var fpr = falseClassCount / totalCount;
						var tpr = trueClassCount / totalCount; 
					});*/
				},
				getLeaves: function(tree, classes){
					var self = this;
					
					if(tree.left === 0 && tree.right === 0)
						self.leaves.push(tree);
					else
					{
						// On a side note: let's collect splitting orders as we go here
						if(!self.geneRelations[tree.split_var]){
							self.geneRelations[tree.split_var] = [];
						}
						// parent population
						//var trueClassCount = tree.classes[classes[0]].value;
						var temp1 = {};
						var prob_L, prob_R, gini_L, gini_R;
						var temp2={}; 

						if(tree.children.length > 0)
						{// compute gini for left child
							temp1.dst = tree.children[0].split_var;
							var trueClassCountL = (tree.children[0].classes[classes[0]]) ? tree.children[0].classes[classes[0]].value : 0;
							prob_L = trueClassCountL / tree.children[0].size;
							gini_L = prob_L * prob_L + (1- prob_L)* (1- prob_L);
							// compute gini for right child
							temp2.dst= tree.children[1].split_var;
							var trueClassCountR = (tree.children[1].classes[classes[0]]) ? tree.children[1].classes[classes[0]].value : 0;
							prob_R = trueClassCountR / tree.children[1].size;
							gini_R = prob_R * prob_R + (1 - prob_R) * (1 - prob_R);
						}
						var weighted_gini = tree.children[0].size/tree.size * gini_L + tree.children[1].size/tree.size * gini_R; 
						temp1.gini = temp2.gini = weighted_gini;
						
						self.geneRelations[tree.split_var].push(temp1);
						self.geneRelations[tree.split_var].push(temp2);
						// Now the real deal to find leaves
						self.getLeaves(tree.children[0], classes);
						self.getLeaves(tree.children[1], classes);
					}
				},
				buildTreeInfo:function(tree, pID, tID, counter){
					var self = this;
					var pathwayDataFile = './php/load_pathway_data.php';
					
					$P.getJSON(pathwayDataFile, function(treeData){
						var p = treeData[0];
						if(tID === self.treeQs[0].tid)
						{
							for(var key in p){
								if(key !== 'outcome' && key !== 'patientID')
									self.genes.push(key);
							} 
							console.log("#Genes in this pathway: "+ self.genes.length);
						}
						var mins ={}, maxs = {};
						var axes = Object.keys(p);
						// copy initial values into mins and maxs
						axes.forEach(function(axis){
							mins[axis] = p[axis];
							maxs[axis] = p[axis];
						});

						treeData.forEach(function(patient, patientID){
							if(counter === 0)  // build dataset info once
							{self.classes[patient.outcome]? self.classes[patient.outcome].value +=1 : self.classes[patient.outcome] = {value:1};	
							}
							// keep track of min and max of each axis
							axes.forEach(function(axis){
								if(mins[axis] > patient[axis]) mins[axis] = patient[axis];
								else if(maxs[axis] < patient[axis]) maxs[axis] = patient[axis];
							});
							// update nodes of tree with this patient
							self.updateTreeCounts(tree, patient, patientID);
						});
						if(!self.dataView)
							self.dataView = new $P.ParallelView({'data':treeData, 'mins': mins, 'maxs': maxs, 'dispatch': self.dispatch,
																 'colors': self.colorMap, 'classes': self.classes, 'pdata': self.pdata, 'rf': self.rfengine});
					}, {
						type: 'GET',
						data: {id: pID}
					}); 
				}

			}
		);

})(PATREE); 