// 错误函数
var _errors = {
	template: function(type) {
		var _type = type;
		imgSrc = _type ? '../../css/images/error/error1.png' : '../../css/images/error/error2.png';
		// 网络请求异常，请检查您的手机是否联网
		return '<div id="error_msg" class="active">\
                        <div class="errorpane ub-ver">\
                            <img src="' + imgSrc + '" class="errorimg ub ub-ac"/>\
                        </div>\
                        <p class="errorp txt-c"></p>\
                    </div>';
	},
	check: function(type) {
		if(!$('#error_msg')[0])
			$('.scrollbox').append(this.template(type));
	},
	show: function(_msg, isShowPanel, type) {
		var self = this,
			_type = type,
			errorJQ = $('#error_msg');

		// 隐藏正在加载
		$('#dragmore').remove();
		endPullDownRefreshLately(100);

		if(!isShowPanel) {
			_errors.hide();
			return;
		}

		/*if($('body').hasClass('bc-bg')){
			$('body').addClass('bg-wh');
		}*/
		self.check(_type);
		$('.errorp').text(_msg);
		Load.finish();
	},
	hide: function() {
		/*if($('body').hasClass('bc-bg') &&　$('body').hasClass('bg-wh')){
			$('body').removeClass('bg-wh');
		}*/
		this.check();
		$('#error_msg').remove();
	}
};

function global_error(err, type) {
	Load.finish(); // 关闭loading

	err = err || {};
	if(type) type = 0;
	if(err && err.readyState == 4) {
		if(err.status == 200) {
			if(type == 0)
				toast('数据请求异常，请联系管理员');
			else {
				_errors.show('数据请求异常，请联系管理员', true, true);
			}
		} else {
			if(type == 0)
				toast('无网络，请检查网络');
			else {
				_errors.show('无网络，请检查网络', true, true);
			}
		}
	} else {
		if(err && err.readyState == 0 && 　err.status == 　0) {
			if(type == 0)
				toast('无网络，请检查网络');
			else {
				_errors.show('无网络，请检查网络', true, true);
			}
		}

		if(err.status == 'false') {
			_errors.show('数据请求异常，请联系管理员', true, true);
		} else if(err.code) {
			toast(err.codemsg, 2000, 'middle', 0);
		} else {
			_errors.hide();
		}
	}
};

