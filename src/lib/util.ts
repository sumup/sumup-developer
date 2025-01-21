export function isRelative(url: string): boolean {
  return !!url && url.match(/^\/[^\/\\]/) !== null;
}
