(function($) {
    function isWindows() {
        if(window.navigator.platform == "Win32") return true;
        if (!('ontouchstart' in window))
            return true;
    }

    var touchEnd = isWindows() ? 'MSPointerUp pointerup mouseup' : 'touchend MSPointerUp pointerup';

    var scrollBoxConfig = Backbone.Model.extend({
        defaults : {
            "bounce" : 1
        }
    });
    var scrollView = Backbone.View.extend({//options...
        initialize : function(option) {
            var $el = this.$el = option.$el;
            this.bounceBox = $(".scrollbox", this.$el);
            this.bounceHeight = $(".box_bounce", this.bounceBox).height();
            this.bounceStatus = $(".bounce_status", this.bounceBox);
            $el[0].scrollView = this;
            this.render();
            this.listenTo(this.model, "change:bounce", function(data) {
                data.changed.bounce && !this.bounceStatus.hasClass("active") && this.bounceStatus.addClass("active");
                !data.changed.bounce && this.bounceStatus.hasClass("active") && this.bounceStatus.removeClass("active");
            })
            this.listenTo(this.model, "change:percent", function(data) {
                var switchBounce = this.model.get("bounce");
                var bounceStatus = this.model.get("bounceStatus");
                var percent = data.changed.percent;
                switchBounce == 1 && percent > 30 && bounceStatus != 1 && this.model.set("bounceStatus", 1);
                switchBounce == 1 && percent <= 30 && bounceStatus != 0 && this.model.set("bounceStatus", 0);
            })
            this.listenTo(this.model, "change:bounceStatus", function(data) {
                if (this.model.get("bounce") == 1) {
                    if (data.changed.bounceStatus == 1)
                        (this.bounceStatus.removeClass("active"), $(this.bounceStatus[1]).addClass("active"), this.trigger("dragToReload"));
                    else if (data.changed.bounceStatus == 0)
                        (this.bounceStatus.removeClass("active"), $(this.bounceStatus[0]).addClass("active"));
                    else if (data.changed.bounceStatus == 2) {(this.bounceStatus.removeClass("active"), $(this.bounceStatus[2]).addClass("active"));
                        this.bounceBox.css("-webkit-transform", "translate3d(0px," + this.bounceHeight * 0.33 + "px,0px)");
                        this.trigger("releaseToReload");
                    }
                }
            })
        },
        reset : function() {
            this.model.set("bottomStatus", "0");
            if (this.bounceBox) {
                var self = this;
                var switchBounce = this.model.get("bounce");
                this.model.set("bounceStatus", "0");
                self.bounceBox.css("-webkit-transform", "translate3d(0px," + 0 + "px,0px)");
            }
        },
        hide : function() {
            this.model.set("bounce", 0);
            this.bounceStatus.removeClass("active")
        },
        show : function() {
            this.model.set("bounce", 1);
            $(this.bounceStatus[0]).addClass("active");
        },
        reload : function() {
            if (this.bounceBox) {
                !this.bounceBox.hasClass("utra") && this.bounceBox.addClass("utra");
                var switchBounce = this.model.get("bounce");
                this.model.set("bounceStatus", "2");
            }
        },
        render : function() {
            var self = this;
            var $el = this.$el;
            if (this.model.get("bounce") != 1) {
                this.bounceStatus.removeClass("active");
            }
            self.$el.on("swipeMoveDown", function(e, _args) {
                self.bounceHeight = $(".box_bounce", self.bounceBox).height();
                if (!e._args)
                    e._args = _args;
                if ($el.scrollTop() == 0) {
                    self.bounceBox.hasClass("utra") && self.bounceBox.removeClass("utra");
                    var bounceStatus = self.model.get("bounceStatus");
                    if (bounceStatus == 2) {
                        self.trigger("onReloading", bounceStatus);
                        return;
                    }
                    var percent = parseInt(e._args.dy / 3 * 100 / self.bounceHeight);
                    self.bounceBox.css("-webkit-transform", "translate3d(0px," + e._args.dy / 3 + "px,0px)");
                    e._args.e.preventDefault();
                    self.trigger("draging", {
                        percent : percent
                    });
                    self.model.set("percent", percent);
                }
            })
            self.$el.on(touchEnd, function(e) {
                if ($el.scrollTop() == 0) {
                    if (self.bounceBox) {
                        !self.bounceBox.hasClass("utra") && self.bounceBox.addClass("utra");
                        var status = self.model.get("bounceStatus");
                        if (!status || status == 0) {
                            self.trigger("release", {});
                            self.reset();
                        } else if (status == 1) {
                            self.reload();
                        }
                    }
                }
            })
            var scrollContainer = $el;
            if ($el[0].tagName == "BODY")
                scrollContainer = $(document);
            scrollContainer.on("scroll", function() {
                if (self.bounceBox) {
                    var h = self.bounceBox.height();
                    var ch = $el.height();
                    if ($el.scrollTop() + ch >= h - 50) {
                        var bottomStatus = self.model.get("bottomStatus");
                        if (bottomStatus != 1) 
                        {
                            self.model.set("bottomStatus", "1");
                            self.trigger("scrollbottom");
                        }
                    }
                }
            })
        }
    });
    $.scrollbox = function($el, option) {
        if ($el[0].scrollView) {
            $el[0].scrollView.model.set(option);
            return $el[0].scrollView;
        }
        var opt = _.extend({}, option);
        var model = new scrollBoxConfig(opt);
        return new scrollView({
            $el : $el,
            model : model
        });
    }
})($)


