import {
  Anchor,
  Body,
  ButtonGroup,
  Flag,
  ToastProvider,
  useNotificationToast,
  type FlagProps,
  type SelectOption,
} from "@sumup-oss/circuit-ui";
import type { FC, ReactNode } from "react";
import { Field, Form } from "react-final-form";
import { Send } from "@sumup-oss/icons";

import {
  CheckboxField,
  InputField,
  SelectField,
  TextAreaField,
} from "@components/Forms/Forms/Input";

type CountryOption = SelectOption & {
  countryCode?: FlagProps["countryCode"];
};

const countryOptions: CountryOption[] = [
  { value: "Austria", label: "Austria", countryCode: "AT" },
  { value: "Australia", label: "Australia", countryCode: "AU" },
  { value: "Belgium", label: "Belgium", countryCode: "BE" },
  { value: "Bulgaria", label: "Bulgaria", countryCode: "BG" },
  { value: "Chile", label: "Chile", countryCode: "CL" },
  { value: "Cyprus", label: "Cyprus", countryCode: "CY" },
  { value: "Czech Republic", label: "Czech Republic", countryCode: "CZ" },
  { value: "Denmark", label: "Denmark", countryCode: "DK" },
  { value: "Estonia", label: "Estonia", countryCode: "EE" },
  { value: "Finland", label: "Finland", countryCode: "FI" },
  { value: "France", label: "France", countryCode: "FR" },
  { value: "Germany", label: "Germany", countryCode: "DE" },
  { value: "Hungary", label: "Hungary", countryCode: "HU" },
  { value: "Ireland", label: "Ireland", countryCode: "IE" },
  { value: "Italy", label: "Italy", countryCode: "IT" },
  { value: "Latvia", label: "Latvia", countryCode: "LV" },
  { value: "Lithuania", label: "Lithuania", countryCode: "LT" },
  { value: "Luxembourg", label: "Luxembourg", countryCode: "LU" },
  { value: "Malta", label: "Malta", countryCode: "MT" },
  { value: "Netherlands", label: "Netherlands", countryCode: "NL" },
  { value: "Norway", label: "Norway", countryCode: "NO" },
  { value: "Poland", label: "Poland", countryCode: "PL" },
  { value: "Romania", label: "Romania", countryCode: "RO" },
  { value: "Slovakia", label: "Slovakia", countryCode: "SK" },
  { value: "Slovenia", label: "Slovenia", countryCode: "SI" },
  { value: "Spain", label: "Spain", countryCode: "ES" },
  { value: "Switzerland", label: "Switzerland", countryCode: "CH" },
  { value: "United Kingdom", label: "United Kingdom", countryCode: "GB" },
  { value: "United States", label: "United States", countryCode: "US" },
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
  { label: "PrestaShop", value: "PrestaShop" },
  { label: "Wix", value: "Wix" },
  { label: "WooCommerce", value: "WooCommerce" },
  { label: "SDK", value: "SDK" },
];

const cardReaderIntegrationOptions = [
  { label: "App Switch", value: "App Switch" },
  { label: "General Information", value: "General Information" },
  { label: "SDK", value: "SDK" },
];

function CountryFlagPrefix({
  value,
  className,
}: {
  value?: string | number;
  className?: string;
}) {
  if (typeof value !== "string") {
    return null;
  }

  const countryCode = countryOptions.find(
    (option) => option.value === value,
  )?.countryCode;
  if (!countryCode) {
    return null;
  }

  return (
    <Flag
      className={className}
      countryCode={countryCode}
      alt={`${value} flag`}
    />
  );
}

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
            renderPrefix={CountryFlagPrefix}
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

          <ButtonGroup
            align="right"
            actions={{
              primary: {
                children: "Send",
                type: "submit",
                isLoading: submitting,
                loadingLabel: "Submitting",
                icon: Send,
              },
            }}
          />
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
