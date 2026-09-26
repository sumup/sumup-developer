import {
  Button as CircuitButton,
  I18nProvider,
  type ButtonProps,
} from "@sumup-oss/circuit-ui";

// Astro renders each React component as a separate root, so buttons used in
// Astro templates need their own Circuit UI internationalization context.
type Props = Omit<ButtonProps, "children"> & { label: string };

export default function Button({ label, ...props }: Props) {
  return (
    <I18nProvider locale="en-US">
      <CircuitButton {...props}>{label}</CircuitButton>
    </I18nProvider>
  );
}
