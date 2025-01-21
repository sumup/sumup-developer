import useOAuthApp from "@hooks/useOAuthApp";
import { scopes as availableScopes } from "@lib/scopes";
import { composeValidators, required, validateHTTPUrl } from "@lib/validations";
import {
  Body,
  Button,
  ButtonGroup,
  type ClickEvent,
  Headline,
  ListItemGroup,
  NotificationInline,
  Spinner,
  useModal,
  useNotificationToast,
} from "@sumup-oss/circuit-ui";
import { Form } from "react-final-form";

import ClientCredentialsModal from "../ClientCredentialsModal";
import { CheckboxField, InputField } from "../Forms/Forms/Input";
import NewClientCredentialsModal from "../NewClientCredentialsModal";

import DeleteOAuthAppModal from "@components/DeleteOAuthAppModal";
import { useStore } from "@nanostores/react";
import { type OAuthAppRequestData, updateOAuthApp } from "src/api/oauth-apps";
import usePermissions from "src/domains/Permissions/usePermissions";
import { $testMode } from "src/store/extdev";
import { $merchant } from "src/store/merchant";
import type { ClientCredentials } from "src/types/oauth-apps";
import styles from "./styles.module.css";

interface OAuthAppForm {
  product_name: string;
  home_page: string;
  logo_url?: string;
  privacy_policy_url?: string;
  terms_and_conditions_url?: string;
  scopes: string[];
}

type OAuthAppsContainerProps = {
  id: string;
  merchantCode: string;
};

