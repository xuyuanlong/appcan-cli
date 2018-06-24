/**
 * 数组去重 
 * 调用方法：dedupe(arr) 或 arr.unique
 */

function dedupe(array) {
	var arr = [];
	for(var i = 0, a; a = array[i++];) {
		arr.push(JSON.stringify(a));
	}
	var newArr = [];
	oldArr = Array.from(new Set(arr));
	for(var item of oldArr) {
		newArr.push(JSON.parse(item));
	}
	return newArr;
}

Array.prototype.unique = function() {
	var arr = [],
		obj = {};

	for(var i = 0; i < this.length; i++) {
		if(!obj[this[i]]) {
			arr.push(this[i]);
			obj[this[i]] = 1;
		}
	}
	return arr;
}

/*
 *  方法:Array.remove(dx)
 *  功能:根据元素位置值删除数组元素.
 *  参数:元素值
 *  返回:在原数组上修改数组
 *  作者：pxp
 */
Array.prototype.remove = function(dx) {
	if(isNaN(dx) || dx > this.length) {
		return false;
	}
	for(var i = 0, n = 0; i < this.length; i++) {
		if(this[i] != this[dx]) {
			this[n++] = this[i];
		}
	}
	this.length -= 1;
};

Array.prototype.each = function(callback) {
	if(!this) {
		return false;
	}
	var arr = this,
		len = arr.length;
	if(len > 0) {
		for(var i = 0; i < len; i++) {
			callback && callback.call(this, i, arr[i]);
		}
	}
};


/**
 * 校验类
 */

/** 校验格式是否正确 */

// 校验是否为汉字
function checkChinese(str) {
	var re = /^\s*$/g;
	if(!re.exec(str)) {
		return false;
	} else
		return true;
}

// 校验手机号是否正确
function checkMobile(str) {
	var re = /^(0|86|17951)?(13[0-9]|15[012356789]|17[01678]|18[0-9]|14[57])[0-9]{8}$/;
	if(!re.exec(str)) {
		return false;
	} else
		return true;
}

// 校验固定电话是否正确
function checkMobile2(str) {
	var re = /^(0[0-9]{2,3}\-)([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/;
	if(!re.exec(str)) {
		return false;
	} else
		return true;
}

// 校验图片格式
function checkPhoto(url) {
	var index = url.lastIndexOf('.');
	var photoType = url.substring(index + 1);
	if(photoType != 'jpg' && photoType != 'png' && photoType != 'gif') {
		return false;
	}
	return true;
}

// 校验车牌号
function checkChinese(str) {
	var re = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
	if(!re.exec(str)) {
		return false;
	} else
		return true;
}

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
 * 时间类---------------------------------------------
 */

/** 
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
 * 可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
 * eg:
 * (newDate()).pattern("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423      
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04      
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04      
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04      
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */

Date.prototype.pattern = function(fmt) {
    var o = {
        'M+': this.getMonth() + 1, //月份
        'd+': this.getDate(), //日
        'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时 (12小时制)
        'H+': this.getHours(), //小时 (24小时制)
        'm+': this.getMinutes(), //分
        's+': this.getSeconds(), //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        'S': this.getMilliseconds() //毫秒
    };
    var week = {
        '0': '日',
		'1': '一',
		'2': '二',
		'3': '三',
		'4': '四',
		'5': '五',
		'6': '六'
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[this.getDay() + '']);
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

Date.prototype.getDayCount = function(year, month) {
    if (!year) {
        year = this.getFullYear();
        month = this.getMonth() + 1;
    }

    var count = 0;
    if (month == 2) {
        if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
            count = 29;
        } else {
            count = 28;
        }
    } else if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
        count = 31;
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
        count = 30;
    }
    return count;
}

Date.prototype.equal = function(date) {
    if (this.getFullYear() == date.getFullYear() &&
        this.getMonth() == date.getMonth() &&
        this.getDate() == date.getDate()) {
        return true;
    } else {
        return false;
    }
}

function getDateByCount(date, addDayCount, sign) {
    var dd = new Date(date);
    dd.setDate(dd.getDate() + addDayCount * 1);
    //获取AddDayCount天后的日期

    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;
    //获取当前月份的日期
    var d = dd.getDate();
    if (m < 10) {
        m = '0' + m;
    }
    if (d < 10) {
        d = '0' + d;
    }
    return y + sign + m + sign + d;
}

function getDateTime(timestamp) {
    try {
        var d = timestamp ? new Date(timestamp) : new Date();
        var YYYY = d.getFullYear();
        var MM = d.getMonth() + 1;
        MM = MM < 10 ? '0' + MM : MM;
        var DD = d.getDate();
        DD = DD < 10 ? '0' + DD : DD;

        return {
            date: YYYY + '-' + MM + '-' + DD,
            time: d.toString().split(' ')[4]
        }
    } catch (e) {
        console.log(e);
    }
}

//获取指定月之前的日期
function getSomeMonthAgo(time, day) {
    var arr = time.split('-');
    var differMonth = arr[1] - day;
    var month = differMonth <= 0 ? 12 + differMonth : arr[0];
    var month = differMonth <= 0 ? 12 + differMonth : arr[1] - day;
    var year = differMonth <= 0 ? arr[0] - 1 : arr[0];
    var currentday = arr[2];
    if (month == 2) {
        if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
            currentday = currentday >= 29 ? 29 : currentday;
        } else {
            currentday = currentday >= 28 ? 28 : currentday;
        }
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
        currentday = currentday >= 30 ? 30 : currentday;
    }
    if (month <= 9) {
        month = '0' + month;
    }
    return year + '-' + month + '-' + currentday;
}

