import { getShared, getRunOnUI, getRunOnJS } from '../../../utils/worklet'

const PreviewerGesture = {
  Init: 0, // 初始
  Moving: 1, // 移动图片
  Toggle: 2, // 切换图片
  Back: 3, // 退出页面
}

// sharedValues
const GESTURE_STATE = 0
const CURRENT_ID = 1
const RENDERER = 2

Component({
  properties: {
    index: {
      type: Number,
      value: 0,
    },
    list: {
      type: Array,
      value: [],
    },
  },

  data: {
    currentIndex: -99,
    needSwiperAnimation: true,
  },

  observers: {
    list(list) {
      const index = this.data.index
      const current = list[index]
      if (!current) return

      const sharedValues = this.sharedValues ?? []
      sharedValues[CURRENT_ID].value = current.id

      this.toggleImage(index, true)
    },

    index(index) {
      const len = this.data.list.length
      if (!len) return

      if (index !== this.data.currentIndex && index >= 0 && index < len) {
        this.toggleImage(index, true)
      } else {
        // 设置相同的 index 也给一下 render 事件
        const image = this.data.list[index]
        if (image && image.id === this.currentRenderImage) {
          // 要求 image 已经渲染完成
          this.onImageRender({ detail: image })
        }
      }
    },
  },

  lifetimes: {
    created() {
      const shared = getShared(this.renderer)

      this.sharedValues = [
        shared(0), // GESTURE_STATE
        shared(''), // CURRENT_ID
        shared(this.renderer), // RENDERER
      ]
    },

    async attached() {
      const pageId = this.getPageId()
      const sharedValues = this.sharedValues ?? []

      getRunOnUI(this.renderer)(() => {
        'worklet'
        // 监听拖拽返回手势
        if (!globalThis.temp[`${pageId}PreviewerBack`]) {
          globalThis.temp[`${pageId}PreviewerBack`] = () => sharedValues[GESTURE_STATE].value = PreviewerGesture.Back
          globalThis.eventBus.on(`${pageId}Back`, globalThis.temp[`${pageId}PreviewerBack`])
        }

        // 监听图片切换手势
        if (!globalThis.temp[`${pageId}PreviewerToggle`]) {
          globalThis.temp[`${pageId}PreviewerToggle`] = () => sharedValues[GESTURE_STATE].value = PreviewerGesture.Toggle
          globalThis.eventBus.on(`${pageId}Toggle`, globalThis.temp[`${pageId}PreviewerToggle`])
        }

        // 监听图片拖动中事件
        if (!globalThis.temp[`${pageId}PreviewerMoving`]) {
          globalThis.temp[`${pageId}PreviewerMoving`] = () => sharedValues[GESTURE_STATE].value = PreviewerGesture.Moving
          globalThis.eventBus.on(`${pageId}Moving`, globalThis.temp[`${pageId}PreviewerMoving`])
        }

        // 监听图片拖动手势
        if (!globalThis.temp[`${pageId}PreviewerMove`]) {
          globalThis.temp[`${pageId}PreviewerMove`] = args => {
            // 此处只做转发
            const currentId = sharedValues[CURRENT_ID].value
            globalThis.eventBus.emit(`${pageId}${currentId}Move`, args)
          }
          globalThis.eventBus.on(`${pageId}Move`, globalThis.temp[`${pageId}PreviewerMove`])
        }

        // 监听图片放缩手势
        if (!globalThis.temp[`${pageId}PreviewerScale`]) {
          globalThis.temp[`${pageId}PreviewerScale`] = args => {
            // 此处只做转发
            const currentId = sharedValues[CURRENT_ID].value
            globalThis.eventBus.emit(`${pageId}${currentId}Scale`, args)
          }
          globalThis.eventBus.on(`${pageId}Scale`, globalThis.temp[`${pageId}PreviewerScale`])
        }

        // 监听手势结束事件
        if (!globalThis.temp[`${pageId}PreviewerEnd`]) {
          globalThis.temp[`${pageId}PreviewerEnd`] = args => {
            // 此处只做转发
            const currentId = sharedValues[CURRENT_ID].value
            globalThis.eventBus.emit(`${pageId}${currentId}End`, args)
          }
          globalThis.eventBus.on(`${pageId}End`, globalThis.temp[`${pageId}PreviewerEnd`])
        }
      })()
    },

    detached() {
      const pageId = this.getPageId()
      getRunOnUI(this.renderer)(() => {
        'worklet'
        const removeList = ['Back', 'Toggle', 'Moving', 'Move', 'Scale', 'End']
        removeList.forEach(item => {
          'worklet'
          const globalKey = `${pageId}Previewer${item}`
          if (globalThis.temp[globalKey]) {
            globalThis.eventBus.off(`${pageId}${item}`, globalThis.temp[globalKey])
            delete globalThis.temp[globalKey]
          }
        })
      })()
    },
  },

  methods: {
    async toggleImage(index, disableAnimation = false) {
      const image = this.data.list[index]
      if (!image) return

      const sharedValues = this.sharedValues ?? []
      sharedValues[CURRENT_ID].value = image.id

      this.setData({
        currentIndex: index,
        needSwiperAnimation: !disableAnimation,
      })
      this.data.index = index // index 也更新一下，方便其他地方取用

      this.triggerEvent('beforerender', { index, image })
    },

    onImageRender(evt) {
      const list = this.data.list
      const index = this.data.currentIndex
      const image = list[index] || {}

      if (evt.detail.id !== image.id) return

      this.currentRenderImage = image.id
    },

    onTapImage() {
      'worklet'
      getRunOnJS(this.sharedValues[RENDERER].value)(this.triggerEvent.bind(this))('tapimage')
    },

    shouldResponseOnMove() {
      'worklet'
      // 当触发图片切换手势时，才让 swiper 工作
      const sharedValues = this.sharedValues ?? []
      return sharedValues[GESTURE_STATE].value === PreviewerGesture.Toggle
    },

    onSwiperChange(evt) {
      const { current, source } = evt.detail
      if (source === 'touch') this.toggleImage(current, false)
    },
  },
})
