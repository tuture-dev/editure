const { override, fixBabelImports, addBabelPlugin } = require("customize-cra");

module.exports = {
  webpack: override(
    addBabelPlugin([
      "prismjs",
      {
        languages: ["javascript", "css", "markup"],
        plugins: ["line-numbers"],
        theme: "twilight",
        css: true
      }
    ])
  )
};
