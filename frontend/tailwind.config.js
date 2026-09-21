/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F7F5F0", // Warm white
          alt: "#ECE9E2",     // Pale stone/gray for alternate bands
          light: "#FFFFFF",   // Crisp white for card interiors
        },
        charcoal: {
          DEFAULT: "#171717", // Rich dark charcoal
          muted: "#525252",   // Secondary editorial text
          subtle: "#737373",  // Caption / metadata text
        },
        coral: {
          DEFAULT: "#E84C32", // Primary action vermilion/coral
          hover: "#D03C24",
          light: "#FDF2F0",   // Coral tint
        },
        olive: {
          DEFAULT: "#66724B", // Verified / environmental stamp
          dark: "#4D5737",
          light: "#F0F2EB",   // Olive tint
        },
        mustard: {
          DEFAULT: "#E5B83B", // Accent gold/mustard
          dark: "#B88E1C",
          light: "#FDF9EE",
        },
        rule: {
          DEFAULT: "#D9DCE1", // Hairline grid border
          dark: "#171717",    // Solid heavy editorial rule
        },
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
      },
      boxShadow: {
        editorial: "0 2px 4px rgba(23, 23, 23, 0.04), 0 8px 16px rgba(23, 23, 23, 0.06)",
        lift: "0 6px 16px rgba(23, 23, 23, 0.08)",
        stamp: "0 0 0 2px #66724B",
      },
    },
  },
  plugins: [],
};
