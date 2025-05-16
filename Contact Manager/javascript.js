// ===== INITIALIZATION & UTILITIES =====
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

/**
 * Initialize the application
 */
function initApp() {
  // STORAGE
  initStorage();
  
  // THEME
  initTheme();
  
  // DATA
  loadContacts();
  loadGroups();
  loadEvents();
  
  // CALENDAR
  initCalendar();
  
  // EVENTS
  attachEventListeners();
  
  // STATS
  updateStats();
}

/**
 * Initialize local storage
 */
function initStorage() {
  if (!localStorage.getItem('contacts')) {
    localStorage.setItem('contacts', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('groups')) {
    localStorage.setItem('groups', JSON.stringify([
      { id: generateId(), name: 'Family', color: '#F72585', count: 0 },
      { id: generateId(), name: 'Friends', color: '#4CC9F0', count: 0 },
      { id: generateId(), name: 'Work', color: '#4361EE', count: 0 },
      { id: generateId(), name: 'Company', color: '#7209B7', count: 0 }
    ]));
  }
  
  if (!localStorage.getItem('events')) {
    localStorage.setItem('events', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'light');
  }
}

/**
 * Generate a unique ID
 * @returns {string} Generated ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Format a date for display
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
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

// ===== EVENT HANDLER =====
/**
 * Attach all event listeners for the application
 */
function attachEventListeners() {
  // TABS
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', switchTab);
  });
  
  // THEME
  document.getElementById('darkModeToggle').addEventListener('click', toggleTheme);
  
  // SEARCH
  document.getElementById('contactSearch').addEventListener('input', debounce(searchContacts, 300));
  
  // FILTER
  document.getElementById('filterGroup').addEventListener('change', filterContacts);
  document.getElementById('sortContacts').addEventListener('change', sortContacts);
  
  // ADD
  document.getElementById('addContactBtn').addEventListener('click', () => openContactModal());
  document.getElementById('emptyAddContactBtn').addEventListener('click', () => openContactModal());
  
  // FORM
  document.getElementById('contactForm').addEventListener('submit', saveContact);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  
  // TYPE
  document.querySelectorAll('input[name="contactType"]').forEach(radio => {
    radio.addEventListener('change', toggleContactType);
  });
  
  // AVATAR
  document.getElementById('avatarUpload').addEventListener('change', handleAvatarUpload);
  
  // GROUP
  document.getElementById('addGroupBtn').addEventListener('click', saveGroup);
  
  // PRESETS
  document.querySelectorAll('.group-preset-btn').forEach(btn => {
    btn.addEventListener('click', applyGroupPreset);
  });
  
  // CALENDAR
  document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
  
  // EVENT
  document.getElementById('addEventBtn').addEventListener('click', () => openEventModal());
  document.getElementById('eventForm').addEventListener('submit', saveEvent);
  document.getElementById('cancelEventBtn').addEventListener('click', closeModal);
  
  // MODALS
  document.querySelectorAll('.modal .close').forEach(close => {
    close.addEventListener('click', closeModal);
  });
  
  // CONFIRM
  document.getElementById('confirmNoBtn').addEventListener('click', closeModal);
  document.getElementById('confirmYesBtn').addEventListener('click', handleConfirmAction);
  
  // NOTIFY
  document.querySelector('.close-notification').addEventListener('click', hideNotification);
  
  // SELECTION
  document.getElementById('cancelSelectionBtn').addEventListener('click', cancelSelection);
  document.getElementById('changeGroupBtn').addEventListener('click', openChangeGroupDialog);
  document.getElementById('deleteSelectedBtn').addEventListener('click', confirmDeleteSelected);
  
  // DETAILS
  document.getElementById('editContactBtn').addEventListener('click', editViewedContact);
  document.getElementById('deleteContactBtn').addEventListener('click', confirmDeleteViewedContact);
}

// ===== NAVIGATION =====
/**
 * Change the active tab
 * @param {Event} e - Click event
 */
function switchTab(e) {
  // INACTIVE
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // ACTIVE
  e.currentTarget.classList.add('active');
  
  // HIDE
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // SHOW
  const tabName = e.currentTarget.dataset.tab;
  document.getElementById(`${tabName}-section`).classList.add('active');
}

// ===== THEME =====
/**
 * Initialize the application theme
 */
