import { getCommentList } from "./comment-data"

function clamp(val, min, max) {
  'worklet'
  return Math.min(Math.max(val, min), max)
}

const { shared, timing } = wx.worklet

const GestureState = {
  POSSIBLE: 0, // 0 此时手势未识别，如 panDown等
  BEGIN: 1, // 1 手势已识别
  ACTIVE: 2, // 2 连续手势活跃状态
  END: 3, // 3 手势终止
  CANCELLED: 4, // 4 手势取消，
}

const { screenHeight, statusBarHeight, safeArea} = wx.getSystemInfoSync()

Component({
  data: {
    scale: 16,
    list: getCommentList(),
  },
  lifetimes: {
    created() {
      this.transY = shared(1000)
      this.scrollTop = shared(0)
      this.startPan = shared(true)
      this.initTransY = shared(0) // 留言半屏的初始位置
      this.upward = shared(false)
    },
    attached() {
      const query = this.createSelectorQuery()
      query.select('.comment-header').boundingClientRect()
      query.exec((res) => {
        this.transY.value = this.initTransY.value = screenHeight - res[0].height - (screenHeight - safeArea.bottom)
      })
      // 通过 transY 一个 SharedValue 控制半屏的位置
      this.applyAnimatedStyle('.comment-container', () => {
        'worklet'
        return { transform: `translateY(${this.transY.value}px)` }
      })

      this.setData({
        height: screenHeight - statusBarHeight,
      })
    },
  },
  methods: {
    setMapScale(scale) {
      this.setData({ scale })
    },
    scrollTo(toValue) {
      'worklet'
      let scale = 18
      if (toValue > screenHeight / 2) {
        scale = 16
      }
      wx.worklet.runOnJS(this.setMapScale.bind(this))(scale)

      this.transY.value = timing(toValue, { duration: 200 })
    },
    // shouldPanResponse 和 shouldScrollViewResponse 用于 pan 手势和 scroll-view 滚动手势的协商
    shouldPanResponse() {
      'worklet'
      return this.startPan.value
    },
    shouldScrollViewResponse(pointerEvent) {
      'worklet'
      // transY > 0 说明 pan 手势在移动半屏，此时滚动不应生效
      if (this.transY.value > statusBarHeight) return false

      const scrollTop = this.scrollTop.value
      const { deltaY } = pointerEvent
      // deltaY > 0 是往上滚动，scrollTop <= 0 是滚动到顶部边界，此时 pan 开始生效，滚动不生效
      const result = scrollTop <= 0 && deltaY > 0
      this.startPan.value = result
      return !result
    },
    // 处理拖动半屏的手势
    handlePan(gestureEvent) {
      'worklet'
      // 滚动半屏的位置
      if (gestureEvent.state === GestureState.ACTIVE) {
        // deltaY < 0，往上滑动
        this.upward.value = gestureEvent.deltaY < 0
        // 当前半屏位置
        const curPosition = this.transY.value
        // 只能在 [statusBarHeight, screenHeight] 之间移动
        const destination = clamp(curPosition + gestureEvent.deltaY, statusBarHeight, screenHeight)
        if (curPosition === destination) return
        // 改变 transY，来改变半屏的位置
        this.transY.value = destination
      }

      if (gestureEvent.state === GestureState.END || gestureEvent.state === GestureState.CANCELLED) {
        if (this.transY.value <= screenHeight / 2) {
          // 在上面的位置
          if (this.upward.value) {
            this.scrollTo(statusBarHeight)
          } else {
            this.scrollTo(screenHeight / 2)
          }
        } else if (this.transY.value > screenHeight / 2 && this.transY.value <= this.initTransY.value) {
          // 在中间位置的时候
          if (this.upward.value) {
            this.scrollTo(screenHeight / 2)
          } else {
            this.scrollTo(this.initTransY.value)
          }
        } else {
          // 在最下面的位置
          this.scrollTo(this.initTransY.value)
        }
      }
    },
    adjustDecelerationVelocity(velocity) {
      'worklet'
      const scrollTop = this.scrollTop.value
      return scrollTop <= 0 ? 0 : velocity
    },
    handleScroll(evt) {
      'worklet'
      this.scrollTop.value = evt.detail.scrollTop
    },
    // 简单兼容 WebView
    handleTouchEnd() {
      if (this.renderer === 'skyline') {
        return
      }
      if (this.transY.value === statusBarHeight) {
        this.lastTransY = statusBarHeight
        this.scrollTo(screenHeight / 2)
      } else if (this.transY.value === screenHeight / 2 && this.lastTransY === statusBarHeight) {
        this.lastTransY = screenHeight / 2
        this.scrollTo(this.initTransY.value)
      } else if (this.transY.value === this.initTransY.value) {
        this.lastTransY = this.initTransY.value
        this.scrollTo(screenHeight / 2)
      } else if (this.transY.value === screenHeight / 2 && this.lastTransY === this.initTransY.value) {
        this.scrollTo(statusBarHeight)
      }
    },
  },
})
