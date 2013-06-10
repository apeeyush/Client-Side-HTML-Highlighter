var tabURL,tabID;

$(document).ready(code);

function code() {
    $("img#highlight").click(function () {
        requestXPaths();
    });

    chrome.tabs.getSelected(null, function (tab) {
        tabURL = tab.url;
        tabID = tab.id;
    });

    function requestXPaths() {
        chrome.tabs.sendMessage(tabID, { mssg: "giveXPath" }, function (response) {
            //alert(response.reply);
            //localStorage.removeItem(tabURL);
            if(response.reply != "null")addToStorage(response.reply);
            //localStorage.setItem(tabURL, response.XPath);
        });
    };

    function addToStorage(reply){
        var oldDataString = localStorage.getItem(tabURL);
        if(oldDataString == null){
            oldDataString = '{"count":0}';
            localStorage.setItem(tabURL, oldDataString);
        };
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
        newDataString += "," + "\"sel" + newDataCount + "\":" + reply + "}";
        alert(newDataString);
        localStorage.setItem(tabURL, newDataString);

    };
};

   
