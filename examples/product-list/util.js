export function getCategory() {
  let categorys = [
    '数码家电',
    '母婴亲子',
    '美食酒水',
    '居家生活',
    '个护清洁',
    '新品首发',
    '众筹',
    '大牌补贴',
    '每日超低',
    '甄选优价',
  ]
  categorys = categorys.map((name, id) => ({
    id,
    name,
    icon: `/images/boy/b${id}.png`
  }))
  return categorys
}

export function getGoods(num) {
  const titles = [
    '夏天用的小棉被超柔顺滑轻薄+抗菌消毒',
    '适合冬天吃的小火锅麻辣爽口+回味无穷',
    '春天来一场踏青之旅吧+意犹未尽'
  ]

  const goods = []
  for (let id = 0; id < num; id++) {
    goods.push({
      id,
      title: titles[(id % titles.length)],
      icon: `/images/goods/g${(id % 3)}.jpg`
    })
  }
  return goods
}

export function getVIPCategory() {
  let vipCategorys = [
    '为你精选',
    '甄选优价',
    '时令好物',
    '回购排行'
  ]
  vipCategorys = vipCategorys.map((name, id) => ({
    id,
    name
  }))
  return vipCategorys
}

export function getExpCategory() {
  let expCategorys = [
    '推荐',
    '换新精选',
    'AR体验',
    '数字作品'
  ]
  expCategorys = expCategorys.map((name, id) => ({
    id,
    name
  }))
  return expCategorys
}

export function getVideoList(num) {
  const titles = [
    '酷跑春天·跑鞋新品发布会',
    '直接全球气候变化',
    '幻想奇遇·3D音乐节'
  ]
  const videos = []
  for (let id = 0; id < num; id++) {
    videos.push({
      id,
      title: titles[(id % titles.length)],
      url: 'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'
    })
  }
  return videos
}