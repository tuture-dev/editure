import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import css from "rollup-plugin-css-only";
import json from "rollup-plugin-json";

export default [
  {
    input: "packages/editure/src/index.js",
    output: {
      file: "packages/editure/dist/index.js",
      format: "esm",
      sourcemap: true
    },
    plugins: [resolve({ browser: true })],
    external: id => !id.startsWith(".") && !id.startsWith("/")
  },
  {
    input: "packages/editure-constants/src/index.js",
    output: {
      file: "packages/editure-constants/dist/index.js",
      format: "esm",
      sourcemap: true
    }
  },
  {
    input: "packages/editure-serializers/src/index.js",
    output: {
      file: "packages/editure-serializers/dist/index.js",
      format: "esm",
      sourcemap: true
    },
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs({
        exclude: ["src/**"],
        namedExports: {
          esrever: ["reverse"],
          "react-dom": ["findDOMNode"],
          "react-dom/server": ["renderToStaticMarkup"]
        }
      }),
      json()
    ]
  },
  {
    input: "packages/editure-react/src/index.js",
    output: {
      file: "packages/editure-react/dist/index.js",
      format: "esm",
      sourcemap: true
    },
    plugins: [
      css({ output: "packages/editure-react/dist/index.css" }),
      resolve({ browser: true }),
      commonjs({
        exclude: ["packages/editure-react/src/**"],
        namedExports: {
          esrever: ["reverse"],
          "react-dom": ["findDOMNode"],
          "react-dom/server": ["renderToStaticMarkup"]
        }
      }),
      json(),
      babel({
        include: ["packages/editure-react/src/**"],
        extensions: [".js"],
        presets: ["@babel/preset-react"],
        plugins: ["@babel/plugin-proposal-class-properties"]
      })
    ],
    external: id => !id.startsWith(".") && !id.startsWith("/")
  }
];
