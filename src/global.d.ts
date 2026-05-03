import type { Locale, Messages } from "@/lib/i18n/messages";

declare module "use-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
