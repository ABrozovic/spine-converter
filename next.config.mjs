/** @type {import("next").NextConfig} */
const config = {
  output: "export",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  // compress: false,
  // webpack(webpackConfig) {
  //   return {
  //     ...webpackConfig,
  //     optimization: {
  //       minimize: false,
  //     },
  //   };
  // },
};

export default config;
