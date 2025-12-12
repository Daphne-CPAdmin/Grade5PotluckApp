// Use relative URLs so it works both locally and on Render
const API_BASE = '/api';

let allStudents = [];
let selectedStudent = '';

// Load students into dropdown
async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        const data = await response.json();
        
        allStudents = data.students;
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('Error loading student names', 'error');
    }
}

// Autocomplete functionality
const studentInput = document.getElementById('student');
const dropdown = document.getElementById('studentDropdown');
const categorySelect = document.getElementById('category');
const foodInput = document.getElementById('foodName');
const submitBtn = document.querySelector('.submit-btn');
let activeIndex = -1;

// Check if student already has entry and pre-fill form
async function checkExistingEntry(studentName) {
    try {
        const response = await fetch(`${API_BASE}/entries`);
        const data = await response.json();
        
        const existing = data.entries.find(e => e.student === studentName);
        
        if (existing) {
            // Pre-fill form with existing data
            categorySelect.value = existing.category;
            foodInput.value = existing.food_name;
            submitBtn.textContent = 'Update Entry';
            submitBtn.style.background = 'linear-gradient(135deg, #1a472a 0%, #2d5016 100%)';
            
            // Show update message
            showMessage(`Updating entry for ${studentName}`, 'info');
        } else {
            // Reset for new entry
            categorySelect.value = '';
            foodInput.value = '';
            submitBtn.textContent = 'Submit Entry';
            submitBtn.style.background = 'linear-gradient(135deg, #c41e3a 0%, #8b1538 100%)';
        }
    } catch (error) {
        console.error('Error checking existing entry:', error);
    }
}

studentInput.addEventListener('input', (e) => {
    const searchText = e.target.value.toLowerCase();
    
    if (searchText.length === 0) {
        dropdown.classList.remove('show');
        return;
    }
    
    // Filter students
    const filtered = allStudents.filter(student => 
        student.toLowerCase().includes(searchText)
    );
    
    // Display results
    if (filtered.length > 0) {
        dropdown.innerHTML = filtered.map(student => {
            // Highlight matching text
            const regex = new RegExp(`(${searchText})`, 'gi');
            const highlighted = student.replace(regex, '<mark>$1</mark>');
            return `<div class="autocomplete-item" data-value="${student}">${highlighted}</div>`;
        }).join('');
        dropdown.classList.add('show');
    } else {
        dropdown.innerHTML = '<div class="no-results">No students found</div>';
        dropdown.classList.add('show');
    }
    
    activeIndex = -1;
});

// Handle dropdown clicks
dropdown.addEventListener('click', (e) => {
    if (e.target.classList.contains('autocomplete-item')) {
        const value = e.target.getAttribute('data-value');
        studentInput.value = value;
        selectedStudent = value;
        dropdown.classList.remove('show');
        
        // Check if student has existing entry
        checkExistingEntry(value);
    }
});

// Keyboard navigation
studentInput.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
        updateActiveItem(items);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        items[activeIndex].click();
    } else if (e.key === 'Escape') {
        dropdown.classList.remove('show');
    }
});

