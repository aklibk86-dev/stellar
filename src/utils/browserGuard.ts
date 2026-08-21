/**
 * 国内社交应用内置浏览器通常无法正常完成支付、订阅和客服流程。
 * 这些环境统一提示用户切换到系统浏览器，避免被应用内 WebView 劫持。
 */
const RESTRICTED_WEBVIEW_UA = [
  /MicroMessenger/i,
  /WeChat/i,
  /(?:^|[ ;])QQ(?:\/|browser)/i,
  /QQBrowser/i,
  /AlipayClient/i,
  /Alipay/i,
  /DingTalk/i,
  /Weibo/i,
]

export const isRestrictedWebView = (userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') =>
  RESTRICTED_WEBVIEW_UA.some((pattern) => pattern.test(userAgent))
