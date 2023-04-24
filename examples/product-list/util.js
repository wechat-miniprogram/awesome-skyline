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