// pages/map/index.js

const getRegionalVehicleFromRectangleUrl = require('../../utils/config').getRegionalVehicleFromRectangleUrl
const GetRegionListUrl = require('../../utils/config').GetRegionListUrl
const GetUserEnterpriseListUrl = require('../../utils/config').GetUserEnterpriseListUrl

var app = getApp()
Page({
  data: {
    VehicleList: [],
    VehicleStastic: [{
      id: 0,
      Title: '行驶车辆',
      Value: 0,
      icon: "/img/checkcar_online_bigcar_icon.png",
      color: 'green'
    }, {
      id: 1,
      Title: '停车车辆',
      Value: 0,
      icon: "/img/checkcar_online_bigcar_icon.png",
      color: 'green'
    }, {
      id: 2,
      Title: '熄火车辆',
      Value: 0,
      icon: "/img/checkcar_online_bigcar_icon.png",
      color: 'green'
    }, {
      id: 3,
      Title: '定位失败',
      Value: 0,
      icon: "/img/checkcar_communication_outage_bigcar_icon.png",
      color: 'red'
    }, {
      id: 4,
      Title: '通讯中断',
      Value: 0,
      icon: "/img/checkcar_locationfailure_bigcar_icon.png",
      color: 'gray'
    }, {
      id: 5,
      Title: '全部车辆',
      Value: 0,
      icon: "/img/blank.png",
      color: 'blue'
    }],
    VehicleInfo: null,
    controls: [{
      iconPath: "/img/checkcar_map_peopellocation.png",
      id: 0,
      position: {
        left: app.globalData.systemInfo.wWidth - 55,
        top: app.globalData.systemInfo.wHeight - 170,
        width: 45,
        height: 45
      },
      clickable: true
    }, {
      iconPath: "/img/checkcar_refresh_icon.png",
      id: 1,
      position: {
        left: app.globalData.systemInfo.wWidth - 55,
        top: app.globalData.systemInfo.wHeight - 215,
        width: 45,
        height: 45
      },
      clickable: true
    }, {
      iconPath: "/img/checkcar_map_install.png",
      id: 2,
      position: {
        left: app.globalData.systemInfo.wWidth - 55,
        top: app.globalData.systemInfo.wHeight - 260,
        width: 45,
        height: 45
      },
      clickable: true
    }],
    owner: {
      longitude: 114.3052500000,
      latitude: 30.5927600000,
      zlevel: 14
    },
    allPoi: [{
      longitude: 114.3841500000,
      latitude: 30.6403900000
    }, {
      longitude: 114.3425300000,
      latitude: 30.4998400000
    }, {
      longitude: 114.3159900000,
      latitude: 30.5538600000
    }, {
      longitude: 114.3216800000,
      latitude: 30.3755900000
    }, {
      longitude: 114.3750900000,
      latitude: 30.8813100000
    }, {
      longitude: 114.2709600000,
      latitude: 30.6014700000
    }, {
      longitude: 114.3096000000,
      latitude: 30.5998200000
    }, {
      longitude: 114.2149800000,
      latitude: 30.5814500000
    }, {
      longitude: 114.2177200000,
      latitude: 30.5547300000
    }, {
      longitude: 114.1370200000,
      latitude: 30.6199600000
    }, {
      longitude: 114.0846900000,
      latitude: 30.3089500000
    }, {
      longitude: 114.0291900000,
      latitude: 30.5820300000
    }, {
      longitude: 114.4506740570,
      latitude: 30.4862549843
    }, {
      longitude: 114.3354034424,
      latitude: 30.3272493210
    }]
  },
  mapCtx: null,
  onLoad: function (options) {
    var self = this
    self.mapCtx = wx.createMapContext('myMap')
    self.getRegions();
    self.getEnterprise();
    self.getVelcheList()
  },
  onShow: function (res) {
    var self = this
    self.getVelcheList()
  },
  onReady: function () {
    var self = this
    if (self.data.VehicleStastic[5].value === 0) {
      self.getVelcheList()
    }
  },
  //移动到当前位置
  moveToLocation() {
    var self = this
    self.mapCtx.moveToLocation()
    //self.getRegion()
  },
  //获取屏幕范围经纬度
  getRegion() {
    var self = this
    // self.mapCtx.getRegion({
    //   success: function (res) {
    //     // console.log(res)
    //   }
    // })
  },
  //地图组件
  controltap(e) {
    console.log(e)
    var self = this
    switch (e.controlId) {
      case 0:
        self.mapCtx.moveToLocation()
        self.setData({
          owner: {
            longitude: app.globalData.ownLocation.oLon,
            latitude: app.globalData.ownLocation.oLat
          }
        })
        break
      case 1:
        self.getVelcheList()
        break
      case 2:
        wx.navigateTo({
          url: '/pages/setup/index'
        })
        break
    }
  },
  //获取车辆列表信息
  getVelcheList() {
    var self = this
    app.getJson(getRegionalVehicleFromRectangleUrl, { 'App_Key': app.globalData.AppKey }, 'POST', function (res) {
      console.log(getRegionalVehicleFromRectangleUrl)
      if (res.Code === 0 && res.Data) {
        wx.hideLoading();
        var VehicleStastic = self.data.VehicleStastic
        VehicleStastic[0].Value = res.Data.TravelTotal
        VehicleStastic[1].Value = res.Data.ParkingTotal
        VehicleStastic[2].Value = res.Data.FlameoutTotal
        VehicleStastic[3].Value = res.Data.SeekfailedTotal
        VehicleStastic[4].Value = res.Data.ComlossTotal
        VehicleStastic[5].Value = res.Data.Total

        self.setData({
          VehicleStastic: VehicleStastic
        })
        var VehicleList = res.Data.VehicleList
        var markers = [], allPoi = []
        for (var i in VehicleList) {
          var path;
          switch (VehicleList[i].VehicleStatusId) {
            case 1:
              path = "/img/checkcar_online_bigcar_icon.png"
              break;
            case 2:
              path = "/img/checkcar_online_bigcar_icon.png"
              break;
            case 3:
              path = "/img/checkcar_online_bigcar_icon.png"
              break;
            case 4:
              path = "/img/checkcar_communication_outage_bigcar_icon.png"
              break;
            case 5:
              path = "/img/checkcar_locationfailure_bigcar_icon.png"
              break;
            default:
              path = "/img/checkcar_locationfailure_bigcar_icon.png"
              break;
          }
          markers[i] = {
            iconPath: path,
            id: i,
            width: 17,
            height: 28,
            longitude: VehicleList[i].Lon,
            latitude: VehicleList[i].Lat,
            title: VehicleList[i].VehicleNo,
            rotate: VehicleList[i].Direction
          }
          allPoi[i] = {
            longitude: VehicleList[i].Lon,
            latitude: VehicleList[i].Lat
          }

          var randomPoi = Math.round(Math.random() * allPoi.length)


        }
        self.setData({
          VehicleList: VehicleList,
          markers: markers,
          owner: allPoi[randomPoi]
        })
        wx.hideLoading()
        wx.setStorageSync('$VehicleData', res.Data)
        console.log(res.Data)
      }
    }, app.globalData.userState.token)
  },
  toDetail() {
    wx.navigateTo({
      url: '/pages/car/index?VehicleInfo=' + JSON.stringify(this.data.VehicleInfo)
    })
    console.log(this.data.VehicleInfo.id)
  },
  toSearch(e) {
    console.log(e)
    var index = parseInt(e.currentTarget.dataset.index)
    if ((index !== 6) && index) {
      wx.navigateTo({
        url: '/pages/map/carlist?status=' + index
      })
    } else {
      wx.navigateTo({
        url: '/pages/map/carlist'
      })
    }
  },

  showVehicleInfo(e) {
    console.log(e.markerId)
    var self = this;
    if (!self.data.VehicleList[e.markerId]) {
      setTimeout(function () {
        self.showVehicleInfo(e)
      }, 200)
      return
    }
    var _VehicleInfo = self.data.VehicleList[e.markerId]
    switch (self.data.VehicleList[e.markerId].VehicleStatusId) {
      case 1:
        _VehicleInfo.icon = "/img/checkcar_online_bigcar_icon.png"
        _VehicleInfo.color = "green"
        break;
      case 2:
        _VehicleInfo.icon = "/img/checkcar_online_bigcar_icon.png"
        _VehicleInfo.color = "green"
        break;
      case 3:
        _VehicleInfo.icon = "/img/checkcar_online_bigcar_icon.png"
        _VehicleInfo.color = "green"
        break;
      case 4:
        _VehicleInfo.icon = "/img/checkcar_communication_outage_bigcar_icon.png"
        _VehicleInfo.color = "red"
        break;
      case 5:
        _VehicleInfo.icon = "/img/checkcar_locationfailure_bigcar_icon.png"
        _VehicleInfo.color = "gray"
        break;
      default:
        _VehicleInfo.icon = "/img/checkcar_locationfailure_bigcar_icon.png"
        _VehicleInfo.color = "gray"
        break;
    }

    switch (self.data.VehicleList[e.markerId].IsComIco) {
      case true:
        _VehicleInfo.ComIco = "/img/i_mobile_open.png"
        break;
      case false:
        _VehicleInfo.ComIco = "/img/i_mobile_off.png"
        break;
      default:
        _VehicleInfo.ComIco = "/img/i_mobile_off.png"
        break;
    }

    switch (self.data.VehicleList[e.markerId].IsGpsIco) {
      case true:
        _VehicleInfo.GpsIco = "/img/i_bd_open.png"
        break;
      case false:
        _VehicleInfo.GpsIco = "/img/i_bd_off.png"
        break;
      default:
        _VehicleInfo.GpsIco = "/img/i_bd_off.png"
        break;
    }
    _VehicleInfo.id = e.markerId
    setTimeout(function () {
      self.setData({
        VehicleInfo: _VehicleInfo
      })
      wx.setStorageSync('$VehicleInfo', self.data.VehicleInfo)
      console.log(self.data.VehicleInfo)
    }, 300)

  },
  clearVehicleInfo() {
    var self = this;
    self.setData({
      VehicleInfo: null
    })
  },
  //获取城市地区列表
  getRegions() {
    var self = this;
    var cities = wx.getStorageSync('$cities')
    if (!cities) {
      app.getJson(GetRegionListUrl + "?TypeId=2&Code='-1'", { TypeId: 2, Code: -1 }, 'GET', function (res) {
        console.log(res)
        if (res.Code === 0) {
          wx.setStorage({
            key: '$cities',
            data: res.Data
          })
        }
      }, app.globalData.userState.token, true)

    } else {
      console.log('已有城市列表')
      return
    }
  },
  //获取企业列表
  getEnterprise() {
    var self = this;
    app.getJson(GetUserEnterpriseListUrl, { TypeId: 6, app_Key: app.globalData.AppKey }, 'GET', function (res) {
      console.log(res)
      if (res.Code === 0) {
        wx.setStorage({
          key: '$enterprise',
          data: res.Data
        })
      }
    }, app.globalData.userState.token, true)

  },
  onShareAppMessage: function (res) {
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