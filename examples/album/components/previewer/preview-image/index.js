import { getShared, getTiming, getRunOnUI, getRunOnJS } from '../../../utils/worklet'

// sharedValues
const MOVE_X = 0
const MOVE_Y = 1
const SCALE = 2
const IMG_WIDTH = 3
const IMG_HEIGHT = 4
const IMG_MAX_SCALE = 5
const IMG_MIN_SCALE = 6
const IMG_MIN_MOVE_X = 7
const IMG_MAX_MOVE_X = 8
const IMG_MIN_MOVE_Y = 9
const IMG_MAX_MOVE_Y = 10
const GESTURE_STATE = 11
const TEMP_MOVE_X = 12
const TEMP_MOVE_Y = 13
const TEMP_SCALE = 14
const INIT_MOVE_X = 15
const INIT_MOVE_Y = 16
const INIT_SCALE = 17
const CURRENT_ID = 18
const PAGE_ID = 19
const RENDERER = 20

const DEFAULT_IMG_SCALE_MAX = 10

let screenWidth = 0
let screenHeight = 0

function adjustTiming(target, renderer, callback) {
  'worklet'
  return getTiming(renderer)(target, { duration: 300 }, callback)
}

function recoverTiming(target, renderer, callback) {
  'worklet'
  return getTiming(renderer)(target, { duration: 200 }, callback)
}

function vibrateShort(type = 'light') {
  wx.vibrateShort({ type })
}

