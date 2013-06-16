var tabID;  //tabID is needed for sending tab 

$(document).ready(function() {
    //getting id of current tab
    chrome.tabs.getSelected(null, function (tab) {
        tabID = tab.id;
    });

    //messaging user's action to injected script
    $("#highlight").click(function () {
        sendMessg("highlight");
    });

    $("#unhighlight").click(function () {
        sendMessg("unhighlight");
    });

    $("#clear_all").click(function () {
        sendMessg("clear_all");
    });
});

 function sendMessg(message) {
        chrome.tabs.sendMessage(tabID, { mssg: message }, function (response) {
            
        });
    };  
