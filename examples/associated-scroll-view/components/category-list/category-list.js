const { shared } = wx.worklet

const GestureState = {
  POSSIBLE: 0, // 0 此时手势未识别，如 panDown等
  BEGIN: 1, // 1 手势已识别
  ACTIVE: 2, // 2 连续手势活跃状态
  END: 3, // 3 手势终止
  CANCELLED: 4, // 4 手势取消，
}

Component({
  options: {
    virtualHost: true,
  },
  properties: {
    products: {
      type: Object,
      value: [],
    },
    max: {
      type: Number,
      value: 0,
    },
    index: {
      type: Number,
      value: 0,
    },
  },
  lifetimes: {
    created() {
      this._swiping = shared(false)
      this._canSwipe = shared(false)
      this._scrollTop = shared(0)
      this._scrollHeight = shared(100)
      this._height = shared(0)
    },
    attached() {
      this.createSelectorQuery().select('.product-list').boundingClientRect(rect => {
        this._height.value = rect.height
        this._scrollHeight.value = rect.height + 1 // 可滚动高度总是比滚动区域高一点
      }).exec()
    },
  },
  methods: {
    getCanSwipe() {
      return this._canSwipe
    },
    setSwipingValue(swiping) {
      this._swiping = swiping
    },
    shouldScrollViewResp(e) {
      'worklet'
      // 前者是判断到顶往下拉，后者反之
      this._canSwipe.value = this._scrollTop.value <= 0 && e.deltaY > 0 && this.properties.index !== 0 ||
         this._scrollTop.value + this._height.value >= this._scrollHeight.value && e.deltaY < 0 && this.properties.index !== this.properties.max
      // 滑动 swiper 期间 scroll-view 不可滚动
      return !this._swiping.value && !this._canSwipe.value
    },
    handleScroll(e) {
      'worklet'
      this._scrollTop.value = e.detail.scrollTop
      this._scrollHeight.value = e.detail.scrollHeight
    },
  },
})