Component({
  properties: {
    status: {
      type: Number,
      value: 0, // 1 切到当前，2 当前相邻
    },
    image: {
      type: Object,
      value: {},
    },
  },

  observers: {
    status(status) {
      if (!this.isAttached) return

      const oldStatus = this.oldStatus
      if (status === oldStatus) return
      this.oldStatus = status

      if (status === 1) {
        if (this.isImgLoaded) this.triggerEvent('render', this.data.image)
      } else {
        this.resetImg()
      }
    },
  },

  lifetimes: {
    created() {
      const shared = getShared(this.renderer)
      
      this.sharedValues = [
        shared(0), // MOVE_X
        shared(0), // MOVE_Y
        shared(1), // SCALE
        shared(0), // IMG_WIDTH
        shared(0), // IMG_HEIGHT
        shared(1), // IMG_MAX_SCALE
        shared(1), // IMG_MIN_SCALE
        shared(0), // IMG_MIN_MOVE_X
        shared(0), // IMG_MAX_MOVE_X
        shared(0), // IMG_MIN_MOVE_Y
        shared(0), // IMG_MAX_MOVE_Y
        shared(0), // GESTURE_STATE 0 - 初始，1 - 移动图片，2 - 放缩图片，3 - 惯性移动中
        shared(0), // TEMP_MOVE_X
        shared(0), // TEMP_MOVE_Y
        shared(1), // TEMP_SCALE
        shared(0), // INIT_MOVE_X
        shared(0), // INIT_MOVE_Y
        shared(1), // INIT_SCALE
        shared(''), // CURRENT_ID
        shared(''), // PAGE_ID
        shared(this.renderer), // RENDERER
      ]
    },

    attached() {
      this.isAttached = true
      const pageId = this.getPageId()
      const id = this.data.image.id
      const sharedValues = this.sharedValues ?? []

      if (!screenWidth || !screenHeight) {
        const systemInfo = wx.getSystemInfoSync()
        screenWidth = systemInfo.screenWidth
        screenHeight = systemInfo.screenHeight
      }

      sharedValues[PAGE_ID].value = pageId
      sharedValues[CURRENT_ID].value = id

      // 应用放缩和拖动
      this.applyAnimatedStyle('#image', () => {
        'worklet'
        return {
          width: `${sharedValues[IMG_WIDTH].value}px`,
          height: `${sharedValues[IMG_HEIGHT].value}px`,
          transform: `translateX(${sharedValues[MOVE_X].value}px) translateY(${sharedValues[MOVE_Y].value}px) translateZ(0px) scale(${sharedValues[SCALE].value})`,
        }
      })

      // 计算图片边界
      function calcImgLimit(scale, imgWidth, imgHeight) {
        'worklet'
        const viewWidth = imgWidth * scale
        const viewHeight = imgHeight * scale

        if (viewWidth > screenWidth) {
          sharedValues[IMG_MAX_MOVE_X].value = (viewWidth / 2) - (imgWidth / 2)
          sharedValues[IMG_MIN_MOVE_X].value = screenWidth - (imgWidth / 2) - (viewWidth / 2)
        } else {
          sharedValues[IMG_MAX_MOVE_X].value = sharedValues[IMG_MIN_MOVE_X].value = (screenWidth - imgWidth) / 2
        }

        if (viewHeight > screenHeight) {
          sharedValues[IMG_MAX_MOVE_Y].value = (viewHeight / 2) - (imgHeight / 2)
          sharedValues[IMG_MIN_MOVE_Y].value = screenHeight - (imgHeight / 2) - (viewHeight / 2)
        } else {
          sharedValues[IMG_MAX_MOVE_Y].value = sharedValues[IMG_MIN_MOVE_Y].value = (screenHeight - imgHeight) / 2
        }
      }
      this.calcImgLimit = calcImgLimit

      // 监听上层的 move/scale 事件
      getRunOnUI(this.renderer)(() => {
        'worklet'
        const renderer = sharedValues[RENDERER].value
        
        function adjustImg(args) {
          const {
            moveX = null,
            moveY = null,
            scale = null,
            centerX = null,
            centerY = null,
            withAnimation = false,
          } = args

          if (moveX !== null && moveY !== null) {
            if (!moveX && !moveY) return

            const oldMoveX = sharedValues[MOVE_X].value
            const oldMoveY = sharedValues[MOVE_Y].value
            let newMoveX = oldMoveX + moveX
            let newMoveY = oldMoveY + moveY

            const minMoveX = sharedValues[IMG_MIN_MOVE_X].value
            const maxMoveX = sharedValues[IMG_MAX_MOVE_X].value
            const minMoveY = sharedValues[IMG_MIN_MOVE_Y].value
            const maxMoveY = sharedValues[IMG_MAX_MOVE_Y].value

            const isReachXEdge = (newMoveX <= minMoveX || newMoveX >= maxMoveX)
            const isReachYEdge = (newMoveY <= minMoveY || newMoveY >= maxMoveY)
            const isScaleBigger = sharedValues[SCALE].value - sharedValues[INIT_SCALE].value > 0.001
            const moveGap = Math.abs(moveY) - Math.abs(moveX)

            if (!sharedValues[GESTURE_STATE].value && isReachXEdge && moveGap < 0) {
              // 图片本身不在移动中 & 到达水平边缘 & 横向移动
              globalThis.eventBus.emit(`${pageId}Toggle`, args)
            } else if (!sharedValues[GESTURE_STATE].value && isReachYEdge && moveGap > 0 && moveY > 0) {
              // 图片本身不在移动中 & 到达垂直边缘 & 纵向移动
              globalThis.eventBus.emit(`${pageId}Back`, args)
            } else {
              // 移动图片
              const tempOldMoveX = sharedValues[TEMP_MOVE_X].value || oldMoveX
              const tempOldMoveY = sharedValues[TEMP_MOVE_Y].value || oldMoveY

              if (isReachXEdge) {
                // 到达水平边缘，增加阻尼
                const offset = tempOldMoveX - oldMoveX
                const f = 0.52 * ((1 - Math.min(Math.abs(offset) / screenWidth, 1)) ** 2)
                newMoveX = oldMoveX + Math.ceil(moveX * f)
              }

              if (isReachYEdge && isScaleBigger) {
                // 放大情况下到达垂直边缘，增加阻尼
                const offset = tempOldMoveY - oldMoveY
                const f = 0.52 * ((1 - Math.min(Math.abs(offset) / screenHeight, 1)) ** 2)
                newMoveY = oldMoveY + Math.ceil(moveY * f)
              }

              if (sharedValues[GESTURE_STATE].value === 3) {
                // 惯性移动中
                const tempNewMoveX = Math.min(Math.max(newMoveX, minMoveX), maxMoveX)
                sharedValues[MOVE_X].value = tempNewMoveX
                sharedValues[TEMP_MOVE_X].value = tempNewMoveX
                const tempNewMoveY = Math.min(Math.max(newMoveY, minMoveY), maxMoveY)
                sharedValues[MOVE_Y].value = tempNewMoveY
                sharedValues[TEMP_MOVE_Y].value = tempNewMoveY
              } else {
                // 水平方向
                sharedValues[MOVE_X].value = newMoveX
                const tempNewMoveX = tempOldMoveX + moveX // 这是真正预期的位置，用于阻尼恢复
                sharedValues[TEMP_MOVE_X].value = Math.min(Math.max(tempNewMoveX, minMoveX), maxMoveX)

                // 垂直方向
                if (isScaleBigger) {
                  // 只有放大情况下需要阻尼
                  sharedValues[MOVE_Y].value = newMoveY
                  const tempNewMoveY = tempOldMoveY + moveY // 这是真正预期的位置，用于阻尼恢复
                  sharedValues[TEMP_MOVE_Y].value = Math.min(Math.max(tempNewMoveY, minMoveY), maxMoveY)
                } else {
                  const tempNewMoveY = Math.min(Math.max(newMoveY, minMoveY), maxMoveY)
                  sharedValues[MOVE_Y].value = tempNewMoveY
                  sharedValues[TEMP_MOVE_Y].value = tempNewMoveY
                }

                sharedValues[GESTURE_STATE].value = 1
                globalThis.eventBus.emit(`${pageId}Moving`)
              }
            }
          } else if (scale !== null && centerX !== null && centerY !== null) {
            const oldMoveX = sharedValues[MOVE_X].value
            const oldMoveY = sharedValues[MOVE_Y].value
            const oldScale = sharedValues[SCALE].value
            const newScale = oldScale * scale
            const tempNewScale = Math.min(Math.max(newScale, sharedValues[IMG_MIN_SCALE].value), sharedValues[IMG_MAX_SCALE].value) // 这是真正预期的 scale，用于阻尼恢复
            const realScale = tempNewScale / oldScale

            // 其实就是求放缩时图片中心的偏移变化
            const imgWidth = sharedValues[IMG_WIDTH].value
            const imgHeight = sharedValues[IMG_HEIGHT].value
            const gapX = centerX - (imgWidth / 2)
            let newMoveX = gapX - ((gapX - oldMoveX) * realScale)
            const gapY = centerY - (imgHeight / 2)
            let newMoveY = gapY - ((gapY - oldMoveY) * realScale)

            calcImgLimit(tempNewScale, imgWidth, imgHeight)
            newMoveX = Math.min(Math.max(newMoveX, sharedValues[IMG_MIN_MOVE_X].value), sharedValues[IMG_MAX_MOVE_X].value)
            newMoveY = Math.min(Math.max(newMoveY, sharedValues[IMG_MIN_MOVE_Y].value), sharedValues[IMG_MAX_MOVE_Y].value)

            sharedValues[MOVE_X].value = withAnimation ? adjustTiming(newMoveX, renderer) : newMoveX
            sharedValues[MOVE_Y].value = withAnimation ? adjustTiming(newMoveY, renderer) : newMoveY
            if (withAnimation) {
              // 有动画，表示是双击放大，不需要考虑阻尼
              sharedValues[SCALE].value = adjustTiming(tempNewScale, renderer, () => {
                sharedValues[GESTURE_STATE].value = 0 // 动画结束，状态恢复初始
              })
              sharedValues[TEMP_SCALE].value = tempNewScale
            } else {
              let calcNewScale = newScale
              if (Math.abs(newScale - tempNewScale) > 0.001) {
                // 超出了边界，补充阻尼计算
                const gap = newScale - oldScale
                const dampingLimit = gap < 0 ? (newScale / tempNewScale) : (tempNewScale / newScale)
                const f = (gap < 0 ? 0.3 : 0.6) * (Math.min(dampingLimit, 1) ** 2) // 不要问为什么是这个值，凭感觉定的
                calcNewScale = oldScale + (gap  * f)
              }

              sharedValues[SCALE].value = calcNewScale
              sharedValues[TEMP_SCALE].value = tempNewScale
            }

            // 回弹是延迟的，所以这里需要确保没有回弹
            sharedValues[TEMP_MOVE_X].value = newMoveX
            sharedValues[TEMP_MOVE_Y].value = newMoveY

            sharedValues[GESTURE_STATE].value = 2
            globalThis.eventBus.emit(`${pageId}Moving`)
          }
        }

        // 监听图片拖动手势
        if (!globalThis.temp[`${pageId}${id}ImgMove`]) {
          globalThis.temp[`${pageId}${id}ImgMove`] = args => adjustImg(args)
          globalThis.eventBus.on(`${pageId}${id}Move`, globalThis.temp[`${pageId}${id}ImgMove`])
        }

        // 监听图片放缩手势
        if (!globalThis.temp[`${pageId}${id}ImgScale`]) {
          globalThis.temp[`${pageId}${id}ImgScale`] = args => adjustImg(args)
          globalThis.eventBus.on(`${pageId}${id}Scale`, globalThis.temp[`${pageId}${id}ImgScale`])
        }

        // 监听手势结束事件
        if (!globalThis.temp[`${pageId}${id}ImgEnd`]) {
          globalThis.temp[`${pageId}${id}ImgEnd`] = args => {
            // 手势结束
            sharedValues[GESTURE_STATE].value = 0

            const moveX = sharedValues[MOVE_X].value
            const targetMoveX = sharedValues[TEMP_MOVE_X].value
            const needRecoverX = Math.abs(moveX - targetMoveX) > 0.001
            const moveY = sharedValues[MOVE_Y].value
            const targetMoveY = sharedValues[TEMP_MOVE_Y].value
            const needRecoverY = Math.abs(moveY - targetMoveY) > 0.001
            const scale = sharedValues[SCALE].value
            const targetScale = sharedValues[TEMP_SCALE].value
            const needRecoverScale = Math.abs(scale - targetScale) > 0.001

            const isScaleBigger = sharedValues[SCALE].value - sharedValues[INIT_SCALE].value > 0.001
            const { velocityX, velocityY } = args
            const vx = Math.min(Math.abs(velocityX), 700)
            const vy = Math.min(Math.abs(velocityY), 700)

            if (needRecoverX || needRecoverY || needRecoverScale) {
              // 阻尼回弹
              if (needRecoverX) sharedValues[MOVE_X].value = recoverTiming(targetMoveX, renderer)
              if (needRecoverY) sharedValues[MOVE_Y].value = recoverTiming(targetMoveY, renderer)
              if (needRecoverScale) {
                sharedValues[SCALE].value = recoverTiming(targetScale, renderer)
                getRunOnJS(sharedValues[RENDERER].value)(vibrateShort)()
              }
            } else if (isScaleBigger && (vx > 50 || vy > 50)) {
              // 惯性计算
              sharedValues[GESTURE_STATE].value = 3

              const a = -0.0015
              const directionX = Math.sign(velocityX)
              const directionY = Math.sign(velocityY)
              let vx0 = vx / 1000
              let vy0 = vy / 1000
              const t = 16

              const nextTick = () => {
                'worklet'
                // 如果此时进入其他状态，则取消惯性
                if (sharedValues[GESTURE_STATE].value !== 3) return

                let moveX = 0
                let moveY = 0

                if (vx0 > 0) {
                  // 还有水平速度
                  const vx1 = a * t + vx0
                  if (vx1 > 0) {
                    const s = (vx0 * t) + ((a * (t ** 2)) / 2)
                    moveX = s * directionX
                    vx0 = vx1
                  } else {
                    vx0 = 0
                  }
                }

                if (vy0 > 0) {
                  // 还有垂直速度
                  const vy1 = a * t + vy0
                  if (vy1 > 0) {
                    const s = (vy0 * t) + ((a * (t ** 2)) / 2)
                    moveY = s * directionY
                    vy0 = vy1
                  } else {
                    vy0 = 0
                  }
                }

                if (moveX || moveY) {
                  adjustImg({ moveX, moveY })
                  setTimeout(nextTick, t)
                } else {
                  // 回归初始状态
                  sharedValues[GESTURE_STATE].value = 0
                }
              }

              setTimeout(nextTick, t)
            }
          }
          globalThis.eventBus.on(`${pageId}${id}End`, globalThis.temp[`${pageId}${id}ImgEnd`])
        }

        // 监听图片双击手势
        if (!globalThis.temp[`${pageId}${id}ImgDoubleTap`]) {
          globalThis.temp[`${pageId}${id}ImgDoubleTap`] = args => adjustImg(args)
          globalThis.eventBus.on(`${pageId}${id}DoubleTap`, globalThis.temp[`${pageId}${id}ImgDoubleTap`])
        }
      })()
    },

    detached() {
      this.isAttached = false
      const id = this.data.image.id
      const pageId = this.getPageId()

      getRunOnUI(this.renderer)(() => {
        'worklet'
        const removeList = ['Move', 'Scale', 'End', 'DoubleTap']
        removeList.forEach(item => {
          'worklet'
          const globalKey = `${pageId}${id}Img${item}`
          if (globalThis.temp[globalKey]) {
            globalThis.eventBus.off(`${pageId}${id}${item}`, globalThis.temp[globalKey])
            delete globalThis.temp[globalKey]
          }
        })
      })()
    },
  },

  methods: {
    resetImg() {
      const sharedValues = this.sharedValues ?? []
      const initMoveX = sharedValues[INIT_MOVE_X].value
      const initMoveY = sharedValues[INIT_MOVE_Y].value
      const initScale = sharedValues[INIT_SCALE].value

      this.calcImgLimit(initScale, sharedValues[IMG_WIDTH].value, sharedValues[IMG_HEIGHT].value)

      sharedValues[MOVE_X].value = initMoveX
      sharedValues[MOVE_Y].value = initMoveY
      sharedValues[TEMP_MOVE_X].value = initMoveX
      sharedValues[TEMP_MOVE_Y].value = initMoveY
      sharedValues[SCALE].value = initScale
      sharedValues[TEMP_SCALE].value = initScale
    },

    onImgLoad(evt) {
      const { width: imgWidth, height: imgHeight } = evt.detail
      const sharedValues = this.sharedValues ?? []

      if (!screenWidth || !screenHeight) {
        const systemInfo = wx.getSystemInfoSync()
        screenWidth = systemInfo.screenWidth
        screenHeight = systemInfo.screenHeight
      }
      const windowRatio = screenWidth / screenHeight

      sharedValues[IMG_WIDTH].value = imgWidth
      sharedValues[IMG_HEIGHT].value = imgHeight

      if (!imgWidth || !imgHeight) return

      const imgRatio = imgWidth / imgHeight

      let scale = 1
      let moveX = 0
      let moveY = 0

      if (imgRatio > windowRatio) {
        scale = screenWidth / imgWidth
        moveX = (screenWidth - imgWidth) / 2
        const scaleHeight = imgHeight * scale
        moveY = ((screenHeight - scaleHeight) / 2) - ((imgHeight - scaleHeight) / 2)

        sharedValues[IMG_MAX_SCALE].value = imgWidth > screenWidth ? 2 : DEFAULT_IMG_SCALE_MAX
        sharedValues[IMG_MIN_SCALE].value = imgWidth > screenWidth ? screenWidth / imgWidth : 1
      } else {
        scale = screenHeight / imgHeight
        moveY = (screenHeight - imgHeight) / 2
        const scaleWidth = imgWidth * scale
        moveX = ((screenWidth - scaleWidth) / 2) - ((imgWidth - scaleWidth) / 2)

        sharedValues[IMG_MAX_SCALE].value = imgHeight > screenHeight ? 2 : DEFAULT_IMG_SCALE_MAX
        sharedValues[IMG_MIN_SCALE].value = imgHeight > screenHeight ? screenHeight / imgHeight : 1
      }

      this.calcImgLimit(scale, imgWidth, imgHeight)

      sharedValues[MOVE_X].value = moveX
      sharedValues[MOVE_Y].value = moveY
      sharedValues[TEMP_MOVE_X].value = moveX
      sharedValues[TEMP_MOVE_Y].value = moveY
      sharedValues[SCALE].value = scale
      sharedValues[TEMP_SCALE].value = scale

      sharedValues[INIT_MOVE_X].value = moveX
      sharedValues[INIT_MOVE_Y].value = moveY
      sharedValues[INIT_SCALE].value = scale

      this.isImgLoaded = true

      if (this.data.status === 1) {
        // 处于 current 状态，直接扔 render 事件
        this.triggerEvent('render', this.data.image)
      }
    },

    onDoubleTap(evt) {
      'worklet'
      const sharedValues = this.sharedValues ?? []
      const currentScale = sharedValues[SCALE].value
      const minScale = sharedValues[IMG_MIN_SCALE].value
      globalThis.eventBus.emit(`${sharedValues[PAGE_ID].value}${sharedValues[CURRENT_ID].value}DoubleTap`, {
        scale: currentScale <= minScale ? 2 : 0.0001, // 如果放大过，就缩回默认大小；如果没有放大过则放大
        centerX: evt.absoluteX,
        centerY: evt.absoluteY,
        withAnimation: true,
      })
    },
  },
})
