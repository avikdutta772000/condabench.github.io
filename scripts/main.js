// 
document.addEventListener('DOMContentLoaded', async function() {
    try {
        loadLeaderboardData();
    } catch (error) {
        console.error(error);
        showError('Failed to load benchmark and leaderboard data');
    }
});

// ===== LEADERBOARD FUNCTIONALITY =====

let allModelsData = [];
let currentFilter = 'all';
let currentSort = 'overall-desc';

// Load and parse YAML data for leaderboard
async function loadLeaderboardData() {
    try {
        const response = await fetch('leaderboard.yaml');
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);

        // Extract all models from both frameworks
        const allModels = [];

        // Iterate through frameworks
        data.Frameworks.forEach(frameworkData => {
            // Each framework has a name as key and array of models as value
            Object.keys(frameworkData).forEach(frameworkName => {
                const models = frameworkData[frameworkName];
                models.forEach(model => {
                    allModels.push({
                        model: model.Model,
                        framework: frameworkName,
                        overall: model.Overall.Score,
                        easy: model.Easy.Score,
                        hard: model.Hard.Score,
                        overallConvQ: model.Overall.ConvQ,
                        easyConvQ: model.Easy.ConvQ,
                        hardConvQ: model.Hard.ConvQ
                    });
                });
            });
        });

        console.log('Number of models loaded for leaderboard:', allModels.length);

        // Store the data globally
        allModelsData = allModels;
        
        // Add filter and sort controls
        addLeaderboardControls();
        
        // Add scrollable styling to show 10 rows at a time
        addScrollableTableStyling();
        
        // Apply initial sorting and filtering
        updateLeaderboard();
        
    } catch (error) {
        console.error('Error loading leaderboard data:', error);
    }
}

// Add filter and sort controls to the leaderboard
function addLeaderboardControls() {
    const leaderboardContainer = document.querySelector('.leaderboard-container');
    if (!leaderboardContainer) return;
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'leaderboard-controls';
    controlsContainer.innerHTML = `
        <div class="controls-left">
            <div class="control-group">
                <label for="framework-filter">Filter by Framework:</label>
                <select id="framework-filter" onchange="handleFilterChange(this.value)">
                    <option value="all">All Frameworks</option>
                </select>
            </div>
            <div class="control-group">
                <label for="sort-select">Sort by:</label>
                <select id="sort-select" onchange="handleSortChange(this.value)">
                    <option value="overall-desc">Overall Score (High to Low)</option>
                    <option value="name-asc">Model Name (A-Z)</option>
                    <option value="easy-desc">Easy Score (High to Low)</option>
                    <option value="hard-desc">Hard Score (High to Low)</option>
                    <option value="overall-convq-desc">Overall ConvQ (High to Low)</option>
                    <option value="easy-convq-desc">Easy ConvQ (High to Low)</option>
                    <option value="hard-convq-desc">Hard ConvQ (High to Low)</option>
                </select>
            </div>
        </div>
        <div class="control-group reset-group">
            <button id="reset-filters" onclick="resetFilters()" class="reset-button">
                <i class="fas fa-undo"></i> Reset
            </button>
        </div>
    `;
    
    // Insert controls before the table wrapper
    const tableWrapper = leaderboardContainer.querySelector('.leaderboard-table-wrapper');
    leaderboardContainer.insertBefore(controlsContainer, tableWrapper);
    
    // Populate framework filter options
    const frameworks = [...new Set(allModelsData.map(model => model.framework))].sort();
    const frameworkSelect = document.getElementById('framework-filter');
    frameworks.forEach(framework => {
        const option = document.createElement('option');
        option.value = framework;
        option.textContent = framework;
        frameworkSelect.appendChild(option);
    });
    
    // Add CSS for controls
    addControlsCSS();
}

