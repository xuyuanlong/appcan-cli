/*
 * 常用处理方法
 */
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
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
	}
	if(/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[this.getDay() + '']);
	}
	for(var k in o) {
		if(new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

Date.prototype.getDayCount = function(year, month) {
	if(!year) {
		year = this.getFullYear();
		month = this.getMonth() + 1;
	}

	var count = 0;
	if(month == 2) {
		if((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
			count = 29;
		} else {
			count = 28;
		}
	} else if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
		count = 31;
	} else if(month == 4 || month == 6 || month == 9 || month == 11) {
		count = 30;
	}
	return count;
}

Date.prototype.equal = function(date) {
	if(this.getFullYear() == date.getFullYear() &&
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
	if(m < 10) {
		m = '0' + m;
	}
	if(d < 10) {
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
	} catch(e) {
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
	if(month == 2) {
		if((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
			currentday = currentday >= 29 ? 29 : currentday;
		} else {
			currentday = currentday >= 28 ? 28 : currentday;
		}
	} else if(month == 4 || month == 6 || month == 9 || month == 11) {
		currentday = currentday >= 30 ? 30 : currentday;
	}
	if(month <= 9) {
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


/**
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

// 小于10的数字前面加个0
function lessTen(num) {
	var newNum = parseInt(num);
	if(newNum < 10) {
		newNum = '0' + newNum;
	}
	return newNum;
}