function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  if (theme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.body.removeAttribute('data-theme');
    document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-moon"></i>';
  }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  localStorage.setItem('theme', newTheme);
  
  if (newTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.body.removeAttribute('data-theme');
    document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// ===== CONTACT MANAGEMENT =====
/**
 * Load and display all contacts
 */
function loadContacts() {
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  const contactsList = document.getElementById('contactsList');
  const emptyContacts = document.getElementById('emptyContacts');
  
  // EMPTY
  if (contacts.length === 0) {
    contactsList.innerHTML = '';
    emptyContacts.style.display = 'flex';
    return;
  }
  
  // DISPLAY
  emptyContacts.style.display = 'none';
  renderContacts(contacts);
}

/**
 * Display contacts in the grid
 * @param {Array} contacts - List of contacts to display
 */
function renderContacts(contacts) {
  const contactsList = document.getElementById('contactsList');
  contactsList.innerHTML = '';
  
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  
  contacts.forEach(contact => {
    const group = groups.find(g => g.id === contact.group);
    const groupClass = group ? group.name.toLowerCase() : '';
    const groupName = group ? group.name : 'No group';
    
    let contactName;
    if (contact.type === 'personal') {
      contactName = `${escapeHtml(contact.firstName)} ${escapeHtml(contact.lastName)}`;
    } else {
      contactName = escapeHtml(contact.companyName);
    }
    
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.dataset.id = contact.id;
    
    // AVATAR
    let avatarContent;
    if (contact.avatar) {
      avatarContent = `<img src="${contact.avatar}" alt="${contactName}">`;
    } else {
      avatarContent = `<i class="fas fa-${contact.type === 'personal' ? 'user' : 'building'}"></i>`;
    }
    
    card.innerHTML = `
      <input type="checkbox" class="contact-select" data-id="${contact.id}">
      <div class="contact-header ${groupClass}">
        ${group ? `<span class="contact-group-badge ${groupClass}">${escapeHtml(groupName)}</span>` : ''}
      </div>
      <div class="contact-avatar-small">
        ${avatarContent}
      </div>
      <div class="contact-body">
        <h3 class="contact-name">${contactName}</h3>
        <div class="contact-info">
          ${contact.email ? `
            <div class="contact-info-item">
              <i class="fas fa-envelope"></i>
              <span>${escapeHtml(contact.email)}</span>
            </div>
          ` : ''}
          ${contact.phone ? `
            <div class="contact-info-item">
              <i class="fas fa-phone"></i>
              <span>${escapeHtml(contact.phone)}</span>
            </div>
          ` : ''}
        </div>
        <div class="contact-actions">
          <button class="contact-action-btn view-contact" data-id="${contact.id}" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="contact-action-btn edit-contact" data-id="${contact.id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="contact-action-btn delete-contact" data-id="${contact.id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    
    // APPEND
    contactsList.appendChild(card);
  });
  
  // BUTTONS
  document.querySelectorAll('.view-contact').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      viewContact(e.currentTarget.dataset.id);
    });
  });
  
  document.querySelectorAll('.edit-contact').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openContactModal(e.currentTarget.dataset.id);
    });
  });
  
  document.querySelectorAll('.delete-contact').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      confirmDeleteContact(e.currentTarget.dataset.id);
    });
  });
  
  document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('click', () => {
      viewContact(card.dataset.id);
    });
  });
  
  document.querySelectorAll('.contact-select').forEach(checkbox => {
    checkbox.addEventListener('click', e => {
      e.stopPropagation();
      toggleContactSelection();
    });
  });
}

/**
 * Open the add/edit contact modal
 * @param {string} contactId - ID of the contact to edit (optional)
 */
function openContactModal(contactId = null) {
  const modal = document.getElementById('contactFormModal');
  const form = document.getElementById('contactForm');
  const formTitle = document.getElementById('formTitle');
  const saveBtn = document.getElementById('saveContactBtn');
  
  // RESET
  form.reset();
  document.getElementById('contactId').value = '';
  document.getElementById('avatarPreview').innerHTML = '<i class="fas fa-user"></i>';
  document.getElementById('personalFields').style.display = 'block';
  document.getElementById('companyFields').style.display = 'none';
  document.querySelector('input[value="personal"]').checked = true;
  
  // GROUPS
  loadGroupsIntoSelect('group');
  
  if (contactId) {
    // EDIT
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const contact = contacts.find(c => c.id === contactId);
    
    if (contact) {
      document.getElementById('contactId').value = contact.id;
      document.querySelector(`input[value="${contact.type}"]`).checked = true;
      
      if (contact.type === 'personal') {
        document.getElementById('firstName').value = contact.firstName || '';
        document.getElementById('lastName').value = contact.lastName || '';
        document.getElementById('personalFields').style.display = 'block';
        document.getElementById('companyFields').style.display = 'none';
      } else {
        document.getElementById('companyName').value = contact.companyName || '';
        document.getElementById('personalFields').style.display = 'none';
        document.getElementById('companyFields').style.display = 'block';
      }
      
      document.getElementById('email').value = contact.email || '';
      document.getElementById('phone').value = contact.phone || '';
      document.getElementById('address').value = contact.address || '';
      document.getElementById('birthday').value = contact.birthday || '';
      document.getElementById('group').value = contact.group || '';
      document.getElementById('notes').value = contact.notes || '';
      
      if (contact.avatar) {
        document.getElementById('avatarPreview').innerHTML = `<img src="${contact.avatar}" alt="Avatar">`;
      }
      
      formTitle.textContent = 'Edit contact';
      saveBtn.querySelector('span').textContent = 'Update';
    }
  } else {
    // NEW
    formTitle.textContent = 'Add a contact';
    saveBtn.querySelector('span').textContent = 'Save';
  }
  
  // SHOW
  modal.classList.add('active');
}

/**
 * Toggle between contact types (person/company)
 */
function toggleContactType() {
  const type = document.querySelector('input[name="contactType"]:checked').value;
  
  if (type === 'personal') {
    document.getElementById('personalFields').style.display = 'block';
    document.getElementById('companyFields').style.display = 'none';
  } else {
    document.getElementById('personalFields').style.display = 'none';
    document.getElementById('companyFields').style.display = 'block';
  }
}

/**
 * Handle avatar upload
 * @param {Event} e - Change event
 */
function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // VALIDATE
  if (!file.type.startsWith('image/')) {
    showNotification('File must be an image', 'error');
    return;
  }
  
  // CONVERT
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('avatarPreview');
    preview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
  };
  reader.readAsDataURL(file);
}

/**
 * Save a contact (add or edit)
 * @param {Event} e - Submit event
 */
function saveContact(e) {
  e.preventDefault();
  
  const contactId = document.getElementById('contactId').value;
  const type = document.querySelector('input[name="contactType"]:checked').value;
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const birthday = document.getElementById('birthday').value;
  const group = document.getElementById('group').value;
  const notes = document.getElementById('notes').value.trim();
  
  // VALIDATE
  let isValid = true;
  let contactData = {
    type,
    email,
    phone,
    address,
    birthday,
    group,
    notes,
  };
  
  if (type === 'personal') {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    
    if (!firstName || !lastName) {
      showNotification('Please fill all required fields', 'error');
      isValid = false;
    }
    
    contactData = {
      ...contactData,
      firstName,
      lastName,
      companyName: ''
    };
  } else {
    const companyName = document.getElementById('companyName').value.trim();
    
    if (!companyName) {
      showNotification('Please fill all required fields', 'error');
      isValid = false;
    }
    
    contactData = {
      ...contactData,
      firstName: '',
      lastName: '',
      companyName
    };
  }
  
  if (!isValid) return;
  
  // AVATAR
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarImg = avatarPreview.querySelector('img');
  const avatar = avatarImg ? avatarImg.src : '';
  
  contactData.avatar = avatar;
  
  // CONTACTS
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  if (contactId) {
    // UPDATE
    const index = contacts.findIndex(c => c.id === contactId);
    if (index !== -1) {
      // PRESERVE
      contactData.createdAt = contacts[index].createdAt;
      contacts[index] = {
        ...contactData,
        id: contactId
      };
    }
  } else {
    // CREATE
    contactData.id = generateId();
    contactData.createdAt = new Date().toISOString();
    contacts.push(contactData);
  }
  
  // SAVE
  localStorage.setItem('contacts', JSON.stringify(contacts));
  
  // COUNTS
  updateGroupCounts();
  
  // RELOAD
  loadContacts();
  
  // CLOSE
  closeModal();
  
  // NOTIFY
  showNotification(contactId ? 'Contact updated successfully' : 'Contact added successfully', 'success');
  
  // STATS
  updateStats();
}

/**
 * Display contact details
 * @param {string} contactId - ID of the contact
 */
function viewContact(contactId) {
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  const contact = contacts.find(c => c.id === contactId);
  
  if (!contact) return;
  
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  const group = groups.find(g => g.id === contact.group);
  
  const modal = document.getElementById('viewContactModal');
  const detailContainer = document.getElementById('contactDetail');
  
  let contactName;
  if (contact.type === 'personal') {
    contactName = `${escapeHtml(contact.firstName)} ${escapeHtml(contact.lastName)}`;
  } else {
    contactName = escapeHtml(contact.companyName);
  }
  
  // AVATAR
  let avatarContent;
  if (contact.avatar) {
    avatarContent = `<img src="${contact.avatar}" alt="${contactName}">`;
  } else {
    avatarContent = `<i class="fas fa-${contact.type === 'personal' ? 'user' : 'building'}"></i>`;
  }
  
  // HTML
  let html = `
    <div class="contact-profile">
      <div class="avatar-preview">${avatarContent}</div>
      <h2 class="contact-detail-name">${contactName}</h2>
      ${group ? `<span class="contact-detail-group ${group.name.toLowerCase()}" style="background-color: ${group.color}">${escapeHtml(group.name)}</span>` : ''}
    </div>
    
    <div class="contact-details">
  `;
  
  // INFO
  if (contact.email) {
    html += `
      <div class="contact-detail-item">
        <span class="contact-detail-label">Email</span>
        <span class="contact-detail-value">${escapeHtml(contact.email)}</span>
      </div>
    `;
  }
  
  if (contact.phone) {
    html += `
      <div class="contact-detail-item">
        <span class="contact-detail-label">Phone</span>
        <span class="contact-detail-value">${escapeHtml(contact.phone)}</span>
      </div>
    `;
  }
  
  if (contact.address) {
    html += `
      <div class="contact-detail-item">
        <span class="contact-detail-label">Address</span>
        <span class="contact-detail-value">${escapeHtml(contact.address)}</span>
      </div>
    `;
  }
  
  if (contact.birthday) {
    html += `
      <div class="contact-detail-item">
        <span class="contact-detail-label">Birth date</span>
        <span class="contact-detail-value">${formatDate(contact.birthday)}</span>
      </div>
    `;
  }
  
  html += `
    </div>
  `;
  
  // NOTES
  if (contact.notes) {
    html += `
      <div class="contact-notes">
        <h4>Notes</h4>
        <p>${escapeHtml(contact.notes)}</p>
      </div>
    `;
  }
  
  // ACTIONS
  document.getElementById('editContactBtn').setAttribute('data-id', contactId);
  document.getElementById('deleteContactBtn').setAttribute('data-id', contactId);
  
  // DISPLAY
  detailContainer.innerHTML = html;
  modal.classList.add('active');
}

/**
 * Edit the currently viewed contact
 */
function editViewedContact() {
  const contactId = document.getElementById('editContactBtn').getAttribute('data-id');
  closeModal();
  openContactModal(contactId);
}

/**
 * Confirm contact deletion
 * @param {string} contactId - ID of the contact to delete
 */
function confirmDeleteContact(contactId) {
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  const contact = contacts.find(c => c.id === contactId);
  
  if (!contact) return;
  
  // SETUP
  const modal = document.getElementById('confirmModal');
  const title = document.getElementById('confirmTitle');
  const message = document.getElementById('confirmMessage');
  const confirmBtn = document.getElementById('confirmYesBtn');
  
  let contactName;
  if (contact.type === 'personal') {
    contactName = `${contact.firstName} ${contact.lastName}`;
  } else {
    contactName = contact.companyName;
  }
  
  title.textContent = 'Delete contact';
  message.textContent = `Are you sure you want to delete the contact "${contactName}"? This action cannot be undone.`;
  
  // ACTION
  confirmBtn.setAttribute('data-action', 'deleteContact');
  confirmBtn.setAttribute('data-id', contactId);
  
  // SHOW
  modal.classList.add('active');
}

/**
 * Confirm deletion of the currently viewed contact
 */
function confirmDeleteViewedContact() {
  const contactId = document.getElementById('deleteContactBtn').getAttribute('data-id');
  closeModal();
  confirmDeleteContact(contactId);
}

/**
 * Delete a contact
 * @param {string} contactId - ID of the contact to delete
 */
function deleteContact(contactId) {
  let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  // FILTER
  contacts = contacts.filter(c => c.id !== contactId);
  
  // SAVE
  localStorage.setItem('contacts', JSON.stringify(contacts));
  
  // COUNTS
  updateGroupCounts();
  
  // RELOAD
  loadContacts();
  
  // NOTIFY
  showNotification('Contact deleted successfully', 'success');
  
  // STATS
  updateStats();
}

/**
 * Search contacts by name
 * @param {Event} e - Input event
 */
function searchContacts(e) {
  const query = e.target.value.toLowerCase().trim();
  const filter = document.getElementById('filterGroup').value;
  const sort = document.getElementById('sortContacts').value;
  
  let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  // SEARCH
  if (query) {
    contacts = contacts.filter(contact => {
      if (contact.type === 'personal') {
        return (
          (contact.firstName && contact.firstName.toLowerCase().includes(query)) ||
          (contact.lastName && contact.lastName.toLowerCase().includes(query)) ||
          (contact.email && contact.email.toLowerCase().includes(query)) ||
          (contact.phone && contact.phone.toLowerCase().includes(query))
        );
      } else {
        return (
          (contact.companyName && contact.companyName.toLowerCase().includes(query)) ||
          (contact.email && contact.email.toLowerCase().includes(query)) ||
          (contact.phone && contact.phone.toLowerCase().includes(query))
        );
      }
    });
  }
  
  // FILTER
  if (filter !== 'all') {
    contacts = contacts.filter(contact => {
      if (filter === 'no-group') {
        return !contact.group;
      }
      
      const groups = JSON.parse(localStorage.getItem('groups')) || [];
      const group = groups.find(g => g.id === contact.group);
      return group && group.name.toLowerCase() === filter;
    });
  }
  
  // SORT
  sortContactsArray(contacts, sort);
  
  // DISPLAY
  renderContacts(contacts);
  
  // EMPTY
  const emptyContacts = document.getElementById('emptyContacts');
  if (contacts.length === 0) {
    emptyContacts.style.display = 'flex';
  } else {
    emptyContacts.style.display = 'none';
  }
}

/**
 * Filter contacts by group
 */
function filterContacts() {
  const query = document.getElementById('contactSearch').value.toLowerCase().trim();
  const filter = document.getElementById('filterGroup').value;
  const sort = document.getElementById('sortContacts').value;
  
  let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  // SEARCH
  if (query) {
    contacts = contacts.filter(contact => {
      if (contact.type === 'personal') {
        return (
          (contact.firstName && contact.firstName.toLowerCase().includes(query)) ||
          (contact.lastName && contact.lastName.toLowerCase().includes(query)) ||
          (contact.email && contact.email.toLowerCase().includes(query)) ||
          (contact.phone && contact.phone.toLowerCase().includes(query))
        );
      } else {
        return (
          (contact.companyName && contact.companyName.toLowerCase().includes(query)) ||
          (contact.email && contact.email.toLowerCase().includes(query)) ||
          (contact.phone && contact.phone.toLowerCase().includes(query))
        );
      }
    });
  }
  
  // FILTER
  if (filter !== 'all') {
    contacts = contacts.filter(contact => {
      if (filter === 'no-group') {
        return !contact.group;
      }
      
      const groups = JSON.parse(localStorage.getItem('groups')) || [];
      const group = groups.find(g => g.id === contact.group);
      return group && group.name.toLowerCase() === filter;
    });
  }
  
  // SORT
  sortContactsArray(contacts, sort);
  
  // DISPLAY
  renderContacts(contacts);
  
  // EMPTY
  const emptyContacts = document.getElementById('emptyContacts');
  if (contacts.length === 0) {
    emptyContacts.style.display = 'flex';
  } else {
    emptyContacts.style.display = 'none';
  }
}

/**
 * Sort contacts
 */
function sortContacts() {
  const query = document.getElementById('contactSearch').value.toLowerCase().trim();
  const filter = document.getElementById('filterGroup').value;
  const sort = document.getElementById('sortContacts').value;
  
  let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  // SEARCH
  if (query) {
    contacts = contacts.filter(contact => {
      if (contact.type === 'personal') {
        return (
          (contact.firstName && contact.firstName.toLowerCase().includes(query)) ||
          (contact.lastName && contact.lastName.toLowerCase().includes(query)) ||
          (contact.email && contact.email.toLowerCase().includes(query)) ||
          (contact.phone && contact.phone.toLowerCase().includes(query))
        );
      } else {
        return (
          (contact.companyName && contact.companyName.toLowerCase().includes(query)) ||
          (contact.email && contact.email.toLowerCase().includes(query)) ||
          (contact.phone && contact.phone.toLowerCase().includes(query))
        );
      }
    });
  }
  
  // FILTER
  if (filter !== 'all') {
    contacts = contacts.filter(contact => {
      if (filter === 'no-group') {
        return !contact.group;
      }
      
      const groups = JSON.parse(localStorage.getItem('groups')) || [];
      const group = groups.find(g => g.id === contact.group);
      return group && group.name.toLowerCase() === filter;
    });
  }
  
  // SORT
  sortContactsArray(contacts, sort);
  
  // DISPLAY
  renderContacts(contacts);
}

/**
 * Sort an array of contacts
 * @param {Array} contacts - Array of contacts to sort
 * @param {string} sort - Sort type
 */
function sortContactsArray(contacts, sort) {
  switch (sort) {
    case 'name':
      contacts.sort((a, b) => {
        const nameA = a.type === 'personal' ? `${a.firstName} ${a.lastName}` : a.companyName;
        const nameB = b.type === 'personal' ? `${b.firstName} ${b.lastName}` : b.companyName;
        return nameA.localeCompare(nameB);
      });
      break;
    case 'name-desc':
      contacts.sort((a, b) => {
        const nameA = a.type === 'personal' ? `${a.firstName} ${a.lastName}` : a.companyName;
        const nameB = b.type === 'personal' ? `${b.firstName} ${b.lastName}` : b.companyName;
        return nameB.localeCompare(nameA);
      });
      break;
    case 'recent':
      contacts.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      break;
  }
}

// ===== GROUP MANAGEMENT =====
/**
 * Load and display groups
 */
function loadGroups() {
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  const groupsList = document.getElementById('groupsList');
  const emptyGroups = document.getElementById('emptyGroups');
  
  // FILTER
  const filterSelect = document.getElementById('filterGroup');
  filterSelect.innerHTML = `
    <option value="all">All groups</option>
    <option value="no-group">No group</option>
  `;
  
  groups.forEach(group => {
    const option = document.createElement('option');
    option.value = group.name.toLowerCase();
    option.textContent = group.name;
    filterSelect.appendChild(option);
  });
  
  // EMPTY
  if (groups.length === 0) {
    groupsList.innerHTML = '';
    emptyGroups.style.display = 'flex';
    return;
  }
  
  // DISPLAY
  emptyGroups.style.display = 'none';
  groupsList.innerHTML = '';
  
  groups.forEach(group => {
    const card = document.createElement('div');
    card.className = `group-card ${group.name.toLowerCase()}`;
    card.style.setProperty('--group-color', group.color);
    
    card.innerHTML = `
      <div class="group-info">
        <div class="group-color" style="background-color: ${group.color}"></div>
        <div>
          <h4 class="group-name">${escapeHtml(group.name)}</h4>
          <span class="group-count">${group.count} contact(s)</span>
        </div>
      </div>
      <div class="group-actions">
        <button class="btn small secondary edit-group" data-id="${group.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn small warning delete-group" data-id="${group.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    groupsList.appendChild(card);
  });
  
  // BUTTONS
  document.querySelectorAll('.edit-group').forEach(btn => {
    btn.addEventListener('click', () => {
      editGroup(btn.dataset.id);
    });
  });
  
  document.querySelectorAll('.delete-group').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmDeleteGroup(btn.dataset.id);
    });
  });
}

