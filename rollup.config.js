import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import css from 'rollup-plugin-css-only';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: 'packages/editure-constants/src/index.ts',
    output: [
      {
        file: 'packages/editure-constants/dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'packages/editure-constants/dist/index.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({
        tsconfig: 'packages/editure-constants/tsconfig.json'
      })
    ]
  },
  {
    input: 'packages/editure/src/index.ts',
    output: [
      {
        file: 'packages/editure/dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'packages/editure/dist/index.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({ browser: true }),
      json(),
      typescript({
        tsconfig: 'packages/editure/tsconfig.json'
      })
    ],
    external: id => !id.startsWith('.') && !id.startsWith('/')
  },
  {
    input: 'packages/editure-react/src/index.js',
    output: [
      {
        file: 'packages/editure-react/dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'packages/editure-react/dist/index.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: true
      }
    ],
    plugins: [
      css({ output: 'packages/editure-react/dist/index.css' }),
      resolve({ browser: true }),
      commonjs({
        exclude: ['packages/editure-react/src/**'],
        namedExports: {
          esrever: ['reverse'],
          'react-dom': ['findDOMNode'],
          'react-dom/server': ['renderToStaticMarkup']
        }
      }),
      json(),
      babel({
        include: ['packages/editure-react/src/**'],
        extensions: ['.js'],
        presets: ['@babel/preset-react'],
        plugins: ['@babel/plugin-proposal-class-properties']
      })
    ],
    external: id => !id.startsWith('.') && !id.startsWith('/')
  }
];
