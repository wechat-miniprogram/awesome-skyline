import { getCommentList } from "./comment-data"

const global = (function () {
  return globalThis
})()

function normalizeTransform(keyframe) {
  if (!keyframe.transform) {
    return keyframe
  }
  const reg = /(rotate|rotateX|rotateY|rotateZ|scaleX|scaleY|scaleZ|skewX|skewY|translateX|translateY|translateZ)\(([^)]+)\)/g
  const styleObj = {}
  let result
  while (result = reg.exec(keyframe.transform)) {
    styleObj[result[1]] = result[2]
  }
  delete keyframe.transform
  Object.assign(keyframe, styleObj)
  return keyframe
}

// 临时兼容 WebView
try {
  wx.worklet.shared(0)
} catch (e) {
  wx.worklet.shared = function (initVal) {
    const obj = {
      _watchFn: [],
      _value: initVal,
    }
    Object.defineProperty(obj, 'value', {
      get() {
        if (global._watchFn && this._watchFn.indexOf(global._watchFn) === -1) {
          this._watchFn.push(global._watchFn)
        }
        return this._value
      },
      set(value) {
        this._value = value
        for (let fn of this._watchFn) {
          fn()
        }
      }
    })
    return obj
  }
  wx.worklet.timing = function (toValue) {
    return toValue
  }
}

const { shared, timing } = wx.worklet

const GestureState = {
  POSSIBLE: 0, // 0 此时手势未识别，如 panDown等
  BEGIN: 1, // 1 手势已识别
  ACTIVE: 2, // 2 连续手势活跃状态
  END: 3, // 3 手势终止
  CANCELLED: 4, // 4 手势取消，
}

Component({
  data: {
    list: getCommentList(),
  },
  lifetimes: {
    created() {
      this.transY = shared(1000)
      this.scrollTop = shared(0)
      this.startPan = shared(true)
      this.commentHeight = shared(1000)

      // WebView 下临时用 animate 兼容 applyAnimatedStyle
      if (this.renderer !== 'skyline') {
        this.applyAnimatedStyle = (selector, fn) => {
          global._watchFn = () => {
            this.animate(selector, [normalizeTransform(fn())], 0)
          }
          this.animate(selector, [normalizeTransform(fn())], 0)
          global._watchFn = null
        }
      }
    },
    attached() {
      const query = this.createSelectorQuery()
      query.select('.comment-container').boundingClientRect()
      query.exec((res) => {
        this.transY.value = this.commentHeight.value = res[0].height
      })
      // 通过 transY 一个 SharedValue 控制半屏的位置
      this.applyAnimatedStyle('.comment-container', () => {
        'worklet'
        return { transform: `translateY(${this.transY.value}px)` }
      })
    },
  },
  methods: {
    onTapOpenComment() {
      this.openComment(300)
    },
    openComment(duration) {
      'worklet'
      this.transY.value = timing(0, { duration })
    },
    onTapCloseComment() {
      console.log('@@@ onTapCloseComment', this.closeComment)
      this.closeComment()
    },
    closeComment() {
      'worklet'
      this.transY.value = timing(this.commentHeight.value, { duration: 200 })
    },
    // shouldPanResponse 和 shouldScrollViewResponse 用于 pan 手势和 scroll-view 滚动手势的协商
    shouldPanResponse() {
      'worklet'
      return this.startPan.value
    },
    shouldScrollViewResponse(pointerEvent) {
      'worklet'
      // transY > 0 说明 pan 手势在移动半屏，此时滚动不应生效
      if (this.transY.value > 0) return false
      const scrollTop = this.scrollTop.value
      const { deltaY } = pointerEvent
      // deltaY > 0 是往上滚动，scrollTop <= 0 是滚动到顶部边界，此时 pan 开始生效，滚动不生效
      const result = scrollTop <= 0 && deltaY > 0
      this.startPan.value = result
      return !result
    },
    handlePan(gestureEvent) {
      'worklet'
      if (gestureEvent.state === GestureState.ACTIVE) {
        const curPosition = this.transY.value
        const destination = Math.max(0, curPosition + gestureEvent.deltaY)
        if (curPosition === destination) return
        this.transY.value = destination
      }

      if (gestureEvent.state === GestureState.END || gestureEvent.state === GestureState.CANCELLED) {
        if (gestureEvent.velocityY > 500 && this.transY.value > 50) {
          this.closeComment()
        } else if (this.transY.value > this.commentHeight.value / 2) {
          this.closeComment()
        } else {
          this.openComment(100)
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
  },
})
