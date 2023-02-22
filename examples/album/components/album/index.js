import EventBus from '../../utils/event-bus'
import { initRoute } from './route'

function transformListToLineBlock(list, lineLimit) {
  const lineList = []
  for (let i = 0, len = list.length; i < len; i += lineLimit) {
    const line = { index: Math.floor(i / lineLimit), list: [] }
    for (let j = 0; j < lineLimit; j++) {
      const index = i + j
      const item = list[index]
      if (item) line.list.push({
        ...item,
        index,
      })
    }
    lineList.push(line)
  }
  return lineList
}

Component({
  properties: {
    list: {
      type: Array,
      value: [],
    },

    imageWidth: {
      type: Number,
      value: 0,
    },

    imageMargin: {
      type: Number,
      value: 0,
    },

    lineLimit: {
      type: Number,
      value: 3,
    },
  },

  data: {
    showList: [],
    scrollIntoView: '',
  },

  observers: {
    'list, lineLimit'(list, lineLimit) {
      if (!list.length || !lineLimit) return

      // 调整为行结构，每行自己排版
      this.setData({
        showList: transformListToLineBlock(list, lineLimit),
      })
    },
  },

  lifetimes: {
    created() {
      EventBus.initWorkletEventBus(this.renderer) // 初始化 ui 线程的 eventBus
      initRoute() // 初始化自定义路由
    },

    attached() {
      // 预览页发生图片切换时，要将对应 image 滚动到到可视范围内
      const pageId = this.getPageId()
      let scrollIntoViewTimer = null
      this._onPreviewerChange = image => {
        const list = this.data.list
        const index = list.findIndex(item => item.id === image.id)
  
        if (index !== -1) {
          if (scrollIntoViewTimer) clearTimeout(scrollIntoViewTimer)
          scrollIntoViewTimer = setTimeout(() => {
            // 可能处于页面切换动画中，故加个延迟再滚动
            let lineIndex = Math.floor(index / this.data.lineLimit)
            this.setData({ scrollIntoView: `line-${lineIndex}` })
          }, 500)
        }
      }
      EventBus.on(`${pageId}PreviewerChange`, this._onPreviewerChange)
    },

    detached() {
      const pageId = this.getPageId()
      EventBus.off(`${pageId}PreviewerChange`, this._onPreviewerChange)
    },
  },

  methods: {
    onTapImage(evt) {
      const { index } = evt.currentTarget.dataset || {}
      const image = this.data.list[index]
      if (!image) return

      // 跳转到预览页
      wx.navigateTo({
        url: `../../pages/preview/index?imageid=${image.id}&sourcepageid=${this.getPageId()}`,
        routeType: 'fadeToggle',
      })
    },
  },
})
