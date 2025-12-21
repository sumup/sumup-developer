import { Select, type SelectProps } from "@sumup-oss/circuit-ui";
import { useEffect, useRef } from "react";

import styles from "./CodeLangSelector.module.css";

import {
  CODE_LANG_SELECTOR_ATTR,
  currentLanguage,
  setCurrentLanguage,
} from "@lib/code";

type Option = {
  label: string;
};

type Props = {
  options: Option[];
} & Pick<SelectProps, "className" | "style" | "slot">;

const CodeLangSelector = ({ options, slot, ...rest }: Props) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const lang = currentLanguage();

    if (!lang || !selectRef.current) {
      return;
    }

    const matchesOption = options.some(({ label }) => label === lang);
    if (matchesOption) {
      selectRef.current.value = lang;
    }
  }, [options]);

  const selectOptions = options.map(({ label }) => ({
    label,
    value: label,
  }));

  return (
    <div slot={slot}>
      <Select
        {...rest}
        ref={selectRef}
        label="Language"
        hideLabel
        defaultValue={options.at(0)?.label}
        options={selectOptions}
        onChange={(event) => setCurrentLanguage(event.target.value)}
        className={styles.selector}
        required
        {...{ [CODE_LANG_SELECTOR_ATTR]: "" }}
      />
    </div>
  );
};

export default CodeLangSelector;
