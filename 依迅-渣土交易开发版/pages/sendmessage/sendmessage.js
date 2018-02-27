const SendMessageUrl = require('../../utils/config.js').SendMessageUrl;
const carCodeUrl = require('../../utils/config.js').carCodeUrl;
const sendMoudleUrl = require('../../utils/config.js').sendMoudleUrl
var md5 = require('../../utils/md5.js')
//获取应用实例
var app = getApp()
Page({
  data:{
    msgcode: false,
    sendmsg: "sendmsg",
    getmsg: "获取短信验证码",
    getmsgsuccess: "短信验证成功",
    chooseType: 1,
    submitNum: 0,
    disabled: false,
    time: 60,
    mobile: "",
    phoneandcode: 0,
    formId:'',
    id:'',
    type:'',
    messageArticleType:''
  },
  onLoad:function(options){
    if (options.type == 1){
      this.setData({ type:'弃土交易', messageArticleType:'渣土'})
    }else{
      this.setData({ type: '车辆租赁', messageArticleType: '自卸车'})
    }
    this.setData({ id: options.id});
  },
  formSubmit: function (e) {
    console.log(e)
    console.log(e.detail.formId);
    this.setData({formId: e.detail.formId})
  },
  userNameInput: function (e) {
    var that = this
    this.setData({
      mobile: e.detail.value
    })
    console.log(that.data.mobile)
  },
  sendMessageCode: function () {
    var that = this
    //获取当前时间戳
    var timestamp = new Date().getTime();
    var phone = that.data.mobile;
    var touser = wx.getStorageSync('$openId');
    console.log(phone);
    var sign = md5.md5("k=9777c1d683c7427ea7c23235027ae1aa&p=" + phone + "&ts=" + timestamp);
    //利用封装好的ajax请求数据
    app.getJson(SendMessageUrl, { phone: phone, timestamp: timestamp, sign: sign, openId: touser }, 'get', function (res) {
      console.log(SendMessageUrl);
      console.log(res);
      console.log(app.globalData.access_token);

    }, app.globalData.access_token)
  },
  sendmessg: function (e) {
    console.log('点击')
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
    } else {
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
              disabled: false,
              msgcode: true
            })
          }
        }, 1000)
      }
    }
  },
  bindKeyInput: function (e) {
    var that = this;
    var value = e.detail.value
    var mobileVal = that.data.mobile
    console.log(mobileVal);
    if(value.length == 4){
    setTimeout(function () {
      app.getJson(carCodeUrl, { phone: mobileVal, smscode: value }, 'post', function (res) {
        console.log(carCodeUrl);
        console.log(res);
        if (res.RetMsg !== '短信验证成功') {
          wx.setStorageSync('$phone', mobileVal);
          app.globalData.permission = true;
          that.setData({
            sendmsg: "sendmsg",
            time: -2,
            disabled: false,
          })
          var formId = that.data.formId;
          formId.toString();
          console.log(formId + 'formid');
          var touser = wx.getStorageSync('$openId')
          //var name = '微信昵称' + wx.getStorageSync('$userInfomation').name;
          var name = '微信昵称：' + wx.getStorageSync('$wxName');
          var phone = wx.getStorageSync('$wxPhone');
          var tradType = that.data.type;
          var messageArticleType = that.data.messageArticleType;
          var template_id = '1T-f6DLaB8FGwoBfulFSzW1JXX8IXpldatIL_gYbZAU';
          var page = 'pages/tradesoil/tradesoil?id=' + that.data.id + '&messageHidden=true';
          var data = {
            "keyword1": {
              "value": name,
              "color": "#4a4a4a"
            },
            "keyword2": {
              "value": phone,
              "color": "#4a4a4a"
            },
            "keyword3": {
              "value": tradType,
              "color": "#4a4a4a"
            },
            "keyword4": {
              "value": messageArticleType,
              "color": "#4a4a4a"
            }
          };
          var parameter = {
            touser: touser, template_id: template_id, form_id: formId, page:page, data: data, color: '#ccc',emphasis_keyword: 'keyword2.DATA'}
          console.log(parameter);
          app.sendMouldMssage(parameter,sendMoudleUrl);
          wx.showToast({
            title: '消息已推送成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
            wx.navigateBack({})
          }, 2000)
        } else {

        }
      }, app.globalData.access_token)
    }, 1000)
    }
  },

})