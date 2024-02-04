const app = getApp()

Page({
  data: {
    back: false,
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
    // 在小程序示例中展示返回按钮
    if (this.route.includes('packageSkylineExamples/examples/')) {
      this.setData({
        back: true
      })
    }
  },
  onShow() {
    // 仅在 app-bar demo 页面展示
    if (typeof this.getAppBar === 'function' ) {
      const appBarComp = this.getAppBar()
      appBarComp.setData({
        showAppbar: true
      })
    }
  },

  goDetail(e) {
    const idx = e.currentTarget.dataset.idx
    wx.navigateTo({
      url: `../detail/index?idx=${idx}`,
    })
  }
})
