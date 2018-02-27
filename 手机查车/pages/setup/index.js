
// logout.js
var app = getApp();
Page({
  data: {
    'winHeight': '',
    'systemInfo': '',
    'PageIndex': 1,
    'Platform': '',
    'nPlatformName': '',
    'PlatformActive': '',
    'storageSize': ''
  },
  onLoad(options) {
    app.getSystemInfo();
    var self = this;
    var Platform = app.globalData.userState.Platform
    var appKey = app.globalData.AppKey
    var nPlatformName;
    var PlatformActive = new Array(Platform.length)

    var res = wx.getStorageInfoSync()

    for (var i in Platform) {
      if (Platform[i].AppKey === appKey) {
        nPlatformName = Platform[i].Name
        PlatformActive[i] = 'active'
      }
    }
    self.setData({
      Platform: Platform,
      nPlatformName: nPlatformName,
      PlatformActive: PlatformActive,
      storageSize: (res.currentSize / 1024).toFixed(2)
    });
  },
  //切换账号
  logOut(e) {

wx.showModal({
  title: '退出提示',
  content: '您确定要退出账号？',
  success(res){
    if (res.confirm) {
      try {
        wx.clearStorageSync()
        app.globalData.userState = null
        wx.reLaunch({
          url: '/pages/login/index'
        })
      } catch (e) {
        // Do something when catch error
      }
    }
  }
})












    
  },
  eventSetup(e) {
    wx.openSetting({
      success: (res) => {
        console.log(res)
      }
    })
  },

  eventContact(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone //仅为示例，并非真实的电话号码
    });
  },

  toIndex(e) {
    var self = this;
    try {
      self.setData({
        'PageIndex': 1
      });
    } catch (e) {
      // Do something when catch error
    }
  },

  toMap(e) {
    var self = this;
    try {
      wx.reLaunch({
        url: '/pages/map/index',
      })
    } catch (e) {
      // Do something when catch error
    }
  },

  //切换平台
  switchPlatform() {
    var self = this;
    try {
      self.setData({
        PageIndex: 2
      });
    } catch (e) {
      // Do something when catch error
    }
  },
  selectPlatform(e) {
    var self = this;
    var index = e.currentTarget.dataset.index
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name
    var appkey = e.currentTarget.dataset.appkey
    var PlatformActive = new Array(self.data.Platform.length)
    PlatformActive[index] = 'active'
    self.setData({
      nPlatformName: name,
      PlatformActive: PlatformActive
    });
    app.globalData.AppKey = appkey
    wx.setStorageSync('$AppKey', appkey)
    console.log(app.globalData.AppKey)
  },



  showContact(e) {
    var self = this;
    self.setData({
      'PageIndex': 3
    });
  },

  showAbout(e) {
    var self = this;
    self.setData({
      'PageIndex': 6
    });
  },

  //开发者模式
  showDevice: 0,
  showFeedBack(e) {
    var self = this;
    self.showDevice++;
    if (self.showDevice >= 7) {
      self.setData({
        'errorMsg': '',
        'showDevice': self.showDevice
      });
    } else if (self.showDevice == 4) {
      self.setData({
        'errorMsg': '即将进入开发者模式',
        'showDevice': self.showDevice
      });
    }
  },
  showFeedBack2(e) {
    var self = this;
    self.setData({
      'PageIndex': 7
    });
  },
  showSetup: function (e) {
    var self = this;
    self.setData({
      'PageIndex': 4
    });
  },

  //清除缓存
  removeStorage() {
    try {
      wx.removeStorageSync('$historyKey')
      wx.removeStorageSync('$enterprise')
      wx.removeStorageSync('$cities')
      wx.removeStorageSync('$VehicleInfo')
      wx.removeStorageSync('$VehicleData')
      wx.removeStorageSync('$query_setting')
      this.toMap()
    } catch (e) {
      // Do something when catch error
    }
  },
  toTestIndex(e) {
    wx.navigateTo({
      url: '/pages/setup/test',
    })

  },
  onReady() {
    var self = this;
    var res = wx.getSystemInfoSync();
    self.setData({
      'winHeight': res.windowHeight
    });
    var result = JSON.stringify(app.globalData.systemInfo)
    result = result.replace(/\{|}/g, ''); //去掉前后空格 
    result = result.replace(/\,/g, '\n'); //去掉前后空格 
    self.setData({
      systemInfo: result
    })
  }
})