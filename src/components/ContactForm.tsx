import {
  Anchor,
  Body,
  Button,
  ToastProvider,
  useNotificationToast,
} from "@sumup-oss/circuit-ui";
import type { FC, ReactNode } from "react";
import { Field, Form } from "react-final-form";

import {
  CheckboxField,
  InputField,
  SelectField,
  TextAreaField,
} from "@components/Forms/Forms/Input";

const countryOptions = [
  { value: "Austria", label: "Austria" },
  { value: "Australia", label: "Australia" },
  { value: "Belgium", label: "Belgium" },
  { value: "Brazil", label: "Brazil" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Chile", label: "Chile" },
  { value: "Cyprus", label: "Cyprus" },
  { value: "Czech Republic", label: "Czech Republic" },
  { value: "Denmark", label: "Denmark" },
  { value: "Estonia", label: "Estonia" },
  { value: "Finland", label: "Finland" },
  { value: "France", label: "France" },
  { value: "Germany", label: "Germany" },
  { value: "Hungary", label: "Hungary" },
  { value: "Ireland", label: "Ireland" },
  { value: "Italy", label: "Italy" },
  { value: "Latvia", label: "Latvia" },
  { value: "Lithuania", label: "Lithuania" },
  { value: "Luxembourg", label: "Luxembourg" },
  { value: "Malta", label: "Malta" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Norway", label: "Norway" },
  { value: "Poland", label: "Poland" },
  { value: "Romania", label: "Romania" },
  { value: "Slovakia", label: "Slovakia" },
  { value: "Slovenia", label: "Slovenia" },
  { value: "Spain", label: "Spain" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
  { value: "Other", label: "Other" },
];

const supportCategoryOptions = [
  {
    label: "Activation",
    value: "Activation",
  },
  {
    label: "Feature Request",
    value: "Feature Request",
  },
  {
    label: "Sales Enquiry",
    value: "Sales Enquiry",
  },
  {
    label: "Sandbox Merchant Account Request",
    value: "Sandbox Merchant Account Request",
  },
  {
    label: "Online Integration",
    value: "Online Integration",
  },
  {
    label: "Card Reader Integration",
    value: "Card Reader Integration",
  },
  {
    label: "Other",
    value: "Other",
  },
];

const onlineIntegrationOptions = [
  {
    label: "Alternative Payment Methods/Wallets",
    value: "Alternative Payment Methods/Wallets",
  },
  { label: "Direct Integration - APIs", value: "Direct Integration - APIs" },
  {
    label: "Direct Integration - Card Widget",
    value: "Direct Integration - Card Widget",
  },
  { label: "General Information", value: "General Information" },
  { label: "PHP SDK", value: "PHP SDK" },
  { label: "PrestaShop", value: "PrestaShop" },
  { label: "Wix", value: "Wix" },
  { label: "WooCommerce", value: "WooCommerce" },
];

const cardReaderIntegrationOptions = [
  { label: "App Switch", value: "App Switch" },
  { label: "General Information", value: "General Information" },
  { label: "SDK", value: "SDK" },
];

type ContactParams = {
  status?: "success" | "error";
};

const Contact: FC<ContactParams> = ({ status }) => {
  const { setToast } = useNotificationToast();
  if (status === "success") {
    setToast({
      variant: "success",
      body: "Thank you! We will get back to you soon.",
    });
  } else if (status === "error") {
    setToast({
      variant: "danger",
      body: "Submitting the form failed. Please try again later.",
    });
  }

  return (
    <Form
      onSubmit={() => {}}
      render={({ submitting }) => (
        <form action="/contact" method="post">
          <InputField name="email" type="email" label="Email" required />
          <SelectField
            name="country"
            label="Operating country"
            options={countryOptions}
            required
          />

          <Condition when="country" is="Other">
            <InputField
              name="country-other"
              label="Operating country (other)"
              required
            />
          </Condition>

          <SelectField
            name="category"
            label="Support category"
            options={supportCategoryOptions}
            required
          />

          <Condition when="category" is="Online Integration">
            <SelectField
              name="onlineIntegration"
              label="Please select which integration type you are using"
              options={onlineIntegrationOptions}
              required
            />
          </Condition>

          <Condition when="category" is="Card Reader Integration">
            <SelectField
              name="cardReaderIntegration"
              label="Please select which integration type you are using"
              options={cardReaderIntegrationOptions}
              required
            />
          </Condition>

          <Condition when="category" is="Sales Enquiry">
            <InputField name="company" label="Company name" required />

            <InputField
              name="tpv"
              label="What's your expected annual card transaction volume?"
              type="number"
              required
            />
          </Condition>

          <TextAreaField
            name="detail"
            label="Please share the details about your troubleshooting request and your current merchant account details."
            required
          />

          <div>
            <Body
              size="s"
              style={{
                textAlign: "center",
                marginBottom: "var(--cui-spacings-mega)",
              }}
            >
              <Anchor
                size="s"
                href="https://sumup.com/terms/"
                target="_blank"
                externalLabel="Opens in a new tab."
              >
                Terms and Conditions
              </Anchor>{" "}
              and{" "}
              <Anchor
                size="s"
                href="https://sumup.com/privacy/"
                target="_blank"
                externalLabel="Opens in a new tab."
              >
                Privacy Policy
              </Anchor>
            </Body>
            <CheckboxField
              name="terms"
              label="I agree to the processing and sharing of my personal data as
            required to use the SumUp Service and as outlined within the Terms and Conditions and Privacy Policy."
              required
            />
            <CheckboxField
              name="marketingconsent"
              label="I want to stay up to date with SumUp’s latest news and offers
            and agree to receive any related communication (optional)."
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            loadingLabel="Submitting"
          >
            Send
          </Button>
        </form>
      )}
    />
  );
};

export default function ContactForm(params: ContactParams) {
  return (
    <ToastProvider>
      <Contact {...params} />
    </ToastProvider>
  );
}

interface ConditionProps {
  when: string;
  is: unknown;
  children: ReactNode;
}

function Condition({ when, is, children }: ConditionProps) {
  return (
    <Field name={when} subscription={{ value: true }}>
      {({ input: { value } }) => (value === is ? children : null)}
    </Field>
  );
}
