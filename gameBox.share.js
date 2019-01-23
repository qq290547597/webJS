;(function(){
	if(!document.querySelectorAll){
		return;
	}

	var extend = function(target, options){
		for(name in options){
			copy = options[name];
			if (copy instanceof Array){
				target[name] = arguments.callee([], copy);
			}else if(copy instanceof Function){
				target[name] = options[name];
			}
			else if(copy instanceof Object){
				target[name] = arguments.callee(target[name]?target[name]:{}, copy);
			}else{
				target[name] = options[name];
			}
		}
		return target;
	};

	var nodeFilter = function(node,condition){
		if(!condition){
			return true;
		}

		if(node.nodeName.toLowerCase() == "html"){
			if(condition){
				return false;
			}else{
				return true;
			}
		}

		var query = condition.split(" ");
		var ql = query.length;
		var isMatch = false;

		if(/\./g.test(query[ql-1])){
			var classList = node.className.split(" ");
			for(var i in classList){
				if(classList[i] == query[ql-1].slice(1)){
					isMatch = true;
					break;
				}
			}
		}else if(/\#/g.test(query[ql-1])){
			if(node.id == query[ql-1].slice(1)){
				isMatch = true;
			}
		}else{
			if(node.nodeName.toLowerCase() == query[ql-1].toLowerCase()){
				isMatch = true;
			}
		}
		return isMatch ? arguments.callee(node.parentNode,  query.slice(0,ql-1).join(" ")) : arguments.callee(node.parentNode, condition);
	};

	var mergeConfig = function(merge,shareType,mode){
		var config = {};
		config["type"] = shareType;

		if(mode){
			config["shareUrl"] = merge["shareUrl"] ? merge["shareUrl"] : (merge[shareType] ? merge[shareType]["shareUrl"] : "");
			config["icon"] = merge["shareIcon"] ? merge["shareIcon"] : (merge[shareType] ? merge[shareType]["icon"] : "");
			config["title"] = merge["shareTitle"] ? merge["shareTitle"] : (merge[shareType] ? merge[shareType]["title"] : "");
			config["message"] = merge["shareContent"] ? merge["shareContent"] : (merge[shareType] ? merge[shareType]["message"] : "");;
		}else{
			config["shareUrl"] = merge[shareType] ? (merge[shareType]["shareUrl"]?merge[shareType]["shareUrl"]:merge["shareUrl"]) : merge["shareUrl"];
			config["icon"] = merge[shareType] ? (merge[shareType]["icon"]?merge[shareType]["icon"]:merge["shareIcon"]) : merge["shareIcon"];
			config["title"] = merge[shareType] ? (merge[shareType]["title"]?merge[shareType]["title"]:merge["shareTitle"]) : merge["shareTitle"];
			config["message"] = merge[shareType] ? (merge[shareType]["message"]?merge[shareType]["message"]:merge["shareContent"]) : merge["shareContent"];
		}

		config["extra"] = merge["extra"];
		return config;
	};

	window.gameBox = window.gameBox || {};
	gameBox.share = function(opt){
		var _this = this;
		var defaults = {
			target : "",
			all : "",
			config : {},
			complete : function(){},
			isGetData : true,
			commonParam : false
		};

		var opts = _this.opts = extend(defaults, opt);
		var _targetNode = opts.target;
		var _allNode = opts.all;
		var _target = opts.target ? document.querySelectorAll(opts.target) : "";
		var _all = opts.all ? document.querySelectorAll(opts.all) : "";
		if(window.shareAPI){
			var SA = window.shareAPI;

			function _openShare(){
				if(_this.opts.isGetData){
					if(_this.getData){
						var config = extend(_this.getData, _this.opts.config);
						if(config.extra && config.extra.custom && config.extra.custom.activityUri){
							config.shareUrl = config.shareUrl.replace(/&ext=\S*/,"");
							config.shareUrl = config.extra.customUrl = config.shareUrl + "&ext=" + config.extra.custom.activityUri;
						}
						config = JSON.stringify(config);
						SA.onJsShare(config);
					}else{
						window.setShareData = function(e){
							_this.getData = e;
							var config = extend(e, _this.opts.config);
							if(config.extra && config.extra.custom && config.extra.custom.activityUri){
								config.shareUrl = config.shareUrl.replace(/&ext=\S*/,"");
								config.shareUrl = config.extra.customUrl = config.shareUrl + "&ext=" + config.extra.custom.activityUri;
							}
							config = JSON.stringify(config);
							SA.onJsShare(config);
						};
						SA.getShareData();
					}

				}else{
					var config =  _this.opts.config;
					if(config.extra && config.extra.custom && config.extra.custom.activityUri){
						config.shareUrl = config.shareUrl.replace(/&ext=\S*/,"");
						config.shareUrl = config.extra.customUrl = config.shareUrl + "&ext=" + config.extra.custom.activityUri;
					}
					SA.onJsShare(JSON.stringify(config));
				}
			}

			this.openShare = _openShare;

			window.shareCompleted = function(e){
				_this.opts.complete(e);
			};

			window.openShare = function(){
				if(_this.opts.openShare){
					_this.opts.openShare();
				}else{
					_openShare();
				}

			};

			if(_allNode){
				document.body.addEventListener("click",function(){
					var e = e || window.event;
					var t = e.target;
					if(!nodeFilter(t,_allNode)){
						return;
					}

					_openShare();
				});
			}

			if(!_targetNode){
				return;
			}

			document.body.addEventListener("click",function(e){
				var e = e || window.event;
				var t = e.target;
				if(!nodeFilter(t,_targetNode)){
					return;
				}

				var opts = _this.opts;
				var shareType = t.getAttribute("data-type");
				var config = {};

				if(opts.isGetData){

					if(_this.getData){
						var merge = extend(_this.getData, opts.config);
						var config = mergeConfig(merge,shareType,opts.commonParam);

						if(config.extra && config.extra.custom && config.extra.custom.activityUri){
							config.shareUrl = config.shareUrl.replace(/&ext=\S*/,"");
							config.shareUrl = config.extra.customUrl = config.shareUrl + "&ext=" + config.extra.custom.activityUri;
						}


						SA.onJsShareForType(JSON.stringify(config));
					}else{
						window.setShareData = function(e){
							var e = e;
							if(typeof e == "string"){
								e = JSON.parse(e);
							}
							_this.getData = e;
							var merge = e ? extend(e, opts.config) : opts.config;
							var config = mergeConfig(merge,shareType,opts.commonParam);

							if(config.extra && config.extra.custom && config.extra.custom.activityUri){
								config.shareUrl = config.shareUrl.replace(/&ext=\S*/,"");
								config.shareUrl = config.extra.customUrl = config.shareUrl + "&ext=" + config.extra.custom.activityUri;
							}

							SA.onJsShareForType(JSON.stringify(config));
						};
						SA.getShareData();
					}

				}else{
					var merge = opts.config;
					config = mergeConfig(merge,shareType,opts.commonParam);
					if(config.extra && config.extra.custom && config.extra.custom.activityUri){
						config.shareUrl = config.shareUrl.replace(/&ext=\S*/,"");
						config.shareUrl = config.extra.customUrl = config.shareUrl + "&ext=" + config.extra.custom.activityUri;
					}
					SA.onJsShareForType(JSON.stringify(config));
				}
			});
		}else if(window.android){
			var A = window.android;

			window.set_share_config = function(){};

			if(_allNode){
				if(window["shareCallback"]){
					A.bindEvent('share', 'shareCallback');
				}

				document.body.addEventListener("click",function(){
					var e = e || window.event;
					var t = e.target;
					if(!nodeFilter(t,_allNode)){
						return;
					}
					var opts = _this.opts;
					var config = {};
					opts.config.title ? config.title = opts.config.title : "";
					opts.config.desc ? config.desc = opts.config.desc : "";
					opts.config.param ? config.param = opts.config.param : "";
					config = extend(opts.config, config);
					var cn = 0;
					for(var i in config){
						cn++;
					}
					if(cn){
						config = JSON.stringify(config);
						A.onJsShareConfig(config);
					}

					A.onJsShare();
				});
			}

			if(!_targetNode){
				return;
			}

			document.body.addEventListener("click",function(){
				var e = e || window.event;
				var t = e.target;
				if(!nodeFilter(t,_targetNode)){
					return;
				}
				var opts = _this.opts;
				var config = {};
				opts.config.title ? config.title = opts.config.title : "";
				opts.config.desc ? config.desc = opts.config.desc : "";
				opts.config.param ? config.param = opts.config.param : "";
				config = extend(opts.config, config);
				var cn = 0;
				for(var i in config){
					cn++;
				}
				var shareType = t.getAttribute("data-type");
				if(!shareType) return;
				var callBack = 'shareCallback' + shareType.charAt(0).toUpperCase() + shareType.substring(1);
				if(window[callBack]){
					A.bindEvent('share', callBack);
				}
				if(cn){
					config = JSON.stringify(config);
					A.onJsShareConfig(config);
				}
				A.onJsShareForType(shareType);
			});

		}

	};

	gameBox.share.prototype = {
		setConfig : function(config){
			var _this = this;
			_this.opts = extend(_this.opts, config);
			if(!window.shareAPI){
				android.onJsShareConfig(JSON.stringify(_this.opts.config));
			}
		},
		openShare : function(){
			var _this = this;
			if(window.shareAPI){
				_this.openShare();
			}else if(window.android){
				android.onJsShare();
			}
		}
	};
})();