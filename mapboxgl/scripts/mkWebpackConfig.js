const { assemble, pipe, depend } = require("webpack-pipe");

// 入口配置
const entry = (config) => depend.merge({
    entry:{
        app: ["./src"],
    }
}, config);


// 输出配置
const output = (config) => depend.merge({
    output:{
        publicPath: "/public/",
        path: depend.tool.resolveAppPath("public/build"),
    }
}, config);


const resolve = (config) => depend.merge({
    resolve: {
        "modules": [
            // "node_modules",
            "web_modules",
            "src"
        ]
    }
}, config);

// vtk.js编译需要用到
const shaderLoader = (config) => depend.merge({
    module: {
        rules: [
            {
                test: /\.glsl|vs|fs$/i,
                loader: 'shader-loader',
            },
        ]
    }
}, config);


const geoTiff = (config) => {
    const isProduction = (process.env.NODE_ENV === 'production');

    return depend.merge({
        module: {
            rules: [
                {
                    test: /\.worker\.js$/,
                    use: {
                        loader: 'worker-loader',
                        options: {
                            name: isProduction ? '[hash].decoder.worker.min.js' : '[hash].decoder.worker.js',
                            inline: true,
                            fallback: true,
                        },
                    },
                }
            ]
        },
        node: {
            fs: 'empty',
            buffer: 'empty',
            http: 'empty',
        },
    }, config)
}


const styledJsx = (config) => {
    config.module.rules = config.module.rules.map(rule => {
        if (rule.loader === "babel-loader"){
            // styled-jsx
            rule.options.plugins.push([
                "styled-jsx/babel",
                {
                    "vendorPrefixes": true,     // 为css自动添加前缀
                    "plugins": [
                        ["styled-jsx-plugin-sass",{sassOptions: {}}]
                    ]
                }
            ]);
            return rule;
        }

        return rule;
    });

    return config;
};


/**
 * 组装webpack config
 * @return {*}
 */
module.exports = (pipeNodes = []) => {
    const config = assemble([
        ...pipeNodes,
        geoTiff,
        styledJsx,
        pipe.base,
        pipe.staticResource,
        pipe.css,
        pipe.scss,
        shaderLoader,
        // pipe.babelAntd,
        pipe.babelReact,

        pipe.miniCssExtractPlugin,
        pipe.provideReactPlugin,
        pipe.webpackbarPlugin,

        resolve,
        output,
        entry,

    ]);

    return config;
};
