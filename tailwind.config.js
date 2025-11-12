/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./node_modules/@material-tailwind/react/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#ec136d",
                "background-light": "#f8f6f7",
                "background-dark": "#221018",
                "theme-pink": "#FF75A8",
                "theme-green": "#A2D94B",
                "theme-dark-gray": "#333333",
                "theme-muted-gray": "#6c757d",
            },
            fontFamily: {
                display: ["Plus Jakarta Sans", "Noto Sans", "sans-serif"],
            },
            borderRadius: {
                lg: "0.5rem",
                xl: "0.75rem",
            },
        },
    },
    plugins: [],
};
