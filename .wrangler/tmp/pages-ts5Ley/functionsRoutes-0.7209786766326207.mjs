import { onRequestGet as __courses__course__docs___path___js_onRequestGet } from "/home/user/kalam-cx/functions/courses/[course]/docs/[[path]].js"
import { onRequestHead as __courses__course__docs___path___js_onRequestHead } from "/home/user/kalam-cx/functions/courses/[course]/docs/[[path]].js"
import { onRequestGet as __courses__course__media___path___js_onRequestGet } from "/home/user/kalam-cx/functions/courses/[course]/media/[[path]].js"
import { onRequestHead as __courses__course__media___path___js_onRequestHead } from "/home/user/kalam-cx/functions/courses/[course]/media/[[path]].js"

export const routes = [
    {
      routePath: "/courses/:course/docs/:path*",
      mountPath: "/courses/:course/docs",
      method: "GET",
      middlewares: [],
      modules: [__courses__course__docs___path___js_onRequestGet],
    },
  {
      routePath: "/courses/:course/docs/:path*",
      mountPath: "/courses/:course/docs",
      method: "HEAD",
      middlewares: [],
      modules: [__courses__course__docs___path___js_onRequestHead],
    },
  {
      routePath: "/courses/:course/media/:path*",
      mountPath: "/courses/:course/media",
      method: "GET",
      middlewares: [],
      modules: [__courses__course__media___path___js_onRequestGet],
    },
  {
      routePath: "/courses/:course/media/:path*",
      mountPath: "/courses/:course/media",
      method: "HEAD",
      middlewares: [],
      modules: [__courses__course__media___path___js_onRequestHead],
    },
  ]