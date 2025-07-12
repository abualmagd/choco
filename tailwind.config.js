module.exports = {
  content: [
    "./views/**/*.{edge,html}", // Adjust the path to your Edge.js templates
    "./dist/js/**/*.js",
    "./public/**/*.js",
  ],
  darkMode: "media", // or 'class'
  theme: {
    extend: {
      fontFamily: {
        playfair: ["Playfair Display", "sans"],
        inter: ["Inter", "serif"],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
