/**
 * list
 * 错误函数
 * ajax
 * 加载动画方法
 * 常用校验方法
 * 窗口相关操作
 * LS 缓存简单封装
 * 事件处理相关工具类
 * toast,alert,confirm,actionsheet
 * [日历📅插件]
 * 
 */


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
		/*	param.headers = param.headers || {};*/
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

// 加载动画方法
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

// 常用校验方法
var tools = {
	/**
	 * 判断是否为手机号码
	 * @param strValue 校验的值
	 * @returns {boolean}
	 */
	isMobile: function(strValue) {
		if(!strValue)
			return false;
		var pattern = /^(13|14|15|16|17|18|19)[0-9]{9}$/;
		return this.executeExp(pattern, strValue);
	},
	/**
	 * 判断是否是邮箱
	 * @param  校验的值
	 * @return {Boolean} 
	 */
	isEmail: function(strValue) {
		if(!strValue)
			return false;
		var pattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
		return pattern.test(strValue)
	},

	/**
	 * 是否为汉字
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	checkChinese: function(str) {
		var re = /^\s*$/g;
		if(!re.exec(str)) {
			return false;
		} else
			return true;
	},
	// 校验图片格式
	checkPhoto: function(url) {
		var index = url.lastIndexOf('.');
		var photoType = url.substring(index + 1);
		if(photoType != 'jpg' && photoType != 'png' && photoType != 'gif') {
			return false;
		}
		return true;
	},
	// 校验车牌号
	checkChinese: function(str) {
		var re = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
		if(!re.exec(str)) {
			return false;
		} else
			return true;
	},
	// 校验固定电话是否正确
	checkMobile2: function(str) {
		var re = /^(0[0-9]{2,3}\-)([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/;
		if(!re.exec(str)) {
			return false;
		} else
			return true;
	},

	/**
	 * 验证身份证的有效性
	 * @param strValueo 身份证ID
	 * @returns {boolean}
	 */
	isCardID: function(strValue) {
		if(!strValue) {
			return false;
		}
		strValue = strValue.toUpperCase();
		var vcity = {
			11: "北京",
			12: "天津",
			13: "河北",
			14: "山西",
			15: "内蒙古",
			21: "辽宁",
			22: "吉林",
			23: "黑龙江",
			31: "上海",
			32: "江苏",
			33: "浙江",
			34: "安徽",
			35: "福建",
			36: "江西",
			37: "山东",
			41: "河南",
			42: "湖北",
			43: "湖南",
			44: "广东",
			45: "广西",
			46: "海南",
			50: "重庆",
			51: "四川",
			52: "贵州",
			53: "云南",
			54: "西藏",
			61: "陕西",
			62: "甘肃",
			63: "青海",
			64: "宁夏",
			65: "新疆",
			71: "台湾",
			81: "香港",
			82: "澳门",
			91: "国外"
		};
		//校验长度，类型,身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
		var pattern = /(^\d{15}$)|(^\d{17}(\d|X)$)/;
		if(tools.executeExp(pattern, strValue) === false) {
			return false;
		}
		//检查省份
		var province = strValue.substr(0, 2);
		if(vcity[province] == undefined) {
			return false;
		}
		//校验生日
		var len = strValue.length;
		//身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字
		if(len == 15) {
			var re_fifteen = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/;
			var arr_data = strValue.match(re_fifteen);
			var year = parseInt('19' + arr_data[2]);
			var month = parseInt(arr_data[3]);
			var day = parseInt(arr_data[4]);
			var birthday = new Date('19' + year + '/' + month + '/' + day);
			//var birthday = new Date();
			birthday.setFullYear(year);
			birthday.setMonth(month - 1);
			birthday.setDate(day);
			var now = new Date();
			var now_year = now.getFullYear();
			//年月日是否合理
			if(birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
				//判断年份的范围（3岁到100岁之间)
				var time = now_year - year;
				if(!(time >= 3 && time <= 100)) {
					return false;
				}
			} else {
				return false;
			}
		}
		//身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X
		if(len == 18) {
			var re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/;
			var arr_data = strValue.match(re_eighteen);
			var year = parseInt(arr_data[2]);
			var month = parseInt(arr_data[3]);
			var day = parseInt(arr_data[4]);
			var birthday = new Date(year + '/' + month + '/' + day);
			//var birthday = new Date();
			birthday.setFullYear(year);
			birthday.setMonth(month - 1);
			birthday.setDate(day);
			var now = new Date();
			var now_year = now.getFullYear();
			//年月日是否合理
			if(birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
				//判断年份的范围（3岁到100岁之间)
				var time = now_year - year;
				if(!(time >= 3 && time <= 100)) {
					return false;
				}
			} else {
				return false;
			}
		}
		//检验位的检测
		//15位转18位
		if(strValue.length == 15) {
			var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
			var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
			var cardTemp = 0,
				i;
			strValue = strValue.substr(0, 6) + '19' + strValue.substr(6, strValue.length - 6);
			for(i = 0; i < 17; i++) {
				cardTemp += strValue.substr(i, 1) * arrInt[i];
			}
			strValue += arrCh[cardTemp % 11];
		}
		if(strValue.length == 18) {
			var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
			var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
			var cardTemp = 0,
				i,
				valnum;
			for(i = 0; i < 17; i++) {
				cardTemp += parseInt(strValue.substr(i, 1)) * arrInt[i];
			}
			valnum = arrCh[cardTemp % 11];
			if(!(valnum == strValue.substr(17, 1))) {
				return false;
			}
		}
		return true;
	},
	/**
	 * 获取距当前时间多少天的日期
	 * @param now 当前时间
	 * @param addDayCount 天数
	 * @param sign 分隔符
	 * @returns 2016-10-10
	 */
	getDateStr: function(now, addDayCount, sign) {
		var dd = new Date(now);
		dd.setDate(dd.getDate() + addDayCount * 1);
		//获取AddDayCount天后的日期

		var y = dd.getFullYear();
		var m = dd.getMonth() + 1;
		//获取当前月份的日期
		var d = dd.getDate();
		if(m < 10) {
			m = "0" + m;
		}
		if(d < 10) {
			d = "0" + d;
		}
		return y + sign + m + sign + d;
	},
	/**
	 * 获取距当前月份
	 * @param now 当前月份
	 * @param addDayCount 天数
	 * @param sign 分隔符
	 * @returns 2016-10-10
	 */
	getMonthStr: function(now, addMonthCount, sign) {
		var dd = new Date(now);
		dd.setMonth(dd.getMonth() - addMonthCount * 1);
		//获取AddDayCount天后的日期

		var y = dd.getFullYear();
		var m = dd.getMonth() + 1;
		//获取当前月份的日期
		if(m < 10) {
			m = "0" + m;
		}
		return y + sign + m;
	},
	/**
	 * 判断字符串是否为空
	 * @param strValue 校验的值
	 * @returns {boolean}
	 */
	isEmpty: function(strValue) {
		strValue = jQuery.trim(strValue);
		return strValue.length == 0;
	},
	/**
	 * 判断字符串是否非空
	 * @param strValue 校验的值
	 * @returns {boolean}
	 */
	isNotEmpty: function(strValue) {
		return !isEmpty(strValue);
	},
	/**
	 * 执行正则表达式
	 * @param pattern 校验的正则表达式
	 * @param strValue 校验的值
	 * @returns {boolean}
	 */
	executeExp: function(pattern, strValue) {
		return pattern.test(strValue);
	},
	strToInt: function(strValue) {
		while(strValue.length > 1 && strValue.substring(0, 1) == "0") {
			strValue = strValue.substring(1, strValue.length);
		}
		return parseInt(strValue);
	},
	bankNoCheck: function(bankno) {
		if(bankno.length < 16 || bankno.length > 19) {
			//$("#banknoInfo").html("银行卡号长度必须在16到19之间");
			return false;
		}
		var num = /^\d*$/; //全数字
		if(!num.exec(bankno)) {
			//$("#banknoInfo").html("银行卡号必须全为数字");
			return false;
		}
		//开头6位
		var strBin = "10,18,30,35,37,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,60,62,65,68,69,84,87,88,94,95,98,99";
		if(strBin.indexOf(bankno.substring(0, 2)) == -1) {
			//$("#banknoInfo").html("银行卡号开头6位不符合规范");
			return false;
		}
		var lastNum = bankno.substr(bankno.length - 1, 1); //取出最后一位（与luhm进行比较）

		var first15Num = bankno.substr(0, bankno.length - 1); //前15或18位
		var newArr = new Array();
		for(var i = first15Num.length - 1; i > -1; i--) { //前15或18位倒序存进数组
			newArr.push(first15Num.substr(i, 1));
		}
		var arrJiShu = new Array(); //奇数位*2的积 <9
		var arrJiShu2 = new Array(); //奇数位*2的积 >9

		var arrOuShu = new Array(); //偶数位数组
		for(var j = 0; j < newArr.length; j++) {
			if((j + 1) % 2 == 1) { //奇数位
				if(parseInt(newArr[j]) * 2 < 9)
					arrJiShu.push(parseInt(newArr[j]) * 2);
				else
					arrJiShu2.push(parseInt(newArr[j]) * 2);
			} else //偶数位
				arrOuShu.push(newArr[j]);
		}

		var jishu_child1 = new Array(); //奇数位*2 >9 的分割之后的数组个位数
		var jishu_child2 = new Array(); //奇数位*2 >9 的分割之后的数组十位数
		for(var h = 0; h < arrJiShu2.length; h++) {
			jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
			jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
		}

		var sumJiShu = 0; //奇数位*2 < 9 的数组之和
		var sumOuShu = 0; //偶数位数组之和
		var sumJiShuChild1 = 0; //奇数位*2 >9 的分割之后的数组个位数之和
		var sumJiShuChild2 = 0; //奇数位*2 >9 的分割之后的数组十位数之和
		var sumTotal = 0;
		for(var m = 0; m < arrJiShu.length; m++) {
			sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
		}

		for(var n = 0; n < arrOuShu.length; n++) {
			sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
		}

		for(var p = 0; p < jishu_child1.length; p++) {
			sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
			sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
		}
		//计算总和
		sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);

		//计算Luhm值
		var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
		var luhm = 10 - k;

		if(lastNum == luhm) {
			// $("#banknoInfo").html("Luhm验证通过");
			return true;
		} else {
			// $("#banknoInfo").html("银行卡号必须符合Luhm校验");
			return false;
		}
	}
}


