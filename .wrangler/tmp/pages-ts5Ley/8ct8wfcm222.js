// <define:__ROUTES__>
var define_ROUTES_default = { version: 1, include: ["/courses/*/media/*", "/courses/*/docs/*"], exclude: [] };

// ../../../root/.npm/_npx/0eedb5afd4158ff3/node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/home/user/kalam-cx/.wrangler/tmp/pages-ts5Ley/functionsWorker-0.47984874570729796.mjs";
import { isRoutingRuleMatch } from "/root/.npm/_npx/0eedb5afd4158ff3/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/home/user/kalam-cx/.wrangler/tmp/pages-ts5Ley/functionsWorker-0.47984874570729796.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=8ct8wfcm222.js.map
