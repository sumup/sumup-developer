import Tagger from "@elbwalker/tagger";
import type { IElbwalker, WebDestination } from "@elbwalker/walker.js";
import Elbwalker, { elb } from "@elbwalker/walker.js";

type DestinationConfig = never;
type DestinationEventConfig = never;

const WALKER_PREFIX = "data-elb";

export const tagger = Tagger({
  prefix: WALKER_PREFIX,
});

export const destinationDataLayer: WebDestination.Function<
  DestinationConfig,
  DestinationEventConfig
> = {
  config: {},

  init() {
    window.dataLayer = window.dataLayer || [];
    return true;
  },

  push(event) {
    const commonProperties = mapCommonEventProperties(event);

    const googleAnalyticsEvent = {
      ...commonProperties,
      ...event.data,
    };

    window.dataLayer.push(googleAnalyticsEvent);
  },
};

function mapCommonEventProperties(event: IElbwalker.Event) {
  return {
    ...event.globals,
    event: event.event.replace(" ", "_").toLowerCase(),
    event_timestamp_msec: event.timestamp,
    walker: true,
  };
}

export function initAnalytics({
  userId,
  merchantCode,
  merchantCategoryCode,
  merchantCountryCode,
}: {
  userId: string;
  merchantCode: string;
  merchantCategoryCode: string;
  merchantCountryCode: string;
}) {
  if (!window.elbwalker) {
    window.elbwalker = Elbwalker({
      globals: {
        app: "developer_portal",
        user_agent: navigator.userAgent,
        merchant_code: merchantCode,
        merchant_category_code: merchantCategoryCode,
        merchant_country_code: merchantCountryCode,
      },
      user: {
        id: userId,
      },
      prefix: WALKER_PREFIX,
    });
  }

  elb("walker destination", destinationDataLayer);
}

export function isWalkerTrackedElement(
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
) {
  return event.currentTarget
    .getAttributeNames()
    .some((attr) => attr.startsWith(WALKER_PREFIX));
}
