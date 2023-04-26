export function getCategory() {
  let categorys = [
    '数码家电',
    '母婴亲子',
    '美食酒水',
    '居家生活',
    '个护清洁',
    '水果生鲜',
    '礼品鲜花',
    '宠物用品',
    '运动户外',
    '图书音像',
  ]
  let images = [
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH17O2mXoVj5wM-MKCDrRSIiXL6YmeJdcgrxbSV8SlhrQZ5QDjGMPkYJLWfslw-cQjfg',
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH121bDdl-oLlIrjTECMFGRhcQso_lzY7K3dCP17VNjinz5U-Xs4LM3i7UCvIwfbPwPQ',
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH1_6zzkLPnii0euyvgdWTJbcMK5VdEgfA3Dl1injDQqrqIzwgbTXkBBjKfF9RX9BmgQ',
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH11UqwaEHSBo4vdN9PpiwlIoxwd_swxjTtC8ScRr9ytVKIpJU6kCDR6O-Ww92TnVOMw',
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH17x9IpOpSua5X-ZXI-KFA3wmqPPWZvP6hBknnMh--bJweck42NUCM--4Z4-dIdYVmg',
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH18i6FnyB9ophFXaBM38nHtPO3_xVJxQPvabSVry-bYD3p2T4LbyqWVApZUB_QHE39A',
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH1xzp2U53UjAUXun3X052p6zZU3_ZKE4A0u_phFwLXlFUpt2RjrRKaaNXIziJB54iLw',
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH17KjwbHdbsO2UyjgPjWpactC-vKIclfFzNk2B23ZPIzJwQ2qGNEk4Om7oXKwJwXc7w',
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH10oWmWDuokxH2Ed5UzXMYIX1ZdWoQFZH7i7D9fh15Y6q6zpld0PoXMdVWml41K56NQ',
    'https://res.wx.qq.com/op_res/1SgOliBW4GtxOSAZAkfH10c6PLapl1Hi267ALbGzV80H8DRhXWoqKxSqKrz-MuX3zgrQ88p9aiov57jHUeMvUA',
  ]
  categorys = categorys.map((name, id) => ({
    id,
    name,
    icon: images[(id % categorys.length)] //`/images/boy/b${id}.png`
  }))
  return categorys
}

export function getGoods(num) {
  const titles = [
    '[橙汁]橙子榨汁而成，口感酸甜清爽，富含维生素C和营养成分',
    '[芝士]奶制品原料，有多种口感和种类，广泛用于烘焙和食品加工中',
    '[西瓜]夏季常见的水果，甜美清爽，富含维生素C和水分，有助于解暑',
    '[烤鸡]经过烤制的鸡肉，外酥里嫩，口感香浓，是家庭聚餐和宴席的常见菜品',
    '[腰果]坚果类食品，富含蛋白质和不饱和脂肪酸，适量食用有益健康',
    '[荔枝]一种热带水果，果肉甜润多汁，含有多种营养成分，口感鲜美',
    '[咕噜肉]一种传统的中式烹饪菜品，以猪肉为主料，口感酸甜可口',
    '[麦片]以麦类为原料加工而成的食品，富含膳食纤维和营养成分，适合早餐食用',
    '[粽子]传统的中国节日食品，以糯米为主料，内馅多样，口感软糯',
    '[调料]食品烹饪过程中使用的香料和调味品，能增加食品的口感和风味'
  ]

  const images = [
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_AQz20Q2bmtSqCeTecHhp596bKVK2w5c6oMpJGf6I4v5OgV8O5LY3-rywajyLf1jJUA',
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_AQgJqdVssTe1BfzPjbT3UABZbe8JHcXw_VB2F6bLEJoz5Fr58nv95vvcbBIXHkQJmw',
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_ATM3cLbRwkecpetpvM-DkVKdS2LoG7elPDf25DypngfGs2yewwGHlP1V738S0186uA',
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_AXDAezO_3LiB6d77HinZOFYXMdjzOHGohKHz-sLVE8EkOcC613VQq8em13L1l2nbcw',
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_AcXKzj3ea_CPVEvEWLX0IC2G77UUqpoJzGnB9Jhj4OUS5Jhx3ZtpE1eSFiR-1RZ_Nw',
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_Ael1f69mGLvXi8DnhWqMYOn9Fpn8LmkcoHBSlJs_OsFO7mW2wLfp-NrlNB6kjOUbjg',
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_AT8jPlt5lrukQj_VcFNnwW1M7mHv3LhZPoYzHyrjoI52ej5EFDQQi_JSIyuLWCWKRQ',
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_AUmzLJvNvc422PZrXBaYg_m7B3Mc2v0eZff-70eKV_q7bYWQRx27IVcNgE6CvuNB8A',
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_ASf2YYwB0ZdCfr5tkRUFcjydTN9VqD2peN-fQ_n1Vkh4vDf8ru-f5aCAEwWtQYn2YQ',
    'https://res.wx.qq.com/op_res/ryufwXvtYgdWX7iRcQ8_AWHm3ruZvj9ODqeWGMrUZqtitbjiyoj8xoEysk-roBcLmhHZ-vwX3k5rsJHz83gRsg'
  ]

  const goods = []
  for (let id = 0; id < num; id++) {
    goods.push({
      id,
      title: titles[(id % titles.length)],
      icon: images[(id % titles.length)] // `/images/goods/g${(id % num)}.jpg`
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