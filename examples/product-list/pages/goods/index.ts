import { getCategory, getGoods, getVIPCategory, getExpCategory, getVideoList } from '../../util'

// pages/goods/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsData: {
      expSelected: 0,
      expCategorys: getExpCategory(),
      videoList: getVideoList(20),
      hasRouteDone: false,
    }
  },

  back() {
    wx.navigateBack({})
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onRouteDone() {
    console.info('@@@ lifetime routeDone ', Date.now())
    this.setData({
      'goodsData.hasRouteDone': true,
    })
    if (this.eventChannel) {
      this.eventChannel.emit('nextPageRouteDone', { });
    }
  },

  onLoad() {
    this.eventChannel = this.getOpenerEventChannel()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})