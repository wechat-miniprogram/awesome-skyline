// pages/detail/index.js
const musicList = [
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
Page({
  data: {
    music: musicList[0],
    albumMusicList: [
      {
      id: 0,
      coverImg: 'https://res.wx.qq.com/op_res/Nu9XXzXcXnD1j5EgWQ2ElxNcl1yMvnKypRo4MTbjOv7FC3saigGoOBTZibyESC7EXaClnPYhB6pvfb-IRmso6g',
      name: 'Skyline 渲染框架',
      author: '小程序技术专员 - binnie'
    },
    {
      id: 1,
      coverImg: 'https://res.wx.qq.com/op_res/Nu9XXzXcXnD1j5EgWQ2El3JJ3FgQX_YP9sI6kJD_nLjnkdN19yZ5nLtS3cqtNUx621vrni0Kjy5uoX_QMlBJgQ',
      name: '小程序性能优化',
      author: '小程序性能优化专家'
    },
    {
      id: 2,
      coverImg: 'https://res.wx.qq.com/op_res/Nu9XXzXcXnD1j5EgWQ2ElwWbBogi5f0NNRBkuJWfE8HQzysKxBaoCJ-YBr7irwn_uE37dHQTWcHK2uOHIWsQ3Q',
      name: '医疗行业实践',
      author: '小程序医疗行业专家'
    },
    ]
  },

  onLoad(query) {
    const idx = query.idx
    if (idx) {
      this.setData({
        music: musicList[idx]
      })
    }
  },

  onReady() {

  },


  onShow() {

  },
})