'use client';

import dynamic from 'next/dynamic';

const CodePlayground = dynamic(() => import('./CodePlayground'), {
  ssr: false
});

export default function ClientCodePlayground() {
  // Initial content values
  const initialHtmlStructure = `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style id="CSS">
      /* Your CSS is inserted here */
    </style>
  </head>
  <body id="HTML">
    <!-- Your HTML is inserted here -->
    <script id="Javascript">
      // Your Javascript is inserted here
    </script>
  </body>
</html>`;
  const initialHtmlCode = '<div>Hello!</div>';
  const initialCssCode = 'h1 {\n  color: blue;\n}';
  const initialJsCode = '// Your JavaScript code here';

  return (
    <CodePlayground 
      initialHtmlStructure={initialHtmlStructure}
      initialHtmlCode={initialHtmlCode}
      initialCssCode={initialCssCode}
      initialJsCode={initialJsCode}
    />
  );
}