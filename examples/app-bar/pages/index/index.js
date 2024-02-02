const app = getApp()

Page({
  data: {
    maxCoverSize: 0,
    musicList: [
      {
        id: 0,
        coverImg: 'https://res.wx.qq.com/op_res/Nu9XXzXcXnD1j5EgWQ2ElxNcl1yMvnKypRo4MTbjOv7FC3saigGoOBTZibyESC7EXaClnPYhB6pvfb-IRmso6g',
        title: 'Skyline 渲染框架'
      },
      {
        id: 1,
        coverImg: 'https://res.wx.qq.com/op_res/Nu9XXzXcXnD1j5EgWQ2El3JJ3FgQX_YP9sI6kJD_nLjnkdN19yZ5nLtS3cqtNUx621vrni0Kjy5uoX_QMlBJgQ',
        title: '小程序性能优化'
      },
      {
        id: 2,
        coverImg: 'https://res.wx.qq.com/op_res/Nu9XXzXcXnD1j5EgWQ2ElwWbBogi5f0NNRBkuJWfE8HQzysKxBaoCJ-YBr7irwn_uE37dHQTWcHK2uOHIWsQ3Q',
        title: '医疗行业实践'
      },

    ]
  },
  onLoad() {
    
    console.log('代码片段是一种迷你、可分享的小程序或小游戏项目，可用于分享小程序和小游戏的开发经验、展示组件和 API 的使用、复现开发问题和 Bug 等。可点击以下链接查看代码片段的详细文档：')
    console.log('https://developers.weixin.qq.com/miniprogram/dev/devtools/minicode.html')
  },
  onShow() {
    if (typeof this.getAppBar === 'function' ) {
      const appBarComp = this.getAppBar()
      appBarComp.setData({
        showAppbar: true
      })
      console.log('showAppbar', appBarComp.data.showAppbar)
      // this.setData({
      //   maxCoverSize: appBarComp.data.maxCoverSize
      // })
    }
  },

  goDetail(e) {
    const idx = e.currentTarget.dataset.idx
    wx.navigateTo({
      url: `../detail/index?idx=${idx}`,
    })
  }
})
