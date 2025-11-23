import type { StorybookConfig } from "@storybook/react-native-web-vite";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",

    // stories à côté des composants
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-controls",
    "@storybook/addon-actions",
    "@storybook/addon-backgrounds",
  ],

  framework: {
    name: "@storybook/react-native-web-vite",
    options: {},
  },

  // important pour RN web
  core: {
    disableTelemetry: true,
  },
};

export default config;
