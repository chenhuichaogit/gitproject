// map.js
var bmap = require('../../utils/bmap-wx.min.js');
var wxMarkerData = [];  //定位成功回调对象  
var markers,lat='',lng='',phoneWidth='',phoneHeight='';
var markersChild = {};
Page({
  data: {
    controls: [{id: 1,iconPath: '../../images/Marker.png',
      position: {left: 0,top: 500 - 23,width: 29,height: 45},
      clickable: true}],
    olat:'',
    olng:'',
    lng: '',   //经度  
    lat: '',    //纬度  
    address: '',     //地址  
    cityInfo: {},     //城市信息 
    ak: "OpbqS8xchusi1nLkLoFANnICE6flxzsa", //填写申请到的ak  
  },
  
  onLoad:function(options) {
    var that = this;
    console.log(options)
    if (options.revise == 'true'){
      that.setData({
        olat: options.lat,
        olng: options.lng
      })
    }else{
      that.setData({
        olat: wx.getStorageSync('$ownLocation').oLat,
        olng: wx.getStorageSync('$ownLocation').oLon,
      })
    }
    phoneWidth = wx.getStorageSync('$phoneSystemInfo').windowWidth;
    phoneHeight = wx.getStorageSync('$phoneSystemInfo').windowHeight;
    that.data.controls[0].position.left = phoneWidth / 2 - 20;
    that.data.controls[0].position.top = phoneHeight / 2 - 40;
    that.setData({ controls: this.data.controls});
    that.getLocation(that.data.olng,that.data.olat);
  },
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
   this.mapCtx =  wx.createMapContext('myMap');
  },
  regionchange(e) {
    var that = this;
    console.log(e.type)
    that.getCenterLocation()
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
  getCenterLocation: function () {
    var that = this;
    that.mapCtx.getCenterLocation({
      success: function (res) {
        // lat = res.longitude;
        // lng = res.latitude;
        that.setData({
          lng: res.longitude,
          lat: res.latitude
        })
        that.getLocation(that.data.lng,that.data.lat);
        console.log(res.longitude)
        console.log(res.latitude)
      }
    });
  },
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  translateMarker: function () {
    this.mapCtx.translateMarker({
      markerId: 1,
      autoRotate: true,
      duration: 1000,
      destination: {
        latitude: 23.10229,
        longitude: 113.3345211,
      },
      animationEnd() {
        console.log('animation end')
      }
    })
  },
  includePoints: function () {
    this.mapCtx.includePoints({
      padding: [10],
      points: [{
        latitude: 23.10229,
        longitude: 113.3345211,
      }, {
        latitude: 23.00229,
        longitude: 113.3345211,
      }]
    })
  },
  getLocation: function (olng,olat) {
    var that = this;
    /* 获取定位地理位置 */
    // 新建bmap对象   
    var BMap = new bmap.BMapWX({
      ak: that.data.ak
    });
    var fail = function (data) {
      console.log(data);
    };
    // 发起regeocoding检索请求   
    BMap.regeocoding({
      location: olat + ',' + olng,
      success: function (data) {
        //返回数据内，已经包含经纬度  
        console.log(data);
        //使用wxMarkerData获取数据  
       // wxMarkerData = data.wxMarkerData;
        //把所有数据放在初始化data内  
        that.setData({
          address: data.originalData.result.formatted_address,
          lat: data.originalData.result.location.lat,
          lng: data.originalData.result.location.lng,
         // cityInfo: data.originalData.result.addressComponent
        });

        console.log(data.originalData.result.formatted_address)
      },
      fail: fail,
    });
  },
  getAddressClick:function(){
    var that = this;
    var pages = getCurrentPages()

    var prevPage = pages[pages.length - 1]  //当前界面

    var prevPage = pages[pages.length - 2]  //上一个页面

    var that = this

    prevPage.setData({

      latitude: that.data.lat,
      longitude: that.data.lng,
      address: that.data.address

    })
    // wx.setStorageSync('$location', {
    //   lat: that.data.lat,
    //   lng: that.data.lng,
    //   address: that.data.address
    // })
    wx.navigateBack({
      delta: 1
    })
  }
})