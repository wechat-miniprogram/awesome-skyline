import EventBus from '../../utils/event-bus'
import { getShared, getTiming, getRunOnUI } from '../../utils/worklet'

const PreviewerGesture = {
  Init: 0, // 初始
  Moving: 1, // 移动图片
  Toggle: 2, // 切换图片
  Back: 3, // 退出页面
}

const PrimaryAnimationStatus = {
  DISMISSED: 0,
  FORWARD: 1,
  REVERSE: 2,
  COMPLETED: 3,
}

const GestureState = {
  POSSIBLE: 0,
  BEGIN: 1,
  ACTIVE: 2,
  END: 3,
  CANCELLED: 4,
}

// sharedValues
const TRANSLATE_X = 0
const TRANSLATE_Y = 1
const START_Y = 2
const OPACITY = 3
const SCALE = 4
const MIN_SCALE = 5
const USER_GESTURE_IN_PROGRESS = 6
const GESTURE_STATE = 7
const PAGE_ID = 8
const TEMP_LAST_SCALE = 9
const RENDERER = 10

function clamp(value, min, max) {
  'worklet'
  return Math.min(max, Math.max(min, value))
}

function recoverTiming(target, renderer, callback) {
  'worklet'
  return getTiming(renderer)(target, { duration: 200 }, callback)
}

function calcOpacity(moveY, screenHeight) {
  'worklet'
  const opacityRatio = moveY / (screenHeight / 2)
  return clamp((1 - opacityRatio) ** 3, 0, 1) // 最透明程度为 0
}

