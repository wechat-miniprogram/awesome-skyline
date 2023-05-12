import { getCategory, getGoods, getVIPCategory, getExpCategory, getVideoList } from '../../util'

const systemInfo = wx.getSystemInfoSync()

const { shared, Easing } = wx.worklet

const EasingFn = Easing.cubicBezier(0.4, 0.0, 0.2, 1.0)

const lerp = function (begin, end, t) {
  'worklet'
  return begin + (end - begin) * t
}

const clamp = function (cur, lowerBound, upperBound) {
  'worklet'
  if (cur > upperBound) return upperBound
  if (cur < lowerBound) return lowerBound
  return cur
}

Component({
  data: {
    triggered: false,
    goods: getGoods(30),
    categorySet: [{
      page: 0,
      categorys: getCategory()
    }, {
      page: 1,
      categorys: getCategory().reverse()
    }],
    paddingTop: 44,
    renderer: 'skyline',
    vipCategorys: getVIPCategory(),
    expCategorys: getExpCategory(),
    categoryItemWidth: 0,
    intoView: '',
    selected: 0,
    expSelected: 0,
    padding: [0, 16, 0, 16],
    videoList: getVideoList(20),
  },

  lifetimes: {
    created() {
      this.searchBarWidth = shared(100)
      this.navBarOpactiy = shared(1)
    },
    attached() {
      const padding = 10 * 2
      const categoryItemWidth = (systemInfo.windowWidth - padding) / 5
      this.setData({ categoryItemWidth, paddingTop: systemInfo.statusBarHeight, renderer: this.renderer })

      this.applyAnimatedStyle('.nav-bar', () => {
        'worklet'
        return {
          opacity: this.navBarOpactiy.value
        }
      })

      this.applyAnimatedStyle('.search', () => {
        'worklet'
        return {
          width: `${this.searchBarWidth.value}%`,
        }
      })

      this.applyAnimatedStyle('.search-container', () => {
        'worklet'
        console.log('111', this.renderer)
        return {
          backgroundColor: (this.navBarOpactiy.value > 0 && this.renderer == 'skyline') ? 'transparent' : '#fff'
        }
      })
    },
  },

  methods: {
    chooseVipCategory(evt) {
      const id = evt.currentTarget.dataset.id
      this.setData({
        intoView: `vip-category-${id}`,
        selected: parseInt(id, 10)
      })
    },

    handleScrollStart(evt) {
      'worklet'

    },

    handleScrollUpdate(evt) {
      'worklet'
      const maxDistance = 60
      const scrollTop = clamp(evt.detail.scrollTop, 0, maxDistance)
      const progress = EasingFn(scrollTop / maxDistance)
      this.searchBarWidth.value = lerp(100, 70, progress)
      this.navBarOpactiy.value = lerp(1, 0, progress)
    },

    handleScrollEnd(evt) {
      'worklet'
    },

    onPulling(e) {
      // console.log('onPulling:', e)
    },
  
    onRefresh() {
      console.info('@@@ onRefresh')
      if (this._freshing) return
      this._freshing = true
      setTimeout(() => {
        this.setData({
          triggered: false,
        })
        this._freshing = false
      }, 3000)
    },
  
    onRestore(e) {
      console.log('onRestore:', e)
    },
  
    onAbort(e) {
      console.log('onAbort', e)
    },

  },
})
