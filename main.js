import {coalesceEnd} from './graphops.js'
import {nodeElim} from './graphops.js'
import {linkElim} from './graphops.js'
import {linkReduce} from './graphops.js'
import {loopElim} from './graphops.js'
import {addNode} from './graphops.js'
import {addLink} from './graphops.js'

import {newNode} from './util.js'
import {newLink} from './util.js'
import {upVal} from './util.js'

const color = d3.scaleOrdinal(d3.schemeCategory10);

const svg = d3.select("svg");
const width = svg.attr("width");
const height = svg.attr("height");

//////////////////////////
//  Home.js Input file  //
//////////////////////////

// Creates a new graph and deletes the old one
function newgraph() {
    othergraph = {
        nodes: [],
        links: []
    }
    up(othergraph);
}

//////////////////////////
//  UI input listeners  //
//////////////////////////

let snodelListener = document.getElementById('snodel');
let tnodelListener = document.getElementById('tnodel');
let nodelButListener = document.getElementById('nodelbut');

let slinkredListener = document.getElementById('slinkred');
let tlinkredListener = document.getElementById('tlinkred');
let linkredButListener = document.getElementById('linkredbut');

let looprListener = document.getElementById('loopr');
let looprButListener = document.getElementById('looprbut');

let endListener = document.getElementById('end');
let endButListener = document.getElementById('endbut');

let noderListener = document.getElementById('noder');
let noderButListener = document.getElementById('noderbut');

let stepButListener = document.getElementById('stepbut');

let newnListener = document.getElementById('newn');
let newnButListener = document.getElementById('newnbut');

let snewlListener = document.getElementById('snewl');
let tnewlListener = document.getElementById('tnewl');
let rnewlListener = document.getElementById('rnewl');
let newlButListener = document.getElementById('newlbut');

let newgButListener = document.getElementById('newb');

// For creating a new graph
newgButListener.addEventListener('click', e => {
    e.preventDefault();

    newgraph();
});

// For adding a new Link
newlButListener.addEventListener('click', e => {
    e.preventDefault();

    let sourceID = parseInt(snewlListener.value);
    let targetID = parseInt(tnewlListener.value);
    let regex = rnewlListener.value;

    let verif = othergraph.nodes.filter(e => e.id == sourceID);
    if (verif.length == 0) {
        alert("Invalid source ID");
        return;
    }
    verif = othergraph.nodes.filter(e => e.id == targetID);
    if (verif.length == 0) {
        alert("Invalid target ID");
        return;
    }

    let newlink = newLink(sourceID, targetID, regex);
    othergraph = addLink(othergraph, newlink);
    up(othergraph);
});

// For adding a new button
newnButListener.addEventListener('click', e => {
    e.preventDefault();

    let end = newnListener.checked;
    //console.log(end, typeof(end));
    let node = newNode(end);
    othergraph = addNode(othergraph, node);
    up(othergraph);
});

// The button to step over the full system
stepButListener.addEventListener('click', e => {
    e.preventDefault();

    if (othergraph.nodes.length == 2 && othergraph.links.length == 1) {
        alert("The NFA is reduced completely");
        return;
    }

    othergraph = step(othergraph);
    up(othergraph);
});

// The button to reduce the number of loops on a single node
looprButListener.addEventListener('click', e => {
    // Stop the page from refreshing as it's a button press on a form
    e.preventDefault();

    let nodeID = parseInt(looprListener.value);
    othergraph = loopElim(othergraph, nodeID)
    up(othergraph);
});

// The button to merge the multiple end states into a single one
endButListener.addEventListener('click', e => {
    // Stop the page from refreshing as it's a button press on a form
    e.preventDefault();

    console.log("things")
    othergraph = coalesceEnd(othergraph)
    up(othergraph);
});

// The button for the final elimination machine
linkredButListener.addEventListener('click', e => {
    // Stop the page from refreshing as it's a button press on a form
    e.preventDefault();

    let sourceID = parseInt(slinkredListener.value);
    let targetID = parseInt(tlinkredListener.value);
    console.log(sourceID, targetID);
    console.log(othergraph);
    //temp(sourceID, targetID);
    othergraph = linkReduce(othergraph)//, sourceID, targetID)
    up(othergraph);
});


