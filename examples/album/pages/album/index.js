import { getAlbum } from '../../utils/store'

Page({
  data: {
    imageWidth: 0,
    imageMargin: 12, // 图片间距
    lineLimit: 3, // 每行多少张图片
    list: [],
  },

  onLoad() {
    const { imageMargin, lineLimit } = this.data
    const { screenWidth } = wx.getSystemInfoSync()
    this.setData({
      imageWidth: (screenWidth - imageMargin * 4) / lineLimit, // 图片宽度
      list: getAlbum(),
    })
  },
})