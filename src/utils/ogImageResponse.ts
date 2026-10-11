import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

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

export async function createOgImageResponse(
  element: ReactNode,
  options: OgImageResponseOptions,
) {
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
        : "public, max-age=3600, must-revalidate",
      ...options.headers,
    },
    status: options.status ?? 200,
    statusText: options.statusText,
  });
}
