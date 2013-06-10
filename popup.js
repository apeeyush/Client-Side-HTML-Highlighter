var tabURL,tabID;

$(document).ready(code);

function code() {
    $("img#highlight").click(function () {
        sendMssg();
    });

    $("img#recall").click(function () {
        recall();
    })

    chrome.tabs.getSelected(null, function (tab) {
        tabURL = tab.url;
        tabID = tab.id;
    });

    function sendMssg() {
        chrome.tabs.sendMessage(tabID, { mssg: "giveXPath" }, function (response) {
            alert(response.XPath);
            localStorage.setItem(tabURL, response.XPath);
        });
    };

    function recall(){
        alert(localStorage.getItem(tabURL));
    }
};

   
