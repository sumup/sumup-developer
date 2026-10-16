// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { initImageZoom } from "./image-zoom.client";

afterEach(() => document.body.replaceChildren());

it("opens instructional images with the keyboard and restores focus when closed", () => {
  document.body.innerHTML = `<article class="docs-content">
    <img src="/dashboard.png" alt="Sandbox dashboard">
    <img src="/decoration.png" alt="">
    <a href="/guide/"><img src="/linked.png" alt="Linked image"></a>
    <img data-nb-zoom="off" src="/small.png" alt="Opted out">
  </article><img src="/hero.png" alt="Homepage artwork">
  <dialog><button>Close image</button><img data-image-zoom-image alt=""></dialog>`;
  const dialog = document.querySelector("dialog")!;
  dialog.showModal = vi.fn(() => dialog.setAttribute("open", ""));
  dialog.close = vi.fn(() => {
    dialog.removeAttribute("open");
    dialog.dispatchEvent(new Event("close"));
  });
  const trigger = document.querySelector<HTMLImageElement>("article img")!;
  Object.defineProperties(trigger, {
    clientWidth: { value: 320, configurable: true },
    naturalWidth: { value: 729 },
    naturalHeight: { value: 397 },
  });
  const destroy = initImageZoom(dialog);
  expect(document.querySelectorAll('img[role="button"]')).toHaveLength(1);
  trigger.focus();
  trigger.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", cancelable: true }),
  );
  expect(dialog.showModal).toHaveBeenCalledOnce();
  expect(dialog.querySelector("img")!.src).toBe(trigger.src);
  expect(dialog.querySelector("img")!.alt).toBe(trigger.alt);
  expect(document.activeElement).toBe(dialog.querySelector("button"));
  dialog.close();
  expect(document.activeElement).toBe(trigger);
  Object.defineProperty(trigger, "clientWidth", { value: 729 });
  window.dispatchEvent(new Event("resize"));
  expect(trigger.hasAttribute("role")).toBe(false);
  trigger.click();
  expect(dialog.showModal).toHaveBeenCalledOnce();
  destroy();
  expect(trigger.hasAttribute("tabindex")).toBe(false);
  trigger.click();
  expect(dialog.showModal).toHaveBeenCalledOnce();
});
