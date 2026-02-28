// Login System
let currentLoginMode = 'user'; // 'user' or 'admin'
let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

// Server API configuration
const API_FILE = 'api%20(1).php'; // encoded space for fetch
function apiURL(endpoint) {
    return `${API_FILE}?endpoint=${endpoint}`;
}

async function apiGet(endpoint) {
    const res = await fetch(apiURL(endpoint));
    return res.json();
}

async function apiPost(endpoint, data) {
    const res = await fetch(apiURL(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

async function apiDelete(endpoint, data) {
    const res = await fetch(apiURL(endpoint), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

// Load all data from server
async function loadAllData() {
    try {
        const members = await apiGet('members');
        const vehicles = await apiGet('vehicles');
        const parkings = await apiGet('parking');
        const arena = await apiGet('parking-arena');
        
        // map server data to app format
        membersData = members.map(m => ({
            id: m.M_id,
            memberId: m.M_id,
            cnic: m.M_enic,
            name: m.M_name,
            fatherName: m.M_fname,
            contact: m.M_contactno,
            address: m.M_address
        }));
        
        vehiclesData = vehicles.map(v => ({
            id: v.V_id,
            vehicleId: v.V_id,
            memberId: v.M_id,
            regno: v.V_regno,
            engineNo: v.V_engno,
            name: v.V_name,
            model: v.V_model,
            color: v.V_color,
            chassisNo: v.V_chasesno
        }));
        
        parkingData = parkings.map(p => ({
            parkingId: p.PR_id || p.PR_id,
            id: p.PR_id,
            memberId: p.M_id,
            vehicleId: p.V_id,
            parkingSlot: p.P_id,
            checkin: p.PR_checkin,
            checkout: p.PR_checkout,
            status: p.PR_status
        }));
        
        parkingArenaData = arena.map(a => ({
            parkingSlotId: a.P_id,
            block: a.P_block,
            row: a.P_row,
            column: a.P_column,
            isOccupied: a.P_isOccupied == 1,
            occupiedSince: a.P_occupiedSince
        }));
        
        updateDashboard();
        displayMembers();
        displayVehicles();
        displayParkingStatus();
        loadMembersSelect();
        loadParkingSlots();
    } catch (err) {
        console.error('Error loading data from server', err);
    }
}

function switchLoginMode(mode) {
    currentLoginMode = mode;
    const userModeBtn = document.getElementById('userModeBtn');
    const adminModeBtn = document.getElementById('adminModeBtn');
    const loginTitle = document.getElementById('loginTitle');
    const emailInput = document.getElementById('email');
    const emailLabel = document.getElementById('emailLabel');
    
    if (mode === 'user') {
        userModeBtn.classList.add('active');
        adminModeBtn.classList.remove('active');
        loginTitle.textContent = 'User Login';
        emailLabel.textContent = 'Email:';
        emailInput.placeholder = 'user@parking.com';
    } else {
        adminModeBtn.classList.add('active');
        userModeBtn.classList.remove('active');
        loginTitle.textContent = 'Admin Login';
        emailLabel.textContent = 'Admin Email:';
        emailInput.placeholder = 'admin@parking.com';
    }
    
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

// Show/Hide Auth Forms
function showLoginForm(e) {
    if (e) e.preventDefault();
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
}

function showSignupForm(e) {
    if (e) e.preventDefault();
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
}

function showForgotPasswordForm(e) {
    if (e) e.preventDefault();
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.add('active');
}

function initializeLogin() {
    const loginFormElement = document.getElementById('loginFormElement');
    const signupFormElement = document.getElementById('signupFormElement');
    const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    
    // Check if admin is already logged in
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        showAdminDashboard();
    } else if (localStorage.getItem('isLoggedIn') === 'true') {
        // Check if user is already logged in
        showMainApp();
    }
    
    // Login form submission
    loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email && password) {
            if (currentLoginMode === 'admin') {
                // Admin login - any email/password works in demo
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('adminEmail', email);
                showAdminDashboard();
            } else {
                // User login - check if user exists
                const user = registeredUsers.find(u => u.email === email && u.password === password);
                
                if (user) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userName', user.username);
                    const now = new Date();
                    localStorage.setItem('userLoginTime', now.toLocaleString());
                    localStorage.setItem('userLastUpdated', now.toLocaleString());
                    showMainApp();
                    displayUserProfile();
                } else {
                    alert('Invalid email or password. Please check and try again.');
                }
            }
            
            loginFormElement.reset();
        }
    });
    
    // Signup form submission
    signupFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Check if email already exists
        if (registeredUsers.find(u => u.email === email)) {
            alert('Email already registered! Please use a different email or login.');
            return;
        }
        
        // Check if username already exists
        if (registeredUsers.find(u => u.username === username)) {
            alert('Username already taken! Please choose a different username.');
            return;
        }
        
        // Create new user with ID
        const userId = 'USER_' + Date.now();
        const newUser = {
            id: userId,
            email: email,
            username: username,
            password: password,
            createdAt: new Date().toLocaleString(),
            status: 'Active'
        };
        
        // Add to registered users
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Also add to admin users list for visibility
        let adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
        adminUsers.push({
            id: userId,
            name: username,
            email: email,
            type: 'Registered User',
            createdAt: new Date().toLocaleString(),
            status: 'Active'
        });
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        
        // Auto-login newly registered user
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', username);
        const now = new Date();
        localStorage.setItem('userLoginTime', now.toLocaleString());
        localStorage.setItem('userLastUpdated', now.toLocaleString());
        
        alert('Account created and logged in!');
        signupFormElement.reset();
        showMainApp();
        displayUserProfile();
    });
    
    // Forgot password form submission
    forgotPasswordFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const resetEmail = document.getElementById('resetEmail').value;
        
        const user = registeredUsers.find(u => u.email === resetEmail);
        
        if (user) {
            alert(`Password reset link has been sent to ${resetEmail}\n\nPassword Hint: Your password is "${user.password}"`);
            forgotPasswordFormElement.reset();
            showLoginForm();
        } else {
            alert('Email not found in our system. Please create an account first.');
        }
    });
    
    // Logout buttons
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
    
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            adminLogout();
        });
    }
}

