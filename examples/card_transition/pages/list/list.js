import { installRouteBuilder } from './route'
import { generateGridList, compareVersion } from './utils'

const { screenWidth } = wx.getSystemInfoSync()

Component({
  data: {
    padding: 4,
    gridList: generateGridList(100, 2),
    cardWidth: (screenWidth - 4 * 2 - 4) / 2, // 减去间距
  },

  lifetimes: {
    created() {
      const {SDKVersion} = wx.getSystemInfoSync()
      if (compareVersion(SDKVersion, '2.30.1') < 0) {
        wx.showModal({
          content: '基础库版本低于 v2.30.1 可能会有显示问题，建议升级微信体验。',
          showCancel: false
        })
      }
      installRouteBuilder()
    },
  },
})