//获取当前时间
function getDateTime() {
    var date1 = new Date();
    var year = date1.getFullYear();
    var month = date1.getMonth() + 1;
    var day = date1.getDate();
    var h = date1.getHours();
    var m = date1.getMinutes();
    month = (parseInt(month) < 10 ? '0' : '') + month;
    day = (parseInt(day) < 10 ? '0' : '') + day;
    h = (parseInt(h) < 10 ? '0' : '') + h;
    m = (parseInt(m) < 10 ? '0' : '') + m;
    var currentdate = "当前时间：" + year + "年" + month + "月" + day + "日" + " " + h + "点" + m + "分";
    return currentdate;
}

// 时分转成小时
function transformToHour(time) {
    if (!time) return;
    var timeArr = time.split(':');
    var hour = timeArr[0],
        min = timeArr[1]
    var minToHourr = min / 60;
    return parseInt(hour) + minToHourr;
}

var transformHelp = {
    /**
     * 根据日期获取相隔天数
     * @param  {[type]} date1 [开始日期]
     * @param  {[type]} date2 [结束日期]
     * @return {[type]}       [相差天数]
     */
    dateToDayDiff: function(date1, date2) {
        if (!date1 || !date2) return 0;
        var diff = (new Date(date2) - new Date(date1)) / (24 * 60 * 60 * 1000);
        return diff >= 0 ? diff + 1 : 0;
    },
    /**
     * 根据时间获取相隔小时
     * @param  {[type]} time1 [开始时间]
     * @param  {[type]} time2 [结束时间]
     * @return {[type]}       [小时间隔]
     */
    dateToHourDiff: function(time1, time2) {
        if (!time1 || !time2) return 0;
        var curr_day = new Date().pattern('yyyy-MM-dd'),
            work_hour = (new Date(curr_day + ' ' + time2) - new Date(curr_day + ' ' + time1)) / (1000 * 60 * 60);
        if (isNaN(work_hour)) work_hour = 0
        return work_hour;
    },
    /**
     * 获取指定小时之前的时间
     * @param  {[Date]} data [时间]
     * @param  {[Number]} num  [小时]
     * @return {[Date]}      [时间]
     */
    getTimeBefor: function(dateTime, num) {
        if (!num) return dateTime;
        var dateArr = dateTime.split(' ')[0],
            timeArr = dateTime.split(' ')[1];
        var year = dateArr.split('-')[0],
            month = dateArr.split('-')[1],
            day = dateArr.split('-')[2],
            h = timeArr.split(':')[0],
            m = timeArr.split(':')[1];
        if (h - num < 0) {
            h = 24 - num + h;
            day -= 1;
            if (day <= 0) {
                if (month - 1 <= 0) {
                    month = 12;
                    year -= 1;
                    day = 31;
                } else {
                    var count = new Date(dateTime).getDayCount(year, month - 1);
                    day = count;
                }
            }
        } else {
            h -= num;
        }
        if (h < 10) h = '0' + h;
        if (m < 10) m = '0' + m;
        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;
        return year + '-' + month + '-' + day + ' ' + h + ':' + m;
    },
    /**
     * [isToday 判断是不是今天的日期]
     * @param  {[type]}  otherDate [description]
     * @return {Boolean}           [description]
     */
    isToday: function(otherDate) {
        if (!otherDate) return false;
        var date = new Date();
        var date2 = new Date(otherDate);
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var year2 = date2.getFullYear();
        var month2 = date2.getMonth();
        var day2 = date2.getDate();

        if (year == year2 && month == month2 && day == day2) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * [timeToHour 毫秒数转换成时分]
     * @param  {[type]} time [毫秒数]
     * @return {[type]}      [时分对象]
     */
    timeToHour: function(time) {
        var hours = time/(1000*60*60).toFixed(6);
        var hourArr = String(hours).split('.');
        var hourObj = {
            hour: hourArr[0],
            min: Math.ceil(hours%1*60)
        }
        return hourObj;
    },
    addZero: function(num) {
        var num = ~~num;
        if (num < 10) return '0' + num;
        return num;
    },
    splitAndZero: function(date) {
        if(!date) return;
        var dateArr = date.split('-');
        if(dateArr[1]<10 &&dateArr.indexOf('0') == -1) {
            dateArr[1] = '0'+dateArr[1];
        }
        if (dateArr[2]<10 &&dateArr.indexOf('0') == -1) {
            dateArr[2] = '0'+dateArr[2];
        }
        return dateArr[0]+'-'+dateArr[1]+'-'+dateArr[2];
    }
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

/**
 * 弹窗类-------------------------------------------------------
 */

/** 提示 alert、toast、confirm ... */

//关闭toast
function closeToast() {
	//uexWindow.destroyProgressDialog();
	//return;
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
		content: argOne
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
 *字符串处理----------------------------------------------
 * 
 */
/** 字符串限制长度 超出部分隐藏显示... */

function sliceString(str, max) {
	if(!str || str.length == 0)
		return "";
	if(!max)
		max = 20;
	if(str.length > max) {
		str = str.substring(0, max);
		str += "...";
	}
	return str;
}

function array(n) {
	for(i = 0; i < n; i++) this[i] = 0;
	this.length = n;
}