// The button that eliminates the multiple links between two nodes
nodelButListener.addEventListener('click', e => {
    // Stop the page from refreshing as it's a button press on a form
    e.preventDefault();

    let sourceID = parseInt(snodelListener.value);
    let targetID = parseInt(tnodelListener.value);
    console.log(sourceID, targetID);
    console.log(othergraph);
    //temp(sourceID, targetID);
    othergraph = linkElim(othergraph, sourceID, targetID)
    up(othergraph);
});

// The button that eliminates a single node
noderButListener.addEventListener('click', e => {
    // Stop the page from refreshing as it's a button press on a form
    e.preventDefault();

    let sourceID = parseInt(noderListener.value);
    console.log(sourceID);
    console.log(othergraph);
    othergraph = nodeElim(othergraph, sourceID);
    up(othergraph);
});



// This is the arrow
svg.append('defs').append('marker')
    .attrs({'id':'arrowhead',
        'viewBox':'-0 -5 10 10',
        'refX':20,
        'refY':0,
        'orient':'auto',
        'markerWidth':13,
        'markerHeight':13,
        'xoverflow':'visible'})
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#999')
    .style('stroke','none');

let simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
        .id(d => {return d.id;})
        .distance(200)
        .strength(.1))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

let link = svg.selectAll(".link");
let edgepaths = svg.selectAll(".edepath");
let edgelabels = svg.selectAll(".edgelabel");
let node = svg.selectAll(".node");

function ticked() {

    node.attr("transform", function (d) {
            if(d.x > width-50) d.x = width-50;
            if(d.y > height-50) d.y = height-50;
            if(d.x < 100) d.x = 100;
            if(d.y < 100) d.y = 100;

            return "translate(" + d.x + ", " + d.y + ")";
        });

    link.attr("d", positionLink)
    edgepaths.attr("d", positionLink);
    edgelabels.attr('transform', function (d) {
        if (d.target.x < d.source.x) {
            let bbox = this.getBBox();

            let rx = bbox.x + bbox.width / 2;
            let ry = bbox.y + bbox.height / 2;
            return 'rotate(180 ' + rx + ' ' + ry + ')';
        }
        else {
            return 'rotate(0)';
        }
    });

}

// Helps define the curve on the links
function positionLink(d) {
    /*var offset = (Math.random()-Math.random())*100;
    console.log(d)*/
    let id = d.id;
    // let offset = id * (id%2==0?1:-1) * 30;
    let idc = (id%2 == 0)?(-id/2):(id+1)/2;
    let offset = idc * 30;

    let midpoint_x = (d.source.x + d.target.x) / 2;
    let midpoint_y = (d.source.y + d.target.y) / 2;

    let dx = (d.target.x - d.source.x);
    let dy = (d.target.y - d.source.y);

    if (dx == 0 && dy == 0)
        return loopPosLink(d);

    let normalise = Math.sqrt((dx * dx) + (dy * dy));

    let offSetX = midpoint_x + offset*(dy/normalise);
    let offSetY = midpoint_y - offset*(dx/normalise);

    return "M" + d.source.x + "," + d.source.y +
        "S" + offSetX + "," + offSetY +
        /*"S" + midpoint_x + "," + midpoint_y +*/
        " " + d.target.x + "," + d.target.y;
}

// Helps define curvature for looped links
function loopPosLink(d) {
    var x1 = d.source.x,
      y1 = d.source.y,
      x2 = d.target.x,
      y2 = d.target.y,
      dx = x2 - x1,
      dy = y2 - y1,
      dr = Math.sqrt(dx * dx + dy * dy),

      // Defaults for normal edge.
      drx = dr,
      dry = dr,
      xRotation = 0, // degrees
      largeArc = 0, // 1 or 0
      sweep = 1; // 1 or 0

      // Self edge.
      if ( x1 === x2 && y1 === y2 ) {
        // Fiddle with this angle to get loop oriented.
        xRotation = -45;

        // Needs to be 1.
        largeArc = 1;

        // Change sweep to change orientation of loop. 
        //sweep = 0;

        // Make drx and dry different to get an ellipse
        // instead of a circle.
        drx = d.id*10;
        dry = 20;

        // For whatever reason the arc collapses to a point if the beginning
        // and ending points of the arc are the same, so kludge it.
        x2 = x2 + 1;
        y2 = y2 + 1;
      } 

 return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
}

