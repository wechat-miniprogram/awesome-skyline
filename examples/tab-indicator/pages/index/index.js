const ScrollState = {
  scrollStart: 0,
  scrollUpdate: 1,
  scrollEnd: 2,
}

const tabs = [
  {
    title: '性能优化',
    title2: '小程序性能优化实践',
    img: 'http://mmbiz.qpic.cn/mmbiz_jpg/PxLPibq1ibyh0U4e0qLqNrULAUzW5UbWbicUN5GyJqd24GR0Ricg5q14VGGBWlicNca8x4xelvDrM1r0ibwAjAsR0bOA/0?wx_fmt=jpeg',
    desc: '小程序性能优化课程基于实际开发场景，由资深开发者分享小程序性能优化的各项能力及应用实践，提升小程序性能表现，满足用户体验。',
  },
  {
    title: '新能力解读',
    title2: '小程序开发新能力解读',
    img: 'http://mmbiz.qpic.cn/sz_mmbiz_png/GEWVeJPFkSH05EZMIBafqzpoZVSXtCE47V7icf0gru4KPUzMjIcIibJPUlXqbZib4VNmTecxef987XEWib2vhwuqbQ/0?wx_fmt=png',
    desc: '这个月小程序释放了什么新能力？又有哪些新规则？收藏课程，及时了解小程序开发动态，听官方为你解读新能力。',
  },
  {
    title: '基础开发',
    title2: '小程序基础开发之架构、框架、组件',
    img: 'http://mmbiz.qpic.cn/sz_mmbiz_jpg/GEWVeJPFkSEz7tgvlaTtv2MYO01RZr0yNgtbEZJzcbRl0deOWmSbX0UfRHPt78UCOxPIVYnhAiaJVib40SviaV1Vw/0?wx_fmt=jpeg',
    desc: '小程序基础开发之架构、框架、组件，更多课程正在制作中...',
  },
]

Component({
  data: {
    selectedTab: 0,
    tabs,
    translateX: 0,
  },

  lifetimes: {
    created() {
      if (this.renderer !== 'skyline') {
        wx.worklet.shared = function (initVal) {
          return { value: initVal }
        }
      }
      const shared = wx.worklet.shared
      const { windowWidth } = wx.getSystemInfoSync()
      const innerWindowWidth = windowWidth - 48 // 左右 padding 各 24
      this._tabWidth = shared(innerWindowWidth / 3) // 通过 boundingClientRect 算也行
      this._translateX = shared(0)
      this._lastTranslateX = shared(0)
      this._scaleX = shared(0.7)
      this._windowWidth = shared(windowWidth)

    },
    attached() {
      this.applyAnimatedStyle('.tab-border', () => {
        'worklet'
        return {
          transform: `translateX(${this._translateX.value}px) scaleX(${this._scaleX.value})`,
        }
      })
    },
  },

  methods: {
    onTapTab(evt) {
      const { tab } = evt.currentTarget.dataset || {}
      this.setData({
        selectedTab: tab,
      })
    },

    onTabChanged(evt) {
      const index = evt.detail.current
      this.setData({
        selectedTab: index,
      })
      if (this.renderer !== 'skyline') {
        this.setData({
          translateX: this._tabWidth.value * index
        })
      }
    },

    // swiper 切换过程中每帧回调，声明为 worklet 函数使其跑在 UI 线程
    onTabTransition(evt) {
      'worklet'
      // 这里 swiper item 是占满了整个屏幕宽度，算出拖动比例，换算成相对 tab width 的偏移
      const translateRatio = evt.detail.dx / this._windowWidth.value
      this._translateX.value = this._lastTranslateX.value + translateRatio * this._tabWidth.value

      // 控制 scale 值，拖到中间时 scale 处于最大值 1，两端递减
      const scaleRatio = (this._translateX.value / this._tabWidth.value) % 1
      const changedScale = scaleRatio <= 0.5 ? scaleRatio : (1 - scaleRatio) // 最大值 0.5
      this._scaleX.value = Math.abs(changedScale) * 0.6 + 0.7

      if (evt.detail.state === ScrollState.scrollEnd) {
        this._lastTranslateX.value = this._translateX.value
      }
    },
  },
})
