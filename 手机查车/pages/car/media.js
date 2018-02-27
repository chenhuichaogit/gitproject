
Page({


  data: {
    photoData: null
  },

  onLoad: function (options) {
    console.log(JSON.parse(options.photoData))
    var photoData = JSON.parse(options.photoData)
    this.setData({
      photoData: photoData
    })
  },

  previewImage(e) {
    var self = this;
    var index = e.currentTarget.dataset.index
    var photoData = self.data.photoData
    wx.previewImage({
      current: photoData.ImageUrls[index] , // 当前显示图片的http链接
      urls: photoData.ImageUrls,
    })


  }
})