import { useStore } from "@nanostores/react";
import { ModalProvider, ToastProvider } from "@sumup-oss/circuit-ui";
import { $merchantCode } from "src/store/merchant";
import Applications from "./Applications";
import Loading from "./Loading";

const OAuthApps = () => {
  const merchantCode = useStore($merchantCode);

  if (!merchantCode) {
    return <Loading />;
  }

  return (
    <ModalProvider>
      <ToastProvider>
        <Applications merchantCode={merchantCode} />
      </ToastProvider>
    </ModalProvider>
  );
};

export default OAuthApps;
