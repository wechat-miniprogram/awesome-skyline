const { shared } = wx.worklet

const FlightDirection = {
  PUSH: 0,
  POP: 1,
}

Component({
  options: {
    virtualHost: true,
  },
  properties: {
    index: {
      type: Number,
      value: -1,
    },
    item: {
      type: Object,
      value: {},
    },
    cardWidth: {
      type: Number,
      value: 0
    },
  },
  lifetimes: {
    created() {
      this.scale = shared(1)
      this.opacity = shared(0)
      this.direction = shared(0)
      this.srcWidth = shared('100%')
      this.radius = shared(5)

      const beginRect = shared(undefined)
      const endRect = shared(undefined)
      wx.worklet.runOnUI(() => {
        'worklet'
        globalThis['RouteCardSrcRect'] = beginRect
        globalThis['RouteCardDestRect'] = endRect
      })()

      if (this.renderer !== 'skyline') {
        this.applyAnimatedStyle = () => {}
      }
    },
    attached() {
      this.applyAnimatedStyle(
        '.card_wrap', 
        () => {
          'worklet'
          return {
            width: this.srcWidth.value,
            transform: `scale(${this.scale.value})`,
          }
        }, 
        {
          immediate: false,
          flush: 'sync'
        },
        () => {}, 
      )

      this.applyAnimatedStyle(
        '.card_img',
        () => {
          'worklet'
          return {
            borderTopRightRadius: this.radius.value, // 不带单位默认是 px
            borderTopLeftRadius: this.radius.value,
          }
        },
        {
          immediate: true,
          flush: 'sync'
        },
        () => {}, 
      )

      this.applyAnimatedStyle(
        '.card_desc',
        () => {
          'worklet'
          return {
            opacity: this.opacity.value,
          }
        },
        {
          immediate: false,
          flush: 'sync'
        },
        () => {}, 
      )
    },
  },

  methods: {
    navigateTo(e) {
      const { index, url, content, ratio } = e.currentTarget.dataset
      const urlContent = `/pages/detail/detail?index=${index}&url=${encodeURIComponent(url)}&content=${content}&ratio=${ratio}`
      wx.navigateTo({
        url: urlContent,
        routeType: 'ScaleTransition',
      })
    },
    handleFrame(data) {
      'worklet'
      this.direction.value = data.direction
      if (data.direction === FlightDirection.PUSH) { // 进入
        // 飞跃过程中，卡片从 100% 改为固定宽度，通过 scale 手动控制缩放
        this.srcWidth.value = `${data.begin.width}px`
        this.scale.value = data.current.width / data.begin.width
        this.opacity.value = 1 - data.progress
        this.radius.value = 0
        // this.shareImgHeight.value = data.begin.height

      } else if (data.direction === FlightDirection.POP) { // 返回
        this.scale.value = data.current.width / data.end.width
        this.opacity.value = data.progress
        this.radius.value = 5
      }

      // globalThis 是 UI 线程的全局变量，将 share-element 初始和目标尺寸保存起来，用于下一页面的缩放动画的计算
      // TODO: 后续计划优化这里的接口设计
      if (globalThis['RouteCardSrcRect'] && globalThis['RouteCardSrcRect'].value == undefined) {
        globalThis['RouteCardSrcRect'].value = data.begin
      }
      if (globalThis['RouteCardDestRect'] && globalThis['RouteCardDestRect'].value == undefined) {
        globalThis['RouteCardDestRect'].value = data.end
      }
    },
  },
})
