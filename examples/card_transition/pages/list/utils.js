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

export const generateGridList = (childCount, columns) => {
  const ans = []
  for (let i = 0; i < childCount; i++) {
    const ratio = imageRatio[Math.floor(Math.random() * imageRatio.length)]
    ans.push({
      id: i,
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