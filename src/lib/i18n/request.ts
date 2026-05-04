import { getRequestConfig } from "next-intl/server";
import { getMessages, Locale } from "./messages";
export default getRequestConfig(async ({ locale }) => {
  // locale이 undefined일 때 사용할 기본 언어를 지정해야 합니다.
  const targetLocale = (locale as Locale) || "ja";

  return {
    locale: targetLocale,
    messages: getMessages(targetLocale),
  };
});
