const db = require('../../connectors/db');
// check function getUser in milestone 3 description and session.js
const {getUser} = require('../../utils/session');
// getUser takes only one input of req 
// await getUser(req);
const knex = require('../../connectors/db');

// Helper function to format dates to ISO 8601 format
function formatDatesToISO(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const dateFields = ['createdAt', 'scheduledPickupTime', 'estimatedEarliestPickup', 'birthDate', 'expiresAt'];
  const formatted = { ...obj };
  
  dateFields.forEach(field => {
    if (formatted[field] && formatted[field] instanceof Date) {
      formatted[field] = formatted[field].toISOString();
    } else if (formatted[field] && typeof formatted[field] === 'string') {
      // Try to parse and reformat if it's a date string
      const date = new Date(formatted[field]);
      if (!isNaN(date.getTime())) {
        formatted[field] = date.toISOString();
      }
    }
  });
  
  return formatted;
}

// Helper function to ensure price fields are numbers
function ensureNumericPrices(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const priceFields = ['price', 'totalPrice'];
  const formatted = { ...obj };
  
  priceFields.forEach(field => {
    if (formatted[field] !== undefined && formatted[field] !== null) {
      const num = parseFloat(formatted[field]);
      if (!isNaN(num)) {
        formatted[field] = num;
      }
    }
  });
  
  return formatted;
}

// Helper function to format array of objects
function formatResponseData(data) {
  if (Array.isArray(data)) {
    return data.map(item => ensureNumericPrices(formatDatesToISO(item)));
  }
  return ensureNumericPrices(formatDatesToISO(data));
} 


