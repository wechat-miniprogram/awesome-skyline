import { Curves, CurveAnimation, lerp } from '../list/route'
import { clamp } from '../list/utils'

const { screenWidth } = wx.getSystemInfoSync()
const { shared, timing, Easing } = wx.worklet

const GestureState = {
  POSSIBLE: 0, // 0 此时手势未识别，如 panDown等
  BEGIN: 1, // 1 手势已识别
  ACTIVE: 2, // 2 连续手势活跃状态
  END: 3, // 3 手势终止
  CANCELLED: 4, // 4 手势取消，
}

const transLowerBound = -1/3 * screenWidth
const transUpperBound = 2/3 * screenWidth

Component({
  properties: {
    index: {
      type: Number,
      value: -1,
    },
    url: {
      type: String,
      value: '',
    },
    content: {
      type: String,
      value: '',
    },
    ratio: {
      type: Number,
      value: 1
    },
    nickname: {
      type: String,
      value: '',
    }
  },
  data: {
    swiperHeight: 0,
    imageList: [
      'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr7lTnuuiwGJPwwjxDVYbDolj05sAxd5cOESVZt4_nl1KwzkiDWTvG56LuhE45xAaZA',
      'https://res.wx.qq.com/op_res/Ak_VAL-nLvq6laAMVJA86rf3NAZ2vY86v757dfja16Z95xtoxk4BWWDuTCPT-pD1SjGGIddUsH0l6C8Yu5LJlw'
    ]
  },
  lifetimes: {
    created() {
      this.startX = shared(0)
      this.startY = shared(0)
      this.transX = shared(0)
      this.transY = shared(0)
      this.isInteracting = shared(false)

      if (this.renderer !== 'skyline') {
        this.applyAnimatedStyle = () => { }
      }
    },
    attached() {
      this.setData({
        swiperHeight: screenWidth / this.data.ratio
      })
      this.customRouteContext = wx.router?.getRouteContext(this);
      const { 
        primaryAnimation,
        primaryAnimationStatus,
        userGestureInProgress,
        shareEleTop
      } = this.customRouteContext || {}

      // 根据进入或返回使用不同曲线换算到的值
      const _curvePrimaryAnimation = CurveAnimation({
        animation: primaryAnimation,
        animationStatus: primaryAnimationStatus,
        curve: Easing.in(Curves.fastOutSlowIn),
        reverseCurve: Easing.out(Curves.fastOutSlowIn)
      })

      this.applyAnimatedStyle('#page', () => {
        'worklet'
        return {
          opacity: _curvePrimaryAnimation.value
        }
      })

      this.applyAnimatedStyle('#fake-host', () => {
        'worklet'
        // pan 手势释放后，触发返回动画，userGestureInProgress 由 startUserGesture() 标记
        if (userGestureInProgress.value && 
          globalThis['RouteCardSrcRect'] && 
          globalThis['RouteCardSrcRect'].value != undefined
        ) {
          const begin = globalThis['RouteCardSrcRect'].value
          const end = globalThis['RouteCardDestRect'].value
          
          const t = 1 - _curvePrimaryAnimation.value
          const shareEleX = lerp(begin.left, end.left, t)
          const shareEleY = lerp(begin.top, end.top, t)
          const shareEleW = lerp(begin.width, end.width, t)
          
          const scale = shareEleW / screenWidth
          const transX = shareEleX
          // shareEleTop 是完全展开时 share-element 的 top 值，换比例换算
          // 使得缩放过程中，最后图片顶部对齐卡片图片顶部
          const transY = shareEleY - shareEleTop.value * scale

          return {
            transform: `translateX(${transX}px) translateY(${transY}px) scale(${scale})`,
            transformOrigin: '0 0',
          }
        }
        // pan 手势移动阶段
        const transX = this.transX.value
        const transY = this.transY.value
        // 根据横坐标位移比例缩放
        const scale = clamp(1 - transX / screenWidth * 0.5, 0, 1)
        return {
          transform: `translateX(${transX}px) translateY(${transY}px) scale(${scale})`,
          transformOrigin: '50% 50%'
        }
      }, { immediate: false })
    },
  },
  methods: {
    handlePanGesture(e) {
      'worklet'
      const {
        startUserGesture,
        stopUserGesture,
        primaryAnimation,
        didPop,
      } = this.customRouteContext

      if (e.state === GestureState.BEGIN) {
        this.startX.value = e.absoluteX
        this.startY.value = e.absoluteY
      } else if (e.state === GestureState.ACTIVE) {
        // 往右滑时
        if (e.deltaX > 0 && !this.isInteracting.value) {
          this.isInteracting.value = true
        }
        if (!this.isInteracting.value) return

        const transX = e.absoluteX - this.startX.value
        this.transX.value = clamp(transX, transLowerBound, transUpperBound)
        this.transY.value = e.absoluteY - this.startY.value
      } else if (e.state === GestureState.END || e.state === GestureState.CANCELLED) {
        if (!this.isInteracting.value) return
        this.isInteracting.value = false

        // 是要返回还是取消返回
        let shouldFinish = false
        if (e.velocityX > 500 || this.transX.value / screenWidth > 0.25) {
          shouldFinish = true
        }
        if (shouldFinish) {
          startUserGesture()
          primaryAnimation.value = timing(0.0, {
            duration: 180,
            easing: Easing.linear
          }, () => {
            'worklet'
            stopUserGesture()
            didPop()
          })
        } else {
          this.transX.value = timing(0.0, { duration: 100 })
          this.transY.value = timing(0.0, { duration: 100 })
        }
      }
    },
  },
})