/**
 * 窗口相关操作
 */

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
function saveNowWinName() {
	var _oldWindows = LS.get('oldWindows') || [];
	var _nowWindowName = window.name;
	var _nowName = _nowWindowName.split('_')[1];
	_oldWindows = deleteArrItem(_oldWindows, _nowName);
	_oldWindows.push(_nowName);
	LS.set('oldWindows', _oldWindows);
}

// 关闭页面并删除页面name
function deleteOldWinName() {
	var _oldWindows = LS.get('oldWindows') || [];
	var _nowWindowName = window.name;
	var _nowName = _nowWindowName.split('_')[1];
	_oldWindows = deleteArrItem(_oldWindows, _nowName);
	LS.set('oldWindows', _oldWindows);

	preWinRefesh(_oldWindows);
}

// 页面显示刷新onShow
function preWinRefesh(arr) {
	var _nowName = arr[arr.length - 1];
	evalScript(_nowName, 'Event.onShow && Event.onShow()');
}



//执行主窗口方法
function evalScript(windName, js) {
	uexWindow.evaluateScript(windName, 0, js);
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




/** 提示 alert、toast、confirm ... */

//关闭toast
function closeToast() {
	uexWindow.closeToast();
}

// 重写alert
window.alert = function() {
	var argOne = arguments[0],
		argType = Object.prototype.toString.call(argOne);
	argOne = argType == '[object Object]' || argType == '[object Array]' ? JSON.stringify(argOne) : argOne;
	appcan.window.alert({
		title: '提示',
		buttons: ['确定'],
		content: argOne,
		callback: function(){}
	});
}

function confirm2(cb, message, title, buttonLable) {
	//confirm确认选择
	if(typeof cb !== 'function') {
		alert('缺少回调函数');
		return;
	}
	if(typeof uexWindow === 'undefined') {
		var r = confirm(message);
		if(cb) {
			cb(r);
		}
		return;
	}
	if(!message) {
		var message = '确认执行此操作？'
	}
	if(!title) {
		var title = '提示';
	}
	if(!buttonLable) {
		var buttonLable = ['确定', '取消'];
	}
	uexWindow.cbConfirm = function(opId, dataType, data) {
		console.log('您选择了第 %s 项', data);
		cb(data);
	}
	uexWindow.confirm(title, message, buttonLable);
}

//toast提示
function toast(msg, duration, location, type) {
	var locationObj = {
		"leftTop": 1,
		"top": 2,
		"rightTop": 3,
		"left": 4,
		"middle": 5,
		"right": 6,
		"bottomLeft": 7,
		"bottom": 8,
		"bottomRight": 9
	}
	if(!msg) {
		msg = '提示';
	}
	if(!duration) {
		duration = 3000;
	}
	if(!location) {
		location = 5; //默认居中显示
	}
	if(locationObj[location]) {
		location = locationObj[location];
	}
	if(!type) {
		type = 0;
	}
	if(typeof type !== 'number' && duration === 0) {
		type = 1;
	} else {
		type = 0;
	}
	uexWindow.toast(type, location, msg, duration);
}

function actionSheet(cb, buttonLables, cancel, title) {
    if (typeof cb !== 'function') {
        alert('缺少回调函数');
        return;
    }
    if (!cancel) {
        cancel = '取消'
    }
    if (!title) {
        title = '';
    }
    if (!buttonLables) {
        buttonLables = ['演示选项一', '演示选项二', '演示选项三']
    }
    uexWindow.cbActionSheet = function(opId, dataType, data) {
        console.log('您选择了第 %s 项', data);
        cb(data);
    }
    uexWindow.actionSheet(title, cancel, buttonLables);
}


/**
 * [日历📅插件]
 *
 * api:
 * http://newdocx.appcan.cn/plugin-API/system/uexControl
 *
 * usage:
 * <1>.html==>
 * <div onclick="appcan.date.init({ele: this, format: 'yyyy-MM-dd hh:mm:ss.S'})" id="startDate"></div>
 * <div onclick="appcan.date.init({format: 'yyyy-MM-dd hh:mm:ss.S'})" id="startDate"></div>
 * <div onclick="appcan.date.init()" id="startDate"></div>
 * <div onclick="appcan.date.init({isTime: true})" id="startDate"></div>
 *
 * <2>.js====>
 * appcan.date.format(new Date(), 'yyyy-MM-dd hh:mm:ss.S');
 * appcan.date.getDateRelative(new Date(), 1);
 * appcan.date.getWeekday(new Date());
 * appcan.date.getMonthAndDay(new Date());
 * appcan.date.getDateYearMonthDay(new Date());
 * appcan.date.getWeekdayByZhou(new Date());
 *
 * @param  {[type]} $         [description]
 * @param  {[type]} exports   [description]
 * @param  {Object} module){                 var date [description]
 * @return {[type]}           [description]
 */
appcan.define('date', function ($, exports, module) {
    var MDate = {
        errorHandle: function () {
            var date = new Date();
            return {
                year: date.getFullYear(),
                month: date.getMonth(),
                day: date.getDate()
            }
        },
        /**
         * [init description]
         * @param  {[type]} param [{el: dom, format: 'yyyy/MM/dd'}]
         * @return {[type]}       [description]
         */
        init: function (param) {
            param = param || {};
            var self = this,
                date,
                caller = MDate.init.caller, // may be cause bug
                event = window.event ? window.event : caller.arguments[0],
                target = param && param.ele ? param.ele : event.target || event.srcElement || {},
                $this = $(target),
                targetText = $this.text() || $this.val();

            if (!self.caller) self.caller = caller;


            param.format = param.format || 'yyyy/MM/dd';

            // param = $.extend(_default, param);
            try {
                var dates = targetText.split('/');
                date = {
                    year: dates[0],
                    month: dates[1],
                    day: dates[2]
                };
                // alert(JSON.stringify(param.ele));
                // alert(JSON.stringify(date));
            } catch (e) {
                date = self.errorHandle();
                // alert('get text value error: ' + JSON.stringify(e));
            }

            if (!isPhone) return; // did not run on the simular platform

            self.caller.isOpen = true;

            // alert(JSON.stringify(param));
            uexControl.openDatePicker(date.year, date.month, date.day);
            appcan.ready(function () {
                uexControl.cbOpenDatePicker = function (opId, dataType, data) {
                    try {
                        var resultDate = new Date();
                        if (data) {
                            data = JSON.parse(data);
                            // alert(JSON.stringify(data));
                            // alert(JSON.stringify(param));
                            // $this.text(data.year+'/'+data.month+'/'+data.day);
                            resultDate.setFullYear(parseInt(data.year));
                            resultDate.setMonth(parseInt(data.month) - 1);
                            resultDate.setDate(parseInt(data.day));
                        }
                        var showDate = self.format(resultDate, param.format);
                        // alert(showDate);
                        if(param.isTime){
                            MDate.continueTime(showDate, $this);
                        }else{
                            $this.text(showDate);
                            $this.val(showDate);
                        }
                    } catch (e) {
                        // alert(JSON.stringify(e));
                        var showDate = self.format(new Date(), param.format);
                        if(param.isTime){
                            MDate.continueTime(showDate, $this);
                        }else{
                            $this.text(showDate);
                            $this.val(showDate);
                        }
                    }
                }
            })
        },
        // 继续选择时间
        continueTime: function (showDate, $this) {
            var _date = new Date(),
                _hour = _date.getHours(),
                _minute = _date.getMinutes();
            uexControl.openTimePicker(_hour, _minute, function(data) {
            	if(data.hour<10){data.hour='0'+data.hour}
            	if(data.minute<10){data.minute='0'+data.minute}
                showDate = showDate + ' ' + data.hour + ':' + data.minute;
                $this.text(showDate);
                $this.val(showDate);
            });
        },
        /**
         * [format 日期格式化
         * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
         * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
         * ]
         * @param  {[type]} _date [description]
         * @param  {[type]} fmt   [description]
         * @return {[type]}       [description]
         */
        format: function (_date, fmt) {
            if (utils.type(_date) == 'date'){

            }else if(utils.type(_date) == 'string'){
                if(_date && !~_date.indexOf('T') && ~_date.indexOf('-')){
                    _date = _date.replace(/-/g, '/');
                    if(~_date.indexOf('.0')){
                        _date = _date.replace('.0', '');
                    }
                }
                _date = new Date(_date);
            }else{
                // console.error('_date type was not found');
                return '';
            }
            var o = {
                "M+": (_date.getMonth() + 1), //月份  + 1
                "d+": _date.getDate(), //日
                "h+": _date.getHours(), //小时
                "m+": _date.getMinutes(), //分
                "s+": _date.getSeconds(), //秒
                "q+": Math.floor((_date.getMonth() + 3) / 3), //季度
                "S": _date.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
    }, _exportMore = {
        /**
         * [getDateRelative 获得相对日期]
         * @param  {[type]} date     [description]
         * @param  {[type]} dayCount [description]
         * @return {[type]}          [description]
         */
        getDateRelative: function (date, dayCount) {
            date.setTime(date.getTime() + dayCount * 24 * 60 * 60 * 1000);
            return date;
        },
        /**
         * [getWeekday ]
         * @param  {[type]} date [description]
         * @return {[type]}      [description]
         */
        getWeekday: function (date) {
            var weekday = date.getDay();
            // console.log('weekday = ' + weekday);
            var dayChineseArray = ['天', '一', '二', '三', '四', '五', '六'];
            var dayChinese = dayChineseArray[weekday];
            // console.log('星期' + dayChinese);
            return '星期' + dayChinese;
        },
        /**
         * [getMonthAndDay 获得日期]
         * @param  {[type]} date [description]
         * @return {[type]}      [description]
         */
        getMonthAndDay: function (date) {
            var month = date.getMonth() + 1;
            var day = date.getDate();
            // console.log(month + '月' + day + '日');
            return month + '月' + day + '日';
        },
        /**
         * [getDateYearMonthDay 获得日期]
         * @param  {[type]} date [description]
         * @return {[type]}      [description]
         */
        getDateYearMonthDay: function (date) {
            var dateStr = date.toLocaleDateString(date);
            dateStr = dateStr.replace(/\//g, '-');
            // console.log(dateStr);
            return dateStr;
        },
        /**
         * [getWeekdayByZhou 获得周几]
         * @param  {[type]} date [description]
         * @return {[type]}      [description]
         */
        getWeekdayByZhou: function (date) {
            var weekday = date.getDay();
            // console.log('weekday = ' + weekday);
            var dayChineseArray = ['天', '一', '二', '三', '四', '五', '六'];
            var dayChinese = dayChineseArray[weekday];
            // console.log('周' + dayChinese);
            return '周' + dayChinese;
        }
    };
    var _export = {
        init: MDate.init, //.bind(this), // .bind(MDate)
        format: MDate.format
    };
    _export = Object.assign ? Object.assign(_export, _exportMore) : $.extend(_export, _exportMore);
    exports = Object.assign ? Object.assign(exports, _export) : $.extend(exports, _export);
});
