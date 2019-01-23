/*****
 公用 分割线
 *****/

/*设备判断*/
var Emt = (function () {
    var env = {},
        navigator = window.navigator,
        userAgent = navigator.userAgent,
        ios = userAgent.match(/(iPad|iPhone|iPod)[^;]*;.+OS\s([\d_\.]+)/),
        android = userAgent.match(/(Android)\s([\d\.]+)/);

    env.isIDevice = (/iphone|ipad|ipod/i).test(navigator.appVersion);
    env.isIpad = userAgent.match(/iPad/i);
    env.isIphone = userAgent.match(/iPhone/i);
    env.isAndroid = (/android/i).test(navigator.appVersion);
    env.isWebkit = /WebKit\/[\d.]+/i.test(userAgent);
    env.isSafari = ios ? (navigator.standalone ? env.isWebkit : (/Safari/i.test(userAgent) && !/CriOS/i.test(userAgent) && !/MQQBrowser/i.test(userAgent))) : false;
    env.isYoupai = (/4399YouPai/i).test(userAgent);
    env.isYouxihe = (/4399gamecenter/i).test(userAgent);

    if (ios) {
        env.device = ios[1];
        env.version = ios[2].replace(/_/g, '.');
    } else if (android) {
        env.version = android[2];
    }

    env.isMobile = env.isAndroid || env.isIDevice;
    env.standalone = navigator.standalone;
    env.wechat = navigator.userAgent.indexOf("MicroMessenger") >= 0;
    env.gameStoreHD = navigator.userAgent.indexOf('GameStoreHD') >= 0;

    return env;
})();
/* toast tip */
var _timer = null;
function showToast(msg) {
    clearTimeout(_timer);
    $("#j-tip-toast").show().html(msg);
    _timer = setTimeout(function () {
            $("#j-tip-toast").hide();
        },
        2000);
}
/*判断是否函数*/
function fncallback(cbname) {
    if ({}.toString.call(cbname) == '[object Function]') {
        cbname();
        cbname = null;
    }
}
/* 获取指定cookie值*/
function getCookieValue(name) {
    var cookieArr = document.cookie.split("; "),
        cookieValue,
        i,
        temArr;

    for (i = 0; i < cookieArr.length; i++) {
        temArr = cookieArr[i].split("=");
        if (name == temArr[0]) {
            cookieValue = temArr[1];
            break;
        }
    }

    return cookieValue;
}
/*清除cookie值*/
function DelCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() + (-1 * 24 * 60 * 60 * 1000));
    var cval = getCookieValue(name);
    document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
}

/*****
 游拍 分割线
 *****/
/*初始化*/
var _YPconfig = {
    is_delcookie: true,
    yp_islogin: false
};

/* 获取登录信息*/
var _loginCallback = null;
function setLoginInfo(token, authCode) {
    document.cookie = "loginToken=" + token;
    document.cookie = "loginAuthCode=" + authCode;

    fncallback(_loginCallback);

    if (!token) {
        DelCookie("loginToken");
        DelCookie("loginAuthCode");
        return;
    }
    _YPconfig.is_delcookie = false;
}

/* 获取版本*/
var _getVertionCallback = null;
function setVersion(version) {
    document.cookie = "version=" + version;
    fncallback(_getVertionCallback);
    /*  if (!version) {
     DelCookie("version");
     return;
     }*/
    /*    is_delcookie = false;*/
}
/*ua 获取版本号*/
var ckYpVernum;
if (Emt.isYoupai) {
    var _reg = /(4399YouPai\/)(\d+\.\d+\.\d+(\.\d+)?)/g,
        _ua = window.navigator.userAgent,
        ver_num = _ua.match(_reg, "");
    ver_num = JSON.stringify(ver_num).match(/(\d+\.\d+\.\d+(\.\d+)?)/g, "");
    ckYpVernum = ver_num[0];

}

/*获取设备号*/
var _deviceIDCallback = null;
function setDeviceID(deviceID) {
    document.cookie = "deviceID=" + deviceID;
    fncallback(_deviceIDCallback);
}

