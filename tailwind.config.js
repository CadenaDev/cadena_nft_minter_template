module.exports = {
  content: ["./src/**/*.{html,js, jsx, tx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require("daisyui")
  ]
}