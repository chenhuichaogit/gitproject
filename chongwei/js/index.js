//leyui首先申明要使用的模块。
var $,tab,skyconsWeather;
layui.config({
	base : "js/"
}).use(['bodyTab','form','element','layer','jquery'],function(){
	var form = layui.form(),
		layer = layui.layer,
		element = layui.element();
		$ = layui.jquery;
		tab = layui.bodyTab();

	$(document).on('keydown', function() {
		if(event.keyCode == 13) {
			$("#unlock").click();
		}
	});

	//手机设备的简单适配
	var treeMobile = $('.site-tree-mobile'),
		shadeMobile = $('.site-mobile-shade')

	treeMobile.on('click', function(){
		$('body').addClass('site-mobile');
	});

	shadeMobile.on('click', function(){
		$('body').removeClass('site-mobile');
	});

	// 添加新窗口
	//当点击菜单栏内的二级菜单弹出新窗口
	$(".layui-nav .layui-nav-item a").on("click",function(){
		addTab($(this));
		//当点击其中的li让其他的li移出二级菜单
		$(this).parent("li").siblings().removeClass("layui-nav-itemed"); 
   	    	 var a = $(this).find(".jiantou").hasClass("down");
   	    	if(a){
   	    		$(this).find(".jiantou").removeClass("down");
  
   	    	}else{
   	    		 $(this).find(".jiantou").addClass("down");
  };
		
		 $(this).parent("li").siblings().find(".jiantou").removeClass("down");
	})

	//公告层
	function showNotice(){
		layer.open({
	        type: 1,
	        title: "系统公告", //不显示标题栏
	        closeBtn: false,
	        area: '310px',
	        shade: 0.8,
	        id: 'LAY_layuipro', //设定一个id，防止重复弹出
	        btn: ['火速围观'],
	        moveType: 1, //拖拽模式，0或者1
	        content: '<div style="padding:15px 20px; text-align:justify; line-height: 22px; text-indent:2em;border-bottom:1px solid #e2e2e2;"><p>沃能充电管理系统</p><p>沃能充电</p></div>',
	        success: function(layero){
				var btn = layero.find('.layui-layer-btn');
				btn.css('text-align', 'center');
				btn.on("click",function(){
					window.sessionStorage.setItem("showNotice","true");
				})
				if($(window).width() > 432){  //如果页面宽度不足以显示顶部“系统公告”按钮，则不提示
					btn.on("click",function(){
						layer.tips('系统公告躲在了这里', '#showNotice', {
							tips: 3
						});
					})
				}
	        }
	    });
	}
	
	
	//刷新后还原主内容打开的窗口   
	//如果浏览器的临时存储里面存在 menu，且不为空 则执行以下代码
	if(window.sessionStorage.getItem("menu") != null){
		
		/*示例1：此示例使用 JSON.parse 将 JSON 字符串转换为对象  
    var jsontext = '{"firstname":"Jesper","surname":"Aaberg","phone":["555-0100","555-0120"]}';  
    var contact = JSON.parse(jsontext);  
    document.write(contact.surname + ", " + contact.firstname + ", "+ contact.phone);  */
		menu = JSON.parse(window.sessionStorage.getItem("menu"));
		curmenu = window.sessionStorage.getItem("curmenu");
		var openTitle = '';
		for(var i=0;i<menu.length;i++){
			openTitle = '';
			if(menu[i].icon.split("-")[0] == 'icon'){
				openTitle += '<i class="iconfont '+menu[i].icon+'"></i>';
			}else{
				openTitle += '<i class="layui-icon">'+menu[i].icon+'</i>';
			}
			openTitle += '<cite>'+menu[i].title+'</cite>';
			openTitle += '<i class="layui-icon layui-unselect layui-tab-close" data-id="'+menu[i].layId+'">&#x1006;</i>';
			element.tabAdd("bodyTab",{
				title : openTitle,
		        content :"<iframe src='"+menu[i].href+"' data-id='"+menu[i].layId+"'></frame>",
		        id : menu[i].layId
			})
			//定位到刷新前的窗口
			if(curmenu != "undefined"){
				if(curmenu == '' || curmenu == "null"){  //定位到后台首页
					element.tabChange("bodyTab",'');
				}else if(JSON.parse(curmenu).title == menu[i].title){  //定位到刷新前的页面
					element.tabChange("bodyTab",menu[i].layId);
				}
			}else{
				element.tabChange("bodyTab",menu[menu.length-1].layId);
			}
		}
	}

})

//打开新窗口
function addTab(_this){
	tab.tabAdd(_this);
}

function time(){
	var today = new Date();
	var week = today.getDay();
	var day = today.getDate();
	var mon = today.getMonth()+1;
	var year = today.getFullYear();
	var hour = today.getHours();
	var mint = today.getMinutes();
	var sec = today.getSeconds();
	function buwei(i){
                   if(i<=9){i="0"+i;
                   }
                   else {
                       i;
                   }

                   return i;
               }
	$("#tp_date").html(
	"<span>"+hour+":"+buwei(mint)+"</span><br/><span>"+year+"."+mon+"."+day+"</span>");}
 setInterval(time,1000);



