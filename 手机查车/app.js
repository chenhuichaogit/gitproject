//app.js
var errorMsg = '';
var times = 0;
var requestTask;

App({
  onLaunch: function () {
    var self = this
    //调用API从本地缓存中获取数据
    self.getUserState();
    //self.getWxToken();
    self.getSystemInfo();
    self.getLocation();
    if (self.globalData.userState) {
      self.regetToken();
      setInterval(self.regetToken, 1800000);
    }

  },
  globalData: {
    userState: null,
    systemInfo: null,
    carId: [],
    trackId: []
  },
  //获取用户系统信息资料，用于调试修改bug
  getSystemInfo: function (e) {
    var self = this;
    var res = wx.getSystemInfoSync();
    var systemInfo = {
      'Model': res.model,
      'PixelRatio': res.pixelRatio,
      'Width': res.screenWidth,
      'Height': res.screenHeight,
      'wWidth': res.windowWidth,
      'wHeight': res.windowHeight,
      'Language': res.language,
      'wxVersion': res.version,
      'System': res.system,
      'Platform': res.platform,
      'SDKVersion': res.SDKVersion,
      'Brand': res.brand,
      'FontSizeSetting': res.fontSizeSetting
    }
    wx.setStorageSync('$systemInfo', systemInfo);
    self.globalData.systemInfo = systemInfo
  },


  //获取地理位置信息
  getLocation: function (e) {
    var self = this;
    var launchFlag = wx.getStorageSync('$launchFlag');
    if (launchFlag) {
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          var latitude = res.latitude;
          var longitude = res.longitude;
          var ownLocation = {
            'oLon': longitude,
            'oLat': latitude
          };
          wx.setStorageSync('$ownLocation', ownLocation);
          self.globalData.ownLocation = ownLocation;
        }
      })
    }
  },
  getJson: function (url, parameter, type, callback, token, loading, toast) {
    //ajax封包
    var self = this;
    callback = callback || function () { };
    toast = toast || '';
    console.log('times========' + times);
    if (!loading) {
      wx.showLoading({ title: '正在加载...', mask: true })
    }
    requestTask = wx.request({
      url: url,
      data: parameter,
      method: type,
      header: {
        'content-type': 'application/json',
        'token': token
      },
      success: function (res) {
        self.globalData.errorMsg = '';
        times = 0;
        return callback(res.data);
      },
      fail: function (exr) {
        if (times >= 5) {
          var networkType;
          wx.getNetworkType({
            success: function (res) {
              // 返回网络类型, 有效值：
              // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
              networkType = res.networkType;
              (networkType == 'none') ? errorMsg = '您的网络已断开,请重新设置网络!' : errorMsg = '服务器出错，请稍后再试或联系客服!';
              self.globalData.errorMsg = errorMsg;
            }
          });
          times = 0;
          return callback('fail');
        } else {
          setTimeout(function () { self.getJson(url, parameter, type, callback, token) }, 500);
          times++;
          return
        }
      },
      complete: function (res) {
        //console.log(res);
        wx.hideLoading();
      }
    });
  },

  stopRequest(callback) {
    requestTask.abort()
    callback(true)
  },

  setUserState: function (data) {
    wx.setStorageSync('$userstate', data);
  },
  getUserState: function () {
    var userState = wx.getStorageSync('$userstate');
    var AppKey = wx.getStorageSync('$AppKey');
    var self = this;
    if (userState) {
      self.globalData.userState = userState;
      self.globalData.AppKey = userState.Platform[0].AppKey
    }
    if (AppKey) {
      self.globalData.AppKey = AppKey
    }
    // console.log(self.globalData.userState);
  },

  //重新获取token
  regetToken: function () {
    var self = this;
    var nowDate = new Date().getTime();
    var recordDate = self.globalData.userState.recordDate;
    var passTime = parseInt(nowDate - recordDate);
    var days = passTime / (24 * 3600 * 1000);

    if (days > 14) {
      var loginInfo = {
        Account: self.globalData.userState.Account,
        Password: Base64Decode(self.globalData.userState.Password),
      }
      wx.request({
        url: loginUrl,
        data: loginInfo,
        method: 'GET',
        success: function (res) {
          if (res.data.IsSuccess) {
            var userState = {
              access_token: res.data.ReturnValue.access_token,
              Account: self.globalData.userState.Account,
              Password: Base64Encode(self.globalData.userState.Password),
              rmPass: self.globalData.userState.rmPass,
              autoLogin: self.globalData.userState.autoLogin,
              recordDate: new Date().getTime()
            }
            self.setUserState(userState);
            self.getUserState();
          }
        }
      });
    }

  },

  removeUserState: function () {
    var self = this;
    self.globalData.userState = {
      access_token: null,
      Account: null,
      Password: null,
      autoLogin: null
    };
    wx.removeStorageSync('$userstate');
  },
  //获取微信token
  getWxToken: function (e) {
    var WxTokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxc3823671c899c096&secret=70ee3f9e799b4753fe6acbd713eb21a5';
    wx.request({
      url: WxTokenUrl,
      method: 'GET',
      success: function (res) {
        console.log(res)
        wx.setStoragesy({
          key: '$WxToken',
          data: { 'WxToken': res.data.access_token }
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  }
})