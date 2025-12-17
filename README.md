# 🍔 GIU Food Truck Platform

A comprehensive web-based food truck ordering and management system built with Node.js, Express, PostgreSQL, and Bootstrap 3.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Pages & Routes](#pages--routes)

## 🎯 Overview

The GIU Food Truck Platform is a full-stack web application that connects food truck owners with customers. Truck owners can manage their menus, track orders, and update their availability, while customers can browse available trucks, place orders, and track their order status.

## ✨ Features

### For Customers
- **Browse Food Trucks**: View all available food trucks on campus
- **Menu Browsing**: Explore truck menus with categories and pricing
- **Shopping Cart**: Add items to cart and manage quantities
- **Order Placement**: Place orders with scheduled pickup times
- **Order Tracking**: View order history and current order status
- **User Authentication**: Secure login and registration

### For Truck Owners
- **Owner Dashboard**: Overview of truck status, orders, and statistics
- **Menu Management**: 
  - Add new menu items
  - Edit existing items (name, category, description, price, status)
  - Delete menu items
  - View all menu items in a table
- **Order Management**:
  - View all incoming orders
  - Filter orders by status (Pending, Preparing, Ready, Completed, Cancelled)
  - View detailed order information
  - Update order status
- **Truck Status**: Toggle truck availability for orders

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Knex.js
- **Session Management**: express-session with PostgreSQL store
- **Environment Variables**: dotenv

### Frontend
- **Template Engine**: Hogan.js (HJS)
- **CSS Framework**: Bootstrap 3.4.1
- **JavaScript**: jQuery 2.2.0
- **AJAX**: jQuery AJAX for API calls

### Development Tools
- **Process Manager**: Nodemon (for development)
- **Package Manager**: npm

## 📁 Project Structure

```
HDO-software-engineering-project/
├── Backend/
│   ├── connectors/
│   │   └── db.js                 # Database connection
│   ├── middleware/
│   │   └── auth.js                # Authentication middleware
│   ├── routes/
│   │   ├── public/
│   │   │   ├── api.js             # Public API endpoints
│   │   │   └── view.js            # Public view routes
│   │   └── private/
│   │       ├── api.js             # Private API endpoints
│   │       └── view.js            # Private view routes
│   ├── utils/
│   │   └── session.js             # Session utilities
│   ├── views/
│   │   ├── login.hjs              # Login page
│   │   ├── register.hjs           # Registration page
│   │   ├── customerHomepage.hjs   # Customer dashboard
│   │   ├── ownerDashboard.hjs     # Truck owner dashboard
│   │   ├── trucks.hjs             # Browse trucks page
│   │   ├── truckMenu.hjs          # Truck menu page
│   │   ├── cart.hjs               # Shopping cart page
│   │   ├── myOrders.hjs           # Customer orders page
│   │   ├── menuItems.hjs          # Menu items management
│   │   ├── addMenuItem.hjs        # Add menu item page
│   │   └── truckOrders.hjs        # Truck orders management
│   ├── public/
│   │   ├── src/
│   │   │   ├── login.js
│   │   │   ├── register.js
│   │   │   ├── trucks.js
│   │   │   ├── truckMenu.js
│   │   │   ├── cart.js
│   │   │   ├── myOrders.js
│   │   │   ├── ownerDashboard.js
│   │   │   ├── menuItems.js
│   │   │   ├── addMenuItem.js
│   │   │   └── truckOrders.js
│   │   ├── styles/
│   │   │   ├── bootstrap.min.css
│   │   │   └── style.css
│   │   └── js/
│   │       ├── jquery-2.2.0.min.js
│   │       └── bootstrap.min.js
│   ├── server.js                  # Main server file
│   ├── package.json
│   └── .env                       # Environment variables
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (comes with Node.js)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HDO-software-engineering-project
   ```

2. **Install dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=foodtruck_db
   SESSION_SECRET=your_secret_key_here
   ```

## 🗄 Database Setup

### Database Schema

The application uses the following tables in the `FoodTruck` schema:

- **Users**: User accounts (customers and truck owners)
- **Trucks**: Food truck information
- **MenuItems**: Menu items for each truck
- **Carts**: Shopping cart items
- **Orders**: Customer orders
- **OrderItems**: Items in each order
- **Sessions**: User session data

### Create Database

```sql
CREATE DATABASE foodtruck_db;
```

Run the database migration scripts to create the schema and tables (scripts should be provided separately).

## ▶️ Running the Application

### Development Mode
```bash
cd Backend
npm run dev
```

### Production Mode
```bash
cd Backend
npm start
```

The application will be available at `http://localhost:3001`

## 📡 API Documentation

### Public Endpoints

#### Authentication
- `POST /api/v1/register` - Register new user
- `POST /api/v1/login` - User login
- `POST /api/v1/logout` - User logout

### Private Endpoints (Require Authentication)

#### Menu Items (Truck Owner)
- `GET /api/v1/menuItem/view` - Get all menu items for owner's truck
- `GET /api/v1/menuItem/view/:itemId` - Get specific menu item
- `POST /api/v1/menuItem/new` - Create new menu item
- `PUT /api/v1/menuItem/edit/:itemId` - Update menu item
- `DELETE /api/v1/menuItem/delete/:itemId` - Delete menu item

#### Menu Items (Customer)
- `GET /api/v1/menuItem/truck/:truckId` - Get available menu items for a truck
- `GET /api/v1/menuItem/truck/:truckId/category/:category` - Filter by category

#### Trucks
- `GET /api/v1/trucks/view` - Get all available trucks (Customer)
- `GET /api/v1/trucks/myTruck` - Get owner's truck info (Truck Owner)
- `PUT /api/v1/trucks/updateOrderStatus` - Update truck availability (Truck Owner)

#### Cart (Customer)
- `GET /api/v1/cart/view` - View cart items
- `POST /api/v1/cart/new` - Add item to cart
- `PUT /api/v1/cart/edit/:cartId` - Update cart item quantity
- `DELETE /api/v1/cart/delete/:cartId` - Remove item from cart

#### Orders (Customer)
- `GET /api/v1/order/myOrders` - Get customer's orders
- `GET /api/v1/order/details/:orderId` - Get order details
- `POST /api/v1/order/new` - Place new order

#### Orders (Truck Owner)
- `GET /api/v1/order/truckOrders` - Get all orders for truck
- `GET /api/v1/order/truckOwner/:orderId` - Get order details
- `PUT /api/v1/order/updateStatus/:orderId` - Update order status

## 👥 User Roles

### Customer
- Browse and search food trucks
- View truck menus
- Add items to cart
- Place orders
- Track order status

### Truck Owner
- Manage truck availability
- Manage menu items (CRUD operations)
- View and manage incoming orders
- Update order status
- View order statistics

## 🗺 Pages & Routes

### Public Routes
- `/` - Login page
- `/register` - Registration page

### Customer Routes (Private)
- `/dashboard` - Customer homepage
- `/trucks` - Browse food trucks
- `/truckMenu/:truckId` - View truck menu
- `/cart` - Shopping cart
- `/orders` - My orders

### Truck Owner Routes (Private)
- `/dashboard` - Owner dashboard
- `/menuItems` - Menu items management
- `/addMenuItem` - Add new menu item
- `/truckOrders` - Orders management

## 🎨 Design Features

- **Gradient Backgrounds**: Modern gradient backgrounds for visual appeal
- **Color-Coded Status Badges**: Easy-to-identify order and item statuses
- **Responsive Design**: Works on desktop and mobile devices
- **Modal Dialogs**: For viewing details and editing items
- **Real-time Updates**: AJAX-based updates without page refresh
- **Loading States**: Visual feedback during data loading
- **Empty States**: Friendly messages when no data is available
- **Form Validation**: Client-side and server-side validation

## 🔒 Security Features

- Session-based authentication
- Role-based access control
- Protected API endpoints
- SQL injection prevention (via Knex.js parameterized queries)
- Password hashing (should be implemented)
- CSRF protection (recommended to add)

## 🧪 Testing

To test the application:

1. Register as a customer and truck owner (use different emails)
2. As truck owner: Add menu items and manage truck status
3. As customer: Browse trucks, add items to cart, place orders
4. As truck owner: View orders and update their status

## 📝 Future Enhancements

- Password hashing with bcrypt
- Email notifications for order updates
- Real-time order tracking with WebSockets
- Payment integration
- Truck location tracking
- Customer reviews and ratings
- Advanced search and filtering
- Mobile app version
- Admin dashboard for platform management

## 👨‍💻 Development

### Code Style
- Use ES6+ features
- Follow consistent naming conventions
- Comment complex logic
- Use async/await for asynchronous operations

### Adding New Features
1. Create API endpoint in `routes/private/api.js` or `routes/public/api.js`
2. Create view route in `routes/private/view.js` or `routes/public/view.js`
3. Create HJS template in `views/`
4. Create client-side JavaScript in `public/src/`
5. Update navigation links as needed

## 📄 License

This project is developed for educational purposes as part of the GIU Software Engineering course.

## 🤝 Contributors

- Development Team: [Your Names Here]
- Course: Software Engineering
- Institution: German International University (GIU)

---

**Note**: This is a student project for educational purposes. For production use, additional security measures, testing, and optimization would be required.