/**
 * Load groups into a select element
 * @param {string} selectId - ID of the select element
 */
function loadGroupsIntoSelect(selectId) {
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  const select = document.getElementById(selectId);
  
  select.innerHTML = '<option value="">No group</option>';
  
  groups.forEach(group => {
    const option = document.createElement('option');
    option.value = group.id;
    option.textContent = group.name;
    select.appendChild(option);
  });
}

/**
 * Apply a group preset
 * @param {Event} e - Click event
 */
function applyGroupPreset(e) {
  const btn = e.currentTarget;
  const name = btn.dataset.name;
  const color = btn.dataset.color;
  
  document.getElementById('groupName').value = name;
  document.getElementById('groupColor').value = color;
}

/**
 * Save a group
 */
function saveGroup() {
  const name = document.getElementById('groupName').value.trim();
  const color = document.getElementById('groupColor').value;
  
  if (!name) {
    showNotification('Please enter a group name', 'error');
    return;
  }
  
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  
  // CHECK
  const exists = groups.some(g => g.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    showNotification('This group name already exists', 'error');
    return;
  }
  
  // ADD
  const newGroup = {
    id: generateId(),
    name,
    color,
    count: 0
  };
  
  groups.push(newGroup);
  localStorage.setItem('groups', JSON.stringify(groups));
  
  // RESET
  document.getElementById('groupName').value = '';
  document.getElementById('groupColor').value = '#4361ee';
  
  // RELOAD
  loadGroups();
  
  // NOTIFY
  showNotification('Group added successfully', 'success');
}