function calcScale(moveY, screenHeight) {
  'worklet'
  const scaleRange = 0.4
  const scaleRatio = moveY / (screenHeight / 3 * 2)
  return clamp(1 - scaleRange * scaleRatio, 0.6, 1) // 最小为 0.6
}

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

  lifetimes: {
    created() {
      EventBus.initWorkletEventBus(this.renderer) // 初始化 ui 线程的 eventBus

      const shared = getShared(this.renderer)

      this.sharedValues = [
        shared(0), // TRANSLATE_X
        shared(0), // TRANSLATE_Y
        shared(0), // START_Y
        shared(1), // OPACITY
        shared(1), // SCALE
        shared(1), // MIN_SCALE
        shared(false), // USER_GESTURE_IN_PROGRESS
        shared(0), // GESTURE_STATE
        shared(0), // PAGE_ID
        shared(1), // TEMP_LAST_SCALE
        shared(this.renderer), // RENDERER
      ]
    },

    attached() {
      const sourcePageId = this.data.sourcePageId
      const { screenHeight } = wx.getSystemInfoSync()
      const pageId = this.getPageId()
      const sharedValues = this.sharedValues ?? []

      sharedValues[PAGE_ID].value = pageId

      this.customRouteContext = wx.router.getRouteContext(this)

      getRunOnUI(this.renderer)(() => {
        'worklet'
        // 监听拖拽返回手势
        if (!globalThis.temp[`${pageId}GestureBack`]) {
          globalThis.temp[`${pageId}GestureBack`] = args => {
            if (sharedValues[GESTURE_STATE].value === PreviewerGesture.Moving) return
            sharedValues[GESTURE_STATE].value = PreviewerGesture.Back

            const { moveX, moveY, offsetY } = args

            // 横向永远跟手走
            sharedValues[TRANSLATE_X].value += moveX

            // 竖向在手指回到原处再往上时增加阻尼
            if (sharedValues[TRANSLATE_Y].value < 0) {
              const fy = 0.52 * ((1 - Math.min(offsetY / screenHeight, 1)) ** 2)
              const translateY = sharedValues[TRANSLATE_Y].value + Math.ceil(moveY * fy)
              sharedValues[TRANSLATE_Y].value = translateY
            } else {
              sharedValues[TRANSLATE_Y].value += moveY
            }

            // 拖动时的渐变
            sharedValues[OPACITY].value = calcOpacity(offsetY, screenHeight)

            // 拖动时的大小变化
            const scale = calcScale(offsetY, screenHeight)
            sharedValues[SCALE].value = scale
            sharedValues[MIN_SCALE].value = Math.min(scale, sharedValues[MIN_SCALE].value)
          }
          globalThis.eventBus.on(`${pageId}Back`, globalThis.temp[`${pageId}GestureBack`])
        }

        // 监听拖拽返回手势结束
        if (!globalThis.temp[`${pageId}GestureBackEnd`]) {
          globalThis.temp[`${pageId}GestureBackEnd`] = () => {
            const moveY = sharedValues[TRANSLATE_Y].value
            const scale = sharedValues[SCALE].value
            const minScale = sharedValues[MIN_SCALE].value
            const { didPop } = this.customRouteContext || {}

            if (moveY > 1 && scale <= (minScale + 0.01)) {
              // 必须是一直处于缩小行为才退页面，否则恢复
              globalThis.eventBus.emit(`${sourcePageId}CustomRouteBack`, { scale })
              didPop()
            } else {
              const renderer = sharedValues[RENDERER].value
              sharedValues[OPACITY].value = recoverTiming(1, renderer)
              sharedValues[TRANSLATE_X].value = recoverTiming(0, renderer)
              sharedValues[TRANSLATE_Y].value = recoverTiming(0, renderer)
              sharedValues[SCALE].value = recoverTiming(1, renderer, () => {
                'worklet'
                sharedValues[GESTURE_STATE].value = PreviewerGesture.Init
              })
              sharedValues[MIN_SCALE].value = 1
            }
          }
          globalThis.eventBus.on(`${pageId}BackEnd`, globalThis.temp[`${pageId}GestureBackEnd`])
        }

        // 监听图片切换手势
        if (!globalThis.temp[`${pageId}GestureToggle`]) {
          globalThis.temp[`${pageId}GestureToggle`] = () => {
            if (sharedValues[GESTURE_STATE].value === PreviewerGesture.Moving) return
            sharedValues[GESTURE_STATE].value = PreviewerGesture.Toggle
          }
          globalThis.eventBus.on(`${pageId}Toggle`, globalThis.temp[`${pageId}GestureToggle`])
        }

        // 监听图片拖动手势
        if (!globalThis.temp[`${pageId}GestureMoving`]) {
          globalThis.temp[`${pageId}GestureMoving`] = () => {
            sharedValues[GESTURE_STATE].value = PreviewerGesture.Moving
          }
          globalThis.eventBus.on(`${pageId}Moving`, globalThis.temp[`${pageId}GestureMoving`])
        }
      })()

      // 拖拽返回时，被拖动的 share-element，因为放手时的返回动画是以两个页面的 share-element 之间的位置进行移动，故这里移动的是 share-element
      this.applyAnimatedStyle('#preview-home >>> .need-transform-on-back', () => {
        'worklet'
        return {
          transform: `translate(${sharedValues[TRANSLATE_X].value}px, ${sharedValues[TRANSLATE_Y].value}px) scale(${sharedValues[SCALE].value})`,
        }
      })

      const { primaryAnimation, primaryAnimationStatus } = this.customRouteContext || {}

      // 拖拽返回时，previewer 本体要隐藏
      this.applyAnimatedStyle('#preview-home >>> .need-hide-on-back', () => {
        'worklet'
        const status = primaryAnimationStatus.value
        const isRunningAnimation = status === 1 || status === 2

        return {
          left: (isRunningAnimation || (sharedValues[GESTURE_STATE].value === PreviewerGesture.Back)) ? '9999px' : '0',
        }
      })

      // 图片背景渐变消失
      this.applyAnimatedStyle('#preview-home >>> .preview-middle-self', () => {
        'worklet'
        const status = primaryAnimationStatus.value
        const opacity = sharedValues[OPACITY].value

        if (!sharedValues[USER_GESTURE_IN_PROGRESS].value) {
          // 非手势触发，则加速动画
          const value = primaryAnimation.value
          let factor = value
          if (status === PrimaryAnimationStatus.FORWARD) {
            factor *= 3
            if (factor > 1) factor = 1
          } else if (status === PrimaryAnimationStatus.REVERSE) {
            factor = 1 - ((1 - factor) * 3)
            if (factor < 0) factor = 0
          }

          const newOpacity = opacity * factor
          return { opacity: newOpacity > 1 ? 1 : newOpacity }
        } else {
          // 手势触发
          return { opacity }
        }
      })
    },

    detached() {
      const pageId = this.getPageId()
      getRunOnUI(this.renderer)(() => {
        'worklet'
        const removeList = ['Back', 'BackEnd', 'Toggle', 'Moving']
        removeList.forEach(item => {
          'worklet'
          const globalKey = `${pageId}Gesture${item}`
          if (globalThis.temp[globalKey]) {
            globalThis.eventBus.off(`${pageId}${item}`, globalThis.temp[globalKey])
            delete globalThis.temp[globalKey]
          }
        })
      })()
    },
  },

  methods: {
    onScale(evt) {
      'worklet'
      const sharedValues = this.sharedValues ?? []
      const pageId = sharedValues[PAGE_ID].value

      if (evt.state === GestureState.BEGIN) {
        sharedValues[START_Y].value = evt.focalY
        sharedValues[TEMP_LAST_SCALE].value = 1
        sharedValues[GESTURE_STATE].value = PreviewerGesture.Init
        sharedValues[USER_GESTURE_IN_PROGRESS].value = true
      } else if (evt.state === GestureState.ACTIVE) {
        const focalX = evt.focalX
        const focalY = evt.focalY
        const moveX = evt.focalDeltaX
        const moveY = evt.focalDeltaY
        const offsetY = focalY - sharedValues[START_Y].value

        if (evt.pointerCount === 2) {
          // 双指放缩
          const pageId = sharedValues[PAGE_ID].value
          const realScale = evt.scale / sharedValues[TEMP_LAST_SCALE].value
          sharedValues[TEMP_LAST_SCALE].value = evt.scale

          globalThis.eventBus.emit(`${pageId}Scale`, {
            scale: realScale,
            centerX: focalX,
            centerY: focalY,
          })
        } else if (sharedValues[GESTURE_STATE].value === PreviewerGesture.Back) {
          // 处于拖拽返回手势中
          globalThis.eventBus.emit(`${pageId}Back`, {
            moveX,
            moveY,
            offsetY,
          })
        } else if (sharedValues[GESTURE_STATE].value === PreviewerGesture.Toggle) {
          // 处于切换图片手势中
          // ignore
        } else {
          // 单指拖动图片
          globalThis.eventBus.emit(`${pageId}Move`, {
            moveX,
            moveY,
            offsetY,
            origin: 'move',
          })
        }
      } else if (evt.state === GestureState.END || evt.state === GestureState.CANCELLED) {
        const velocityX = evt.velocityX
        const velocityY = evt.velocityY
        sharedValues[USER_GESTURE_IN_PROGRESS].value = false

        if (sharedValues[GESTURE_STATE].value === PreviewerGesture.Back) {
          // 拖拽返回手势结束
          globalThis.eventBus.emit(`${pageId}BackEnd`)
        } else if (sharedValues[GESTURE_STATE].value === PreviewerGesture.Toggle) {
          // 切换图片手势结束
          sharedValues[GESTURE_STATE].value = PreviewerGesture.Init
        } else {
          // 其他手势结束
          globalThis.eventBus.emit(`${pageId}End`, {
            velocityX,
            velocityY,
          })
          sharedValues[GESTURE_STATE].value = PreviewerGesture.Init
        }
      }
    },

    onBack() {
      // 进入动画返回状态
      const sharedValues = this.sharedValues ?? []
      sharedValues[GESTURE_STATE].value = PreviewerGesture.Back
    },

    shouldResponseOnMove() {
      'worklet'
      return true
    },
  },
})
