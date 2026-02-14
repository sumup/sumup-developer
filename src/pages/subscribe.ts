export const prerender = false;

import { validateEmail } from "@lib/validations";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  let email = data.get("email");

  const host = new URL(request.url);
  const redirectTo = new URL(data.get("redirect_to")?.toString() || "/", host);

  // prevent redirecting to elsewhere than the developer portal
  if (redirectTo.hostname !== host.hostname) {
    return redirect("/");
  }

  if (!email) {
    redirectTo.searchParams.append("status", "error");
    return redirect(redirectTo.pathname + redirectTo.search);
  }

  email = email.toString().toLowerCase();

  if (!validateEmail(email)) {
    redirectTo.searchParams.append("status", "invalid_email");
    return redirect(redirectTo.pathname + redirectTo.search);
  }

  try {
    if (!import.meta.env.MARKETING_CLOUD_AUTH) {
      redirectTo.searchParams.append("status", "success");
      return redirect(redirectTo.pathname + redirectTo.search);
    }

    const response = await fetch(
      import.meta.env.MARKETING_CLOUD_SUBSCRIBE_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: import.meta.env.MARKETING_CLOUD_AUTH,
        },
        body: JSON.stringify({
          email,
          locale: "en-GB",
        }),
      },
    );

    const status = await response.json();
    if (status !== 200) {
      throw new Error(`Unexpected response from marking cloud: ${status}`);
    }
  } catch (error) {
    console.error((error as Error).toString());
    redirectTo.searchParams.append("status", "error");
    return redirect(redirectTo.pathname + redirectTo.search);
  }

  redirectTo.searchParams.append("status", "success");
  return redirect(redirectTo.pathname + redirectTo.search);
};
