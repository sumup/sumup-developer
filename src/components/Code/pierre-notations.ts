interface WordRange {
  start: number;
  end: number;
}
interface LineNotation {
  classes: string[];
  words: WordRange[];
}

// Preserve Nimbus's authored notations after Pierre replaces the code layout.
export function readNotations(pre: HTMLElement): LineNotation[] {
  return [...pre.querySelectorAll<HTMLElement>("code > .line")].map((line) => {
    const classes = ["highlighted", "focused", "error", "warning"].filter(
      (name) => line.classList.contains(name),
    );
    if (line.classList.contains("diff")) {
      if (line.classList.contains("add")) classes.push("add");
      if (line.classList.contains("remove")) classes.push("remove");
    }
    const words: WordRange[] = [];
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    let offset = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const end = offset + (node.textContent?.length ?? 0);
      if (node.parentElement?.closest(".highlighted-word")) {
        words.push({ start: offset, end });
      }
      offset = end;
    }
    return { classes, words };
  });
}

export function applyNotations(root: ShadowRoot, lines: LineNotation[]) {
  for (const line of root.querySelectorAll<HTMLElement>(
    "[data-content] > [data-line]",
  )) {
    const notation = lines[Number(line.dataset.line) - 1];
    if (!notation) continue;
    line.classList.add(...notation.classes.map((name) => `portal-${name}`));
    // Theme changes can call onPostRender without replacing the token nodes.
    if (line.querySelector(".portal-word")) continue;
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      nodes.push(node as Text);
    }
    let offset = 0;
    for (const node of nodes) {
      const text = node.data;
      const end = offset + text.length;
      const ranges = notation.words.filter(
        (range) => range.start < end && range.end > offset,
      );
      if (ranges.length) {
        const fragment = document.createDocumentFragment();
        let cursor = 0;
        for (const range of ranges) {
          const start = Math.max(range.start - offset, 0);
          const stop = Math.min(range.end - offset, text.length);
          fragment.append(text.slice(cursor, start));
          const mark = document.createElement("span");
          mark.className = "portal-word";
          mark.textContent = text.slice(start, stop);
          fragment.append(mark);
          cursor = stop;
        }
        fragment.append(text.slice(cursor));
        node.replaceWith(fragment);
      }
      offset = end;
    }
  }
}
