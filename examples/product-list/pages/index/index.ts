Component({
  data: {
   
  },

  lifetimes: {
    created() {
    },

    attached() {
    }
  },

  methods: {
    jump1() {
      wx.navigateTo({
        url: '../demo-1/index'
      })
    },
    jump2() {
      wx.navigateTo({
        url: '../demo-2/index'
      })
    },
    jump3() {
      wx.navigateTo({
        url: '../demo-3/index'
      })
    }
  }
})
