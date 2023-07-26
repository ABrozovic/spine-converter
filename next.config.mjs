/** @type {import("next").NextConfig} */
const config = {
  typescript: {    
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default config;