// ajax参数、返回数据拦截、打印日志
var ajaxUrl = {};
var _ajax = $.ajax,
	_ajaxMethod = {
		debug: AJAX_DEBUG,
		param: {},
		paramCache: {},
		successCallback: function(args) {
			var param = this.param,
				paramCache = this.paramCache;
			if(args && args.length) {
				if(args[2].status == 200) {
					if(args[0] && args[0].code == "0") {
						if(!param.isNotReset){
							_errors.hide();
						}
					}
					var successData = args[0];
					// console.log(param.data);
					if(parseInt(successData.error_no)) {
						_ajaxMethod.debug && console.error(JSON.stringify(args[0]));
					} else {
						_ajaxMethod.debug && console.log('success data: ', args[0]);
					}
				} else {
					_ajaxMethod.debug && console.log('error data', args[1], args[3].responseError);
				}
			} else {
				_ajaxMethod.debug && console.log('success\'s return value was empty');
			}
			paramCache.success.apply(param.success, args)
		},
		errorCallback: function(args) {
			// console.log(args);
			var arg = Array.prototype.slice.call(args) || [],
				param = this.param,
				paramCache = this.paramCache;
			if(arg.length && arg[1] == 'timeout') {
				if(!param.isNotReset){
					appcan.window.openToast("网络超时！", 2000);
				}
			} else {
				paramCache.error.apply(param.error, args);
			}
			Load.finish();
			this.finish();
			setTimeout(function() {
				// toast('数据加载失败，请下拉刷新重试', 'middle', 0);
			}, constant.ajaxDelay + 100);
		},
		completeCallback: function(args) {
			var param = this.param,
				paramCache = this.paramCache;
			paramCache.complete.apply(param.complete, args);
			_ajaxMethod.finish();
		},
		finish: function() {
			endPullDownRefreshLately(100);
			setTimeout(function() {
				// mask.hideIt();
			}, constant.ajaxDelay);
		}
	},
	_ajaxClone = function() {
		var obj = new Object(),
			key;
		for(key in _ajaxMethod) {
			obj[key] = _ajaxMethod[key];
		}
		return obj;
	},
	_ajaxFilter = function() {
		var param = arguments[0],
			_ajaxMethod = _ajaxClone(_ajaxMethod),
			token = LS.get('emmToken');
		//!param.show && mask.showIt();
		param.data = param.data || [{}];
		param.success = param.success || function() {};
		param.error = param.error || function() {};
		param.complete = param.complete || function() {};
/*		param.headers = param.headers || {
			'lclmKey': LCLMKEY(),
			'tste': Math.random()
				// 'Host': 'pay.hjrich.cn',
		};*/
		_ajaxMethod.param = param;
		_ajaxMethod.paramCache = $.extend({}, param);
		var paramData = Object.prototype.toString.call(param.data) == '[object String]' ? JSON.parse(param.data) : param.data;
		var CurPage = paramData.start;
		/*过滤重复数据*/
		if(CurPage != undefined) {
			if(CurPage == '0') {
				ajaxUrl = {};
			} else {
				if(ajaxUrl[paramData.start])
					return;
				else
					ajaxUrl[paramData.start] = true;
			}
		}
		_ajaxMethod.debug && console.log('url: ' + param.url);
		param.success = function() {
			var args = arguments;
			if(_ajaxMethod.debug) {
				console.log('param data: ', param.data, args);
				_ajaxMethod.successCallback(args);
			} else {
				try {
					console.log('param data: ', param.data, args);
					_ajaxMethod.successCallback(args);
				} catch(e) {
					console.log('success() error: ', e);
				}
			}
		}
		param.error = function() {
			var args = arguments;
			if(_ajaxMethod.debug) {
				_ajaxMethod.errorCallback(args);
			} else {
				try {
					_ajaxMethod.errorCallback(args);
				} catch(e) {
					console.log('error() error: ', e);
				}
			}
		}
		param.complete = function() {
			var args = arguments;
			if(_ajaxMethod.debug) {
				_ajaxMethod.completeCallback(args);
			} else {
				try {
					_ajaxMethod.completeCallback(args);
				} catch(e) {
					console.log('complete() error: ', e);
				}
			}
		}
		param.timeout = constant.ajaxTimeout;
		// _ajaxMethod.debug && console.log('ajax args: ', arguments);
		_ajax.apply(this, arguments)
	},
	_ajaxFilterWrap = function() {
		var arg = arguments;
		EventUtil.throttleFire(function() {
			_ajaxFilter.apply(null, arg);
		});
	};

//window.$.ajax = _ajaxFilterWrap;
window.appcan.request.ajax = _ajaxFilterWrap;
var Load = {
	loading: function(type) {
		if(type == 0) {
			$('.scrollbox').addClass('uhide');
		}

		var $el = $('body');
		var _html = '<div id="inLoaded"><img src="../../css/icons/icon-load.gif">';
		_html += '</img></div>';
		$el.append(_html);

		$('#inLoaded').on('cilick', function(e) {
			e.stopPropagation();
		});
	},
	finish:function() {
		$('.scrollbox').removeClass('uhide');
		$('#inLoaded').remove();
	}
}



//打开新窗口
function openWin(id, url, animID, w, h, flag, animDuration) {
	if(!id) {
		id = 'newWindow';
	}
	var wid;
	if(~id.indexOf('/')) wid = id.substring(id.lastIndexOf('/') + 1, id.length);
	LS.set('windName', wid);
	// Umeng.pageStart(wid);
	if(!url) {
		url = id + '.html';
	}
	//定制适用于yhzq
	if(id.indexOf('/') > -1) {
		id = id.split('/').reverse()[0];
	}
	if(typeof animID !== "number") {
		animID = 0; //5;//10;
	}
	if(!w) {
		w = "";
	}
	if(!h) {
		h = "";
	}
	if(typeof flag !== "number") {
		flag = 0;
	}
	if(typeof animDuration !== "number") {
		animDuration = 200; //动画持续毫秒
	}
	animID = 10;
	
	saveNowWinName();
	appcan.window.open(id, url, 10);
}
//打开新窗口  无动画版
function openWinOffAm(id, url, animID, w, h, flag, animDuration) {
	if(!id) {
		id = 'newWindow';
	}
	var wid;
	if(~id.indexOf('/')) wid = id.substring(id.lastIndexOf('/') + 1, id.length);
	LS.set('windName', wid);

	if(!url) {
		url = id + '.html';
	}
	//定制适用于yhzq
	if(id.indexOf('/') > -1) {
		id = id.split('/').reverse()[0];
	}
	if(typeof animID !== "number") {
		animID = 0; //5;//10;
	}
	if(!w) {
		w = "";
	}
	if(!h) {
		h = "";
	}
	if(typeof flag !== "number") {
		flag = 0;
	}
	if(typeof animDuration !== "number") {
		animDuration = 0; //动画持续毫秒
	}
	animID = 10;
	
	saveNowWinName();
	uexWindow.open(id, "0", url, 0, w, h, flag, animDuration);
}

