// pages/car/track.js
const HisLocPayUrl = require('../../utils/config').HisLocPayUrl
const wgs84togcj02 = require('../../utils/gps').wgs84togcj02
const formatTime = require('../../utils/util').formatTime
const randomNum = require('../../utils/util').randomNum
var app = getApp()
var animaTimer
Page({
  data: {
    mapId:'trackMap',
    VehicleNo: '',
    startTime: '',
    endTime: '',
    Mileage: '',
    markers: null,
    owner: null,
    includePoints: null,
    polyline: [],
    VehicleInfo: null,
    animatedStart: false,
    onHide: false
  },
  mapCtx: null,
  gps84: [],
  polyline: [],
  carId: null,
  onLoad: function (options) {
    var self = this
    clearTimeout(animaTimer)
    self.setCarid();
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.vehicleno + ' 轨迹详情'
    })

    self.setData({
      VehicleNo: options.vehicleno,
      startTime: options.startTime,
      endTime: options.endTime,
      Mileage: options.mileage
    })
    setTimeout(function () {
      app.stopRequest(function (res) {
        if (res === true) {
          self.getTrackData()
        }
      })
    }, 200)
  },
  setCarid() {
    var self = this
    self.carId = randomNum(50000, 99999)
    var trackId = app.globalData.trackId
    for (var item in trackId) {
      if (self.carId === trackId[item]) {
        self.carId = randomNum(50000, 99999);
        self.setCarid()
      }
    }
    trackId.push(self.carId)
    self.setData({
      mapId: 'trackMap' + self.carId
    })
    self.mapCtx = wx.createMapContext(self.data.mapId, this)
    console.log('carIds')
    console.log(self.data.mapId)
  },
  trackPamas: {
    "TypeId": 0,
    "StartDateTime": "",
    "EndDateTime": "",
    "VehicleNo": "",
    "TrackTime": 0,
    "pageIndex": 0,
    "pageSize": 0
  },
  getTrackData() {
    var self = this;

    self.trackPamas.StartDateTime = self.data.startTime
    self.trackPamas.EndDateTime = self.data.endTime
    self.trackPamas.VehicleNo = self.data.VehicleNo
    var trackPamas = self.trackPamas
    var markers = [], includePoints = [], anchor
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
    app.getJson(HisLocPayUrl, trackPamas, 'POST', function (res) {
      if (res.Code === 0) {
        var dataVehicleInfo = res.Data
        console.log(dataVehicleInfo)
        wx.setStorage({
          key: '$tempData',
          data: dataVehicleInfo
        })
        for (var i in dataVehicleInfo) {
          includePoints.push({
            latitude: parseFloat(dataVehicleInfo[i].Lat),
            longitude: parseFloat(dataVehicleInfo[i].Lon)
          })
          var GpsDateTime = dataVehicleInfo[i].GpsDateTime.replace(/T/, ' ')
          dataVehicleInfo[i].GpsDateTime = GpsDateTime
        }

        self.polyline[0] = {
          points: includePoints,
          arrowLine: true,
          color: '#00bc00',
          width: 3,
          borderColor: '#008200',
          borderWidth: 1
        }
        markers[0] = {
          iconPath: "/img/trackdetails_origin_icon.png",
          id: 1001,
          width: 29,
          height: 47,
          longitude: includePoints[0].longitude,
          latitude: includePoints[0].latitude
        }
        markers[1] = {
          iconPath: "/img/trackdetails_destination_icon.png",
          id: 1000,
          width: 29,
          height: 47,
          longitude: includePoints[includePoints.length - 1].longitude,
          latitude: includePoints[includePoints.length - 1].latitude
        }
        markers[2] = {
          iconPath: "/img/checkcar_online_bigcar_icon.png",
          id: self.carId,
          width: 29,
          height: 47,
          longitude: includePoints[0].longitude,
          latitude: includePoints[0].latitude,
          title: self.data.VehicleNo,
          rotate: 90,
          anchor: anchor
        }
      }
      self.setData({
        polyline: self.polyline,
        includePoints: includePoints,
        markers: markers,
        dataVehicleInfo: dataVehicleInfo,
        VehicleInfo: dataVehicleInfo[self.stepCar]
      })

    }, app.globalData.userState.token)
  },
  stepCar: 0,
  autoAnimate() {
    var self = this;
    var totalStep = self.data.includePoints.length
    var p = ((self.stepCar + 1) / totalStep) * 100
    self.setData({
      VehicleInfo: self.data.dataVehicleInfo[self.stepCar],
      barWidth: p + '%',
    })
    self.setData({
      owner: {
        longitude: self.data.includePoints[self.stepCar].longitude,
        latitude: self.data.includePoints[self.stepCar].latitude,
      }
    })

    self.mapCtx.translateMarker({
      markerId: self.carId,
      destination: {
        longitude: self.data.includePoints[self.stepCar].longitude,
        latitude: self.data.includePoints[self.stepCar].latitude
      },
      autoRotate: true,
      rotate: 90,
      duration: 2500,
      animationEnd() {
        if (self.stepCar < totalStep - 1 && self.data.animatedStart) {
          self.stepCar = self.stepCar + 1
          self.autoAnimate()
          self.setData({
            owner: {
              longitude: self.data.includePoints[self.stepCar].longitude,
              latitude: self.data.includePoints[self.stepCar].latitude,
            }
          })
        } else if (self.stepCar >= totalStep - 1 && self.data.animatedStart) {
          self.stepCar = 0
          self.setData({
            animatedStart: !self.data.animatedStart,
          })
        } else {
          //self.markers[2].rotate = 
          self.setData({
            owner: {
              longitude: self.data.includePoints[self.stepCar].longitude,
              latitude: self.data.includePoints[self.stepCar].latitude,
            }
          })
          return
        }
      }
    })
  },
  startAnimate(e) {
    var self = this;
    self.setData({
      animatedStart: !self.data.animatedStart,
    })
    animaTimer = setTimeout(function () {
      if (self.data.animatedStart) {
        self.setData({
          owner: {
            zlevel: 18
          }
        })
        clearTimeout(animaTimer)
        console.log(self.data.mapId)
        //self.mapCtx = wx.createMapContext(self.data.mapId, this)
        self.autoAnimate()
      }
    }, 200)
  },
  onUnload() {
    var self = this
    //self.setCarid();
    console.log('app onHide')
  },
  onshow: function (options) {
    console.log('app onshow')
    console.log(options)
    var self = this
    if (self.data.onHide) {
      setTimeout(function () {
        app.stopRequest(function (res) {
          if (res === true) {
            self.getTrackData()
          }
        })
      }, 200)
      self.setData({
        onHide: false
      })
    }
  }
})