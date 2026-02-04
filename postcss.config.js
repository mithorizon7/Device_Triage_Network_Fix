import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

const sourceFallbackPlugin = {
  postcssPlugin: "vite-source-from-fallback",
  Once(root) {
    const rootSource = root.source;
    const rootFile = rootSource?.input?.file;
    if (!rootFile) return;

    root.walkDecls((decl) => {
      if (!decl.source || !decl.source.input?.file) {
        decl.source = rootSource;
      }
    });
  },
};

export default {
  plugins: [tailwindcss(), sourceFallbackPlugin, autoprefixer()],
};
