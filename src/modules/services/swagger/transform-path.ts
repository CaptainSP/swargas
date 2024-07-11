export function transformPath(path: string) {
  // /:param to /{param}
  return path.replace(/:(\w+)/g, "{$1}");
}
