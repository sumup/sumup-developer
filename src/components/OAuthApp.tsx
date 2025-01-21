import OAuthAppContainer from "@components/OAuthAppContainer";
import { useStore } from "@nanostores/react";
import { ModalProvider, ToastProvider } from "@sumup-oss/circuit-ui";
import { $merchantCode } from "src/store/merchant";
import Loading from "./Loading";

export const OAuthApp = ({ id }: { id: string }) => {
  const merchantCode = useStore($merchantCode);

  if (!merchantCode) {
    return <Loading />;
  }

  return (
    <ModalProvider>
      <ToastProvider>
        <OAuthAppContainer id={id} merchantCode={merchantCode} />
      </ToastProvider>
    </ModalProvider>
  );
};
