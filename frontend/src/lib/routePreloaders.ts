const preloaders = {
  '/': () => import('../pages/Dashboard'),
  '/employees': () => import('../pages/Employees'),
};

const loaded = new Set<keyof typeof preloaders>();

export type AppRoutePath = keyof typeof preloaders;

export function loadRoute(path: AppRoutePath) {
  return preloaders[path]();
}

export function preloadRoute(path: AppRoutePath) {
  if (loaded.has(path)) return;
  loaded.add(path);
  void preloaders[path]().catch(() => {
    loaded.delete(path);
  });
}