function showMainApp() {
    document.getElementById('loginContainer').classList.remove('active');
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('adminContainer').style.display = 'none';
    displayUserProfile();
}

function showAdminDashboard() {
    document.getElementById('loginContainer').classList.remove('active');
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
    updateAdminDashboard();
    displayAdminUsers();
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    document.getElementById('loginContainer').classList.add('active');
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'none';
    document.getElementById('loginFormElement').reset();
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    switchLoginMode('user');
    showLoginForm();
}

function adminLogout() {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
    document.getElementById('loginContainer').classList.add('active');
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'none';
    document.getElementById('loginFormElement').reset();
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    switchLoginMode('user');
    showLoginForm();
}

// Admin Dashboard Functions
function updateAdminDashboard() {
    // Get registered users count
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
    const totalMembers = membersData.length + adminUsers.length;
    
    document.getElementById('adminTotalMembers').textContent = totalMembers;
    document.getElementById('adminTotalVehicles').textContent = vehiclesData.length;
    document.getElementById('adminActiveParkings').textContent = parkingData.filter(p => p.status === 'Active').length;
    
    const completedParkings = parkingData.filter(p => p.status === 'Completed');
    const totalRevenue = completedParkings.length * 100;
    document.getElementById('adminTotalRevenue').textContent = '₨' + totalRevenue;
    
    const occupiedCount = parkingArenaData.filter(s => s.isOccupied).length;
    const availableCount = parkingArenaData.filter(s => !s.isOccupied).length;
    
    document.getElementById('occupiedSlots').textContent = occupiedCount;
    document.getElementById('availableSlots').textContent = availableCount;
}

