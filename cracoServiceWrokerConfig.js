const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const path = require("path");

module.exports = {
    overrideWebpackConfig: ({ webpackConfig, cracoConfig, pluginOptions, context: { env, paths } }) => {
        const isEnvProduction = env === "production";
        const isEnvDevelopment = env === "development";

        const swPlugin = new WorkboxWebpackPlugin.InjectManifest({
            swSrc: path.resolve(__dirname, "src/service-worker.js"),
            dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
            exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
            maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        });

        if (isEnvProduction) {
            // Remove existing InjectManifest from CRA to avoid duplicate/conflicting instances
            const filteredPlugins = webpackConfig.plugins.filter(
                (plugin) => !(plugin instanceof WorkboxWebpackPlugin.InjectManifest || (plugin.constructor && plugin.constructor.name === "InjectManifest"))
            );
            return {
                ...webpackConfig,
                plugins: [...filteredPlugins, swPlugin],
            };
        } else if (isEnvDevelopment) {
            return {
                ...webpackConfig,
                plugins: [...webpackConfig.plugins, swPlugin],
            };
        }

        return webpackConfig;
    },
};
