# Nimbus content recipes

The nine recipe files in this directory are copied verbatim from Nimbus's registry handoffs, the agent-oriented counterparts to its [content style guide](https://nimbus-docs.com/style-guide/). Their source is pinned in [source.json](source.json). Each local `<name>.md` corresponds to upstream `apps/www/registry/features/content-<name>.md`. [LICENSE](LICENSE) is copied from the same revision's repository root.

Start with [the SumUp content style reference](../content-style.md) for recipe selection and repository-specific adaptations. Keep those adaptations there so the upstream recipes remain unchanged. The recipes' frontmatter describes registry items; these files are agent references, not website content or installed skills.

## Refresh the snapshot

Review recipe updates when upgrading Nimbus or when its editorial guidance changes. Update `revision` in `source.json` to the full commit SHA you intend to review. From the repository root, run the following command with network access to fetch the recipes and license from that revision:

```bash
python3 - <<'PY'
import json
import re
from pathlib import Path
from urllib.request import urlopen

target = Path(".agents/references/nimbus")
source = json.loads((target / "source.json").read_text())
revision = source["revision"]
assert re.fullmatch(r"[a-f0-9]{40}", revision), "Pin a full commit SHA"
base = f"https://raw.githubusercontent.com/cloudflare/nimbus/{revision}"
files = [(f'{source["path"]}/content-{name}.md', f"{name}.md")
         for name in source["recipes"]] + [("LICENSE", "LICENSE")]
snapshot = {}
for upstream, local in files:
    with urlopen(f"{base}/{upstream}", timeout=30) as response:
        snapshot[local] = response.read()
for local, content in snapshot.items():
    (target / local).write_bytes(content)
PY
```

Review the diff, including the license and compatibility with this repository's schemas and components, before accepting the update. Changes to upstream instructions do not override the SumUp reference. The recipes and license are excluded from Prettier to preserve the original bytes; format repository-owned references separately. The `content-*` CLI commands fetch live registry guidance, so use the pinned source above for reproducible refreshes.
