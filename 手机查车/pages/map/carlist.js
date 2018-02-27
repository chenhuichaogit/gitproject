// pages/map/carlist.js
const GetDevVehicleByVehicleNoUrl = require('../../utils/config').GetDevVehicleByVehicleNoUrl
const GetRegionListUrl = require('../../utils/config').GetRegionListUrl


var app = getApp()
var inputTimer, queryTimer;
var loadParms = {
  "VehicleNo": "",
  "DeviceNo": "",
  "EngineNumber": "",
  "FrameNumber": "",
  "VehicleType": 0,
  "UPStatus": "",
  "VehicleMaster": "",
  "DepartmentId": 0,
  "DevStatus": 0,
  "PlatformId": null,
  "ResourceTypeId": 0,
  "IsMainDev": 0,
  "ResourceTypeName": "",
  "isNotDevice": true,
  "ResourceTypeIds": null,
  "VehicleIds": null,
  "VehicleNos": null,
  "VehicleStatusFlag": [1, 2, 3, 4, 5],
  "PageIndex": 1,
  "PageSize": 10,
  "IgnorePage": true,
  'App_Key': '',
  "RegionCityCode": "",
  "RegionAreaCode": "",
}



Page({
  data: {
    VehicleList: [],
    Total: 0,
    loading: false,
    queryKey: '',
    cities: null,
    enterprise: null,
    queryCity: '',
    queryCode: null,
    districtName: '',
    districtCode: null,
    DistrictList: null,
    btnActive: null,
    btnStatusActive: null,
    searchCity: false,
    regionSelect: [false, false, false],
    queryEnterprise: [],
    queryDetail: false,
    enterpriseColor: [],
    StatusData: [1, 2, 3, 4, 5],
    hisQuery: null,
    loadData: false,
  },
  loadParms: {},
  onLoad: function (options) {
    var self = this
    //初始化
    var initData = wx.getStorageSync('$query_setting') || {
      queryCode: '',
      queryCity: '',
      districtName: '',
      districtCode: '',
      StatusData: [1, 2, 3, 4, 5]
    }
    console.log(options.status)
    if (options.status) {
      initData.StatusData = []
      initData.StatusData.push(parseInt(options.status))
    }
    //调取城市列表
    var cities = wx.getStorageSync('$cities')
    self.cities = cities
    //调取企业列表
    var enterprise = wx.getStorageSync('$enterprise')
    self.enterprise = enterprise
    var enterpriseColor = new Array()
    for (var i in enterprise) {
      enterpriseColor[i] = {
        checked: false,
        color: '#eeeff4'
      }
    }
    //初始化选择状态按钮颜色
    var btnStatusActive = new Array(6)
    for (var i in initData.StatusData) {
      btnStatusActive[initData.StatusData[i]] = 'active'
    }
    //初始化选择地区按钮颜色
    var btnActive = new Array()
    setTimeout(function () {
      self.setData({
        cities: cities,
        enterprise: enterprise,
        btnActive: btnActive,
        btnStatusActive: btnStatusActive,
        enterpriseColor: enterpriseColor,
        queryCode: initData.queryCode,
        queryCity: initData.queryCity,
        districtName: initData.districtName,
        districtCode: initData.districtCode,
        StatusData: initData.StatusData
      })
      self.getDistrict(initData.queryCode)
      console.log(self.data.StatusData)
    }, 200)
  },
  onReady: function () {
    var self = this
    self.loadParms = loadParms
    self.loadParms.PageIndex = 1
    app.stopRequest(function (res) {
      if (res === true) {
        setTimeout(function () {
          self.getVelcheList()
        }, 200)
      }
    })
  },
  onShow: function () {
    var self = this
    self.loadParms = loadParms
    app.stopRequest(function (res) {
      if (res === true) {
        setTimeout(function () {
          self.getVelcheList()
        }, 200)
      }
    })
  },
  //获取车辆列表信息
  getVelcheList() {
    var self = this
    self.loadParms.App_Key = app.globalData.AppKey
    if (self.data.queryCode === self.data.districtCode) {
      self.loadParms.RegionCityCode = self.data.queryCode + ''
      self.loadParms.RegionAreaCode = ''
    } else {
      self.loadParms.RegionCityCode = ''
      self.loadParms.RegionAreaCode = self.data.districtCode + ''
    }
    self.loadParms.VehicleStatusFlag = self.data.StatusData
    var queryEnterpriseIDs = []
    if (self.data.queryEnterprise.length > 0) {
      for (var i in self.data.queryEnterprise) {
        queryEnterpriseIDs.push(self.data.queryEnterprise[i].ResourceTypeId)
      }
    } else {
      queryEnterpriseIDs = null
    }
    self.loadParms.ResourceTypeIds = queryEnterpriseIDs
    console.log(self.loadParms)
    if (self.loadParms.PageIndex === 1) {
      self.setData({
        VehicleList: [],
        loading: true
      })
    }
    var VehicleList = self.data.VehicleList
    app.getJson(GetDevVehicleByVehicleNoUrl, self.loadParms, 'POST', function (res) {
      console.log('GetDevVehicleByVehicleNoUrl')
      console.log(res)
      if (res.Code === 0) {
        VehicleList = VehicleList.concat(res.Data.VehicleList)
        self.setData({
          VehicleList: VehicleList,
          Total: res.Data.Total,
          loading: false,
          loadData: true
        })

        if ((res.Data.VehicleList).length < self.loadParms.PageSize) {
          console.log((res.Data.VehicleList).length)
          self.setData({
            loading: false
          })
        }
        wx.setStorageSync('$VehicleData', res.Data)
      }
    }, app.globalData.userState.token)
  },

  //搜索
  inputQuery(e) {
    var self = this;
    var key = (e.detail.value).trim()
    key = key.replace(/(^\s*)|(\s*$)/g, '');
    clearTimeout(inputTimer)
    inputTimer = setTimeout(function () {
      console.log(key)
      self.loadParms = loadParms
      self.loadParms.VehicleNo = key
      self.setData({
        VehicleList: [],
        queryKey: key
      })
      app.stopRequest(function (res) {
        if (res === true) {
          setTimeout(function () {
            self.getVelcheList()
            self.storeQuery(key)
            self.showQuery()
          }, 200)
        }
      })
    }, 500)
  },
  storeQuery(key) {
    var self = this;
    var hisQuery = wx.getStorageSync('$historyKey') || []
    var tempHis = new Array()
    if (hisQuery.length > 0 && hisQuery.lenght < 10) {
      hisQuery.unshift(key)
    } else if (hisQuery.length >= 10) {
      hisQuery.unshift(key)
      hisQuery.splice(10, 1)
    } else {
      hisQuery.unshift(key)
    }
    //去空格
    for (var i in hisQuery) {
      if (hisQuery[i] && hisQuery[i] != "" && hisQuery[i] != undefined) {
        tempHis.push(hisQuery[i])
      }
    }
    //排重
    var resHis = [];
    var json = {};
    for (var i in tempHis) {
      if (!json[tempHis[i]]) {
        resHis.push(tempHis[i]);
        json[tempHis[i]] = 1;
      }
    }
    tempHis = resHis
    wx.setStorageSync('$historyKey', tempHis)
  },
  showQuery() {
    var self = this;
    var hisQuery = wx.getStorageSync('$historyKey') || []
    if (hisQuery.length > 0) {
      self.setData({
        hisQuery: hisQuery
      })
    }
    clearTimeout(queryTimer)
    queryTimer = setTimeout(function () {
      self.setData({
        hisQuery: null
      })
    }, 5000)
  },

  sHisQuery(e) {
    var self = this;
    var hisQuery = wx.getStorageSync('$historyKey') || []
    var index = e.currentTarget.dataset.index
    console.log(hisQuery[index])
    clearTimeout(inputTimer)
    inputTimer = setTimeout(function () {
      self.loadParms = loadParms
      self.loadParms.VehicleNo = hisQuery[index]
      self.setData({
        VehicleList: [],
        queryKey: hisQuery[index],
        hisQuery: null
      })
      app.stopRequest(function (res) {
        if (res === true) {
          setTimeout(function () {
            self.getVelcheList()
          }, 100)
        }
      })
    }, 50)
  },

  clearHisQuery(e) {
    var self = this;
    var hisQuery = wx.getStorageSync('$historyKey') || []
    hisQuery = []
    self.setData({
      VehicleList: [],
      hisQuery: null,
      queryKey: ''
    })
    wx.setStorageSync('$historyKey', hisQuery)
    clearTimeout(inputTimer)
    inputTimer = setTimeout(function () {
      self.loadParms = loadParms
      self.loadParms.VehicleNo = ''
      app.stopRequest(function (res) {
        if (res === true) {
          setTimeout(function () {
            self.getVelcheList()
          }, 100)
        }
      })
    }, 50)
  },

  toDetail(e) {
    var self = this;
    console.log(e)
    self.storageVehicleInfo(e.currentTarget.dataset.index)
  },
  storageVehicleInfo(id) {
    var self = this;
    if (!self.data.VehicleList[id]) {
      setTimeout(function () {
        self.storageVehicleInfo(id)
      }, 200)
      return
    }
    var _VehicleInfo = self.data.VehicleList[id]
    switch (self.data.VehicleList[id].VehicleStatusId) {
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

    switch (self.data.VehicleList[id].IsComIco) {
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

    switch (self.data.VehicleList[id].IsGpsIco) {
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
    _VehicleInfo.id = id
    wx.setStorageSync('$VehicleInfo', _VehicleInfo)
    console.log(_VehicleInfo)
    setTimeout(function () {
      wx.navigateTo({
        url: '/pages/car/index?VehicleInfo=' + JSON.stringify(_VehicleInfo)
      })
    }, 300)
  },
  freshData() {
    var self = this
    self.loadParms.PageIndex = 1
    app.stopRequest(function (res) {
      if (res === true) {
        setTimeout(function () {
          self.getVelcheList()
        }, 200)
      }
    })
  },
  loadData() {
    var self = this
    if (self.loadParms.PageIndex * self.loadParms.PageSize <= self.data.Total && self.data.loadData) {
      self.loadParms.PageIndex = self.loadParms.PageIndex + 1
      self.setData({
        loadData: false
      })
      app.stopRequest(function (res) {
        if (res === true) {
          setTimeout(function () {
            self.getVelcheList()
          }, 200)
        }
      })
    } else {
      return
    }
  },


  queryType(e) {
    var self = this;
    var type = e.currentTarget.dataset.type
    var regionSelect = [false, false, false]
    switch (type) {
      case 'region':
        regionSelect[0] = true
        self.setData({
          regionSelect: regionSelect
        })
        break;
      case 'enterprise':
        regionSelect[1] = true
        self.setData({
          regionSelect: regionSelect
        })
        break;
      case 'status':
        regionSelect[2] = true
        self.setData({
          regionSelect: regionSelect
        })
        break;
    }
  },
  city: null,
  //选择城市
  selectCity(e) {
    var self = this;
    var cityCode = e.currentTarget.dataset.code
    var cityName = e.currentTarget.dataset.name
    var cities = self.cities
    var btnActive = new Array()
    btnActive[999] = 'active'
    self.setData({
      queryCity: cityName,
      queryCode: cityCode,
      searchCity: false,
      districtCode: cityCode,
      districtName: '',
      cities: cities,
      btnActive: btnActive
    })
    self.getDistrict(cityCode)
  },
  //选择行政区
  selectDistrict(e) {
    var self = this;
    var btnActive = new Array((self.data.DistrictList).length)
    var index = e.currentTarget.dataset.index
    var districtCode = e.currentTarget.dataset.code
    var districtName = e.currentTarget.dataset.name
    btnActive[index] = 'active'
    self.setData({
      btnActive: btnActive,
      districtCode: districtCode,
      districtName: districtName
    })
  },
  //获取行政区
  getDistrict(code) {
    var self = this;
    app.getJson(GetRegionListUrl, { TypeId: 3, Code: code }, 'GET', function (res) {
      if (res.Code === 0) {
        self.setData({
          DistrictList: res.Data
        })
      } else {
        self.setData({
          DistrictList: null
        })
      }
    }, app.globalData.userState.token)
  },
  cities: null,
  //搜索城市
  inputCity(e) {
    var self = this;
    var key = (e.detail.value).trim()
    var cities = self.cities
    self.setData({
      searchCity: true
    })
    clearTimeout(inputTimer)
    inputTimer = setTimeout(function () {
      var citiesTemp = new Array()
      for (var i in cities) {
        if ((cities[i].Name).match(key)) {
          citiesTemp.push(cities[i])
        }
      }
      console.log(citiesTemp)
      if (key.length <= 0) {
        self.setData({
          searchCity: false
        })
      }
      self.setData({
        //searchCity: false,
        cities: citiesTemp
      })
    }, 500)
  },


  //选择企业
  enterprise: null,
  selectEnterprise(e) {
    var self = this;
    var queryEnterprise = self.data.queryEnterprise
    var index = e.currentTarget.dataset.index
    var id = e.currentTarget.dataset.id
    var enterpriseColor = self.data.enterpriseColor
    enterpriseColor[index].checked = !enterpriseColor[index].checked
    switch (enterpriseColor[index].checked) {
      case true:
        enterpriseColor[index].color = ''
        var tempEnterprise = {
          ResourceTypeId: e.currentTarget.dataset.id,
          ResourceTypeName: e.currentTarget.dataset.name,
          index: index
        }
        queryEnterprise.push(tempEnterprise);
        break;
      case false:
        for (var i in queryEnterprise) {
          if (queryEnterprise[i].ResourceTypeId === id) {
            queryEnterprise.splice(i, 1)
          }
        }
        enterpriseColor[index].color = '#eeeff4'
        break;
    }
    setTimeout(function () {
      self.setData({
        queryEnterprise: queryEnterprise,
        enterpriseColor: enterpriseColor
      })
    }, 100)
  },
  deleteQuery(e) {
    var self = this;
    var queryEnterprise = self.data.queryEnterprise
    var enterpriseColor = self.data.enterpriseColor
    var id = e.currentTarget.dataset.id
    for (var i in queryEnterprise) {
      if (queryEnterprise[i].ResourceTypeId === id) {
        enterpriseColor[queryEnterprise[i].index].checked = false
        enterpriseColor[queryEnterprise[i].index].color = '#eeeff4'
        queryEnterprise.splice(i, 1)
      }
    }
    self.setData({
      queryEnterprise: queryEnterprise,
      enterpriseColor: enterpriseColor
    })
  },
  showQueryDetail(e) {
    var self = this;
    var queryDetail = self.data.queryDetail
    self.setData({
      queryDetail: !queryDetail
    })
  },

  //搜索企业
  inputEnterprise(e) {
    var self = this;
    var key = (e.detail.value).trim()
    var enterprise = self.enterprise
    clearTimeout(inputTimer)
    inputTimer = setTimeout(function () {
      var enterpriseTemp = new Array()
      for (var i in enterprise) {
        if ((enterprise[i].ResourceTypeName).match(key)) {
          enterpriseTemp.push(enterprise[i])
        }
      }
      console.log(enterpriseTemp)
      self.setData({
        //searchCity: false,
        enterpriseKey: key,
        enterprise: enterpriseTemp
      })
    }, 500)
  },
  //选择状态
  selectStatus(e) {
    var self = this;
    console.log(e)
    var index = parseInt(e.currentTarget.dataset.index)
    var btnStatusActive = self.data.btnStatusActive
    var StatusData = self.data.StatusData
    if (!btnStatusActive[index]) {
      btnStatusActive[index] = 'active';
      StatusData.push(index);
    } else {
      for (var i in StatusData) {
        if (StatusData[i] === index) {
          StatusData.splice(i, 1)
        }
      }
      btnStatusActive[index] = null
    }
    self.setData({
      btnStatusActive: btnStatusActive,
      StatusData: StatusData
    })
    console.log('StatusData====' + StatusData)
    //self.storageSetting()
  },
  querySubmit() {
    var self = this;
    var regionSelect = [false, false, false]
    self.setData({
      regionSelect: regionSelect
    })
    console.log('保存查询设置')
    self.storageSetting()
  },
  //保存设置
  storageSetting() {
    var self = this;
    var querySetting = wx.getStorageSync('$query_setting') || {
      queryCode: '',
      queryCity: '',
      districtName: '',
      districtCode: '',
      StatusData: [1, 2, 3, 4, 5],
      DistrictList: null
    }
    querySetting.queryCode = self.data.queryCode
    querySetting.queryCity = self.data.queryCity
    querySetting.districtName = self.data.districtName
    querySetting.districtCode = self.data.districtCode
    querySetting.StatusData = self.data.StatusData
    wx.setStorage({
      key: '$query_setting',
      data: querySetting,
    })
    self.loadParms.PageIndex = 1
    app.stopRequest(function (res) {
      if (res === true) {
        setTimeout(function () {
          self.getVelcheList()
        }, 200)
      }
    })
  },
  onUnload() {
    var self = this
    self.loadParms = loadParms
    //self.loadParms.PageIndex = 1
  },
})