//关闭新窗口
function closeWin(animID, animDuration) {
	if(typeof animID !== "number") {
		animID = -1;
	}
	if(typeof animDuration !== "number") {
		animDuration = 260; //动画持续毫秒
	}
	
	deleteOldWinName();
	uexWindow.close(animID, animDuration);
}

// 存下当前页面的name
function saveNowWinName(){
	var _oldWindows = LS.get('oldWindows') || [];
	var _nowWindowName = window.name;
	var _nowName = _nowWindowName.split('_')[1];
	_oldWindows = deleteArrItem(_oldWindows, _nowName);
	_oldWindows.push(_nowName);
	LS.set('oldWindows', _oldWindows);
}

// 关闭页面并删除页面name
function deleteOldWinName(){
	var _oldWindows = LS.get('oldWindows') || [];
	var _nowWindowName = window.name;
	var _nowName = _nowWindowName.split('_')[1];
	_oldWindows = deleteArrItem(_oldWindows, _nowName);
	LS.set('oldWindows', _oldWindows);
	
	preWinRefesh(_oldWindows);
}

// 页面显示刷新onShow
function preWinRefesh(arr){
	var _nowName = arr[arr.length-1];
	evalScript(_nowName, 'Event.onShow && Event.onShow()');
}

// 删除数组元素
function deleteArrItem(arr, val){
	var len = arr.length;
	for(var i=0; i<len; i++) {
	    if(arr[i] == val) {
	      arr.splice(i, 1);
	      break;
	    }
	}
	return arr;
}

// 小于10的数字前面加个0
function lessTen(num){
	var newNum = parseInt(num);
	if(newNum < 10){
		newNum = '0' + newNum;
	}
	return newNum;
}

//执行主窗口方法
function evalScript(windName, js) {
    uexWindow.evaluateScript({
		name: windName, 
		type: 0, 
		js: js
	});
}

/**
 * [LS 缓存简单封装,处理array,object类型取、取值的解析]
 * @type {Object}
 */