function displayAdminUsers() {
    const tbody = document.querySelector('#adminUsersTable tbody');
    tbody.innerHTML = '';
    
    // Get registered users (from signup)
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
    
    if (adminUsers.length === 0 && membersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No users found</td></tr>';
        return;
    }
    
    // Display registered users first
    adminUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>-</td>
            <td>0</td>
            <td><span class="status-active">${user.type}</span></td>
            <td>
                <button class="btn btn-danger" onclick="adminDeleteUser('${user.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Display members
    membersData.forEach(member => {
        const memberVehicles = vehiclesData.filter(v => v.memberId === member.id).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.contact}</td>
            <td>${member.cnic}</td>
            <td>${memberVehicles}</td>
            <td><span class="status-active">Member</span></td>
            <td>
                <button class="btn btn-danger" onclick="adminDeleteMember(${member.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function adminDeleteUser(userId) {
    if (confirm('Are you sure you want to delete this registered user?')) {
        let adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
        adminUsers = adminUsers.filter(u => u.id !== userId);
        
        // Also remove from registered users
        registeredUsers = registeredUsers.filter(u => u.id !== userId);
        
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        displayAdminUsers();
        updateAdminDashboard();
    }
}

function adminDeleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member? All associated vehicles will also be deleted.')) {
        membersData = membersData.filter(m => m.id !== memberId);
        vehiclesData = vehiclesData.filter(v => v.memberId !== memberId);
        localStorage.setItem('members', JSON.stringify(membersData));
        localStorage.setItem('vehicles', JSON.stringify(vehiclesData));
        displayAdminUsers();
        updateAdminDashboard();
    }
}

function clearAllData() {
    if (confirm('⚠️ WARNING: This will delete ALL data! Are you sure?')) {
        if (confirm('This action cannot be undone. Click OK to confirm.')) {
            localStorage.removeItem('members');
            localStorage.removeItem('vehicles');
            localStorage.removeItem('parking');
            localStorage.removeItem('memberIdCounter');
            localStorage.removeItem('vehicleIdCounter');
            localStorage.removeItem('parkingIdCounter');
            
            membersData = [];
            vehiclesData = [];
            parkingData = [];
            memberIdCounter = 1;
            vehicleIdCounter = 1;
            parkingIdCounter = 1;
            
            updateAdminDashboard();
            displayAdminUsers();
            alert('All data has been cleared!');
        }
    }
}

// User Profile Functions
function displayUserProfile() {
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userLoginTime = localStorage.getItem('userLoginTime');
    const userLastUpdated = localStorage.getItem('userLastUpdated');
    
    // Update profile display
    document.getElementById('userNameDisplay').textContent = userName || 'User';
    document.getElementById('userEmailDisplay').textContent = userEmail || 'user@parking.com';
    document.getElementById('profileEmail').textContent = userEmail || 'Not set';
    document.getElementById('profileUsername').textContent = userName || 'Not set';
    document.getElementById('profileLoginTime').textContent = userLoginTime || 'Not available';
    document.getElementById('profileLastUpdated').textContent = userLastUpdated || 'Not available';
    
    // Display user's vehicles
    displayUserVehicles();
    
    // Display user's parking history
    displayUserParkingHistory();
}

function displayUserVehicles() {
    const userEmail = localStorage.getItem('userEmail');
    const userVehiclesList = document.getElementById('userVehiclesList');
    
    // Find member with this email
    const member = membersData.find(m => m.contactNo === userEmail);
    
    if (!member) {
        userVehiclesList.innerHTML = '<p class="empty-message">No vehicles found for this account</p>';
        return;
    }
    
    const memberVehicles = vehiclesData.filter(v => v.memberId === member.memberId);
    
    if (memberVehicles.length === 0) {
        userVehiclesList.innerHTML = '<p class="empty-message">No vehicles registered yet</p>';
        return;
    }
    
    let html = '';
    memberVehicles.forEach(vehicle => {
        html += `
            <div class="vehicle-card">
                <h4>${vehicle.name}</h4>
                <p><strong>Registration:</strong> ${vehicle.regno}</p>
                <p><strong>Model:</strong> ${vehicle.model}</p>
                <p><strong>Color:</strong> ${vehicle.color}</p>
            </div>
        `;
    });
    
    userVehiclesList.innerHTML = html;
}

