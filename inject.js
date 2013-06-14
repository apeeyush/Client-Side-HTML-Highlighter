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
    getTextMap(); // alert(textLength);
    //getSpans();
    //synDOMHighlights();
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.mssg == "highlight") {
            highlightSelection();
            //alert("highlight");
        }
        if (request.mssg == "unhighlight") {
            //alert("unhighlight");
        }
        if (request.mssg == "clear_all") {
            localStorage.removeItem(pageURL);
            //alert("clear_all");
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
                    textMap.push({ i: textLength, n: child }); //alert(textLength+" "+child );
                    nodeText = child.nodeValue; //alert(nodeText);
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
            } //alert("hi");
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

function getSpans(){
    var spanTextData = localStorage.getItem(pageURL);
    if(spanTextData == null){
        spanTextData = "[]";
        localStorage.setItem(pageURL, spanTextData);
    };
    spans = JSON.parse(spanTextData);
};

function addSpan(start, end){
            // spans must be ordered
            // normalize span
            if (start > end) {
                var tmp = start;
                start = end;
                end = tmp;
            }
            start = Math.max(0, start);
            end = Math.min(textLength, end);
            if (start === end) { return; }
            // find insertion point
            var n = spans.length,
            i, span,
            iLeft = 0,
            iRight = n;//alert(n);
            while (iLeft < iRight) {
                i = iLeft + iRight >> 1;
                if (end < spans[i].start) { iRight = i; }
                else if (start > spans[i].end) { iLeft = i + 1; }
                else { iRight = i; }
            }
            // merge spans which intersect
            while (iRight < n) {
                span = spans[iRight];
                if (span.start > end) {
                    break;
                }
                start = Math.min(span.start, start);
                end = Math.max(span.end, end);
                iRight++;
            }
            // insert
            spans.splice(iLeft, iRight - iLeft, { start: start, end: end });
};
    
function highlightSelection(){
    if (!window.getSelection) { return; }
    var selection = window.getSelection();
    if (!selection) { return; }
    var iRange, range,
        iTextStart, iTextEnd;

    for (iRange = 0; iRange < selection.rangeCount; iRange++) {
        range = selection.getRangeAt(iRange);
        // convert to target container world
        iTextStart = normalizeOffset(range.startContainer, range.startOffset);
        iTextEnd = normalizeOffset(range.endContainer, range.endOffset);
        if (iTextStart >= 0 && iTextStart < iTextEnd) {
            addSpan(iTextStart, iTextEnd);
        }
     }
       
     selection.removeAllRanges();
     syncDOMAll();
        
};

function syncDOMAll(){
    synDOMHighlights();
    synLocalData();
};

function synDOMHighlights(){
    alert("synDOMHighlights");
};

function synLocalData(){
    alert("synLocalData");
};

function normalizeOffset(textNode, offset) {
    if (textNode.nodeType !== 3) {
        return -1;
        }
     // Find entry in textmap array (using binary search)
     var textmap = textMap,
     iEntry = textmap.length,
     entry;
     while (iEntry-- > 0) {
         entry = textmap[iEntry];
         if (textNode === entry.n) {
              //alert(entry.i+offset);
              return entry.i + offset;
           }
         }
     return -1;
};

