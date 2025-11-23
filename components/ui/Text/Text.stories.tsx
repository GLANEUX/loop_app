import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";

import { ThemedText } from "./themed-text";

const meta: Meta<typeof ThemedText> = {
  title: "Typography/ThemedText",
  component: ThemedText,
  args: {
    children: "Lorem ipsum dolor sit amet",
  },
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          padding: 24,
          justifyContent: "center",
          backgroundColor: "#010C13", // bg-black de ton thème
        }}
      >
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "default",
  },
};

export const Title: Story = {
  args: {
    type: "title",
    children: "Bienvenue ! 👋",
  },
};

export const Subtitle: Story = {
  args: {
    type: "subtitle",
    children: "Prêt·e à créer la magie ?",
  },
};

export const Body: Story = {
  args: {
    type: "body",
    children: "Texte de paragraphe standard pour le corps du contenu.",
  },
};

export const BodyBold: Story = {
  args: {
    type: "bodyBold",
    children: "Texte important mis en avant.",
  },
};

export const Caption: Story = {
  args: {
    type: "caption",
    children: "Petit texte d’aide ou de légende.",
  },
};

export const Label: Story = {
  args: {
    type: "label",
    children: "Label de champ ou petite étiquette.",
  },
};

/**
 * Story "gallery" pour voir tous les styles d'un coup
 */
export const Variants: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <ThemedText type="title">Title · Bienvenue ! 👋</ThemedText>
      <ThemedText type="subtitle">
        Subtitle · Prêt·e à créer la magie ?
      </ThemedText>
      <ThemedText type="body">Body · Texte standard.</ThemedText>
      <ThemedText type="bodyBold">BodyBold · Texte important.</ThemedText>
      <ThemedText type="label">Label · Label de champ.</ThemedText>
      <ThemedText type="caption">Caption · Petit texte d’aide.</ThemedText>
      <ThemedText type="small">Small · Très petit texte.</ThemedText>
    </View>
  ),
};
