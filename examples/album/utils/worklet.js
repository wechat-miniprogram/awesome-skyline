export function getShared(renderer) {
  if (renderer === 'skyline') return wx.worklet.shared
  else return val => ({ value: val })
}

export function getTiming(renderer) {
  'worklet'
  if (renderer === 'skyline') return wx.worklet.timing
  else return (target, options, callback) => {
    if (typeof callback === 'function') setTimeout(callback, 0)
    return target
  }
}

export function getRunOnUI(renderer) {
  if (renderer === 'skyline') return wx.worklet.runOnUI
  else return func => func
}

export function getRunOnJS(renderer) {
  'worklet'
  if (renderer === 'skyline') return wx.worklet.runOnJS
  else return func => func
}
