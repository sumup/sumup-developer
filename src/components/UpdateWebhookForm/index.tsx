import {
  Body,
  Button,
  ButtonGroup,
  ModalProvider,
  NotificationInline,
  Spinner,
  ToastProvider,
  useModal,
  useNotificationToast,
} from "@sumup-oss/circuit-ui";
import { Fragment } from "react";
import { Form } from "react-final-form";

import {
  CheckboxGroupField,
  InputField,
  TextAreaField,
} from "@components/Forms/Forms/Input";
import arrayMutators from "@components/Forms/Forms/array-mutators";
import { useUpdateWebhook } from "@hooks/useUpdateWebhook";
import { useWebhook } from "@hooks/useWebhook";
import { useWebhookEvents } from "@hooks/useWebhookEvents";
import {
  composeValidators,
  minArrayLength,
  required,
  validateHTTPUrl,
} from "@lib/validations";

import type { UpdateWebhookPayload, Webhook } from "../../types/webhooks";
import styles from "./styles.module.css";

const SUPER_WEBHOOK_SECRET = "********************";

export const UpdateWebhookForm = ({ webhookId }: { webhookId: string }) => {
  const { error, isLoading, webhook } = useWebhook(webhookId);
  const {
    events,
    isLoading: isLoadingEvents,
    error: loadEventsError,
  } = useWebhookEvents();
  const { updateWebhook, error: updateError } = useUpdateWebhook(webhookId);

  if (isLoading) {
    return <Spinner size="l" />;
  }

  if (error) {
    return <NotificationInline body={error} />;
  }

  if (!webhook) {
    return <Body color="danger">Webhook not found</Body>;
  }

  return (
    <Fragment>
      <Form
        mutators={{ ...arrayMutators }}
        onSubmit={async (data: UpdateWebhookPayload) => {
          await updateWebhook(data, {
            onSuccess: () => {
              window.location.href = "/webhooks";
            },
          });
        }}
        initialValues={{
          url: webhook.url,
          name: webhook.name,
          secret: SUPER_WEBHOOK_SECRET,
          description: webhook.description,
          events: webhook.events,
        }}
        render={({
          handleSubmit,
          hasValidationErrors,
          hasSubmitErrors,
          submitting,
        }) => (
          <form onSubmit={handleSubmit} className={styles.form}>
            {updateError && (
              <NotificationInline variant="danger" body={updateError} />
            )}

            <InputField
              name="name"
              label="Name"
              validate={composeValidators(required)}
              required={true}
            />
            <InputField
              name="url"
              label="Url"
              validate={composeValidators(required, validateHTTPUrl)}
              required={true}
            />
            <TextAreaField
              name="description"
              label="Description"
              required={true}
              validate={composeValidators(required)}
            />
            <InputField name="secret" readOnly={true} label="Secret" />

            {isLoadingEvents ? (
              <Spinner size="s" />
            ) : loadEventsError ? (
              <Body color="danger">{loadEventsError}</Body>
            ) : (
              <CheckboxGroupField
                name="events"
                label="Events"
                options={events.map((e) => ({ label: e, value: e }))}
                required={true}
                validate={composeValidators(required, minArrayLength(1))}
              />
            )}

            <div className={styles.actionsContainer}>
              <ModalProvider>
                <ToastProvider>
                  <UpdateWebhookStatus webhook={webhook} />
                </ToastProvider>
              </ModalProvider>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  window.location.href = "/webhooks";
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={hasValidationErrors || hasSubmitErrors}
                isLoading={submitting}
                loadingLabel="Updating"
              >
                Update
              </Button>
            </div>
          </form>
        )}
      />
    </Fragment>
  );
};

const UpdateWebhookStatus = ({ webhook }: { webhook: Webhook }) => {
  const { setModal, removeModal } = useModal();
  const { setToast } = useNotificationToast();
  const { updateWebhook, isLoading } = useUpdateWebhook(webhook.id);
  const { active, name } = webhook;

  const toggleStatus = async () => {
    const payload = {
      name,
      active: !active,
      description: webhook.description,
      events: webhook.events,
      url: webhook.url,
    };

    await updateWebhook(payload, {
      onSuccess: () => {
        setToast({ body: "Webhook updated successfully", variant: "success" });
        removeModal();
        window.location.reload();
      },
      onError: (error) => {
        setToast({ body: error.message, variant: "danger" });
      },
    });
  };

  const onUpdateStatus = () => {
    setModal({
      closeButtonLabel: "Cancel",
      children: (
        <div className={styles.statusModal}>
          <Body as="strong">{name}</Body>
          <Body>
            Are you sure you want to {active ? "deactivate" : "reactivate"} this
            webhook?
          </Body>
          <ButtonGroup
            style={{ marginTop: "var(--cui-spacings-mega" }}
            align="right"
            actions={{
              primary: {
                children: "Yes",
                onClick: toggleStatus,
                isLoading,
                loadingLabel: "Updating",
              },
              secondary: {
                children: "No",
                onClick: removeModal,
              },
            }}
          />
        </div>
      ),
    });
  };

  return (
    <Button
      type="button"
      onClick={onUpdateStatus}
      variant="secondary"
      destructive={active}
    >
      {active ? "Deactivate" : "Reactivate"}
    </Button>
  );
};