function displayUserParkingHistory() {
    const userEmail = localStorage.getItem('userEmail');
    const tbody = document.querySelector('#userParkingTable tbody');
    
    // Find member with this email
    const member = membersData.find(m => m.contactNo === userEmail);
    
    if (!member) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No parking history</td></tr>';
        return;
    }
    
    // Get parkings for this member
    const memberParkings = parkingData.filter(p => p.memberId === member.memberId);
    
    if (memberParkings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No parking history</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    memberParkings.forEach(parking => {
        const vehicle = vehiclesData.find(v => v.vehicleId === parking.vehicleId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 10px;">${vehicle ? vehicle.name : 'Unknown'}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${parking.checkin}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${parking.checkout || 'Ongoing'}</td>
            <td style="border: 1px solid #ddd; padding: 10px;"><span class="${parking.status === 'Active' ? 'status-active' : 'status-inactive'}">${parking.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function editUserProfile() {
    alert('Profile edit feature coming soon! You can update your information in the Members section.');
}

function changePassword() {
    alert('Password change feature - Please ensure you use a strong password for security.');
}


// Sample Data Storage (Using LocalStorage for frontend demo)
let membersData = JSON.parse(localStorage.getItem('members')) || [];
let vehiclesData = JSON.parse(localStorage.getItem('vehicles')) || [];
let parkingData = JSON.parse(localStorage.getItem('parking')) || [];
let parkingArenaData = JSON.parse(localStorage.getItem('parkingArena')) || initializeParkingArena();

let memberIdCounter = parseInt(localStorage.getItem('memberIdCounter')) || 1;
let vehicleIdCounter = parseInt(localStorage.getItem('vehicleIdCounter')) || 1;
let parkingIdCounter = parseInt(localStorage.getItem('parkingIdCounter')) || 1;

// Initialize Parking Arena
function initializeParkingArena() {
    const arena = [];
    for (let block = 1; block <= 3; block++) {
        for (let row = 1; row <= 5; row++) {
            for (let column = 1; column <= 4; column++) {
                arena.push({
                    parkingSlotId: `${block}-${row}-${column}`,
                    block: block,
                    row: row,
                    column: column,
                    isOccupied: false,
                    occupiedSince: null
                });
            }
        }
    }
    localStorage.setItem('parkingArena', JSON.stringify(arena));
    return arena;
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        showSection(targetId);
    });
});

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav link
    document.querySelector(`a[href="#${sectionId}"]`).classList.add('active');
    
    // Update content when showing section
    if (sectionId === 'profile') {
        displayUserProfile();
    } else if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'members') {
        displayMembers();
        loadMembersSelect();
    } else if (sectionId === 'vehicles') {
        displayVehicles();
        loadMembersSelect();
    } else if (sectionId === 'parking') {
        displayParkingStatus();
        loadMembersSelect();
        loadParkingSlots();
    } else if (sectionId === 'reports') {
        generateReports();
    }
}

// ===== MEMBERS MANAGEMENT =====
async function addMemberToServer(member) {
    try {
        const result = await apiPost('members', {
            m_name: member.name,
            m_fname: member.fatherName,
            m_enic: member.cnic,
            m_contactno: member.contactNo,
            m_address: member.address
        });
        if (result.success) {
            await loadAllData();
            alert('Member added successfully!');
        } else {
            alert('Error adding member: ' + result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Server error while adding member');
    }
}

document.getElementById('memberForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const member = {
        cnic: document.getElementById('mCnic').value,
        name: document.getElementById('mName').value,
        fatherName: document.getElementById('mFname').value,
        contactNo: document.getElementById('mContact').value,
        address: document.getElementById('mAddress').value
    };

    addMemberToServer(member);
    
    // Reset form
    document.getElementById('memberForm').reset();
});

