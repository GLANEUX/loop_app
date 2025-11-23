// components/ui/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Loop/Button",
  component: Button,
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "center",
          backgroundColor: "#FEF5EB",
        }}
      >
        <Story />
      </View>
    ),
  ],
  args: {
    label: "Bouton",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    disabled: true,
  },
};
