export const lightBlue = {
  0: '#E1F5FE',
  100: '#B3E5FC',
  200: '#81D4FA',
  300: '#4FC3F7',
  400: '#29B6F6',
  500: '#03A9F4',
  600: '#039BE5',
  700: '#0288D1',
  800: '#0277BD',
  900: '#01579B',
}

export const generateList = (childCount) => {
  const ans = []
  for (let i = 0; i < childCount; i++) {
    ans.push({
      id: i,
      color: lightBlue[`${100 * (i % 9)}`],
    })
  }
  return ans
}

const contents = [
  '小程序推出 Skyline 新渲染框架啦',
  '推荐 Skyline，使用后体验流畅很多~',
  '开发必备！共享元素、自定义路由、手势系统',
  'Hayya Hayya！我用小程序啦',
]

const nicknames = [
  'REX',
  'BINNIE',
  'ERIC',
  'SANFORD',
]

const imageRatio = [
  {
    width: 3,
    height: 4,
    imageRatio: 3 / 4,
  },
  {
    width: 4,
    height: 3,
    imageRatio: 4 / 3,
  },
  {
    width: 1,
    height: 1,
    imageRatio: 1 / 1,
  },
]

const imageList = [
  // 3:4
  [
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr_TJOaxvM0jTWnZCPVx5tYhqZIIAWcwZ-wjkthDNgUPon6gB8cS1-4Gmj9Fa0emByQ',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr5TiaeMo-e_G_0VkoAgrUpJDa0vkq7A-ZqnGdXPqENXxwOpNm6WNaukJzkaNpe2l4g',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr3Vg3QwFEkRrtGVFfuis3HPsfPRAimoR3xrmxA6WqSP6gqLYxpQR70H0Mjd82xRvLg',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr57xPb6otBpyKgqlzjXvSaLKB_SPr5oYFTYCYUbk6bCwyLvvPWUVpsNuYRjVNouuDw',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr8oVdhjDzwpGQWkUNT3VLWmNYEetJXErnWq48jD0zVELo45qmUAdu7jCgFskY6Eh8w',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr1x4v1gTqT3MrC7LtVTjQXb_9hd9vbCf12guLPXiMXd0G7IUnLQXkOa-o1eNyAJ_nA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr7lTnuuiwGJPwwjxDVYbDolj05sAxd5cOESVZt4_nl1KwzkiDWTvG56LuhE45xAaZA'
  ],
  // 4:3
  [
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr87sFqvqtkPc7qeZdary_8crGWuX_SOb72lupHA7sWx0dti3JrJXdP_lwm0ZtvINXg',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr3vA4i7lSkWNR0BRe_g4A-_lo5MYYlkks8oHLoZzXjqAm_M3RvDAXtn9UUgZuQtVBA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr5Ifsj1_cRjONPrw-gUgq8g6BNH8sYQ3kBBQas5JAeMN0zsCBY9gmz3D7kj_GOWfHw',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr1IwceePWSJ_EhG4QedvnFKN6v_mNlNuwG2FkAIoOhx_1fyCDEqtHWSktSrPmLvTpw',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrzz951X66QJWV_Oj4MT6XImEk-wFlNZP6mJE1Vt-ybtD1UK7ARlhOBl9bizrC5KA9g',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrxFO1zooQxE0ufna7fMaqrU-Pp4Dm2rw5dFcTdBymLTijegIFw3WcVD1rUyLD4XTig',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr6WcfJCajSnCm4CNu5oQ5HPsPqyzWD-vtFVuJDZOhMpcG1iN0tvOsvS8DUgn3qO8UA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr4HKYTq7-4l-F47z8u2QbvNsjcTEA3Cu5-4wQpBGPeWKCh66Ho5W42fn3naWuN2NJg',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr8PdfZEyicDsJiFPBw8MAjve2UKbzLds_-IZW_Q0EYUbboQk-31FeTkFmzuNzCfLHg'
  ],
  // 1:1
  [
    'https://res.wx.qq.com/op_res/KSWft_GRyQ3WEzVUTCSWs7HaJh0lgdPce6Uon3dhNpZ3R3sTVA3NLrOORpMDGaBl5P8QkzHZCaOErPlma2sAow',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrwcWdDUeblb42H9kVfv14Eru-W62xBL1bUXbfwZbaJG7_JrKvnAKvdVCQJkS3PX3IQ',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr13IooGqagGNd7x5NTGbtrz4g0NrIVLLJ2KSx-BcYpaGMTpnv-pUB_iexsCzQC4wZg',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrxD9Yj0ZHr0C5YMm7qYRo2fqji9kH4CS6LUyQf4YXzHzK3BW0FFNZiTQb6AK9bp1WA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr5yBy6GoASjPro9uFIUZVFdiDIjiJObbopuhr7PUXnsTLQ537ujpIBxyX2Ln2gRu0w',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihrzhx4m_v7j5nYGhkUG5h-dulp3X7FxpQVY8L1QzVqPROJHUcK0mO38isUiclpbae_Q',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr_VrnIzjbAVDL2cmG0wjYsNZv1l_lacmGCshp9OEz3QcPnn9YymbITplyQS5T5C-VA',
    'https://res.wx.qq.com/op_res/BqgN85sXxTbk1kynEEihr0m2rsO-Y1l6Wsz_sFyu7vJj_ZTfI7GABbstLg4GUDTZVeZCKgDADCmsDjmF8rG7dw'
  ]
]

export const generateGridList = (childCount, columns) => {
  const ans = []
  for (let i = 0; i < childCount; i++) {
    const ratioIdx = Math.floor(Math.random() * imageRatio.length)
    const ratio = imageRatio[ratioIdx]
    const img = imageList[ratioIdx][Math.floor(Math.random() * imageList[ratioIdx].length)]
    ans.push({
      id: i,
      src: img,
      ...ratio,
      like: Math.floor(Math.random() * 10000),
      content: contents[Math.floor(Math.random() * contents.length)],
      nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
    })
  }
  return ans
}


export const clamp = function (cur, lowerBound, upperBound) {
  'worklet';
  if (cur > upperBound) return upperBound;
  if (cur < lowerBound) return lowerBound;
  return cur;
};

export const compareVersion = function (v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10)
    const num2 = parseInt(v2[i], 10)

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}