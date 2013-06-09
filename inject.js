var bodyTag = document.getElementsByTagName("body")[0];
bodyTag.addEventLintener("onmouseup", selc, true);
function selc() {
    alert(window.getSelection);
};
