import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from "rollup-plugin-copy";

module.exports = {
  input: "index.js",
  output: {
    dir: "dist",
  },
  treeshake: false,
  plugins: [
    nodeResolve(),
    copy({
      targets: [{ src: ["index.html", "sketch.html", "sketch.js", "p5.play.js", "p5.serialport.js", "player.js", "blob.js", "style.css", "images"], dest: "dist" }],
    }),
  ],
};