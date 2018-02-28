const carInformationUrl = require('../../utils/config.js').carInformationUrl;
const sendMoudleUrl = require('../../utils/config.js').sendMoudleUrl
var app = getApp();
Page({
  data: {
    tradeInformation: '',
    titleImg:'',
    spaceimgs: [],
    currentIndex: 1,
    article: '',
    flag: false,
    id: '',
    markers: [],
    messagePhone:'',
    messageArticleType: '',
    messageWeixin:'',
    messageHidden: ''
  },
  onLoad: function (options) {
    var that = this;
    var id = options.id;
    var titleimg = options.titleimg;
    if(titleimg){
      that.setData({titleImg:titleimg})
    } else { that.setData({ titleImg:'../../images/icon_03.png'})}
    console.log(id)
    that.setData({ id: id })
    var IsSelf = options.IsSelf;
    console.log(IsSelf + "是否是自己发送的")
    if (IsSelf == 'true') {
      that.setData({ flag: true })
      console.log(that.data.flag + "是否是自己发送的")
    } else {
      that.setData({ flag: false })
      console.log(that.data.flag + "是否是自己发送的")
    }
    if (options.messageHidden) {
      that.setData({ messageHidden: true })
    }
    that.getCarInformation();
  },
  // 获取渣土交易信息
  getCarInformation: function () {
    var self = this;
    var tradeInformation = self.data.tradeInformation;
    var id = self.data.id;
    var imgArray = [];
    //利用封装好的ajax请求数据
    app.getJson(carInformationUrl, { id: id }, 'get', function (res) {
      console.log(carInformationUrl);
      console.log(res);
      console.log(app.globalData.access_token)
      if (res.RetCode === 0) {
        //   var tradeClass = [];
        switch (res.Data.TransType) {
          case 1:
            res.Data.TransType = "出租"
            break;
          case 2:
            res.Data.TransType = "租用"
            break;
        }

        switch (res.Data.CarType) {
          case 1:
            res.Data.CarType = "自卸车"
            break;
          default:
            res.Data.CarType = "其他"
            break;
        }
        tradeInformation = res.Data;
        self.setData({
          tradeInformation: tradeInformation,
          messagePhone: res.Data.Phone,
          messageArticleType: res.Data.CarType,
          messageWeixin: res.Data.weiXin,
          markers: [{
            iconPath: "../../images/Marker.png",
            latitude: tradeInformation.Lat,
            longitude: tradeInformation.Lng,
            width: 29,
            height: 45
          }],
        })
        wx.setStorageSync('$wxName', res.Data.weiXin);
        wx.setStorageSync('$wxPhone', res.Data.Phone);
        for (var i = 0; i < res.Data.Imgs.length; i++) {
          imgArray.push(res.Data.Imgs[i].Url)
          self.setData({ spaceimgs: imgArray })
        }
        console.log(tradeInformation)
      }
    }, app.globalData.access_token)
  },

  setCurrent: function (e) {  //当前图片索引
    this.setData({
      currentIndex: e.detail.current + 1
    })
  },
  imgPreview: function () { //图片预览
    const imgs = this.data.spaceimgs;
    wx.previewImage({
      current: imgs[this.data.currentIndex - 1], // 当前显示图片的http链接
      urls: imgs // 需要预览的图片http链接列表
    })
  },
  getAddress: function (e) {
    console.log(e)
    const d = e.currentTarget.dataset;
    const address = d.address;
    const latitude = d.latitude;
    const longitude = d.longitude;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 18,
      // name: address,
      address: address,
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      },
      success: function (res) {
        console.log(res);
      }
    })
  },
  formSubmit: function (e) {
    var that = this;
    that.setData({ formId: e.detail.formId })
    if (wx.getStorageSync('$phone')) {
      var formId = that.data.formId;
      formId.toString();
      console.log(formId + 'formid');
      var touser = wx.getStorageSync('$openId')
      //var name = '微信昵称' + wx.getStorageSync('$userInfomation').name;
      var name = '微信昵称：' + that.data.messageWeixin;
      //var phone = wx.getStorageSync('$phone');
      var phone = that.data.messagePhone;
      var tradType = '车辆租赁';
      var messageArticleType = that.data.messageArticleType;
      var template_id = '1T-f6DLaB8FGwoBfulFSzW1JXX8IXpldatIL_gYbZAU';
      var page = 'pages/tradesoil/tradesoil?id='+that.data.id+'&messageHidden=true';
      var data = {
        "keyword1": {
          "value": name,
          "color": "#4a4a4a"
        },
        "keyword2": {
          "value": phone,
          "color": "#9b9b9b"
        },
        "keyword3": {
          "value": tradType,
          "color": "#9b9b9b"
        },
        "keyword4": {
          "value": messageArticleType,
          "color": "#9b9b9b"
        }
      };
      var parameter = { touser: touser, template_id: template_id, form_id: formId, page: page, data: data, color: '#ccc', emphasis_keyword: 'keyword2.DATA' }
      console.log(parameter);
      app.sendMouldMssage(parameter, sendMoudleUrl);
      wx.showToast({
        title: '消息已推送成功',
        icon: 'success',
        duration: 2000
      })
    } else {
      wx.navigateTo({
        url: '../sendmessage/sendmessage?id=' + that.data.id + '&type=2'
      })
    }
  },
  goApply: function () {
    wx.redirectTo({
      url: '../applycar/applycar'
    })
  },
  modifySendInfo: function () {
    wx.navigateTo({
      url: '../cartradagain/cartradagain?id=' + this.data.id
    })
  }
})