export default function OAuthAppsContainer({
  id,
  merchantCode,
}: OAuthAppsContainerProps) {
  const [permissions] = usePermissions(merchantCode, [
    "developer_settings_access",
    "developer_settings_edit",
  ]);
  const { setModal } = useModal();
  const { setToast } = useNotificationToast();
  const [oauthApp, loading, setOauthApp] = useOAuthApp(merchantCode, id);
  const testMode = useStore($testMode);
  const { data: merchant, loading: merchantLoading } = useStore($merchant);

  if (loading || merchantLoading || !merchant) {
    return (
      <div className={styles.spinnerContainer}>
        <Spinner />
      </div>
    );
  }

  if (!oauthApp) {
    window.location.href = "/apps";
    return null;
  }

  const setCreateClientCredentialsModal = () => {
    const onCreate = (secret: ClientCredentials) => {
      setOauthApp({
        ...oauthApp,
        client_credentials: [...(oauthApp.client_credentials ?? []), secret],
      });
      setToast({
        variant: "success",
        body: "Client credentials created.",
      });
    };
    setModal({
      // don't know why typescript can't infer the `onClose` prop here.
      children: ({ onClose }: { onClose: (event?: ClickEvent) => void }) => (
        <NewClientCredentialsModal
          onClose={onClose}
          onCreate={onCreate}
          clientId={oauthApp.id}
          merchantCode={merchantCode}
        />
      ),
      closeButtonLabel: "Close modal",
    });
  };

  const setDeleteModal = () => {
    setModal({
      // don't know why typescript can't infer the `onClose` prop here.
      children: ({ onClose }: { onClose: (event?: ClickEvent) => void }) => (
        <DeleteOAuthAppModal
          app={oauthApp}
          onClose={onClose}
          onDelete={() => {
            window.history.go(-1);
          }}
          merchantCode={merchantCode}
        />
      ),
      closeButtonLabel: "Close modal",
    });
  };

  const handleUpdateOAuthApp = async ({
    product_name,
    home_page,
    logo_url,
    privacy_policy_url,
    terms_and_conditions_url,
    scopes,
  }: OAuthAppForm) => {
    const req: OAuthAppRequestData = {
      product_name,
      home_page,
      scopes,
    };
    if (logo_url !== "") {
      req.logo_url = logo_url;
    }
    if (privacy_policy_url !== "") {
      req.privacy_url = privacy_policy_url;
    }
    if (terms_and_conditions_url !== "") {
      req.terms_and_conditions_url = terms_and_conditions_url;
    }

    await updateOAuthApp(merchantCode, oauthApp?.id, req);

    setOauthApp({
      id: oauthApp.id,
      product_name,
      home_page,
      logo_url,
      privacy_url: privacy_policy_url,
      terms_and_conditions_url,
      client_credentials: oauthApp.client_credentials,
      scopes,
    });
    setToast({
      variant: "success",
      body: "Your application has been updated.",
    });
  };

  if (!permissions.developer_settings_access) {
    return (
      <div>
        <Body>
          You don&apos;t have permissions to manage developer settings.
        </Body>
      </div>
    );
  }

  return (
    <div>
      {testMode && (
        <NotificationInline
          className={styles.testModeNotification}
          variant="info"
          body="Viewing test OAuth app. Test OAuth apps can be used only for testing purposes and with your own profile."
        />
      )}
      <Headline as="h1" size="l" className={styles.headline}>
        {oauthApp.product_name}
      </Headline>
      <Form
        onSubmit={handleUpdateOAuthApp}
        initialValues={{ ...oauthApp }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Headline as="h2" size="m">
              Application consent screen
            </Headline>
            <InputField
              label="Application name"
              type="text"
              name="product_name"
              validate={composeValidators(required)}
              required
            />
            <InputField
              type="url"
              name="home_page"
              label="Homepage URL"
              validate={composeValidators(required, validateHTTPUrl)}
              required
            />
            <InputField
              type="url"
              label="Logo URL"
              name="logo_url"
              optionalLabel="Optional"
              validate={composeValidators(validateHTTPUrl)}
            />
            <InputField
              type="url"
              label="Terms & conditions URL"
              name="terms_and_conditions_url"
              optionalLabel="Optional"
              validate={composeValidators(validateHTTPUrl)}
            />
            <InputField
              type="url"
              label="Privacy policy URL"
              name="privacy_policy_url"
              optionalLabel="Optional"
              validate={composeValidators(validateHTTPUrl)}
            />
            <Headline as="h2" size="m">
              Scopes
            </Headline>
            <div className={styles.scopes}>
              {Object.entries(availableScopes)
                .filter(([, { restricted }]) => !restricted)
                .map(([scope, { description }]) => (
                  <CheckboxField
                    name="scopes"
                    value={scope}
                    key={scope}
                    style={{ margin: 0 }}
                    label={`${scope} - ${description}`}
                  />
                ))}
            </div>
            <Headline as="h2" size="m">
              Restricted Scopes
            </Headline>
            {!testMode && (
              <Body>
                These scopes are restricted and require additional verification.
                Please <a href="/contact">contact our technical support team</a>{" "}
                if you wish to enable any of these scopes.
              </Body>
            )}
            {testMode && (
              <Body>
                For testing purposes, we allow enabling payment scopes to make
                it easier for you to get started with your integration. These
                scopes require additional verification when accepting real
                payments. To enable them on your production Merchant Account,
                you'll need to{" "}
                <a href="/contact">contact our technical support team</a> to
                activate these scopes.
              </Body>
            )}
            <div className={styles.scopes}>
              {Object.entries(availableScopes)
                .filter(([, { restricted }]) => restricted)
                .map(([scope, { description, restricted }]) => (
                  <CheckboxField
                    name="scopes"
                    value={scope}
                    key={scope}
                    disabled={
                      !testMode &&
                      restricted &&
                      !oauthApp.scopes.includes(scope)
                    }
                    style={{ margin: 0 }}
                    label={`${scope} - ${description}`}
                  />
                ))}
            </div>
            {permissions.developer_settings_edit && (
              <ButtonGroup
                align="right"
                actions={{
                  primary: {
                    type: "submit",
                    children: "Save",
                  },
                }}
              />
            )}
          </form>
        )}
      />
      <div className={styles.credentials}>
        <Headline as="h2" size="m">
          Client Secrets
        </Headline>
        {oauthApp.client_credentials &&
        oauthApp.client_credentials.length > 0 ? (
          <ListItemGroup
            label="Credentials"
            items={oauthApp.client_credentials.map((credential) => ({
              key: credential.id,
              // children: credential.name,
              label: credential.name,
              details: credential.client_id,
              variant: "action",
              onClick: () =>
                setModal({
                  // don't know why typescript can't infer the `onClose` prop here.
                  children: ({
                    onClose,
                  }: {
                    onClose: (event?: ClickEvent) => void;
                  }) => (
                    <ClientCredentialsModal
                      merchantCode={merchantCode}
                      onClose={onClose}
                      credential={credential}
                      onUpdate={() => {}}
                      onDelete={() =>
                        setOauthApp({
                          ...oauthApp,
                          client_credentials:
                            oauthApp.client_credentials?.filter(
                              ({ id: credentialId }) =>
                                credentialId !== credential.id,
                            ),
                        })
                      }
                    />
                  ),
                  closeButtonLabel: "Close modal",
                }),
            }))}
            hideLabel
          />
        ) : (
          <NotificationInline body="You don't have any credentials for your OAuth2 application yet." />
        )}
        {permissions.developer_settings_edit && (
          <ButtonGroup
            align="right"
            actions={{
              primary: {
                onClick: setCreateClientCredentialsModal,
                children: "Create client secret",
              },
            }}
          />
        )}
      </div>
      {permissions.developer_settings_edit && (
        <>
          <Headline as="h2" size="m" className={styles.headline}>
            Danger zone
          </Headline>
          <ListItemGroup
            items={[
              {
                key: "delete",
                label: "Delete this application",
                details: "This action cannot be undone. Please be certain.",
                trailingComponent: (
                  <Button onClick={setDeleteModal} destructive>
                    Delete
                  </Button>
                ),
              },
            ]}
            label="OAuth2 application dangerous actions"
            hideLabel
          />
        </>
      )}
    </div>
  );
}
