import type { APIRoute } from "astro";

export const prerender = false;

function contactUrl(request: Request, status: "success" | "error") {
  const url = new URL("/contact", request.url);
  url.searchParams.set("status", status);
  return url;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const body = await request.formData();
    const payload = {
      company: body.get("company"),
      tpv: body.get("tpv"),
      email: body.get("email"),
      country:
        body.get("country") === "Other"
          ? body.get("country-other")
          : body.get("country"),
      category: body.get("category"),
      onlineIntegration: body.get("onlineIntegration"),
      cardReaderIntegration: body.get("cardReaderIntegration"),
      detail: body.get("detail"),
      terms: Boolean(body.get("terms")),
      marketingconsent: Boolean(body.get("marketingconsent")),
    };

    if (!payload.email || !payload.category || !payload.country) {
      return redirect(contactUrl(request, "error").href, 303);
    }

    const response = await fetch(import.meta.env.MARKETING_CLOUD_CONTACT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: import.meta.env.MARKETING_CLOUD_AUTH,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Marketing Cloud returned ${response.status}.`);
    }

    return redirect(contactUrl(request, "success").href, 303);
  } catch (error) {
    console.error("[CONTACT] Submit contact form.", error);
    return redirect(contactUrl(request, "error").href, 303);
  }
};