function displayMembers() {
    const tbody = document.querySelector('#membersTable tbody');
    tbody.innerHTML = '';
    
    if (membersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No members found</td></tr>';
        return;
    }
    
    membersData.forEach(member => {
        const id = member.id || member.memberId;
        const contact = member.contact || member.contactNo || '';
        const name = member.name || '';
        const cnic = member.cnic || '';
        const fatherName = member.fatherName || member.fathername || '';
        const address = member.address || '';
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${id}</td>
            <td>${cnic}</td>
            <td>${name}</td>
            <td>${fatherName}</td>
            <td>${contact}</td>
            <td>${address}</td>
            <td><button class="btn btn-danger" onclick="deleteMember(${id})">Delete</button></td>
        `;
    });
}

async function deleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member?')) {
        try {
            const result = await apiDelete('members', { m_id: memberId });
            if (result.success) {
                await loadAllData();
                displayMembers();
                loadMembersSelect();
                alert('Member deleted successfully');
            } else {
                alert('Error deleting member: ' + result.message);
            }
        } catch (err) {
            console.error(err);
            alert('Server error while deleting member');
        }
    }
}

function saveMembersData() {
    localStorage.setItem('members', JSON.stringify(membersData));
    localStorage.setItem('memberIdCounter', memberIdCounter);
}

// ===== VEHICLES MANAGEMENT =====
document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const vehicle = {
        memberId: parseInt(document.getElementById('vMemberId').value),
        registrationNo: document.getElementById('vRegno').value,
        engineNo: document.getElementById('vEngno').value,
        vehicleName: document.getElementById('vName').value,
        model: document.getElementById('vModel').value,
        color: document.getElementById('vColor').value,
        chassisNo: document.getElementById('vChassis').value
    };
    
    try {
        const result = await apiPost('vehicles', {
            v_regno: vehicle.registrationNo,
            v_engno: vehicle.engineNo,
            v_name: vehicle.vehicleName,
            v_model: vehicle.model,
            v_color: vehicle.color,
            v_chasesno: vehicle.chassisNo,
            p_id: 0,
            p_name: '',
            m_id: vehicle.memberId
        });
        if (result.success) {
            await loadAllData();
            alert('Vehicle registered successfully!');
        } else {
            alert('Error registering vehicle: ' + result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Server error while registering vehicle');
    }
    
    document.getElementById('vehicleForm').reset();
});

function displayVehicles() {
    const tbody = document.querySelector('#vehiclesTable tbody');
    tbody.innerHTML = '';
    
    if (vehiclesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-message">No vehicles found</td></tr>';
        return;
    }
    
    vehiclesData.forEach(vehicle => {
        const id = vehicle.id || vehicle.vehicleId;
        const memId = vehicle.memberId;
        const member = membersData.find(m => (m.id || m.memberId) === memId);
        const regno = vehicle.regno || vehicle.registrationNo || '';
        const engno = vehicle.engineNo || vehicle.engineNo || '';
        const name = vehicle.name || vehicle.vehicleName || '';
        const model = vehicle.model || '';
        const color = vehicle.color || '';
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${id}</td>
            <td>${member ? member.name : 'N/A'}</td>
            <td>${regno}</td>
            <td>${engno}</td>
            <td>${name}</td>
            <td>${model}</td>
            <td>${color}</td>
            <td><button class="btn btn-danger" onclick="deleteVehicle(${id})">Delete</button></td>
        `;
    });
}

async function deleteVehicle(vehicleId) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        try {
            const result = await apiDelete('vehicles', { v_id: vehicleId });
            if (result.success) {
                await loadAllData();
                displayVehicles();
                alert('Vehicle deleted successfully');
            } else {
                alert('Error deleting vehicle: ' + result.message);
            }
        } catch (err) {
            console.error(err);
            alert('Server error while deleting vehicle');
        }
    }
}

function saveVehiclesData() {
    localStorage.setItem('vehicles', JSON.stringify(vehiclesData));
    localStorage.setItem('vehicleIdCounter', vehicleIdCounter);
}

// ===== PARKING MANAGEMENT =====
document.getElementById('entryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const memberId = parseInt(document.getElementById('eMemberId').value);
    const slotId = document.getElementById('eParkingSlot').value;
    
    const member = membersData.find(m => m.id === memberId || m.memberId === memberId);
    const vehicle = vehiclesData.find(v => v.memberId === memberId || v.id === memberId);
    
    if (!vehicle) {
        alert('Please register a vehicle first for this member!');
        return;
    }

    try {
        const result = await apiPost('parking', {
            v_id: vehicle.id || vehicle.vehicleId,
            p_id: 0,
            m_id: memberId
        });
        if (result) {
            await loadAllData();
            alert('Vehicle checked in successfully!');
        } else {
            alert('Error checking in vehicle');
        }
    } catch (err) {
        console.error(err);
        alert('Server error during check-in');
    }
    
    document.getElementById('entryForm').reset();
});