/*分享回调*/
var _shareStatCallback = null;
function setShareResult(sharestat) {
    /* 0 失败  1 成功 */
    fncallback(_shareStatCallback(sharestat));
}

/*版本过低 或非游拍环境 评论点击提示*/
function upgraded() {
    if (Emt.isYoupai) {
        if (Emt.isIDevice && ckYpVernum < "1.6.0") {
            showToast("版本过低，无法参与评论，速去升级哦~");
            return;
        }

        if (Emt.isAndroid && ckYpVernum < "1.5.0") {
            setTimeout(function () {
                    document.location.href = "protocol://toCheckver";
                },
                800);
        }

    } else {
        showToast("非游拍环境或版本过低，无法参与评论");
    }
}

/*调用清除cookie*/
if (_YPconfig.is_delcookie) {
    DelCookie("loginToken");
    DelCookie("loginAuthCode");
    DelCookie("version");
}

/*****
 游戏盒 分割线
 *****/
/* 游戏盒登录 */
var scookie, yxh_islogin = 0;
var yp_stat, downloadAPI = window.downloadAPI || window.android;

if (Emt.isYouxihe) {
    if (Emt.isAndroid) {
        /*登录安卓*/
        scookie = window.login.onLoadCookieForJs();
        if (scookie) {
            yxh_islogin = 1;
        }
    } else if (Emt.isIDevice) {
        /*  showToast("ios登录接口");*/
    }
}


/*****
 业务事件整理 分割线
 *****/

