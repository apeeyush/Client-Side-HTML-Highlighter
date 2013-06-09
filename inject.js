var xpath;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.mssg == "giveXPath") {
            selc();
            sendResponse({ XPath: xpath });
        }
    });

function selc() {
    var selction  = window.getSelection();
    var text = selction.toString();
    if(text.length > 0){
        var range = selction.getRangeAt(0);
        xpath = makeXPath(range.startContainer);
    };
};

function makeXPath (node, currentPath) {
   //this should suffice in HTML documents for selectable nodes, XML with namespaces needs more code 
  currentPath = currentPath || '';
  switch (node.nodeType) {
    case 3:
    case 4:
      return makeXPath(node.parentNode, 'text()[' + (document.evaluate('preceding-sibling::text()', node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']');
    case 1:
      return makeXPath(node.parentNode, node.nodeName + '[' + (document.evaluate('preceding-sibling::' + node.nodeName, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']' + (currentPath ? '/' + currentPath : ''));
    case 9:
      return '/' + currentPath;
    default:
      return '';
  }
};
