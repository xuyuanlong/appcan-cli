var Download = {
    DOWNLOAD: "wgt://data/",
    downloadPath: "",
    savedPath: "",
    callback: null,
    download: function(downloadPath, savedPath, callback, resume) {
        Download.downloadPath = downloadPath;
        Download.savedPath = Download.DOWNLOAD+savedPath;
        Download.callback = callback;
        Download.resume = resume ? "1":"0";

        
        //创建下载对象的回调方法
        if(uexWidgetOne.platformName == "android") {  //android4.0使用uexDownloadMgr4.0，接口和3.x不同
            var downloader = uexDownloaderMgr.create();
            if(!downloader)
                alert("创建下载失败!");
            else{
                var headJson = '{"Content-type":"application/octet-stream"}';
                uexDownloaderMgr.setHeaders(downloader, headJson);
                uexDownloaderMgr.download(downloader, Download.downloadPath, Download.savedPath, Download.resume,
                    function(fileSize, percent, status){
                        switch (status) {
                            case 0:
                                uexWindow.toast("1", "5", "正在下载："+percent + "%", "0");;
                            break;
                            case 1:
                                confirm2(function() {
                                    uexDownloaderMgr.closeDownloader(downloader);//下载完成要关闭下载对象
                                    Download.callback(status);
                                },"下载完成，准备打开",'提示',['确定'])
                                // uexWindow.toast("0", "5", "下载完成，准备打开", "2000");
                                break;
                            case 2:
                                alert("下载失败");
                                uexDownloaderMgr.closeDownloader(downloader);//下载失败要关闭下载对象
                          break;
                        }
                    }
                );  
            }
        }
    },
}