/*
直接上传文件:

QPhoto.init(server_path + '/upload?updatephoto=true', function(res) {

}, 3, null, {
	isUploadFileDirect: true, 
	directFiles: ['test.mp3', 'test1.mp3', 'test2.mp3']
});

*/
var QPhoto = {
	init: function(uploadHttp, cb, multi, isFile, opts) {
		QPhoto.multi = multi;

		QPhoto.files = new Array();
		QPhoto.res = new Array();
		QPhoto.currentRotate = new Array();
		QPhoto.fileSuccCount = 0;
		QPhoto.fileErrorCount = 0;
		QPhoto.uploadHttp = uploadHttp;
		QPhoto.cb = cb;
		QPhoto.isFile = isFile;

		QPhoto.ExifImageWidth = new Array();
		QPhoto.ExifImageLength = new Array();

		QPhoto.index = 0;

		if(opts) {
			QPhoto.isUploadFileDirect = opts.isUploadFileDirect;
		}

		if(QPhoto.isUploadFileDirect) {
			QPhoto.type = "fileopen";
			QPhoto.directFiles = opts.directFiles || [];
			QPhoto.browserAfter(null, null, QPhoto.directFiles);
		} else if(isFile) {
			QPhoto.fileopen();
		} else {
			uexWindow.cbActionSheet = function(opId, dataType, data) {
				if(uexWidgetOne.platformName == "Simulator" && (data == 0 || data == 1)) {
					QPhoto.cb({
						code: 0,
						result: {
							url: "../../css/images/search.png"
						},
						data: data
					});
					return;
				}
				if(data == 0)
					QPhoto.paiopen();
				else if(data == 1)
					QPhoto.imgopen();
			}
			uexWindow.actionSheet("", "取消", new Array("拍照", "从本地相册选择"));
		}
	},
	paiopen: function() {
		QPhoto.type = "paiopen";
		// uexCamera.cbOpen = QPhoto.browserAfter;
		if(isIOS) {
			uexCamera.openInternal(0, 100, function(fpath) {
				var obj = {
					data: [fpath]
				}
				QPhoto.browserAfter(null, null, JSON.stringify(obj));
			});
		} else {
			uexCamera.cbOpen = function(a, b, fpath) {
					var obj = {
						data: [fpath]
					}
					QPhoto.browserAfter(null, null, JSON.stringify(obj));
				}
				// uexCamera.cbOpen = QPhoto.browserAfter;
			uexCamera.open();
		}

	},
	imgopen: function() {
		QPhoto.type = "imgopen";
		uexImage.onPickerClosed = function(info) {
			if(!JSON.parse(info).isCancelled) {
				QPhoto.browserAfter(null, null, info);
			}
		}
		var data = {
			min: 1,
			max: 1,
			quality: 0.8,
			// usePng:true,
			detailedInfo: false
		}
		if(QPhoto.multi)
			data = {
				min: 1,
				max: QPhoto.multi,
				quality: 0.8,
				// usePng:true,
				detailedInfo: false
			}
		var json = JSON.stringify(data);
		uexImage.openPicker(json);

	},
	fileopen: function() {
		QPhoto.type = "fileopen";
		if(QPhoto.multi) {
			uexFileMgr.cbMultiExplorer = QPhoto.browserAfter;
			uexFileMgr.multiExplorer("file:///sdcard/");
		} else {
			uexFileMgr.cbExplorer = QPhoto.browserAfter;
			uexFileMgr.explorer("file:///sdcard/");
		}
	},
	upload: function() {
		var randOpId = Math.floor(Math.random() * (1000 + 1));
		var statusAfterFun = function(opCode, isSucc, res, status) {
			// alert(QPhoto.index+"---->"+isSucc);
			// alert("opCode-->"+opCode);
			uexUploaderMgr.closeUploader(opCode);
			if(isSucc) {
				QPhoto.res.push(eval('(' + res + ')'));
				++QPhoto.fileSuccCount;
			} else {
				++QPhoto.fileErrorCount;
			}
			++QPhoto.index;
			if(QPhoto.files.length == QPhoto.index) {
				var errStr = "";
				if(QPhoto.fileErrorCount > 0) {
					if(QPhoto.isFile)
						errStr = "，" + QPhoto.fileErrorCount + "个语音上传失败";
					else
						errStr = "，" + QPhoto.fileErrorCount + "张照片上传失败";
				}
				uexWindow.closeToast();
				// if(QPhoto.isFile)
				// uexWindow.toast("0", "5", QPhoto.fileSuccCount + "个文件上传成功" + errStr, 3000);
				// else
				if(!QPhoto.isFile)
					uexWindow.toast("0", "5", QPhoto.fileSuccCount + "张照片上传成功" + errStr, 3000);
				QPhoto.res.status = status;
				QPhoto.cb(QPhoto.res);
			} else
				QPhoto.upload();
		}
		uexUploaderMgr.onStatus = function(opCode, fileSize, percent, response, status) {
			switch(status) {
				case 0:
					if(!QPhoto.isFile) {
						percent = parseInt(100 / QPhoto.files.length) * QPhoto.index + parseInt(parseInt(100 / QPhoto.files.length) / 100 * percent);
						uexWindow.toast("0", "5", percent + "%", 0);
					}
					break;
				case 1:
					statusAfterFun(opCode, true, response, status);
					break;
				case 2:
					//alert("fileSize-->"+fileSize);
					//alert("percent-->"+percent);
					//alert("response-->"+response);
					//alert("status-->"+status);
					statusAfterFun(opCode, false, response, status);
					break;
				default:
					uexUploaderMgr.closeUploader(opCode);
					break;
			}
		}
		uexUploaderMgr.cbCreateUploader = function(opCode, dataType, data) {
			if(data == 0) {
				var ExifImageWidth = QPhoto.ExifImageWidth[QPhoto.index];
				var ExifImageLength = QPhoto.ExifImageLength[QPhoto.index];
				var inWidthLimit = 9999;
				// if (ExifImageWidth > 1024 && ExifImageLength > 1024)
				inWidthLimit = 1024;

				var inCompress = 1;
				if(QPhoto.uploadHttp.indexOf("/users/updatephoto") >= 0)
					inWidthLimit = 200;

				var isIphone = (window.navigator.userAgent.indexOf('iPhone') >= 0) ? true : false;
				if(isIphone)
					inWidthLimit = inWidthLimit * 4;

				uexUploaderMgr.uploadFile(opCode, QPhoto.files[QPhoto.index], "file", inCompress, inWidthLimit);
			} else {
				uexWindow.closeToast();
				alert("创建上传对象失败");
			}
		}
		if(!QPhoto.isFile) {
			uexWindow.toast('1', '5', '正在上传...', '');
		}
		//alert("randOpId-->"+randOpId);
		//alert("QPhoto.uploadHttp-->"+QPhoto.uploadHttp);
		QPhoto.uploadHttp += (QPhoto.uploadHttp.indexOf("?") >= 0) ? "&" : "?";
		QPhoto.uploadHttp += "rotate=" + (QPhoto.currentRotate[QPhoto.index] / 90 % 4);
		uexUploaderMgr.createUploader(randOpId, QPhoto.uploadHttp);
	},
	browserAfter: function(opCode, dataType, data) {
		if(QPhoto.type == "fileopen") { //附件相关的上传
			if(QPhoto.multi) {
				//var json = eval("("+data+")");
				for(var key in data) {
					QPhoto.files.push(data[key]);
				}
			} else
				QPhoto.files.push(data);
		} else { //图片相关的上传
			if(QPhoto.multi) {
				QPhoto.files = JSON.parse(data).data;
				// data = data.replace("[", "");
				// data = data.replace("]", "");
				// if (data.indexOf(", ") >= 0)
				// 	QPhoto.files = data.split(", ");
				// else
				// 	QPhoto.files = data.split(",");
			} else {
				data = JSON.parse(data).data[0];
				QPhoto.files = new Array(data);
			}

			for(var i = 0; i < QPhoto.files.length; ++i) {
				$("body").append('<img id="UploadRotate" src="' + QPhoto.files[i] + '" exif="true" class="hide" />');
				var orientation = $("#UploadRotate").exif("Orientation");
				$("#UploadRotate").remove();
				// alert("orientation---->>>>"+orientation);
				QPhoto.ExifImageWidth[i] = $("#UploadRotate").exif("ExifImageWidth");
				QPhoto.ExifImageLength[i] = $("#UploadRotate").exif("ExifImageLength");
				switch(orientation) {
					case 1:
						QPhoto.currentRotate[i] = 0;
						break;
					case 6:
						QPhoto.currentRotate[i] = 90;
						break;
					case 3:
						QPhoto.currentRotate[i] = 180;
						break;
					case 8:
						QPhoto.currentRotate[i] = 270;
						break;
					default:
				}
			}
		}
		QPhoto.upload();
	}
}