/* 列表 */
var Service_Demo = new MVVM.Service({
	pretreatment: function(data, option) {
		return JSON.stringify(data);
	},
	dosuccess: function(data, option) {
		return data;
	},
	doerror: function(e, err, option) {
		return e;
	},
	validate: function(data, option) {
		if(parseInt(data.code) === 0)
			return 0;
		else
			return data;
	},
	ajaxCall: function(data, option) {
		if(const.DEBUG) {
			option.success([{
				
			}]);
			return;
		}
		var self = this;
		appcan.request.ajax({
			url: server_path + '',
			type: "POST",
			data: this.pretreatment(data, option),
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function(data) {
				var res = self.validate(data, option);
				if(!res) {
					option.success(self.dosuccess(data.result.results, option));
				} else
					option.error(self.doerror(data, res, option));
			},
			error: function(e, err) {
				option.error(self.doerror(e, err, option));
			}
		});
	}
});

var Model_Demo = MVVM.Model.extend({
	defaults: {
		
	},
	idAttribute: "",
	computeds: {}
})

var Collection_Demo = new(MVVM.Collection.extend({
	initialize: function() {
		return;
	},
	parse: function(data) {
		return data;
	},
	model: Model_Demo,
	sync: function(method, collection, options) {
		switch(method) {
			case "read":
				Service_Demo.request(options.params, options)
				break;
			default:
				break;
		}
	}
}))();

var ViewModel_Demo = new(MVVM.ViewModel.extend({
	el: "#pane0>ul",
	initialize: function() {
		return;
	},
	resetPage: function(param) {
		this.data = {
			appuserId: param.appuserId,
			start: 0,
			count: constant.pagesizebig,
		};
		this.isAll = false;
	},
	addPage: function() {
		this.data.start += constant.pagesize;
	},
	bindingFilters: {},
	events: {
		'reload': function(evt, param) {
			var self = this;
			self.resetPage(param);
			this.collection.fetch({
				params: self.data,
				success: function(cols, resp, options) {
					utils.handleNoDataShow(resp, null, true);
					showLoadingStatus();
					if(resp && resp.length && resp.length == constant.pagesizebig) {
						self.addPage();
					} else {
						self.isAll = true;
					}
				},
				error: function(cols, error, options) {
					global_error(error);
				},
				add: true,
				merge: true,
				remove: true
			})
		},
		'more': function() {
			var self = this;
			if(self.isAll){
				loadingDataAll($('.scrollbox'));
				return;
			}
			this.collection.fetch({
				params: self.data,
				success: function(cols, resp, options) {
					if(resp && resp.length && resp.length == constant.pagesizebig) {
						self.addPage();
						loadingMoreBefore($('.scrollbox'));
					} else {
						self.isAll = true;
						loadingDataAll($('.scrollbox'));
					}
				},
				error: function(cols, error, options) {
					global_error(error);
				},
				add: true,
				merge: true,
				remove: false
			})
		}
	},
	collection: Collection_Demo,
	itemView: MVVM.ViewModel.extend({
		el: $("#pane0>li").prop("outerHTML") || "li",
		events: {},
		bindingFilters: {}
	})
}))();

/* 详情 */
var Service_Detail = new MVVM.Service({
	pretreatment: function(data, option) {
		return JSON.stringify(data);
	},
	dosuccess: function(data, option) {
		return data;
	},
	doerror: function(e, err, option) {
		return e;
	},
	validate: function(data, option) {
		if(parseInt(data.code) === 0)
			return 0;
		else
			return data;
	},

	ajaxCall: function(data, option) {
		if(const.DEBUG) {
			option.success({
				
			});
			return;
		}
		var self = this;
		appcan.request.ajax({
			url: server_path + '/',
			type: "POST",
			data: this.pretreatment(data, option),
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function(data) {
				var res = self.validate(data, option);
				if(!res) {
					option.success(self.dosuccess(data.result, option));
				} else
					option.error(self.doerror(data, res, option));
			},
			error: function(e, err) {
				option.error(self.doerror(e, err, option));
			}
		});
	}
});

var Model_Detail = new(MVVM.Model.extend({
	defaults: {
		
	},
	parse: function(data) {
		return data;
	},
	sync: function(method, collection, options) {
		switch(method) {
			case "read":
				Service_Detail.request(options.params, options)
				break;
			default:
				break;
		}
	}
}))();

var ViewModel_Detail = new(MVVM.ViewModel.extend({
	el: "#pane0",
	initialize: function() {
		return;
	},
	bindingFilters: {},
	model: Model_Detail,
	events: {
		'reload': function(evt, param) {
			var data = {
				
			};
			this.model.fetch({
				params: data,
				success: function(cols, resp, options) {
					
				},
				error: function(cols, error, options) {
					global_error(error);
				},
				add: true,
				merge: true,
				remove: true
			})
		}
	}
}))();

/* 表单 */
var Service_Upsert = new MVVM.Service({
	pretreatment: function(data, option) {
		return JSON.stringify(data);
	},
	dosuccess: function(data, option) {
		return data;
	},
	doerror: function(e, err, option) {
		return e;
	},
	validate: function(data, option) {
		if(parseInt(data.code) === 0)
			return 0;
		else
			return data;
	},
	ajaxCall: function(data, option) {
		var self = this;
		appcan.request.ajax({
			url: server_path + "",
			type: "POST",
			data: this.pretreatment(data, option),
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			success: function(data) {
				var res = self.validate(data, option);
				if(!res) {
					option.success(self.dosuccess(data.result, option));
				} else
					option.error(self.doerror(data, res, option));
			},
			error: function(e, err) {
				option.error(self.doerror(e, err, option));
			}
		});
	}
});

var Model_Upsert = new(MVVM.Model.extend({
	defaults: {

	},
	initialize: function() {
		return;
	},
	parse: function(data) {
		return data;
	},
	validate: function(attrs, options) { //提交之前的校验
		if(attrs.value == "") {
			return "";
		}
		return;
	},
	computeds: {},
	sync: function(method, model, options) {
		switch(method) {
			case "create":
				Service_Upsert.request(this.toJSON(), options);
				break;
			case "update":
				break;
			case "patch":
				break;
			default:
				break;
		}
	},
}))()

var ViewModel_Upsert = new(MVVM.ViewModel.extend({
	el: "#matter",
	events: {},
	initialize: function() {},
	model: Model_Upsert,
	saveModel: function() {
		var self = this;

		var data = {

		};
		this.model.set(data);
		if(!this.model.isValid(data)) {
			appcan.window.openToast(this.model.validationError, 2000);
			return;
		}
		this.model.save(data, {
			success: function(cols, resp, options) {
				utils.handleNoDataShow(resp, null, true);
				showLoadingStatus();
			},
			error: function(cols, error, options) {
				console.log(error);
			}
		});
	}
}))();

