importScripts('Common/initShaders2.js');

onmessage = function(e) {
    postMessage(e.data.map(function(src) {
        return loadFileAJAX(src);
    }));
};
