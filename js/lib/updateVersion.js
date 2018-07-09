var Version = {
    update: function(type) {
        // if (uexWidgetOne.platformName == "android") {
        if (uexWidgetOne.platformName != 'Simulator') {
            var data = {}
            $.ajax({
                url: server_path + "/upgrade/androidee.json",
                data: JSON.stringify(data),
                type: "GET",
                success: function(res) {
                    var newVersion = res.version;
                    if (newVersion > constant.version) {
                    	var version = 'V'+res.version;
						$('.newVersion').text(version);
                        $('.newApp').click(function() {
                            if (uexWidgetOne.platformName == "android") {
                                appcan.window.confirm({
                                    title: '提示',
                                    content: "发现新版本，是否更新？\n版本号：" + version,
                                    buttons: ['确定', '取消'],
                                    callback: function(err, data, dataType, optId) {
                                        if (err) {
                                            //如果出错了
                                            return;
                                        }
                                        if (data == 0) {
                                            $("body").append('<div style="position:absolute; top:0px; left:0px; width:100%; height:100%; z-index:9999;"></div>');
                                            Download.download(res.url, "down/ee.apk", function() {
                                                uexWidget.installApp("wgt://data/down/ee.apk");
                                            }, false);

                                        } else if (data == 1) {

                                        }
                                    }
                                });
                            } else {
                                appcan.window.confirm({
                                    title: '提示',
                                    content: "发现新版本，请去App Store更新",
                                    buttons: ['确定'],
                                    callback: function(err, data, dataType, optId) {}
                                });
                            }
                        })

                    } else if (type) {
                        $('.checkNew').text('暂无新版本');
                    }
                },
                error: function(XMLHttpRequest, textStatus) {}
            });
        }
    }
}