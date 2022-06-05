module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        '42': '10.5rem',
        '48%': '48vh',
        '32%': '32vh',
        '10%': '10%'
      },
      scale: {
        '102': '1.02',
      },
      colors: {
        'score': '#E56005',
        'top': '#19071C',
        'floor': '#7E3046'
      },
      screens: {
        'laptop': '915px',
        'mobile': {
          'max': '400px',
        },
        'vm': {
          'min': '400px',
        }
      },
      fontSize: {
        'xt': '0.5rem'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}