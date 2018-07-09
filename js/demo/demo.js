dom.ready(function() {
	// 页面首次加载
	Event.onInit();
    // 监听页面显示
    Event.onShow();
    // 点击事件集合
    Event.clicks();
    // 下拉刷新、上拉加载
    Event.initPullDownRefresh();
    
});

// 事件集合
var Event = {
	onInit: function(){ // 页面首次加载
		
	},
	onShow: function(state){ // 监听页面显示
		!state && state = 'reload';
		
		var currentUser = LS.get('currentUser');
		var _userId = currentUser.id;
		
		var pane0_data = { // 参数
			userId: _userId
		}
		
		var pane0_callback = function() { // 回调
			Load.finish(); // 隐藏加载动画
			
			appcan.v.btns({ // 点击事件
				
			});
		}
		
		Load.loading(); // 展示加载动画
		$('#pane0>ul').trigger(state, {
			data: pane0_data,
			callback: pane0_callback
		});
	},
	clicks: function(){ // 点击事件
		appcan.v.btns({ 
			'#nav-left': function() {  // 关闭当前页面
				closeWin();
			},
		});
	},
	initPullDownRefresh: function(){ // 下拉刷新、上拉加载
		initPullDownRefresh(function() {
	    	Event.onShow('reload');
	    },function(){
	    	Event.onShow('more');
	    },true,true);
	}
}