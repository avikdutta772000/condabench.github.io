// Load and process benchmark data
let benchmarkData = [];

// Load benchmark data when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Determine the correct path based on current location
        const isInPages = window.location.pathname.includes('/pages/');
        const benchmarkPath = isInPages ? '../benchmark.json' : 'benchmark.json';
        
        // Fetch the benchmark data
        const response = await fetch(benchmarkPath);
        benchmarkData = await response.json();
        
        // Initialize the app
        initializeApp();
    } catch (error) {
        console.error('Error loading benchmark data:', error);
        showError('Failed to load benchmark data. Please check if benchmark.json exists.');
    }
});

function initializeApp() {
    // Render all benchmarks initially
    renderBenchmarks(benchmarkData);
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        searchBenchmarksBy(searchTerm);
    });
    
    // Modal functionality
    setupModal();
}

function filterBenchmarksBy(type) {
    // Show all benchmarks since we're not filtering by type anymore
    renderBenchmarksWithSearch(benchmarkData);
}

function searchBenchmarksBy(searchTerm) {
    const activeFilter = document.querySelector('.filter-btn.active').dataset.type;
    let filteredData = benchmarkData;
    
    // Apply search filter only
    if (searchTerm) {
        filteredData = filteredData.filter(benchmark => 
            benchmark.query.toLowerCase().includes(searchTerm) ||
            benchmark.answer.toLowerCase().includes(searchTerm) ||
            benchmark.index.toLowerCase().includes(searchTerm)
        );
    }
    
    renderBenchmarksWithSearch(filteredData);
}

function renderBenchmarksWithSearch(data) {
    renderBenchmarks(data);
}

function renderBenchmarks(data) {
    const grid = document.getElementById('benchmark-grid');
    
    if (data.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No benchmarks found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = data.map(benchmark => createBenchmarkCard(benchmark)).join('');
}

function createBenchmarkCard(benchmark) {
    const datasetPreview = getDatasetPreview(benchmark.data_file);
    
    return `
        <div class="benchmark-card" onclick="openModal('${benchmark.index}')">
            <div class="card-header">
                <div>
                    <div class="card-title">${truncateText(benchmark.query, 80)}</div>
                </div>
            </div>
            
            <div class="card-query">
                ${truncateText(benchmark.query, 120)}
            </div>
            
            <div class="card-answer">
                <strong>Answer:</strong> ${truncateText(benchmark.answer, 150)}
            </div>
            
            <div class="card-dataset">
                <strong>Dataset:</strong> ${datasetPreview}
            </div>
            
            <div class="card-actions">
                <button class="btn-view">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
            </div>
        </div>
    `;
}

function getDatasetPreview(dataFiles) {
    if (!dataFiles || dataFiles.length === 0) {
        return 'No dataset specified';
    }
    
    const fileName = dataFiles[0].split('/').pop();
    return dataFiles.length === 1 ? fileName : `${fileName} (+${dataFiles.length - 1} more)`;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function setupModal() {
    const modal = document.getElementById('modal');
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

function openModal(benchmarkIndex) {
    const benchmark = benchmarkData.find(b => b.index === benchmarkIndex);
    if (!benchmark) return;
    
    const modal = document.getElementById('modal');
    
    // Populate modal content
    document.getElementById('modal-title').textContent = benchmark.index.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    document.getElementById('modal-query').textContent = benchmark.query;
    document.getElementById('modal-answer').textContent = benchmark.answer;
    document.getElementById('modal-program').textContent = benchmark.program;
    document.getElementById('modal-output').textContent = benchmark.program_output || 'No output available';
    
    // Dataset information
    const datasetHtml = benchmark.data_file.map(file => 
        `<div class="dataset-link" onclick="loadDatasetPreview('${file}')">${file}</div>`
    ).join('');
    document.getElementById('modal-dataset').innerHTML = datasetHtml;
    
    // Plot section
    const plotSection = document.getElementById('modal-plot-section');
    if (benchmark.program_plot) {
        plotSection.style.display = 'block';
        document.getElementById('modal-plot').innerHTML = `
            <img src="${benchmark.program_plot}" alt="Generated Plot" style="max-width: 100%; height: auto; border-radius: 8px;">
        `;
    } else {
        plotSection.style.display = 'none';
    }
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Also close dataset preview if it's open
    closeDatasetPreview();
}

function showError(message) {
    const grid = document.getElementById('benchmark-grid');
    grid.innerHTML = `
        <div class="error-message" style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            background: var(--card-background);
            border-radius: var(--border-radius);
            border: 2px dashed var(--border-color);
            color: var(--text-muted);
        ">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--warning-color); margin-bottom: 1rem;"></i>
            <h3>Error Loading Data</h3>
            <p>${message}</p>
        </div>
    `;
}

// Utility functions for enhanced UX
function highlightSearchTerms(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation
function showLoading() {
    const grid = document.getElementById('benchmark-grid');
    grid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

// Debounce search for better performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to search
const debouncedSearch = debounce((searchTerm) => {
    searchBenchmarksBy(searchTerm);
}, 300);

// Update the search input listener to use debounced search
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Replace the original search listener with debounced version
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            debouncedSearch(searchTerm);
        });
    }
});