;(function () {
    window.ueApp = window.ueApp || {};
    ueApp.appevent = function (opt) {
        var defaults = {
            /*下载事件*/
            down_btn: "", /*  下载按钮  可配置多个事件按钮; 也可直接跟 yxh_txtbtn 配置一样(那在游戏盒下，文本变化根据配置)*/
            /**  下载按钮可多个 .j-down_btn,.j-down_btn1....
             也可直接跟 yxh_txtbtn 配置一样(那在游戏盒下，文本变化根据配置) .j-down_btn,.j-down_btn1,.j-yxh_downtxt
             **/

            /* 配置下载对应url项 */
            androidUrl: '', /* 安卓下载 */
            wechatUrl: '', /* 微信 应用宝 */
            iosUrl: '', /* 苹果下载 */
            otherUrl: '', /* wap 其他环境下 */
            pcUrl: '', /* pc 环境 */
            youxiheDown: '',
            /*  默认配置跟游戏盒下载接口配合的包形式，下载游拍对应包 ：
             {
             'downloadUrl': 'http://sj.img4399.com/game_list/269/com.turborocketgames.wildlion/turborocketgames.wildlion.v33846.apk',
             'packageName': 'com.m4399.youpai',
             'appName': '4399游拍(游戏视频)',
             'iconPath': '4399a_44168_logo_54915137112e5.jpg',
             'fileMD5': 'a6b6ff10c8878e69cbeb880572e6265d'
             }
             ；也可根据需求，直接配置单纯的url，比如 ：youxiheDown :"http://sj2.img4399.com/downloader/youpai/1.7.0/4399YouPai_1.7.0.wap.apk",
             */

            yxh_txtbtn: "", /* 配置 游戏盒 下载包状态对应的文本变化 */
            /*  备注：几种状态在js里面已经配置默认好对应的相关文案，一般不改 ；当然也可再次配置 */
            txt_stat: "下载游拍", /* 0 */
            txt_success: "安装游拍", /* 103 200 */
            txt_open: "打开游拍", /* 201 */
            txt_update: "更新游拍", /* 202 */
            txt_other: "下载中", /* 其他状态 */

            /* 不配置url 调用自定义方法 */
            androidDownFun: function () {
            }, /* 安卓 自定义 */
            wechatDownFun: function () {
            }, /* 微信 自定义 */
            iosDownFun: function () {
            }, /* ios 自定义 */
            otherUrlDownFun: function () {
            }, /* wap 其他环境 自定义 */
            pcDownFun: function () {
            }, /* pc 自定义 */
            yxhDownFun: function () {
            }, /* 游戏盒 自定义 */

            /* 判断版本号 ios 安卓 默认不填即可不判断 */
            ver_ios: '',
            ver_android: '',
            /* 低于版本号 调用提示 */
            ckVerDiagFun: function (act_btn, act_id) {
            },

            /* 活动事件 */
            active_btn: "", /*事件的按钮格式命名 j-** j-**_**  但不能双- 及 j-**-**  形式 */
            ActiveFun: function (status, btnAct, actbtnid) {
                /* 状态 1 参加活动 0 第三方不参加活动 ，事件对应样式名class，事件对应的id */
            },
            isyxAct: false, /* 游戏盒参加活动  true 参加  false 不参加*/

            /*登录状态*/
            yp_loginurl: '', /*游拍登录接口*/
            loginedEvent: function () {/*已登录状态*/
            },
            unloginEvent: function () {/*未登录状态*/
            },

            /* 回调 设备号 */
            ckdeviceIdFun: function (eviceid) {
            }
        };

        var opt = $.extend({}, defaults, opt),
            btn_act,
            actbtn = opt.active_btn,
            act_bnum = actbtn.split(',');


        /*环境判断*/
        if (Emt.isYoupai) {
            /* 检查版本号 */
            window.checkVersion = function (actbtn, actid, callback) {
                document.location.href = "protocol://getVersion";

                _getVertionCallback = function () {
                    if (ckYpVernum) {
                        /*版本过低 getCookieValue('version')*/
                        if (Emt.isIDevice) {
                            if (opt.ver_ios && ckYpVernum < opt.ver_ios) {
                                opt.ckVerDiagFun(actbtn, actid);
                            } else {
                                if (typeof callback == "function") {
                                    callback();
                                }
                            }
                        } else if (Emt.isAndroid) {
                            if (opt.ver_android && ckYpVernum < opt.ver_android) {
                                opt.ckVerDiagFun(actbtn, actid);
                            } else {
                                if (typeof callback == "function") {
                                    callback();
                                }
                            }
                        }
                    } else {
                        /*无法获取版本号*/
                        showToast('无法获取游拍版本号');
                    }
                };
            };

            /*检查设备*/
            window.checkDvice = function () {
                document.location.href = "protocol://getDeviceID";
                _deviceIDCallback = function () {
                    if (getCookieValue('deviceID')) {
                        opt.ckdeviceIdFun(getCookieValue('deviceID'));
                    } else {
                        showToast("无法获取到设备号");
                    }
                };
            };

            /*设备判断*/
            window.onload = function () {
                checkDvice();
            };

            window.yp_loginCk = function (yp_loginurl) {
                $.ajax({
                    type: 'GET',
                    cache: false,
                    dataType: 'json',
                    url: yp_loginurl,
                    success: function (data) {
                        if (data.code == 100) {
                            _YPconfig.yp_islogin = true;
                            opt.loginedEvent(1, data.result);
                        } else {
                            _YPconfig.yp_islogin = false;
                            opt.unloginEvent(1, data.result);
                        }
                    },
                    error: function () {
                        showToast('当前网络状况不佳，请耐心等待哦~');
                    }
                });
            };

            /* 登录 逻辑 */
            document.location.href = "protocol://setLoginInfo";
            _loginCallback = function () {
                if (opt.yp_loginurl && typeof yp_loginCk == "function") {
                    yp_loginCk(opt.yp_loginurl);
                }
            };


        } else if (Emt.isYouxihe) {
            /* 游戏盒弹窗下载按钮 自定义 */
            window.ypappLoad = function (loadtxt) {
                if (_YPconfig.loadTxt && loadtxt) {
                    _YPconfig.loadTxt = loadtxt;
                }
            };
            /*游戏盒下载接口*/
            window.pkgstatusInfo = function (pkgStat) {
                switch (parseInt(pkgStat)) {
                    case 0:
                        $(opt.yxh_txtbtn).html(opt.txt_stat);
                        ypappLoad(opt.txt_stat);
                        break;
                    case 103:
                    case 200:
                        $(opt.yxh_txtbtn).html(opt.txt_success);
                        ypappLoad(opt.txt_success);
                        break;
                    case 201:
                        $(opt.yxh_txtbtn).html(opt.txt_open);
                        ypappLoad(opt.txt_open);
                        break;
                    case 202:
                        $(opt.yxh_txtbtn).html(opt.txt_update);
                        ypappLoad(opt.txt_update);
                        break;
                    default:
                        $(opt.yxh_txtbtn).html(opt.txt_other);
                        ypappLoad(opt.txt_other);
                        break;
                }
            };
            window.updateApps = function (e) {
                var status = e[0].status;
                yp_stat = status;
                pkgstatusInfo(yp_stat);
            };
            window.dlCallback = function (e) {
                if (e.packageName == opt.youxiheDown.packageName) {
                    yp_stat = e.status;
                    pkgstatusInfo(yp_stat);
                }
            };
            window.download = function () {
                downloadAPI.downloadApp(JSON.stringify(opt.youxiheDown));
            };
            window.down_load = function () {
                switch (parseInt(yp_stat)) {
                    case 103:
                    case 200:
                        $(opt.yxh_txtbtn).html(opt.txt_success);
                        ypappLoad(opt.txt_success);
                        downloadAPI.installApp(opt.youxiheDown.packageName);
                        break;
                    case 201:
                        $(opt.yxh_txtbtn).html(opt.txt_open);
                        ypappLoad(opt.txt_open);
                        downloadAPI.launchApp(opt.youxiheDown.packageName);
                        break;
                    case 202:
                        $(opt.yxh_txtbtn).html(opt.txt_update);
                        ypappLoad(opt.txt_update);
                        download();
                        break;
                    default:
                        $(opt.yxh_txtbtn).html(opt.txt_stat);
                        ypappLoad(opt.txt_stat);
                        download();
                        break;
                }
            };

            /*登录*/
            if (yxh_islogin == 1) {
                var yxh_loginfo = JSON.parse(window.login.onLoadUserInfo());
                opt.loginedEvent(2, yxh_loginfo);
            } else {
                opt.unloginEvent(2);
            }

        }

        /*下载逻辑*/
        if (opt.down_btn) {

            if (Emt.isAndroid || Emt.isIDevice) {

                if (Emt.isAndroid) {

                    if (Emt.isYouxihe) {
                        if (opt.youxiheDown) {
                            /*  youxiheDown 若有配置  */
                            if (typeof opt.youxiheDown == "object") {

                                downloadAPI.bindEvent('download', 'dlCallback');
                                downloadAPI.getAppStatus(opt.youxiheDown.packageName, "updateApps");

                                $("body").delegate(opt.down_btn, "tap click", function () {
                                    down_load();
                                });
                            } else {
                                $("body").delegate(opt.down_btn, "tap click", function () {
                                    document.location.href = opt.youxiheDown;
                                });
                            }
                        } else {
                            /* youxiheDown  方法自定义 */
                            $("body").delegate(opt.down_btn, "tap click", function () {
                                opt.yxhDownFun();
                            });
                        }

                    } else if (Emt.wechat) {
                        /*console.log("微信环境");*/
                        if (opt.wechatUrl) {
                            /* 跳链接 一般为应用宝地址 */
                            $("body").delegate(opt.down_btn, "tap click", function () {
                                document.location.href = opt.wechatUrl;
                            });
                        } else {
                            /*无链接跳转 弹窗引导*/
                            $("body").delegate(opt.down_btn, "tap click", function () {
                                opt.wechatDownFun();
                            });
                        }

                    } else {
                        /*console.log("安卓游拍 环境"); */
                        if (opt.androidUrl) {
                            $("body").delegate(opt.down_btn, "tap click", function () {
                                document.location.href = opt.androidUrl;
                            });
                        } else {
                            $("body").delegate(opt.down_btn, "tap click", function () {
                                opt.androidDownFun();
                            });
                        }
                    }

                } else if (Emt.isIDevice) {
                    if (Emt.isYouxihe) {
                        if (opt.youxiheDown) {
                            /*  youxiheDown 若有配置  */
                            if (typeof opt.youxiheDown == "object") {
                                alert("youxiheDown若有配置");
                            } else {
                                $("body").delegate(opt.down_btn, "tap click", function () {
                                    document.location.href = opt.youxiheDown;
                                });
                            }
                        } else {
                            /* youxiheDown  方法自定义 */
                            $("body").delegate(opt.down_btn, "tap click", function () {
                                opt.yxhDownFun();
                            });
                        }
                    } else {
                        if (opt.iosUrl) {
                            /* ios 有下载地址 */
                            $("body").delegate(opt.down_btn, "tap click", function () {
                                document.location.href = opt.iosUrl;
                            });
                        } else {
                            /* 不维护 ios 下载 其他行为*/
                            $("body").delegate(opt.down_btn, "tap click", function () {
                                opt.iosDownFun();
                            });
                        }
                    }
                } else {
                    /*console.log("手机里的其他环境");*/
                    if (opt.otherUrl) {
                        $("body").delegate(opt.down_btn, "tap click", function () {
                            document.location.href = opt.otherUrl;
                        });
                    } else {
                        $("body").delegate(opt.down_btn, "tap click", function () {
                            opt.otherUrlDownFun();
                        });
                    }
                }
            } else {
                /*console.log("非手机 pc环境");*/
                if (opt.pcUrl) {
                    $("body").delegate(opt.down_btn, "tap click", function () {
                        document.location.href = opt.pcUrl;
                    });
                } else {
                    $("body").delegate(opt.down_btn, "tap click", function () {
                        opt.pcDownFun();
                    });
                }
            }
        }

        /*业务事件*/
        if (opt.active_btn) {
            for (var i = 0; i < act_bnum.length; i++) {
                btn_act = act_bnum[i];
                if (btn_act) {
                    $("body").delegate(btn_act, "tap click", function () {
                        var _this = $(this),
                            act = _this.attr("class"),
                            btnact = act.match(/(^|\s+)(j-\w+)($|\s+)/)[2],
                            thid = _this.attr("id"),
                            stat_ver = _this.attr("stat-ver") ? _this.attr("stat-ver") : 1,
                            stat_login = _this.attr("stat-login") ? _this.attr("stat-login") : 1;
                        if (Emt.isYoupai) {/*alert("isYoupai参加活动");*/
                            if (!_YPconfig.yp_islogin && parseInt(stat_login) == 1) {
                                document.location.href = "protocol://toLogin";
                                return false;
                            }

                            if (Emt.isIDevice) {
                                if (opt.ver_ios && parseInt(stat_ver) == 1) {/* alert("验证版本号");*/

                                    checkVersion(btnact, thid, function () {
                                        opt.ActiveFun(1, btnact, thid);
                                    });

                                } else { /* alert("不判断版本号");*/
                                    opt.ActiveFun(1, btnact, thid);
                                }
                            } else if (Emt.isAndroid) {

                                if (opt.ver_android && parseInt(stat_ver) == 1) {
                                    checkVersion(btnact, thid, function () {
                                        opt.ActiveFun(1, btnact, thid);
                                    });

                                } else { /* alert("不判断版本号");*/
                                    opt.ActiveFun(1, btnact, thid);
                                }
                            }

                        } else if (Emt.isYouxihe && opt.isyxAct) {
                            /*alert("isYouxihe参加活动");*/

                            if (yxh_islogin == 0 && parseInt(stat_login) == 1) {
                                /*未登录*/
                                window.login.onJSIvoke();
                            } else {
                                /*已登录*/
                                opt.ActiveFun(2, btnact, thid);
                            }

                        } else {
                            /*非游拍 或 游戏盒 不参加活动*/
                            opt.ActiveFun(0, btnact, thid);
                        }

                    });
                }
            }
        }

    };

})();



