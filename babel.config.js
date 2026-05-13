module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',                  // NativeWind v4 CSS-in-JS transform
      'react-native-reanimated/plugin',    // MUST be last
    ],
  };
};
