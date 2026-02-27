import { getIconURL, type IconName } from "@sumup-oss/icons";

import styles from "./CountryCell.module.css";

type Props = {
  country: string;
  countryCode: string;
};

const CountryCell = ({ country, countryCode }: Props) => {
  const url = getIconURL(`flag_${countryCode.toLowerCase()}` as IconName);

  return (
    <span className={styles.countryCell}>
      <span>{country}</span>
      <img src={url} alt="" className={styles.countryFlag} />
    </span>
  );
};

export default CountryCell;
