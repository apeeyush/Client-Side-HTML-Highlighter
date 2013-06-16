var pageURL,
    textMap = [],  //map of all nodes with thier lenghts of inner  text
    bodyNode,          //body node
    textLength = 0,//total length of all text present in text nodes of webpage
    spans = [];    //stores the location where to add <span> fo highlighting


$(document).ready(function () {
    pageURL = window.location.href;
    //page url changes as internal link is opened and adds # followed by id of anchor
    if (pageURL.indexOf("#") != -1) {
        pageURL = pageURL.substring(0, pageURL.indexOf("#"));
    };
    bodyNode = document.getElementsByTagName("body")[0];
    //injecting css for coloring <span> tag
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = chrome.extension.getURL('inject.css');
    (document.head||document.documentElement).appendChild(style);

    getTextMap();
    getSpans();
    synDOMHighlights();  //it highlights old highlights on when page reloads
});

//for listening to popup page for knowing user's action
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.mssg == "highlight") {
            highlightSelection();
        }

        if (request.mssg == "unhighlight") {
            unHighlightSelection();
        }

        if (request.mssg == "clear_all") {
            localStorage.removeItem(pageURL);
            spans = [];
            synDOMHighlights();
        }
    });



function getTextMap(){
    var iNode = 0,                       //index of current node w.r.t. parent node
        node = bodyNode,
        nNodes = node.childNodes.length, //no. child nodes in body
        nodeText,                        //text within a node
        stack=[],                        //used for going in deeper levels of nodes
        child,
        nChildren,
        state;
        for (; ; ) {
            while (iNode < nNodes) {
                child = node.childNodes[iNode];
                iNode += 1;
                // text: collect and save index-node pair
                if (child.nodeType === 3) {
                    textMap.push({ i: textLength, n: child }); 
                    nodeText = child.nodeValue;
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



//fills spans aray with stored data
function getSpans(){
    var spanTextData = localStorage.getItem(pageURL);
    if(spanTextData == null){
        spanTextData = "[]";
    };
    spans = JSON.parse(spanTextData);
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
        //these will store index of highlighted portion among total text data of page
        iTextStart = normalizeOffset(range.startContainer, range.startOffset);
        iTextEnd = normalizeOffset(range.endContainer, range.endOffset);
        if (iTextStart >= 0 && iTextStart < iTextEnd) {
            //ading data to spans array
            addSpan(iTextStart, iTextEnd);
        }
     }
       
     selection.removeAllRanges();
     syncDOMAll(); // rehighlighting
        
};



function unHighlightSelection(){
            if (!window.getSelection) { return; }
            var selection = window.getSelection();
            if (!selection) { return; }
            var iRange, range,
            iTextStart, iTextEnd;
            for (iRange = 0; iRange < selection.rangeCount; iRange++) {
                range = selection.getRangeAt(iRange);
                // convert to target container world
                //these will store index of highlighted portion among total text data of page
                iTextStart = normalizeOffset(range.startContainer, range.startOffset);
                iTextEnd = normalizeOffset(range.endContainer, range.endOffset);
                if (iTextStart >= 0 && iTextStart < iTextEnd) {
                    removeSpans(iTextStart, iTextEnd);
                }
            }
            if (render) {
                selection.removeAllRanges();
                syncDOMAll(); //rehighlighting
            }
};


//it normalizes offests according to whole text of page
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


//adds new data to spans array
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



//adds new data to spans array
function removeSpans(start, end){
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
            iRight = n;
            while (iLeft < iRight) {
                i = iLeft + iRight >> 1;
                if (end <= spans[i].start) { iRight = i; }
                else if (start >= spans[i].end) { iLeft = i + 1; }
                else { iRight = i; }
            }
            // exclude spans which intersect
            var toremove_start,
            toremove_end;
            while (iRight < n) {
                span = spans[iRight];
                if (span.start > end) {
                    break;
                }
                toremove_start = Math.max(span.start, start);
                toremove_end = Math.min(span.end, end);
                // remove span within span
                if (toremove_start > span.start && toremove_end < span.end) {
                    spans.splice(iRight + 1, 0, { start: toremove_end, end: span.end });
                    span.end = toremove_start;
                    iRight += 2;
                    n++;
                }
                // remove span from start
                else if (toremove_start === span.start && toremove_end < span.end) {
                    span.start = toremove_end;
                    iRight++;
                }
                // remove span from end
                else if (toremove_start > span.start && toremove_end === span.end) {
                    span.end = toremove_start;
                    iRight++;
                }
                // remove span
                else {
                    spans.splice(iRight, 1);
                    n--;
                }
            }
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
    localStorage.setItem(pageURL, JSON.stringify(spans));
    //alert(localStorage.getItem(pageURL));
};


//it removes all added spans from page
function unrender(){
    var textmap = textMap,
            i = textmap.length - 1,
            entry, Node, Parent;
            // 1st pass, remove highlights
            while (i-- > 0) {
                entry = textmap[i];
                Node = entry.n.parentNode;
                if (Node && Node.className && Node.className === 'hi') {
                    Node.parentNode.replaceChild(entry.n, Node);
                }
            }
            // 2nd pass, remove highlight parents
            i = textmap.length - 1;
            while (i-- > 0) {
                entry = textmap[i];
                Parent = entry.n.parentNode;
                if (Node && Node.className && Parent.className === '-parent') {
                    while (Parent.hasChildNodes()) {
                        Parent.parentNode.insertBefore(Parent.firstChild, Parent);
                    }
                    Parent.parentNode.removeChild(Parent);
                }
            }
};


//it adds all spans to page
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
            ParentNode, Node, TextNode;

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
                ParentNode = document.createElement('span');
                ParentNode.className = '-parent';
                // slice of text before hilighted slice
                if (iNodeTextStart > 0) {
                    TextNode = document.createTextNode(entryText.substring(0, iNodeTextStart));
                    ParentNode.appendChild(TextNode);
                    textmap.splice(iEntry, 0, { i: entryStart, n: TextNode });
                    entryStart += TextNode.length;
                    iEntry++;
                }
                // highlighted slice
                Node = document.createElement('span');
                TextNode = document.createTextNode(entryText.substring(iNodeTextStart, iNodeTextEnd));
                Node.appendChild(TextNode);
                Node.className = 'hi';
                ParentNode.appendChild(Node);
                textmap.splice(iEntry, 0, { i: entryStart, n: TextNode });
                entryStart += TextNode.length;
                iEntry++;
                // slice of text after hilighted slice
                if (iNodeTextEnd < entryText.length) {
                    TextNode = document.createTextNode(entryText.substr(iNodeTextEnd));
                    ParentNode.appendChild(TextNode);
                    textmap.splice(iEntry, 0, { i: entryStart, n: TextNode });
                    entryStart += TextNode.length;
                    iEntry++;
                }
                // replace text node with our  parent node
                entry.n.parentNode.replaceChild(ParentNode, entry.n);
                // if the match doesn't intersect with the following
                // index-node pair, this means this match is completed
                if (iTextEnd <= textmap[iEntry].i) {
                    break;
                }
            }
};

