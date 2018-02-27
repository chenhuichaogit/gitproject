const muckSubmitUrl = require('../../utils/config.js').muckSubmitUrl;
const muckInformationUrl = require('../../utils/config.js').muckInformationUrl;
const imgUploadUrl = require('../../utils/config.js').imgUploadUrl;
//获取应用实例 
var app = getApp()
var imgs, titleVal, selltypeVal, messageVal, placeVal, eindex, chooseType = 1;
var imgArray = [],imgIdArray = [], deleImgIdArray = [], deleImgId
Page({
  data: {
    jobarr: [],
    jobindex: 0,
    chooseType: 1,
    submitNum: 0,
    imgs: [],
    id:'',
    tradeInformation:'',
    longitude: '',   //经度  
    latitude: '',    //纬度  
    address: '',     //地址  
    //    sunmitHidden:true
  },
  onLoad: function (option) {
    this.fetchData();
    this.setData({id:option.id});
    console.log(this.data.id);
    this.getMuckInformation();
  },
  chooseMessageType: function (e) {
    this.setData({
      chooseType: e.target.dataset.num
    })
    chooseType = this.data.chooseType;
    console.log(chooseType)
  },
  // 获取渣土交易信息
  getMuckInformation: function () {
    var self = this
    var id = self.data.id;
    var tradeInformation = self.data.tradeInformation;
    //利用封装好的ajax请求数据
    app.getJson(muckInformationUrl, { id: id }, 'get', function (res) {
      console.log(res);
      if (res.RetCode === 0) {
        //   var tradeClass = [];
        imgArray = [];
        imgIdArray = [];
        tradeInformation = res.Data;
        for (var i = 0; i < res.Data.Imgs.length; i++) {
          imgArray.push(res.Data.Imgs[i].Url);
          self.setData({ imgs: imgArray });
          imgIdArray.push(res.Data.Imgs[i].Id);
        }
        self.setData({
          jobindex: res.Data.SoilType,
          tradeInformation: tradeInformation,
          chooseType: res.Data.TransType,
          longitude: res.Data.Lng, 
          latitude: res.Data.Lat,
          address: res.Data.Address
        })
        deleImgId = imgIdArray.toString();
        console.log(tradeInformation)
      }
    }, app.globalData.access_token)
  },
  //表单提交
  formSubmit: function (e) {
    var that = this;
    console.log(e)
    titleVal = e.detail.value.title
    selltypeVal = e.detail.value.selltype
    messageVal = e.detail.value.message
    placeVal = e.detail.value.place
    if (titleVal.length == 0 || selltypeVal.length == 0 || messageVal.length == 0 || placeVal.length == 0 || that.data.jobindex == 0) {

      wx.showToast({

        title: '有选项为空!',
        image: '../../images/guanbi2fill.png',
        duration: 1500

      })

      setTimeout(function () {

        wx.hideToast()

      }, 2000)

    }else if (messageVal.length < 4) {

      wx.showToast({

        title: '信息内容太少!',
        image: '../../images/guanbi2fill.png',

        duration: 1500

      })

      setTimeout(function () {

        wx.hideToast()

      }, 2000)

    } else {

       that.getMuckSubmit();
    }
  },
  // 获取渣土交易信息
  getMuckSubmit: function () {
    var self = this
    //获取经纬度信息
    var Location = wx.getStorageSync('$ownLocation');
    var Lng = self.data.longitude;
    var Lat = self.data.latitude;
    console.log(deleImgId);
    console.log(self.data.jobindex)
    var phone = wx.getStorageSync('$phone');
    //利用封装好的ajax请求数据
    app.getJson(muckSubmitUrl, { Phone: phone,SoilType: self.data.jobindex, TransType: chooseType, Title: titleVal, Description: messageVal, Address: placeVal, Lng: Lng, Lat: Lat, FileIds: deleImgId, Id:self.data.id }, 'post', function (res) {
      if (res.RetMsg == '数据提交成功') {
        self.setData({
          submitNum: 1,
        });
        wx.showToast({
          title: "发布成功",//这里打印出登录成功
          icon: 'success',
          duration: 1500
        });
        setTimeout(function () {
            wx.reLaunch({
              url: '../service/service?tabindex=1'
            })
        }, 1100);
      } else {
        wx.showToast({
          title: "发布信息失败",
          icon: 'loading',
          duration: 1000
        });
      }
      console.log(res);

    }, app.globalData.access_token)
  },
  fetchData: function () {
    this.setData({
      jobarr: ["请选择", "渣土", "砂石", "淤泥质土", "粉质粘土", "砖渣"]
    })
  },
  bindPickerChange: function (e) { //下拉选择
    eindex = e.detail.value;
    const name = e.currentTarget.dataset.pickername;
    // this.setData(Object.assign({},this.data,{name:eindex}))
    switch (name) {
      case 'job':
        this.setData({
          jobindex: eindex
        })
        console.log(this.data.jobindex)
        break;
      default:
        return
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
                  console.log(imgIdArray)
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
  },
  getAddress: function (e) {
    var that = this;
    wx.getSetting({
      success: (res) => {
        console.log(res)
        if (res.authSetting["scope.userLocation"]) {
          wx.navigateTo({
            url: '../map/map?revise=true&lat=' + that.data.latitude+'&lng='+that.data.longitude,
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
