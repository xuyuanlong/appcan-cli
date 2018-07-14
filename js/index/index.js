dom.ready(function(){

	appcan.button("#nav-left", "btn-act",function() {});
    appcan.button("#nav-right", "btn-act",function() {});
    
    var Index = {
    	home: function() {

    		initPullDownRefresh(function(){},function(){
        
    		},true,true)
    	},
    	work: function() {
    		
    	},
    	message: function() {

    	},
    	mine: function() {
    		console.log('111');
    		disableRefresh();
    	}

    }
    Index.home();
	$('.memu_item').click(function() {
    	var _this = $(this),
    		_index = $(this).index();
    	$('.memu_item').removeClass('menu_active');
    	_this.addClass('menu_active');
    	$('.pane').addClass('uhide');
    	$('#pane'+_index).removeClass('uhide');
    	$('.menu_img_d').removeClass('uhide');
    	$('.menu_img_s').addClass('uhide');
    	_this.find('.menu_img_d').addClass('uhide');
    	_this.find('.menu_img_s').removeClass('uhide');

    	switch (_index) {
    		case 0:
    			Index.home();
    		case 1:
    			Index.work();
    		case 2:
    			Index.message();
    		case 3: 
    			Index.mine();
    	}
    })
})
    