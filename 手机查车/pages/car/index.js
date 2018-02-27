// pages/car/index.js

const wgs84togcj02 = require('../../utils/gps').wgs84togcj02
const GetDevVehicleStateUrl = require('../../utils/config').GetDevVehicleStateUrl
const randomNum = require('../../utils/util').randomNum
var app = getApp()
var getStatus, myAmapFun, anmateTimer, idTimer, idTimerIndex = 0


Page({
  data: {
    mapId:'myMap',
    VehicleInfo: null,
    Camera: false,
    controls: [{
      iconPath: "/img/checkcar_map_peopellocation.png",
      id: 0,
      position: {
        left: app.globalData.systemInfo.wWidth - 55,
        top: app.globalData.systemInfo.wHeight - 90 - 130,
        width: 45,
        height: 45
      },
      clickable: true
    }, {
      iconPath: "/img/checkcar_map_carlocation.png",
      id: 1,
      position: {
        left: app.globalData.systemInfo.wWidth - 55,
        top: app.globalData.systemInfo.wHeight - 135 - 130,
        width: 45,
        height: 45
      },
      clickable: true
    }],
    owner: {
      zlevel: 11
    },
    polyline: [],
    idTimer: 0
  },
  mapCtx: null,
  gps84: [],
  polyline: [],
  carId: null,
  onLoad(option) {
    var self = this
    self.setCarid()
    var dataVehicleInfo = JSON.parse(option.VehicleInfo)
    self.setData({
      dataVehicleInfo: dataVehicleInfo,
      VehicleInfo: dataVehicleInfo
    })
  },

  setCarid() {
    var self = this
    self.carId = randomNum(10000, 49999)
    var carIds = app.globalData.carId
    for (var item in carIds) {
      if (self.carId === carIds[item]) {
        self.carId = randomNum(10000, 99999);
        self.setCarid()
      }
    }
    carIds.push(self.carId)
    self.setData({
      mapId: 'myMap' + self.carId
    })
    self.mapCtx = wx.createMapContext(self.data.mapId, this)
    console.log('carIds')
    console.log(self.data.mapId)
  },
  onReady() {
    var self = this, anchor
    var system = app.globalData.systemInfo
    if (system.System.toLocaleLowerCase().match('ios')) {
      anchor = {
        x: 0.5,
        y: 0.5
      }
    } else {
      anchor = {
        x: 0.5,
        y: 1
      }
    }
    var Camera = false;
    if (self.data.dataVehicleInfo.CameraNum !== 0) {
      Camera = true
    }
    var markers = [], path
    //self.setCarid();
    markers[1] = {
      //iconPath: "/img/trackdetails_origin_icon.png",
      iconPath: "/img/checkcar_online_bigcar_icon.png",
      id: self.carId,
      width: 29,
      height: 47,
      longitude: self.data.dataVehicleInfo.Lon,
      latitude: self.data.dataVehicleInfo.Lat,
      title: self.data.dataVehicleInfo.VehicleNo,
      rotate: self.data.dataVehicleInfo.Direction,
      anchor: anchor
    }
    console.log(self.carId)
    markers[0] = {
      iconPath: "/img/trackdetails_origin_icon.png",
      id: 0,
      width: 29,
      height: 47,
      longitude: self.data.dataVehicleInfo.Lon,
      latitude: self.data.dataVehicleInfo.Lat,
      //anchor: anchor
    }

    self.polyline[0] = {
      points: [{
        latitude: parseFloat(self.data.dataVehicleInfo.Lat),
        longitude: parseFloat(self.data.dataVehicleInfo.Lon)
      }],
      arrowLine: true,
      // arrowIconPath:'/img/line_arrow.png',
      color: '#00bc00',
      width: 3,
      borderColor: '#008200',
      borderWidth: 1
    }
    self.setData({
      //dataVehicleInfo: self.data.dataVehicleInfo,
      //VehicleInfo: self.data.dataVehicleInfo,
      markers: markers,
      polyline: self.polyline,
      Camera: Camera,
      owner: {
        longitude: self.data.dataVehicleInfo.Lon,
        latitude: self.data.dataVehicleInfo.Lat,
        zlevel: 20
      }
    })
    clearTimeout(getStatus)
    getStatus = setTimeout(function () {
      self.getStatus()
    }, 50)
  },
  //地图组件
  controltap(e) {
    var self = this
    switch (e.controlId) {
      case 0:
        self.setData({
          owner: {
            longitude: app.globalData.ownLocation.oLon,
            latitude: app.globalData.ownLocation.oLat,
          }
        })
        self.mapCtx.moveToLocation()
        break
      case 1:
        self.setData({
          owner: {
            longitude: self.data.VehicleInfo.Lon,
            latitude: self.data.VehicleInfo.Lat,
          }
        })
        break
    }
  },
  stepCar: 0,
  autoAnimate() {
    var self = this;
    console.log(self.stepCar)
    setTimeout(function () {
      self.setData({
        owner: {
          longitude: self.polyline[0].points[self.stepCar].longitude,
          latitude: self.polyline[0].points[self.stepCar].latitude
        }
      })
    }, 10000)

    self.mapCtx.translateMarker({
      markerId: self.carId,
      destination: {
        longitude: self.polyline[0].points[self.stepCar].longitude,
        latitude: self.polyline[0].points[self.stepCar].latitude
      },
      autoRotate: true,
      rotate: self.data.dataVehicleInfo.Direction,
      duration: 25000,
      animationEnd() {
        console.log('end-big')
      }
    })
  },
  toAnimate(i, points, duration) {
    var self = this;
    var points = points
    console.log(points)
    self.mapCtx.translateMarker({
      markerId: self.carId,
      destination: {
        longitude: points[i].longitude,
        latitude: points[i].latitude
      },
      autoRotate: true,
      rotate: self.data.VehicleInfo.Direction,
      duration: duration,
      animationEnd() {
        console.log('end')
        if (i < points.length - 1) {
          var t = i + 1
          console.log(t)
          self.toAnimate(t, points, duration)
        } else {
          return
        }
      }
    })
  },
  points: [],
  tempData: [],
  getStatus(index) {
    var self = this;
    //调取倒计时
    clearInterval(idTimer)
    idTimerIndex = 0
    idTimer = setInterval(function () {
      idTimerIndex++
      self.setData({
        idTimer: ((idTimerIndex * 100000) / 25000)
      })
    }, 1000)
    app.getJson(GetDevVehicleStateUrl, { devNo: self.data.VehicleInfo.DeviceNo }, 'GET', function (res) {
      if (res.Code === 0) {
        var VehicleInfo = self.data.VehicleInfo
        var markers = self.data.markers
        VehicleInfo.VehicleStatus = res.Data[0].DeviceStatusStr
        VehicleInfo.GpsDateTime = res.Data[0].LastDWTime
        VehicleInfo.Address = res.Data[0].SerAddress
        for (var i in res.Data[0].otherProperty) {
          if (res.Data[0].otherProperty[i].pKey === "Direction") {
            VehicleInfo.Direction = res.Data[0].otherProperty[i].pValue
          }
        }
        self.gps84 = wgs84togcj02(res.Data[0].Lon, res.Data[0].Lat)
        VehicleInfo.Speed = res.Data[0].Speed
        VehicleInfo.Lon = self.gps84[0]
        VehicleInfo.Lat = self.gps84[1]

        switch (res.Data[0].VehicleStatusFlag) {
          case 4:
            VehicleInfo.icon = "/img/checkcar_online_bigcar_icon.png"
            //markers[1].path = "/img/checkcar_online_bigcar_icon.png"
            break;
          case 2:
            VehicleInfo.icon = "/img/checkcar_online_bigcar_icon.png"
            //markers[1].path = "/img/checkcar_online_bigcar_icon.png"
            break;
          case 5:
            VehicleInfo.icon = "/img/checkcar_online_bigcar_icon.png"
            //markers[1].path = "/img/checkcar_online_bigcar_icon.png"
            break;
          case 3:
            VehicleInfo.icon = "/img/checkcar_communication_outage_bigcar_icon.png"
            //markers[1].path = "/img/checkcar_communication_outage_bigcar_icon.png"
            break;
          case 1:
            VehicleInfo.icon = "/img/checkcar_locationfailure_bigcar_icon.png"
            //markers[1].path = "/img/checkcar_locationfailure_bigcar_icon.png"
            break;
          default:
            VehicleInfo.icon = "/img/checkcar_locationfailure_bigcar_icon.png"
            //markers[1].path = "/img/checkcar_online_bigcar_icon.png"
            break;
        }
        switch (res.Data[0].ConectStatus) {
          case true:
            VehicleInfo.ComIco = "/img/i_mobile_open.png"
            break;
          case false:
            VehicleInfo.ComIco = "/img/i_mobile_off.png"
            break;
          default:
            VehicleInfo.ComIco = "/img/i_mobile_off.png"
            break;
        }
        switch (res.Data[0].DWStatus) {
          case true:
            VehicleInfo.GpsIco = "/img/i_bd_open.png"
            break;
          case false:
            VehicleInfo.GpsIco = "/img/i_bd_off.png"
            break;
          default:
            VehicleInfo.GpsIco = "/img/i_bd_off.png"
            break;
        }

        var lastPoint = self.polyline[0].points.length - 1
        if (self.polyline[0].points[lastPoint].latitude !== VehicleInfo.Lat && self.polyline[0].points[lastPoint].longitude !== VehicleInfo.Lon) {
          self.stepCar = self.stepCar + 1
          self.polyline[0].points.push({
            longitude: parseFloat(VehicleInfo.Lon),
            latitude: parseFloat(VehicleInfo.Lat)
          })
          self.setData({
            VehicleInfo: VehicleInfo,
            polyline: self.polyline,
          })
          
          self.autoAnimate()
          //clearTimeout(getStatus)
          getStatus = setTimeout(function () {
            self.getStatus()
          }, 25000)
        } else {
          self.setData({
            VehicleInfo: VehicleInfo,
          })
          //clearTimeout(getStatus)
          getStatus = setTimeout(function () {
            self.getStatus()
          }, 25000)
        }
      }
    }, app.globalData.userState.token, true)
  },
  onUnload() {
    clearTimeout(getStatus)
    this.setCarid();
  },
  onHide() {
    clearTimeout(getStatus)
  },
  onShow() {
    var self = this;
    getStatus = setTimeout(function () {
      self.getStatus()
    }, 300)
  },
  toDetail(e) {
    console.log(e)
    var self = this;
    clearTimeout(getStatus)
    wx.redirectTo({
      url: '/pages/car/intro?VehicleNo=' + e.target.dataset.vehicleno + '&step=' + e.target.dataset.step + '&camera=' + self.data.Camera + '&devNo=' + self.data.VehicleInfo.DeviceNo
    })
  }
})