function updateActiveItem(items) {
    items.forEach((item, index) => {
        if (index === activeIndex) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!studentInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Load and display entries
async function loadEntries() {
    try {
        const response = await fetch(`${API_BASE}/entries`);
        const data = await response.json();
        
        const container = document.getElementById('entriesContainer');
        
        if (data.entries.length === 0) {
            container.innerHTML = '<div class="no-entries">No entries yet. Be the first to add your viand!</div>';
            return;
        }
        
        // Group entries by category
        const grouped = {};
        data.entries.forEach(entry => {
            if (!grouped[entry.category]) {
                grouped[entry.category] = [];
            }
            grouped[entry.category].push(entry);
        });
        
        // Count food items across all categories
        const foodCounts = {};
        data.entries.forEach(entry => {
            const foodKey = entry.food_name.toLowerCase();
            if (!foodCounts[foodKey]) {
                foodCounts[foodKey] = {
                    name: entry.food_name,
                    count: 0,
                    students: []
                };
            }
            foodCounts[foodKey].count++;
            foodCounts[foodKey].students.push(entry.student);
        });
        
        // Display categories as cards with entries as line items inside
        container.innerHTML = '';
        
        // Order of categories
        const categoryOrder = ['Main Dish', 'Rice', 'Appetizer', 'Dessert', 'Drinks', 'Fruits'];
        
        // Create grid for category cards
        const categoryCardsGrid = document.createElement('div');
        categoryCardsGrid.className = 'category-cards-grid';
        
        categoryOrder.forEach(category => {
            if (grouped[category] && grouped[category].length > 0) {
                // Create category card
                const categoryCard = document.createElement('div');
                categoryCard.className = 'category-card';
                
                // Category header
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-card-header';
                categoryHeader.textContent = `${category} (${grouped[category].length})`;
                categoryCard.appendChild(categoryHeader);
                
                // Entries list inside category card
                const entriesList = document.createElement('div');
                entriesList.className = 'category-entries-list';
                
                grouped[category].forEach(entry => {
                    const entryLine = document.createElement('div');
                    entryLine.className = 'entry-line-item';
                    
                    const foodKey = entry.food_name.toLowerCase();
                    const count = foodCounts[foodKey].count;
                    const countBadge = count > 1 ? ` <span class="count-badge">x${count}</span>` : '';
                    
                    entryLine.innerHTML = `
                        <span class="entry-student">${entry.student}</span>
                        <span class="entry-food">${entry.food_name}${countBadge}</span>
                    `;
                    entriesList.appendChild(entryLine);
                });
                
                categoryCard.appendChild(entriesList);
                categoryCardsGrid.appendChild(categoryCard);
            }
        });
        
        // Add any categories not in the predefined order
        Object.keys(grouped).forEach(category => {
            if (!categoryOrder.includes(category)) {
                // Create category card
                const categoryCard = document.createElement('div');
                categoryCard.className = 'category-card';
                
                // Category header
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-card-header';
                categoryHeader.textContent = `${category} (${grouped[category].length})`;
                categoryCard.appendChild(categoryHeader);
                
                // Entries list inside category card
                const entriesList = document.createElement('div');
                entriesList.className = 'category-entries-list';
                
                grouped[category].forEach(entry => {
                    const entryLine = document.createElement('div');
                    entryLine.className = 'entry-line-item';
                    
                    const foodKey = entry.food_name.toLowerCase();
                    const count = foodCounts[foodKey].count;
                    const countBadge = count > 1 ? ` <span class="count-badge">x${count}</span>` : '';
                    
                    entryLine.innerHTML = `
                        <span class="entry-student">${entry.student}</span>
                        <span class="entry-food">${entry.food_name}${countBadge}</span>
                    `;
                    entriesList.appendChild(entryLine);
                });
                
                categoryCard.appendChild(entriesList);
                categoryCardsGrid.appendChild(categoryCard);
            }
        });
        
        container.appendChild(categoryCardsGrid);
    } catch (error) {
        console.error('Error loading entries:', error);
        const container = document.getElementById('entriesContainer');
        container.innerHTML = '<div class="loading">Error loading entries</div>';
    }
}

// Show message to user
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Handle form submission
document.getElementById('foodForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        student: document.getElementById('student').value,
        category: document.getElementById('category').value,
        food_name: document.getElementById('foodName').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Entry submitted successfully! 🎉', 'success');
            
            // Clear form
            document.getElementById('category').value = '';
            document.getElementById('foodName').value = '';
            
            // Reload entries to show the new one
            await loadEntries();
        } else {
            showMessage(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Error submitting entry:', error);
        showMessage('Error submitting entry. Please try again.', 'error');
    }
});

// Auto-refresh entries every 10 seconds
setInterval(loadEntries, 10000);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    loadEntries();
});

