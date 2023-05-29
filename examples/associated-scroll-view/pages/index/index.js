import { getCategories, getProducts } from "../../util"

const { shared } = wx.worklet

Component({
  data: {
    categories: getCategories(),
    selected: 0,
    products: getProducts(),
  },
  lifetimes: {
    created() {
      this._swiping = shared(false)
      this._canSwipe = []
      this._selected = shared(0)
      this._lastIndex = shared(0)
    },
    attached() {
      this._canSwipe = this.selectAllComponents('.category-list').map(comp => {
        comp.setSwipingValue(this._swiping)
        return comp.getCanSwipe()
      })
    },
  },
  methods: {
    shouldSwiperResp() {
      'worklet'
      if (this._lastIndex.value !== this._selected.value) {
        this._lastIndex.value = this._selected.value
        // 每次切换 swiper item 时重置，优先给滚动
        this._canSwipe[this._selected.value].value = false
      }
      return this._canSwipe[this._selected.value].value
    },
    onSwiperStart() {
      'worklet'
      this._swiping.value = true
    },
    onSwiperEnd() {
      'worklet'
      this._swiping.value = false
    },
    onChange(e) {
      const {current} = e.detail
      this.setData({
        selected: current,
      })
      this._selected.value = current
      wx.vibrateShort({
        type: 'light',
      })
    },
  },
})
