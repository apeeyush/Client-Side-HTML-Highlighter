var tabURL,tabID;

$(document).ready(code);

function code() {
    $("img").click(function () {
        sendMssg();
    });

    chrome.tabs.getSelected(null, function (tab) {
        tabURL = tab.url;
        tabID = tab.id;
    });

    function sendMssg() {
        chrome.tabs.sendMessage(tabID, { mssg: "giveXPath" }, function (response) {
            alert(response.XPath);
        });
    };
};

   
