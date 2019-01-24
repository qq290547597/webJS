<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Cache-Control" content="no-siteapp">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=1, minimum-scale=1.0, maximum-scale=1.0">
    <meta name="format-detection" content="telephone=no,email=no,address=no">
    <title>测试接口调用的问题</title>
<link rel="stylesheet" type="text/css" href="activeDev.min.css">

<script type="text/javascript" src="116zepto.js"></script>

    <script>
        /*重置*/
        !function (a) {
            function b() {
                /*   // 设计稿640- width / 16  ; 720 - width / 18 ;*/
                a.rem = f.getBoundingClientRect().width / 16, f.style.fontSize = a.rem + "px";
                var j = parseFloat(a.getComputedStyle(f, null).fontSize);
                if (a.rem != j) {
                    a.rem = a.rem * a.rem / j;
                    f.style.fontSize = a.rem + "px"
                }
            }

            var c, d = a.navigator.appVersion.match(/iphone/gi) ? a.devicePixelRatio : 1,
                e = 1,
                f = document.documentElement,
                g = document.createElement("meta");
            if (a.dpr = d, a.addEventListener("resize", function () {
                clearTimeout(c), c = setTimeout(b, 300)
            }, !1), a.addEventListener("pageshow", function (a) {
                a.persisted && (clearTimeout(c), c = setTimeout(b, 300))
            }, !1), f.setAttribute("data-dpr", d), g.setAttribute("name", "viewport"), g.setAttribute("content", "initial-scale=" + e + ", maximum-scale=" + e + ", minimum-scale=" + e + ", user-scalable=no"), f.firstElementChild) f.firstElementChild.appendChild(g);
            else {
                var h = document.createElement("div");
                h.appendChild(g), document.write(h.innerHTML)
            }
            b()
        }(window);
        /**
         * @ Uese:浏览器嗅探
         * @ Date:2016-01-21
         * */

        var Emt = (function () {
            var env = {},
                navigator = window.navigator,
                userAgent = navigator.userAgent,
                ios = userAgent.match(/(iPad|iPhone|iPod)[^;]*;.+OS\s([\d_\.]+)/),
                android = userAgent.match(/(Android)\s([\d\.]+)/);

            env.isWebkit = /WebKit\/[\d.]+/i.test(userAgent);
            env.isSafari = ios ? (navigator.standalone ? env.isWebkit : (/Safari/i.test(userAgent) && !/CriOS/i.test(userAgent) && !/MQQBrowser/i.test(userAgent))) : false;
            env.isYoupai = (/4399YouPai/i).test(userAgent);
            env.isYouxihe = (/4399gamecenter/i).test(userAgent);

            if (ios) {
                env.device = ios[1];
                env.version = ios[2].replace(/_/g, '.');
                env.isIDevice = (/iphone|ipad|ipod/i).test(navigator.appVersion);
                env.isIpad = userAgent.match(/iPad/i);
                env.isIphone = userAgent.match(/iPhone/i);
            } else if (android) {
                env.version = android[2];
                env.isAndroid = (/android/i).test(navigator.appVersion);
            }

            env.isMobile = env.isAndroid || env.isIDevice;
            env.standalone = navigator.standalone;
            env.wechat = navigator.userAgent.indexOf("MicroMessenger") >= 0;

            return env;
        })();
    </script>
    <!--这边的样式 style 根据实际情况替换-->

    <style>
        h3 {
            margin-top: 20px !important;
        }
    </style>
    <script>
        /* * 前端调用客户端 ios
        handlerMethod 协议接口方法名
        parameters  前端传参
        * */
        window.callMobile = function (handlerMethod, parameters) {
            var dic = {'handlerInterface': 'Native', 'function': handlerMethod, 'parameters': parameters};

            alert('123');
            if (Emt.isIDevice) {
                window.webkit.messageHandlers.Native.postMessage(dic);
            }

        };
    </script>
</head>
<body>
<h3 class="j-btn_0">点击测试协议接口：onJsToast</h3>
<h3 class="j-btn_1">点击测试协议接口：getNetState</h3>
<!--<h3 class="j-btn">点击产生新文案</h3>-->


<script>
    /*define*/
    window.comAPI = window.ClientAPI || {
        onJsToast: function (msg) {
            alert('isIDevice:'+Emt.isIDevice+'\nisYoupai:'+Emt.isYoupai+'\nisIphone:'+Emt.isIphone+'\nisMobile:'+Emt.isMobile);
            if (Emt.isIDevice) {
                callMobile('onJsToast', {'msg': msg});
            }
        },
        getNetState : function (msg) {
            var _tip='<div style="background-color: #fefefe;">回常数'+msg+'</div>';
            $(".j-btn_1").append(_tip);
            if (Emt.isIDevice) {
                callMobile('getNetState');
            }
        },
        toDialog: function () {
            if (Emt.isIDevice) {
                callMobile('onJsToast', {'msg': msg});
            }
        }
    };

    /*调用*/
    $(".j-btn_0").bind("click", function () {
        comAPI.onJsToast('弹出totast提示哦测试js协议接口');
//                       var dic = {'handlerInterface': 'Native', 'function': "onJsToast", 'parameters': "parameters"};
//                       window.webkit.messageHandlers.Native.postMessage(dic);
    });

    $(".j-btn_1").bind("click", function () {
        comAPI.getNetState();
    });

    $(".j-btn_2").bind('click',function () {
       comAPI.toDialog();
    });


 /*   $(".j-btn").bind("click", function () {
        var _tip='<div style="background-color: gray;color:green;">前端新增文案文本！！！</div>';
        $(".j-btn").append(_tip);
    });
*/
</script>
</body>
</html>
