const carSubmitUrl = require('../../utils/config.js').carSubmitUrl;
const SendMessageUrl = require('../../utils/config.js').SendMessageUrl;
const carCodeUrl = require('../../utils/config.js').carCodeUrl;
const imgUploadUrl = require('../../utils/config.js').imgUploadUrl;
var md5 = require('../../utils/md5.js')
//地图
var bmap = require('../../utils/bmap-wx.min.js');
var wxMarkerData = [];  //定位成功回调对象  
//获取应用实例
var app = getApp()
var imgs, chooseType=1, mobileVal, iphonecodeVal, titleVal, selltypeVal, messageVal, placeVal, eindex;
var imgIdArray = [], deleImgIdArray = [], deleImgId = '';
Page({
  data: {
    jobarr: [],
    jobindex: 0,
    msgcode:false,
    sendmsg: "sendmsg",
    getmsg: "获取短信验证码",
    getmsgsuccess: "短信验证成功",
    chooseType: 1,
    submitNum: 0,
    disabled: false,
    time: 60,
    mobile: "",
    phoneandcode: 0,
    imgs: [],
    phoneHidden: false,
    //地图开始
    ak: "OpbqS8xchusi1nLkLoFANnICE6flxzsa", //填写申请到的ak  
    markers: [],
    longitude: '',   //经度  
    latitude: '',    //纬度  
    address: '',     //地址  
    cityInfo: {}     //城市信息 
  },
  onLoad: function () {
    this.setData({ phoneHidden: app.globalData.permission })
    this.fetchData();
  //  this.getLocation();
  },
  onShow: function () {
    var that = this;
    app.getLocation();
  },
  chooseMessageType: function (e) {
    this.setData({
      chooseType: e.target.dataset.num
    })
    chooseType = this.data.chooseType;
    console.log(chooseType)
  },
  //表单提交
  formSubmit: function (e) {
    var that = this;
    console.log(e)
    mobileVal = e.detail.value.mobile;
    iphonecodeVal = e.detail.value.iphonecode;
    titleVal = e.detail.value.title;
    selltypeVal = e.detail.value.selltype;
    messageVal = e.detail.value.message;
    placeVal = e.detail.value.place;
    var re = /^1[34578]\d{9}$/;
    var msgcode = that.data.msgcode;
    var phoneHidden = that.data.phoneHidden;
    console.log(phoneHidden+'yiqi')
    if (phoneHidden == true){
      if (titleVal.length == 0 || selltypeVal.length == 0 || messageVal.length == 0 || placeVal.length == 0 || that.data.jobindex == 0) {
        wx.showToast({
          title: '有选项为空!',
          image: '../../images/guanbi2fill.png',
          duration: 1500
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      } else if (messageVal.length < 4) {
        wx.showToast({
          title: '信息内容太少!',
          image: '../../images/guanbi2fill.png',
          duration: 1500
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      }else {
        that.getCarSubmit();
      }
    }else{
      if (titleVal.length == 0 || selltypeVal.length == 0 || messageVal.length == 0 || placeVal.length == 0 || that.data.jobindex == 0) {
        wx.showToast({
          title: '有选项为空!',
          image: '../../images/guanbi2fill.png',
          duration: 1500
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      } else if (msgcode == false) {
        wx.showToast({
          title: '未通过手机验证',
          image: '../../images/guanbi2fill.png',
          duration: 1500
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      } else if (iphonecodeVal.length < 4 || iphonecodeVal.length > 4) {
        wx.showToast({
          title: '请输入4位数验证码!',
          image: '../../images/guanbi2fill.png',
          duration: 1500
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      } else if (messageVal.length < 4) {

        wx.showToast({

          title: '信息内容太少!',
          image: '../../images/guanbi2fill.png',

          duration: 1500

        })

        setTimeout(function () {

          wx.hideToast()

        }, 2000)

      } else if (iphonecodeVal.length != 4) {

        wx.showToast({

          title: '输入的验证码不正确!',
          image: '../../images/guanbi2fill.png',

          duration: 1500

        })

        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      } else {
        that.getCarSubmit();
      }
    }

  },
  // 获取车辆交易信息
  getCarSubmit: function () {
    var self = this
    //获取经纬度信息
    var Location = wx.getStorageSync('$ownLocation');
    var Lng = self.data.longitude;
    var Lat = self.data.latitude;
    var phone = wx.getStorageSync('$phone');
    console.log(phone);
    //利用封装好的ajax请求数据
    app.getJson(carSubmitUrl, {Phone: phone, CarType: eindex, TransType: chooseType, Title: titleVal, Description: messageVal, Address: placeVal, Lng: Lng, Lat: Lat, FileIds: deleImgId, Id: 0 }, 'post', function (res) {
      console.log(carSubmitUrl);
      console.log(res);
      console.log(app.globalData.access_token)
      if (res.RetMsg == '数据提交成功'){
        self.setData({
          submitNum: 1,
        });
        wx.showToast({
          title: "发布成功",//这里打印出登录成功
          icon: 'success',
          duration: 1000
        });
      }else{
        wx.showToast({
          title: "发布信息失败",
          icon: 'loading',
          duration: 1000
        });
      }
      self.applySubmit();
    }, app.globalData.access_token)
  },
  fetchData: function(){
    this.setData({
      jobarr:["请选择","自卸车"]
    })
  },
  bindPickerChange: function(e){ //下拉选择
    eindex = e.detail.value;
    const name = e.currentTarget.dataset.pickername;
    // this.setData(Object.assign({},this.data,{name:eindex}))
    switch(name) {
      case 'job':
        this.setData({
          jobindex: eindex
        })
        
        break;
      default:
        return
    }
  },
  userNameInput: function (e) {
    var that = this
    this.setData({
      mobile: e.detail.value
    })
  },
  sendMessageCode: function () {
    var that = this
    //获取当前时间戳
    var timestamp = new Date().getTime();
    var phone = that.data.mobile;
    console.log(phone);
    var sign = md5.md5("k=9777c1d683c7427ea7c23235027ae1aa&p=" + phone + "&ts=" + timestamp);
    var touser = wx.getStorageSync('$openId');
    //利用封装好的ajax请求数据
    app.getJson(SendMessageUrl, { phone: phone, timestamp: timestamp, sign: sign, openId: touser }, 'get', function (res) {
      console.log(SendMessageUrl);
      console.log(res);
      console.log(app.globalData.access_token)

    }, app.globalData.access_token)
  },
  sendmessg: function (e) {
    var that = this
    var phone = that.data.mobile
    var iphonetest = /^1[34578]\d{9}$/;
    if (phone.length != 11) {
      wx.showToast({
        title: '请输入11位手机号码!',
        image: '../../images/guanbi2fill.png',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    } else if (!iphonetest.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        image: '../../images/guanbi2fill.png',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
    }else{
      that.setData({
        phoneandcode: 1
      })
    }
    var phoneandcode = that.data.phoneandcode;
    if (phoneandcode == 1) {
      phoneandcode == 0
      that.sendMessageCode();
      that.setData({ time: 60 })
      var timer = 1;
      if (timer == 1) {
        timer = 0
        that.setData({
          sendmsg: "sendmsgafter",
          disabled: !this.data.disabled
        })
        var inter = setInterval(function () {
          that.setData({
            getmsg: that.data.time + "s后重新发送",
          })
          that.data.time--
          if (that.data.time < 0) {
            timer = 1
            phoneandcode == 1
            clearInterval(inter)
            that.setData({
              sendmsg: "sendmsg",
              getmsg: "获取短信验证码",
              disabled: false
            })
          }
        }, 1000)
      }
    }
  },
  bindKeyInput:function(e){
    var that = this;
    var value = e.detail.value
    var mobileVal = that.data.mobile
    console.log(mobileVal);
    if (value.length == 4) {
      setTimeout(function () {
        app.getJson(carCodeUrl, { phone: mobileVal, smscode: value, weixin: name }, 'post', function (res) {
          console.log(carCodeUrl);
          console.log(res);
          if (res.RetMsg == '短信验证成功') {
            wx.setStorageSync('$phone', mobileVal);
            app.globalData.permission = true;
            that.setData({
              sendmsg: "sendmsg",
              time: -2,
              disabled: false,
              msgcode: true
            })
          } else {
          }
        }, app.globalData.access_token)
      }, 1000)
    }
  },
  // 上传图片
  chooseImg: function (e) {
    var that = this;
    var imgs = that.data.imgs;
    if (imgs.length >= 9) {
      return false;
    }
    wx.chooseImage({
      // count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log(res.tempFiles[0].size + "图片大小")
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths + '图片集合');
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length >= 9) {
            return false;
          } else {
            imgs.push(tempFilePaths[i]);
            that.setData({ imgs: imgs })
            wx.uploadFile({
              url: imgUploadUrl,
              filePath: tempFilePaths[i],
              name: 'photo',
              header: {
                'content-type': 'multipart/form-data',
                'access_token': wx.getStorageSync('$WxToken')
              }, // 设置请求的 header
              formData: {}, // HTTP 请求中其他额外的 form data
              success: function (result) {
                console.log(result)
                var data = JSON.parse(result.data)
                console.log(data)
                if (result.data) {
                  imgIdArray.push(data.Data[0].Id);
                  deleImgId = imgIdArray.toString();
                  console.log(deleImgId)
                  wx.showToast({
                    title: i + '张上传成功',
                    icon: 'success',
                    duration: 1000
                  });
                } else {
                  wx.showToast({
                    title: '上传失败！',
                    image: '../../images/guanbi2fill.png',
                    duration: 1000
                  });
                }
              }
              //结束标识符
            })
          }
        }
      }
    });
  },

  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    imgIdArray.splice(index, 1);
    deleImgId = imgIdArray.toString();
    console.log(deleImgId);
    this.setData({
      imgs: imgs
    });
  },
  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },
  applySubmit: function () {
    var that = this
    setTimeout(function () {
      if (that.data.submitNum == 1) {
        wx.reLaunch({
          url: '../service/service?tabindex=2'
        })
      }
    }, 1300);
  },
  getAddress: function (e) {
    wx.getSetting({
      success: (res) => {
        console.log(res)
        if (res.authSetting["scope.userLocation"]) {
          wx.navigateTo({
            url: '../map/map',
          })
        } else {
          wx.openSetting({
            success: (res) => {

            }
          })
        }
      }
    })
  },
})
