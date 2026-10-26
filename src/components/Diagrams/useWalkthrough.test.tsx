// @vitest-environment jsdom
import { Diagram } from "@cloudflare/nimbus-docs/react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useWalkthrough } from "./useWalkthrough";

const steps = [{ id: "first" }, { id: "second" }, { id: "last" }];
let root: Root;
let container: HTMLDivElement;

function Walkthrough() {
  const walkthrough = useWalkthrough(steps);
  return (
    <div ref={walkthrough.surfaceRef}>
      <output>{walkthrough.active}</output>
      <button onClick={walkthrough.play}>Play</button>
    </div>
  );
}

beforeEach(async () => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
      disconnect() {}
    },
  );
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root.render(
      <Diagram label="Walkthrough">
        <Walkthrough />
      </Diagram>,
    ),
  );
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const active = () => container.querySelector("output")!.textContent;
async function press(
  key: string,
  target = container.querySelector<HTMLElement>("[data-nb-diagram]")!,
) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  await act(() => {
    target.dispatchEvent(event);
  });
  return event;
}
const advance = () => act(() => vi.advanceTimersByTime(3000));

it("starts, pauses, resumes and replays with the diagram's Space shortcut", async () => {
  expect(active()).toBe("0");
  await press(" ");
  await advance();
  expect(active()).toBe("1");
  await press(" ");
  await advance();
  expect(active()).toBe("1");
  await press(" ");
  await advance();
  expect(active()).toBe("2");
  await press(" ");
  expect(active()).toBe("0");
  await advance();
  expect(active()).toBe("1");
});

it("preserves native button activation and Nimbus's reset shortcut", async () => {
  const button = container.querySelector("button")!;
  expect((await press(" ", button)).defaultPrevented).toBe(false);
  await advance();
  expect(active()).toBe("0");
  await act(() => button.click());
  await advance();
  expect(active()).toBe("1");
  await press("r");
  expect(active()).toBe("0");
});
