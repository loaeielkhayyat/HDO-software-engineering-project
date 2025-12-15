const db = require('../../connectors/db');
const { getSessionToken , getUser } = require('../../utils/session');
const axios = require('axios');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

function handlePrivateFrontEndView(app) {

    app.get('/dashboard' , async (req , res) => {
        
        const user = await getUser(req);
        if(user.role == "truckOwner"){
            return res.render('truckOwnerHomePage' , {name : user.name});
        }
        // role of customer
        return res.render('customerHomepage' , {name : user.name});
    });

    // Customer: Browse trucks page
    app.get('/trucks', async (req, res) => {
        const user = await getUser(req);
        if (!user || user.role !== 'customer') {
            return res.redirect('/');
        }
        return res.render('trucks');
    });

    // Customer: Truck menu page
    app.get('/truckMenu/:truckId', async (req, res) => {
        const user = await getUser(req);
        if (!user || user.role !== 'customer') {
            return res.redirect('/');
        }
        const truckId = req.params.truckId;
        return res.render('truckMenu', { truckId: truckId });
    });

    // Customer: Shopping cart page
    app.get('/cart', async (req, res) => {
        const user = await getUser(req);
        if (!user || user.role !== 'customer') {
            return res.redirect('/');
        }
        return res.render('cart');
    });

    // Customer: My Orders page
    app.get('/orders', async (req, res) => {
        const user = await getUser(req);
        if (!user || user.role !== 'customer') {
            return res.redirect('/');
        }
        return res.render('myOrders');
    });

    app.get('/testingAxios' , async (req , res) => {

        try {
            const result = await axios.get(`http://localhost:${PORT}/test`);
            return res.status(200).send(result.data);
        } catch (error) {
            console.log("error message",error.message);
            return res.status(400).send(error.message);
        }
      
    });  
}  
  
module.exports = {handlePrivateFrontEndView};
  