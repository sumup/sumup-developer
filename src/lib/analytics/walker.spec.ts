import Elbwalker, { elb } from "@elbwalker/walker.js";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { destinationDataLayer, initAnalytics } from "./walker";

vi.mock("@elbwalker/walker.js", () => ({
  default: vi.fn(),
  elb: vi.fn(),
  __esModule: true,
}));

describe("Walker.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window.navigator, "userAgent", {
      value: "jest-dom",
    });
  });

  describe("destinationDataLayer", () => {
    describe("init", () => {
      it("should initialize window.dataLayer", () => {
        expect(window.dataLayer).toBeUndefined();

        if (destinationDataLayer?.init) {
          destinationDataLayer.init({});
        }

        expect(window.dataLayer).toBeInstanceOf(Array);
      });

      it("should return true", () => {
        const actual = destinationDataLayer?.init?.({});

        expect(actual).toBeTruthy();
      });
    });

    describe("push", () => {
      beforeEach(() => {
        window.dataLayer = [];
      });

      const event = {
        event: "page view",
        data: {
          page_pathname: "/home",
        },
        globals: {
          html_language: "locale",
        },
        context: {},
        user: {},
        nested: [],
        consent: {},
        id: "id",
        trigger: "trigger",
        entity: "entity",
        action: "action",
        timestamp: 123456789,
        timing: 12345,
        group: "group",
        count: 123,
        version: {
          walker: 1,
          config: 2,
        },
        source: {
          type: 1,
          id: "id",
          previous_id: "previous_id",
        },
      };
      const config = {};

      it("should push the transformed event to window.dataLayer", () => {
        destinationDataLayer.push(event, config);

        const googleAnalyticsEvent = {
          event: "page_view",
          event_timestamp_msec: 123456789,
          html_language: "locale",
          page_pathname: "/home",
          walker: true,
        };

        expect(window.dataLayer).toEqual([googleAnalyticsEvent]);
      });
    });
  });

  describe("initAnalytics", () => {
    const config = {
      userId: "1234-abcd",
      merchantCode: "MEXL2CZL",
      merchantCategoryCode: "5812",
      merchantCountryCode: "DE",
    };

    it("should initialize window.elbwalker", () => {
      expect(window.elbwalker).toBeUndefined();

      initAnalytics(config);

      expect(Elbwalker).toEqual(expect.any(Function));
    });

    it("should set the globals", () => {
      initAnalytics(config);

      expect(Elbwalker).toHaveBeenCalledWith({
        globals: {
          app: "developer_portal",
          merchant_code: "MEXL2CZL",
          merchant_category_code: "5812",
          merchant_country_code: "DE",
          user_agent: "jest-dom",
        },
        user: {
          id: "1234-abcd",
        },
        prefix: "data-elb",
      });
    });

    it("should configure the destination", () => {
      initAnalytics(config);

      expect(elb).toHaveBeenCalledWith(
        "walker destination",
        destinationDataLayer,
      );
    });
  });
});
