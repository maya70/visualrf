(function e(t,n,r){function s(o,u){
	if(!n[o]){
		if(!t[o]){
			var a=typeof require=="function"&&require;
			if(!u&&a)return a(o,!0);
			if(i)return i(o,!0);
			var f=new Error("Cannot find module '"+o+"'");
			throw f.code="MODULE_NOT_FOUND",f
		}
		var l=n[o]={exports:{}};
		t[o][0].call(l.exports,function(e){
			var n=t[o][1][e];
			return s(n?n:e)
		},l,l.exports,e,t,n,r)
	}
	return n[o].exports
}
var i=typeof require=="function"&&require;
for(var o=0;o<r.length;o++)
	s(r[o]);
return s})
({1:[function(require,module,exports){
(function($P){
	'use strict'
	$P.GeneHierarchy = $P.defineClass(
			null,
			function GeneHierarchy(config){
				var self=this;
				self.selectedLevel = '';
				self.selectedNodes = [];
				self.groups = [];
				self.groupCount = 0;
				self.selectionON = false;
				self.but_div = d3.select(".pathway");
				self.modelROC = [];
				self.c1 = self.c2 = 'R';
				self.but_div.append("button")
				                    .attr("class", "accordion")
				                    .attr("id", "btn")
				                    .attr("value", 1)
				                    .style("width", "100px")
				                    .style("height", "10px")
				                    .text('')
				                    .style("background-color", "#eee")
				                    .style("color", "#444");
				self.classNames = [{name: "Russia", value: "R"}, 
								{name:"Finland", value: "F"},
								{name:"Estonia", value: "E"}];				
				
				var undef; 
				self.exportedData = undef; 
				$.each(self.classNames, function(){
				   	 $("<option />")
				        .attr("value", this.value )
				        .html(this.name)
				        .appendTo("#cls-select-1");
					});
				$.each(self.classNames, function(){
				   	 $("<option />")
				        .attr("value", this.value )
				        .html(this.name)
				        .appendTo("#cls-select-2");
					});
				var cl1 = document.getElementById("cls-select-1");

				cl1.addEventListener("change", function(){
					self.c1 = this.value;
					if(self.svg){ 
						self.svg.selectAll("*").remove();
						//self.svg.remove();
						}
					if(self.svgLegend)
						{
							self.svgLegend.selectAll("*").remove();
							//d3.select(".legend").remove();
						}
					self.exportedData = undef; 
					self.drawHierarchy((self.width-100), (self.height-100), self.root);	
					self.drawModelROC();
				});
				var cl2 = document.getElementById("cls-select-2");
				cl2.addEventListener("change", function(){
					self.c2 = this.value;
					if(self.svg){ 
						self.svg.selectAll("*").remove();
						//self.svg.remove();
						}
					if(self.svgLegend)
						{
							self.svgLegend.selectAll("*").remove();
							//d3.select(".legend").remove();
						}
					self.exportedData = undef; 
					self.drawHierarchy((self.width-100), (self.height-100), self.root);	
					self.drawModelROC();
				});
				d3.csv('./data/variables.csv', function(data){
					self.data = data;
					self.readImportance();					
				});
			},
			{
				drawModelROC: function(){
					var self=this;
					var x = 20;
					var width =  300;//document.body.clientWidth * 0.1 ;
					var height = 300;
					
					if(!self.svgLegend){
						self.svgLegend = d3.select(".legend").append("svg")
										.attr("width", width)
										.attr("height", height)
										.attr("transform", "translate(0,0)");
						
					}
					if((self.cls1 === "R" && self.cls2 === "F")||(self.cls1==="F"&&self.cls2==="R"))
						{
							d3.json('./data/roc_rf.json',function(rocdata){
								self.modelROC = [];
								for(var i=0; i<rocdata.length; i++){
									var d = {};
									d.x = rocdata[i].x;
									d.y = rocdata[i].y;
									self.modelROC.push(d);
								}

								doDraw(self.modelROC, self.svgLegend);
							});
						}
					else if((self.cls1 ==="R" && self.cls2==="E")||(self.cls1==="E" && self.cls2==="R"))
						{
							d3.json('./data/roc_re.json',function(rocdata){
								self.modelROC = [];
								for(var i=0; i<rocdata.length; i++){
									var d = {};
									d.x = rocdata[i].x;
									d.y = rocdata[i].y;
									self.modelROC.push(d);
								}
								doDraw(self.modelROC, self.svgLegend);
							});

						}
					else if((self.cls1 ==="F"&& self.cls2==="E")||(self.cls1==="E" && self.cls2==="F"))
						{
							d3.json('./data/roc_ef.json',function(rocdata){
								self.modelROC = [];
								for(var i=0; i<rocdata.length; i++){
									var d = {};
									d.x = rocdata[i].x;
									d.y = rocdata[i].y;
									self.modelROC.push(d);
								}
								doDraw(self.modelROC, self.svgLegend);
							});

						}
					else
						{
							d3.json('./data/roc_all.json',function(rocdata){
								self.modelROC = [];
								for(var i=0; i<rocdata.length; i++){
									var d = {};
									d.x = rocdata[i].x;
									d.y = rocdata[i].y;
									self.modelROC.push(d);
								}
								doDraw(self.modelROC, self.svgLegend);
							});

						}

					/*self.svgLegend.append("rect")
										.attr("fill", function(d){ return color;})
										.attr("x", 50 )
										.attr("y", 20)
										.attr("width", 50)
										.attr("height", 30);*/
					function doDraw(dataset, svg){
						
						var margin = {top: 10, right: 20, bottom: 20, left: 30},
						    w = width*2/3- margin.left - margin.right - 10,
						    h = width*2/3 - margin.top - margin.bottom -10;


						var x = d3.scale.linear().range([0, w]);
						var y = d3.scale.linear().range([h, 0]);

						x.domain([0, 1]);
						y.domain([0, 1]);

						var xAxis = d3.svg.axis().scale(x)
						    .orient("bottom").ticks(5);

						var yAxis = d3.svg.axis().scale(y)
						    .orient("left").ticks(5);

						svg.selectAll("*").remove();

						svg.append("g")
						        .attr("class", "x axis")
						        .attr("transform", "translate("+ margin.left + "," + (h+10) + ")")
						        .call(xAxis)
						       .append("text")            
						        .attr("x", 50)
						        .attr("y", 30 )
						        .style("text-anchor", "middle")
						        .text("False Postitive Rate");

						    svg.append("g")
						        .attr("class", "y axis")
						        .attr("transform", "translate("+ margin.left + ",10)")
						        .call(yAxis);

						    // Define the line
						    var valueline = d3.svg.line()
						                        .x(function(d) { return x(d.x); })
						                        .y(function(d) { return y(d.y); });
						                       
						                          
						    // Add the valueline path.
						    svg.append("path")
						        .attr("class", "line")
						        .attr("d", valueline(dataset))
						        .style("fill", "none")
						        .style("stroke-width", 3)
						        .style("stroke", "black")
						        .attr("transform", "translate("+ margin.left + ",10)");


					}

				},
				readImportance: function(){
					var self=this;
					self.subset_importance = true;
					if(self.subset_importance){
						d3.json('./data/subset61_imp.json', function(imp){
							self.subimp = imp;
							for(var i=0; i < self.subimp.length; i++){
								var temp = self.subimp[i]['name'].split('|');
								self.subimp[i]['name'] = temp[temp.length -1];
							}
						});
					}
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
								self.updateNodes(); 
							}
							else {
								  var div = d3.select("body").append("div")
									.attr("class", "tooltip3")
									.style("opacity", 0);

								div.transition()		
					                .duration(0.01)		
					                .style("opacity", .9);		
					            div	.html("<strong> Running RandomForest </strong> <br/> <p> This may take up to a few minutes </p> <br/> <p> Please do not navigate to another tab. </p> ")	
					                .style("left", "0px")		
					                .style("top",  "0px")
					                .style("width", document.body.clientWidth + "px")
					                .style("height", document.body.clientHeight + "px");

					            div.append("div")
					            	.attr("id", "loader");								

								self.selectionON = false;
					
								// send selected nodes to RF
								self.callRF(div);
								//self.selectedNodes = [];
								
							}
						});
						self.buildHierarchy();

					});
				},
				setExported: function(data){
					var self = this;
					self.exportedData = data; 
					console.log(self.exportedData);
				},
				getExported: function(){
					var self = this;
					return self.exportedData;
				},
				revertToOriginal: function(){
					var self = this;
					var undef;
					self.exportedData = undef;

				},
				metaData: function(){
					var self = this;
					var dataFile = '';
					if((self.cls1 === "R" && self.cls2 === "F")||(self.cls1==="F"&&self.cls2==="R"))
						dataFile = "./data/vatanen_dfrf_meta.json";
					else if((self.cls1 === "R" && self.cls2 === "E")||(self.cls1==="E"&&self.cls2==="R"))
						dataFile = "./data/vatanen_dfre_meta.json";
					else if((self.cls1 === "F" && self.cls2 === "E")||(self.cls1==="E"&&self.cls2==="F"))
						dataFile = "./data/vatanen_dfef_meta.json";

					return dataFile;
				},
				callRF: function(div){
					var self = this;
					var fs = require('fs'),
    				RandomForestClassifier = require('random-forest-classifier').RandomForestClassifier;
    				var utils = require('../utilities');
    				var response = "country";

    				
					// send the current values in self.selectedNodes to RF 
					var rf = new RandomForestClassifier({
									    n_estimators: 50
									});

					console.log("RF HERE");
					console.log(self.selectedNodes);
				if(self.selectedNodes.length <=1){
						prompt("Please select features for RandomForest");
						return;
					}
				else{
					var dataFile = '';
					if((self.cls1 === "R" && self.cls2 === "F")||(self.cls1==="F"&&self.cls2==="R"))
						dataFile = "./data/vatanen_dfrf.json";
					else if((self.cls1 === "R" && self.cls2 === "E")||(self.cls1==="E"&&self.cls2==="R"))
						dataFile = "./data/vatanen_dfre.json";
					else if((self.cls1 === "F" && self.cls2 === "E")||(self.cls1==="E"&&self.cls2==="F"))
						dataFile = "./data/vatanen_dfef.json";

					d3.json(dataFile, function(data){
							var training = [], test = [];
						    var features = [];
							 // restore full feature names
							 for(var i=0; i < self.selectedNodes.length; i++){
							 	if(self.selectedNodes[i].name.indexOf('g__')>=0)
							 	{
							 	 var fname = self.getFeatureFullName(self.selectedNodes[i]);
							 	 features.push(fname);
							 	}
							 }

							 //d3.json("./data/");

							    
						    for(var i = 0; i < data.length; i++)
						    {
						    	var d = {};
					    	    d[response] = parseInt(data[i][response]);
					    	    d['sampleID'] = i;
							   for(var key in data[i]) {
		    						if(key !== response)
			    						d[key] = data[i][key];
		    					}
							    training.push(d);
						    }
						    self.pdata = training; 

						    if(self.exportedData){
						    	var tempset = [];
						    	for(var j = 0; j < self.exportedData.length; j++){
						    		var id = parseInt(self.exportedData[j]['sampleID']);
						    		tempset.push(training[id]);
						    	}
						    	training = tempset; 
						    }
						    console.log(training);
						    var trainSet = shuffle(training);
						    //test = trainSet.slice(0, trainSet.length/2);
						    test = trainSet;
						    trainSet = trainSet.slice(trainSet.length/2, trainSet.length);
						    console.log(test);
						    
						    // store class info
						    var y_values = _.pluck(training, response);
						    function onlyUnique(value, index, self) { 
								    return self.indexOf(value) === index;
								}
							var uniqueClasses = y_values.filter(onlyUnique);
							uniqueClasses = uniqueClasses.sort(function(a,b){ return a - b;});
							var cl1count =0, cl2count = 0;
							for(var i=0; i < y_values.length; i++){
								if(y_values[i] === uniqueClasses[0]) cl1count++;
								else if(y_values[i] === uniqueClasses[1]) cl2count++;
							}
							self.classes = {};
							self.classes[uniqueClasses[0]] = cl1count;
							self.classes[uniqueClasses[1]] = cl2count;
						   
						   console.log(uniqueClasses);
						   self.classColors = {};
						   if((self.c1 === 'R' && self.c2 === 'E') || (self.c1 === 'R' && self.c2 === 'F') || (self.c1 === 'E' && self.c2 === 'F') ){
						   	self.classColors[uniqueClasses[0]] = 'blue';
						   	self.classColors[uniqueClasses[1]] = 'red';
						   }
						   else{
						   	self.classColors[uniqueClasses[1]] = 'blue';
						   	self.classColors[uniqueClasses[0]] = 'red';
						   }

							rf.fit(trainSet, features, "country", function(err, trees){
							  //console.log(JSON.stringify(trees, null, 4));							 
							  var pred = rf.predict(test, trees, "country");
							  console.log(pred);
							  
							  //console.log(trees);
							  var group = {};
							  group.id = self.groups.length+1;
							  group.name = prompt("Enter a group name:");
							  group.prediction = pred;
							  group.nodes = features;
							  group.nodeSelection = self.selectedNodes;
							  //group.trees = self.d3ifyModel(trees);
							  group.classes = self.classes;
							  group.data = [];
							  for(var i = 0; i < training.length; i++){
							  	  var temp = {};
								  for(var f =0; f < features.length; f++){
								  	temp[features[f]] = training[i][features[f]];
								  }
								  temp['outcome'] = y_values[i];
								  temp['sampleID'] = training[i]['sampleID'];  // sample IDs start at 1 to leave zero for class prototypes
								  group.data.push(temp);
								}
							  var samples = [];
							  for(var i=0; i< group.data.length; i++){
							  	samples.push(i);
							  }

							  group.trees = self.d3ifyModel(trees, samples);
							  //console.log(group.data);
							  group.roc = self.ROCcurve(pred, test, group.classes, response);
							  group.classColors = self.classColors; 
							  
							  self.groups.push(group);
							  //self.groupCount++;
							  group.pdata = self.pdata; 
							  group.rfengine = self; 
							  div.transition()		
					                .duration(1)		
					                .style("opacity", 0);
					          div.remove();

							  self.createNewGroup(group);
							  self.thumbnails = new $P.ThumbView(group);
							  self.selectedNodes = [];
							  self.updateNodes(); 
							});
						});
			    	} // end else
					function shuffle(array) {  // Fisher Yates shuffle
						  var currentIndex = array.length, temporaryValue, randomIndex;

						  // While there remain elements to shuffle...
						  while (0 !== currentIndex) {

						    // Pick a remaining element...
						    randomIndex = Math.floor(Math.random() * currentIndex);
						    currentIndex -= 1;

						    // And swap it with the current element.
						    temporaryValue = array[currentIndex];
						    array[currentIndex] = array[randomIndex];
						    array[randomIndex] = temporaryValue;
						  }

						  return array;
						}
				},
				ROCcurve: function(pred, test, classes, response){
					var self = this;
					var curve = [];
					var max = getMaxOfArray(pred);
					var min = getMinOfArray(pred);
					var step = (max - min)/10;
					self.cutoff = {fpr: 1000000, tpr: 0, tp:0, fp:0, tn:0, fn:0};
					// handle the case where prediction all fall within the same class
					// to avoid an infinite loop:
					if(!max){ 
						max = self.classes[1];
						min = self.classes[0];
						step = 0.01;
					}
					if(step === 0) step = 0.01; 

					for(var t=max; t >= (min-1); t-=step){
						var d = {};
						var temp = self.getPRates(t, pred, test, classes, response);
						d.x = temp.fpr;
						d.y = temp.tpr;
						curve.push(d);
					}
					//console.log(curve);
					function getMaxOfArray(numArray) {
						  return Math.max.apply(null, numArray);
						  //var max = numArray.reduce(function(a,b){
						  //	return Math.max(a, b);
						  //});
						}
					function getMinOfArray(numArray) {
						  return Math.min.apply(null, numArray);
						}
				 	return curve;
				},
				getPRates: function(t, pred, test, classes, response){
					var self = this; 
					var rates={}, tpr, fpr;
					var predicted, actual;
					var classes = Object.keys(classes);
					var tp = 0, fp = 0, tn = 0, fn = 0;
					function findKey(obj, v){
						for(var k in obj ){
							if(obj[k] === v)
								return k;
						}
						return null; 
					}

					var positive, negative; 
					positive = findKey(self.classColors, 'red');
					negative = findKey(self.classColors, 'blue');

					//console.log("NEW RUN, Postitive = "+ positive);
					//console.log("Negative = " + negative);
					//console.log(self.classes);
					//console.log(self.classColors);



					for(var d = 0; d < pred.length; d++ ){
						if( positive > negative)
							predicted = (pred[d] > t)? positive : negative;
						else
							predicted = (pred[d] < t)? positive : negative;
						actual = test[d][response]+"";
						if(predicted === positive && actual === positive) // true positive
							tp++;
						else if(predicted === positive && actual === negative) // false positive
							fp++;
						else if(predicted === negative && actual === negative) // true negative
							tn++;
						else if(predicted === negative && actual === positive) // false negative
							fn++;
					}
					rates.tpr = tp / (tp+fn);
					rates.fpr = fp / (fp+tn);
					if(rates.tpr > self.cutoff.tpr && rates.fpr < self.cutoff.fpr) {
						self.cutoff.tp = tp;
						self.cutoff.fp = fp;
						self.cutoff.tn = tn;
						self.cutoff.fn = fn;
						self.cutoff.tpr = rates.tpr;
						self.cutoff.fpr = rates.fpr;
					}
					return rates; 
				},
				d3ifyModel: function(trees, data){
				var self = this;
			    var models = [];
			    
			    for (var i=0; i< trees.length; i++){
			        models[i] = {
			            name: trees[i].model.name,
			            children: trees[i].model.vals, 
			            cut: trees[i].model.cut,
			            cl1: trees[i].model.cl1,
			            cl2: trees[i].model.cl2,
			            size: trees[i].model.numRecs,
			            tp: trees[i].tp,
			            fp: trees[i].fp,
			            tn: trees[i].tn,
			            fn: trees[i].fn,
			            samples: data
			        }
			        models[i] = self.d3Model( models[i]);
			    }
		 	
			    return models;
				},
				d3Model: function( model){
					var self = this; 
					var new_model = {};	
					if(model && model.children){					
						//for(var i=0; i < model.children.length; i++){
							// unroll loop for left and right children
							new_model.name = model.children[0].child.name;
							new_model.children = model.children[0].child.vals;
							new_model.cl1 = model.children[0].child.cl1;
							new_model.cl2 = model.children[0].child.cl2;
							new_model.cut = model.children[0].child.cut;
							new_model.size = model.children[0].child.numRecs;
							new_model.samples = model.children[0].child.samples;
							model.children[0] = self.d3Model(new_model);
						//}
							new_model = {};
							new_model.name = model.children[1].child.name;
							new_model.children = model.children[1].child.vals;
							new_model.cl1 = model.children[1].child.cl1;
							new_model.cl2 = model.children[1].child.cl2;
							new_model.cut = model.children[1].child.cut;
							new_model.size = model.children[1].child.numRecs;
							new_model.samples = model.children[1].child.samples;
							model.children[1] = self.d3Model(new_model);

					}

					return model;
				},
				createNewGroup: function(fgroup){
					var self = this; 
					var xpos = 10; 
					var width = 200;
				    var height = 100; 
					
					var bid = 'btn'+fgroup.id; 
				    var but = self.but_div.append("button")
				                    .attr("class", "accordion")
				                    .attr("id", "btn")
				                    .attr("value", fgroup.id)
				                    .style("width", "100%")
				                    .style("height", "60px")
				                    .text(function(d){ 
				                        //this.pid = fNodes[p].id;
				                        return fgroup.name;})
				                    .style("background-color", "#eee")
				                    .style("color", "#444")
				                    .on("mouseover", function(d){
				                    	/*
				                        document.getElementById("btn").classList.toggle("active");
				                        var pan = this.nextElementSibling;
				                        console.log(this.value);
				                        if(pan){
        				                        if(pan.style.display === "none"){
        				                            pan.style.display = "block";
        				                        }
        				                        else
        				                            pan.style.display = "none";}*/
				                    	})
				                    .on("mouseout", function(d){
				                       // document.getElementById("btn").classList.toggle("active");
				                       /* var pan = this.nextElementSibling;
				                        if(pan) 
				                        	{
				                        		if(pan.style.display === "none"){
				                            	pan.style.display = "block";
				                        		}
				                       		 else
				                            	pan.style.display = "none"; 
				                            }*/
				                    	})
				                    .on("click", function(o){	
				                        var pan = this.nextElementSibling;
				                        if(pan) 
				                        	{
				                        		if(pan.style.display === "none"){
				                            	pan.style.display = "block";
				                        		}
				                       		 else
				                            	pan.style.display = "none"; 
				                            }
			                    	
				                        var b = parseInt(this.value);
				                        self.thumbnails.destroy(); 
				                        var group;
				                        for(var gi = 0; gi < self.groups.length; gi++){
				                        	if(self.groups[gi].id ===b)
				                        		{group = self.groups[gi]; break;}
				                        }
				                        //var group = self.groups[b-1];
				                        self.thumbnails= new $P.ThumbView(group);
				                        var colorMap = self.thumbnails.getColorMap();
				                        self.highlightNodes(group.nodeSelection, colorMap);
				                    });

				    // draw the confusion donut and ROC curve of this group
				    var panel = self.but_div.append("div")
                        .attr("class", "panel")
                        .attr("id",bid)
                        .style("display", "none")
                        .style("padding", "0 18 px")
                        .style("height", "100px")
                        .style("background-color", "white");

			        var svg = panel.append("svg")
			                        .attr("width", "100%")
			                        .attr("height","100%");
			        var group = svg.append("g").attr("transform", "translate(" + width / 4 + "," + height / 2 + ")");

			        var color = d3.scale.ordinal()
			                            .range(["red", "blue", "orange"]);

			        var pop1 = self.cutoff.tp + self.cutoff.fn; 
			        var pop2 = self.cutoff.fp + self.cutoff.tn ;
			       // var data = [pop1, pop2];
			       // var classes = Object.keys(self.classes);
			       function findKey(obj, v){
						for(var k in obj ){
							if(obj[k] === v)
								return k;
						}
						return null; 
					}

					var positive, negative; 
					positive = findKey(self.classColors, 'red');
					negative = findKey(self.classColors, 'blue');
					var pstart, pend; 

			       var classes = self.uniqueClasses; 
			        var data = [{ class: positive, population: pop1},
			        			{ class: negative, population: pop2}];

			        var population = self.cutoff.tp + self.cutoff.fn + self.cutoff.fp + self.cutoff.tn ;
			        
	        var pie = d3.layout.pie()
	            .value(function(d){ return d.population; })
	            .sort(null);
	        var arc = d3.svg.arc()
	                    .innerRadius(0)
	                    .outerRadius(height/3);
	        
	        var arcs = group.selectAll(".arc")
	                    .data(pie(data))
	                    .enter()
	                    .append("g")
	                    .attr("class", "arc");
	        arcs.append("path")
	            .attr("d", arc) // here the arc function works on every record d of data 
	            .attr("fill", function(d){
	             //return color(parseInt(d.data.class)); })
	               if(d.data.class === positive){
	               	pstart = d.startAngle;
	               	pend = d.endAngle; 
	               }
	               return self.classColors[d.data.class]; })
	            .style("opacity", 0.7);

	            console.log(self.cutoff);

	            var fpDeg = (self.cutoff.fp / population) * 360;
	            var tpDeg = (self.cutoff.tp / population) * 360;
	            var fnDeg = (self.cutoff.fn / population) * 360; 
	            var tnDeg = (self.cutoff.tn / population) * 360; 
	            
	            //var neg = ((self.cutoff.tn + self.cutoff.fp)/ population) * 360;
	            
	            var newarc1 = d3.svg.arc()
	                            .innerRadius(10)
	                            .outerRadius(20)
	                            .startAngle(-fpDeg * (Math.PI/180)) //convert from degs to radians
	                            .endAngle(tpDeg* Math.PI/180); //just radians
	                            
	                            
	           var overlay1 = group.append("path")
	                            .attr("d", newarc1)
	                            .style("fill", "white")
	                            .style("stroke-width",5)
	                            .style("stroke", function(d){
	                            	return "maroon";
	                            });

	            var newarc2 = d3.svg.arc()
	                            .innerRadius(10)
	                            .outerRadius(20)
	                            .startAngle(tpDeg* Math.PI/180) //convert from degs to radians
	                            .endAngle((tpDeg+tnDeg+fnDeg)* Math.PI/180); //just radians
	                           

	           var overlay2 = group.append("path")
	                            .attr("d", newarc2)
	                            .style("fill", "white")
	                            .style("stroke-width",5)
	                            .style("stroke", "darkblue");

				
				self.drawGroupROC(svg,width, height, fgroup);

				},
				drawGroupROC: function(svg, width, height, fgroup)
				{
			    var margin = {top: 10, right: 20, bottom: 10, left: (width/2+10)},
				 w = width- margin.left - margin.right - 10,
				 h = height - margin.top - margin.bottom -10;

				var x = d3.scale.linear().range([0, w]);
				var y = d3.scale.linear().range([h, 0]);

				x.domain([0, 1]);
				y.domain([0, 1]);

				var xAxis = d3.svg.axis().scale(x)
				    .orient("bottom").ticks(5);

				var yAxis = d3.svg.axis().scale(y)
				    .orient("left").ticks(5);

				svg.append("g")
				        .attr("class", "x axis")
				        .attr("transform", "translate("+ (width/2+10) + "," + (height-20) + ")")
				        .call(xAxis)
				       .append("text")            
				        .attr("x", width/2+20)
				        .attr("y", height-10 )
				        .style("text-anchor", "middle")
				        .text("1 - False Negative Rate");

				    svg.append("g")
				        .attr("class", "y axis")
				        .attr("transform", "translate("+ (width/2+10) + ",10)")
				        .call(yAxis);

				    // Define the line
				    var valueline = d3.svg.line()
				                        .x(function(d) { return x(d.x); })
				                        .y(function(d) { return y(d.y); });
				                          
				    var data=fgroup.roc; 
				   
				    // Add the valueline path.
				    svg.append("path")
				        .attr("class", "line")
				        .attr("d", valueline(data))
				        .style("fill", "none")
				        .style("stroke-width", 3)
				        .style("stroke", "black")
				        .attr("transform", "translate("+ (width/2+10) + ",10)");


				},
				getFeatureFullName: function(node){
					var name = node.name;
					while(node.parent){
						name = node.parent.name + "|"+name; 
						node = node.parent;
					}
					//name = name.replace('[','').replace(']','');
					return name; 
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
				/*
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
 					},*/

 				findParent: function(i, root, parent, current, ancestry){
 							var self=this;
 							var pfname = self.getFeatureFullName(root);
 							var lineage = ''+ ancestry[0];
 							for(var a = 1; a < ancestry.length; a++){
 								lineage += '|' + ancestry[a]; 
 							}
 							if(root.name === parent && pfname === lineage){
 								if(root.children.indexOf(current)>=0) // gene already exists as a child
 									return;
 								root.children.push({id: i, name: current, children:[], parent: root});
 								return;
 							}
 							else 
	 							for(var child=0; child< root.children.length; child++){
 									if(root.children.length>0) self.findParent(i, root.children[child], parent, current, ancestry);
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
						//var pnode = self.findParent(i, tree[0], genes[g-1], genes[g]);
						var pnode = self.findParent(i, tree[0], genes[g-1], genes[g], genes.slice(0,g));
						//if(pnode) pnode.children.push({id: i, name: genes[g], children:[] });
					}
					//console.log(tree[0]);
					self.root = tree[0];
					self.width = width;
					self.height = height;
					self.drawHierarchy((width-100), (height-100), self.root);	
				},
				drawHierarchy: function (width, height, root) {
					var self = this;
					if(!self.svg)
					{
						self.svg = d3.select(".attrhierarchy").append("svg")
											.attr("width", width)
											.attr("height", height)
											.append("g")
											.attr("transform", "translate("+ (width/2)+","+ (height/2) +")");
					}
					
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
						//console.log(p);
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
							//console.log(p[0],p[1]);
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
				highlightNodes: function(nodes, colorMap){
					var self = this;
					var cr = self.svg.selectAll("circle");
					console.log(nodes);
					console.log(cr);
					console.log(cr[0]);
					cr[0].forEach(function(c){
						//console.log(c.__data__.name);
						d3.select(c).style("fill", "black").style("stroke", "black");
						for(var n =0; n < nodes.length; n++){
							if(c.__data__.id === nodes[n].id)
								d3.select(c)
									.style("fill", function(d){
										if(colorMap){
											var name = self.getFeatureFullName(d);
											return colorMap[name];
										}
										else 
											return "yellow";
									})
									.style("stroke", function(d){
										if(colorMap){
											var name = self.getFeatureFullName(d);
											return colorMap[name];
										}
										else
											return"cyan";
									});
						}

						
						
					});
					nodes.forEach(function(node){

					});
				},
				
				drawRadialCluster: function(width, height, root){
					var self = this;
					var cluster = d3.layout.cluster()
										.size([width, height])
										.separation(function(a,b) { return (a.parent === b.parent? 3:4)/a.depth; });
					var c = document.getElementById("cls-select-1");
					self.cls1 = c.options[c.selectedIndex].value;
					c = document.getElementById("cls-select-2");
					self.cls2 = c.options[c.selectedIndex].value;
					
					var elem = document.getElementById("selection-butt");
					if(self.cls1 !== self.cls2)
					{
						elem.disabled = false;
						elem.value = "New Selection";
			            elem.style.backgroundColor ="lightgrey";
			             
					}
					else{
						elem.disabled = true;
						elem.style.backgroundColor ="grey";
						elem.value = "start";
					}
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
						.style("stroke", function(d){
							if (self.cls1 !== self.cls2){
								return "black";
							}	
							else{
								return "black";
							}
						})
						.style("opacity", function(d){
							var selcls = self.cls1+self.cls2;
							var show = (selcls === "RF" || selcls === "FR");


							if(d.name.includes("g__")&& (show || (self.cls1 === self.cls2)))
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
						.style("stroke", "black")
						.style("opacity", function(d){
							var selcls = self.cls1+self.cls2;
							var show = (selcls === "RE" || selcls === "ER");


							if(d.name.includes("g__")&& (show || (self.cls1 === self.cls2)))
							
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
						.style("stroke", "black")
						.style("opacity", function(d){
							var selcls = self.cls1+self.cls2;
							var show = (selcls === "EF" || selcls === "FE");


							if(d.name.includes("g__")&& (show || (self.cls1 === self.cls2)))
							
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
						.attr("class", "nodeCircle")
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
							// Select leaf-level nodes under this node
							var leaves = [];
							leaves = self.getGLevelNodes(node, leaves); 
							self.selectedNodes.push(node);
							leaves.forEach(function(leaf){
								self.selectedNodes.push(leaf);
							});
									
							d3.select(d3node).style("fill", "yellow")
														.style("stroke", "cyan")
														.style("stroke-width", 2);
							self.updateNodes();
						}
					else{
						//deselect node
						self.selectedNodes.splice(index,1);
						d3.select(d3node).style("fill", "black")
														.style("stroke", "black")
														.style("stroke-width", 0.1);
						//deselect leaf level nodes
						var leaves = [];
						leaves = self.getGLevelNodes(node, leaves); 
						leaves.forEach(function(leaf){
								var id = self.selectedNodes.findIndex(x => x.id == leaf.id);
								if(id >= 0) self.selectedNodes.splice(id,1);
							});
							
						self.updateNodes();
					}
					console.log(self.selectedNodes);
				},
				updateNodes: function(){
					var self=this;
					var all = d3.selectAll(".nodeCircle");
							all[0].forEach(function(cir){
								d3.select(cir).style("fill", function(d){
											var id= self.selectedNodes.findIndex(x => x.id == d.id);
											if(id < 0) return "black";
											else return "yellow";
											})
											.style("stroke", function(d){
												var id= self.selectedNodes.findIndex(x => x.id == d.id);
												if(id < 0) return "black";
												else return "cyan";
											})
											.style("stroke-width", function(d){
												var id= self.selectedNodes.findIndex(x => x.id == d.id);
												if(id < 0) return 0.2;
												else return 2;	
											});
							});
							
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
},{"fs":8,"random-forest-classifier":4,"../utilities":6}],2:[function(require,module,exports){
(function (process){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(done) );
        });
        function done(err) {
          if (err) {
              callback(err);
              callback = function () {};
          }
          else {
              completed += 1;
              if (completed >= arr.length) {
                  callback();
              }
          }
        }
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        if (!callback) {
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err) {
                    callback(err);
                });
            });
        } else {
            var results = [];
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        var remainingTasks = keys.length
        if (!remainingTasks) {
            return callback();
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            remainingTasks--
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (!remainingTasks) {
                var theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = function () {};

                theCallback(null, results);
            }
        });

        _each(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;
        var wrappedTask = function(wrappedCallback, wrappedResults) {
            var retryAttempt = function(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            };
            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }
        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            started: false,
            paused: false,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            kill: function () {
              q.drain = null;
              q.tasks = [];
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                if (q.paused === true) { return; }
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= q.concurrency; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
          return a.priority - b.priority;
        };

        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
            var mid = beg + ((end - beg + 1) >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
              beg = mid;
            } else {
              end = mid - 1;
            }
          }
          return beg;
        }

        function _insert(q, data, priority, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  priority: priority,
                  callback: typeof callback === 'function' ? callback : null
              };

              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
          _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            drained: true,
            push: function (data, callback) {
                if (!_isArray(data)) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain && !cargo.drained) cargo.drain();
                    cargo.drained = true;
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0, tasks.length);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'))
},{"_process":9}],3:[function(require,module,exports){
/*
    A random forest classifier.

    A random forest is a meta estimator that fits a number of decision tree
    classifiers on various sub-samples of the dataset and use averaging to
    improve the predictive accuracy and control over-fitting.

    Parameters
    ----------
    n_estimators : integer, optional (default=10)
        The number of trees in the forest.

    criterion : string, optional (default="gini")
        The function to measure the quality of a split. Supported criteria are
        "gini" for the Gini impurity and "entropy" for the information gain.
        Note: this parameter is tree-specific.

    max_features : int, float, string or None, optional (default="auto")
        The number of features to consider when looking for the best split:

        - If int, then consider `max_features` features at each split.
        - If float, then `max_features` is a percentage and
          `int(max_features * n_features)` features are considered at each
          split.
        - If "auto", then `max_features=sqrt(n_features)`.
        - If "sqrt", then `max_features=sqrt(n_features)`.
        - If "log2", then `max_features=log2(n_features)`.
        - If None, then `max_features=n_features`.

        Note: the search for a split does not stop until at least one
        valid partition of the node samples is found, even if it requires to
        effectively inspect more than ``max_features`` features.
        Note: this parameter is tree-specific.

    max_depth : integer or None, optional (default=None)
        The maximum depth of the tree. If None, then nodes are expanded until
        all leaves are pure or until all leaves contain less than
        min_samples_split samples.
        Ignored if ``max_samples_leaf`` is not None.
        Note: this parameter is tree-specific.

    min_samples_split : integer, optional (default=2)
        The minimum number of samples required to split an internal node.
        Note: this parameter is tree-specific.

    min_samples_leaf : integer, optional (default=1)
        The minimum number of samples in newly created leaves.  A split is
        discarded if after the split, one of the leaves would contain less then
        ``min_samples_leaf`` samples.
        Note: this parameter is tree-specific.

    max_leaf_nodes : int or None, optional (default=None)
        Grow trees with ``max_leaf_nodes`` in best-first fashion.
        Best nodes are defined as relative reduction in impurity.
        If None then unlimited number of leaf nodes.
        If not None then ``max_depth`` will be ignored.
        Note: this parameter is tree-specific.

    verbose : int, optional (default=0)
        Controls the verbosity of the tree building process.
*/

var async = require('async'),
    utils = require('../utilities'),
    DecisionTreeClassifier = require('../tree');

var RandomForestClassifier = function(params) {
    this.n_estimators = params.n_estimators || 10;
    this.criterion = params.criterion || "entropy";
    this.max_features = params.max_features || "auto";
    this.min_samples_split = params.min_samples_split || 2;
    this.min_samples_leaf = params.min_samples_leaf || 1;
    this.verbose = this.verbose || 0;
};

var _parallel_build_tree = function(data, features, y) {
    return function (n, next) {
        var CLF = new DecisionTreeClassifier({'num_tries': features.length});
        var tree = CLF.fit(data, features, y);
        CLF.model = tree;
        next(null, CLF);
    };
};

RandomForestClassifier.prototype = {
    fit: function(data, features, y, cb) {
        // initialize & fit trees
        // this is done async because it can be independent
        async.times(this.n_estimators, _parallel_build_tree(data, features, y), function(err, trees) {
            if (err) { console.log(err); }

            cb(err, trees);
        });
    },
    predict: function(data, trees, response) {
        this.trees = trees;
        for (var j=0; j < this.n_estimators; j++){
        	trees[j].tp = 0;
        	trees[j].tn = 0;
        	trees[j].fp = 0;
        	trees[j].fn = 0;
         }
        var y_values = _.pluck(data, response);
	    function onlyUnique(value, index, self) { 
			    return self.indexOf(value) === index;
			}
		var uniqueClasses = y_values.filter(onlyUnique);
		uniqueClasses = uniqueClasses.sort(function(a,b){ return a - b;});
		self.uniqueClasses = uniqueClasses; 
		var Cl1 = uniqueClasses[0], 
			Cl2 = uniqueClasses[1];

        var probabilities = new Array(data.length);
        for (var i=0; i < data.length ;i++) {
            var dec = [];
            for (var j=0; j < this.n_estimators; j++){
            	var treeDec = trees[j].predict(data[i], i); 
            	//TODO: Record performance measures for TP, FP, TN, and FN here for this tree
            	var res = data[i][response];
            	if(res === Cl1 && treeDec=== Cl1 )   // True Positive
            		trees[j].tp++;
            	else if(res === Cl2 && treeDec === Cl2)  // True negative
            		trees[j].tn++;
            	else if(res === Cl2 && treeDec === Cl1)  // False positive
            		trees[j].fp++;
            	else if(res === Cl1 && treeDec === Cl2)  // false negative
            		trees[j].fn++;
                dec.push(treeDec);
            }
            if (utils.GetType(dec[0]) == "string"){
                probabilities[i] = utils.GetDominate(dec);
            } else {
                probabilities[i] = utils.Average(dec);
            }
        }
        return probabilities;
    }
};

module.exports = RandomForestClassifier;

},{"../tree":5,"../utilities":6,"async":2}],4:[function(require,module,exports){
var RandomForestClassifier = require('./forest'),
    DecisionTreeClassifier = require('./tree');

module.exports.RandomForestClassifier = RandomForestClassifier;
module.exports.DecisionTreeClassifier = DecisionTreeClassifier;
},{"./forest":3,"./tree":5}],5:[function(require,module,exports){
/*A decision tree classifier.

   Parameters
   ----------
   criterion : string, optional (default="entropy")
       The function to measure the quality of a split. Supported criteria are
       "gini" for the Gini impurity and "entropy" for the information gain.

   splitter : string, optional (default="best")
       The strategy used to choose the split at each node. Supported
       strategies are "best" to choose the best split and "random" to choose
       the best random split.

   max_features : int, float, string or None, optional (default=None)
       The number of features to consider when looking for the best split:
         - If int, then consider `max_features` features at each split.
         - If float, then `max_features` is a percentage and
           `int(max_features * n_features)` features are considered at each
           split.
         - If "auto", then `max_features=sqrt(n_features)`.
         - If "sqrt", then `max_features=sqrt(n_features)`.
         - If "log2", then `max_features=log2(n_features)`.
         - If None, then `max_features=n_features`.

       Note: the search for a split does not stop until at least one
       valid partition of the node samples is found, even if it requires to
       effectively inspect more than ``max_features`` features.

   max_depth : int or None, optional (default=None)
       The maximum depth of the tree. If None, then nodes are expanded until
       all leaves are pure or until all leaves contain less than
       min_samples_split samples.
       Ignored if ``max_samples_leaf`` is not None.

   min_samples_split : int, optional (default=2)
       The minimum number of samples required to split an internal node.

   min_samples_leaf : int, optional (default=1)
       The minimum number of samples required to be at a leaf node.

   max_leaf_nodes : int or None, optional (default=None)
       Grow a tree with ``max_leaf_nodes`` in best-first fashion.
       Best nodes are defined as relative reduction in impurity.
       If None then unlimited number of leaf nodes.
       If not None then ``max_depth`` will be ignored.
*/

var _ = require("underscore"),
    utils = require("../utilities");

var DecisionTreeClassifier = function(params) {
    this.criterion = params.criterion || 'entropy';
    this.splitter = params.splitter || 'best';
    this.min_samples_split = params.min_samples_split || 2;
    this.min_samples_leaf = params.min_samples_leaf || 1;
    //this.max_depth = params.max_depth || 5;
    this.num_tries = params.num_tries || 10;
};

DecisionTreeClassifier.prototype = {
    fit: function(data, features, y) {
      var major_label = utils.GetDominate(_.pluck(data, y));
      return utils.C45(data, features, y, major_label, this.num_tries);
    },
    predict: function(sample, id) {
        var root = this.model;

        if (typeof root === 'undefined') {
            return 'null';
        }

        while (root.type !== "result") {
            var attr = root.name;
            if(!root.samples) root.samples = [];
            root.samples.push(sample['sampleID']);
            if (root.type === 'feature_real') {
                var sample_value = parseFloat(sample[attr]);
                if (sample_value <= root.cut){
                    child_node = root.vals[1];
                } else {
                    child_node = root.vals[0];
                }
            } else {
                var sample_value = sample[attr];
                var child_node = _.detect(root.vals, function(x) {
                    return x.name == sample_value;
                });
            }
            root = child_node.child;
        }
        if(root.type === "result" )
        {
        	if(!root.samples) root.samples = [];
        	root.samples.push(sample['sampleID']);
        }

        return root.val;
    }
};

module.exports = DecisionTreeClassifier;
},{"../utilities":6,"underscore":7}],6:[function(require,module,exports){
var _ = require("underscore");

Array.prototype.AllValuesSame = function(){
    if (this.length > 0) {
        for (var i = 1; i < this.length; i++){
            if (this[i] !== this[0]){
                return false;
            }
        }
    }
    return true;
}

var Gain = function(data, feature, y, numBins){
	var attribute_values = _.pluck(data, feature),
        entropy = Entropy(_.pluck(data, y)),
        size = data.length,
        feature_type = GetType(data[0][feature]);
        
    if (feature_type == "float" || feature_type == "int"){
    	var min = _.min(attribute_values);
        var max = _.max(attribute_values);
    	var step = (max - min)/numBins;
    	var entropies = [];
    	var sub_entropies = [];
    	var q = math.quantileSeq(attribute_values, [1/4, 1/2, 3/4]);
    	
    	for(var b = 0; b < q.length; b++){
    		var cutf = q[b];
    		_gain = entropy - ConditionalEntropy(data, feature, y, cutf);
    		sub_entropies.push({
                    feature: feature,
                    gain: _gain,
                    cut: cutf
                });
    	}
    	return _.max(sub_entropies, function(e){return e.gain});
    }
    else{
    	var entropies = attribute_values.map(function(n){
            var subset = data.filter(function(x){return x[feature] === n});
            return ((subset.length/size) * Entropy(_.pluck(subset, y)));
        });
        var total_entropies =  entropies.reduce(function(a, b){ return a+b; }, 0);
        return {
            feature: feature,
            gain: entropy - total_entropies,
            cut: 0
        };
    }  
};

/*var Gain = function(data, feature, y, num_tries){
    var attribute_values = _.pluck(data, feature),
        entropy = Entropy(_.pluck(data, y)),
        size = data.length,
        feature_type = GetType(data[0][feature]);

    if (feature_type == "float" || feature_type == "int"){
        var min = _.min(attribute_values);
        var max = _.max(attribute_values);

        var entropies = attribute_values.map(function(n){
            var sub_entropies = [];

            // var cutf = parseFloat(n),
            //     _gain = entropy - ConditionalEntropy(data, feature, y, cutf);
            // sub_entropies.push({
            //     feature: feature,
            //     gain: _gain,
            //     cut: cutf
            // });

            for (var i=0; i < num_tries; i++) {
                var cutf = RandomFloat(min, max),
                    _gain = entropy - ConditionalEntropy(data, feature, y, cutf);
                sub_entropies.push({
                    feature: feature,
                    gain: _gain,
                    cut: cutf
                });
            }
            return _.max(sub_entropies, function(e){return e.gain});
        });
        return _.max(entropies, function(e){return e.gain});
    } else {
        var entropies = attribute_values.map(function(n){
            var subset = data.filter(function(x){return x[feature] === n});
            return ((subset.length/size) * Entropy(_.pluck(subset, y)));
        });

        var total_entropies =  entropies.reduce(function(a, b){ return a+b; }, 0);
        return {
            feature: feature,
            gain: entropy - total_entropies,
            cut: 0
        };
    }
};*/
/*
var MaxGain = function(data, features, y, num_tries){
  var gains = [];
  for (var i=0; i < features.length; i++) {
    gains.push(Gain(data, features[i], y, num_tries));
  }

  if (_.pluck(gains, 'gain').AllValuesSame){
    return gains[RandomInt(0, gains.length)];
  } else {
    return _.max(gains,function(e){
      return e.gain;
    });
  }
};*/

var MaxGain = function(data, features, y, num_tries){
  var gains = [];
  //for (var i=0; i < features.length; i++) {
  	
  for(var i=0; i < num_tries; i++){
  	var id = parseInt(RandomFloat(0,features.length));
  	gains.push(Gain(data, features[id], y, 10));
  }

  if (_.pluck(gains, 'gain').AllValuesSame){
    return gains[RandomInt(0, gains.length)];
  } else {
    return _.max(gains,function(e){
      return e.gain;
    });
  }
};


var GetDominate = function(vals){
    return  _.sortBy(vals, function(a){
            return Count(a, vals);
        }).reverse()[0];
};

var Count = function (a, vals){
    return _.filter(vals, function(b) { return b === a}).length;
};

var Entropy = function(vals){
    var unique = _.unique(vals),
        probs = unique.map(function(x){ return Probability(x, vals); }),
        logs = probs.map(function(p){ return -p*Log2(p); });

    return logs.reduce(function(a, b){ return a+b; }, 0);
};

var ConditionalEntropy = function(_s, feature, y, cut){
    var s_1 = _s.filter(function(x){return x[feature] <= cut}),
        s_2 = _s.filter(function(x){return x[feature] > cut}),
        size = _s.length;
    return s_1.length/size*Entropy(_.pluck(s_1, y)) + s_2.length/size*Entropy(_.pluck(s_2, y));
};

var Log2 = function(n){
    return Math.log(n)/Math.log(2);
};

var Probability = function(val, vals){
    var instances = _.filter(vals, function(x) { return x === val; }).length;
    return instances/vals.length;
};

var RID = function(){
  return "_r" + Math.round(Math.random()*1000000).toString();
};

var GetType = function(input) {
    var m = (/[\d]+(\.[\d]+)?/).exec(input);
    if (m) {
       // Check if there is a decimal place
        if (m[1]) {
            return 'float';
        } else {
            return 'int';
        }
    }
    return 'string';
};

var Average = function(v){
    var sum = v.reduce(function(a, b) { return a + b });
    var avg = sum / v.length;
    return avg;
}



var C45 = function(data, features, y, major_label, num_tries){
    var tree = {};
    var y_values = _.pluck(data, y);
    function onlyUnique(value, index, self) { 
		    return self.indexOf(value) === index;
		}
	var uniqueClasses = y_values.filter(onlyUnique);
	var numRecs = data.length, 
		numCl1 = y_values.filter(function(d){return d===uniqueClasses[0];}).length, 
		numCl2 = y_values.filter(function(d){return d===uniqueClasses[1];}).length;

    // last leaf
    if (y_values.length == 1) {
        return {
            type:"result",
            val: y_values[0],
            name: y_values[0],
            numRecs: numRecs,
            cl1: numCl1,
            cl2: numCl2,
            alias: y_values[0] + RID()
        };
    }

    if (y_values.length == 0){
        return {
            type:"result",
            val: major_label,
            name: major_label,
            numRecs: numRecs,
            cl1: numCl1,
            cl2: numCl2,
            alias: major_label + RID()
        };
    }

    if (features === true){
        // end of branch
        // returning the most dominate feature
        var dominate_y = GetDominate(y_values);
        return {
            type:"result",
            val: dominate_y,
            name: dominate_y,
            numRecs: numRecs,
            cl1: numCl1,
            cl2: numCl2,
            alias: dominate_y + RID()
        };
    }

    if (!features || features.length == 0){
        // get all the features that are not y
        features = _.reject(_.keys(data[0]), function(f){ return f == y; });
    }

    var best_feature_data = MaxGain(data, features, y, num_tries),
        best_feature = best_feature_data.feature;
    var feature_remains = _.without(features, best_feature);
    var best_feature_type = GetType(data[0][best_feature]);
    // Get counts for number of records from each class in the current node
    if(best_feature_data.gain === 0){
    	 return {
            type:"result",
            val: y_values[0],
            name: y_values[0],
            numRecs: numRecs,
            cl1: numCl1,
            cl2: numCl2,
            alias: y_values[0] + RID()
        };
    }
    // check if its an int/float
    if (best_feature_type == "float" || best_feature_type == "int"){
        tree = {
            name: best_feature,
            numRecs: numRecs,
            cl1: numCl1,
            cl2: numCl2,
            alias: best_feature + RID(),
            cut: best_feature_data.cut,
            type: "feature_real",
            vals: []
        };

        if (feature_remains.length == 0){
            feature_remains = true;
        }

        var rightCutData = data.filter(function(x){ return x[best_feature] > best_feature_data.cut});
        var child_node_r = {
            name: tree.cut.toString(),
            alias: '>' + tree.cut.toString() + RID(),
            type: "feature_value"
        };
        child_node_r.child = C45(rightCutData, feature_remains, y, major_label, num_tries);
        tree.vals.push(child_node_r);

        var leftCutData = data.filter(function(x){return x[best_feature] <= best_feature_data.cut});
        var child_node_l = {
            name: tree.cut.toString(),
            alias: '<=' + tree.cut.toString() + RID(),
            type: "feature_value"
        };
        child_node_l.child = C45(leftCutData, feature_remains, y, major_label, num_tries);
        tree.vals.push(child_node_l);
    } else {
        var possibilities = possibilities = _.unique(_.pluck(data, best_feature));
        tree = {
            name: best_feature,
            alias: best_feature + RID(),
            type: "feature",
            vals: []
        };

        tree.vals = _.map(possibilities, function(v){
            var data_modified = data.filter(function(x) { return x[best_feature] == v; });

            var branch = {
                name: v,
                alias: v + RID(),
                type: "feature_value"
            };

            if (feature_remains.length == 0){
                feature_remains = true;
            }
            branch.child = C45(data_modified, feature_remains, y, major_label, num_tries);

            return branch;
        });
    }

    return tree;
};

var ID3 = function(data, features, y){
    var y_values = _.unique(_.pluck(data, y));

    // last leaf
    if (y_values.length == 1){
        return {
            type: "result",
            val: y_values[0],
            name: y_values[0],
            alias: y_values[0] + RID()
        };
    }

    if (features === true || y_values.length == 0){
        // end of branch
        // returning the most dominate feature
        var dominate_y = GetDominate(_.pluck(data, y));
        return {
            type:"result",
            val: dominate_y,
            name: dominate_y,
            alias: dominate_y + RID()
        };
    }

    if (!features || features.length == 0){
        // get all the features that are not y
        features = _.reject(_.keys(data[0]), function(f){ return f == y; });
    }

    var best_feature = _.max(features, function(f){return Gain(data, f, y).gain; });
    var feature_remains = _.without(features, best_feature);
    var possibilities = _.unique(_.pluck(data, best_feature));
    var tree = {
        name: best_feature,
        alias: best_feature + RID(),
        type: "feature"
    };

    // create the branch of the tree
    tree.vals = _.map(possibilities, function(v){
        var data_modified = data.filter(function(x) { return x[best_feature] == v; });

        var branch = {
            name: v,
            alias: v + RID(),
            type: "feature_value"
        };

        if (feature_remains.length == 0){
            feature_remains = true;
        }
        branch.child = ID3(data_modified, feature_remains, y);

        return branch;
    });

    return tree;
};

var recursived3ifyModel = function(model){
    var new_model = {};
    if (model && model.children){
        for (var j=0; j < model.children.length; j++){
            var cleanname = "";
            if (model.children[j].alias.indexOf("<=") === 0){
                cleanname += "<= ";
            } else if (model.children[j].alias.indexOf(">") === 0){
                cleanname += "> ";
            }
            cleanname += model.children[j].name;
            if (model.children[j].child && model.children[j].child.vals) {
                model.children[j].children = model.children[j].child.vals;
                model.children[j] = recursived3ifyModel(model.children[j]);
            } else if (model.children[j].child && model.children[j].child.type == "result"){
                cleanname += " " +model.children[j].child.val;
            }
            model.children[j].name = cleanname;
        }
    }

    return model;
};

var d3ifyModel = function(trees){
    var models = [];
    for (var i=0; i< trees.length; i++){
        models[i] = {
            name: trees[i].model.name,
            children: trees[i].model.vals
        }
        models[i] = recursived3ifyModel(models[i]);
    }
    return models;
};


var RandomFloat = function (a, b) {
    return Math.random()*(b-a)+a;
};


var RandomInt = function (a, b) {
    return Math.floor(Math.random()*(b-a)+a);
};


module.exports.ID3 = ID3;
module.exports.C45 = C45;
module.exports.GetType = GetType;
module.exports.GetDominate = GetDominate;
module.exports.Average = Average;
module.exports.d3ifyModel = d3ifyModel;
},{"underscore":7}],7:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],8:[function(require,module,exports){

},{}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
