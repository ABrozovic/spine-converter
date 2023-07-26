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
  webpack(webpackConfig) {
    return {
      ...webpackConfig,
      optimization: {
        minimize: false,
      },
    };
  },
};

export default config;
