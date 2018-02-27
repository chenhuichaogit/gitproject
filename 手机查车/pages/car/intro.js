// pages/car/intro.js

const strservicef = require('../../utils/config').strservicef

const DrivingBehaviorsStatUrl = require('../../utils/config').DrivingBehaviorsStatUrl
const DrivingMileageStatUrl = require('../../utils/config').DrivingMileageStatUrl
const QueryAlarmStatUrl = require('../../utils/config').QueryAlarmStatUrl
const HisLocStatUrl = require('../../utils/config').HisLocStatUrl
const GetDrivingMediasUrl = require('../../utils/config').GetDrivingMediasUrl
const GetDevVehicleStateUrl = require('../../utils/config').GetDevVehicleStateUrl
const formatTime = require('../../utils/util').formatTime

var wxCharts = require('../../utils/wxcharts.js');
var app = getApp()
var getHistory, statusTimer;
var radarChart = null, lineChart = null, barCanvas = null, windowWidth = 320;
Page({
  data: {
    step: 'info',
    Camera: false,
    returnData: '',
    indicator: [],
    companyInfo: '',
    VehicleNo: '',
    tabactive: '',
    groupActive: ['active', '', ''],
    groupAlermActive: ['active', ''],
    groupHistoryActive: ['active', ''],
    nowDate: '',
    mileageParms: '',
    mileageData: '',
    mileageTopData: [{ title: '当日总里程' }, { title: '当日耗油量' }],
    mileageDate: '',
    dateBox: false,
    enableScroll: false,
    EndDateTime: '',
    AlarmDayData: '',
    alermDate: '',
    alermParms: '',
    alermCard: [],
    HistoryData: [],
    historyParms: '',
    historyDate: '',
    photoMap: true,
    owner: {
      zlevel: 11
    },
    loadStatus: 0
  },
  mediaCtx: null,
  categories: [],
  radarData: [],
  onLoad: function (options) {

    console.log(options)
    var self = this
    self.mediaCtx = wx.createMapContext('myMedia')
    var nowDate = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    var Camera = false;
    if (options.camera !== 'false') {
      Camera = true
    }

    wx.setNavigationBarTitle({
      title: options.VehicleNo + '信息'
    })

    self.setData({
      VehicleNo: options.VehicleNo,
      DeviceNo: options.devNo,
      step: options.step,
      nowDate: nowDate,
      mileageDate: [nowDate, nowDate],
      alermDate: [nowDate, nowDate],
      historyDate: '',
      Camera: Camera,
      owner: {
        longitude: 114.3052500000,
        latitude: 30.5927600000,
      }
    })

    var tabactive = new Array(5)
    setTimeout(function () {
      self.getInfo()
      switch (options.step) {
        case 'info':
          tabactive[0] = 'active'
          self.getInfo()
          self.getStatus()
          break;
        case 'mileage':
          tabactive[1] = 'active'
          self.getMileage()
          break;
        case 'alerm':
          tabactive[2] = 'active'
          self.getAlerm()
          break;
        case 'history':
          tabactive[3] = 'active'
          self.getHistory()
          break;
        case 'photos':
          tabactive[4] = 'active'
          self.getMedia()
          break;
      }
      self.setData({
        tabactive: tabactive
      })
    }, 500)
  },
  //获取基础信息
  getInfo() {
    var self = this;
    console.log('========getInfo===============')
    app.getJson(DrivingBehaviorsStatUrl + '?vehicleNo=' + self.data.VehicleNo, {}, 'POST', function (res) {
      console.log(res)
      self.categories = []
      if (res.Code === 0) {
        self.setData({
          returnData: res.Data.ReturnData,
          indicator: res.Data.Indicator,
          companyInfo: res.Data.CompanyInfo
        })
        for (var i in res.Data.Indicator) {
          self.categories.push(res.Data.ReturnData[0].value[i] + ',' + res.Data.Indicator[i].split + ',' + res.Data.Indicator[i].name)
        }

        radarChart = new wxCharts({
          canvasId: 'radarCanvas',
          type: 'radar',
          legend: false,
          categories: self.categories,
          dataLabel: false,
          series: [{
            data: self.data.returnData[0].value
          }],
          width: windowWidth * 0.9,
          height: 300,
          extra: {
            radar: {
              //max: 150
            }
          }
        });
      }
    }, app.globalData.userState.token)
  },

  loadStatus: 0,
  loadtime: 0,
  //获取实时状态 
  getStatus() {
    var self = this;
    var lt = 0
    var getStatusin = function () {
      app.getJson(GetDevVehicleStateUrl, { devNo: self.data.DeviceNo }, 'GET', function (res) {
        console.log(res)
        if (res.Code === 0) {
          self.setData({
            DeviceStatus: res.Data[0]
          })
        }
      }, app.globalData.userState.token)
    }


    getStatusin()
    clearInterval(statusTimer)
    statusTimer = setInterval(function () {
      console.log(lt)
      if (lt >= 30) {
        lt = 0
        getStatusin()
      } else {
        lt = lt + 1;
      }
      self.setData({
        loadStatus: Math.floor((lt / 30) * 100)
      })
    }, 1000)






  },
  //获取里程统计
  getMileage() {
    var self = this;
    var mileageParms = self.data.mileageParms || {
      "TypeId": 1,
      "VehicleNo": self.data.VehicleNo
    }
    console.log(mileageParms)
    app.getJson(DrivingMileageStatUrl, mileageParms, 'POST', function (res) {
      if (res.Code === 0) {
        var returnData
        console.log('res.Data.daymilagestat.length====' + res.Data.daymilagestat.length)
        if (res.Data.daymilagestat.length > 13) {
          returnData = res.Data.daymilagestat.reverse().slice(0, 7);
        } else {
          returnData = res.Data.daymilagestat.reverse()
        }

        var categories = [];
        var mileage = [];
        var oilcom = [];
        console.log('returnData====')
        console.log(returnData)
        self.mileageTopData = self.data.mileageTopData
        self.mileageTopData[0].value = res.Data.daytotalmileage
        self.mileageTopData[1].value = res.Data.daytotaltimes
        var mileageData = returnData
        self.setData({
          dateBox: false,
          enableScroll: false,
          mileageTopData: self.mileageTopData,
          mileageData: mileageData
        })

        for (var i in returnData) {
          categories[i] = returnData[i].title
          mileage[i] = returnData[i].mileage
          oilcom[i] = returnData[i].oilcom
        }
        lineChart = new wxCharts({
          canvasId: 'lineCanvas',
          type: 'column',
          categories: categories.reverse(),
          animation: true,
          //enableScroll: true,
          series: [{
            name: '总里程',
            data: mileage.reverse()
          }, {
            name: '耗油量',
            data: oilcom.reverse()
          }],
          xAxis: {
            disabled: true,
          },
          yAxis: {
            gridColor: "#ffffff",
            min: 0.0,
            format: function (val) {
              return val.toFixed(1)
            }
          },
          width: windowWidth * 0.9,
          height: 200,
          dataLabel: true,
          dataPointShape: true,
        });
      }
    }, app.globalData.userState.token)
  },
  //获取报警信息
  getAlerm() {
    var self = this;
    var alermParms = self.data.alermParms || {
      "TypeId": 1,
      "VehicleNo": self.data.VehicleNo
    }
    console.log(alermParms)
    app.getJson(QueryAlarmStatUrl, alermParms, 'POST', function (res) {
      console.log(res)
      if (res.Code === 0) {
        var AlarmDayData = res.Data.AlarmDayData.reverse().slice(0, 7);
        var categories = [];
        var alermvalue = [];

        var AlermTypeListData = res.Data.AlermTypeListData
        var alermCard = new Array(AlermTypeListData.length)
        for (var i in AlermTypeListData) {
          if ((i + 1) % 1 === 0) {
            alermCard[i] = 'alerm-card-blue'
          } else if ((i + 1) % 2 === 0) {
            alermCard[i] = 'alerm-card-red'
          } else if ((i + 1) % 3 === 0) {
            alermCard[i] = 'alerm-card-green'
          }
        }

        console.log(alermCard)

        self.setData({
          dateBox: false,
          enableScroll: false,
          AlarmDayData: AlarmDayData.reverse(),
          AlermTypeListData: AlermTypeListData,
          EndDateTime: formatTime(new Date(res.Data.EndDateTime)),
          alermCard: alermCard
        })

        for (var i in AlarmDayData) {
          categories[i] = AlarmDayData[i].title
          alermvalue[i] = AlarmDayData[i].value
        }
        barCanvas = new wxCharts({
          canvasId: 'barCanvas',
          type: 'column',
          categories: categories,
          animation: true,
          //enableScroll: true,
          series: [{
            name: '报警数量',
            data: alermvalue
          }],
          xAxis: {
            disabled: true,
          },
          yAxis: {
            gridColor: "#ffffff",
            min: 0.0,
            format: function (val) {
              return val.toFixed(1)
            }
          },
          width: windowWidth * 0.9,
          height: 200,
          dataLabel: true,
          dataPointShape: true,
        });
      }
    }, app.globalData.userState.token)
  },

  startDate: null,
  endDate: null,
  mileageParms: null,
  mileageTopData: null,
  groupActive: null,
  selectMeliData(e) {
    var self = this;
    var index = parseInt(e.target.dataset.index)
    self.groupActive = new Array(3)
    self.groupActive[index] = 'active'
    switch (index) {
      case 0:
        self.mileageParms = {
          "TypeId": '1',
          "VehicleNo": self.data.VehicleNo
        }
        self.mileageTopData = [{ title: '当日总里程' }, { title: '当日耗油量' }]
        break;
      case 1:
        self.mileageParms = {
          "TypeId": '3',
          "VehicleNo": self.data.VehicleNo
        }
        self.mileageTopData = [{ title: '当月总里程' }, { title: '当月耗油量' }]
        break;
      case 2:
        self.setData({
          enableScroll: true,
          dateBox: true
        })
        self.mileageTopData = [{ title: '近日总里程' }, { title: '近日耗油量' }]
        return
        break;
    }
    app.stopRequest(function (res) {
      if (res === true) {
        self.setData({
          groupActive: self.groupActive,
          mileageParms: self.mileageParms,
          mileageTopData: self.mileageTopData
        })
        setTimeout(function () {
          self.getMileage()
        }, 200)
      }
    })
  },
  alermParms: null,
  groupAlermActive: null,
  selectAlermData(e) {
    var self = this;
    var index = parseInt(e.target.dataset.index)
    self.groupAlermActive = new Array(2)
    self.groupAlermActive[index] = 'active'
    switch (index) {
      case 0:
        self.alermParms = {
          "TypeId": '1',
          "VehicleNo": self.data.VehicleNo
        }

        break;
      case 1:
        self.setData({
          enableScroll: true,
          dateBox: true
        })
        return
        break;
    }
    app.stopRequest(function (res) {
      if (res === true) {
        self.setData({
          groupAlermActive: self.groupAlermActive,
          alermParms: self.alermParms
        })
        setTimeout(function () {
          self.getAlerm()
        }, 200)
      }
    })
  },
  historyParms: {
    "TypeId": 1,
    "VehicleNo": "",
    "TrackTime": 3,
    "pageIndex": 1,
    "pageSize": 8
  },
  groupHistoryActive: null,
  selectHistoryData(e) {
    var self = this;
    var index = parseInt(e.target.dataset.index)
    self.groupHistoryActive = new Array(2)
    self.groupHistoryActive[index] = 'active'
    switch (index) {
      case 0:
        self.historyParms = {
          "TypeId": '1',
          "VehicleNo": self.data.VehicleNo,
          "TrackTime": 3,
          "pageIndex": 1,
          "pageSize": 8
        }
        break;
      case 1:
        self.setData({
          dateBox: true
        })
        return
        break;
    }
    app.stopRequest(function (res) {
      if (res === true) {
        self.setData({
          groupHistoryActive: self.groupHistoryActive,
          historyParms: self.historyParms
        })
        setTimeout(function () {
          self.getHistory()
        }, 200)
      }
    })
  },
  //获取历史轨迹
  getHistory() {
    var self = this;
    var historyParms = self.historyParms
    historyParms.VehicleNo = self.data.VehicleNo
    console.log(self.historyParms)
    app.getJson(HisLocStatUrl, historyParms, 'POST', function (res) {
      console.log(res)
      if (res.Code === 0) {
        var HistoryData = res.Data.reverse()

        for (var i in HistoryData) {
          HistoryData[i].STime = (HistoryData[i].StartDateTime).replace(/T/, ' ')
          HistoryData[i].ETime = (HistoryData[i].EndDateTime).replace(/T/, ' ')
        }
        self.setData({
          dateBox: false,
          enableScroll: false,
          HistoryData: HistoryData
        })
      }
    }, app.globalData.userState.token)
  },
  loadHistory() {
    var self = this;
    self.historyParms.VehicleNo = self.data.VehicleNo
    clearTimeout(getHistory)
    app.stopRequest(function (res) {
      if (res === true) {
        getHistory = setTimeout(function () {
          self.getHistory()
        }, 1000)
      }
    })
  },
  toHistoryDetail(e) {
    var self = this
    var startTime = e.currentTarget.dataset.start
    var endTime = e.currentTarget.dataset.end
    var mileage = e.currentTarget.dataset.mileage
    wx.redirectTo({
      url: '/pages/car/track?vehicleno=' + this.data.VehicleNo + '&startTime=' + startTime + '&endTime=' + endTime + '&mileage=' + mileage+'&new=true',
    })
  },
  //处理日期
  bindDateChange(e) {
    console.log(e)
    var self = this;
    var index = parseInt(e.target.dataset.index)
    var mileageDate = self.data.mileageDate
    mileageDate[index] = e.detail.value
    self.setData({
      mileageDate: mileageDate
    })
  },
  bindAlermDateChange(e) {
    console.log(e)
    var self = this;
    var index = parseInt(e.target.dataset.index)
    var alermDate = self.data.alermDate
    alermDate[index] = e.detail.value
    self.setData({
      alermDate: alermDate
    })
  },
  bindHistoryDateChange(e) {
    console.log(e)
    var self = this;
    var index = parseInt(e.target.dataset.index)
    var historyDate = self.data.historyDate
    historyDate = e.detail.value
    self.setData({
      historyDate: historyDate
    })
    self.submitHistoryDate()
  },
  submitDate() {
    var self = this;
    self.mileageParms = {
      "TypeId": '2',
      "StartDateTime": self.data.mileageDate[0],
      "EndDateTime": self.data.mileageDate[1],
      "VehicleNo": self.data.VehicleNo
    }
    self.groupActive = [null, null, 'active']
    app.stopRequest(function (res) {
      if (res === true) {
        self.setData({
          groupActive: self.groupActive,
          mileageParms: self.mileageParms,
          mileageTopData: self.mileageTopData
        })
        setTimeout(function () {
          self.getMileage()
        }, 200)
      }
    })
  },
  submitAlermDate() {
    var self = this;
    self.alermParms = {
      "TypeId": '2',
      "StartDateTime": self.data.alermDate[0],
      "EndDateTime": self.data.alermDate[1],
      "VehicleNo": self.data.VehicleNo
    }
    self.groupAlermActive = [null, 'active']
    app.stopRequest(function (res) {
      if (res === true) {
        self.setData({
          groupAlermActive: self.groupAlermActive,
          alermParms: self.alermParms
        })
        setTimeout(function () {
          self.getAlerm()
        }, 200)
      }
    })
  },
  submitHistoryDate() {
    var self = this;
    var nowDate = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
    self.historyParms = {
      "TypeId": '2',
      "StartDateTime": self.data.historyDate,
      "EndDateTime": nowDate,
      "VehicleNo": self.data.VehicleNo,
      "TrackTime": 3,
      "pageIndex": 1,
      "pageSize": 8
    }
    self.groupHistoryActive = [null, 'active']
    app.stopRequest(function (res) {
      if (res === true) {
        self.setData({
          HistoryData: [],
          groupHistoryActive: self.groupHistoryActive,
          historyParms: self.historyParms
        })
        setTimeout(function () {
          self.getHistory()
        }, 200)
      }
    })
  },
  cancleDate() {
    this.setData({
      dateBox: false
    })
  },
  enableScroll(e) {
    console.log(e)
    var self = this
    self.setData({
      enableScroll: true
      //dateBox: true
    })
  },
  disableScroll(e) {
    console.log(e)
    var self = this
    self.setData({
      enableScroll: false
      //dateBox: true
    })
  },

  /*
  
   data:[
      {
        "VehicleNo": "string",
        "Lon": 0,
        "Lat": 0,
        "Address": "string",
        "ImageTotal": 0,
        "StartTime": "2017-11-24T09:37:36.107Z",
        "EndTime": "2017-11-24T09:37:36.107Z",
        "ImageUrls": [
          "string"
        ],
        "ImageUrlsSm": [
          "string"
        ],
        "ImageUrlsMi": [
          "string"
        ],
        "ImageUrlZoom": [
          "string"
        ]
      }
   */



  //获取照片墙
  getMedia() {
    var self = this
    app.getJson(GetDrivingMediasUrl, { vehicleNo: self.data.VehicleNo }, 'GET', function (res) {
      console.log(res)
      var photoMarkers = [], allPhotoPoi = []
      if (res.Code === 0 && res.Data.length > 0) {
        var photoData = res.Data
        var photoTempData = photoData
        for (var i = 0; i < photoData.length; i++) {
          photoMarkers.push({
            iconPath: "/img/photowall_photo_location_all.png",
            id: i + 5000,
            width: 37,
            height: 37,
            longitude: photoData[i].Lon,
            latitude: photoData[i].Lat,
            callout: {
              content: photoData[i].ImageTotal + '张照片',
              color: '#ffffff',
              fontSize: 12,
              bgColor: '#ff3300',
              padding: 5,
              borderRadius: 50,
              display: "ALWAYS"
            }
          })
          allPhotoPoi.push({
            longitude: photoData[i].Lon,
            latitude: photoData[i].Lat
          })

          for (var t in photoData[i].ImageUrlZoom) {
            photoTempData[i].ImageUrlZoom[t] = strservicef + photoData[i].ImageUrlZoom[t]
          }

          for (var t in photoData[i].ImageUrlsMi) {
            photoTempData[i].ImageUrlsMi[t] = strservicef + photoData[i].ImageUrlsMi[t]
          }

          for (var t in photoData[i].ImageUrlsSm) {
            photoTempData[i].ImageUrlsSm[t] = strservicef + photoData[i].ImageUrlsSm[t]
          }


          photoTempData[i].StartTime = photoData[i].StartTime.replace(/T/, " ")
          photoTempData[i].EndTime = photoData[i].EndTime.replace(/T/, " ")


        }
        self.setData({
          photoMarkers: photoMarkers,
          allPhotoPoi: allPhotoPoi,
          photoData: photoData,
        })
      } else {
        console.log('今日没有任何照片上传！')
        wx.showToast({
          title: '今日没有任何照片上传！',
          icon: 'loading',
          mask: true
        })

        // app.globalData.errorMsg = '今日没有任何照片上传！';
        // setTimeout(function () {
        //   app.globalData.errorMsg = '';
        // }, 5000)



      }

    }, app.globalData.userState.token)
  },
  switchPhotos(e) {
    var self = this
    self.setData({
      photoMap: !self.data.photoMap
    })
  },
  toPhotosDetail(e) {
    console.log(e)
    var self = this
    var photoData = self.data.photoData
    var index = e.markerId - 5000
    wx.navigateTo({
      url: '/pages/car/media?photoData=' + JSON.stringify(photoData[index])
    })
  },
  toPhotoDetail(e) {
    console.log(e)
    var self = this
    var photoData = self.data.photoData
    var index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '/pages/car/media?photoData=' + JSON.stringify(photoData[index])
    })

  },
  toAlermDetail(e) {
    var self = this
    var typeid = e.currentTarget.dataset.typeid
    wx.navigateTo({
      url: '/pages/car/alerm?alarmtypeid=' + typeid + '&VehicleNo=' + self.data.VehicleNo + '&endtime=' + self.data.EndDateTime,
    })
  },

  toStep(e) {
    console.log(e)
    var self = this;
    var tabactive = new Array(5)
    setTimeout(function () {
      switch (e.target.dataset.step) {
        case 'info':
          tabactive[0] = 'active'
          self.getInfo()
          self.getStatus()
          break;
        case 'mileage':
          tabactive[1] = 'active'
          self.getMileage()
          break;
        case 'alerm':
          tabactive[2] = 'active'
          self.getAlerm()
          break;
        case 'history':
          tabactive[3] = 'active'
          self.historyParms.pageIndex = 1
          self.setData({
            HistoryData: []
          })
          self.getHistory()
          break;
        case 'photos':
          tabactive[4] = 'active'
          self.getMedia()
          break;
      }
      self.setData({
        step: e.target.dataset.step,
        tabactive: tabactive
      })
    }, 200)
  },
  onHide() {
    clearInterval(statusTimer)
  },
  onUnload() {
    clearInterval(statusTimer)
  }

})