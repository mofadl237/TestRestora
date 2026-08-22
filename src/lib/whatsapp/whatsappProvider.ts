/**
 * WhatsApp delivery abstraction (M14 — Document Center).
 *
 * The Document module never talks to a specific provider directly. It asks
 * `getWhatsAppProvider()` for the configured provider and calls `send()`.
 *
 *   • `WhatsAppLinkProvider`    — graceful web fallback. Opens `wa.me` with the
 *     prepared message. `ok: true` means "deep link ready", NEVER "delivered".
 *   • `MetaWhatsAppCloudProvider` — real delivery through the Meta Cloud API
 *     (Graph API `/<phone-number-id>/messages`). Only used when credentials
 *     are configured via env; returns a truthful result — it never fakes a
 *     successful send when the API is unavailable.
 *
 * This keeps the module production-ready for server-side WhatsApp delivery
 * without coupling the UI or server layer to a vendor.
 */

export type WhatsAppDeliveryMode = "link" | "api";

export interface WhatsAppSendResult {
  ok: boolean;
  mode: WhatsAppDeliveryMode;
  /** `wa.me` deep link when mode === "link" (or as a fallback for the API). */
  url?: string;
  /** Meta message id when a real API send succeeds. */
  externalId?: string;
  /** Machine-readable reason when the send was not ok. */
  reason?: string;
}

export interface WhatsAppMessage {
  /** E.164 recipient number, digits only (no leading `+`). */
  to: string;
  body: string;
}

export interface WhatsAppProvider {
  readonly id: string;
  buildLink(message: WhatsAppMessage): string;
  send(message: WhatsAppMessage): Promise<WhatsAppSendResult>;
}

/** Normalize a raw phone input to the E.164 digit form `wa.me` expects. */
export function normalizeWhatsAppPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

// ─── Web deep-link provider (graceful, no server delivery) ────────────────

export class WhatsAppLinkProvider implements WhatsAppProvider {
  readonly id = "wa-link";

  buildLink({ to, body }: WhatsAppMessage): string {
    const query = new URLSearchParams({ text: body });
    return `https://wa.me/${encodeURIComponent(to)}?${query.toString()}`;
  }

  async send(message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    return { ok: true, mode: "link", url: this.buildLink(message) };
  }
}

// ─── Meta WhatsApp Cloud API provider ──────────────────────────────────────

export interface MetaWhatsAppCloudConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
}

const DEFAULT_GRAPH_API_VERSION = "v22.0";

export class MetaWhatsAppCloudProvider implements WhatsAppProvider {
  readonly id = "meta-whatsapp-cloud";

  constructor(private readonly config: MetaWhatsAppCloudConfig) {}

  buildLink({ to, body }: WhatsAppMessage): string {
    const query = new URLSearchParams({ text: body });
    return `https://wa.me/${encodeURIComponent(to)}?${query.toString()}`;
  }

  async send({ to, body }: WhatsAppMessage): Promise<WhatsAppSendResult> {
    const fallbackUrl = this.buildLink({ to, body });

    if (!this.config.accessToken || !this.config.phoneNumberId) {
      return { ok: false, mode: "api", url: fallbackUrl, reason: "not-configured" };
    }

    const version = this.config.apiVersion ?? DEFAULT_GRAPH_API_VERSION;
    try {
      const response = await fetch(
        `https://graph.facebook.com/${version}/${this.config.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { preview_url: false, body },
          }),
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | { messages?: { id?: string }[]; error?: { message?: string; code?: number } }
        | null;

      if (!response.ok || payload?.error || !payload?.messages?.length) {
        return {
          ok: false,
          mode: "api",
          url: fallbackUrl,
          reason: payload?.error?.message ?? `http-${response.status}`,
        };
      }

      return {
        ok: true,
        mode: "api",
        url: fallbackUrl,
        externalId: payload.messages[0]?.id,
      };
    } catch (error) {
      return {
        ok: false,
        mode: "api",
        url: fallbackUrl,
        reason: error instanceof Error ? error.message : "network-error",
      };
    }
  }
}

// ─── Factory ───────────────────────────────────────────────────────────────

/** Pick the provider from config: the real API when configured, else the link fallback. */
export function createWhatsAppProvider(
  config?: MetaWhatsAppCloudConfig,
): WhatsAppProvider {
  if (config?.accessToken && config?.phoneNumberId) {
    return new MetaWhatsAppCloudProvider(config);
  }
  return new WhatsAppLinkProvider();
}

/** Provider resolved from the environment — the single entry point for modules. */
export function getWhatsAppProvider(): WhatsAppProvider {
  return createWhatsAppProvider({
    phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID ?? "",
    accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN ?? "",
  });
}
