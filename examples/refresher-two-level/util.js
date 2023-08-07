export function getCategory() {
	let categorys = [
	  '中小商户',
	  '商超零售',
	  '品牌服饰',
	  '餐饮',
	  '医疗',
	  '酒旅',
	  '政务',
	  '开发技术',
	  '产品能力',
	  '运营规范',
	]
	let images = [
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJgc9If4xjgvN3O4UQclWMiJxMoExkarf71FN-3SSf3Sh-GoatfvTbKcPE-grH-1L9g',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJrmxgZKLSYHHwqx6YfJyqPnSNeIHovelr_r6GLFpsiCuCuBgYKBc68vBi0dJYSMeZA',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJk4e_uP2-FWEQKo5Ijp5itIrlf-qIXozTGY6D595Ri2YIoLCUS7YseOda2JLTAEz7Q',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJj6M4Aqf4ov3F7tRlrb62now5owS_Q6vkhsWjnU_uWVbBR84dTHxG4tzAcjwAqOGZQ',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJrBCMpypwJ_xFgSnas6etb7Y6JuMRRMBJ6cSMmbmSkCkOjCSPDdC_eLEK1_FT-d-PQ',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJitcJIfp9P4VSWxi3126XeiyZ2BnnH0xg-oIXAUgHBgaHjBMwxzSjSkEkTMRqzlKZw',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJnw5zq4f_XW3swKAowexqAbziuojU5W9v4CJixA-NDJShkfS0ne3KWY_6SB56yqb3g',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJu8Q1L10fFiMMnZVYnLoP1GuT0q26CJLtjSRfJAjTvj6DBNuWrzzMD9UYZEb-pznKA',
	  'https://res.wx.qq.com/op_res/RBwYn_b7VGuWuLJ2qBChUzvBckq_FnOrUIIgSP2hJ9cYByUIwgzBEaDCcF5YiPNMmcMg0ewQBn_nMCt-q71vsg',
	  'https://res.wx.qq.com/op_res/Zmvv0fisUjaMjuqWLhWWkuzGktaXJEQt46EaKsCKeT06Z4tROseXN0joI7h2qwzqyx2FUy57cveZL-8iArI8_Q',
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
	  '小程序性能优化课程基于实际开发场景，提升小程序性能表现，满足用户体验',
	  '解析常见小程序违规类型，帮助大家更好理解平台规则',
	  '快速了解微信小程序在医疗行业的应用',
	  '小程序直播的企业实践案例。',
	  '微信客服轻松配置，入门必修',
	  '想做互联网的生意，可以通过微信怎么经营呢？',
	  '了解小程序开发动态，听官方为你解读新能力',
	  '医保支付、互联网医院、线上问诊...小程序如何帮助传统医院数字化？',
	  '内含开店指引、店铺运营和平台规则，帮你快速掌握小商店经营秘诀',
	  '浅谈连锁零售的私域流量运营'
	]
  
	const images = [
	  'https://res.wx.qq.com/op_res/RBwYn_b7VGuWuLJ2qBChU_LhYxhaP5JTy7TWgezsDY7RW_l_e04fR7oG7sCKmS8hc8mVeZaY6eUWT3nk-ww_ZQ',
	  'https://res.wx.qq.com/op_res/Zmvv0fisUjaMjuqWLhWWkuzGktaXJEQt46EaKsCKeT06Z4tROseXN0joI7h2qwzqyx2FUy57cveZL-8iArI8_Q',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJrBCMpypwJ_xFgSnas6etb7Y6JuMRRMBJ6cSMmbmSkCkOjCSPDdC_eLEK1_FT-d-PQ',
	  'https://res.wx.qq.com/op_res/RBwYn_b7VGuWuLJ2qBChU-O3axOjUJGFgutF9Xc1JL1uxXFWYdW85mWG0Zvm5nv7rvP18CJ0q6-RRFM0xWLLog',
	  'https://res.wx.qq.com/op_res/RBwYn_b7VGuWuLJ2qBChU3ywQmrV-rSREDwo0Hp9m7iIZZ7Njvjq_TlOg_0ss0cgQL0pfKOuB2NRpAcwfALxvw',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJgc9If4xjgvN3O4UQclWMiJxMoExkarf71FN-3SSf3Sh-GoatfvTbKcPE-grH-1L9g',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJu8Q1L10fFiMMnZVYnLoP1GuT0q26CJLtjSRfJAjTvj6DBNuWrzzMD9UYZEb-pznKA',
	  'https://res.wx.qq.com/op_res/RBwYn_b7VGuWuLJ2qBChU1GROxmiPIBOCoA5Es44GxjN0KuCQQsoxEH33l05TCgk04n0dssHAIPxIV2ycSlSJA',
	  'https://res.wx.qq.com/op_res/RBwYn_b7VGuWuLJ2qBChU68wmBQzYcfQfuIAh1IKWq7OyG0EWxdWGhotYHFh-k-JpmkJ1Otq-mYUT8Dp3iucvg',
	  'https://res.wx.qq.com/op_res/mGK9l-4vYzVgHuIz_uFeJrmxgZKLSYHHwqx6YfJyqPnSNeIHovelr_r6GLFpsiCuCuBgYKBc68vBi0dJYSMeZA'
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
	  '本月最热',
	  '官方经营',
	  '行业实践',
	  '微信服务商'
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
	  '产品课程',
	  '技术课程',
	  '运营课程'
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
	const urls = [
	  'http://mmbiz.qpic.cn/mmbiz_jpg/PxLPibq1ibyh3b3EQ9Ngrejypictlz1ZNMJVnBg3fkibIA3F1qajkQlVG2eKtbxltWEGrvYjfrLa5ib54wvnRMDLNDw/0?wx_fmt=jpeg',
	  'http://mmbiz.qpic.cn/mmbiz_jpg/PxLPibq1ibyh2zgPxemO7asicBcbcTHb2icticjEqxJKLtxhVOFVHjmCvto8YLjLpGP9p73ia78sicjvBDObNicocSIZ3A/0?wx_fmt=jpeg',
	  'http://mmbiz.qpic.cn/mmbiz_jpg/PxLPibq1ibyh37FxQAIO6GuOWdvfadyoic6flNp9cm9Czs9djzdyD6pOZcJ5Mfa2XUjZXlUoALaOtEAauGwmbibLnQ/0?wx_fmt=jpeg',
	  'http://mmbiz.qpic.cn/mmbiz_jpg/PxLPibq1ibyh0dEhZyMCWicMCVDXxNb44ZtTA6RT8c2FVt7FGPPO4r1UUCicQERZDXPiaVS5yPjN4HaSvvIwbxOp2rQ/0?wx_fmt=jpeg',
	  'http://mmbiz.qpic.cn/mmbiz_jpg/PxLPibq1ibyh3GeJcbCXCxqXNbRVSvb1757BmGxric35XZecmo9ctlU2dsMIL5PqCjUMUN0OTGcoMPUndO1euRcow/0?wx_fmt=jpeg'
	]
	const videos = []
	for (let id = 0; id < num; id++) {
	  videos.push({
		id,
		title: titles[(id % titles.length)],
		url: urls[(id % urls.length)]
	  })
	}
	return videos
  }