/**
 * Edit a group
 * @param {string} groupId - ID of the group
 */
function editGroup(groupId) {
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  const group = groups.find(g => g.id === groupId);
  
  if (!group) return;
  
  // FILL
  document.getElementById('groupName').value = group.name;
  document.getElementById('groupColor').value = group.color;
  
  // SCROLL
  document.querySelector('.add-group-form').scrollIntoView({ behavior: 'smooth' });
  
  // BUTTON
  const addGroupBtn = document.getElementById('addGroupBtn');
  addGroupBtn.innerHTML = `<i class="fas fa-save"></i> Update`;
  addGroupBtn.dataset.action = 'updateGroup';
  addGroupBtn.dataset.id = groupId;
  
  // REPLACE
  addGroupBtn.removeEventListener('click', saveGroup);
  addGroupBtn.addEventListener('click', updateGroup, { once: true });
}

/**
 * Update a group
 */
function updateGroup() {
  const groupId = document.getElementById('addGroupBtn').dataset.id;
  const name = document.getElementById('groupName').value.trim();
  const color = document.getElementById('groupColor').value;
  
  if (!name) {
    showNotification('Please enter a group name', 'error');
    return;
  }
  
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  const index = groups.findIndex(g => g.id === groupId);
  
  if (index === -1) return;
  
  // CHECK
  const exists = groups.some(g => g.id !== groupId && g.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    showNotification('This group name already exists', 'error');
    return;
  }
  
  // UPDATE
  groups[index].name = name;
  groups[index].color = color;
  
  localStorage.setItem('groups', JSON.stringify(groups));
  
  // RESET
  document.getElementById('groupName').value = '';
  document.getElementById('groupColor').value = '#4361ee';
  
  // RESTORE
  const addGroupBtn = document.getElementById('addGroupBtn');
  addGroupBtn.innerHTML = `<i class="fas fa-plus"></i> Add this group`;
  delete addGroupBtn.dataset.action;
  delete addGroupBtn.dataset.id;
  
  // LISTENER
  addGroupBtn.removeEventListener('click', updateGroup);
  addGroupBtn.addEventListener('click', saveGroup);
  
  // RELOAD
  loadGroups();
  loadContacts(); // To update group colors/names in cards
  
  // NOTIFY
  showNotification('Group updated successfully', 'success');
}

