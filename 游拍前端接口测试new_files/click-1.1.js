(function () {
    var url = 'http://tj.img4399.com:8014/mark.jpg';
    if (_stats4399_.mark.debug) {
        alert('DEBUG MODE');
        url = 'http://stat.5054399.net:8080/click/api/debug';
    }
    var project = _stats4399_.mark.project || false;
    var event = _stats4399_.mark.event || 'mousedown';
    var markKey = _stats4399_.mark.key || 'mark';

    var send = function (data) {
        var query = [];
        for (k in data) {
            query.push(k + '=' + encodeURIComponent(data[k]));
        }
        try {
            var img = new Image();
            var rand = '_stats4399_' + Math.floor(2147483648 * Math.random()).toString(36);
            window[rand] = img;
            img.onload = img.onerror = img.onabort = function () {
                img.onload = img.onerror = img.onabort = null;
                img = window[rand] = null;
            };
            img.src = url + '?' + query.join('&');
        } catch (e) {
        }
    };

    var stats = function (e) {
        var data, mark = [];
        e = e || window.event;
        var src = e.srcElement || e.target;
        data = {
            page: window.location.href,
            tag: src.tagName,
            project: project,
            time: new Date().getTime()
        };
        while (true) {
            if ((src.tagName == 'BODY') || !(attr = src.attributes)) {
                break;
            }
            if (attr[markKey]) {
                mark.push(attr[markKey].value);
            }
            if (attr['href']) {
                data.link = attr['href'].value;
            }
            try {
                src = src.parentNode;
            } catch (e) {
                break;
            }
        }
        if (mark.length > 0) {
            data.mark = mark.join('|');
            send(data);
        }
    };

    var addEvt = function (event, funcName) {
        if (document.addEventListener) {
            document.addEventListener(event, funcName);
        } else {
            document.attachEvent('on' + event, funcName);
        }
    };

    if (project) {
        addEvt(event, stats);
    }
})();
