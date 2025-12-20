# 🍔 GIU Food Truck Platform

A comprehensive web-based food truck ordering and management system designed for campus environments. Built with Node.js, Express, PostgreSQL, and Bootstrap 3.

## 👥 Team Information
- **Team Name**: HDO
- **Team Members**:
  - **loaei mohamed** (ID: 16004639, Tutorial: T12)
  - **Omar ismail** (ID: 16005290, Tutorial: T09)
  - **Mohamed dawood** (ID: 16008342, Tutorial: T13)
  - **Mohamed hamada** (ID: 16003884, Tutorial: T06)

---

## 🎯 Project Overview
The GIU Food Truck Platform connects food truck owners with hungry customers. Truck owners can manage their menus and track orders in real-time, while customers can browse available trucks, place orders, and track their pickup status.

---

## ✨ Features

### For Customers
- **Browse Food Trucks**: View a list of all active food trucks on campus.
- **Menu Exploration**: View detailed truck menus with categories and pricing.
- **Shopping Cart**: Add multiple items to a cart, manage quantities, and see total costs.
- **Order Placement**: Securely place orders with custom pickup times.
- **Order Tracking**: Monitor the status of current orders and view historical orders.
- **Secure Authentication**: Register and login to maintain personal order history.

### For Truck Owners
- **Owner Dashboard**: High-level overview of truck status and recent orders.
- **Truck Management**: Toggle truck availability and order acceptance status.
- **Menu Management (CRUD)**:
  - Add new menu items with descriptions and prices.
  - Edit existing items (update price, status, or details).
  - Delete retired menu items.
  - View full menu inventory.
- **Real-time Order Management**:
  - View all incoming customer orders.
  - Filter orders by status (Pending, Preparing, Ready, Completed).
  - Update order status to notify customers.
  - Access detailed order breakdowns.

---

## 🛠 Technology Stack

