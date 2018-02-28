import WxValidate from 'utils/WxValidate'
const AV = require('utils/av-weapp-min.js');
const loginUrl = require('utils/config.js').loginUrl
const userInfoUrl = require('utils/config.js').userInfoUrl
var Promise = require('utils/promise.js');
var tokenStorage = '';
var errorMsg = '';
var times = 0;
var requestTask;
//app.js
App({ 
  onLaunch: function () {
    var self = this;
    //调用API从本地缓存中获取数据
    self.globalData.access_token = wx.getStorageSync('$WxToken');    
    tokenStorage = self.globalData.access_token;
    self.getLocation();
    self.getUserInformation();
  //  self.getAuthKey();
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
      },
      fail: function () {
        //登录态过期
        self.getSessionkey();
      }
    })
  },
  globalData: {
    access_token: '',
    wxData:{
      appId:'wx63e2ddb2f77ea8a2',
      appSecret:'a12f76c2d82f9b248cd83c030989fa16'
    },
    permission:false
  },
  // getAuthKey:function(){
  //   var that = this
  //   return new Promise(function (resolve, reject) {
  //     wx.login({
  //       success: function (res) {
  //         if (res.code) {
  //           wx.setStorageSync('$code', res.code)
  //           //发起网络请求
  //           wx.request({
  //             url: loginUrl,
  //             data: {code: res.code},
  //             success: function (res) {
  //               console.log(res);
  //             // console.log(tokenStorage);
  //               timeskey = 0;
  //               that.globalData.access_token = res.data.Data.Token;
  //               wx.setStorageSync('$WxToken', res.data.Data.Token);
  //               wx.setStorageSync('$openId', res.data.Data.OpenId);
  //               that.getUserPhone();
  //             },
  //             complete:function(res){
  //             //  console.log(res)
  //               var res = { 
  //                 status: 200,
  //                 data: res.data.Data.Token
  //               }
  //               resolve(res)
  //             },
  //             fail: function (res) {
  //               console.log(res)
  //               if (timeskey >= 5) {
  //                 var networkType;
  //                 wx.getNetworkType({
  //                   success: function (res) {
  //                     // 返回网络类型, 有效值：
  //                     // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
  //                     networkType = res.networkType;
  //                     (networkType == 'none') ? errorMsg = '您的网络已断开,请重新设置网络!' : errorMsg = '服务器出错，请稍后再试或联系客服!';
  //                    // self.globalData.errorMsg = errorMsg;
  //                     console.log(errorMsg)
  //                   }
  //                 });
  //                 timeskey = 0;
  //                 return
  //               } else {
  //                 setTimeout(function () { that.getAuthKey() }, 500);
  //                 timeskey++;
  //                 return
  //               }
  //             }
  //           })
  //         } else {
  //           console.log('获取用户登录态失败！' + res.errMsg);
  //           var res = {
  //             status: 300,
  //             data: '错误'
  //           }
  //           reject('error');
  //         }
  //       }
  //     });
  //   });
  // },
  
  getSessionkey:function(callback){
    var that = this
    var timekey =0;
    callback = callback || function () { };
      wx.login({
        success: function (res) {
          if (res.code) {
            wx.setStorageSync('$code', res.code)
            //发起网络请求
            wx.request({
              url: loginUrl,
              data: { code: res.code },
              success: function (res) {
                console.log(res);
                // console.log(tokenStorage);
                timekey = 0;
                that.globalData.access_token = res.data.Data.Token;
                wx.setStorageSync('$WxToken', res.data.Data.Token);
                wx.setStorageSync('$openId', res.data.Data.OpenId);
                that.getUserPhone();
              },
              complete: function (res) {
                  console.log(res)
                return callback(res);
              },
              fail: function (res) {
                console.log(res)
                if (timekey >= 5) {
                  var networkType;
                  wx.getNetworkType({
                    success: function (res) {
                      // 返回网络类型, 有效值：
                      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                      networkType = res.networkType;
                      (networkType == 'none') ? errorMsg = '您的网络已断开,请重新设置网络!' : errorMsg = '服务器出错，请稍后再试或联系客服!';
                    }
                  });
                  timekey = 0;
                  return callback('fail');
                } else {
                  setTimeout(callback(), 500);
                  timekey++;
                  return
                }
              }
            })
          } else {
            console.log('获取用户登录态失败！');
          }
        }
      });
  },
  getJson: function (url, parameter, type, callback, token, loading, toast) {
    //ajax封包
    var self = this;
    callback = callback || function () { };
    toast = toast || '';
    if (!loading) {
      wx.showLoading({ title: '正在加载...', mask: true })
    }
    requestTask = wx.request({
      url: url,
      data: parameter,
      method: type,
      header: {
        'content-type': 'application/json',
        'access_token': token
      },
      success: function (res) {
      //  self.globalData.errorMsg = '';
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
        setTimeout(function(){
          wx.hideLoading();
        },400)
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    });
  },
  //取消请求
  stopRequest(callback) {
    requestTask.abort()
    callback(true)
  },

  //获取地理位置信息
  getLocation: function (e) {
    var self = this;
    var launchFlag = wx.getStorageSync('$ownLocation');
  //  if (!launchFlag) {
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
         // self.globalData.ownLocation = ownLocation;
        }
      })
 //   }
  },
  getUserInformation:function(){
    var self = this;
    var phoneSystemInfo = wx.getStorageSync('$phoneSystemInfo');
    if (!phoneSystemInfo){
      wx.getSystemInfo({
        success: function (res) {
          var mobileModel= res.model;
          var mobileePixelRatio= res.pixelRatio;
          var windowWidth= res.windowWidth;
          var windowHeight= res.windowHeight;
          var language= res.language;
          var version= res.version;
          var phoneSystemInfo = {
            'mobileModel': mobileModel,
            'mobileePixelRatio': mobileePixelRatio,
            'windowWidth': windowWidth,
            'windowHeight': windowHeight,
            'language': language,
            'version': version
          };
          wx.setStorageSync('$phoneSystemInfo', phoneSystemInfo);
        }
      }) 
    }

    var StoUserInfo = wx.getStorageSync('$userInfomation');
    if (!StoUserInfo) {
      wx.getUserInfo({
        success: function (res) {
          var userInfo = res.userInfo
          var nickName = userInfo.nickName
          var avatarUrl = userInfo.avatarUrl
          var gender = userInfo.gender //性别 0：未知、1：男、2：女
          var province = userInfo.province
          var city = userInfo.city
          var country = userInfo.country
          var ownuserinfo = {
            'user': userInfo,
            'name': nickName,
            'url': avatarUrl,
            'sex': gender,
            'pro': province,
            'city': city,
            'coun': country
          };
          wx.setStorageSync('$userInfomation', ownuserinfo);
          // self.globalData.ownLocation = ownLocation;
        }
      })
    }
  },
  getUserPhone: function () {
//通过openid 来验证是否注册过手机 
    var that = this;
    var touser = wx.getStorageSync('$openId');
    wx.request({
      url: userInfoUrl,
      method: 'get',
      data: { openId: touser},
      success: function (res) {
        console.log(res)
        if (!res.data.Data.Phone){
          that.globalData.permission = false;
        }else{
          wx.setStorageSync('$phone', res.data.Data.Phone);
          that.globalData.permission = true;
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  //发送模板消息
  sendMouldMssage: function (parameter, sendMoudleUrl) {
    wx.request({
      url: sendMoudleUrl,
      method: 'POST',
      data: parameter,
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  }
})