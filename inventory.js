// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// Get inventory from localStorage
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

// DOM Elements
const inventoryList = document.getElementById('inventory-list');
const addItemModal = document.getElementById('add-item-modal');
const addItemForm = document.getElementById('add-item-form');
const searchInput = document.getElementById('search-inventory');
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');

// Event Listeners
addItemForm.addEventListener('submit', handleAddItem);
searchInput.addEventListener('input', filterItems);
categoryFilter.addEventListener('change', filterItems);
statusFilter.addEventListener('change', filterItems);

// Initialize
updateInventoryDisplay();

// Functions
function showAddItemModal() {
    addItemModal.style.display = 'flex';
}

function closeAddItemModal() {
    addItemModal.style.display = 'none';
    addItemForm.reset();
}

function handleAddItem(e) {
    e.preventDefault();
    
    const newItem = {
        id: Date.now(),
        name: document.getElementById('item-name').value,
        quantity: document.getElementById('item-quantity').value,
        category: document.getElementById('item-category').value,
        expiryDate: document.getElementById('item-expiry').value,
        status: getItemStatus(document.getElementById('item-expiry').value)
    };

    inventory.push(newItem);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    closeAddItemModal();
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    const filteredItems = filterItems();
    inventoryList.innerHTML = '';

    if (filteredItems.length === 0) {
        inventoryList.innerHTML = '<p class="no-items">No items found</p>';
        return;
    }

    filteredItems.forEach(item => {
        const itemElement = createItemElement(item);
        inventoryList.appendChild(itemElement);
    });
}

function createItemElement(item) {
    const div = document.createElement('div');
    div.className = `inventory-item status-${item.status}`;
    
    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
    const expiryText = daysUntilExpiry < 0 ? 'Expired' : 
                      daysUntilExpiry === 0 ? 'Expires today' :
                      `Expires in ${daysUntilExpiry} days`;

    div.innerHTML = `
        <div class="item-header">
            <h3>${item.name}</h3>
            <span class="category-badge">${item.category}</span>
        </div>
        <div class="item-details">
            <p>Quantity: ${item.quantity}</p>
            <p class="expiry-date">${expiryText}</p>
        </div>
        <div class="item-actions">
            <button onclick="editItem(${item.id})" class="btn btn-outline">Edit</button>
            <button onclick="removeItem(${item.id})" class="btn btn-outline">Remove</button>
        </div>
    `;

    return div;
}

function filterItems() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    const statusValue = statusFilter.value;

    return inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryValue || item.category === categoryValue;
        const matchesStatus = !statusValue || item.status === statusValue;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
}

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
    if (confirm('Are you sure you want to remove this item?')) {
        inventory = inventory.filter(item => item.id !== id);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        updateInventoryDisplay();
    }
}

function editItem(id) {
    const item = inventory.find(item => item.id === id);
    if (!item) return;

    document.getElementById('item-name').value = item.name;
    document.getElementById('item-quantity').value = item.quantity;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-expiry').value = item.expiryDate;

    // Change form submission handler for editing
    addItemForm.onsubmit = (e) => {
        e.preventDefault();
        
        item.name = document.getElementById('item-name').value;
        item.quantity = document.getElementById('item-quantity').value;
        item.category = document.getElementById('item-category').value;
        item.expiryDate = document.getElementById('item-expiry').value;
        item.status = getItemStatus(item.expiryDate);

        localStorage.setItem('inventory', JSON.stringify(inventory));
        closeAddItemModal();
        updateInventoryDisplay();

        // Reset form submission handler
        addItemForm.onsubmit = handleAddItem;
    };

    showAddItemModal();
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
} 