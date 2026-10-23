export function parseStaticHeaders(source) {
  const rules = [];
  let current;
  for (const line of source.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      const pattern = line.trim();
      const regex = pattern
        .split(/(\*|:[A-Za-z]\w*)/)
        .map((part) =>
          part === "*"
            ? ".*"
            : part.startsWith(":")
              ? "[^./]+"
              : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        )
        .join("");
      current = {
        absolute: pattern.startsWith("https://"),
        pattern: new RegExp(`^${regex}$`),
        headers: [],
      };
      rules.push(current);
    } else {
      const header = line.trim().match(/^([\w-]+):\s*(.*)$/);
      if (!current || !header)
        throw new Error(`Unsupported header rule: ${line}`);
      current.headers.push([header[1].toLowerCase(), header[2]]);
    }
  }
  return rules;
}

// Cloudflare appends every matching rule's values; fields such as CORS and
// Content-Type must consequently have only one value across all matches.
export function staticHeaderValues(rules, url, name) {
  return rules
    .filter((rule) =>
      rule.pattern.test(
        rule.absolute ? `${url.origin}${url.pathname}` : url.pathname,
      ),
    )
    .flatMap((rule) =>
      rule.headers
        .filter(([key]) => key === name.toLowerCase())
        .map(([, value]) => value),
    );
}
