import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Refresh,
} from "@sumup-oss/icons";
import type { useWalkthrough } from "./useWalkthrough";
import styles from "./Diagram.module.css";

export default function DiagramControls({
  walkthrough,
}: {
  walkthrough: ReturnType<typeof useWalkthrough>;
}) {
  const { diagram, active, complete, playing, selectStep, play } = walkthrough;
  const ready = diagram.visible;
  return (
    <div className={styles.controls}>
      <button
        type="button"
        aria-label="Previous step"
        disabled={!ready || active === 0}
        onClick={() => selectStep(active - 1)}
      >
        <ChevronLeft size="16" aria-hidden="true" />
      </button>
      {!diagram.reducedMotion && (
        <button
          className={styles.play}
          type="button"
          disabled={!ready}
          onClick={play}
          aria-label={
            complete
              ? "Replay walkthrough"
              : playing
                ? "Pause walkthrough"
                : "Play walkthrough"
          }
        >
          {playing ? (
            <Pause size="16" aria-hidden="true" />
          ) : (
            <Play size="16" aria-hidden="true" />
          )}
          {complete ? "Replay" : playing ? "Pause" : "Play"}
        </button>
      )}
      <button
        type="button"
        aria-label="Next step"
        disabled={!ready || complete}
        onClick={() => selectStep(active + 1)}
      >
        <ChevronRight size="16" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Reset walkthrough"
        disabled={!ready}
        onClick={diagram.reset}
      >
        <Refresh size="16" aria-hidden="true" />
      </button>
    </div>
  );
}
