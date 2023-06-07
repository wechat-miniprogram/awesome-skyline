import { getCategory, getProducts } from '../../util'

const { shared, timing, decay, derived, runOnUI, runOnJS } = wx.worklet

const categories = getCategory()
const products = getProducts()

const GestureState = {
  POSSIBLE: 0, // 0 此时手势未识别，如 panDown等
  BEGIN: 1, // 1 手势已识别
  ACTIVE: 2, // 2 连续手势活跃状态
  END: 3, // 3 手势终止
  CANCELLED: 4, // 4 手势取消，
}

const InteractionState = {
  INITIAL: 0,
  ANIMATING: 1,
  UNFOLD: 2,
  SCROLL: 3,
  RESET: 4,
}

const clamp = (num, min, max) => {
  'worklet'
  return Math.min(Math.max(num, min), max)
}

Component({
  data: {
    statusBarHeight: 0,
    categories,
    selected: 0,
    list: categories.map(category => {
      return {
        header: category,
        data: products
      }
    }),
    expand: false,
  },
  lifetimes: {
    created() {
      this._interactionState = shared(0)
      this._tabsTop = shared(0)
      this._mainHeight = shared(700)
      this._startY = shared(0)
      this._translY = shared(0)
      this._deltaY = shared(0)
      this._scrollTop = shared(0)
      this._canPan = shared(true)
    },
    attached() {
      const windowInfo = wx.getWindowInfo()
      this.setData({
        statusBarHeight: windowInfo.statusBarHeight
      })

      const updateNavBackColor = this.updateNavBackColor.bind(this)
      this._listenTranslY = derived(() => {
        'worklet'
        const expand = this._translY.value < -this._tabsTop.value / 2
        runOnJS(updateNavBackColor)(expand)
      })
    },
  },
  methods: {
    onBannerLoaded() {
      this.createSelectorQuery().select('.tabs').boundingClientRect(tabs => {
        this.createSelectorQuery().select('.navigation-bar').boundingClientRect(nav => {
          this._tabsTop.value = tabs.top - nav.height
          this.bindAnimatedStyle()
        }).exec()
      }).exec()
      this.createSelectorQuery().select('.main').boundingClientRect(main => {
        this._mainHeight.value = main.height
      }).exec()
    },
    updateNavBackColor(expand) {
      this.setData({expand})
    },
    bindAnimatedStyle() {
      /* 下面是 从顶部往上拉的动画部分 */
      this.applyAnimatedStyle('.page', () => {
        'worklet'
        const translY = clamp(this._translY.value, -this._tabsTop.value, 0)
        return {
          transform: `translateY(${translY}px)`
        }
      })
      this.applyAnimatedStyle('.navigation-bar', () => {
        'worklet'
        const translY = clamp(this._translY.value, -this._tabsTop.value, 0)
        const opacity = translY / -this._tabsTop.value
        return {
          backgroundColor: `rgba(255, 255, 255, ${opacity})`
        }
      })
      // color 是继承属性，暂不支持
      // this.applyAnimatedStyle('.navigation-bar-content .back', () => {
      //   'worklet'
      //   const translY = clamp(this._translY.value, -this._tabsTop.value, 0)
      //   const value = (1 - translY / -this._tabsTop.value) * 255 | 0
      //   return {
      //     color: `rgb(${value}, ${value}, ${value})`
      //   }
      // })
      this.applyAnimatedStyle('.search-input', () => {
        'worklet'
        const translY = clamp(this._translY.value, -this._tabsTop.value, 0)
        const percentage = translY / -this._tabsTop.value
        return {
          width: `${percentage * 60 + 40}%`,
          opacity: percentage,
        }
      })

      /* 下面是 到顶往下拉的动画部分 */
      this.applyAnimatedStyle('.main', () => {
        'worklet'
        const translY = clamp(this._translY.value, 0, Number.MAX_VALUE)
        return {
          transform: `translateY(${translY}px)`
        }
      })
      this.applyAnimatedStyle('.header-shop-info-simple', () => {
        'worklet'
        const min = 50
        const max = 100
        const translY = clamp(this._translY.value, min, max) - min
        return {
          opacity: 1 - (translY / (max - min))
        }
      })
      this.applyAnimatedStyle('.header-shop-info-detail', () => {
        'worklet'
        const min = 100
        const max = 150
        const translY = clamp(this._translY.value, min, max) - min
        return {
          opacity: translY / (max - min)
        }
      })
    },
    handlePan(e) {
      'worklet'
      const _interactionState = this._interactionState
      if (this._interactionState.value === InteractionState.ANIMATING) {
        return
      }
      if (this._interactionState.value === InteractionState.RESET) {
        // 在 gesture active 期间触发的动画，在手指起来时才能重置回 INITIAL
        if (e.state === GestureState.END || e.state === GestureState.CANCELLED) {
          this._interactionState.value = InteractionState.INITIAL
        }
        return
      }

      if (e.state === GestureState.BEGIN) {
        const lastTranslY = clamp(this._translY.value, -this._tabsTop.value, 0)
        this._startY.value = e.absoluteY - lastTranslY
      }

      if (e.state === GestureState.ACTIVE) {
        if (this._interactionState.value === InteractionState.UNFOLD) {
          // 展开状态下，往上滑才折叠起来
          if (e.absoluteY - this._startY.value < 0) {
            this._interactionState.value = InteractionState.ANIMATING
            this._translY.value = timing(0.0, { duration: 250 }, () => {
              'worklet'
              _interactionState.value = InteractionState.RESET
            })
          }
        } else {
          // 其它情况，跟随手指滑动
          this._translY.value = e.absoluteY - this._startY.value
        }
      }

      if (e.state === GestureState.END || e.state === GestureState.CANCELLED) {
        if (this._translY.value > 100) {
          // 超过 100 就展开
          this._interactionState.value = InteractionState.ANIMATING
          this._translY.value = timing(this._mainHeight.value, { duration: 250 }, () => {
            'worklet'
            _interactionState.value = InteractionState.UNFOLD
          })
        } else if (this._translY.value > 0) {
          // 没超过 100 但还在下拉状态就回弹
          this._interactionState.value = InteractionState.ANIMATING
          this._translY.value = timing(0.0, { duration: 250 }, () => {
            'worklet'
            _interactionState.value = InteractionState.INITIAL
          })
        } else if (this._translY.value > -this._tabsTop.value) {
          // 往上滑就做滚动动画
          this._interactionState.value = InteractionState.SCROLL
          this._translY.value = decay({velocity: e.velocityY, clamp: [-this._tabsTop.value, 0]})
        }
      }
      // console.log('@@@ pan', e.state, this._translY.value | 0, this._interactionState.value)
    },
    shouldPanResponse() {
      'worklet'
      return this._canPan.value
    },
    handleScroll(e) {
      'worklet'
      const _interactionState = this._interactionState
      this._scrollTop.value = e.detail.scrollTop
      if (this._scrollTop.value < 0 && !e.detail.isDrag && !this._canPan.value && this._interactionState.value !== InteractionState.ANIMATING) {
        this._interactionState.value = InteractionState.ANIMATING
        this._translY.value = timing(0.0, { duration: 250 }, () => {
          'worklet'
          _interactionState.value = InteractionState.INITIAL
        })
      }
    },
    shouldScrollViewResponse(e) {
      'worklet'
      if (this._translY.value > -this._tabsTop.value) {
        this._canPan.value = true
      } else {
        // 触顶 && 往下拉时，pan 手势生效
        this._canPan.value = this._scrollTop.value <= 0 && e.deltaY > 0
      }
      return !this._canPan.value
    },
    adjustDeceleration(velocity) {
      'worklet'
      console.log('@@@ adjustDecelerationVelocity', velocity)
      const scrollTop = this._scrollTop.value
      return scrollTop <= 0 ? 0 : velocity
    },
  },
})
