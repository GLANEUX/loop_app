// metro.config.js

// 1. Charger le .env dans process.env
// (fichier .env à la racine du projet)
require('dotenv').config();

const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const isStorybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

// Juste pour debug la première fois
console.log(
    '[metro] EXPO_PUBLIC_STORYBOOK_ENABLED =',
    process.env.EXPO_PUBLIC_STORYBOOK_ENABLED
);

module.exports = withStorybook(config, {
    enabled: isStorybookEnabled,
});
