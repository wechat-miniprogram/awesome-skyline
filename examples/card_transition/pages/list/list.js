import { installRouteBuilder } from './route'
import { generateGridList } from './utils'

const { screenWidth } = wx.getSystemInfoSync()

Component({
  data: {
    padding: 4,
    gridList: generateGridList(100, 2),
    cardWidth: (screenWidth - 4 * 2 - 4) / 2, // 减去间距
  },

  lifetimes: {
    created() {
      installRouteBuilder()
    },
  },
})
