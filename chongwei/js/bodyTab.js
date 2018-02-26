/*

	@Description: 点击对应按钮添加新窗口  并将当前窗口以及打开的所有窗口数据存贮的在sessionstorage里面，以便点击刷新重新回到本页面
*/
var tabFilter,menu=[],liIndex,curNav,delMenu;
layui.define(["element","jquery"],function(exports){
	var element = layui.element(),
		$ = layui.jquery,
		layId,
		Tab = function(){
			this.tabConfig = {
				closed : true,
				openTabNum : 10,
				tabFilter : "bodyTab"
			}
		};//设置主体内容tab数量，以及关闭按键是否开启 

	//显示左侧菜单
	if($(".navBar").html() == ''){
	//	var _this = this;
		$(".navBar").html(navBar(navs)).height($(window).height()-100); //获取当前浏览器的窗口的高度-100px
		element.init();  //初始化页面元素
		$(window).resize(function(){   //利用resize（）方法，对浏览器窗口大小发生变化的时候进行响应
			$(".navBar").height($(window).height()-100);//每次发生变化后重新获取浏览器窗口的高度在减去100px
		})
	}
	
	//增加左侧菜单栏的图标
	$(".layui-nav-tree .iconfont").addClass("left_tubiao_css");	
	for(var a=0;a<10;a++){
		var b =a+1;
		$(".layui-nav-tree .iconfont").eq(a).addClass("left_tubiao"+b);
	}
	$(".layui-nav-tree dl dd").css("background-color","#2B2E37!important");

	//参数设置
	Tab.prototype.set = function(option) {
		var _this = this;        //让当前this指向保存在_this里面
		$.extend(true, _this.tabConfig, option);
		return _this;
	};

	//通过title获取lay-id
	Tab.prototype.getLayId = function(title){
		$(".layui-tab-title.top_tab li").each(function(){
			if($(this).find("cite").text() == title){
				layId = $(this).attr("lay-id");
			}
		})
		return layId;
	}
	//通过title判断tab是否存在
	Tab.prototype.hasTab = function(title){
		var tabIndex = -1;
		$(".layui-tab-title.top_tab li").each(function(){  //each()方法遍历
			if($(this).find("cite").text() == title){
				tabIndex = 1;
			}
		})
		return tabIndex;
	}

	//右侧内容tab操作
	var tabIdIndex = 0;
	Tab.prototype.tabAdd = function(_this){
		if(window.sessionStorage.getItem("menu")){    //判断临时缓存里有没有bodytab里的menu，如果有
			menu = JSON.parse(window.sessionStorage.getItem("menu"));  //parse（）将json数据提取出来存进menu
		}
		var that = this;
		var closed = that.tabConfig.closed,   //给当前的bodytab加上关闭按钮
			openTabNum = that.tabConfig.openTabNum;//限制tab数量为10个
			tabFilter = that.tabConfig.tabFilter;  //过滤器类似标签选择器选择为bodytab
		// $(".layui-nav .layui-nav-item a").on("click",function(){
			
			if(_this.find("i.iconfont,i.layui-icon").attr("data-icon") != undefined){         //如果当二级菜单里有data-icon属性则执行
				var title = '';
				
				if(that.hasTab(_this.find("cite").text()) == -1 && _this.siblings("dl.layui-nav-child").length == 0){
					if($(".layui-tab-title.top_tab li").length == openTabNum){
						layer.msg('只能同时打开'+openTabNum+'个选项卡哦。不然系统会卡的！');
						return;
					}
					tabIdIndex++;
					if(_this.find("i.iconfont").attr("data-icon") != undefined){
						title += '<i class="iconfont '+_this.find("i.iconfont").attr("data-icon")+'"></i>';
					}else{
						title += '<i                          class="layui-icon">'+_this.find("i.layui-icon").attr("data-icon")+'</i>';
					}
					title += '<cite>'+_this.find("cite").text()+'</cite>';
					title += '<i class="layui-icon layui-unselect layui-tab-close" data-id="'+tabIdIndex+'">&#x1006;</i>';
					element.tabAdd(tabFilter, {
				        title : title,
				        content :"<iframe src='"+_this.attr("data-url")+"' data-id='"+tabIdIndex+"'></frame>",
				        id : new Date().getTime()
				    })

					//当前窗口内容
					var curmenu = {
						"icon" : _this.find("i.iconfont").attr("data-icon")!=undefined ? _this.find("i.iconfont").attr("data-icon") : _this.find("i.layui-icon").attr("data-icon"),
						"title" : _this.find("cite").text(),
						"href" : _this.attr("data-url"),
						"layId" : new Date().getTime()
					}
					menu.push(curmenu);
					window.sessionStorage.setItem("menu",JSON.stringify(menu)); //打开的窗口
					window.sessionStorage.setItem("curmenu",JSON.stringify(curmenu));  //当前的窗口
					element.tabChange(tabFilter, that.getLayId(_this.find("cite").text()));
				}else{
					//当前窗口内容
					var curmenu = {
						"icon" : _this.find("i.iconfont").attr("data-icon")!=undefined ? _this.find("i.iconfont").attr("data-icon") : _this.find("i.layui-icon").attr("data-icon"),
						"title" : _this.find("cite").text(),
						"href" : _this.attr("data-url"),
						"layId" : new Date().getTime()
					}
					window.sessionStorage.setItem("curmenu",JSON.stringify(curmenu));  //当前的窗口
					element.tabChange(tabFilter, that.getLayId(_this.find("cite").text()));
				}
			}
		// })
	}
	$("body").on("click",".top_tab li",function(){
		//切换后获取当前窗口的内容
		var curmenu = '';
		var menu = JSON.parse(window.sessionStorage.getItem("menu"));
		curmenu = menu[$(this).index()-1];
		if($(this).index() == 0){
			window.sessionStorage.setItem("curmenu",'');
		}else{
			window.sessionStorage.setItem("curmenu",JSON.stringify(curmenu));
			if(window.sessionStorage.getItem("curmenu") == "undefined"){
				//如果删除的不是当前选中的tab,则将curmenu设置成当前选中的tab
				if(curNav != JSON.stringify(delMenu)){
					window.sessionStorage.setItem("curmenu",curNav);
				}else{
					window.sessionStorage.setItem("curmenu",JSON.stringify(menu[liIndex-1]));
				}
			}
		}
		element.tabChange(tabFilter,$(this).attr("lay-id")).init();
	})

	//删除tab
	$("body").on("click",".top_tab li i.layui-tab-close",function(){
		//删除tab后重置session中的menu和curmenu
		liIndex = $(this).parent("li").index();
		var menu = JSON.parse(window.sessionStorage.getItem("menu"));
		//获取被删除元素
		delMenu = menu[liIndex-1];
		var curmenu = window.sessionStorage.getItem("curmenu")=="undefined" ? "undefined" : window.sessionStorage.getItem("curmenu")=="" ? '' : JSON.parse(window.sessionStorage.getItem("curmenu"));
		if(JSON.stringify(curmenu) != JSON.stringify(menu[liIndex-1])){  //如果删除的不是当前选中的tab
			// window.sessionStorage.setItem("curmenu",JSON.stringify(curmenu));
			curNav = JSON.stringify(curmenu);
		}else{
			if($(this).parent("li").length > liIndex){
				window.sessionStorage.setItem("curmenu",curmenu);
				curNav = curmenu;
			}else{
				window.sessionStorage.setItem("curmenu",JSON.stringify(menu[liIndex-1]));
				curNav = JSON.stringify(menu[liIndex-1]);
			}
		}
		menu.splice((liIndex-1), 1);
		window.sessionStorage.setItem("menu",JSON.stringify(menu));
		element.tabDelete("bodyTab",$(this).parent("li").attr("lay-id")).init();
	})

	var bodyTab = new Tab();
	exports("bodyTab",function(option){
		return bodyTab.set(option);
	});
	
	
})

