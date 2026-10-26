import { Diagram } from "@cloudflare/nimbus-docs/react";
import { Status } from "@sumup-oss/circuit-ui";
import {
  CardReaderSolo,
  Code,
  Laptop,
  type IconComponentType,
} from "@sumup-oss/icons";
import { useState, type ReactNode } from "react";
import {
  checkoutLifecycle,
  checkoutOutcomes,
} from "../../lib/checkoutLifecycle";
import styles from "./CheckoutLifecycle.module.css";
import shared from "./Diagram.module.css";
import DiagramControls from "./DiagramControls";
import { useWalkthrough } from "./useWalkthrough";

const phaseLabels = ["Create", "Accept", "Pay", "Result", "Update"];

function ActorCard({
  icon: Icon,
  title,
  description,
  active,
  children,
}: {
  icon: IconComponentType<"24">;
  title: string;
  description: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.node} data-active={active}>
      <span className={styles.icon}>
        <Icon size="24" />
      </span>
      <strong>{title}</strong>
      <span className={styles.nodeDescription}>{description}</span>
      {children}
    </div>
  );
}

function Connection({
  active,
  reverse,
  label,
}: {
  active: boolean;
  reverse: boolean;
  label: string;
}) {
  return (
    <div
      className={styles.connector}
      data-active={active}
      data-reverse={reverse}
    >
      <span className={styles.connectionLabel}>{label}</span>
      <span className={styles.packet} />
    </div>
  );
}

function Walkthrough() {
  const walkthrough = useWalkthrough(checkoutLifecycle);
  const { diagram, active, complete, playing, selectStep } = walkthrough;
  const ready = diagram.visible;
  const [outcome, setOutcome] =
    useState<keyof typeof checkoutOutcomes>("successful");
  const paid = complete && outcome === "successful";
  const step = checkoutLifecycle[active];
  const result =
    outcome === "successful" ? "Payment successful" : "Payment failed";

  return (
    <div
      ref={walkthrough.surfaceRef}
      className={shared.content}
      data-checkout-lifecycle
      data-prose="off"
    >
      <div className={shared.toolbar}>
        <span className={shared.eyebrow}>Checkout lifecycle</span>
        <label>
          Example result
          <select
            disabled={!ready}
            value={outcome}
            onChange={(event) =>
              setOutcome(event.target.value as keyof typeof checkoutOutcomes)
            }
          >
            <option value="successful">Successful</option>
            <option value="failed">Failed</option>
          </select>
        </label>
      </div>

      <div className={shared.canvas}>
        <div className={styles.scene} data-playing={playing} aria-hidden="true">
          <ActorCard
            icon={Laptop}
            title="Your application"
            description="Creates and tracks the order"
            active={active !== 2}
          >
            <Status
              as="span"
              variant="pill"
              color={paid ? "confirm" : "neutral"}
            >
              {paid ? "Order paid" : "Order unpaid"}
            </Status>
          </ActorCard>
          <Connection
            active={active === 0 || active === 1 || active === 3}
            reverse={active !== 0}
            label={
              active === 0 ? "Checkout" : active === 1 ? "Accepted" : "Webhook"
            }
          />
          <ActorCard
            icon={Code}
            title="SumUp Cloud API"
            description="Connects your app and reader"
            active={active < 4}
          >
            <span className={styles.nodeState}>
              {active < 2
                ? "Accepts the request"
                : active === 2
                  ? "Processes the payment"
                  : "Delivers the result"}
            </span>
          </ActorCard>
          <Connection
            active={active === 2}
            reverse={active > 2}
            label={active > 2 ? "Result" : "Payment"}
          />
          <ActorCard
            icon={CardReaderSolo}
            title="Solo reader"
            description="Collects the customer’s payment"
            active={active === 2}
          >
            <Status
              as="span"
              variant="pill"
              color={
                active > 2
                  ? outcome === "successful"
                    ? "confirm"
                    : "alert"
                  : "neutral"
              }
            >
              {active > 2 ? result : active === 2 ? "Taking payment" : "Ready"}
            </Status>
          </ActorCard>
        </div>
      </div>

      <ol className={styles.steps} aria-label="Checkout steps">
        {checkoutLifecycle.map((item, index) => (
          <li
            key={item.id}
            data-active={index === active}
            data-complete={index < active}
          >
            <button
              type="button"
              disabled={!ready}
              aria-current={index === active ? "step" : undefined}
              aria-label={`Step ${index + 1}: ${item.title}`}
              aria-controls={`${diagram.id}-description`}
              onClick={() => selectStep(index)}
            >
              <span className={styles.number} aria-hidden="true">
                {index + 1}
              </span>
              <span>{phaseLabels[index]}</span>
            </button>
          </li>
        ))}
      </ol>

      <div
        id={`${diagram.id}-description`}
        className={shared.description}
        role="status"
        aria-atomic="true"
      >
        <span className={shared.actor}>{step.actor}</span>
        <strong>{step.title}</strong>
        <p>{complete ? checkoutOutcomes[outcome] : step.description}</p>
      </div>

      <div className={shared.transport}>
        <Status as="span" variant="pill" color={paid ? "confirm" : "neutral"}>
          {paid ? "Order paid" : "Order unpaid"}
        </Status>
        <DiagramControls walkthrough={walkthrough} />
      </div>
      <details className={shared.transcript}>
        <summary>Read all steps</summary>
        <ol>
          {checkoutLifecycle.map((item) => (
            <li key={item.id}>
              <strong>{item.title}.</strong> {item.description}
            </li>
          ))}
        </ol>
      </details>
      <p className={shared.caption}>
        Explore each step, or play the walkthrough. This example sends no
        payment requests.
      </p>
    </div>
  );
}

export default function CheckoutLifecycle() {
  return (
    <Diagram label="Cloud API checkout lifecycle" className={shared.diagram}>
      <Walkthrough />
    </Diagram>
  );
}