/**
 * Confirm group deletion
 * @param {string} groupId - ID of the group
 */
function confirmDeleteGroup(groupId) {
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  const group = groups.find(g => g.id === groupId);
  
  if (!group) return;
  
  // SETUP
  const modal = document.getElementById('confirmModal');
  const title = document.getElementById('confirmTitle');
  const message = document.getElementById('confirmMessage');
  const confirmBtn = document.getElementById('confirmYesBtn');
  
  title.textContent = 'Delete group';
  message.textContent = `Are you sure you want to delete the group "${group.name}"? Contacts in this group will not be deleted.`;
  
  // ACTION
  confirmBtn.setAttribute('data-action', 'deleteGroup');
  confirmBtn.setAttribute('data-id', groupId);
  
  // SHOW
  modal.classList.add('active');
}

/**
 * Delete a group
 * @param {string} groupId - ID of the group
 */
function deleteGroup(groupId) {
  let groups = JSON.parse(localStorage.getItem('groups')) || [];
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  // FILTER
  groups = groups.filter(g => g.id !== groupId);
  
  // SAVE
  localStorage.setItem('groups', JSON.stringify(groups));
  
  // UPDATE
  let needUpdate = false;
  contacts.forEach(contact => {
    if (contact.group === groupId) {
      contact.group = '';
      needUpdate = true;
    }
  });
  
  if (needUpdate) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }
  
  // RELOAD
  loadGroups();
  loadContacts();
  
  // NOTIFY
  showNotification('Group deleted successfully', 'success');
}

/**
 * Update group counts
 */
function updateGroupCounts() {
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  
  // RESET
  groups.forEach(group => {
    group.count = 0;
  });
  
  // COUNT
  contacts.forEach(contact => {
    if (contact.group) {
      const groupIndex = groups.findIndex(g => g.id === contact.group);
      if (groupIndex !== -1) {
        groups[groupIndex].count++;
      }
    }
  });
  
  // SAVE
  localStorage.setItem('groups', JSON.stringify(groups));
}

// ===== CALENDAR MANAGEMENT =====
let currentDate = new Date();

/**
 * Initialize the calendar
 */
function initCalendar() {
  renderCalendar();
  loadEvents();
}

