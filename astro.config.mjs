// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://ChrisCarcamo1605.github.io',
  base: '/EstacionCafeFrontend',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  trailingSlash: 'always',
  devToolbar: {
    enabled: false
  }
});