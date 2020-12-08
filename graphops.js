import {getInLinks} from './util.js'
import {getOutLinks} from './util.js'
import {removeNode} from './util.js'
import {removeLink} from './util.js'
import {newNode} from './util.js'
import {newLink} from './util.js'
import {upVal} from './util.js'


export function coalesceEnd(graph) {
    let relevantNodes = graph.nodes.filter(nodes => nodes.end);
    if (relevantNodes.length <= 1) {
        if(relevantNodes.length == 0){
            alert("You need atleast one end state");
        }
        return graph;
    }

    // Add the new node
    let finalNode = newNode(true);
    let newlink;
    graph = addNode(graph, finalNode);

    // Modify end of old nodes and add new empty links to new end node
    for (let i = 0; i < relevantNodes.length; i++) {
        relevantNodes[i].end = false;
        newlink = newLink(relevantNodes[i].id, finalNode.id, "");
        graph = addLink(graph, newlink);
    }
    
    return graph;
}

export function nodeElim(graph, nodeID) {
    // Preliminary checks: The graph must be at least 3 elements, and (TODO
    // implement) the node targeted must not be the start or the end.
    if (graph.nodes.length < 3) {
        alert("You cannot eliminate nodes in a graph when there are less than two states");
        return graph;
    }
    
    if(nodeID == 0){
        alert("You cannot eliminate the start node");
        return graph;
    }

    // Delete the node
    graph = removeNode(graph, nodeID)

    // Store the loop
    let selfLink = graph.links.filter(link => 
        ((link.source == link.target) && (link.source == nodeID)));
    
    // if (selfLink.length > 1)
    //     return graph;

    let selfLinkRegex = "";
    if (selfLink.length == 1)
        selfLinkRegex = selfLink[0].type + "*";
    
    // Update the links
    let inLinks = getInLinks(graph, nodeID);
    console.log(inLinks);
    
    if(selfLink.length == 0){
        for (let i = 0; i < inLinks.length; i++) {
            let inLink = inLinks[i];

            let outLinks = getOutLinks(graph, nodeID);
            console.log(outLinks);
            for (let j = 0; j < outLinks.length; j++) {
                let outLink = outLinks[j];
                
                let finalLinkRegex = inLink.type + outLink.type;
                let finalLink = newLink(inLink.source, outLink.target, finalLinkRegex);
                graph = addLink(graph, finalLink);
            }
        }
    }

    else{
        for(let k = 0; k < selfLink.length; k++){
            for (let i = 0; i < inLinks.length; i++){
                let inLink = inLinks[i];

                let outLinks = getOutLinks(graph, nodeID);
                console.log(outLinks);
                for (let j = 0; j < outLinks.length; j++) {
                    let outLink = outLinks[j];
                    
                    let finalLinkRegex = inLink.type + selfLink[k].type + outLink.type;
                    let finalLink = newLink(inLink.source, outLink.target, finalLinkRegex);
                    graph = addLink(graph, finalLink);
                }
            }
        }
    }
    
    let len = graph.links.length
    let remv = [];
    for (let i = 0; i < len; i++) {
        let link = graph.links[i];
        console.log("trying to remove link with source ", link.source, " and target ", link.target, "against node: ", nodeID);
        if (link.source == nodeID || link.target == nodeID) {
            remv.push(link.id);
            console.log("will be removed ")
        }
    }
    for(let i = 0; i < remv.length; i++) {
        graph = removeLink(graph, remv[i]);
    }

    return graph;
}

/////////////////////////////////////////////////////////////
//  linkElim.js, to be moved to its own file as a module   //
/////////////////////////////////////////////////////////////

// Unlike the python one, this replaces the graph fully

export function linkElim(graph, sourceID, targetID) {
    // Select all the edges with each ID as source/target
    let relevantLinks = []
    for (let i = 0; i < graph.links.length; i++) {
        let link = graph.links[i];
        if (link.source == sourceID && link.target == targetID) {
            relevantLinks.push(link);
        }
    }

    if (relevantLinks.length <= 1)
        return graph;

    // Generate the final RE, then remove old edges, then add new edge
    let finalLinkRegex = "";
    for (let i = 0; i < relevantLinks.length; i++) {
        let link = relevantLinks[i];
        finalLinkRegex += link.type;
        if (i < relevantLinks.length - 1)
            finalLinkRegex += '|';
    }

    let finalLink = newLink(sourceID, targetID, finalLinkRegex);

    for (let i = 0; i < relevantLinks.length; i++) {
        let link = relevantLinks[i];
        graph = removeLink(graph, link.id);
    }
    graph = addLink(graph, finalLink);
    return graph;
}