+
(function(exports) {
	var LS = {
			valTypes: ['array', 'object'],
			set: function(key, val) {
				var type = utils.type(val);
				if(~this.valTypes.indexOf(type)) val = JSON.stringify(val);
				appcan.setLocVal(key, val);
			},
			get: function(key, statu) {
				var val = appcan.getLocVal(key);
				// 直接清除缓存
				statu && appcan.locStorage.remove(key); 
				if(/\[|\{/.test(val)) val = JSON.parse(val);
				return val;
			},
			remove: function(key) {
				appcan.locStorage.remove(key);
			}
		},
		_export = {
			set: LS.set.bind(LS),
			get: LS.get.bind(LS),
			remove: LS.remove.bind(LS)
		};
	exports = Object.assign ? Object.assign(exports, _export) : $.extend(exports, _export);
})((function() {
	
	if(typeof exports === 'undefined') {
		window.LS = {};
		return window.LS;
	} else {
		return exports;
	}
})());

/**
 * 事件处理相关工具类
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
var EventUtil = (function() {
	var _util = {
			delayMaxTime: 60 * 60 * 2 * 1000, // 2小时
			interval: 200, // 200毫秒
			deferInterval: 10 // defer间隔数,10毫秒
		},
		_public = {
			isFunc: function(value) {
				return Object.prototype.toString.call(value) === '[object Function]';
			},
			isArray: function(value) {
				return Object.prototype.toString.call(value) === '[object Array]';
			},
			// 继承
			extend: function() {
				var i = 1,
					len = arguments.length,
					target = arguments[0],
					j;
				if(i == len) {
					target = this;
					i--;
				}
				for(; i < len; i++) {
					for(j in arguments[i]) {
						target[j] = arguments[i][j];
					}
				}
				return target;
			}
		},
		_event = {
			delay: 50,
			args: null,
			add: function() {
				if(!_event.args) {
					_event.args = Array.prototype.slice.call(arguments);
				}
				if(_event.args.length == 0) {
					_event.args = null;
					return false;
				}

				var arg = _event.args.shift(),
					isFunc = _public.isFunc(arg),
					isArray = _public.isArray(arg);

				if(isArray && arg.length != 2) {
					throw new Error('arg length is not right');
				}
				setTimeout(function() {
					if(isFunc) {
						arg.call(null);
						_event.add(_event.args);
					} else if(isArray) {
						arg[1] && _public.isFunc(arg[1]) && arg[1].call(null);
						_event.add(_event.args);
					} else {
						// TODO: ?has other type?
						// throw new Error('type is unknow');
					}
				}, isArray ? arg[0] : _event.delay);
			}
		};
	// test:
	// _event.add(function(){ console.log('hello') }, [500,function(){ console.log('world'); }]);

	// 绑定事件
	_util.bind = function(obj, type, handle) {
		if(document.addEventListener) { // Chrome、FireFox、Opera、Safari、IE9.0及其以上版本
			obj.addEventListener(type, handle, false);
		} else if(document.attachEvent) { // IE8.0及其以下版本
			obj.attachEvent('on' + type, handle);
		} else { // 早期浏览器
			obj['on' + type] = handle;
		}
	}

	// 节流器
	_util.throttleFire = function() {
			// 获取第一个参数
			var isClear = arguments[0],
				fn;
			if(typeof isClear == 'boolean') {
				fn = arguments[1];
				fn.__throttleID && clearTimeout(fn.__throttleID);
			} else {
				fn = isClear;
				param = arguments[1];
				var p = _public.extend({
					context: null,
					args: [],
					time: 300
				}, param);
				arguments.callee(true, fn);
				fn.__throttleID = setTimeout(function() {
					fn.apply(p.context, p.args);
				}, p.time);
			}
		}
		// 延迟顺序执行(for optimise)
	_util.deferFire = _event.add;
	_util.delayFire = function(name, condition, callback) {
		var count = 0,
			conditionType = Core.isType(condition, 'function');
		var timer = setInterval(function() {
			conditionFlag = conditionType ? condition.call(this) : condition;
			if(conditionFlag) {
				clearInterval(timer);
				callback && callback.call(this);
			} else {
				count += 100;
				if(count >= _util.delayMaxTime) {
					clearInterval(timer);
					if(window.console) window.console.log(name + 'timer failed');
				}
			}
		}, _util.interval);
	};
	// 阻止默认事件
	_util.stopDefault = function(e) {
		if(e.preventDefault) {
			e.preventDefault(); // 支持DOM的标准浏览器
		} else {
			e.returnValue = false; // IE
		}
		return false;
	};
	// 冒泡：父元素相关的事件的触发
	_util.stopBubble = function(e) {
		if(window.event) {
			e.cancelBubble = false; // ie下阻止冒泡
		} else {
			e.stopPropagation(); // 其他浏览器下阻止冒泡
		}
	}
	return {
		bind: _util.bind,
		throttleFire: _util.throttleFire,
		delayFire: _util.delayFire,
		deferFire: _util.deferFire,
		stopDefault: _util.stopDefault,
		stopBubble: _util.stopBubble
	}
}());

+
(function(exports) {
	var utils = {
			//验证邮箱
			validateEmail: function(email) {
				var emailPat = /^(.+)@(.+)$/;
				return !!email.match(emailPat);
			},
			// 取数据类型
			type: function(arg) {
				return Object.prototype.toString.call(arg).replace('[object ', '').replace(']', '').toLowerCase();
			},
			arc: function(domJQ, activeClass, notClass) {
				if(!domJQ) throw new Error('domJQ was not found on the page.');
				if(!activeClass) throw new Error('activeClass was must be required');
				var cache;
				if(notClass) {
					if(utils.type(notClass) == 'array') {
						cache = domJQ.addClass(activeClass).siblings();
						_.forEach(notClass, function(_class, index) {
							cache = cache.not(_class);
						});
						cache.removeClass(activeClass);
					} else {
						domJQ.addClass(activeClass).siblings().not(notClass).removeClass(activeClass);
					}
				} else domJQ.addClass(activeClass).siblings().removeClass(activeClass);
			},
			ar: function(domJQ, removeClass, notClass) {
				if(!domJQ) throw new Error('domJQ was not found on the page.');
				if(!removeClass) throw new Error('removeClass was must be required');
				var cache;
				if(notClass) {
					if(utils.type(notClass) == 'array') {
						cache = domJQ.removeClass(removeClass).siblings();
						_.forEach(notClass, function(_class, index) {
							cache = cache.not(_class);
						});
						cache.addClass(removeClass);
					} else {
						domJQ.removeClass(removeClass).siblings().not(notClass).addClass(removeClass);
					}

				} else domJQ.removeClass(removeClass).siblings().addClass(removeClass);
			},
			/**
			 * [before this was the aop design pattern]
			 * @param  {[type]} self    [description]
			 * @param  {[type]} _before [description]
			 * @return {[type]}         [description]
			 */
			before: function(_beforeFn, currentFn) {
				return function() {
					if(_beforeFn.apply(this, arguments) === false) return;
					currentFn.apply(this, arguments)
				}();
			},
			delOne: function(array, val) {
				var index = (array || []).indexOf(val);
				if(~index) array.splice(index, 1);
			},
			addOne: function(array, val) {
				_log('index: ' + array.indexOf(val));
				if(!~array.indexOf(val)) array.push(val);
			},
			// 获取当前的css样式值
			cssVal: function(jq, _css) {
				var _str = jq.css(_css);
				var _num = parseFloat(_str.replace('em', '').replace('px', '').replace('rem', '') || '0').toFixed(2);
				var _unit = _str.replace(/[^a-zA-Z]/g,'');
				if(_unit == 'em' || _unit == 'rem') {
					_num = _num * parseFloat($('body').css('font-size')).toFixed(2);
				}
				return _num;
			},
			// 金额比较
			compare: {
				big: function(prev, next) {
					if(isNaN(prev)) return toast(prev + ' 不是一个数值');
					if(isNaN(next)) return toast(next + ' 不是一个数值');
					return parseFloat(prev || 0) > parseFloat(next || 0);
				}
			},
			// jq对象备用
			getJQ: function(baseJQ, backupJQ) {
				return baseJQ[0] ? baseJQ : backupJQ;
			},
			// 处理ios样式
			handleIosStyle: function() {
				var _bodyFot = utils.cssVal($('body'), 'font-size');
	
				// ios下Header_5样式
				var _headDom = $('#Header_5');
				if(_headDom[0]){
					var _headH = utils.cssVal(_headDom, 'height');
					var ios_headH = _headH/_bodyFot + 1;
					_headDom.css({
						'height': ios_headH  + 'em',
						'padding-top': '1em'
					});
				}
				
				// ios下HeaderBox_5样式
				var _headBoxDom = $('#HeaderBox_5');
				if(_headBoxDom[0]){
					var _headBoxT = utils.cssVal(_headBoxDom, 'top');
					var ios_headBoxH = _headBoxT/_bodyFot + 1;
					_headBoxDom.css({
						'top': ios_headBoxH + 'em'
					});
				}
				
				// ios下ScrollContent_5样式
				var _scrollContentDom = $('#ScrollContent_5');
				if(_scrollContentDom[0]){
					var _scrollContentP_t = utils.cssVal(_scrollContentDom, 'padding-top');
					var ios_scrollContentP_t = _scrollContentP_t/_bodyFot + 1;
					_scrollContentDom.css({
						'padding-top': ios_scrollContentP_t + 'em'
					});
				}
				
				// ios下iosPopBox弹框样式
				var _iosPopBoxDom = $('.iosPopBox');
				if(_iosPopBoxDom[0]){
					var _iosPopBox_t = utils.cssVal(_iosPopBoxDom, 'top');
					var ios_iosPopBox_t = _iosPopBox_t/_bodyFot + 1;
					_iosPopBoxDom.css({
						'top': ios_iosPopBox_t + 'em'
					});
				}
			},
			// 处理富文本字体问题
			handleFontSize: function(str) {
				var result = str;
				result = result.replace(/font-size:.*?px/ig, function(tag) {
					return 'font-size:1em';
				});
				result = result.replace(/line-height:.*?px/ig, function(tag) {
					return 'line-height:1em';
				});
				result = HtmlCode.de(result).replace(' ', '');
				return result;
			},
			// 没有数据的展示
			handleNoDataShow: function(res, selector, isShowPanel) {
				if(res && res.length == 0) {
					_errors.show('暂时没有相关内容...', isShowPanel, false);
					disablePullUp();
					return;
				}
				var activeJQ = $('.ubb2-active'),
					res = (res || [{}]),
					length = res.length,
					activeIndex = activeJQ.data('index');
				if(length == 1 && Object.keys(res[0]).length == 0) {
					disablePullUp();
					_errors.show('暂时没有相关内容...', isShowPanel, false);
					return;
					// utils.arc($(selector || '#pane'+activeIndex+'none'), 'active');
				}
				enablePullUp();
			},
			hasNoData: function(resp) {
				var isArray = this.type(resp) == 'array';
				return !resp || (isArray && resp.length == 0) || (isArray && Object.keys(resp[0]) == 0);
			},
			// 空图片处理
			handleImgEmpty: function() {
				$('img').each(function(index, element) {
					var _this = $(element),
						_src = _this.attr('src');
					if(!_src) {
						_this.attr('src', constant.defaultImage);
					}
				})
			},
			// 上传图片数据的处理
			handleImageData: function(res) {
				var array = [];
				if(_.isArray(res)) {
					$.each(res, function(i, item) {
						array.push(res[i].result.url);
					});
				} else {
					array.push(res.result.url);
				}
				return array;
			},
			// 图片处理
			imgUrl: function(_imgUrl) {
				if(_imgUrl) {
					if(~_imgUrl.indexOf('/upload')) return _imgUrl;
					return constant.IMG_PATH + _imgUrl;
				} else {
					return ''; // TODO: default img url
				}
			},

			thumbnail: function(_imgUrl) {
				if(_imgUrl) {
					var url = '';
					if(~_imgUrl.indexOf('/upload'))
						url = _imgUrl;
					else
						url = constant.IMG_PATH + _imgUrl;
					var splitIndex = url.lastIndexOf(".");
					url = url.substr(0, splitIndex) + '_thumbnail' + url.substr(splitIndex);
					return url;
					// return _imgUrl;
					// return 
				} else {
					return ''; // TODO: default img url
				}
			},

			loadImage: function(url, callback, errorCallback) {
				if(!url) {
					log('loadImage(): url can not be null!');
					return false;
				}
				var img = new Image();
				if(/msie/.test(window.navigator.userAgent.toLowerCase())) { // IE
					img.onreadystatechange = function() {
						if(img.readyState == "complete" || img.readyState == "loaded") {
							callback && callback.call(this, {
								height: img.height,
								width: img.width
							});
						}
					}
				} else {
					img.onload = function() {
						if(img.complete == true) {
							callback && callback.call(this, {
								height: img.height,
								width: img.width
							});
						}
					}
				}
				img.onerror = function() {
					errorCallback && errorCallback.call(this);
				}
				img.src = url;
			},
			swipe: function(ele, leftCallback, rightCallback) { // type: 'left', 'right'
				var touch = {
					boundary: 5,
					isLeft: false,
					isRight: false
				};
				if(!ele) ele = document;
				ele.addEventListener('touchstart', function(evt) {
					touch.isLeft = false;
					touch.isRight = false;
					touch.startX = evt.touches[0].pageX;
				})
				ele.addEventListener('touchmove', function(evt) {
					touch.endX = evt.touches[0].pageX;
					var moveBoundary = touch.endX - touch.startX;
					if(Math.abs(moveBoundary) > touch.boundary) {
						if(moveBoundary < 0) {
							touch.isLeft = true;
						} else if(moveBoundary > 0) {
							touch.isRight = true;
						}
					}
				});
				ele.addEventListener('touchend', function(evt) {
					if(touch.isLeft)
						leftCallback && leftCallback.call(this);
					if(touch.isRight)
						rightCallback && rightCallback.call(this);
				});
			}
		},
		_export = utils;
	exports = Object.assign ? Object.assign(exports, _export) : $.extend(exports, _export);
})((function() {
	if(typeof exports === 'undefined') {
		window.utils = {};
		return window.utils;
	} else {
		return exports;
	}
})());

