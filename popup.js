var tabURL,tabID;

$(document).ready(code);

function code() {
    $("img#highlight").click(function () {
        requestXPaths();
    });

    $("img#recall").click(function () {
        recall();
    })

    chrome.tabs.getSelected(null, function (tab) {
        tabURL = tab.url;
        tabID = tab.id;
    });

    function requestXPaths() {
        chrome.tabs.sendMessage(tabID, { mssg: "giveXPath" }, function (response) {
            alert(response.reply);
            //localStorage.setItem(tabURL, response.XPath);
        });
    };

    function recall(){
        alert(localStorage.getItem(tabURL));
    }
};

   