/**
 * Render the calendar for the current month
 */
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // HEADER
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
  
  // FIRST
  const firstDay = new Date(year, month, 1);
  // LAST
  const lastDay = new Date(year, month + 1, 0);
  
  // PREVIOUS
  let firstDayIndex = firstDay.getDay();
  if (firstDayIndex === 0) firstDayIndex = 7; // Start week on Monday
  firstDayIndex--;
  
  // DAYS
  const daysInMonth = lastDay.getDate();
  
  // PREV
  const prevLastDay = new Date(year, month, 0).getDate();
  
  // NEXT
  const lastDayIndex = lastDay.getDay();
  let nextDays = 7 - lastDayIndex;
  if (nextDays === 7) nextDays = 0;
  
  // GENERATE
  const calendarDays = document.getElementById('calendarDays');
  calendarDays.innerHTML = '';
  
  // PREV
  for (let i = firstDayIndex; i > 0; i--) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-date other-month';
    dayElement.textContent = prevLastDay - i + 1;
    calendarDays.appendChild(dayElement);
  }
  
  // TODAY
  const today = new Date();
  
  // CURRENT
  for (let i = 1; i <= daysInMonth; i++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-date current-month';
    dayElement.textContent = i;
    
    // TODAY
    if (
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayElement.classList.add('today');
    }
    
    // EVENTS
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const hasEvents = events.some(event => event.date === dateStr);
    
    if (hasEvents) {
      dayElement.classList.add('has-events');
    }
    
    // CLICK
    dayElement.addEventListener('click', () => {
      // CLEAR
      document.querySelectorAll('.calendar-date').forEach(day => {
        day.classList.remove('selected');
      });
      
      // SELECT
      dayElement.classList.add('selected');
      
      // LOAD
      loadEventsForDate(dateStr);
    });
    
    calendarDays.appendChild(dayElement);
  }
  
  // NEXT
  for (let i = 1; i <= nextDays; i++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-date other-month';
    dayElement.textContent = i;
    calendarDays.appendChild(dayElement);
  }
}

/**
 * Change the displayed month
 * @param {number} delta - Number of months to add/remove
 */
function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

/**
 * Load and display events
 */
function loadEvents() {
  const events = JSON.parse(localStorage.getItem('events')) || [];
  const eventsList = document.getElementById('eventsList');
  
  // FUTURE
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });
  
  // SORT
  futureEvents.sort((a, b) => {
    const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
    const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
    return dateA - dateB;
  });
  
  // LIMIT
  const nextEvents = futureEvents.slice(0, 5);
  
  // DISPLAY
  if (nextEvents.length === 0) {
    eventsList.innerHTML = '<div class="empty-state-mini">No upcoming events</div>';
    return;
  }
  
  eventsList.innerHTML = '';
  
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  nextEvents.forEach(event => {
    const contact = event.contactId ? contacts.find(c => c.id === event.contactId) : null;
    let contactName = 'No contact';
    
    if (contact) {
      contactName = contact.type === 'personal'
        ? `${contact.firstName} ${contact.lastName}`
        : contact.companyName;
    }
    
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    
    eventItem.innerHTML = `
      <div class="event-title">${escapeHtml(event.title)}</div>
      <div class="event-time">
        <i class="fas fa-calendar-day"></i> ${formatDate(event.date)}
        ${event.time ? `<i class="fas fa-clock"></i> ${event.time}` : ''}
      </div>
      <div class="event-contact">
        <i class="fas fa-user"></i> ${escapeHtml(contactName)}
      </div>
      <div class="event-actions">
        <button class="btn small secondary edit-event" data-id="${event.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn small warning delete-event" data-id="${event.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    eventsList.appendChild(eventItem);
  });
  
  // BUTTONS
  document.querySelectorAll('.edit-event').forEach(btn => {
    btn.addEventListener('click', () => {
      openEventModal(btn.dataset.id);
    });
  });
  
  document.querySelectorAll('.delete-event').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmDeleteEvent(btn.dataset.id);
    });
  });
}

/**
 * Load events for a specific date
 * @param {string} dateStr - Date in YYYY-MM-DD format
 */
function loadEventsForDate(dateStr) {
  const events = JSON.parse(localStorage.getItem('events')) || [];
  const eventsList = document.getElementById('eventsList');
  
  // FILTER
  const dateEvents = events.filter(event => event.date === dateStr);
  
  // SORT
  dateEvents.sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
  
  // DISPLAY
  if (dateEvents.length === 0) {
    eventsList.innerHTML = '<div class="empty-state-mini">No events for this date</div>';
    return;
  }
  
  eventsList.innerHTML = '';
  
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  dateEvents.forEach(event => {
    const contact = event.contactId ? contacts.find(c => c.id === event.contactId) : null;
    let contactName = 'No contact';
    
    if (contact) {
      contactName = contact.type === 'personal'
        ? `${contact.firstName} ${contact.lastName}`
        : contact.companyName;
    }
    
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    
    eventItem.innerHTML = `
      <div class="event-title">${escapeHtml(event.title)}</div>
      <div class="event-time">
        ${event.time ? `<i class="fas fa-clock"></i> ${event.time}` : ''}
        ${event.location ? `<i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}` : ''}
      </div>
      <div class="event-contact">
        <i class="fas fa-user"></i> ${escapeHtml(contactName)}
      </div>
      <div class="event-actions">
        <button class="btn small secondary edit-event" data-id="${event.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn small warning delete-event" data-id="${event.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    eventsList.appendChild(eventItem);
  });
  
  // BUTTONS
  document.querySelectorAll('.edit-event').forEach(btn => {
    btn.addEventListener('click', () => {
      openEventModal(btn.dataset.id);
    });
  });
  
  document.querySelectorAll('.delete-event').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmDeleteEvent(btn.dataset.id);
    });
  });
}

/**
 * Open the add/edit event modal
 * @param {string} eventId - ID of the event to edit (optional)
 */
