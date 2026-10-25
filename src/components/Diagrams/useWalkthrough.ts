import { useDiagram, usePhase } from "@cloudflare/nimbus-docs/react";
import { useCallback, useEffect, useRef } from "react";

export function useWalkthrough(steps: { id: string }[]) {
  const diagram = useDiagram()!;
  const { current, running, start, goto } = usePhase({
    steps: steps.map(({ id }) => ({ id, hold: 3000 })),
    autoplay: false,
    loop: false,
  });
  const active = Math.max(
    0,
    steps.findIndex(({ id }) => id === current),
  );
  const complete = active === steps.length - 1;
  const { playing, toggle } = diagram;
  const surfaceRef = useRef<HTMLDivElement>(null);

  const play = useCallback(() => {
    if (complete) {
      goto(steps[0].id);
      if (!playing) toggle();
    } else if (!running) {
      start();
      if (!playing) toggle();
    } else toggle();
  }, [complete, goto, playing, running, start, steps, toggle]);

  useEffect(() => {
    if (complete && playing) toggle();
  }, [complete, playing, toggle]);

  // Nimbus's Space shortcut toggles its clock but cannot start a phase runner
  // configured with autoplay=false. Give it the same behavior as our controls.
  useEffect(() => {
    const root = surfaceRef.current?.closest<HTMLElement>("[data-nb-diagram]");
    if (!root) return;
    const keydown = (event: KeyboardEvent) => {
      if (
        event.key !== " " ||
        event.defaultPrevented ||
        (event.target instanceof Element &&
          event.target.closest(
            "button, input, select, textarea, a[href], summary, [contenteditable]",
          ))
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      play();
    };
    root.addEventListener("keydown", keydown, true);
    return () => root.removeEventListener("keydown", keydown, true);
  }, [play]);

  return {
    diagram,
    surfaceRef,
    active,
    complete,
    playing: running && playing && !complete,
    selectStep(index: number) {
      if (playing) toggle();
      goto(steps[index].id);
    },
    play,
  };
}
