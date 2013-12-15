// Dimensions of sunburst.
var width = 750;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
  "attr0": "#5687d1",
  "attr1": "#7b615c",
  "attr2": "#de783b",
  "attr3": "#6ab975",
  "attr4": "#a173d1",
  "attr5": "#bbbbbb",
};
var layerInfo = {'layer': 0, 'attributePath': []}; // layer and attribute path
var layerAngle = [];
var allLayerSlices = []
// Total size of all segments; we set this later, after loading the data.
var totalSize = 0; 
    
var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
    
var getInitialData = function() { return [];};
    
var arc = d3.svg.arc()
    .startAngle(function(d) { return d.sAngle; })
    .endAngle(function(d) { return d.eAngle; })
    .innerRadius(function(d) { return d.inRadius; })
    .outerRadius(function(d) { return d.inRadius + d.Radius; });

function createWidget(layer) {

  creatDataForLayer(mockPath[layer]);
  
  var path = vis.selectAll('path')
  .data(allLayerSlices)
  .enter()
  .append('path')
  .attr('d', arc)
  .style('fill', function(d){ return colors["attr" + d.attrNum]})
  .on("dblclick", dblclick);
  
  path.transition()
  .duration(750)
  .delay(function(d, i) { return i * 10; });  
}

function dblclick(d) {
  alert((d.eAngle-d.sAngle)/(2*Math.PI));
}

/**
 * @param number, layer starts from 0
 * @param [], ptgs is the return ptgs in getAttributePercentages()
 * This function caculate the startAngle and Engle for every slice in the new layer, and store ptgs and Angle info in LayerAngle.
 * 
 */
function populateLayerAngle(layer, ptgs) {
  var len = ptgs.length,
      i, j;
  var curLayer = [];

  if(layer == 0) { // This is the first layer, now layerAngle is empty
    var sAngle = 0, wAngle = 2 * Math.PI, acPtg=0;
    for(i = 0; i < len; i++) {
      var obj = {};

      acPtg += obj.ptg = ptgs[i];
      obj.sAngle = sAngle;
      sAngle = obj.eAngle = acPtg * wAngle;
      obj.layer = layer;
      obj.inRadius = 100 + 60*layer;
      obj.Radius = 60;
      obj.attrNum = i;

      curLayer.push(obj);
      allLayerSlices.push(obj);
    }

  } else {
    // when caculate the current layer, we need to consider the prelayer.
    var prelen = layerAngle[layer-1].length, //get the slice number in last layer
        atrNum = len / prelen; // number of different values in this layer's attribute
    for(i=0; i<prelen; i++) {
      var gap = i * atrNum,
          preLayerAngle = layerAngle[layer - 1],
          sAngle = preLayerAngle[i].sAngle, wAngle = preLayerAngle[i].eAngle - sAngle, acPtg = 0;

      for(j=0; j<atrNum; j++) {
        var obj = {}, index = gap + j;

        acPtg += ptgs[index];
        obj.ptg = ptgs[index];
        obj.sAngle = sAngle;
        obj.eAngle = sAngle + obj.ptg * wAngle;
        sAngle = obj.eAngle;
        obj.layer = layer;
        obj.inRadius = 100 + 60*layer;
        obj.Radius = 60;
        obj.attrNum = j;

        curLayer.push(obj);
        allLayerSlices.push(obj);
      }
    }
  }
  layerAngle[layer] = curLayer;
  
  return curLayer;
}

/**
  * @param [] Attributes like: [A, B,..., X]
  * This means to get the Attribute attrX's percentage base the the preAttributes.
  * Eg. A {A1,A2,...,Ax}, B{B1,B2,..,By}, ..., X{X1,X2,...,Xz}
  * @return [] Return Value [A1B1X1,...,A1B1Xz, A1B2X1,...,A1B2Xz,....,AxByX1, AxByX2...,AxByXz], AmBnX1 + AmBnX2 + ... + AmBnXz = 1
  *
  */
function getAttributePercentages(attributePath) {
  var ptgs = [];
  //task to get the all the percentages, assign value to ptgs;
  return ptgs;
}

//try to get a dummy value for test, the return data just like what getAttributePercentages returns
var mockPath = [['Gender'], ['Gender', 'City'], ['Gender', 'City', 'Income']];
function getMockPercentages(attributePath) {
  var layer = attributePath.length;
  switch(layer) {
    case 1: return [0.3, 0.3, 0.4];
    case 2: return [0.2,0.8,0.3,0.7,0.4,0.6];
    case 3: return [0.1,0.4,0.5, 0.2,0.2,0.6, 0.3,0.2,0.5, 0.7,0.3,0, 0.8,0.1,0.1, 0.3,0.3,0.4];
    default: return;
  }
}


function creatDataForLayer(attributePath) {
    var layer = attributePath.length - 1,
        ptgs = getMockPercentages(attributePath);
        

    populateLayerAngle(layer, ptgs);
}

//createWidget(0);
//createWidget(1);
//createWidget(2);
