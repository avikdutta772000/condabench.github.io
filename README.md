# Data Science Benchmark Dashboard

A modern, interactive web dashboard for visualizing and exploring data science benchmarks. This website provides an elegant interface to browse through machine learning and data analysis benchmark results.

## Features

- **Interactive Filtering**: Filter benchmarks by type (Q&A, Open-ended, Projection)
- **Real-time Search**: Search through queries, answers, and benchmark names
- **Detailed Modal Views**: Click any benchmark card to see full details including:
  - Complete query and answer
  - Dataset information and preview
  - Python program code
  - Program output
  - Generated visualizations (when available)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

## Getting Started

1. **Clone or download** the files to your local machine
2. **Place your `benchmark.json`** file in the same directory as the HTML files
3. **Open `index.html`** in a web browser or serve it with a local web server

### For GitHub Pages Deployment

1. Create a new repository on GitHub
2. Upload all files including `benchmark.json` to the repository
3. Go to repository Settings → Pages
4. Select "Deploy from a branch" and choose `main` branch
5. Your site will be available at `https://yourusername.github.io/repositoryname`

## File Structure

```
workshop/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── benchmark.json      # Your benchmark data
└── README.md          # This file
```

## Benchmark Data Format

The website expects a JSON file with the following structure:

```json
[
  {
    "index": "benchmark-identifier",
    "query": "What question was asked?",
    "answer": "The answer to the question",
    "type": "qa|open-ended|projection",
    "data_file": ["path/to/dataset.csv"],
    "program": "Python code here",
    "program_output": "Output from the program",
    "program_plot": "path/to/plot/image.png" // optional
  }
]
```

## Customization

### Colors and Styling
- Edit CSS variables in `styles.css` to change the color scheme
- Modify the gradient backgrounds by updating the `--primary-color` and `--secondary-color` variables

### Adding New Features
- The JavaScript is modular and well-documented
- Add new filters by modifying the `filterBenchmarksBy` function
- Extend the modal with additional information by updating the `openModal` function

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icons
- **Google Fonts** - Typography (Inter font family)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Performance Features

- Debounced search for smooth user experience
- Efficient DOM updates
- Responsive images and optimized loading
- CSS animations with GPU acceleration

## Contributing

Feel free to fork this project and submit pull requests for improvements. Some ideas for enhancements:

- Add export functionality for benchmark results
- Implement data visualization charts
- Add bookmark/favorite functionality
- Include benchmark comparison features

## License

This project is open source and available under the MIT License.