/** 
 * ios样式问题 **/

appcan.ready(function() {
	var fontsize = $("body").css("font-size");
	var _newSize = parseInt(fontsize)*0.85;
	$("body").css("font-size", parseInt(_newSize) + 'px !important');
	
	var ios7style=uexWidgetOne.iOS7Style;
    var isFullScreen = uexWidgetOne.isFullScreen;
    if (ios7style == '1' && isFullScreen != '1' && isIOS) {
      $("body").addClass("uh_ios7");
      utils.handleIosStyle();
    }
});

/**
 * myCharts 隐藏提示框的
 */

function myChartsHideTip(myChart, unm) {
	$("body").on("touchend", function() {
		myChart.dispatchAction({
			type: 'showTip',
			// 系列的 index，在 tooltip 的 trigger 为 axis 的时候可选。
			seriesIndex: unm,
			// 数据的 index，如果不指定也可以通过 name 属性根据名称指定数据
			dataIndex: 0,
		})
	});
}

/**
 * [type appcan工具扩展]
 * @param  {[type]}  )         {                                                     return Object.prototype.toString.call(arguments[0]).replace('[object ',     '').replace(']',                             '').toLowerCase();        } [description]
 * @param  {Boolean} isArray:  function      () {                                                                                                         return Object.prototype.toString.call(arguments[0]) [description]
 * @param  {Boolean} isFunc:   function      () {                                                                                                         return Object.prototype.toString.call(arguments[0]) [description]
 * @param  {Boolean} isObject: function      () {                                                                                                         return Object.prototype.toString.call(arguments[0]) [description]
 * @param  {Boolean} isString: function      () {                                                                                                         return Object.prototype.toString.call(arguments[0]) [description]
 * @param  {String}  v:        {                        buttons: function(opts, ele) {                                                                                                                                                 if (Object.prototype.toString.call(opts) ! [description]
 * @return {[type]}            [description]
 */
