module.exports = {
  content: [
    "./views/**/*.{edge,html}", // Adjust the path to your Edge.js templates
    "./dist/js/**/*.js",
    "./public/**/*.js",
  ],
  darkMode: "media", // or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
