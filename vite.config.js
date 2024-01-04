
/*
this is a workaround for allowing vite to recognize .js files from other libraries as .jsx 
https://stackoverflow.com/questions/68170439/configuring-esbuild-with-react-replacing-create-react-app
this was needed because react-big-calendar/lib/TimeGrid was not getting compiled properly
*/
import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Workaround
    {
      name: 'load+transform-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) {
          return null;
        }

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic', // 👈 this is important
        });
      },
    },
    // End workaround

  ],

  // Workaround before renaming .js to .jsx
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  // End workaround

})

/*
//original def

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})

*/
