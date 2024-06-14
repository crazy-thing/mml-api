export const urlToDataUrl = (url, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };

    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

export const convertToDataUrls = (urls, callback) => {
    var dataUrls = [];
    var count = 0;
    urls.forEach(function(url, index) {
        urlToDataUrl(url, function(dataUrl) {
            dataUrls[index] = dataUrl;
            count++;
            if (count === urls.length) {
                callback(dataUrls);
            }
        });
    });
}