function openEventModal(eventId = null) {
  const modal = document.getElementById('eventFormModal');
  const form = document.getElementById('eventForm');
  const modalTitle = modal.querySelector('.modal-header h2');
  
  // RESET
  form.reset();
  document.getElementById('eventId').value = '';
  
  // CONTACTS
  loadContactsIntoSelect('eventContact');
  
  if (eventId) {
    // EDIT
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const event = events.find(e => e.id === eventId);
    
    if (event) {
      document.getElementById('eventId').value = event.id;
      document.getElementById('eventTitle').value = event.title || '';
      document.getElementById('eventDate').value = event.date || '';
      document.getElementById('eventTime').value = event.time || '';
      document.getElementById('eventContact').value = event.contactId || '';
      document.getElementById('eventLocation').value = event.location || '';
      document.getElementById('eventDescription').value = event.description || '';
      
      modalTitle.textContent = 'Edit appointment';
    }
  } else {
    // ADD
    modalTitle.textContent = 'Add an appointment';
    
    // SELECTED
    const selectedDay = document.querySelector('.calendar-date.selected');
    if (selectedDay) {
      const day = selectedDay.textContent;
      const monthYear = document.getElementById('currentMonth').textContent.split(' ');
      const month = monthYear[0];
      const year = monthYear[1];
      
      const monthIndex = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ].indexOf(month);
      
      if (monthIndex !== -1) {
        const date = new Date(parseInt(year), monthIndex, parseInt(day));
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        document.getElementById('eventDate').value = formattedDate;
      }
    } else {
      // TODAY
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      document.getElementById('eventDate').value = formattedDate;
    }
  }
  
  // SHOW
  modal.classList.add('active');
}

/**
 * Load contacts into a select element
 * @param {string} selectId - ID of the select element
 */
function loadContactsIntoSelect(selectId) {
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  const select = document.getElementById(selectId);
  
  select.innerHTML = '<option value="">Select a contact</option>';
  
  contacts.forEach(contact => {
    const option = document.createElement('option');
    option.value = contact.id;
    
    if (contact.type === 'personal') {
      option.textContent = `${contact.firstName} ${contact.lastName}`;
    } else {
      option.textContent = contact.companyName;
    }
    
    select.appendChild(option);
  });
}

/**
 * Save an event (add or edit)
 * @param {Event} e - Submit event
 */
function saveEvent(e) {
  e.preventDefault();
  
  const eventId = document.getElementById('eventId').value;
  const title = document.getElementById('eventTitle').value.trim();
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;
  const contactId = document.getElementById('eventContact').value;
  const location = document.getElementById('eventLocation').value.trim();
  const description = document.getElementById('eventDescription').value.trim();
  
  if (!title || !date) {
    showNotification('Please fill all required fields', 'error');
    return;
  }
  
  // EVENTS
  const events = JSON.parse(localStorage.getItem('events')) || [];
  
  if (eventId) {
    // EDIT
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      events[index] = {
        ...events[index],
        title,
        date,
        time,
        contactId,
        location,
        description
      };
    }
  } else {
    // ADD
    const newEvent = {
      id: generateId(),
      title,
      date,
      time,
      contactId,
      location,
      description
    };
    
    events.push(newEvent);
  }
  
  // SAVE
  localStorage.setItem('events', JSON.stringify(events));
  
  // RELOAD
  renderCalendar();
  loadEvents();
  
  // CLOSE
  closeModal();
  
  // NOTIFY
  showNotification(eventId ? 'Appointment updated successfully' : 'Appointment added successfully', 'success');
  
  // STATS
  updateStats();
}

/**
 * Confirm event deletion
 * @param {string} eventId - ID of the event
 */
function confirmDeleteEvent(eventId) {
  const events = JSON.parse(localStorage.getItem('events')) || [];
  const event = events.find(e => e.id === eventId);
  
  if (!event) return;
  
  // SETUP
  const modal = document.getElementById('confirmModal');
  const title = document.getElementById('confirmTitle');
  const message = document.getElementById('confirmMessage');
  const confirmBtn = document.getElementById('confirmYesBtn');
  
  title.textContent = 'Delete appointment';
  message.textContent = `Are you sure you want to delete the appointment "${event.title}"? This action cannot be undone.`;
  
  // ACTION
  confirmBtn.setAttribute('data-action', 'deleteEvent');
  confirmBtn.setAttribute('data-id', eventId);
  
  // SHOW
  modal.classList.add('active');
}

/**
 * Delete an event
 * @param {string} eventId - ID of the event
 */
function deleteEvent(eventId) {
  let events = JSON.parse(localStorage.getItem('events')) || [];
  
  // FILTER
  events = events.filter(e => e.id !== eventId);
  
  // SAVE
  localStorage.setItem('events', JSON.stringify(events));
  
  // RELOAD
  renderCalendar();
  loadEvents();
  
  // NOTIFY
  showNotification('Appointment deleted successfully', 'success');
  
  // STATS
  updateStats();
}

// ===== MULTIPLE SELECTION MANAGEMENT =====
/**
 * Update the action bar based on selected contacts
 */
function toggleContactSelection() {
  const selectedCheckboxes = document.querySelectorAll('.contact-select:checked');
  const count = selectedCheckboxes.length;
  const actionBar = document.getElementById('contactActionBar');
  const selectedCount = document.getElementById('selectedCount');
  
  if (count > 0) {
    selectedCount.textContent = count;
    actionBar.classList.add('active');
  } else {
    actionBar.classList.remove('active');
  }
}

/**
 * Cancel contact selection
 */
function cancelSelection() {
  document.querySelectorAll('.contact-select:checked').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  document.getElementById('contactActionBar').classList.remove('active');
}

/**
 * Open dialog to change group for selected contacts
 */
function openChangeGroupDialog() {
  const selectedIds = Array.from(document.querySelectorAll('.contact-select:checked')).map(checkbox => checkbox.dataset.id);
  
  if (selectedIds.length === 0) return;
  
  // TODO: Create a modal for changing group
  // For this example, we'll use confirm/prompt
  
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  
  if (groups.length === 0) {
    showNotification('No groups available. Please create a group first.', 'error');
    return;
  }
  
  const groupOptions = groups.map((group, index) => `${index + 1}. ${group.name}`).join('\n');
  const choice = prompt(`Choose a group for the ${selectedIds.length} selected contacts:\n0. No group\n${groupOptions}`);
  
  if (choice === null) return;
  
  const choiceIndex = parseInt(choice.trim()) - 1;
  
  let groupId = '';
  if (choiceIndex >= 0 && choiceIndex < groups.length) {
    groupId = groups[choiceIndex].id;
  }
  
  changeContactsGroup(selectedIds, groupId);
}