appcan.extend({
    u: {
        type: function() {
            return Object.prototype.toString.call(arguments[0]).replace('[object ', '').replace(']', '').toLowerCase();
        },
        isArray: function() {
            return Object.prototype.toString.call(arguments[0]) === '[object Array]';
        },
        isFunc: function() {
            return Object.prototype.toString.call(arguments[0]) === '[object Function]';
        },
        isObject: function() {
            return Object.prototype.toString.call(arguments[0]) === '[object Object]';
        },
        isString: function() {
            return Object.prototype.toString.call(arguments[0]) === '[object String]';
        }
    },
    v: {
        /**
         * [btns buttons事件的优化版, key为selector, value为selector要绑定的事件]
         * @param  {[type]} opts [description]
         * @return {[type]}      [description]
         */
        btns: function(opts, anim) {
            if (appcan.u.type(opts) != 'object') throw new Error('btns(): opts should be an object!');
            var key,
                val;
            for (key in opts) {
                val = opts[key];
                (function(key, val) {
                    if(!~key.indexOf('#') && !~key.indexOf('.')){
                        if($('#' + key)[0]) key = ('#' + key);
                        else if($('.' + key)[0]) key = ('.' + key);
                        else throw new Error('selector was not found, please check your selector can be found in the document html');
                    }
                    if(!anim) {anim = 'ani-act';}
                    appcan.button(key, anim, function() {
                        val && appcan.u.type(val) == 'function' && val.call(this);
                    });
                })(key, val);
            }
        }
    },
    c: { // 窗口通讯相关
        _handle: {
            object: function(receiveKey, jsonObject) {
                var keys = Object.keys(receiveKey);
                _.some(jsonObject, function(callback, key) {
                    if (~keys.indexOf(key)) {
                        callback && appcan.u.isFunc(callback) && callback.call(this, receiveKey[key]);
                    }
                });
            },
            string: function(receiveKey, jsonObject) {
                _.some(jsonObject, function(callback, key) {
                    // if(receiveKey.indexOf('\"')) receiveKey = receiveKey.replace(/"/g, '');
                    // if(receiveKey.indexOf('\''))receiveKey = receiveKey.replace(/'/g, '');
                    if (key == receiveKey) {
                        callback && appcan.u.isFunc(callback) && callback.call(this);
                        return true;
                    }
                });
            }
        },
        /**
         * [sub 订阅一个频道，如果有消息发给该频道，则会执行响应的回调]
         * @param {[type]} channelID [频道名称]
         * @param {[type]} jsonObject     [绑定的执行的回调的json对象]
         */
        sub: function(channelID, jsonObject) {

            var _handle = this._handle;

            appcan.window.subscribe(channelID, function(receiveKey) {
                try {
                    receiveKey = JSON.parse(receiveKey); //appcan.u.isObject(receiveKey) ? JSON.parse(receiveKey) : receiveKey;
                    if (appcan.u.isObject(receiveKey)) {
                        _handle.object(receiveKey, jsonObject);
                    } else if (appcan.u.isString(receiveKey)) {
                        _handle.string(receiveKey, jsonObject);
                    } else {
                        console && console.info('this type of receiveKey was developing, please wait for a moment!');
                    }
                } catch (e) {
                    // if there are some error, handle this condition as string
                    _handle.string(receiveKey, jsonObject);
                    console.error(e);
                }
            });
        },
        /**
         * [SendNotification 向指定通道发送消息]
         * @param {[String]} channelID [频道名称]
         * @param {[String]} key      [发送的消息]
         */
        pub: function(channelID, key) {
            appcan.window.publish(channelID, JSON.stringify(key)); // appcan.u.isObject(key) ? JSON.stringify(key) : key
        }
    }
});
/**
 * *
 * @param  {[type]} id                   [通讯的通道id]
 * @param  {[type]} callback)            [订阅通讯的回调]
 * @param  {[type]} pub:function(id,msg) [description]
 * @return {[type]}                      [description]
 */
