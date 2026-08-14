import {
  Hamburger as CircuitHamburger,
  I18nProvider,
  type HamburgerProps,
} from "@sumup-oss/circuit-ui";

// Keep the provider in the same React root as the hydrated Astro component.
export default function Hamburger(props: HamburgerProps) {
  return (
    <I18nProvider locale="en-US">
      <CircuitHamburger {...props} />
    </I18nProvider>
  );
}