document.getElementById('exitForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const parkingId = parseInt(document.getElementById('exitParkingId').value);
    const parking = parkingData.find(p => p.parkingId === parkingId);
    
    if (!parking) {
        alert('Invalid Parking ID!');
        return;
    }
    
    if (parking.status === 'Completed') {
        alert('This vehicle has already checked out!');
        return;
    }
    
    // For now update locally and reload data
    parking.status = 'Completed';
    parking.checkOut = new Date().toLocaleString();
    
    try {
        // ideally send update to server (not implemented)
        await loadAllData();
        displayParkingStatus();
        alert('Vehicle checked out successfully!');
    } catch (err) {
        console.error(err);
    }
    
    // Update parking
    parking.checkOut = new Date().toLocaleString();
    parking.status = 'Completed';
    
    // Free the slot
    const slot = parkingArenaData.find(s => s.parkingSlotId === parking.parkingSlot);
    slot.isOccupied = false;
    slot.occupiedSince = null;
    
    saveParkingData();
    
    // Reset form
    document.getElementById('exitForm').reset();
    displayParkingStatus();
    loadParkingSlots();
    
    alert('Vehicle checked out successfully!');
});

function displayParkingStatus() {
    const tbody = document.querySelector('#parkingTable tbody');
    tbody.innerHTML = '';
    
    if (parkingData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No parking records found</td></tr>';
        return;
    }
    
    parkingData.forEach(parking => {
        const member = membersData.find(m => (m.id || m.memberId) === parking.memberId);
        const vehicle = vehiclesData.find(v => (v.id || v.vehicleId) === parking.vehicleId);
        const id = parking.id || parking.parkingId;
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${id}</td>
            <td>${member ? member.name : 'N/A'}</td>
            <td>${vehicle ? (vehicle.regno||vehicle.registrationNo) : 'N/A'}</td>
            <td>${parking.parkingSlot}</td>
            <td>${parking.checkin || parking.checkIn}</td>
            <td>${parking.checkout || parking.checkOut || 'In Progress'}</td>
            <td class="${parking.status === 'Active' ? 'status-active' : 'status-inactive'}">${parking.status}</td>
        `;
    });
}

function saveParkingData() {
    localStorage.setItem('parking', JSON.stringify(parkingData));
    localStorage.setItem('parkingArena', JSON.stringify(parkingArenaData));
    localStorage.setItem('parkingIdCounter', parkingIdCounter);
}

// ===== DROPDOWN LOADERS =====
function loadMembersSelect() {
    const selects = [
        document.getElementById('vMemberId'),
        document.getElementById('eMemberId')
    ];
    
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Member</option>';
        
        membersData.forEach(member => {
            const id = member.id || member.memberId;
            const name = member.name || '';
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${id} - ${name}`;
            select.appendChild(option);
        });
        
        if (currentValue) select.value = currentValue;
    });
}

function loadParkingSlots() {
    const select = document.getElementById('eParkingSlot');
    select.innerHTML = '<option value="">Select Slot</option>';
    
    const availableSlots = parkingArenaData.filter(slot => !slot.isOccupied);
    
    availableSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot.parkingSlotId;
        option.textContent = `Block ${slot.block} - Row ${slot.row} - Column ${slot.column}`;
        select.appendChild(option);
    });
}

// ===== DASHBOARD =====
function updateDashboard() {
    document.getElementById('totalMembers').textContent = membersData.length;
    document.getElementById('totalVehicles').textContent = vehiclesData.length;
    
    const occupiedCount = parkingArenaData.filter(s => s.isOccupied).length;
    const availableCount = parkingArenaData.filter(s => !s.isOccupied).length;
    
    document.getElementById('occupiedSlots').textContent = occupiedCount;
    document.getElementById('availableSlots').textContent = availableCount;
}

// ===== REPORTS =====
function generateReports() {
    // Parking Arena Details
    const arenaDiv = document.getElementById('parkingArenaDetails');
    let arenaHTML = '<table style="width:100%; border-collapse: collapse;">';
    arenaHTML += '<tr style="background: #667eea; color: white;"><th style="border: 1px solid #ddd; padding: 10px;">Total Slots</th><th style="border: 1px solid #ddd; padding: 10px;">Occupied</th><th style="border: 1px solid #ddd; padding: 10px;">Available</th></tr>';
    
    const total = parkingArenaData.length;
    const occupied = parkingArenaData.filter(s => s.isOccupied).length;
    const available = total - occupied;
    
    arenaHTML += `<tr><td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${total}</td><td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${occupied}</td><td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${available}</td></tr>`;
    arenaHTML += '</table>';
    
    arenaDiv.innerHTML = arenaHTML;
    
    // Revenue Report
    const revenueDiv = document.getElementById('revenueReport');
    const completedParkings = parkingData.filter(p => p.status === 'Completed');
    const totalRevenue = completedParkings.length * 100; // Assuming 100 per parking
    
    let revenueHTML = `<p><strong>Total Completed Parkings:</strong> ${completedParkings.length}</p>`;
    revenueHTML += `<p><strong>Estimated Revenue (@ 100 per parking):</strong> PKR ${totalRevenue}</p>`;
    revenueHTML += `<p><strong>Currently Active Parkings:</strong> ${parkingData.filter(p => p.status === 'Active').length}</p>`;
    
    revenueDiv.innerHTML = revenueHTML;
}