/**
 * Change group for selected contacts
 * @param {Array} contactIds - Contact IDs
 * @param {string} groupId - Group ID (empty to remove from group)
 */
function changeContactsGroup(contactIds, groupId) {
  if (contactIds.length === 0) return;
  
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  // UPDATE
  contactIds.forEach(id => {
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      contacts[index].group = groupId;
    }
  });
  
  // SAVE
  localStorage.setItem('contacts', JSON.stringify(contacts));
  
  // COUNTS
  updateGroupCounts();
  
  // RELOAD
  loadContacts();
  
  // CANCEL
  cancelSelection();
  
  // NOTIFY
  const groups = JSON.parse(localStorage.getItem('groups')) || [];
  const group = groups.find(g => g.id === groupId);
  
  const message = group
    ? `${contactIds.length} contact(s) moved to group "${group.name}"`
    : `${contactIds.length} contact(s) removed from their group`;
  
  showNotification(message, 'success');
}

/**
 * Confirm deletion of selected contacts
 */
function confirmDeleteSelected() {
  const selectedIds = Array.from(document.querySelectorAll('.contact-select:checked')).map(checkbox => checkbox.dataset.id);
  
  if (selectedIds.length === 0) return;
  
  // SETUP
  const modal = document.getElementById('confirmModal');
  const title = document.getElementById('confirmTitle');
  const message = document.getElementById('confirmMessage');
  const confirmBtn = document.getElementById('confirmYesBtn');
  
  title.textContent = 'Delete contacts';
  message.textContent = `Are you sure you want to delete the ${selectedIds.length} selected contacts? This action cannot be undone.`;
  
  // ACTION
  confirmBtn.setAttribute('data-action', 'deleteSelected');
  confirmBtn.setAttribute('data-ids', JSON.stringify(selectedIds));
  
  // SHOW
  modal.classList.add('active');
}

/**
 * Delete selected contacts
 * @param {Array} contactIds - Contact IDs to delete
 */
function deleteSelectedContacts(contactIds) {
  if (contactIds.length === 0) return;
  
  let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  
  // FILTER
  contacts = contacts.filter(c => !contactIds.includes(c.id));
  
  // SAVE
  localStorage.setItem('contacts', JSON.stringify(contacts));
  
  // COUNTS
  updateGroupCounts();
  
  // RELOAD
  loadContacts();
  
  // CANCEL
  cancelSelection();
  
  // NOTIFY
  showNotification(`${contactIds.length} contact(s) deleted successfully`, 'success');
  
  // STATS
  updateStats();
}

// ===== MODALS =====
/**
 * Close all modals
 */
function closeModal() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
}

/**
 * Handle confirmation action
 */
function handleConfirmAction() {
  const action = document.getElementById('confirmYesBtn').getAttribute('data-action');
  
  switch (action) {
    case 'deleteContact':
      const contactId = document.getElementById('confirmYesBtn').getAttribute('data-id');
      deleteContact(contactId);
      break;
    case 'deleteGroup':
      const groupId = document.getElementById('confirmYesBtn').getAttribute('data-id');
      deleteGroup(groupId);
      break;
    case 'deleteEvent':
      const eventId = document.getElementById('confirmYesBtn').getAttribute('data-id');
      deleteEvent(eventId);
      break;
    case 'deleteSelected':
      const contactIdsStr = document.getElementById('confirmYesBtn').getAttribute('data-ids');
      const contactIds = JSON.parse(contactIdsStr);
      deleteSelectedContacts(contactIds);
      break;
  }
  
  closeModal();
}

// ===== NOTIFICATIONS =====
let notificationTimeout;

/**
 * Show a notification
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error)
 */
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notificationMessage');
  
  // MESSAGE
  notificationMessage.textContent = message;
  
  // TYPE
  notification.className = 'notification';
  notification.classList.add(type);
  
  // SHOW
  notification.classList.add('active');
  
  // CLEAR
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  
  // HIDE
  notificationTimeout = setTimeout(() => {
    hideNotification();
  }, 5000);
}

/**
 * Hide the notification
 */
function hideNotification() {
  const notification = document.getElementById('notification');
  notification.classList.remove('active');
  
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
}

// ===== STATISTICS =====
/**
 * Update statistics in the banner
 */
function updateStats() {
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  const events = JSON.parse(localStorage.getItem('events')) || [];
  
  // MONTHLY
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const newContacts = contacts.filter(contact => {
    const createdAt = new Date(contact.createdAt);
    return createdAt >= startOfMonth;
  }).length;
  
  // WEEKLY
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday of this week
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday of this week
  endOfWeek.setHours(23, 59, 59, 999);
  
  const weekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  }).length;
  
  // BIRTHDAYS
  const upcomingBirthdays = contacts
    .filter(contact => contact.birthday)
    .map(contact => {
      const birthDate = new Date(contact.birthday);
      const thisYearBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      // If birthday already passed this year, take next year's
      if (thisYearBirthday < now) {
        thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
      }
      
      let name;
      if (contact.type === 'personal') {
        name = `${contact.firstName} ${contact.lastName}`;
      } else {
        name = contact.companyName;
      }
      
      return {
        name,
        date: thisYearBirthday,
        formattedDate: `${String(birthDate.getMonth() + 1).padStart(2, '0')}/${String(birthDate.getDate()).padStart(2, '0')}`
      };
    })
    .sort((a, b) => a.date - b.date);
  
  // UPDATE
  const tickerItems = document.querySelectorAll('.ticker-item');
  
  // APPOINTMENTS
  tickerItems[0].querySelector('span').textContent = `${weekEvents} this week`;
  
  // BIRTHDAYS
  if (upcomingBirthdays.length > 0) {
    tickerItems[1].querySelector('span').textContent = `${upcomingBirthdays[0].name} (${upcomingBirthdays[0].formattedDate})`;
  } else {
    tickerItems[1].querySelector('span').textContent = 'None upcoming';
  }
  
  // NEW
  tickerItems[2].querySelector('span').textContent = `${newContacts} this month`;
  
  // TOTAL
  tickerItems[3].querySelector('span').textContent = contacts.length;
}