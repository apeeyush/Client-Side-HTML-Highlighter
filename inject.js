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
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = chrome.extension.getURL('inj.css');
    (document.head||document.documentElement).appendChild(style);
    getTextMap(); //alert(textLength);
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
    unrender();
    render();
};

function synLocalData(){
    //alert("synLocalData");
};

function unrender(){
    var textmap = textMap,
            i = textmap.length - 1,
            entry, efmNode, efmParent;
            // 1st pass, remove highlights
            while (i-- > 0) {
                entry = textmap[i];
                efmNode = entry.n.parentNode;
                if (efmNode && efmNode.className && efmNode.className === 'efm-hi') {
                    efmNode.parentNode.replaceChild(entry.n, efmNode);
                }
            }
            // 2nd pass, remove highlight parents
            i = textmap.length - 1;
            while (i-- > 0) {
                entry = textmap[i];
                efmParent = entry.n.parentNode;
                if (efmNode && efmNode.className && efmParent.className === 'efm-parent') {
                    while (efmParent.hasChildNodes()) {
                        efmParent.parentNode.insertBefore(efmParent.firstChild, efmParent);
                    }
                    efmParent.parentNode.removeChild(efmParent);
                }
            }
};

function render(){
    var i = spans.length,
    span;
    while (i-- > 0) {
        span = spans[i];
        renderSpan(span.start, span.end);
    }
};

function renderSpan(iTextStart, iTextEnd){
    var textmap = textMap,
            i, iLeft, iRight,
            iEntry, entry, entryStart, entryText,
            whitespaces,
            iNodeTextStart, iNodeTextEnd,
            efmParentNode, efmNode, efmTextNode;

            // find entry in textmap array (using binary search)
            iLeft = 0;
            iRight = textmap.length;
            while (iLeft < iRight) {
                i = iLeft + iRight >> 1;
                if (iTextStart < textmap[i].i) { iRight = i; }
                else if (iTextStart >= textmap[i + 1].i) { iLeft = i + 1; }
                else { iLeft = iRight = i; }
            }
            iEntry = iLeft;
            iRight = textmap.length;
            while (iEntry < iRight) {
                entry = textmap[iEntry];
                entryStart = entry.i;
                entryText = entry.n.nodeValue;
                iNodeTextStart = iTextStart - entryStart;
                iNodeTextEnd = Math.min(iTextEnd, textmap[iEntry + 1].i) - entryStart;
                // remove entry, for creating a new entry reflecting new structure
                textmap.splice(iEntry, 1);
                // create parent node which will receive the (up to three) child nodes
                efmParentNode = document.createElement('span');
                efmParentNode.className = 'efm-parent';
                // slice of text before hilighted slice
                if (iNodeTextStart > 0) {
                    efmTextNode = document.createTextNode(entryText.substring(0, iNodeTextStart));
                    efmParentNode.appendChild(efmTextNode);
                    textmap.splice(iEntry, 0, { i: entryStart, n: efmTextNode });
                    entryStart += efmTextNode.length;
                    iEntry++;
                }
                // highlighted slice
                efmNode = document.createElement('span');
                efmTextNode = document.createTextNode(entryText.substring(iNodeTextStart, iNodeTextEnd));
                efmNode.appendChild(efmTextNode);
                efmNode.className = 'efm-hi';
                efmParentNode.appendChild(efmNode);
                textmap.splice(iEntry, 0, { i: entryStart, n: efmTextNode });
                entryStart += efmTextNode.length;
                iEntry++;
                // slice of text after hilighted slice
                if (iNodeTextEnd < entryText.length) {
                    efmTextNode = document.createTextNode(entryText.substr(iNodeTextEnd));
                    efmParentNode.appendChild(efmTextNode);
                    textmap.splice(iEntry, 0, { i: entryStart, n: efmTextNode });
                    entryStart += efmTextNode.length;
                    iEntry++;
                }
                // replace text node with our efm parent node
                entry.n.parentNode.replaceChild(efmParentNode, entry.n);
                // if the match doesn't intersect with the following
                // index-node pair, this means this match is completed
                if (iTextEnd <= textmap[iEntry].i) {
                    break;
                }
            }
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

