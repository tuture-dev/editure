import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import css from "rollup-plugin-css-only";
import json from "rollup-plugin-json";

export default {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: true
  },
  plugins: [
    css({ output: "dist/index.css" }),
    resolve({ browser: true }),
    commonjs({
      exclude: ["src/**"],
      namedExports: {
        esrever: ["reverse"],
        "react-dom": ["findDOMNode"],
        "react-dom/server": ["renderToStaticMarkup"]
      }
    }),
    json(),
    babel({
      include: ["src/**"],
      extensions: [".js"],
      presets: ["@babel/preset-react"],
      plugins: ["@babel/plugin-proposal-class-properties"]
    })
  ],
  external: id => !id.startsWith(".") && !id.startsWith("/")
};
