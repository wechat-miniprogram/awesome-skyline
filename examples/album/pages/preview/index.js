import { getAlbum } from '../../utils/store'

Component({
  properties: {
    imageid: {
      type: String,
      value: '',
    },
    sourcepageid: {
      type: String,
      value: '',
    },
  },

  data: {
    imageId: '',
    sourcePageId: '',
    list: [],
  },

  lifetimes: {
    attached() {
      // 因为页面的 onLoad 太迟，所以选用 component 构造器的 attached 生命周期来设置 shareKey，确保 share-element 动画正常执行
      const query = this.data
      const imageId = decodeURIComponent(query.imageid || '')
      const sourcePageId = decodeURIComponent(query.sourcepageid || '')
      const list = getAlbum()
      this.setData({ imageId, sourcePageId, list })
    },
  },
})
