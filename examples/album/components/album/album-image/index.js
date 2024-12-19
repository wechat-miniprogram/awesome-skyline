import EventBus from '../../../utils/event-bus'
import { getShared, getRunOnUI } from '../../../utils/worklet'

const IMAGE_INIT_WIDTH = 0
const IMAGE_INIT_HEIGHT = 1
const IMAGE_WIDTH = 2
const IMAGE_HEIGHT = 3
const IMAGE_TARGET_WIDTH = 4
const IMAGE_TARGET_HEIGHT = 5
const IMAGE_RATIO = 6
const IN_PREVIEW = 7

let screenWidth = 0
let screenHeight = 0

Component({
  properties: {
    image: {
      type: Object,
      value: {},
    },
    src: {
      type: String,
      value: '',
    },
    width: {
      type: Number,
      value: 0,
    },
    height: {
      type: Number,
      value: 0,
    },
  },

  observers: {
    'width, height'() {
      this.renderImage()
    },
  },

  lifetimes: {
    created() {
      const shared = getShared(this.renderer)

      this.sharedValues = [
        shared(0), // IMAGE_INIT_WIDTH
        shared(0), // IMAGE_INIT_HEIGHT
        shared(0), // IMAGE_WIDTH
        shared(0), // IMAGE_HEIGHT
        shared(0), // IMAGE_TARGET_WIDTH
        shared(0), // IMAGE_TARGET_HEIGHT
        shared(0), // IMAGE_RATIO
        shared(false), // IN_PREVIEW
      ]
    },

    attached() {
      const pageId = this.getPageId()
      const uniqueId = `${pageId}-${this.data.image.id}`
      const sharedValues = this.sharedValues ?? []
      this.uniqueId = uniqueId

      getRunOnUI(this.renderer)(() => {
        'worklet'
        if (!globalThis.temp[`${uniqueId}CustomRouteBack`]) {
          globalThis.temp[`${uniqueId}CustomRouteBack`] = args => {
            if (!sharedValues[IN_PREVIEW].value) return

            // 在预览页拖拽返回时会有 scale 效果，所以需要矫正第 0 帧时的宽高，不然会在切 share-element 时突然失去 scale 效果
            const targetImageWidth = sharedValues[IMAGE_TARGET_WIDTH].value
            const targetImageHeight = sharedValues[IMAGE_TARGET_HEIGHT].value
            const scale = args.scale
            sharedValues[IMAGE_WIDTH].value = targetImageWidth * scale
            sharedValues[IMAGE_HEIGHT].value = targetImageHeight * scale
          }
          globalThis.eventBus.on(`${pageId}CustomRouteBack`, globalThis.temp[`${uniqueId}CustomRouteBack`])
        }
      })()

      this.applyAnimatedStyle('.img', () => {
        'worklet'
        let width = `${sharedValues[IMAGE_WIDTH].value}px`
        if (sharedValues[IMAGE_WIDTH].value === 0) {
          width = ``
        }
        let height = `${sharedValues[IMAGE_HEIGHT].value}px`
        if (sharedValues[IMAGE_HEIGHT].value === 0) {
          height = ``
        }
        return {
          width,
          height,
        }
      })

      const resetShareValues = () => {
        sharedValues[IMAGE_WIDTH].value = sharedValues[IMAGE_INIT_WIDTH].value
        sharedValues[IMAGE_HEIGHT].value = sharedValues[IMAGE_INIT_HEIGHT].value
        sharedValues[IN_PREVIEW].value = false
      }

      // 监听预览页图片切换
      this._onPreviewerChange = image => {
        if (image.id === this.data.image.id) {
          // 切到当前图片了
          sharedValues[IN_PREVIEW].value = true
        } else {
          // 切到其他图片了，恢复原样
          resetShareValues()
        }
      }
      EventBus.on(`${pageId}PreviewerChange`, this._onPreviewerChange)

      this._onPreviewerHide = () => {
        // 预览页销毁了，恢复原样
        // 这里可能有返回动画，所以延迟 reset
        setTimeout(resetShareValues, 500)
      }
      EventBus.on(`${pageId}PreviewerDestroy`, this._onPreviewerHide)
    },

    detached() {
      const pageId = this.getPageId()
      const uniqueId = this.uniqueId
      getRunOnUI(this.renderer)(() => {
        'worklet'
        if (globalThis.temp[`${uniqueId}CustomRouteBack`]) {
          globalThis.eventBus.off(`${pageId}CustomRouteBack`, globalThis.temp[`${uniqueId}CustomRouteBack`])
          delete globalThis.temp[`${uniqueId}CustomRouteBack`]
        }
      })()

      EventBus.off(`${pageId}PreviewerChange`, this._onPreviewerChange)
      EventBus.off(`${pageId}PreviewerDestroy`, this._onPreviewerHide)
    },
  },

  methods: {
    onFrame(evt) {
      'worklet'
      console.log('worklet onFrame', evt)
      // 进入预览页的动画，会逐帧调用
      // 在此回调中需要根据当前容器的大小来调整图片的大小，因为图片是自己设置宽高渲染的，不能根据容器宽高自适应
      const rect = evt.current
      const sharedValues = this.sharedValues ?? []
      const cntWidth = rect.width
      const cntHeight = rect.height
      const progress = evt.progress // 当前动画进度
      const imageRatio = sharedValues[IMAGE_RATIO].value
      const isPop = evt.direction === 1

      let width = cntWidth
      let height = cntHeight
      if (imageRatio) {
        const cntRatio = cntWidth / cntHeight

        if (cntRatio > imageRatio) height = cntWidth / imageRatio
        else if (cntRatio <= imageRatio) width = cntHeight * imageRatio

        // 获取图片的初始大小和目标大小
        const initImageWidth = sharedValues[IMAGE_INIT_WIDTH].value
        const initImageHeight = sharedValues[IMAGE_INIT_HEIGHT].value
        const targetImageWidth = sharedValues[IMAGE_TARGET_WIDTH].value
        const targetImageHeight = sharedValues[IMAGE_TARGET_HEIGHT].value
        if (initImageWidth && initImageHeight && targetImageWidth && targetImageHeight) {
          if (isPop) {
            // 退出动画
            width = targetImageWidth - (targetImageWidth - initImageWidth) * progress
            height = targetImageHeight - (targetImageHeight - initImageHeight) * progress
          } else {
            // 进入动画
            width = initImageWidth + (targetImageWidth - initImageWidth) * progress
            height = initImageHeight + (targetImageHeight - initImageHeight) * progress
          }
        }
      }

      sharedValues[IMAGE_WIDTH].value = width
      sharedValues[IMAGE_HEIGHT].value = height
    },

    onImageLoad(evt) {
      const { width, height } = evt.detail
      const sharedValues = this.sharedValues ?? []
      const imageRatio = width / height

      this.imageRatio = imageRatio
      sharedValues[IMAGE_RATIO].value = imageRatio
      this.renderImage()
    },

    renderImage() {
      // 因为目标预览页的 mode 是 aspectFill，为了保证进入预览页的动画过程中不会发生 mode 跳变问题，故此处使用 aspectFill，然后手动裁剪成 aspectFit
      const sharedValues = this.sharedValues ?? []
      const { width: cntWidth, height: cntHeight } = this.data
      const imageRatio = this.imageRatio

      if (!screenWidth || !screenHeight) {
        const systemInfo = wx.getSystemInfoSync()
        screenWidth = systemInfo.screenWidth
        screenHeight = systemInfo.screenHeight
      }

      if (cntWidth && cntHeight && imageRatio) {
        let initWidth = cntWidth
        let initHeight = cntHeight
        let targetImageWidth = screenWidth
        let targetImageHeight = screenHeight
        const cntRatio = cntWidth / cntHeight
        const targetRatio = screenWidth / screenHeight

        if (cntRatio > imageRatio) {
          initHeight = cntWidth / imageRatio
        } else if (cntRatio < imageRatio) {
          initWidth = cntHeight * imageRatio
        }

        if (targetRatio > imageRatio) {
          targetImageWidth = targetImageHeight * imageRatio
        } else if (targetRatio < imageRatio) {
          targetImageHeight = targetImageWidth / imageRatio
        }

        // 在相册页面时的初始大小
        sharedValues[IMAGE_INIT_WIDTH].value = initWidth
        sharedValues[IMAGE_INIT_HEIGHT].value = initHeight

        // 当前图片的大小
        sharedValues[IMAGE_WIDTH].value = initWidth
        sharedValues[IMAGE_HEIGHT].value = initHeight

        // 动画到预览页时的目标大小
        sharedValues[IMAGE_TARGET_WIDTH].value = targetImageWidth
        sharedValues[IMAGE_TARGET_HEIGHT].value = targetImageHeight
      }
    },
  },
})
