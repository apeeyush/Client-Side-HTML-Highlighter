var pageURL;

//loads previous highlights
$(document).ready(function () {
    pageURL = window.location.href;
    if (pageURL.indexOf("#") != -1) {
        pageURL = pageURL.substring(0, pageURL.indexOf("#"));
    };
    highlight();
});

var XPaths = {
    startContainer:"",
    startOffset:"",
    endContainer:"",
    endOffset:""
};

//recieves command to add slected portion
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.mssg == "highlight") {
            newXPaths();
            addToStorage(JSON.stringify(XPaths));
        }
        if (request.mssg == "clear") {
            localStorage.removeItem(pageURL);

        }
    });

//puts values of xpaths in object XPaths
function newXPaths() {
    var selction  = window.getSelection();
    var text = selction.toString();
    if(text.length > 0){
        var range = selction.getRangeAt(0);
        XPaths.startContainer = makeXPath(range.startContainer);
        XPaths.startOffset = range.startOffset;
        XPaths.endContainer = makeXPath(range.endContainer);
        XPaths.endOffset = range.endOffset;
    }
    else XPaths = null;
};

//adds new highlights to local storage
function addToStorage(XPathString){
        var oldDataString = localStorage.getItem(pageURL);
        //if not data was present
        if(oldDataString == null){
            oldDataString = '{"count":0}';
            localStorage.setItem(pageURL, oldDataString);
        };
        //adding old xpaths to newDatStrings
        var oldDataObj = JSON.parse(oldDataString);
        var newDataString = "";
        var newDataCount = oldDataObj.count + 1;
        newDataString += '{"count":' + newDataCount;
        var i  = 1;
        for(key in oldDataObj){
            if(typeof(oldDataObj[key]) != typeof(1)){
                newDataString += "," + "\"sel" + i + "\":" + JSON.stringify(oldDataObj[key]);
                i += 1;
            }
        };
        //adding new xpaths as newDatStrings
        newDataString += "," + "\"sel" + newDataCount + "\":" + XPathString + "}";
        //storing and highlighting
        localStorage.setItem(pageURL, newDataString);
        highlight();
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

//highlights based on local data, for this it makes new HTML for body of page
function highlight(){
    var dataObj = JSON.parse(localStorage.getItem(pageURL));
    for(key in dataObj){
        if(key != "count"){
            updateHTML(dataObj[key]);
        };
    };
};

//update new HTML with higlights
function updateHTML(sel){
    $("body").html(function (i, oldCode) {
        return makeNewHTML(oldCode, sel);
    });
};

//it make new HTML
//1. it breaks body's html code into 3 pieces
//2. 2nd piece stores slected portions code,
//3. 1st and 3rd stores previous and rest of code
//4. then rewrite 2nd piece, adds <mark> next to each tag and </mark> before each tag
function makeNewHTML(oldCode, sel){
    //makings pieces
    var piece1 = "", piece2 = "", piece3 = "";
    piece1 = makePiece(oldCode, sel.startContainer, sel.startOffset, piece1, piece2);
    piece2 = makePiece(oldCode, sel.endContainer, sel.endOffset, piece2, piece3);
    piece3 = oldCode.substring(piece2.length);
    piece2 = piece2.substring(piece1.length);
    //pieces made

    //writing new 2nd piece
    var newPiece2 = "";
    newPiece2 += "<mark>";
    while(piece2.length > 0){
        if(piece2.indexOf("<") != -1){
            var ch = piece2.charAt(piece2.indexOf("<")+1);
            if((ch!=' ')&&(ch!='   ')&&(ch!='\n')){
                newPiece2 += piece2.substring(0, piece2.indexOf("<")) + "</mark>" + piece2.substring(piece2.indexOf("<"),piece2.indexOf(">")+1) + "<mark>";
                piece2 = piece2.substring(piece2.indexOf(">") + 1);
            }
            else{
                newPiece2 += piece2.substring(0, piece2.indexOf("<") + 1);
                piece2 =  piece2.substring(piece2.indexOf("<") + 1);
            }
        }
        else{
            break;
        }  
    };
    newPiece2 += piece2 + "</mark>";
    return (piece1 + newPiece2 + piece3);
};

//it returns code upto offset
function makePiece(oldCode, startContainer, startOffset, piece1, piece2){
    piece1 = "";
    var i, j, k;
    startContainer = startContainer.substring(16);
    while(startContainer.length > 0){
        i = startContainer.indexOf("[");
        j = startContainer.indexOf("]");
        k = parseInt(startContainer.substring(i + 1, j));
        while(k>0){
            var tag = (startContainer.substring(1, i)).toLowerCase();
            piece1 = piece1 + oldCode.substring(0, (oldCode.toLowerCase()).search("<"+tag)); 
            oldCode = oldCode.substring((oldCode.toLowerCase()).search("<"+tag));
            piece1 = piece1 + oldCode.substring(0, oldCode.search(">") + 1);
            oldCode = oldCode.substring(oldCode.search(">") + 1);
            k = k - 1;
        };
        startContainer = startContainer.substring(j + 1);
    };
    piece1 = piece1 + oldCode.substring(0, startOffset)
    oldCode = oldCode.substring(startOffset);
    piece2 = oldCode;
    return piece1;
};