### Frontend
- **Template Engine**: [Hogan.js (HJS)](http://twitter.github.io/hogan.js/)
- **Styling**: Bootstrap 3.4.1 (Vanilla CSS)
- **Logic**: JavaScript (ES6+) with **jQuery 2.2.0**
- **Communication**: AJAX (jQuery) for seamless data fetching

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: Session-based (express-session)
- **Utilities**: UUID for session tokens, Axios for internal requests

### Database
- **Engine**: PostgreSQL
- **Query Builder**: [Knex.js](https://knexjs.org/)
- **Schema Management**: Manual SQL scripts and Knex migrations

---

## 🗄 Database Design (ERD)

The system uses a relational schema under the `FoodTruck` schema name. For the full Entity Relationship Diagram (ERD) and Software Requirements Specification (SRS), please refer to the `Documentation/` folder.

### Database Tables Summary

| Table | Description | Primary Key | Foreign Keys |
| :--- | :--- | :--- | :--- |
| **Users** | Stores all accounts (customers and owners) | `userId` | - |
| **Trucks** | Truck profiles and current status | `truckId` | `ownerId` -> Users |
| **MenuItems** | Individual food/drink items | `itemId` | `truckId` -> Trucks |
| **Carts** | Persistent shopping cart items per user | `cartId` | `userId`, `itemId` |
| **Orders** | Placed order records | `orderId` | `userId`, `truckId` |
| **OrderItems** | Many-to-many relationship for order items | `orderItemId` | `orderId`, `itemId` |
| **Sessions** | Active user authentication sessions | `id` | `userId` |

---

## 🚀 Installation and Setup

### 1. Prerequisites
- **Node.js**: v14.x or higher
- **PostgreSQL**: v12.x or higher
- **Web Browser**: Chrome/Firefox/Edge

### 2. Environment Configuration
Create a `.env` file in the `Backend` directory:
```env
PORT=3000
PASSWORD=your_postgres_password
# Ensure DB settings in Backend/connectors/db.js match your environment
```

### 3. Database Setup
1. Open **pgAdmin4** or your preferred PSQL client.
2. Create a new database named `foodtruck_db`.
3. Execute the schema script: `Backend/connectors/scripts.sql`.
4. (Optional) Insert sample data: `Backend/connectors/seed.sql`.

### 4. Running the Application
```bash
# Navigate to the backend directory
cd Backend

# Install dependencies
npm install

# Start the development server
npm run server
```
Access the application at `http://localhost:3000`.

---

## 📡 API Endpoints Summary

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/v1/user` | Register a new user account |
| **POST** | `/api/v1/user/login` | Login and establish session |

### Private Endpoints (Require Authentication)
| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| **GET** | `/test` | Connectivity test(testing purposes) | Any User |
| **GET** | `/api/v1/users` | List all registered users(testing purposes) | Any User |
| **GET** | `/api/v1/trucks/view` | View all available trucks | Customer |
| **GET** | `/api/v1/menuItem/truck/:truckId` | View menu items for a specific truck | Customer |
| **GET** | `/api/v1/menuItem/truck/:truckId/category/:category` | Filter truck menu by category | Customer |
| **POST** | `/api/v1/cart/new` | Add item to shopping cart | Customer |
| **GET** | `/api/v1/cart/view` | View current cart items | Customer |
| **PUT** | `/api/v1/cart/edit/:cartId` | Update cart item quantity | Customer |
| **DELETE** | `/api/v1/cart/delete/:cartId` | Remove item from cart | Customer |
| **POST** | `/api/v1/order/new` | Place a new order | Customer |
| **GET** | `/api/v1/order/myOrders` | View user's order history | Customer |
| **GET** | `/api/v1/order/details/:orderId` | View specific order details | Customer |
| **GET** | `/api/v1/trucks/myTruck` | View owned truck details | Truck Owner |
| **PUT** | `/api/v1/trucks/updateOrderStatus`| Toggle truck availability | Truck Owner |
| **POST** | `/api/v1/menuItem/new` | Create a new menu item | Truck Owner |
| **GET** | `/api/v1/menuItem/view` | View all items for owner's truck | Truck Owner |
| **GET** | `/api/v1/menuItem/view/:itemId` | View specific menu item details | Truck Owner |
| **PUT** | `/api/v1/menuItem/edit/:itemId` | Update menu item details | Truck Owner |
| **DELETE** | `/api/v1/menuItem/delete/:itemId` | Remove a menu item | Truck Owner |
| **GET** | `/api/v1/order/truckOrders` | View incoming orders for truck | Truck Owner |
| **GET** | `/api/v1/order/truckOwner/:orderId` | View specific customer order details | Truck Owner |
| **PUT** | `/api/v1/order/updateStatus/:orderId`| Update order preparation status | Truck Owner |

---

## 🧪 Test Credentials

For testing purposes, you can use the following accounts (ensure `seed.sql` has been run):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `ahmed@example.com` | `$2b$10$hashedpassword1` |
| **Truck Owner** | `sarah@example.com` | `$2b$10$hashedpassword2` |
| **Truck Owner** | `khaled@example.com` | `$2b$10$hashedpassword3` |

*Note: Default password in seed scripts is often '123' unless specified otherwise during registration.*

---

## 📸 Screenshots

| Page Name | Screenshot |
| :--- | :--- |
| **Login Page** | `![Login](./Screenshots/Login%20page.png)` |
| **Registration** | `![Register](./Screenshots/Register%20page.png)` |
| **Customer dashboard** | `![Customer Dashboard](./Screenshots/Customer%20dashboard.png)` |
| **Browse Trucks (Customer)** | `![Trucks Page](./Screenshots/customer%20Trucks%20page.png)` |
| **Truck Menu (Customer)** | `![Customer Menu](./Screenshots/customer%20Truck%20menu.png)` |
| **Shopping Cart** | `![Cart](./Screenshots/Cart.png)` |
| **My Orders (Customer)** | `![Customer Orders](./Screenshots/customer%20orders%20page.png)` |
| **Owner Dashboard** | `![Owner Dashboard](./Screenshots/Truckowner%20dashboard.png)` |
| **Menu Management** | `![Manage Menu](./Screenshots/Truckowner%20truck%20menu.png)` |
| **Add Menu Item** | `![Add Item](./Screenshots/Truckowner%20add%20menu%20item.png)` |
| **Order Management (Owner)**| `![Truck Orders](./Screenshots/Truckowner%20orders%20page.png)` |

---

## 🤝 Contributors

| Name | Contributions |
| :--- | :--- |
| All members | Backend API, Database Schema, Authentication |
| All members | Customer Views, Shopping Cart Logic, Order Placement |
| All members | Truck Owner Dashboard, Menu Management, Order Status Updates |
| All members | Styling, Responsive Design, API Integration |

---

Developed for the **Software Engineering** course at **German International University (GIU)**.
