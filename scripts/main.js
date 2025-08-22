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

        // Sort by overall score in descending order
        allModels.sort((a, b) => b.overall - a.overall);
        
        // Add scrollable styling to show 10 rows at a time
        addScrollableTableStyling();
        
        // Populate the leaderboard table
        populateLeaderboard(allModels);
        
    } catch (error) {
        console.error('Error loading leaderboard data:', error);
    }
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