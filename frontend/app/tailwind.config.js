/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./app/app/**/*.{js,jsx,ts,tsx}", "./frontend/**/*.{js,jsx,ts,tsx}",],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: '#009FB7', // Bạn có thể định nghĩa màu cam thương hiệu ở đây (updated to new primary)
        primary: '#009FB7',
        secondary: '#B2EBF2',
        tertiary: '#3A75D3',
        neutral: '#4D7E91',
      }
    },
  },
  plugins: [],
}

