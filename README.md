# ClickPen - Interactive CSS Learning Platform

ClickPen is an interactive web-based platform for learning CSS through live examples and real-time code editing. Inspired by CodePen but focused on educational content, ClickPen lets you efficiently click and swipe through different CSS examples while experimenting with the code in real-time. The name "ClickPen" represents the seamless experience of clicking through examples while having a powerful code editor (pen) at your disposal.

## Features

- **Live Code Editor**: Write and preview HTML, CSS, and JavaScript in real-time
- **Split-screen Interface**: Side-by-side code editor and preview pane
- **Interactive Examples**: Learn by modifying working code examples
- **Comprehensive CSS Coverage**: Full CSS property reference implementation
- **Efficient Navigation**: Quick click-through system for browsing examples
- **Instant Preview**: See your changes as you type

## Example/Slide Format

Each example in ClickPen follows a specific JSON format:

```json
{
  "exampleN": {
    "explanation": "### Title\n\nMarkdown-formatted explanation with:\n\n* Bullet points\n* Code snippets using `backticks`\n* Detailed property descriptions",
    "html": "<!-- HTML code for the example -->",
    "css": "/* CSS code for the example */",
    "javascript": "// Optional JavaScript code"
  }
}
```

Required fields for each example:
- `explanation`: Markdown-formatted text explaining the concept
- `html`: HTML code demonstrating the concept
- `css`: CSS code showing the implementation
- `javascript`: Optional JavaScript code (can be empty string)

## Roadmap Content Structure

The platform implements a comprehensive CSS learning path, organized by topics:
- Selectors
- Colors
- Typography
- Box Model
- Display Properties
- Positioning
- Flexbox
- Grid
- Animations
- And many more...

Each topic is broken down into specific properties and concepts, allowing for detailed exploration and practice.

## Getting Started

1. Clone the repository
```bash
git clone [repository-url]
cd clickpen
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Contributing

### Adding New Examples
To add a new example, follow the example format in the tutorial.json file:

1. Create a new entry with a unique example ID
2. Include all required fields (explanation, html, css)
3. Format the explanation using Markdown
4. Ensure code examples are properly formatted and functional

## License

This project is licensed under the MIT License - see the LICENSE file for details.