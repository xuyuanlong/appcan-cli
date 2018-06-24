var Upload = function (uploadHttp, cb, multi, isFile) {
	this.uploadHttp = uploadHttp;
	this.cb = cb;
	this.multi = multi || 1; // 是否多文件、多图片选择
	this.isFile = isFile || false;
	this.init();
}

Upload.prototype.init = function() {
	this.files = [];
	this.res = [];
	this.currentRotate = [];
	this.fileSuccCount = 0;
	this.fileErrorCount = 0;

	this.ExifImageWidth = [];
	this.ExifImageLength = [];
	this.index = 0;
	this.quality = 0.8;
	this.isCompress = 0; // 图片是否压缩,0表示压缩,非0或者不传表示不压缩

	this.actionSheet();
	
};

Upload.prototype.actionSheet = function () {
	var self = this;
	if (self.isFile) {
		self.fileopen();
	} else {
		uexWindow.cbActionSheet = function(opId, dataType, data) {
			if (uexWidgetOne.platformName == "Simulator" && (data == 0 || data == 1)) {
				Upload.cb({code:0, result:{url:"../../css/img/user_default_header.png"}, data: data});
				return;
			}
			if (data == 0)
				Upload.paiopen();
			else if (data == 1)
				Upload.imgopen();
		}
		uexWindow.actionSheet("", "取消", new Array("拍照", "从本地相册选择"));
	}
}

Upload.prototype.fileopen = function () {
	var self = this;
	self.type = "fileopen";
	if (self.multi) {
		uexFileMgr.multiExplorer("file:///sdcard/", function (err, paths) {
			if(!err){
				self._browserAfter(paths);
			}
		});
	} else {
		uexFileMgr.explorer("file:///sdcard/", function (err, path) {
			if(!err){
				self._browserAfter([path]);
			}
		});
	}
}

Upload.prototype.paiopen = function () {
	var self = this;
	self.type = "paiopen";
	uexCamera.open(self.isCompress, self.quality * 100, function (picPath) {
		self._browserAfter([picPath]);
	});
}

Upload.prototype.imgopen = function () {
	var self = this;
	self.type = "imgopen";
	
    uexImage.openPicker(JSON.stringify({
    	min: 1,
        max: (self.multi || 1),
        quality: self.quality,
        //usePng: true,
        detailedInfo: false
    }), function (error, info) {
    	/**
    	 	info: {
    	 		detailedImageInfo: '', data: ''
    	 	}, 
			detailedImageInfo: {
				localPath:,//String,必选,图片地址
				timestamp:,//Number,可选,图片创建时间的10位时间戳 (此参数读取自图片的EXIF数据,如无法获取或不存在,则无此参数)
				longitude:,//Number,可选,图片拍摄地点的经度 (此参数读取自图片的EXIF数据,如无法获取或不存在,则无此参数)
				latitude:,//Number,可选,图片拍摄地点的纬度 (此参数读取自图片的EXIF数据,如无法获取或不存在,则无此参数)
				altitude:,//Number,可选,图片拍摄地点的海拔 (此参数读取自图片的EXIF数据,如无法获取或不存在,则无此参数)
			}}
    	 */
    	if(error == 0){
    		self._browserAfter(info.data);
    	}
    });
}

Upload.prototype.upload = function () {
	var self = this,
		ExifImageWidth = self.ExifImageWidth[self.index],
		ExifImageLength = self.ExifImageLength[self.index],
		inWidthLimit = 1024,
		inCompress = 1,
		field = self.isFile ? 'fileField' : 'imageField';

	self.uploadHttp += ~self.uploadHttp.indexOf('?') ? '&':'?';
	self.uploadHttp += 'rotate=' + (self.currentRotate[self.index] / 90 % 4);
	self.uploader = uexUploaderMgr.create({
		url: self.uploadHttp,
		type: 1 // uploader类型, 0: 一般上传对象 1: 全局上传对象 2: 后台上传对象.此参数不传时默认为0
	});
		
	if(!self.uploader){
	    $.toast('创建上传对象失败');
	}else{

		if(window.navigator.userAgent.indexOf('iPhone') >= 0){
			inWidthLimit = inWidthLimit*4;
		}

		uexUploaderMgr.uploadFile(self.uploader, self.files[self.index], field, inCompress, inWidthLimit, function (packageSize, percent, response, status) {
			switch (status) {
				case 0:
					percent = parseInt(100/self.files.length)*self.index+parseInt(parseInt(100/self.files.length)/100*percent);
					$.toast(percent + '%');
					break;
				case 1:
					// TODO: response was unkown
					alert(response);
					self._statusAfterFun(true, response, status);
					break;
				case 2:
					self._statusAfterFun(false, response, status);
					break;
				default:
					self._close();
					break;
			}
		});
	}
}

Upload.prototype._close = function () {
	if(self.uploader) uexUploaderMgr.closeUploader(self.uploader);
}

Upload.prototype._statusAfterFun = function (isSucc, res, status) {
	var self = this;
	self._close();

	if (isSucc) {
		// TODO: push the right file array to res
		self.res.push(eval('(' + res + ')'));
		++self.fileSuccCount;
	}else{
		++self.fileErrorCount;
	}
	++self.index;
	if (self.files.length == self.index) {
		var errStr = '',
			showMsg = (self.isFile ? '个文件' : '张照片');

		if (self.fileErrorCount > 0) {
			errStr = "，"+ self.fileErrorCount + showMsg + '上传失败';
		}
		
		$.toast(self.fileSuccCount + showMsg + '上传成功' + errStr);

		self.res.status = status;
		self.callback && self.callback.call(self.res);
	}else{
		self.upload();
	}
}

Upload.prototype._browserAfter = function (data) {
	var self = this;
	self._handleFiles(data);

	if(self.type != 'fileopen'){ // 非附件上传相关(图片上传)
		_.forEach(self.files, function (_img, _index) {
			$('body').append('<img id="UploadRotate" src="'+ _img +'" exif="true" style="display:none;" />');
			var rotateJQ = $('#UploadRotate'),
				orientation = rotateJQ.exif('Orientation');
			self.ExifImageWidth[_index] = rotateJQ.exif('ExifImageWidth');
			self.ExifImageLength[_index] = rotateJQ.exif('ExifImageLength');
			rotateJQ.remove();
			switch(orientation)
			{
				case 1:
					self.currentRotate[_index] = 0;
					break;
				case 6:
					self.currentRotate[_index] = 90;
					break;
				case 3:
					self.currentRotate[_index] = 180;
					break;
				case 8:
					self.currentRotate[_index] = 270;
					break;
				default:
			}
		});
	}

	
	self.upload();
}

Upload.prototype._handleFiles = function (data) {
	var self = this;
	if (self.type == "fileopen") {  //附件相关的上传
		if (self.multi) {
			var json = eval("("+data+")");
            for(var key in json){
                self.files.push(json[key]);
            }
		} else{
			self.files.push(data);
		}
	} else {  //图片相关的上传
		if (self.multi){
			self.files = JSON.parse(data).data;
		}else {
			data = JSON.parse(data).data[0];
			self.files = new Array(data);
		}
	}
}