/////////////////////////////////////////////////////////
//  linkReduce.js, to be moved to its own module file  //
/////////////////////////////////////////////////////////

export function linkReduce(graph) {
    if (graph.nodes.length != 2) {
        alert('The graph can only have two states for this rewrite rule to be applied');
        return graph;
    }
    
    let sourceID = -1, targetID = -1;
    for(i = 0; i < 2; i++){
        if(graph.nodes[i].end){
            targetID = graph.nodes[i].id;
        }
        
        else{
            sourceID = graph.nodes[i].id;
        }
    }
    
    if(sourceID == -1 || targetID == -1){
        alert('The graph needs one start state and one end state for this rewrite rule to be applied');
        return graph;
    }
    
    console.log(sourceID, targetID);
    let v1tov1edge = graph.links.filter(link =>
        ((link.source == sourceID) && (link.target == sourceID)));
    
    let v1tov1re = "";
    console.log(v1tov1edge)
    if(v1tov1edge.length){
        v1tov1re = v1tov1edge[0].type;
    }
    
    let v1tov2edge = graph.links.filter(link =>
        ((link.source == sourceID) && (link.target == targetID)));
    
    let v1tov2re = v1tov2edge[0].type;
    
    let v2tov2edge = graph.links.filter(link =>
        ((link.source == targetID) && (link.target == targetID)));
    
    let v2tov2re = "";
        
    if(v2tov2edge.length){
        v2tov2re = v2tov2edge[0].type;
    }
        
    let v2tov1edge = graph.links.filter(link =>
        ((link.source == targetID) && (link.target == sourceID)));
    
    let v2tov1re = "";
    if(v2tov1edge.length){
        v2tov1re = v2tov1edge[0].type;
    }
    
    if((v1tov1edge.length && v1tov1edge.length > 1)
        || (v1tov2edge.length && v1tov2edge.length != 1)
        || (v2tov1edge.length && v2tov1edge.length > 1)
        || (v2tov2edge.length && v2tov2edge.length > 1)){
        alert("This graph does not satisfy the criteria for edge reduction. There must be two nodes, with atmost one edge from the acceptance state to start state, atmost one loop edge on each state and exactly one edge from the start state to the end state");
        return graph;
    }
    
    let final_regex = '';
    if(v2tov1re != ''){
        final_regex = "((" + v1tov1re + v1tov2re + v2tov2re + v2tov1re + ")*" +
                    "(" + v1tov1re + v1tov2re + v2tov2re  + "))"
    }
    else{
        final_regex = "(" + v1tov1re + v1tov2re + v2tov2re + ")"
    }
    
    //m = 1; n = 2;
    graph = ({
        nodes: [
            {id: 0, end: false},
            {id: 1, end: true},
        ],
        links: [{source: 0, target: 1, type: final_regex, id: 0}]
    })
    upVal(graph);
    
    return graph;
}

///////////////////////////////////////////////////////
//  loopElim.js, to be moved to its own module file  //
///////////////////////////////////////////////////////

export function loopElim(graph, nodeID) {
    let selfLoopList = graph.links.filter(link => 
        ((link.source == nodeID) && (link.target == nodeID)));
    if (selfLoopList.length <= 1)
        return graph;

    let finalLinkRegex = "("
    for (let i = 0; i < selfLoopList.length; i++) {
        let loop = selfLoopList[i];
        finalLinkRegex += loop.type;
        finalLinkRegex += "*";
    }
    finalLinkRegex += ")";

    let finalLink = newLink(nodeID, nodeID, finalLinkRegex);

    for (let i = 0; i < selfLoopList.length; i++) {
        let loop = selfLoopList[i];
        graph = removeLink(graph, loop.id);
    }

    graph = addLink(graph, finalLink);
    return graph;
}


export function addNode(graph, node) {
    graph.nodes.push(node);
    return graph;
}

export function addLink(graph, link) {
    graph.links.push(link);
    console.log("new", graph);
    return graph;
}