// Add analytics/tracking (placeholder for future implementation)
function trackInteraction(action, details) {
    // This could be connected to analytics services
    console.log('User interaction:', { action, details, timestamp: new Date().toISOString() });
}

// Track modal opens
function openModalWithTracking(benchmarkIndex) {
    trackInteraction('modal_open', { benchmark: benchmarkIndex });
    openModal(benchmarkIndex);
}

// Export functions for testing or external use
window.BenchmarkApp = {
    filterBenchmarksBy,
    searchBenchmarksBy,
    openModal,
    closeModal,
    renderBenchmarks
};

// Dataset preview functionality
async function loadDatasetPreview(datasetPath) {
    try {
        // Adjust path based on current location
        const isInPages = window.location.pathname.includes('/pages/');
        const adjustedPath = isInPages ? '../' + datasetPath : datasetPath;
        
        // Show loading state
        const previewContainer = document.getElementById('dataset-preview-container');
        const modalBody = document.querySelector('.modal-body');
        const modalContent = document.querySelector('.modal-content');
        
        // Smoothly expand modal width first
        modalContent.style.transition = 'all 0.3s ease';
        modalContent.style.maxWidth = '95%';
        modalContent.style.width = '95%';
        
        // Switch to side-by-side layout with animation
        modalBody.classList.add('side-by-side');
        previewContainer.style.display = 'block';
        previewContainer.innerHTML = `
            <div class="dataset-preview-header">
                <h3><i class="fas fa-table"></i> Dataset Preview</h3>
                <button class="close-preview" onclick="closeDatasetPreview()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="dataset-preview-content">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading dataset preview...</p>
                </div>
            </div>
        `;
        
        // Animate the preview container sliding in
        setTimeout(() => {
            previewContainer.classList.add('preview-expanded');
        }, 50);
        
        // Fetch the dataset
        const response = await fetch(adjustedPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const previewHtml = parseCSVPreview(csvText, datasetPath);
        
        // Update the preview container
        document.querySelector('.dataset-preview-content').innerHTML = previewHtml;
        
    } catch (error) {
        console.error('Error loading dataset:', error);
        document.querySelector('.dataset-preview-content').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load dataset preview</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

function parseCSVPreview(csvText, datasetPath) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    const maxRows = 10; // Show first 10 rows + header
    const previewLines = lines.slice(0, maxRows + 1);
    
    if (previewLines.length === 0) {
        return '<p>Dataset appears to be empty</p>';
    }
    
    const headers = previewLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = previewLines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );
    
    const fileName = datasetPath.split('/').pop();
    const totalRows = lines.length - 1; // Subtract header row
    
    let html = `
        <div class="dataset-info">
            <h4>${fileName}</h4>
            <p><strong>Total Rows:</strong> ${totalRows.toLocaleString()}</p>
            <p><strong>Columns:</strong> ${headers.length}</p>
            <p><strong>Showing:</strong> First ${Math.min(maxRows, rows.length)} rows</p>
        </div>
        <div class="table-container">
            <table class="dataset-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    rows.forEach(row => {
        html += '<tr>';
        headers.forEach((_, index) => {
            const cellValue = row[index] || '';
            const truncatedValue = cellValue.length > 50 ? 
                cellValue.substring(0, 50) + '...' : cellValue;
            html += `<td title="${cellValue}">${truncatedValue}</td>`;
        });
        html += '</tr>';
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

function closeDatasetPreview() {
    const previewContainer = document.getElementById('dataset-preview-container');
    const modalBody = document.querySelector('.modal-body');
    const modalContent = document.querySelector('.modal-content');
    
    // Remove expanded class for smooth animation
    previewContainer.classList.remove('preview-expanded');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        previewContainer.style.display = 'none';
        modalBody.classList.remove('side-by-side');
        
        // Reset modal width smoothly
        modalContent.style.maxWidth = '1000px';
        modalContent.style.width = '90%';
    }, 300);
}