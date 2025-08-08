# Admin Dashboard

A simple and modern admin dashboard built with React, Material-UI, and JSON Server for managing users and products.

## 🚀 Features

- **User Management**: Add, edit, delete, and view users
- **Product Management**: Add, edit, delete, and view products
- **Modern UI**: Built with Material-UI components
- **Form Validation**: Comprehensive validation for all inputs
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

- **React 19** - Frontend framework
- **Material-UI** - UI component library
- **Hookstate** - State management
- **JSON Server** - Mock API server
- **React Router** - Navigation

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <(https://github.com/Saikrishnach4/atomic-loops-dashboard.git)>
cd al-dashboard
```

### 2. Install Dependencies
```bash
cd my-app
npm install
```

### 3. Start JSON Server (API)
Open a new terminal and run:
```bash

json-server --watch db.json --port 5000
```

### 4. Start React App
In another terminal, run:
```bash

npm start
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
al-dashboard/
├── db.json                 # JSON Server database
├── my-app/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js       # Main dashboard page
│   │   │   ├── UserManager.js     # User management
│   │   │   ├── ProductManager.js  # Product management
│   │   │   └── Sidebar.js         # Navigation sidebar
│   │   ├── utils/
│   │   │   └── atomicFetch.js     # API utility
│   │   └── App.js                 # Main app component
│   └── package.json
└── README.md
```

## 🎯 How to Use

### Dashboard
- View project overview and statistics
- Navigate between different sections

### User Manager
- **Add User**: Click "Add User" button
- **Edit User**: Click "Edit" button next to any user
- **Delete User**: Click "Delete" button next to any user
- **View Users**: All users are displayed in a table

**User Fields:**
- Name (required, 2-50 characters)
- Email (required, valid email format)
- Gender (required, dropdown)
- Category (required, dropdown)

### Product Manager
- **Add Product**: Click "Add Product" button
- **Edit Product**: Click "Edit" button next to any product
- **Delete Product**: Click "Delete" button next to any product
- **View Products**: All products are displayed in a table

**Product Fields:**
- Name (required, 2-100 characters)
- Price (required, positive number)
- Description (required, 10-500 characters)
- Category (required, dropdown)

## 🔧 API Endpoints

The app uses JSON Server running on `http://localhost:5000`:

### Users
- `GET /users` - Get all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Products
- `GET /products` - Get all products
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

## 🎨 Key Features Explained

### State Management (Hookstate)
- Used for managing user and product data
- Provides reactive state updates
- Simple API with `.get()` and `.set()` methods

### Form Validation
- Real-time validation for all form fields
- Email format validation
- Length restrictions for text fields
- Required field validation

### Error Handling
- User-friendly error messages
- Network error handling
- API error responses
- Graceful fallbacks

### atomicFetch Utility
- Centralized API handling
- Automatic headers and error handling
- Consistent response format
- Easy to extend for authentication

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to server" error**
- Make sure JSON Server is running on port 5000
- Check if the command `json-server --watch db.json --port 5000` is running

**2. "Module not found" errors**
- Run `npm install` in the my-app folder
- Make sure all dependencies are installed

**3. Port already in use**
- Change the port: `json-server --watch db.json --port 5001`
- Update API_BASE in components to match the new port

## 📝 Available Scripts

```bash
# Start the React app
npm start

# Build for production
npm run build

```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


