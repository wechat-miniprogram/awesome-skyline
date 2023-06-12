const AnimationStatus = {
  dismissed: 0, // The animation is stopped at the beginning.
  forward: 1, // The animation is running from beginning to end.
  reverse: 2, // The animation is running backwards, from end to beginning.
  completed: 3, // The animation is stopped at the end.
}

const { Easing, shared } = wx.worklet

export const Curves = {
  linearToEaseOut: Easing.bezier(0.35, 0.91, 0.33, 0.97).factory(),
  easeInToLinear: Easing.bezier(0.67, 0.03, 0.65, 0.09).factory(),
  fastOutSlowIn: Easing.bezier(0.4, 0.0, 0.2, 1.0).factory(),
  slowOutFastIn: Easing.bezier(0.0, 0.8, 1.0, 0.6).factory(),
  easeOutCubic: Easing.bezier(0.215, 0.61, 0.355, 1.0).factory(),
}

export function CurveAnimation({
  animation, animationStatus, curve, reverseCurve
}) {
  const { derived } = wx.worklet

  return derived(() => {
    'worklet'

    const useForwardCurve = !reverseCurve || animationStatus.value !== AnimationStatus.reverse
    const activeCurve = useForwardCurve ? curve : reverseCurve

    const t = animation.value
    if (!activeCurve) return t
    if (t === 0 || t === 1) return t
    return activeCurve(t)
  })
}

export const lerp = (begin, end, t) => {
  'worklet'
  return begin + (end - begin) * t
}

const ScaleTransitionRouteBuilder = (routeContext) => {
  const {
    primaryAnimation,
    primaryAnimationStatus,
    userGestureInProgress,
  } = routeContext

  const shareEleTop = shared(0)
  routeContext.shareEleTop = shareEleTop

  const _curvePrimaryAnimation = CurveAnimation({
    animation: primaryAnimation,
    animationStatus: primaryAnimationStatus,
    curve: Easing.in(Curves.fastOutSlowIn),
    reverseCurve: Easing.out(Curves.fastOutSlowIn)
  })

  // 每次路由动画结束（进入或返回）都会重置一下
  const reset = () => {
    'worklet'
    if (globalThis['RouteCardSrcRect']) {
      globalThis['RouteCardSrcRect'].value = undefined
    }
    if (globalThis['RouteCardDestRect']) {
      globalThis['RouteCardDestRect'].value = undefined
    }
  }

  const handlePrimaryAnimation = () => {
    'worklet'
    const status = primaryAnimationStatus.value
    // 手势返回时，动画在详情页处理，此处顶层节点只做整体透明度淡出
    if (userGestureInProgress.value) {
      return {
        opacity: _curvePrimaryAnimation.value,
      }
    }

    if (status == AnimationStatus.dismissed) {
      reset()
      return {
        transform: `translate(0, 0) scale(0)`,
      }
    }

    if (status == AnimationStatus.completed ) {
      reset()
      return {
        transform: `translate(0, 0) scale(1)`,
      }
    }

    let transX = 0
    let transY = 0
    let scale = status === AnimationStatus.reverse ? 1 : 0

    // 进入或者接口返回
    if (globalThis['RouteCardSrcRect'] && globalThis['RouteCardSrcRect'].value != undefined) {
      const begin = globalThis['RouteCardSrcRect'].value
      const end = globalThis['RouteCardDestRect'].value

      if (status === AnimationStatus.forward) {
        shareEleTop.value = end.top
      }

      let t = _curvePrimaryAnimation.value
      if (status === AnimationStatus.reverse || status === AnimationStatus.dismissed) {
        t = 1 - t
      }

      const shareEleX = lerp(begin.left, end.left, t)
      const shareEleY = lerp(begin.top, end.top, t)
      const shareEleW = lerp(begin.width, end.width, t)

      transX = shareEleX
      if (status === AnimationStatus.reverse) {
        scale = shareEleW / begin.width
        transY = shareEleY - begin.top * scale
      } else {
        scale = shareEleW / end.width
        transY = shareEleY - end.top * scale
      }
    }

    return {
      transform: `translate(${transX}px, ${transY}px) scale(${scale})`,
      transformOrigin: '0 0',
      opacity: _curvePrimaryAnimation.value,
    }
  }

  return {
    opaque: false,
    handlePrimaryAnimation,
    transitionDuration: 250,
    reverseTransitionDuration: 250,
    canTransitionTo: false,
    canTransitionFrom: false,
    barrierColor: "rgba(0, 0, 0, 0.3)",
  }
}

let hasInstalled = false
export function installRouteBuilder() {
  if (hasInstalled) {
    return
  }
  wx.router.addRouteBuilder('CardScaleTransition', ScaleTransitionRouteBuilder)
  hasInstalled = true
}
