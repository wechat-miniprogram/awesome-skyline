import { getCategory, getGoods, getVIPCategory, getExpCategory, getVideoList } from '../../util'

export enum RefreshStatus {
  Idle,
  CanRefresh,
  Refreshing,
  Completed,
  Failed,
  CanTwoLevel,
  TwoLevelOpening,
  TwoLeveling,
  TwoLevelClosing,
}

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

const secondFloorCover = 'https://res.wx.qq.com/op_res/6Wt8f05P0Icnti4PBLtxfxza5VkItUCF1dQ6clDNr6c9KJxvxQMzWmJdkKXqHjOFjLp2fQAPV0JG1X6DwqGjyg'


Component({
  data: {
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
    categoryItemWidth: 0,
    intoView: '',
    selected: 0,
    padding: [0, 16, 0, 16],
    triggered: false,
    twoLevelTriggered: false,
    isTwoLevel: false,
    refreshStatus: '下拉刷新',
    secondFloorCover,
    expSelected: 0,
    expCategorys: getExpCategory(),
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

      wx.createSelectorQuery()
      .select('#scrollview')
      .node()
      .exec((res) => {
        console.info('@@@ create scrollContext ', res)
        this.scrollContext = res[0].node;
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
      }, 2000)
    },
  
    onRestore(e) {
      console.log('onRestore:', e)
    },
  
    onAbort(e) {
      console.log('onAbort', e)
    },

    closeTwoLevel() {
      this.scrollContext.closeTwoLevel({
        duration: 300,
      })
      // 设置 twoLevelTriggered: false 也可以关闭二楼
      // this.setData({
      //   twoLevelTriggered: false,
      // })
    },

    onStatusChange(e) {
      const status: RefreshStatus = e.detail.status
      const twoLevelModes = [RefreshStatus.TwoLevelOpening, RefreshStatus.TwoLeveling, RefreshStatus.TwoLevelClosing]
      const isTwoLevel = twoLevelModes.indexOf(status) >= 0
      const refreshStatus = this.buildText(status)
      this.setData({
        isTwoLevel,
        refreshStatus,
      })
    },

    buildText(status: RefreshStatus) {
      switch (status) {
        case RefreshStatus.Idle:
          return '下拉刷新'
        case RefreshStatus.CanRefresh:
          return '松手刷新，下拉进入二楼'
        case RefreshStatus.Refreshing:
          return '正在刷新'
        case RefreshStatus.Completed:
          return '刷新成功'
        case RefreshStatus.Failed:
          return '刷新失败'
        case RefreshStatus.CanTwoLevel:
          return '松手进入二楼'
        default:
          return ''
      }
    },
  },
})