appcan.extend({
	sub: function(id,callback) {
		appcan.window.subscribe(id,function(res) {
			callback && callback(res);
		})
	},
	pub:function(id,msg) {
		appcan.window.publish(id, JSON.stringify(msg));
	}
})



// 验证码倒计时
function getCodeTime(){
	setTimeout(function() {
		$('.codeBtn').addClass('getCodeBtnDisabled');
		$('.countdown').removeClass('uhide');
		$('.getCode').text('s后重新获取');
	    var time = $(".countdown").text();
	    if (time == 1) {
	    	$('.countdown').text(60);
	        $('.countdown').addClass('uhide');
	        $('.getCode').text('获取验证码');
	        $('.codeBtn').removeClass('getCodeBtnDisabled');
	    } else {
	        $(".countdown").text(time - 1);
	        getCodeTime();
	    }
  }, 1000);
}
$('.countdown').text(60);


function getDateDiff(dateTimeStamp){
	dateTimeStamp = new Date(dateTimeStamp).getTime();
	var minute = 1000 * 60,
		hour = minute * 60,
		day = hour * 24, 
		halfamonth = day * 15,
		month = day * 30,
		now = new Date().getTime(),
		diffValue = now - dateTimeStamp;
	if(diffValue < 0){return;}
	var monthC = diffValue/month,
		weekC = diffValue/(7*day),
		dayC = diffValue/day,
		hourC = diffValue/hour,
		minC = diffValue/minute,
		result = '';
	if(monthC>=1){
		result="" + parseInt(monthC) + "个月前";
	}
	else if(weekC>=1){
		result="" + parseInt(weekC) + "周前";
	}
	else if(dayC>=1){
		result=""+ parseInt(dayC) +"天前";
	}
	else if(hourC>=1){
		result=""+ parseInt(hourC) +"小时前";
	}
	else if(minC>=1){
		result=""+ parseInt(minC) +"分钟前";
	}else
		result="刚刚";
	return result;
} 

