var pageURL;
$(document).ready(function () {
    pageURL = window.location.href;
    highlight();
});

var returnXPaths = {
    startContainer:"",
    startOffset:"",
    endContainer:"",
    endOffset:""
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.mssg == "giveXPath") {
            updateReturnXPaths();
            sendResponse({ reply: JSON.stringify(returnXPaths) });
        }
    });

function updateReturnXPaths() {
    var selction  = window.getSelection();
    var text = selction.toString();
    if(text.length > 0){
        var range = selction.getRangeAt(0);
        returnXPaths.startContainer = makeXPath(range.startContainer);
        returnXPaths.startOffset = range.startOffset;
        returnXPaths.endContainer = makeXPath(range.endContainer);
        returnXPaths.endOffset = range.endOffset;
    }
    else returnXPaths = null;
};

function makeXPath (node, currentPath) {
   //this should suffice in HTML documents for selectable nodes, XML with namespaces needs more code 
  currentPath = currentPath || '';
  switch (node.nodeType) {
    case 3:
    case 4:
      return makeXPath(node.parentNode, null);
    case 1:
      return makeXPath(node.parentNode, node.nodeName + '[' + (document.evaluate('preceding-sibling::' + node.nodeName, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']' + (currentPath ? '/' + currentPath : ''));
    case 9:
      return '/' + currentPath;
    default:
      return '';
  }
};

function highlight(){
    var dataObj = JSON.parse(localStorage.getItem(pageURL));
    for(key in dataObj){
        if(typeof(dataObj[key] != typeof(1))){
            upadateHTML(dataObj[key]);
        };
    };
};

function updateHTML(sel){
    $("body").html(function (i, oldCode) {
        return makeNewHTML(oldCode, sel);
    });
};

function makeNewHTML(oldCode, sel){
    var oldCodeCopy = oldCode;
    var newCode = "", piece1 = "", piece2 = "", piece3 = "";
    makePiece(oldCode, sel.startContainer, sel.startOffset, piece1, piece2);
    makePiece(oldCodeCopy, sel.endContainer, sel.endOffset, piece2, piece3);

};

function makePiece(oldCode, startContainer, startOffset, piece1, piece2){
    piece1 = "";
    var i, j, k;
    startContainer = startContainer.substring(16);
    while(startContainer.lenght > 0){
        i = startContainer.indexOf("[");
        j = startContainer.indexOf("]");
        k = parseInt(startContainer.substring(i + 1, j));
        while(k>0){
            var tag = (startContainer.substring(1, i)).toLowerCase();
            var l = "<" + tag;
            piece1 = piece1 + oldCode.substring(0, oldCode.search(/l/i)); // problem 
            oldCode = oldCode.substring(oldCode.search("<" + tag));
            piece1 = piece1 + oldCode.substring(0, oldCode.search(">") + 1);
            oldCode = oldCode.substring(oldCode.search(">") + 1);
            k = k - 1;
        };
        startContainer = startContainer.substring(0, j + 1);
    };
    piece1 = piece1 + oldCode.substring(0, startOffset);
    oldCode = oldCode.substring(startOffset);
    piece2 = oldCode;
};
