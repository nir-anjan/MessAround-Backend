/**
 * List all registered routes in the Express app
 */
function listRoutes(app) {
  const routes = [];

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      const methods = Object.keys(middleware.route.methods)
        .map((m) => m.toUpperCase())
        .join(", ");
      routes.push({
        method: methods,
        path: middleware.route.path,
      });
    } else if (middleware.name === "router") {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods)
            .map((m) => m.toUpperCase())
            .join(", ");

          // Get base path from regexp
          const basePath = middleware.regexp
            .toString()
            .replace("/^", "")
            .replace("\\/?(?=\\/|$)/i", "")
            .replace(/\\\//g, "/");

          let fullPath = handler.route.path;
          if (basePath && basePath !== "/") {
            fullPath = basePath + handler.route.path;
          }

          routes.push({
            method: methods,
            path: fullPath,
          });
        }
      });
    }
  });

  return routes;
}

/**
 * Display all routes in a formatted table
 */
function displayRoutes(app, logger) {
  const routes = listRoutes(app);

  logger.info("=".repeat(60));
  logger.info("📍 AVAILABLE API ENDPOINTS");
  logger.info("=".repeat(60));

  // Group routes by category
  const categories = {
    "🏥 Health": [],
    "🔐 Authentication": [],
    "🍽️  Mess Management": [],
    "📋 Plan Management": [],
    "📝 Subscription Management": [],
    "✅ Attendance Management": [],
    "📊 Dashboard": [],
  };

  routes.forEach((route) => {
    const { method, path } = route;
    const routeStr = `${method.padEnd(7)} ${path}`;

    if (path.includes("/health")) {
      categories["🏥 Health"].push(routeStr);
    } else if (path.includes("/auth")) {
      categories["🔐 Authentication"].push(routeStr);
    } else if (
      path.includes("/messes") &&
      !path.includes("/plans") &&
      !path.includes("/today-summary")
    ) {
      categories["🍽️  Mess Management"].push(routeStr);
    } else if (path.includes("/plans")) {
      categories["📋 Plan Management"].push(routeStr);
    } else if (
      path.includes("/subscriptions") &&
      !path.includes("/attendance")
    ) {
      categories["📝 Subscription Management"].push(routeStr);
    } else if (path.includes("/attendance")) {
      categories["✅ Attendance Management"].push(routeStr);
    } else if (path.includes("/today-summary")) {
      categories["📊 Dashboard"].push(routeStr);
    }
  });

  // Display categorized routes
  Object.entries(categories).forEach(([category, categoryRoutes]) => {
    if (categoryRoutes.length > 0) {
      logger.info(`\n${category}`);
      categoryRoutes.forEach((route) => {
        logger.info(`  ${route}`);
      });
    }
  });

  logger.info("\n" + "=".repeat(60));
  logger.info(`📊 Total Endpoints: ${routes.length}`);
  logger.info("=".repeat(60) + "\n");
}

module.exports = {
  listRoutes,
  displayRoutes,
};
