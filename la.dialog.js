/*弹窗 是否滚动*/
var pstatscrol = true;
window.pageStatic = function (item) {
    if (item) {
        pstatscrol = false;
        $("body").css("overflow", "hidden");
    } else {
        pstatscrol = true;
        $("body").css("overflow", "auto");
    }
};
document.addEventListener("touchmove",
    function (e) {
        if (!pstatscrol) {
            e.preventDefault();
            e.stopPropagation();
        }
    },
    false);

;(function () {
    function dialog(options) {
        var defaults = {
            id: "",
            theme: "",
            transition: "ctl-popup",
            content: "",
            istatic: true, /*弹窗出现 默认true 页面不能滚动   false 可以滚动  */
            isdiaClose: true, /*默认true 点击弹窗其他地方直接关闭  flase 不能*/
            btnDClose: "j-btn_dclose", /*阻止tap冒泡 上面的配套*/
            afterRender: function () {
            },
            afterClose: function () {
            }
        };

        this.options = $.extend(defaults, options);
        this.init();
    }

    dialog.prototype = {
        init: function () {
            var _this = this,
                options = this.options,
                $dialog,
                $dialog_content;

            var tmpl = '\
				<div class="la-dialog la-mask" id="' + options.id + '">\
	                <div class="dialog ' + options.theme + '">' + options.content + '</div>\
	            </div>\
	        ';

            if ($("#" + _this.options.id).length > 0) {
                $("#" + _this.options.id).html('<div class="dialog ' + options.theme + '">' + options.content + '</div>');
            } else {
                $("body").append(tmpl);
            }

            _this.obj = $dialog = $("#" + _this.options.id);
            $dialog_content = $dialog.find(".dialog");

            $dialog_content.css({
                "top": "50%",
                "margin-top": -$dialog_content.height() / 2
            })

            setTimeout(function () {
                $dialog_content.addClass(options.transition);
                setTimeout(function () {
                    $dialog.addClass("ctl-show");

                    options.afterRender.call(_this);

                    pageStatic(options.istatic);
                    $(document).bind("tap", function (e) {

                        if (!$(e.target).hasClass(options.btnDClose) && options.isdiaClose) {
                            options.isdiaClose = false;
                            _this.close();
                        }
                    });

                }, 50);
            }, 0);

            $dialog.find(".btn-close").bind("click", function () {
                _this.close();
                return false;
            });

        },

        close: function () {
            var _this = this,
                options = this.options;

            _this.obj.removeClass("ctl-show");
            options.afterClose.call(_this);
            pageStatic(false);
        }
    }

    window.La = window.La || {};
    La.dialog = dialog;
})();