// Terminate the force layout when this cell re-runs.
//invalidation.then(() => simulation.stop());
function up(graph) {
    upVal(graph);
    
    update(graph.nodes, graph.links)

    cleanerrors();
}


function update(nodes, links) {

    // Make a shallow copy to protect against mutation, while
    // recycling old nodes to preserve position and velocity.
    const old = new Map(node.data().map(d => [d.id, d]));
    nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
    //nodes = nodes.map(d => Object.assign({}, d));
    links = links.map(d => Object.assign({}, d));

    console.log(nodes, links);

    link = link
        .data(links, d => [d.source, d.target])
        .join("path")
            .attrs({
                "class": "link",
                "fill-opacity": 0,
                "marker-end": "url(#arrowhead)"
            })
            .style("pointer-events", "none");

    edgepaths = edgepaths
        .data(links, d => d)
        .join("path")
            .attrs({
                'class': 'edgepath',
                'fill-opacity': 0,
                'stroke-opacity': 0,
                'id': (d, i) => 'edgepath' + i
            })
            .style("pointer-events", "none");
    
    edgelabels = edgelabels
        .data(links, d => d)
        .join("text")
            .attrs({
                'class': 'edgelabel',
                'id': (d, i) => 'edgelabel' + i,
                'font-size': 15,
                'fill': '#aaa'
            });

    edgelabels.append('textPath')
        .attr('xlink:href', (d, i) => '#edgepath' + i)
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("startOffset", "50%")
        .text(d => d.type);

    node = node
        .data(nodes, d => d)
        .join("g")
            .attr("class", "node")
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            );
    node
        .append("circle")
            .attr("r", 18)
            .attr("fill", d => color(d.id));
    node
        .append("title")
            .text(d=>d.id);
    node
        .append("text")
            .attrs({
                "dy": -18,
                "font-size": 15
            })
            .text(d => d.id + (d.end?" : end":""));

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
}

var step_ = 0;
function step(graph){
    if(graph.nodes.length == 2){
        let otherNode = graph.nodes.filter(link =>
            (link.id != 0))[0].id;
        
        graph = loopElim(graph, otherNode);
        graph = linkElim(graph, 0, otherNode);
        graph = linkElim(graph, otherNode, 0);

        graph = linkReduce(graph);
        graph.links[0].id = 0;
        return graph;
    }
    
    else{
        if(step_ == 0){
            graph = coalesceEnd(graph);
            graph = loopElim(graph, 0);
            
            step_ = 1;
        }
        
        let secondNode = graph.links.filter(link =>
            (link.source == 0 && link.target != 0))[0].target;
        
        graph = loopElim(graph, secondNode);
        graph = linkElim(graph, 0, secondNode);
        graph = linkElim(graph, secondNode, 0);
        graph = nodeElim(graph, secondNode);
        
        return graph;
        
    }
}

// Sample graphs

let othergraph = {
    nodes: [
        {id:0, end: false},
        {id:1, end: false},
        {id:2, end: true},
        {id:3, end: true}
    ],
    links: [
        {source: 0, target: 1, type: "a", id: 0},
        {source: 0, target: 3, type: "x", id: 1},
        {source: 1, target: 2, type: "r", id: 2},
        {source: 1, target: 2, type: "t", id: 3},
        {source: 2, target: 3, type: "f", id: 4},
    ]
}

let zoobgraph = {
    nodes: [
        {id:0, end: false},
        {id:1, end: true},
    ],
    links: [
        {source: 0, target: 1, type: "r2", id: 0},
        {source: 1, target: 0, type: "r3", id: 1},
        {source: 0, target: 0, type: "r1", id: 2},
        {source: 0, target: 0, type: "r5", id: 4},
        {source: 1, target: 1, type: "r4", id: 3},
    ]
}

function cleanerrors() {
    let x = document.getElementById('edgelabel0');
    let y = x.children;
    let len = y.length;
    //console.log(x.children);
    for (let i = 0; i < len; i++) {
        let elem = y[i];
        if (i != len - 1) {
            // delete it
            console.log(elem)
            elem.remove();
        }
    } 
}

up(othergraph);

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = event.x;
    d.fy = event.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = undefined;
    d.fy = undefined;
}

