/**
 * 放置常用的配置信息
 */

// debug模式,发布正式包的时候需要设置为false
var DEBUG = false;
var USE_LOCAL = false; // 是否使用本地服务
// ajax调试模式
var AJAX_DEBUG = false;
var dom = DEBUG ? $(document) : appcan;

var server_path = USE_LOCAL ? '127.0.0.1:8775' : 'http://threebang.com';

var GLOBAL_Pseudo = false; //取本地--伪代码数据标识

//判断平台类型
var winPlat = window.navigator.platform;
var isPhone = !(winPlat == 'Win32' || winPlat == 'Win64' || winPlat == 'MacIntel' || winPlat == 'Linux i686' || winPlat == 'Linux x86_64');
var isAndroid = (window.navigator.userAgent.indexOf('Android') >= 0) ? true : false;
var isIOS = (winPlat == 'iPad' || winPlat == 'iPod' || winPlat == 'iPhone' || winPlat == 'iPod touch');


var constant = {
	version: '0.0.1',
	IMG_PATH: server_path + '/upload/',
	ajaxTimeout: 10 * 1000, // ajax超时时间
	ajaxDelay: 600, // ajax延时时间
	page: 0,
	pagesize: 5, // 单条数据高度大的pagesize
	pagesizebig: 10, // 单条数据高度不太大的pagesize
	pagesizebigger: 15, //单条数据高度小的pagesize
	pagemsgall: '已经是全部数据了', // 数据加载完提示

	// 用户类型
	USERTYPE: {
		SUPERADMIN: 0, //平台管理员 
		ADMIN: 1, //管理员 
		EMPLOYEE: 10, //雇员 
		EMPLOYER: 20, //雇主 
	},
};