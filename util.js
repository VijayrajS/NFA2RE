import {State} from './state.js'

let state = new State();

export function newNode(end) {
    state.n++;
    return {
        "id": state.n,
        "end": end
    }
}

export function newLink(source, target, regex) {
    state.m++;
    return {
        "source": source,
        "target": target,
        "type": regex,
        "id": state.m
    }
}

export function upVal(graph) {
    state.m = graph.links.length;
    state.n = graph.nodes.length;
}

export function getInLinks(graph, nodeID) {
    let inLinks = graph.links.filter(link => 
        ((link.target == nodeID) && (link.source != nodeID)));
    return inLinks;
}

export function getOutLinks(graph, nodeID) {
    let outLinks = graph.links.filter(link => 
        ((link.source == nodeID) && (link.target != nodeID)));
    return outLinks;
         
}

export function removeNode(graph, nodeID) {
    let index = -1;
    for (let i = 0; i < graph.nodes.length; i++) {
        if (graph.nodes[i].id == nodeID) {
            index = i;
            break;
        }
    }
    if (index > -1)
        graph.nodes.splice(index, 1);
    return graph;
}

export function removeLink(graph, linkID) {
    let index = -1;
    for (let i = 0; i < graph.links.length; i++) {
        if (graph.links[i].id == linkID) {
            index = i;
            break;
        }
    }
    if (index > -1)
        graph.links.splice(index, 1);
    return graph;
}

