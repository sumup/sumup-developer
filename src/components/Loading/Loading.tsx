import { Spinner, utilClasses } from "@sumup-oss/circuit-ui";

import styles from "./styles.module.css";

export const Loading = () => {
  return (
    <div className={styles.wrapper}>
      <Spinner aria-hidden="true" />
      <span className={utilClasses.hideVisually}>Loading...</span>
    </div>
  );
};