// Add CSS for the controls
function addControlsCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .leaderboard-controls {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: var(--card-background);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .controls-left {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            min-width: 200px;
        }
        
        .control-group label {
            font-weight: 600;
            color: var(--text-primary);
            font-size: 0.9rem;
        }
        
        .control-group select {
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            background: var(--background);
            color: var(--text-primary);
            font-size: 0.9rem;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .control-group select:hover {
            border-color: var(--primary-color);
        }
        
        .control-group select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .reset-group {
            display: flex;
            align-items: flex-end;
        }
        
        .reset-button {
            padding: 0.75rem 1.5rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .reset-button:hover {
            background: var(--secondary-color);
            transform: translateY(-1px);
        }
        
        .reset-button:active {
            transform: translateY(0);
        }
        
        @media (max-width: 768px) {
            .leaderboard-controls {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }
            
            .controls-left {
                flex-direction: column;
                gap: 1rem;
            }
            
            .control-group {
                min-width: auto;
            }
            
            .reset-group {
                align-self: stretch;
            }
            
            .reset-button {
                width: 100%;
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(style);
}

// Handle filter changes
function handleFilterChange(framework) {
    currentFilter = framework;
    updateLeaderboard();
}

// Handle sort changes
function handleSortChange(sortOption) {
    currentSort = sortOption;
    updateLeaderboard();
}

// Reset filters and sort to default values
function resetFilters() {
    currentFilter = 'all';
    currentSort = 'overall-desc';
    
    // Reset the dropdown values
    document.getElementById('framework-filter').value = 'all';
    document.getElementById('sort-select').value = 'overall-desc';
    
    // Update the leaderboard
    updateLeaderboard();
}

// Update leaderboard with current filter and sort
function updateLeaderboard() {
    let filteredData = [...allModelsData];
    
    // Apply framework filter
    if (currentFilter !== 'all') {
        filteredData = filteredData.filter(model => model.framework === currentFilter);
    }
    
    // Apply sorting
    switch (currentSort) {
        case 'overall-desc':
            filteredData.sort((a, b) => b.overall - a.overall);
            break;
        case 'name-asc':
            filteredData.sort((a, b) => a.model.localeCompare(b.model));
            break;
        case 'easy-desc':
            filteredData.sort((a, b) => b.easy - a.easy);
            break;
        case 'hard-desc':
            filteredData.sort((a, b) => b.hard - a.hard);
            break;
        case 'overall-convq-desc':
            filteredData.sort((a, b) => b.overallConvQ - a.overallConvQ);
            break;
        case 'easy-convq-desc':
            filteredData.sort((a, b) => b.easyConvQ - a.easyConvQ);
            break;
        case 'hard-convq-desc':
            filteredData.sort((a, b) => b.hardConvQ - a.hardConvQ);
            break;
        default:
            filteredData.sort((a, b) => b.overall - a.overall);
    }
    
    populateLeaderboard(filteredData);
}

// Add minimal CSS for vertical scrolling - shows ~10 rows at a time
function addScrollableTableStyling() {
    const style = document.createElement('style');
    style.textContent = `
        .leaderboard-table-wrapper {
            max-height: 500px !important;
            overflow-y: auto !important;
        }
        
        .leaderboard-table thead {
            position: sticky !important;
            top: 0 !important;
            z-index: 10 !important;
        }
    `;
    document.head.appendChild(style);
}

// Populate the leaderboard table with sorted data
function populateLeaderboard(models) {
    const tbody = document.querySelector('#leaderboard-table tbody');
    if (!tbody) return;
    
    // Clear existing rows except header
    tbody.innerHTML = '';
    
    models.forEach((model, index) => {
        const row = document.createElement('tr');
        
        // Add rank-based classes for top 3
        if (index === 0) row.classList.add('rank-1');
        else if (index === 1) row.classList.add('rank-2');
        else if (index === 2) row.classList.add('rank-3');
        
        row.innerHTML = `
            <td class="framework-cell">${model.framework}</td>
            <td class="model-cell">${model.model}</td>
            <td class="score-cell">${model.overall.toFixed(2)}</td>
            <td class="convq-cell">${model.overallConvQ.toFixed(2)}</td>
            <td class="score-cell">${model.easy.toFixed(2)}</td>
            <td class="convq-cell">${model.easyConvQ.toFixed(2)}</td>
            <td class="score-cell">${model.hard.toFixed(2)}</td>
            <td class="convq-cell">${model.hardConvQ.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}