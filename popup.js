var tabURL,tabID;

$(document).ready(code);

function code() {
    $("button#highlight").click(function () {
        requestStoring("highlight");
    });

    $("button#clear").click(function () {
        requestStoring("clear");
    });

    chrome.tabs.getSelected(null, function (tab) {
        tabURL = tab.url;
        if (tabURL.indexOf("#") != -1) {
            tabURL = tabURL.substring(0, tabURL.indexOf("#"));
        }
        tabID = tab.id;
    });

    function requestStoring(message) {
        chrome.tabs.sendMessage(tabID, { mssg: message }, function (response) {
            
        });
    };
};

   
