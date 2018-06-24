var JPush = {
	//推送初始化方法
	init: function() {
		//收到自定义消息回调
		uexJPush.onReceiveMessage = function(data) {
			// alert("自定义消息回调"+data);
		}
		//收到通知回调
		uexJPush.onReceiveNotification = function(data) {
			if(!data) return;
			
			// alert("通知回调"+data);
			var data = eval('(' + data + ')');
			if(!data || !data.extras || !data.extras.pushtype) return;
			var _tempId = data.extras.pushtype;
		}
		//用户点击通知后执行
		uexJPush.onReceiveNotificationOpen = function(data) {
			if(!data) return;
			
			//alert("通知后执行"+data);
			var data = eval('(' + data + ')');
			if(!data || !data.extras || !data.extras.pushtype) return;
			var _tempId = data.extras.pushtype;

			var obj = {
				tempId: _tempId,
				taskId: data.extras.taskId || ''
			}

			getSystemMsg(obj);

		}
		//设置别名回调
		uexJPush.cbSetAlias = function(data) {
			//alert("别名回调:"+data);
		}
		//设置标签回调
		uexJPush.cbSetTags = function(data) {
			//alert("标签回调:"+data);
		}
		//同时设置别名与标签
		uexJPush.cbSetAliasAndTags = function(data) {
			//alert("别名与标签:"+data);
		}
	},
	//设置标签和别名一起
	setAliasAndTags: function(alias, tags) {
		var json = {
			alias: alias,
			tags: tags
		};
		uexJPush.setAliasAndTags(json, function(error, data) {
			if(!error) {
				//alert(JSON.stringify(data));
			} else {
				//alert("设置失败");
			}
		});
	},
	//设置别名--空字符串取消
	setAlias: function(alias) {
		var json = {
			alias: alias
		};
		uexJPush.setAlias(json, function(error, data) {
			if(!error) {
				//alert("alias:"+JSON.stringify(data));
			} else {
				//alert("设置失败");
			}
		});
	},
	//设置标签--空数组取消
	setTags: function(tags) {
		var tags = new Array("youxian2");
		var json = {
			tags: tags
		};
		uexJPush.setTags(json, function(error, data) {
			if(!error) {
				//alert("tags:"+JSON.stringify(data));
			} else {
				//alert("设置失败");
			}
		});
	},
	//停止推送
	stopPush: function() {
		if(uexWidgetOne.platformName != "Simulator") {
			uexJPush.stopPush();
		}
	},
	//恢复推送
	resumePush: function() {
		if(uexWidgetOne.platformName != "Simulator") {
			uexJPush.resumePush();
		}
	}

}