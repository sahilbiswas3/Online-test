// DOM Elements
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const loginFormContainer = document.getElementById('login-form');
const registerFormContainer = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

// Sample data (in a real app, this would be stored in a database)
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showDashboard();
    }
});

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.classList.add('hidden');
    registerFormContainer.classList.remove('hidden');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    } else {
        alert('Invalid email or password');
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showDashboard();
});

// Dashboard Functions
function showDashboard() {
    document.body.innerHTML = `
        <div class="container">
            <header>
                <h1>Grocery Manager</h1>
                <button onclick="logout()" class="btn">Logout</button>
            </header>
            <div class="dashboard">
                <div class="card">
                    <h2>Inventory</h2>
                    <button onclick="showAddItemForm()" class="btn btn-primary">Add New Item</button>
                    <div id="inventory-list"></div>
                </div>
                <div class="card">
                    <h2>Expiring Soon</h2>
                    <div id="expiring-list"></div>
                </div>
                <div class="card">
                    <h2>Recipe Suggestions</h2>
                    <div id="recipe-list"></div>
                </div>
            </div>
        </div>
    `;
    updateInventory();
    updateExpiringItems();
    updateRecipeSuggestions();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

function showAddItemForm() {
    const form = `
        <div class="add-item-form">
            <h3>Add New Item</h3>
            <form onsubmit="addItem(event)">
                <div class="form-group">
                    <label>Item Name</label>
                    <input type="text" id="item-name" required>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="item-quantity" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <input type="text" id="item-category">
                </div>
                <div class="form-group">
                    <label>Expiry Date</label>
                    <input type="date" id="item-expiry" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Item</button>
            </form>
        </div>
    `;
    document.getElementById('inventory-list').insertAdjacentHTML('beforeend', form);
}

function addItem(e) {
    e.preventDefault();
    const item = {
        id: Date.now(),
        name: document.getElementById('item-name').value,
        quantity: document.getElementById('item-quantity').value,
        category: document.getElementById('item-category').value,
        expiryDate: document.getElementById('item-expiry').value,
        status: 'fresh'
    };
    inventory.push(item);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateInventory();
    updateExpiringItems();
    updateRecipeSuggestions();
}

function updateInventory() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';
    inventory.forEach(item => {
        const status = getItemStatus(item.expiryDate);
        const itemElement = `
            <div class="inventory-item">
                <h3>${item.name}</h3>
                <p>Quantity: ${item.quantity}</p>
                <p>Expiry: ${new Date(item.expiryDate).toLocaleDateString()}</p>
                <p class="status-${status}">Status: ${status}</p>
                <button onclick="removeItem(${item.id})" class="btn">Remove</button>
            </div>
        `;
        inventoryList.insertAdjacentHTML('beforeend', itemElement);
    });
}

function updateExpiringItems() {
    const expiringList = document.getElementById('expiring-list');
    expiringList.innerHTML = '';
    const expiringItems = inventory.filter(item => {
        const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
        return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    });
    
    if (expiringItems.length === 0) {
        expiringList.innerHTML = '<p>No items expiring soon</p>';
        return;
    }

    expiringItems.forEach(item => {
        const daysLeft = getDaysUntilExpiry(item.expiryDate);
        const itemElement = `
            <div class="inventory-item">
                <h3>${item.name}</h3>
                <p>Expires in ${daysLeft} days</p>
                <button onclick="markAsUsed(${item.id})" class="btn">Mark as Used</button>
                <button onclick="markAsSpoiled(${item.id})" class="btn">Mark as Spoiled</button>
            </div>
        `;
        expiringList.insertAdjacentHTML('beforeend', itemElement);
    });
}

function updateRecipeSuggestions() {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';
    // Sample recipes (in a real app, this would come from an API)
    const recipes = [
        {
            name: 'Vegetable Stir Fry',
            ingredients: ['carrots', 'broccoli', 'bell peppers', 'soy sauce']
        },
        {
            name: 'Fruit Salad',
            ingredients: ['apples', 'bananas', 'oranges', 'grapes']
        }
    ];

    recipes.forEach(recipe => {
        const availableIngredients = recipe.ingredients.filter(ingredient => 
            inventory.some(item => item.name.toLowerCase().includes(ingredient.toLowerCase()))
        );
        const recipeElement = `
            <div class="recipe-card">
                <h3>${recipe.name}</h3>
                <ul class="ingredients-list">
                    ${recipe.ingredients.map(ingredient => `
                        <li class="${availableIngredients.includes(ingredient) ? 'ingredient-available' : 'ingredient-missing'}">
                            ${ingredient}
                        </li>
                    `).join('')}
                </ul>
                <button onclick="makeRecipe('${recipe.name}')" class="btn">Make This</button>
            </div>
        `;
        recipeList.insertAdjacentHTML('beforeend', recipeElement);
    });
}

// Helper Functions
function getItemStatus(expiryDate) {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring';
    return 'fresh';
}

function getDaysUntilExpiry(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function removeItem(id) {
    inventory = inventory.filter(item => item.id !== id);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateInventory();
    updateExpiringItems();
    updateRecipeSuggestions();
}

function markAsUsed(id) {
    removeItem(id);
}

function markAsSpoiled(id) {
    removeItem(id);
}

function makeRecipe(recipeName) {
    // In a real app, this would update the inventory based on the recipe
    alert(`Making ${recipeName}!`);
} 