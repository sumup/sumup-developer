import { Diagram, useDiagram, usePhase } from "@cloudflare/nimbus-docs/react";
import { useEffect, useState } from "react";
import {
  checkoutLifecycle,
  checkoutOutcomes,
} from "../../lib/checkoutLifecycle";
import styles from "./CheckoutLifecycle.module.css";

function Walkthrough() {
  const diagram = useDiagram()!;
  const [outcome, setOutcome] =
    useState<keyof typeof checkoutOutcomes>("successful");
  const { current, running, start, goto } = usePhase({
    steps: checkoutLifecycle.map(({ id }) => ({ id, hold: 3000 })),
    autoplay: false,
    loop: false,
  });
  const active = Math.max(
    0,
    checkoutLifecycle.findIndex(({ id }) => id === current),
  );
  const complete = active === checkoutLifecycle.length - 1;
  useEffect(() => {
    if (complete && diagram.playing) diagram.toggle();
  }, [complete, diagram]);
  const selectStep = (id: string) => {
    if (diagram.playing) diagram.toggle();
    goto(id);
  };

  return (
    <div className={styles.content} data-checkout-lifecycle>
      <div className={styles.toolbar}>
        <label>
          Example result
          <select
            value={outcome}
            onChange={(event) =>
              setOutcome(event.target.value as keyof typeof checkoutOutcomes)
            }
          >
            <option value="successful">Successful</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <div className={styles.controls}>
          {!diagram.reducedMotion && (
            <button
              type="button"
              onClick={() => {
                if (complete) {
                  goto(checkoutLifecycle[0].id);
                  if (!diagram.playing) diagram.toggle();
                } else if (!running) {
                  start();
                  if (!diagram.playing) diagram.toggle();
                } else diagram.toggle();
              }}
            >
              {complete
                ? "Replay walkthrough"
                : !running
                  ? "Play walkthrough"
                  : diagram.playing
                    ? "Pause"
                    : "Resume"}
            </button>
          )}
          <button type="button" onClick={diagram.reset}>
            Reset
          </button>
        </div>
      </div>

      <ol className={styles.steps}>
        {checkoutLifecycle.map((step, index) => (
          <li
            key={step.id}
            data-active={index === active}
            data-complete={index < active}
          >
            <button
              type="button"
              aria-current={index === active ? "step" : undefined}
              aria-describedby={`${diagram.id}-${step.id}`}
              onClick={() => selectStep(step.id)}
            >
              <span className={styles.number} aria-hidden="true">
                {index + 1}
              </span>
              <span>
                <span className={styles.actor}>{step.actor}</span>
                <strong>{step.title}</strong>
              </span>
            </button>
            <p id={`${diagram.id}-${step.id}`}>
              {step.id === "order"
                ? checkoutOutcomes[outcome]
                : step.description}
            </p>
          </li>
        ))}
      </ol>

      <div className={styles.status} role="status">
        <span>
          Step {active + 1} of {checkoutLifecycle.length}
        </span>
        <strong data-order-paid={complete && outcome === "successful"}>
          {complete && outcome === "successful" ? "Order paid" : "Order unpaid"}
        </strong>
      </div>
      <p className={styles.caption}>
        Choose any step to explore it, or play the walkthrough. This example
        sends no payment requests.
      </p>
    </div>
  );
}

export default function CheckoutLifecycle() {
  return (
    <Diagram label="Cloud API checkout lifecycle" className={styles.diagram}>
      <Walkthrough />
    </Diagram>
  );
}
