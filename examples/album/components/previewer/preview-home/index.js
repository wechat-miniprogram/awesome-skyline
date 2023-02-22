import EventBus from '../../../utils/event-bus'

Component({
  properties: {
    imageId: {
      type: String,
      value: '',
    },
    sourcePageId: {
      type: String,
      value: '',
    },
    list: {
      type: Array,
      value: [],
    },
  },

  data: {
    index: 0,
    tempIndex: -1,
    pretty: false,
  },

  observers: {
    tempIndex(tempIndex) {
      // 切换图片时会影响前一个页面的图片
      const { list, sourcePageId } = this.data
      const image = list[tempIndex]
      if (image) EventBus.emit(`${sourcePageId}PreviewerChange`, image)
    },
  },

  lifetimes: {
    attached() {
      const imageId = this.data.imageId     
      const list = this.data.list
      let index = 0
      if (imageId) {
        const currentIndex = list.findIndex(item => item.id === imageId)
        if (currentIndex !== -1) index = currentIndex
      }

      this.setData({ index })
    },

    detached() {
      // 告诉前一个页面 previewer 将要销毁
      EventBus.emit(`${this.data.sourcePageId}PreviewerDestroy`)
    },
  },

  methods: {
    onBeforeRender(evt) {
      const { index } = evt.detail

      this.data.index = index // 切换可能来自 preview-list 里面，为避免造成循环触发 beforeRender，此处只改 data 不进行 setData
      this.setData({ tempIndex: index }) // 先更新快速预览栏
    },

    onTapImage() {
      this.setData({ pretty: !this.data.pretty })
    },

    onBack(evt) {
      this.triggerEvent('back', evt.detail)
    },
  },
})