//滚动view的实例
var scrollViewInstance;

/**
 * 初始化下拉刷新
 *
 * @param pullDownRefreshCallback 下拉刷新的回调
 * @param pullUpLoadingCallback 上拉到底部的回调
 * @param isShowTips 是否显示提示语
 */
function initPullDownRefresh(pullDownRefreshCallback, pullUpLoadingCallback, isShowTips,ifHideAtuoLoading) {
    var $el = $("body");
    var isShowTipsCurrent = true;
    if (isShowTips != null) {
        isShowTipsCurrent = isShowTips;
    }
    scrollViewInstance = $.scrollbox($el);
    scrollViewInstance.off().on("releaseToReload", function(){
        // pullDownRefreshCallback();
        // if(GLOBAL_Pseudo){
            endPullDownRefreshLately(1000);
        // }
    }).on("onReloading", function (a) {//if onreloading status, drag will trigger this event
    }).on("dragToReload", function () {//到达下拉刷新的边界 drag over 30% of bounce height,will trigger this event
    }).on("draging", function (percent) {//正在下拉on draging, this event will be triggered.
    }).on("scrollbottom", function() {
        pullUpLoadingCallback();
    });
    if (!ifHideAtuoLoading) {
        pullDownRefresh();
    };
    if (isShowTipsCurrent == false) {
        scrollViewInstance.hide();
        return;
    }

    //提示语
    // var STR_DRAG_FLASH = languages.getString("STR_DRAG_FLASH");
    // var STR_RELEASE_FLASH = languages.getString("STR_RELEASE_FLASH");
    // var STR_LOAD_MORE = languages.getString("STR_LOAD_MORE");
    //这里可以定义下拉的样式
    $('#draging').html('下拉刷新');
    $('#dragToReload').html('释放刷新');
    $('#releaseToReload').html('刷新中...');
}

/**
 * 主动调用下拉刷新
 */
function pullDownRefresh() {
    scrollViewInstance && scrollViewInstance.reload();
}

/**
 * 禁止上拉加载
 */

function disablePullUp () {
    disablePullUpStatus = true;
}

/**
 * 允许上拉加载
 */

function enablePullUp() {
    disablePullUpStatus = false;
} 

/**
 * 延时结束下拉刷新
 */
function endPullDownRefreshLately(timeout) {
    setTimeout(function () {
        $('#draging').html('');
        scrollViewInstance && scrollViewInstance.reset();
    }, timeout);
}

/**
 * 结束下拉刷新
 */
function endPullDownRefresh() {
    scrollViewInstance && scrollViewInstance.reset();
}

/**
 * [disableRefresh 禁止下拉]
 * @return {[type]} [description]
 */
function disableRefresh() {
    scrollViewInstance.stopBounce = true;
    endPullDownRefresh();
}


/**
 * [enableRefresh 使下拉可用]
 * @return {[type]} [description]
 */
function enableRefresh() {
    scrollViewInstance.stopBounce = false;
}

function loadingMoreBefore ($el) {
    var loadingMoreHtml = '<div class="ub ub-ver ub-pc" id="dragmore"><div class="ub-f1 ub ub-pc ub-ac">';
        loadingMoreHtml += '<div class="loading active ub-ac ub-pc">';
        loadingMoreHtml +=  '正在加载</div></div></div>';
    $('#dragmore').remove();
    $el.append(loadingMoreHtml);
}

var removeDrag;

function loadingDataAll ($el,fund) {
    if (fund) {
       return toast('已经是全部了',3000,'middle',0);
    }
    clearTimeout(removeDrag);
    var loadingMoreHtml = '<div class="ub ub-pc" id="dragmore"><div class="ub ub-f1 ub-pc ub-ac">';
        loadingMoreHtml += '<div class="ub">';
        loadingMoreHtml +=  '已经是全部了</div></div></div>';
    $('#dragmore').remove();
    $el.append(loadingMoreHtml); 
    
     
    removeDrag = setTimeout(function(){
        $('#dragmore').remove();
    }, 3600);
}

function showLoadingStatus($el) {
    if(!$el) $el = $('.scrollbox');
    var doc_height = $(document).height();
    var win_height = $(window).height();
    if (doc_height > win_height + 50 && !$('#error_msg').hasClass('active'))
        loadingMoreBefore($el);
}