function handlePrivateBackendApi(app) {
  
  // insert all your private server side end points here
  app.get('/test' , async (req,res) => {
     try{
      return res.status(200).send("succesful connection");
     }catch(err){
      console.log("error message", err.message);
      return res.status(400).send(err.message)
     }    
  });

  app.get('/api/v1/users', async function(req, res) {
    try {
      // Query all users from DB
      const users = await  db.withSchema('FoodTruck')
                        .select('*')
                        .from('Users');

      return res.status(200).json(users);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send('Could not fetch users');
    }
  });


    
    app.post('/api/v1/menuItem/new', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can create menu items' });
        }

        const { truckId, name, description, price, category } = req.body;

        // Verify that the truck belongs to the logged-in truck owner
        if (user.truckId && user.truckId !== truckId) {
          return res.status(403).json({ error: 'Forbidden - You can only add items to your own truck' });
        }

        const newItem = await knex('FoodTruck.MenuItems')
          .insert({truckId: user.truckId || truckId, name, description, price, category})
          .returning('*');

        return res.status(201).json({ success: true, data: formatResponseData(newItem[0]) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });


    app.get('/api/v1/menuItem/view', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can view their menu items' });
        }

        // Get menu items for the truck owner's truck
        const truckId = user.truckId;
        if (!truckId) {
          return res.status(404).json({ error: 'No truck found for this owner' });
        }

        const items = await knex('FoodTruck.MenuItems')
          .where({ truckId });

        return res.status(200).json({ success: true, data: formatResponseData(items) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });


    app.get('/api/v1/menuItem/view/:itemId', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can view menu items' });
        }

        const itemId = req.params.itemId;

        const item = await knex('FoodTruck.MenuItems')
          .where({ itemId })
          .first();

        if (!item) {
          return res.status(404).json({ error: 'Menu item not found' });
        }

        // Verify that the item belongs to the truck owner's truck
        if (user.truckId && item.truckId !== user.truckId) {
          return res.status(403).json({ error: 'Forbidden - You can only view items from your own truck' });
        }

        return res.status(200).json({ success: true, data: formatResponseData(item) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });


    app.put('/api/v1/menuItem/edit/:itemId', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can edit menu items' });
        }

        const itemId = req.params.itemId;
        const { name, description, price, category, status } = req.body;

        // Verify that the item belongs to the truck owner's truck
        const item = await knex('FoodTruck.MenuItems')
          .where({ itemId })
          .first();

        if (!item) {
          return res.status(404).json({ error: 'Menu item not found' });
        }

        if (user.truckId && item.truckId !== user.truckId) {
          return res.status(403).json({ error: 'Forbidden - You can only edit items from your own truck' });
        }

        const updated = await knex('FoodTruck.MenuItems')
          .where({ itemId })
          .update({name,description,price,category,status})
          .returning('*');

        return res.status(200).json({ success: true, data: formatResponseData(updated[0]) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });


    // Delete menu item
    app.delete('/api/v1/menuItem/delete/:itemId', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can delete menu items' });
        }

        const itemId = req.params.itemId;

        // Verify that the item belongs to the truck owner's truck
        const item = await knex('FoodTruck.MenuItems')
          .where({ itemId })
          .first();

        if (!item) {
          return res.status(404).json({ error: 'Menu item not found' });
        }

        if (user.truckId && item.truckId !== user.truckId) {
          return res.status(403).json({ error: 'Forbidden - You can only delete items from your own truck' });
        }

        await knex('FoodTruck.MenuItems')
          .where({ itemId })
          .del();

        return res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });


    app.get('/api/v1/menuItem/truck/:truckId', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can view truck menus' });
        }

        const truckId = req.params.truckId;

        const items = await knex('FoodTruck.MenuItems')
          .where({ truckId, status: 'available' });

        return res.status(200).json({ success: true, data: formatResponseData(items) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/v1/menuItem/truck/:truckId/category/:category', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can search menu by category' });
        }

        const { truckId, category } = req.params;

        const items = await knex('FoodTruck.MenuItems')
          .where({ truckId, category, status: 'available' });

        return res.status(200).json({ success: true, data: formatResponseData(items) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // ==================== Truck Management ====================

    // GET /api/v1/trucks/view - Customer: View all available trucks
    app.get('/api/v1/trucks/view', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can view available trucks' });
        }

        const trucks = await knex('FoodTruck.Trucks')
          .where({ truckStatus: 'available', orderStatus: 'available' })
          .select('*');

        return res.status(200).json({ success: true, data: formatResponseData(trucks) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // GET /api/v1/trucks/myTruck - Truck Owner: View my truck info
    app.get('/api/v1/trucks/myTruck', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can view their truck info' });
        }

        if (!user.truckId) {
          return res.status(404).json({ error: 'No truck found for this owner' });
        }

        const truck = await knex('FoodTruck.Trucks')
          .where({ truckId: user.truckId })
          .first();

        if (!truck) {
          return res.status(404).json({ error: 'Truck not found' });
        }

        return res.status(200).json({ success: true, data: formatResponseData(truck) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // PUT /api/v1/trucks/updateOrderStatus - Truck Owner: Update truck availability
    app.put('/api/v1/trucks/updateOrderStatus', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can update order status' });
        }

        if (!user.truckId) {
          return res.status(404).json({ error: 'No truck found for this owner' });
        }

        const { orderStatus } = req.body;
        if (!orderStatus) {
          return res.status(400).json({ error: 'orderStatus is required' });
        }

        const updated = await knex('FoodTruck.Trucks')
          .where({ truckId: user.truckId })
          .update({ orderStatus })
          .returning('*');

        return res.status(200).json({ success: true, data: formatResponseData(updated[0]) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // ==================== Cart Management ====================

    // POST /api/v1/cart/new - Customer: Add item to cart
    app.post('/api/v1/cart/new', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can add items to cart' });
        }

        const { itemId, quantity } = req.body;
        if (!itemId || !quantity) {
          return res.status(400).json({ error: 'itemId and quantity are required' });
        }

        // Verify item exists and is available
        const item = await knex('FoodTruck.MenuItems')
          .where({ itemId, status: 'available' })
          .first();

        if (!item) {
          return res.status(404).json({ error: 'Menu item not found or not available' });
        }

        // Check if item already exists in cart
        const existingCartItem = await knex('FoodTruck.Carts')
          .where({ userId: user.userId, itemId })
          .first();

        if (existingCartItem) {
          // Update quantity
          const updated = await knex('FoodTruck.Carts')
            .where({ cartId: existingCartItem.cartId })
            .update({ quantity: existingCartItem.quantity + quantity, price: item.price })
            .returning('*');

          return res.status(200).json({ success: true, data: formatResponseData(updated[0]) });
        } else {
          // Create new cart item
          const newCartItem = await knex('FoodTruck.Carts')
            .insert({
              userId: user.userId,
              itemId,
              quantity,
              price: item.price
            })
            .returning('*');

          return res.status(201).json({ success: true, data: formatResponseData(newCartItem[0]) });
        }
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // GET /api/v1/cart/view - Customer: View cart
    app.get('/api/v1/cart/view', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can view their cart' });
        }

        const cartItems = await knex('FoodTruck.Carts')
          .where({ userId: user.userId })
          .join('FoodTruck.MenuItems', 'FoodTruck.Carts.itemId', 'FoodTruck.MenuItems.itemId')
          .select(
            'FoodTruck.Carts.cartId',
            'FoodTruck.Carts.itemId',
            'FoodTruck.Carts.quantity',
            'FoodTruck.Carts.price',
            'FoodTruck.MenuItems.name',
            'FoodTruck.MenuItems.description',
            'FoodTruck.MenuItems.category',
            'FoodTruck.MenuItems.truckId'
          );

        return res.status(200).json({ success: true, data: formatResponseData(cartItems) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // PUT /api/v1/cart/edit/:cartId - Customer: Update cart quantity
    app.put('/api/v1/cart/edit/:cartId', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can edit their cart' });
        }

        const cartId = req.params.cartId;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
          return res.status(400).json({ error: 'Valid quantity is required' });
        }

        // Verify cart item belongs to user
        const cartItem = await knex('FoodTruck.Carts')
          .where({ cartId, userId: user.userId })
          .first();

        if (!cartItem) {
          return res.status(404).json({ error: 'Cart item not found' });
        }

        // Get current item price
        const item = await knex('FoodTruck.MenuItems')
          .where({ itemId: cartItem.itemId })
          .first();

        const updated = await knex('FoodTruck.Carts')
          .where({ cartId })
          .update({ quantity, price: item.price })
          .returning('*');

        return res.status(200).json({ success: true, data: formatResponseData(updated[0]) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // DELETE /api/v1/cart/delete/:cartId - Customer: Remove from cart
    app.delete('/api/v1/cart/delete/:cartId', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can delete cart items' });
        }

        const cartId = req.params.cartId;

        // Verify cart item belongs to user
        const cartItem = await knex('FoodTruck.Carts')
          .where({ cartId, userId: user.userId })
          .first();

        if (!cartItem) {
          return res.status(404).json({ error: 'Cart item not found' });
        }

        await knex('FoodTruck.Carts')
          .where({ cartId })
          .del();

        return res.status(200).json({ success: true, message: 'Cart item deleted successfully' });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // ==================== Order Management ====================

    // POST /api/v1/order/new - Customer: Place order
    app.post('/api/v1/order/new', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can place orders' });
        }

        const { truckId, scheduledPickupTime } = req.body;

        if (!truckId) {
          return res.status(400).json({ error: 'truckId is required' });
        }

        // Verify truck exists and is available
        const truck = await knex('FoodTruck.Trucks')
          .where({ truckId, truckStatus: 'available', orderStatus: 'available' })
          .first();

        if (!truck) {
          return res.status(404).json({ error: 'Truck not found or not available for orders' });
        }

        // Get all cart items for this user and truck
        const cartItems = await knex('FoodTruck.Carts')
          .where({ userId: user.userId })
          .join('FoodTruck.MenuItems', 'FoodTruck.Carts.itemId', 'FoodTruck.MenuItems.itemId')
          .where('FoodTruck.MenuItems.truckId', truckId)
          .select('FoodTruck.Carts.*', 'FoodTruck.MenuItems.truckId');

        if (cartItems.length === 0) {
          return res.status(400).json({ error: 'No items in cart for this truck' });
        }

        // Calculate total price
        let totalPrice = 0;
        cartItems.forEach(item => {
          totalPrice += item.price * item.quantity;
        });

        // Create order
        const order = await knex('FoodTruck.Orders')
          .insert({
            userId: user.userId,
            truckId,
            orderStatus: 'pending',
            totalPrice,
            scheduledPickupTime: scheduledPickupTime || null
          })
          .returning('*');

        const orderId = order[0].orderId;

        // Create order items
        const orderItems = [];
        for (const cartItem of cartItems) {
          const orderItem = await knex('FoodTruck.OrderItems')
            .insert({
              orderId,
              itemId: cartItem.itemId,
              quantity: cartItem.quantity,
              price: cartItem.price
            })
            .returning('*');
          orderItems.push(orderItem[0]);
        }

        // Clear cart items for this truck
        await knex('FoodTruck.Carts')
          .where({ userId: user.userId })
          .whereIn('itemId', cartItems.map(item => item.itemId))
          .del();

        return res.status(201).json({ 
          success: true, 
          data: { 
            order: formatResponseData(order[0]), 
            orderItems: formatResponseData(orderItems) 
          } 
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // GET /api/v1/order/myOrders - Customer: View my orders
    app.get('/api/v1/order/myOrders', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can view their orders' });
        }

        const orders = await knex('FoodTruck.Orders')
          .where({ userId: user.userId })
          .join('FoodTruck.Trucks', 'FoodTruck.Orders.truckId', 'FoodTruck.Trucks.truckId')
          .select(
            'FoodTruck.Orders.*',
            'FoodTruck.Trucks.truckName',
            'FoodTruck.Trucks.truckLogo'
          )
          .orderBy('FoodTruck.Orders.createdAt', 'desc');

        return res.status(200).json({ success: true, data: formatResponseData(orders) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // GET /api/v1/order/details/:orderId - Customer: View order details
    app.get('/api/v1/order/details/:orderId', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'customer') {
          return res.status(403).json({ error: 'Forbidden - Only customers can view order details' });
        }

        const orderId = req.params.orderId;

        // Get order and verify it belongs to user
        const order = await knex('FoodTruck.Orders')
          .where({ orderId, userId: user.userId })
          .join('FoodTruck.Trucks', 'FoodTruck.Orders.truckId', 'FoodTruck.Trucks.truckId')
          .select(
            'FoodTruck.Orders.*',
            'FoodTruck.Trucks.truckName',
            'FoodTruck.Trucks.truckLogo'
          )
          .first();

        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }

        // Get order items
        const orderItems = await knex('FoodTruck.OrderItems')
          .where({ orderId })
          .join('FoodTruck.MenuItems', 'FoodTruck.OrderItems.itemId', 'FoodTruck.MenuItems.itemId')
          .select(
            'FoodTruck.OrderItems.*',
            'FoodTruck.MenuItems.name',
            'FoodTruck.MenuItems.description',
            'FoodTruck.MenuItems.category'
          );

        return res.status(200).json({ 
          success: true, 
          data: { 
            order: formatResponseData(order), 
            orderItems: formatResponseData(orderItems) 
          } 
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // GET /api/v1/order/truckOwner/:orderId - Truck Owner: View order details
    app.get('/api/v1/order/truckOwner/:orderId', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can view order details' });
        }

        if (!user.truckId) {
          return res.status(404).json({ error: 'No truck found for this owner' });
        }

        const orderId = req.params.orderId;

        // Get order and verify it belongs to truck owner's truck
        const order = await knex('FoodTruck.Orders')
          .where({ orderId, truckId: user.truckId })
          .join('FoodTruck.Users', 'FoodTruck.Orders.userId', 'FoodTruck.Users.userId')
          .select(
            'FoodTruck.Orders.*',
            'FoodTruck.Users.name as customerName',
            'FoodTruck.Users.email as customerEmail'
          )
          .first();

        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }

        // Get order items
        const orderItems = await knex('FoodTruck.OrderItems')
          .where({ orderId })
          .join('FoodTruck.MenuItems', 'FoodTruck.OrderItems.itemId', 'FoodTruck.MenuItems.itemId')
          .select(
            'FoodTruck.OrderItems.*',
            'FoodTruck.MenuItems.name',
            'FoodTruck.MenuItems.description',
            'FoodTruck.MenuItems.category'
          );

        return res.status(200).json({ 
          success: true, 
          data: { 
            order: formatResponseData(order), 
            orderItems: formatResponseData(orderItems) 
          } 
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // GET /api/v1/order/truckOrders - Truck Owner: View truck's orders
    app.get('/api/v1/order/truckOrders', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can view truck orders' });
        }

        if (!user.truckId) {
          return res.status(404).json({ error: 'No truck found for this owner' });
        }

        const orders = await knex('FoodTruck.Orders')
          .where({ truckId: user.truckId })
          .join('FoodTruck.Users', 'FoodTruck.Orders.userId', 'FoodTruck.Users.userId')
          .select(
            'FoodTruck.Orders.*',
            'FoodTruck.Users.name as customerName',
            'FoodTruck.Users.email as customerEmail'
          )
          .orderBy('FoodTruck.Orders.createdAt', 'desc');

        return res.status(200).json({ success: true, data: formatResponseData(orders) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // PUT /api/v1/order/updateStatus/:orderId - Truck Owner: Update order status
    app.put('/api/v1/order/updateStatus/:orderId', async (req, res) => {
      try {
        const user = await getUser(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized - No session found' });
        }
        if (user.role !== 'truckOwner') {
          return res.status(403).json({ error: 'Forbidden - Only truck owners can update order status' });
        }

        if (!user.truckId) {
          return res.status(404).json({ error: 'No truck found for this owner' });
        }

        const orderId = req.params.orderId;
        const { orderStatus, estimatedEarliestPickup } = req.body;

        if (!orderStatus) {
          return res.status(400).json({ error: 'orderStatus is required' });
        }

        // Verify order belongs to truck owner's truck
        const order = await knex('FoodTruck.Orders')
          .where({ orderId, truckId: user.truckId })
          .first();

        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }

        const updateData = { orderStatus };
        if (estimatedEarliestPickup) {
          updateData.estimatedEarliestPickup = estimatedEarliestPickup;
        }

        const updated = await knex('FoodTruck.Orders')
          .where({ orderId })
          .update(updateData)
          .returning('*');

        return res.status(200).json({ success: true, data: formatResponseData(updated[0]) });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    };



module.exports = {handlePrivateBackendApi};
