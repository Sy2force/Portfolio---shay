document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== APPLICATION STATE MANAGEMENT =====
    const AppState = {
        // Main data
        products: [],
        clients: [],
        invoices: [],
        // Current state
        currentInvoice: {
            id: null,
            number: '',
            date: '',
            dueDate: '',
            status: 'draft', // draft, sent, paid
            folder: 'all'
        },
        currentClient: null,
        // Dark mode
        darkMode: localStorage.getItem('darkMode') === 'true',
        // Configuration
        settings: {
            currency: '€',
            taxRate: 20,
            pricesIncludeTax: false
        },
        // Company data
        company: {
            name: '',
            address: '',
            email: '',
            phone: '',
            vat: '',
            siret: '',
            website: '',
            bankDetails: '',
            notes: '',
            logo: null
        }
    };

    // ===== APPLICATION INITIALIZATION =====
    function init() {
        setupEventListeners();
        loadSavedData();
        setupCurrentDate();
        generateInvoiceNumber();
        
        // Apply dark mode if enabled
        if (AppState.darkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Ensure invoice tab is active by default
        document.querySelector('.tab-btn[data-tab="facture"]').classList.add('active');
        document.getElementById('facture-section').classList.add('active');
    }

    // ===== SETUP EVENT LISTENERS =====
    function setupEventListeners() {
        // 1. Tab navigation
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', switchTab);
        });
        
        // 2. Main actions
        document.getElementById('newInvoiceBtn').addEventListener('click', InvoiceManager.createNewInvoice);
        document.getElementById('saveInvoiceBtn').addEventListener('click', InvoiceManager.saveInvoice);
        document.getElementById('loadInvoiceBtn').addEventListener('click', InvoiceManager.openInvoicesModal);
        document.getElementById('printInvoiceBtn').addEventListener('click', InvoiceManager.printInvoice);
        document.getElementById('exportPdfBtn').addEventListener('click', InvoiceManager.exportToPdf);
        document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
        
        // 3. Product management
        document.getElementById('addProductBtn').addEventListener('click', ProductManager.addProduct);
        document.getElementById('productSearch').addEventListener('input', ProductManager.searchProducts);
        
        // 4. Client management
        document.getElementById('saveClientBtn').addEventListener('click', ClientManager.saveClient);
        document.getElementById('clearClientBtn').addEventListener('click', ClientManager.clearClientForm);
        document.getElementById('newClientBtn').addEventListener('click', ClientManager.newClient);
        
        // 5. Company management
        document.getElementById('saveCompanyBtn').addEventListener('click', CompanyManager.saveCompany);
        
        // 6. Close notifications and modals
        document.querySelector('.close-notification').addEventListener('click', hideNotification);
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', closeModals);
        });
        
        // 7. Close modals when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                closeModals();
            }
        });
        
        // 8. Toolbar dropdown management
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        dropdownToggle.addEventListener('click', function() {
            const dropdown = this.closest('.dropdown');
            dropdown.classList.toggle('open');
        });
        
        // Close dropdown when clicking elsewhere
        window.addEventListener('click', function(event) {
            if (!event.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown').forEach(d => {
                    d.classList.remove('open');
                });
            }
        });
    }

    // ===== TAB SWITCHING =====
    function switchTab(event) {
        // Remove active class from all tabs and sections
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Add active class to clicked tab
        event.currentTarget.classList.add('active');
        
        // Activate corresponding section
        const tabId = event.currentTarget.getAttribute('data-tab');
        document.getElementById(tabId + '-section').classList.add('active');
        
        // Specific actions when changing tabs
        if (tabId === 'client') {
            ClientManager.updateClientsList();
        }
    }

    // ===== DARK MODE =====
    function toggleDarkMode() {
        AppState.darkMode = !AppState.darkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', AppState.darkMode);
        
        // Update icon
        const icon = document.querySelector('#darkModeToggle i');
        if (AppState.darkMode) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // ===== LOADING SAVED DATA =====
    function loadSavedData() {
        // Load clients
        const savedClients = localStorage.getItem('invoiceProClients');
        if (savedClients) {
            AppState.clients = JSON.parse(savedClients);
        }
        
        // Load invoices
        const savedInvoices = localStorage.getItem('invoiceProInvoices');
        if (savedInvoices) {
            AppState.invoices = JSON.parse(savedInvoices);
        }
        
        // Load company data
        const savedCompany = localStorage.getItem('invoiceProCompany');
        if (savedCompany) {
            AppState.company = JSON.parse(savedCompany);
            
            // Fill company form
            document.getElementById('companyName').value = AppState.company.name || '';
            document.getElementById('companyAddress').value = AppState.company.address || '';
            document.getElementById('companyEmail').value = AppState.company.email || '';
            document.getElementById('companyPhone').value = AppState.company.phone || '';
            document.getElementById('companyVat').value = AppState.company.vat || '';
            document.getElementById('companySiren').value = AppState.company.siret || '';
            document.getElementById('companyWeb').value = AppState.company.website || '';
            document.getElementById('companyBankDetails').value = AppState.company.bankDetails || '';
            document.getElementById('companyNotes').value = AppState.company.notes || '';
        }
        
        // Load settings
        const savedSettings = localStorage.getItem('invoiceProSettings');
        if (savedSettings) {
            AppState.settings = JSON.parse(savedSettings);
        }
    }

    // ===== CURRENT DATE SETUP =====
    function setupCurrentDate() {
        const today = new Date();
        const formattedDate = formatDate(today);
        
        document.getElementById('invoiceDate').value = formattedDate;
        
        // Default due date at 30 days
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 30);
        document.getElementById('dueDate').value = formatDate(dueDate);
    }

    // ===== NOTIFICATION DISPLAY =====
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notificationMessage');
        const notificationIcon = document.querySelector('.notification-icon');
        
        notificationMessage.textContent = message;
        notification.className = 'notification';
        
        if (type === 'error') {
            notification.classList.add('error');
            notificationIcon.className = 'notification-icon fas fa-exclamation-circle';
        } else {
            notificationIcon.className = 'notification-icon fas fa-check-circle';
        }
        
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(hideNotification, 3000);
    }

    // ===== HIDE NOTIFICATION =====
    function hideNotification() {
        const notification = document.getElementById('notification');
        notification.classList.remove('show');
    }

    // ===== CLOSE MODALS =====
    function closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // ===== DATE FORMATTING =====
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ===== CURRENCY FORMATTING =====
    function formatCurrency(amount) {
        return amount.toFixed(2) + ' ' + AppState.settings.currency;
    }

    // ===== INVOICE NUMBER GENERATION =====
    function generateInvoiceNumber() {
        // Simple format: INV-YYYYMMDD-XXX
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Find next available number
        let num = 1;
        if (AppState.invoices.length > 0) {
            // Extract existing numbers and find the highest
            const invoiceNumbers = AppState.invoices.map(invoice => {
                const parts = invoice.number.split('-');
                return parts.length === 3 ? parseInt(parts[2]) : 0;
            });
            
            num = Math.max(...invoiceNumbers) + 1;
        }
        
        // Format final number
        const formattedNum = String(num).padStart(3, '0');
        const invoiceNumber = `INV-${year}${month}${day}-${formattedNum}`;
        
        document.getElementById('invoiceNumber').value = invoiceNumber;
        AppState.currentInvoice.number = invoiceNumber;
    }

    // ===== PRODUCT MANAGER =====
    const ProductManager = {
        addProduct() {
            // Get form values
            const name = document.getElementById('productName').value.trim();
            const description = document.getElementById('productDescription').value.trim();
            const quantity = parseFloat(document.getElementById('productQuantity').value) || 0;
            const price = parseFloat(document.getElementById('productPrice').value) || 0;
            const taxRate = parseFloat(document.getElementById('productTax').value) || 0;
            const discountRate = parseFloat(document.getElementById('productDiscount').value) || 0;
            
            // Basic validation
            if (name === '') {
                showNotification('Please enter a product name', 'error');
                return;
            }
            
            if (quantity <= 0) {
                showNotification('Quantity must be greater than zero', 'error');
                return;
            }
            
            if (price <= 0) {
                showNotification('Price must be greater than zero', 'error');
                return;
            }
            
            // Amount calculations
            const discount = (price * discountRate) / 100;
            const priceAfterDiscount = price - discount;
            
            let priceExTax, priceIncTax;
            if (AppState.settings.pricesIncludeTax) {
                // If price already includes VAT
                priceIncTax = price;
                priceExTax = price / (1 + (taxRate / 100));
            } else {
                // If price is pre-tax
                priceExTax = price;
                priceIncTax = price * (1 + (taxRate / 100));
            }
            
            // Calculate total amounts
            const amountExTax = (priceExTax - discount) * quantity;
            const amountIncTax = (priceIncTax - (discount * (1 + (taxRate / 100)))) * quantity;
            
            // Create product object
            const product = {
                id: Date.now(), // Unique ID based on timestamp
                name,
                description,
                quantity,
                price,
                taxRate,
                discountRate,
                discount,
                amountExTax,
                amountIncTax
            };
            
            // Add to product list
            AppState.products.push(product);
            
            // Update display
            this.updateProductsTable();
            
            // Reset form
            this.resetProductForm();
            
            // Notification
            showNotification('Product added successfully');
        },
        
        updateProductsTable() {
            const tbody = document.getElementById('invoiceBody');
            tbody.innerHTML = '';
            
            let totalExTax = 0;
            let totalTax = 0;
            let totalIncTax = 0;
            
            if (AppState.products.length === 0) {
                // Display message if no products
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `<td colspan="9" style="text-align: center; padding: 1.5rem;">No products added</td>`;
                tbody.appendChild(emptyRow);
            } else {
                // Display each product
                AppState.products.forEach(product => {
                    totalExTax += product.amountExTax;
                    totalTax += (product.amountIncTax - product.amountExTax);
                    totalIncTax += product.amountIncTax;
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.name}</td>
                        <td>${product.description || '-'}</td>
                        <td>${product.quantity}</td>
                        <td>${formatCurrency(product.price)}</td>
                        <td>${product.taxRate}%</td>
                        <td>${product.discountRate > 0 ? product.discountRate + '%' : '-'}</td>
                        <td>${formatCurrency(product.amountExTax)}</td>
                        <td>${formatCurrency(product.amountIncTax)}</td>
                        <td>
                            <button class="delete-btn" data-id="${product.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    
                    tbody.appendChild(row);
                });
                
                // Add delete events
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = parseInt(this.getAttribute('data-id'));
                        ProductManager.deleteProduct(productId);
                    });
                });
            }
            
            // Update totals
            document.getElementById('totalAmountHT').textContent = formatCurrency(totalExTax);
            document.getElementById('totalTax').textContent = formatCurrency(totalTax);
            document.getElementById('totalAmountTTC').textContent = formatCurrency(totalIncTax);
        },
        
        deleteProduct(id) {
            // Filter out product to delete
            AppState.products = AppState.products.filter(product => product.id !== id);
            
            // Update display
            this.updateProductsTable();
            
            // Notification
            showNotification('Product deleted');
        },
        
        searchProducts() {
            const searchTerm = document.getElementById('productSearch').value.toLowerCase();
            const rows = document.querySelectorAll('#invoiceBody tr');
            
            // Simple search in name and description cells
            rows.forEach(row => {
                if (row.cells.length > 1) { // Ignore "No products" row
                    const productName = row.cells[0].textContent.toLowerCase();
                    const productDesc = row.cells[1].textContent.toLowerCase();
                    
                    const shouldShow = productName.includes(searchTerm) || 
                                      productDesc.includes(searchTerm);
                    
                    row.style.display = shouldShow ? '' : 'none';
                }
            });
        },
        
        resetProductForm() {
            // Reset all fields
            document.getElementById('productName').value = '';
            document.getElementById('productDescription').value = '';
            document.getElementById('productQuantity').value = '1';
            document.getElementById('productPrice').value = '0';
            document.getElementById('productTax').value = AppState.settings.taxRate.toString();
            document.getElementById('productDiscount').value = '0';
            
            // Focus on first field
            document.getElementById('productName').focus();
        }
    };

    // ===== INVOICE MANAGER =====
    const InvoiceManager = {
        createNewInvoice() {
            // Confirmation if products already exist
            if (AppState.products.length > 0) {
                if (!confirm('Create a new invoice? Unsaved data will be lost.')) {
                    return;
                }
            }
            
            // Reset state
            AppState.products = [];
            AppState.currentInvoice = {
                id: null,
                number: '',
                date: '',
                dueDate: '',
                status: 'draft',
                folder: 'all'
            };
            
            // Generate new number
            generateInvoiceNumber();
            
            // Reset dates
            setupCurrentDate();
            
            // Update display
            ProductManager.updateProductsTable();
            
            // Notification
            showNotification('New invoice created');
        },
        
        saveInvoice() {
            // Check that there are products
            if (AppState.products.length === 0) {
                showNotification('Add at least one product before saving', 'error');
                return;
            }
            
            // Get invoice details
            const invoiceNumber = document.getElementById('invoiceNumber').value;
            const invoiceDate = document.getElementById('invoiceDate').value;
            const dueDate = document.getElementById('dueDate').value;
            
            // Calculate totals
            let totalExTax = 0;
            let totalTax = 0;
            let totalIncTax = 0;
            
            AppState.products.forEach(product => {
                totalExTax += product.amountExTax;
                totalTax += (product.amountIncTax - product.amountExTax);
                totalIncTax += product.amountIncTax;
            });
            
            // Create invoice object
            const invoice = {
                id: AppState.currentInvoice.id || Date.now(),
                number: invoiceNumber,
                date: invoiceDate,
                dueDate: dueDate,
                client: AppState.currentClient,
                products: [...AppState.products],
                totalExTax,
                totalTax,
                totalIncTax,
                status: AppState.currentInvoice.status || 'draft',
                folder: AppState.currentInvoice.folder || 'all',
                createdAt: new Date().toISOString()
            };
            
            // Check if it's an update or a new invoice
            const existingIndex = AppState.invoices.findIndex(inv => inv.id === invoice.id);
            
            if (existingIndex !== -1) {
                // Update
                AppState.invoices[existingIndex] = invoice;
            } else {
                // New invoice
                AppState.invoices.push(invoice);
            }
            
            // Save to localStorage
            localStorage.setItem('invoiceProInvoices', JSON.stringify(AppState.invoices));
            
            // Update current state
            AppState.currentInvoice = {
                id: invoice.id,
                number: invoice.number,
                date: invoice.date,
                dueDate: invoice.dueDate,
                status: invoice.status,
                folder: invoice.folder
            };
            
            // Notification
            showNotification('Invoice saved successfully');
        },
        
        openInvoicesModal() {
            // Update invoice list in modal
            this.updateInvoicesList();
            
            // Display modal
            document.getElementById('invoicesModal').style.display = 'block';
        },
        
        updateInvoicesList() {
            const invoicesList = document.getElementById('savedInvoicesList');
            
            if (!invoicesList) return;
            
            // Clear list
            invoicesList.innerHTML = '';
            
            if (AppState.invoices.length === 0) {
                invoicesList.innerHTML = '<p class="empty-list">No saved invoices</p>';
                return;
            }
            
            // Sort by creation date (most recent first)
            const sortedInvoices = [...AppState.invoices].sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
            // Create invoice list
            sortedInvoices.forEach(invoice => {
                const invoiceCard = document.createElement('div');
                invoiceCard.className = 'document-card';
                
                // Format dates
                const invoiceDate = new Date(invoice.date);
                const formattedDate = invoiceDate.toLocaleDateString();
                
                // Get client name
                let clientName = 'Client not specified';
                if (invoice.client) {
                    clientName = invoice.client.name;
                }
                
                // Determine status
                let statusClass = 'status-draft';
                let statusText = 'Draft';
                
                if (invoice.status === 'sent') {
                    statusClass = 'status-sent';
                    statusText = 'Sent';
                } else if (invoice.status === 'paid') {
                    statusClass = 'status-paid';
                    statusText = 'Paid';
                }
                
                invoiceCard.innerHTML = `
                    <div class="document-header">
                        <h4>${invoice.number}</h4>
                        <span class="document-date">${formattedDate}</span>
                    </div>
                    <div class="document-body">
                        <p class="document-client">${clientName}</p>
                        <p class="document-amount">${formatCurrency(invoice.totalIncTax)}</p>
                    </div>
                    <div class="document-footer">
                        <span class="document-status ${statusClass}">${statusText}</span>
                        <button class="document-load-btn" data-id="${invoice.id}">
                            <i class="fas fa-file-import"></i> Load
                        </button>
                    </div>
                `;
                
                invoicesList.appendChild(invoiceCard);
            });
            
            // Add event listeners to load invoices
            document.querySelectorAll('.document-load-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const invoiceId = parseInt(this.getAttribute('data-id'));
                    InvoiceManager.loadInvoice(invoiceId);
                    closeModals();
                });
            });
        },
        
        loadInvoice(id) {
            // Find invoice
            const invoice = AppState.invoices.find(inv => inv.id === id);
            
            if (!invoice) {
                showNotification('Invoice not found', 'error');
                return;
            }
            
            // Load details
            document.getElementById('invoiceNumber').value = invoice.number;
            document.getElementById('invoiceDate').value = invoice.date;
            document.getElementById('dueDate').value = invoice.dueDate;
            
            // Load products
            AppState.products = [...invoice.products];
            
            // Load client
            AppState.currentClient = invoice.client;
            
            // If client tab is displayed, update client form
            if (invoice.client) {
                document.getElementById('clientName').value = invoice.client.name || '';
                document.getElementById('clientContact').value = invoice.client.contact || '';
                document.getElementById('clientAddress').value = invoice.client.address || '';
                document.getElementById('clientEmail').value = invoice.client.email || '';
                document.getElementById('clientPhone').value = invoice.client.phone || '';
                document.getElementById('clientVat').value = invoice.client.vat || '';
            }
            
            // Update current state
            AppState.currentInvoice = {
                id: invoice.id,
                number: invoice.number,
                date: invoice.date,
                dueDate: invoice.dueDate,
                status: invoice.status,
                folder: invoice.folder
            };
            
            // Update display
            ProductManager.updateProductsTable();
            
            // Notification
            showNotification('Invoice loaded successfully');
        },
        
        printInvoice() {
            // Check that there are products
            if (AppState.products.length === 0) {
                showNotification('Add at least one product before printing', 'error');
                return;
            }
            
            // Simple page printing
            window.print();
        },
        
        exportToPdf() {
            // Check that there are products
            if (AppState.products.length === 0) {
                showNotification('Add at least one product before exporting', 'error');
                return;
            }
            
            // Indicates that functionality will be implemented later
            showNotification('PDF export under development');
        }
    };

    // ===== CLIENT MANAGER =====
    const ClientManager = {
        saveClient() {
            // Get form values
            const name = document.getElementById('clientName').value.trim();
            const contact = document.getElementById('clientContact').value.trim();
            const address = document.getElementById('clientAddress').value.trim();
            const email = document.getElementById('clientEmail').value.trim();
            const phone = document.getElementById('clientPhone').value.trim();
            const vat = document.getElementById('clientVat').value.trim();
            
            // Basic validation
            if (name === '') {
                showNotification('Please enter a client name', 'error');
                return;
            }
            
            // Create client object
            const client = {
                id: AppState.currentClient ? AppState.currentClient.id : Date.now(),
                name,
                contact,
                address,
                email,
                phone,
                vat,
                updatedAt: new Date().toISOString()
            };
            
            // Check if it's an update or a new client
            const existingIndex = AppState.clients.findIndex(c => c.id === client.id);
            
            if (existingIndex !== -1) {
                // Update
                AppState.clients[existingIndex] = client;
                showNotification('Client updated successfully');
            } else {
                // New client
                AppState.clients.push(client);
                showNotification('Client added successfully');
            }
            
            // Update current state
            AppState.currentClient = client;
            
            // Save to localStorage
            localStorage.setItem('invoiceProClients', JSON.stringify(AppState.clients));
            
            // Update display
            this.updateClientsList();
        },
        
        clearClientForm() {
            // Reset fields
            document.getElementById('clientName').value = '';
            document.getElementById('clientContact').value = '';
            document.getElementById('clientAddress').value = '';
            document.getElementById('clientEmail').value = '';
            document.getElementById('clientPhone').value = '';
            document.getElementById('clientVat').value = '';
            
            // Reset current state
            AppState.currentClient = null;
            
            // Focus on first field
            document.getElementById('clientName').focus();
            
            // Notification
            showNotification('Client form cleared');
        },
        
        newClient() {
            // Simply clear form and focus on name
            this.clearClientForm();
        },
        
        updateClientsList() {
            const clientsList = document.getElementById('clientsList');
            
            if (!clientsList) return;
            
            // Clear list
            clientsList.innerHTML = '';
            
            if (AppState.clients.length === 0) {
                clientsList.innerHTML = '<p class="empty-list">No clients registered</p>';
                return;
            }
            
            // Sort by name
            const sortedClients = [...AppState.clients].sort((a, b) => 
                a.name.localeCompare(b.name)
            );
            
            // Create client cards
            sortedClients.forEach(client => {
                const clientCard = document.createElement('div');
                clientCard.className = 'client-card';
                
                // Mark as active if it's the current client
                if (AppState.currentClient && AppState.currentClient.id === client.id) {
                    clientCard.classList.add('active');
                }
                
                clientCard.innerHTML = `
                    <div class="client-name">${client.name}</div>
                    <div class="client-info">
                        ${client.contact ? `<div>${client.contact}</div>` : ''}
                        ${client.email ? `<div>${client.email}</div>` : ''}
                        ${client.phone ? `<div>${client.phone}</div>` : ''}
                    </div>
                `;
                
                // Click event
                clientCard.addEventListener('click', () => {
                    this.loadClient(client);
                });
                
                clientsList.appendChild(clientCard);
            });
        },
        
        loadClient(client) {
            // Fill form
            document.getElementById('clientName').value = client.name;
            document.getElementById('clientContact').value = client.contact || '';
            document.getElementById('clientAddress').value = client.address || '';
            document.getElementById('clientEmail').value = client.email || '';
            document.getElementById('clientPhone').value = client.phone || '';
            document.getElementById('clientVat').value = client.vat || '';
            
            // Update current state
            AppState.currentClient = client;
            
            // Update display
            this.updateClientsList();
            
            // Notification
            showNotification('Client loaded successfully');
        }
    };

    // ===== COMPANY MANAGER =====
    const CompanyManager = {
        saveCompany() {
            // Get form values
            const name = document.getElementById('companyName').value.trim();
            const address = document.getElementById('companyAddress').value.trim();
            const email = document.getElementById('companyEmail').value.trim();
            const phone = document.getElementById('companyPhone').value.trim();
            const vat = document.getElementById('companyVat').value.trim();
            const siret = document.getElementById('companySiren').value.trim();
            const website = document.getElementById('companyWeb').value.trim();
            const bankDetails = document.getElementById('companyBankDetails').value.trim();
            const notes = document.getElementById('companyNotes').value.trim();
            
            // Basic validation
            if (name === '') {
                showNotification('Please enter your company name', 'error');
                return;
            }
            
            // Update company object
            AppState.company = {
                name,
                address,
                email,
                phone,
                vat,
                siret,
                website,
                bankDetails,
                notes,
                logo: AppState.company.logo // Keep existing logo
            };
            
            // Save to localStorage
            localStorage.setItem('invoiceProCompany', JSON.stringify(AppState.company));
            
            // Notification
            showNotification('Company information saved');
        }
    };

    // Initialize application on load
    init();
});