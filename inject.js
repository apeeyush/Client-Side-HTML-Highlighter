var pageURL,
    textMap = [], //collects text and index node pairs
    node,         //body node
    textLength = 0,
    spans = [];


$(document).ready(function () {
    pageURL = window.location.href;
    if (pageURL.indexOf("#") != -1) {
        pageURL = pageURL.substring(0, pageURL.indexOf("#"));
    };
    node = document.getElementsByTagName("body")[0];
    getTextMap();
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.mssg == "highlight") {
            alert("highlight");
        }
        if (request.mssg == "unhighlight") {
            alert("unhighlight");
        }
        if (request.mssg == "clear_all") {
            alert("clear_all");
        }
        if (request.mssg == "html") {
            alert($("body").html());
        }
    });

function getTextMap(){
    var iNode = 0,
        nNodes = node.childNodes.length,
        nodeText,
        stack=[],
        child, nChildren,
        state;
        for (; ; ) {
            while (iNode < nNodes) {
                child = node.childNodes[iNode];
                iNode += 1;
                // text: collect and save index-node pair
                if (child.nodeType === 3) {
                    textMap.push({ i: textLength, n: child }); alert(textLength+" "+child );
                    nodeText = child.nodeValue; alert(nodeText);
                    textLength += nodeText.length;
                }
                // element: collect text of child elements,
                // except from script or style tags
                else if (child.nodeType === 1) {
                    // save parent's loop state
                    nChildren = child.childNodes.length;
                    if (nChildren) {
                        stack.push({ n: node, l: nNodes, i: iNode });
                        // initialize child's loop
                        node = child;
                        nNodes = nChildren;
                        iNode = 0;
                    }
                }
            } alert("hi");
            // restore parent's loop state
            if (!stack.length) {
                break;
            }
            state = stack.pop();
            node = state.n;
            nNodes = state.l;
            iNode = state.i;
        }
        textMap.push({ i: textLength });
};

    
