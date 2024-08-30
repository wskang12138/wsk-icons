import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.js'),
      name: 'SvgToolkit',
      fileName: (format) => `wsksvg.${format}.js`,
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: [
        'fs',
        'path',
        'sharp',
        'svgo',
        'fast-glob',
        'commander',
        '@svgr/core',
        '@svgr/plugin-jsx',
        '@svgr/plugin-prettier',
        'url'  // Add 'url' to external list
      ],
      output: {
        globals: {
          fs: 'fs',
          path: 'path',
          sharp: 'sharp',
          svgo: 'svgo',
          'fast-glob': 'fg',
          commander: 'commander',
          '@svgr/core': 'svgrCore',
          '@svgr/plugin-jsx': 'svgrPluginJsx',
          '@svgr/plugin-prettier': 'svgrPluginPrettier',
          url: 'url'  // Add 'url' to globals
        },
      },
    },
  },
});
