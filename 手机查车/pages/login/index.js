// 登录页面
const loginUrl = require('../../utils/config').loginUrl
const UserApplyUrl = require('../../utils/config').UserApplyUrl

const getUserPlatAllUrl = require('../../utils/config').getUserPlatAllUrl
const Base64Encode = require('../../utils/base64').encode;
const Base64Decode = require('../../utils/base64').decode;

var app = getApp()
var retry = 0;
Page({
  data: {
    userState: app.globalData.userState || null,
    loading: false,
    loginInfo: {},
    regInfo: {},
    Error: null,
    AutoLogin: true,
    errorMsg: null,
    regPage: false
  },
  loginInfo: {},
  regInfo: {},
  error: [],
  onLoad(options) {

  },
  onReady() {
    var self = this;
    var launchFlag = wx.getStorageSync('$launchFlag');
    console.log(app.globalData.userState)
    if (self.data.AutoLogin && launchFlag) {
      self.autoLogin();
    } else {
      return
    }
  },
  //登录
  bindLoginInput(e) {
    var self = this;
    var name = e.currentTarget.id
    if (name == 'Account') {
      self.loginInfo.Account = e.detail.value.trim();
    }
    else {
      self.loginInfo.Password = e.detail.value.trim();
    }
   
  },

  loginEvent() {
    var self = this
    var launchFlag = wx.getStorageSync('$launchFlag');
    var AppKey = wx.getStorageSync('$AppKey');
    if (!launchFlag) {
      self.getLocation();
      return
    } else {
      app.getLocation();
    }
    self.loginInfo.LoginType = 1
    self.setData({
      loading: !self.data.loading
    })
    self.checkLoginInput(function (res) {
      if (res == false) {
        self.setData({
          Error: self.error,
          shakeclass: 'shake-horizontal',
          loading: false
        });

        setTimeout(function () {
          self.setData({
            shakeclass: ''
          });
        }, 1500);
      } else {
        retry = 0;
        console.log(self.loginInfo)
        wx.request({
          url: loginUrl,
          data: self.loginInfo,
          method: 'POST',
          success: function (res) {
            console.log(res)
            if (res.data.Code === 0) {
              app.getJson(getUserPlatAllUrl, {}, 'GET', function (resault) {
                console.log(resault.Data)
                var userState = {
                  token: res.data.Data.Token,
                  Account: self.loginInfo.Account,
                  Password: Base64Encode(self.loginInfo.Password),
                  tokenDate: new Date().getTime(),
                  Platform: resault.Data
                }
                self.setData({
                  Error: self.error,
                  errorMsg: res.data.Message
                });
                app.setUserState(userState);

                if (!AppKey) {
                  wx.setStorage({
                    key: '$AppKey',
                    data: resault.Data[0].AppKey,
                  })
                  app.globalData.AppKey = resault.Data[0].AppKey
                } else {
                  app.globalData.AppKey = AppKey
                }
                setTimeout(function () {
                  app.getUserState();
                  wx.redirectTo({ url: '/pages/map/index' });
                  app.globalData.errorMsg = '';
                }, 1500)
              }, res.data.Data.Token)
            } else {
              app.globalData.errorMsg = res.data.Message || '';
            }
            self.setData({
              loading: false
            });
          },
          fail: function (exr) {
            if (retry >= 5) {
              wx.getNetworkType({
                success: function (res) {
                  // 返回网络类型, 有效值：
                  // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                  (res.networkType == 'none') ? app.globalData.errorMsg = '您的网络已断开,请重新设置网络!' : app.globalData.errorMsg = '服务器出错，请稍后再试或联系客服!';
                  app.globalData.errorMsg = app.globalData.errorMsg + '\n 正在进行第 ' + retry + ' 次重新连接'
                }
              });
              retry = 0;
              self.setData({
                'contact': true
              })
            } else {
              retry++;
              setTimeout(self.loginEvent, 1500)
              return
            }
          },
          complete: function (res) {
            self.setData({
              Error: self.error,
              errorMsg: app.globalData.errorMsg
            });
            if (retry == 0) {
              setTimeout(function () {
                app.globalData.errorMsg = ''
                self.setData({
                  errorMsg: '',
                  loading: false,
                });
              }, 5000);
            }
          }
        });
      }
    })

  },

  autoLogin(e) {
    var self = this;
    var nowDate = new Date().getTime();
    var tokenDate;
    if (app.globalData.userState) {
      tokenDate = app.globalData.userState.tokenDate
      self.loginInfo.Account = app.globalData.userState.Account
      self.loginInfo.Password = Base64Decode(app.globalData.userState.Password);
    } else {
      tokenDate = nowDate
    }
    self.setData({
      loginInfo: self.loginInfo
    })
    var passTime = parseInt(nowDate - tokenDate);
    var days = passTime / (24 * 3600 * 1000);
    console.log(days);
    //self.loginEvent();
    if ((days <= 14) && (days > 0)) {
      app.getUserState();
      wx.redirectTo({ url: '/pages/map/index' });
      app.globalData.errorMsg = '';
      app.getLocation();
    } else {
      self.setData({
        AutoLogin: false
      })
      return
    }
  },

  checkLoginInput(callback) {
    callback = callback || function () { };

    var self = this;
    self.error = [];
    self.setData({
      loading: true
    });
    if (self.loginInfo.Account && self.loginInfo.Account.length < 1) {
      self.error[0] = '用户名不能少于5位数';
    } else if (!self.loginInfo.Account) {
      self.error[0] = '请输入用户名';
    } else {
      self.error[0] = '';
    }

    if (self.loginInfo.Password && self.loginInfo.Password.length < 6) {
      self.error[1] = '密码不能少于6位数';
    } else if (!self.loginInfo.Password) {
      self.error[1] = '请输入密码';
    } else {
      self.error[1] = '';
    }

    if (self.error[0] == '' && self.error[1] == '') {
      return callback(true);
    }
    return callback(false);
  },

  //注册
  bindRegInput(e) {
    var self = this;
    var name = e.currentTarget.id
    console.log(name)
    switch (name) {
      case 'Name':
        self.regInfo.Name = e.detail.value.trim();
        break;
      case 'Phone':
        self.regInfo.Phone = e.detail.value.trim();
        break;
      case 'Comany':
        self.regInfo.Comany = e.detail.value.trim();
        break;
      case 'Position':
        self.regInfo.Position = e.detail.value.trim();
        break;
    }
    console.log(self.regInfo)
  },

  regEvent(e) {
    console.log('regEvent')
    var self = this
    self.setData({
      loading: !self.data.loading
    })
    self.checkRegInput(function (res) {
      console.log(res)
      if (res == false) {
        self.setData({
          Error: self.error,
          shakeclass: 'shake-horizontal',
          loading: false
        });
        setTimeout(function () {
          self.setData({
            shakeclass: ''
          });
        }, 1500);
      } else {
        retry = 0;
        wx.request({
          url: UserApplyUrl,
          data: self.regInfo,
          method: 'POST',
          success: function (res) {
            console.log(res)
            if (res.data.Code === 0) {
              self.toLogin()
              app.globalData.errorMsg = '您的申请已提交，请留意系统发送短信或客服给您的电话联系！';
              self.setData({
                errorMsg: app.globalData.errorMsg,
                loading: false
              });

            } else if (res.data.Code === 7) {
              app.globalData.errorMsg = res.data.Message || '';
              self.error[1] = res.data.Message
              self.setData({
                Error: self.error,
                shakeclass: 'shake-horizontal',
                loading: false
              });
              setTimeout(function () {
                self.setData({
                  shakeclass: ''
                });
              }, 1500);
            } else {
              app.globalData.errorMsg = res.data.Message || '';
            }
          },
          fail: function (exr) {
            if (retry >= 5) {
              wx.getNetworkType({
                success: function (res) {
                  // 返回网络类型, 有效值：
                  // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                  (res.networkType == 'none') ? app.globalData.errorMsg = '您的网络已断开,请重新设置网络!' : app.globalData.errorMsg = '服务器出错，请稍后再试或联系客服!';
                  app.globalData.errorMsg = app.globalData.errorMsg + '\n 正在进行第 ' + retry + ' 次重新连接'
                }
              });
              retry = 0;
              self.setData({
                'contact': true
              })
            } else {
              retry++;
              setTimeout(self.loginEvent, 1500)
              return
            }
          },
          complete: function (res) {
            self.setData({
              Error: self.error,
              errorMsg: app.globalData.errorMsg
            });
            if (retry == 0) {
              setTimeout(function () {
                app.globalData.errorMsg = ''
                self.setData({
                  errorMsg: '',
                  loading: false,
                });
              }, 5000);
            }
          }
        });
      }
    })

  },


  checkRegInput(callback) {
    callback = callback || function () { };

    var self = this;
    self.error = new Array();
    self.setData({
      loading: true
    });
    if (!self.regInfo.Name) {
      self.error[0] = '请输入姓名';
    } else {
      self.error[0] = '';
    }

    if (!self.regInfo.Phone) {
      self.error[1] = '请输入手机号码';
    } else {
      self.error[1] = '';
    }

    if (!self.regInfo.Comany) {
      self.error[2] = '请输入所属单位';
    } else {
      self.error[2] = '';
    }

    if (!self.regInfo.Position) {
      self.error[3] = '请输入您的职位';
    } else {
      self.error[3] = '';
    }


    if (self.error[0] == '' && self.error[1] == '') {
      return callback(true);
    }
    return callback(false);
  },


  //获取地理位置信息
  getLocation(e) {
    var self = this;
    var launchFlag = wx.getStorageSync('$launchFlag');
    if (!launchFlag) {
      wx.showModal({
        title: '请注意！',
        content: '车老板小程序将获取您的位置地理信息用于上报使用，您是否授权？',
        success: function (res) {
          if (res.confirm) {
            wx.setStorageSync('$launchFlag', true);
            app.getLocation();
            self.loginEvent();
          } else if (res.cancel) {
            //app.removeUserState();
          }
        }
      });
    }
  },


  toReg() {
    var self = this;
    self.regInfo = {}
    self.setData({
      Error: null,
      regPage: true
    })
  },

  toLogin() {
    var self = this;
    self.setData({
      Error: null,
      regPage: false
    })
  },
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '体验车老板小程序',
      imageUrl: '/img/login_logo.png',
      // path: '/pages/common/login',
      success: function (res) {
        // 转发成功
        console.log(res);
      },
      fail: function (res) {
        // 转发失败
        console.log(res);
      }
    }
  }
})