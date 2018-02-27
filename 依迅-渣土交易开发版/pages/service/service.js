const muckListUrl = require('../../utils/config.js').muckListUrl;
const carListUrl = require('../../utils/config.js').carListUrl;
var app = getApp();
var time = 0, interval='', servicecarlist, muckpage=1, carpage=1, PageSize = 40, touchDot = 0;//触摸时的原点
//var flag_hd = true; //关于左右划屏的
var inputTimer, queryTimer;
Page({
  data: {
    itemClass:'',
    showsearch:false,   //显示搜索按钮
    searchtext:'',  //搜索文字
    muckList:[], //渣土交易列表
    carList: [], //渣土车列表
    tradeClass:'',
    newMessageMuck:0,
    totalMessageMuck:0,
    newMessageCar: 0,
    totalMessageCar: 0,
    soilscrollTop: 0,//滚动位置
    carscrollTop: 0,
    scrollHeight: 0, 
    _num:1,
    _number:1,
    tabindex:1,
    muckpageload:'',
    carpageload: '',
    boole:false,
    hisQuery: null,
    queryKey: '',
  },
  onLoad: function (options) { //加载数据渲染页面
  var that = this
    if (options.tabindex){
      this.setData({ tabindex: options.tabindex});
      muckpage = 1 ;
      carpage = 1;
    }
    this.getMuckList();
    this.getCarList();
    this.onShow();
    // var socketOpen = false;
    // var socketMsgQueue = [];
    // wx.connectSocket({
    //   url: 'ws://192.168.1.249:10206'
    // })
    // wx.onSocketOpen(function (res) {
    //     console.log(res)

    //     wx.sendSocketMessage({
    //       data: "msgtype=gps&phonenums=017121901030&phonenums=017121901096"
    //     })
    // })

    // wx.onSocketMessage(function (res) {
    //   console.log('收到服务器内容：' + res.data)
    // })
  },
  onShareAppMessage: function () {
    return {
      title: '依迅渣土交易',
      path: '/pages/service/service?tabindex=1'
    }
  },
 // 获取渣土交易信息
  getMuckList:function(){
    var self = this
    app.getAuthKey().then(function (res) {
      console.log(res);
      if (res.status == 200) {
        var auth_key = res.data;
        var touser = wx.getStorageSync('$openId');
        app.getJson(muckListUrl, { PageIndex: muckpage, PageSize: PageSize, Title: self.data.queryKey, OpenId: touser}, 'POST', function (res) {
          console.log(res);
          //console.log(app.globalData.access_token)
          var muckList = self.data.muckList;
          if (res.RetCode === 0) {
            self.setData({ muckpageload: res.Data.List.length})
            for (var i = 0; i < res.Data.List.length; i++) {
              switch (res.Data.List[i].TransType) {
                case 1:
                  res.Data.List[i].TransType = "售"
                  break;
                case 2:
                  res.Data.List[i].TransType = "购"
                  break;
              }

              switch (res.Data.List[i].SoilType) {
                case 1:
                  res.Data.List[i].SoilType = "渣土"
                  break;
                case 2:
                  res.Data.List[i].SoilType = "砂石"
                  break;
                case 3:
                  res.Data.List[i].SoilType = "淤泥质土"
                  break;
                case 4:
                  res.Data.List[i].SoilType = "粉质粘土"
                  break;
                case 5:
                  res.Data.List[i].SoilType = "砖渣"
                  break;
                default:
                  res.Data.List[i].SoilType = "其他"
                  break;
              }
              muckList.push(res.Data.List[i])
            }
            self.setData({
              newMessageMuck: res.Data.Today,
              totalMessageMuck: res.Data.Total,
              muckList: muckList
            })
            muckpage++;
           // console.log(muckList)
          }
        }, app.globalData.access_token);
      } else {
        console.log(res.data);
      }
    })
  },
  // 获取车辆交易信息
  getCarList: function () {
    var self = this
    app.getAuthKey().then(function (res) {
      console.log(res);
      if (res.status == 200) {
        var auth_key = res.data;
        var touser = wx.getStorageSync('$openId');
        if (app.globalData.access_token) {
          //利用封装好的ajax请求数据
          app.getJson(carListUrl, { PageIndex: carpage, PageSize: PageSize, Title: self.data.queryKey, OpenId: touser }, 'POST', function (res) {
            console.log(res);
            var carList = self.data.carList;
            if (res.RetCode === 0) {
              self.setData({ carpageload: res.Data.List.length })
              for (var i = 0; i < res.Data.List.length; i++) {
                //   var tradeClass = [];
                switch (res.Data.List[i].TransType) {
                  case 1:
                    res.Data.List[i].TransType = "出租"
                    self.setData({ tradeClass: "service-shop" })
                    break;
                  case 2:
                    res.Data.List[i].TransType = "租用"
                    self.setData({ tradeClass: "service-gou" })
                    break;
                }
                switch (res.Data.List[i].CarType) {
                  case 1:
                    res.Data.List[i].CarType = "自卸车"
                    break;
                  default:
                    res.Data.List[i].CarType = "其他"
                    break;
                }
                carList.push(res.Data.List[i])
              }
              self.setData({
                carList: carList,
                newMessageCar: res.Data.Today,
                totalMessageCar: res.Data.Total,
              })
              carpage++;
          //    console.log(carpage)
           //   console.log(carList)
            }
          }, app.globalData.access_token, self.data.boole);
          //clearInterval(idTimer)
        } else {
          console.log("未获取到token")
         // setTimeout(function () { clearInterval(idTimer) }, 6000)
        }
      } else {
        console.log(res.data);
      }
    })
  },
  clickNum: function (e) {
    this.setData({
      tabindex: e.target.dataset.num
    })
  },
  openSearch: function () {
    var that = this;
    if (that.data._number == 1) {
      that.setData({
        _number: 2
      })
    } else {
      that.setData({
        _number: 1
      })
    }
  },
  //页面滑动到底部
  bindDownLoad: function () {
    if(this.data.tabindex == 1){
      if (this.data.muckpageload < PageSize){
        wx.showToast({
          title: '已经到底啦!',
          image: '../../images/guanbi2fill.png',
          duration: 1200
        })
      }else{
        this.getMuckList();
      }
    }else{
      if (this.data.carpageload < PageSize) {
        wx.showToast({
          title: '已经到底啦!',
          image: '../../images/guanbi2fill.png',
          duration: 1200
        })
      } else {
        this.getCarList();
      }
    }
  },
  soilscroll: function (event) {
    //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
    this.setData({
      soilscrollTop: event.detail.scrollTop
    });
  },
  carscroll: function (event) {
    //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
    this.setData({
      carscrollTop: event.detail.scrollTop
    });
  },
  onPullDownRefresh: function (event) {
    //  该方法绑定了页面滑动到顶部的事件，然后做下拉刷新
    if (this.data.tabindex == 1) {
      muckpage = 1;
      this.setData({
        muckList: [],
        scrollTop: 0
      });
      this.getMuckList();
    } else {
      carpage = 1;
      this.setData({
        carList: [],
        scrollTop: 0
      });
      this.getCarList();
    }
    this.onShow();
  },
  submitSearch: function () {  //提交搜索
    var that = this
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
  },
  //左右滑动
  onShow: function () {
    clearInterval(interval); // 清除setInterval
    time = 0;
  },
  // 触摸开始事件
  touchStart: function (e) {
    touchDot = e.touches[0].pageX;           // 获取触摸时的原点
   // console.log("start:" + touchDot);
    // 使用js计时器记录时间    
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  // 触摸移动事件
  touchMove: function (e) {
    var touchMove = e.touches[0].pageX;         //获取目前手指的位置
   // console.log(touchMove - touchDot)
    if (touchMove - touchDot <= -80 && time <= 10) {  //通过相差距离来判断手指滑动的方向
      this.setData({
        tabindex: 2
      })
    }
    // 手指向右滑动
    if (touchMove - touchDot >= 80 && time <= 10) {
      this.setData({
        tabindex: 1
      })
    }
  },
  // 触摸结束事件
  touchEnd: function (e) {
    clearInterval(interval);                     // 清除setInterval
    time = 0;
  },
  // 搜索开始
  //搜索
  inputQuery(e) {
    var self = this;
    var key = (e.detail.value).trim();
    key = key.replace(/(^\s*)|(\s*$)/g, '');
    clearTimeout(inputTimer)
    inputTimer = setTimeout(function () {
    //  console.log(key)
      self.setData({
        queryKey: key
      })
      app.stopRequest(function (res) {
        if (res === true) {
          setTimeout(function () {
            if (self.data.tabindex == 1) {
              muckpage = 1;
              self.setData({
                muckList: [],
                scrollTop: 0
              });
              self.getMuckList();
            } else {
              carpage = 1;
              self.setData({
                carList: [],
                scrollTop: 0
              });
              self.getCarList();
            }
            self.storeQuery(key)
            self.showQuery()
          }, 200)
        }
      })
    }, 500)
  },
  storeQuery(key) {
    var self = this;
    var hisQuery = wx.getStorageSync('$historyKey') || []
    var tempHis = new Array()
    if (hisQuery.length > 0 && hisQuery.lenght < 10) {
      hisQuery.unshift(key)
    } else if (hisQuery.length >= 10) {
      hisQuery.unshift(key)
      hisQuery.splice(10, 1)
    } else {
      hisQuery.unshift(key)
    }
    //去空格
    for (var i in hisQuery) {
      if (hisQuery[i] && hisQuery[i] != "" && hisQuery[i] != undefined) {
        tempHis.push(hisQuery[i])
      }
    }
    //排重
    var resHis = [];
    var json = {};
    for (var i in tempHis) {
      if (!json[tempHis[i]]) {
        resHis.push(tempHis[i]);
        json[tempHis[i]] = 1;
      }
    }
    tempHis = resHis
    wx.setStorageSync('$historyKey', tempHis)
  },
  showQuery() {
    var self = this;
    var hisQuery = wx.getStorageSync('$historyKey') || []
    if (hisQuery.length > 0) {
      self.setData({
        hisQuery: hisQuery
      })
    }
    clearTimeout(queryTimer)
    queryTimer = setTimeout(function () {
      self.setData({
        hisQuery: null
      })
    }, 4000)
  },

  sHisQuery(e) {
    var self = this;
    var hisQuery = wx.getStorageSync('$historyKey') || []
    var index = e.currentTarget.dataset.index
    //console.log(hisQuery[index])
    clearTimeout(inputTimer)
    inputTimer = setTimeout(function () {
     // self.loadParms = loadParms
      //self.loadParms.VehicleNo = hisQuery[index]
      self.setData({
       // VehicleList: [],
        queryKey: hisQuery[index],
        hisQuery: null
      })
      app.stopRequest(function (res) {
        if (res === true) {
          setTimeout(function () {
            if (self.data.tabindex == 1) {
              muckpage = 1;
              self.setData({
                muckList: [],
                scrollTop: 0
              });
              self.getMuckList();
            } else {
              carpage = 1;
              self.setData({
                carList: [],
                scrollTop: 0
              });
              self.getCarList();
            }
          }, 100)
        }
      })
    }, 50)
  },

  clearHisQuery(e) {
    var self = this;
    var hisQuery = wx.getStorageSync('$historyKey') || []
    hisQuery = []
    self.setData({
      hisQuery: null,
      queryKey: ''
    })
    wx.setStorageSync('$historyKey', hisQuery)
    clearTimeout(inputTimer)
    inputTimer = setTimeout(function () {
      app.stopRequest(function (res) {
        if (res === true) {
          setTimeout(function () {
            if (self.data.tabindex == 1) {
              muckpage = 1;
              self.setData({
                muckList: [],
                scrollTop: 0
              });
              self.getMuckList();
            } else {
              carpage = 1;
              self.setData({
                carList: [],
                scrollTop: 0
              });
              self.getCarList();
            }
          }, 100)
        }
      })
    }, 50)
  }

})
