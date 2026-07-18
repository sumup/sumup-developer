import { Resvg, initWasm } from "@resvg/resvg-wasm";
import satori from "satori";

import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";

import type { ReactNode } from "react";
import type { Font, SatoriOptions } from "satori";

type OgImageResponseOptions = {
  width: number;
  height: number;
  debug?: boolean;
  fonts: Font[];
  headers?: HeadersInit;
  status?: number;
  statusText?: string;
};

let resvgInitPromise: Promise<void> | undefined;
let resvgInitialized = false;

async function ensureResvg() {
  if (resvgInitialized) {
    return;
  }

  resvgInitPromise ??= initWasm(resvgWasm).then(
    () => {
      resvgInitialized = true;
    },
    (error: unknown) => {
      resvgInitPromise = undefined;
      throw error;
    },
  );

  await resvgInitPromise;
}

export async function createOgImageResponse(
  element: ReactNode,
  options: OgImageResponseOptions,
) {
  await ensureResvg();

  const svg = await satori(element, {
    width: options.width,
    height: options.height,
    debug: options.debug,
    fonts: options.fonts,
  } satisfies SatoriOptions);
  const png = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: options.width,
    },
  })
    .render()
    .asPng();
  const body = png.buffer.slice(
    png.byteOffset,
    png.byteOffset + png.byteLength,
  ) as ArrayBuffer;

  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": options.debug
        ? "no-cache, no-store"
        : "public, immutable, no-transform, max-age=31536000",
      ...options.headers,
    },
    status: options.status ?? 200,
    statusText: options.statusText,
  });
}
