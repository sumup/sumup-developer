/* eslint-disable jsx-a11y-x/no-noninteractive-tabindex -- Focus allows keyboard scrolling of the sequence region. */
import { Diagram } from "@cloudflare/nimbus-docs/react";
import { CardReaderSolo, Code, Laptop } from "@sumup-oss/icons";
import { useEffect, useRef } from "react";
import {
  pairingActors,
  pairingActorLabel,
  pairingSequence,
} from "../../lib/pairingSequence";
import DiagramControls from "./DiagramControls";
import { useWalkthrough } from "./useWalkthrough";
import shared from "./Diagram.module.css";
import styles from "./PairingSequence.module.css";

const icons = { app: Laptop, api: Code, reader: CardReaderSolo };
const position = (actor: (typeof pairingActors)[number]["id"]) =>
  120 + pairingActors.findIndex(({ id }) => id === actor) * 240;

function Sequence() {
  const walkthrough = useWalkthrough(pairingSequence);
  const { diagram, active, playing, selectStep } = walkthrough;
  const step = pairingSequence[active];
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
    // Keep the active exchange in view on narrow screens without scrolling the page.
    const center = (position(step.from) + position(step.to)) / 2;
    scroller.scrollLeft =
      (center / 720) * scroller.scrollWidth - scroller.clientWidth / 2;
  }, [step]);
  return (
    <div
      ref={walkthrough.surfaceRef}
      className={shared.content}
      data-pairing-sequence
      data-prose="off"
    >
      <div className={shared.toolbar}>
        <strong>Pairing and checkout</strong>
        <DiagramControls walkthrough={walkthrough} />
      </div>
      <div
        className={styles.scroll}
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Pairing sequence; scroll horizontally on small screens"
      >
        <div className={styles.sequence} data-playing={playing}>
          <div className={styles.actors} aria-hidden="true">
            {pairingActors.map(({ id, title, description }) => {
              const Icon = icons[id];
              return (
                <div className={styles.actor} key={id}>
                  <span className={styles.icon}>
                    <Icon size="24" />
                  </span>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </div>
              );
            })}
          </div>
          <ol
            className={styles.messages}
            aria-label="Pairing and checkout steps"
          >
            {pairingSequence.map((item, index) => {
              const from = position(item.from);
              const to = position(item.to);
              const self = from === to;
              const direction = to > from ? 1 : -1;
              const path = self
                ? `M ${from} 20 H ${from + 48} Q ${from + 56} 20 ${from + 56} 28 V 42 Q ${from + 56} 50 ${from + 48} 50 H ${to}`
                : `M ${from} 50 H ${to}`;
              return (
                <li
                  key={item.id}
                  data-active={index === active}
                  data-complete={index < active}
                >
                  <button
                    className={styles.message}
                    type="button"
                    disabled={!diagram.visible}
                    aria-current={index === active ? "step" : undefined}
                    aria-label={`Step ${index + 1}: ${pairingActorLabel(item)}: ${item.title}`}
                    aria-controls={`${diagram.id}-description`}
                    onClick={() => selectStep(index)}
                  >
                    <svg viewBox="0 0 720 64" aria-hidden="true">
                      <circle className={styles.badge} cx="28" cy="38" r="12" />
                      <text
                        className={styles.number}
                        x="28"
                        y="38"
                        dy=".35em"
                        textAnchor="middle"
                      >
                        {index + 1}
                      </text>
                      <text
                        className={styles.label}
                        x={self ? from - 18 : (from + to) / 2}
                        y={self ? 39 : 32}
                        textAnchor={self ? "end" : "middle"}
                      >
                        {item.title}
                      </text>
                      <path className={styles.arrow} d={path} />
                      <path
                        className={styles.head}
                        d={`M ${to - (self ? -1 : direction) * 7} 46 L ${to} 50 L ${to - (self ? -1 : direction) * 7} 54`}
                      />
                      <path
                        key={`${item.id}-${index === active}`}
                        className={styles.trace}
                        d={path}
                        pathLength="1"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <div
        id={`${diagram.id}-description`}
        className={shared.description}
        role="status"
        aria-atomic="true"
      >
        <span className={shared.actor}>
          Step {active + 1} of {pairingSequence.length} ·{" "}
          {pairingActorLabel(step)}
        </span>
        <strong>{step.title}</strong>
        <p>{step.description}</p>
      </div>
      <details className={shared.transcript}>
        <summary>Read all steps</summary>
        <ol>
          {pairingSequence.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong> ({pairingActorLabel(item)}).{" "}
              {item.description}
            </li>
          ))}
        </ol>
      </details>
      <p className={shared.caption}>
        Click an arrow to explore a step, or press Play to follow the sequence.
        No requests are sent to your reader.
      </p>
    </div>
  );
}

export default function PairingSequence() {
  return (
    <Diagram
      label="Cloud API pairing and checkout sequence"
      className={shared.diagram}
    >
      <Sequence />
    </Diagram>
  );
}
