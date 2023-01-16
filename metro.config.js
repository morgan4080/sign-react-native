const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('db');

module.exports = defaultConfig;

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts }
    } = defaultConfig;
    return {
        transformer: {
            babelTransformerPath: require.resolve("react-native-svg-transformer"),
            assetPlugins: ['expo-asset/tools/hashAssetFiles']
        },
        resolver: {
            assetExts: assetExts.filter(ext => ext !== "svg"),
            sourceExts: [...sourceExts, "svg"]
        }
    };
})();