// Initialize on load
window.addEventListener('load', () => {
    initializeDemoUsers();
    initializeLogin();
    initializeAdminNavigation();
    loadAllData();
});

// Initialize Demo Users
function initializeDemoUsers() {
    if (registeredUsers.length === 0) {
        registeredUsers = [
            {
                id: 'USER_DEMO1',
                email: 'user@demo.com',
                username: 'demouser',
                password: 'demo123',
                createdAt: new Date().toLocaleString(),
                status: 'Active'
            },
            {
                id: 'USER_DEMO2',
                email: 'test@test.com',
                username: 'testuser',
                password: 'test123',
                createdAt: new Date().toLocaleString(),
                status: 'Active'
            }
        ];
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Also add to admin users list
        const adminUsers = [
            {
                id: 'USER_DEMO1',
                name: 'demouser',
                email: 'user@demo.com',
                type: 'Registered User',
                createdAt: new Date().toLocaleString(),
                status: 'Active'
            },
            {
                id: 'USER_DEMO2',
                name: 'testuser',
                email: 'test@test.com',
                type: 'Registered User',
                createdAt: new Date().toLocaleString(),
                status: 'Active'
            }
        ];
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
    }
}

// Admin Navigation
function initializeAdminNavigation() {
    document.querySelectorAll('#adminContainer .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showAdminSection(targetId);
        });
    });
    
    // Settings form handler
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const costPerHour = document.getElementById('costPerHour').value;
            const totalBlocks = document.getElementById('totalBlocks').value;
            const rowsPerBlock = document.getElementById('rowsPerBlock').value;
            const slotsPerRow = document.getElementById('slotsPerRow').value;
            
            localStorage.setItem('costPerHour', costPerHour);
            localStorage.setItem('totalBlocks', totalBlocks);
            localStorage.setItem('rowsPerBlock', rowsPerBlock);
            localStorage.setItem('slotsPerRow', slotsPerRow);
            
            alert('Settings saved successfully!');
        });
    }
}

function showAdminSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('#adminContainer .section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('#adminContainer .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav link
    document.querySelector(`#adminContainer a[href="#${sectionId}"]`).classList.add('active');
    
    // Update content when showing section
    if (sectionId === 'adminDashboard') {
        updateAdminDashboard();
    } else if (sectionId === 'adminUsers') {
        displayAdminUsers();
    }
}



// 🔥 Firebase Configuration (Replace with your own keys)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Setup reCAPTCHA
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
  'recaptcha-container',
  {
    size: 'normal',
    callback: function(response) {
      console.log("reCAPTCHA verified");
    }
  }
);

// 📩 Send OTP Function
function sendOTP() {

  let mobile = document.getElementById("signupMobile").value;

  if (mobile.length !== 10) {
    alert("Please enter valid 10 digit mobile number");
    return;
  }

  let phoneNumber = "+91" + mobile;

  firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then(function (confirmationResult) {

      window.confirmationResult = confirmationResult;
      document.getElementById("otpSection").style.display = "block";
      alert("OTP Sent Successfully ✅");

    })
    .catch(function (error) {
      alert(error.message);
    });
}

// 🔐 Verify OTP Function
function verifyOTP() {

  let otp = document.getElementById("signupOTP").value;

  if (otp.length !== 6) {
    alert("Enter valid 6 digit OTP");
    return;
  }

  confirmationResult.confirm(otp)
    .then(function (result) {

      alert("Mobile Number Verified Successfully 🎉");

    })
    .catch(function (error) {
      alert("Invalid OTP ❌");
    });
}
