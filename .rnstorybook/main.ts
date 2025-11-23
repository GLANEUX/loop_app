import type { StorybookConfig } from "@storybook/react-native";

const config: StorybookConfig = {
  stories: [
    // stories “globales”
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",

    // stories collées aux composants
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-docs"],
};

export default config;
