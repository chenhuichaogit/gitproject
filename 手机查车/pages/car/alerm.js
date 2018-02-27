const QueryAlarmDetailUrl = require('../../utils/config').QueryAlarmDetailUrl
const formatTime = require('../../utils/util').formatTime
var app = getApp()
Page({
  data: {
    VehicleNo: '',
    EndDateTime: null,
    alermData: [],
    alermTopic: null,
    owner: {
      longitude: 114.3052500000,
      latitude: 30.5927600000,
      zlevel: 18
    },
  },
  onLoad: function (options) {
    console.log(options)
    var self = this
    self.setData({
      VehicleNo: options.VehicleNo,
      EndDateTime: options.endtime,
      AlarmTypeId: options.alarmtypeid
    })

    self.getAlermDetail()
  },
  alermPamas: {
    "TypeId": 2,
    "VehicleNo": "",
    "AlarmTypeId": 0
  },
  getAlermDetail() {
    var self = this
    self.alermPamas.EndDateTime = self.data.EndDateTime
    self.alermPamas.VehicleNo = self.data.VehicleNo
    self.alermPamas.AlarmTypeId = self.data.AlarmTypeId
    app.getJson(QueryAlarmDetailUrl, self.alermPamas, 'POST', function (res) {


      
      console.log(res)
      if (res.Code === 0) {
        var alermData = res.Data.reverse()
        var markers = [{
          iconPath: "/img/earlywarning_alarm's_location.png",
          id: 10,
          width: 42,
          height: 57,
          longitude: alermData[0].Lon,
          latitude: alermData[0].Lat
        }], includePoints = []
        for (var i in alermData) {
          markers.push({
            iconPath: "/img/earlywarning_alarm's_location.png",
            id: 2000 + i,
            width: 42,
            height: 57,
            longitude: alermData[i].Lon,
            latitude: alermData[i].Lat
          })

          includePoints[i] = {
            longitude: alermData[i].Lon,
            latitude: alermData[i].Lat
          }
          alermData[i].GpsDateTime = formatTime(new Date(alermData[i].GpsDateTime))
        }

        //markers[0].longitude = alermData[i].Lon
        //markers[0].latitude = alermData[i].Lat

        self.setData({
          alermData: alermData,
          alermTopic: alermData[0],
          markers: markers,
          includePoints: includePoints
        })
      }
    }, app.globalData.userState.token)
  },
  switchAlerm(e) {
    var self = this
    var count = e.currentTarget.dataset.count
    var alermData = self.data.alermData
    var markers = self.data.markers[0]
    var markerTop = []
    markerTop.push(markers)
    var topic
    for (var i in alermData) {
      if (alermData[i].Count === count) {
        markerTop[0].longitude = alermData[i].Lon
        markerTop[0].latitude = alermData[i].Lat
        topic = i
      }
    }
    self.setData({
      alermTopic: alermData[topic],
      markers: markerTop,
      owner: {
        longitude: alermData[topic].Lon,
        latitude: alermData[topic].Lat,
        zlevel: 20
      },
    })
  }
})