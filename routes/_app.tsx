import { type PageProps } from "$fresh/server.ts";
import ThemeProvider from "../islands/ThemeProvider.tsx";
import ToastContainer from "../islands/Toast.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fuzzy Column Matcher - AI-Powered Excel Matching</title>
        <meta name="description" content="Advanced fuzzy matching for Excel and CSV columns with AI-powered algorithms. Match data intelligently with configurable thresholds and comprehensive analytics." />
        <meta name="keywords" content="excel matching, csv matching, fuzzy matching, data matching, column matching, ai powered" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script>
          {`
          // Prevent flash of unstyled content for dark mode
          (function() {
            const theme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (theme === 'dark' || (!theme && prefersDark)) {
              document.documentElement.classList.add('dark');
            }
          })();
          `}
        </script>
      </head>
      <body className="font-inter antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <Component />
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}