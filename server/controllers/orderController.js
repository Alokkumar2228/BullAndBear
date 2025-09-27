import Order from '../models/OrderModel.js';
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';

// Create Order
export const createOrder = async (req, res) => {
  const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ error: 'Clerk public key not set in environment' });
  }

  const cookies = new Cookies(req, res);
  const tokenFromCookie = cookies.get('__session');
  const tokenFromHeader = req.headers.authorization
    ? req.headers.authorization.split(' ')[1]
    : null;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return res.status(401).json({ error: 'Not signed in' });

  try {
    const options = { algorithms: ['RS256'] };
    const decoded = jwt.verify(token, publicKey, options);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) throw new Error('Token expired');
    if (decoded.nbf && decoded.nbf > currentTime) throw new Error('Token not valid yet');

    const userId = decoded.sub;
    if (!userId) return res.status(401).json({ error: "Invalid token: missing user ID" });

    const { symbol, mode, quantity, purchasePrice, actualPrice, name, changePercent } = req.body;
    if (!symbol || !mode || !quantity || !purchasePrice || !actualPrice || !name || !changePercent) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const totalAmount = quantity * purchasePrice;

    const newOrder = new Order({
      userId,
      symbol,
      name,
      mode,
      quantity,
      purchasePrice,
      totalAmount,
      actualPrice,
      changePercent,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);

  } catch (err) {
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
};

// Get Orders by User ID
export const getOrderById = async (req, res) => {
  const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ error: 'Clerk public key not set in environment' });
  }

  const cookies = new Cookies(req, res);
  const tokenFromCookie = cookies.get('__session');
  const tokenFromHeader = req.headers.authorization
    ? req.headers.authorization.split(' ')[1]
    : null;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return res.status(401).json({ error: 'Not signed in' });

  try {
    const options = { algorithms: ['RS256'] };
    const decoded = jwt.verify(token, publicKey, options);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) throw new Error('Token expired');
    if (decoded.nbf && decoded.nbf > currentTime) throw new Error('Token not valid yet');

    const userId = decoded.sub;
    if (!userId) return res.status(401).json({ error: "Invalid token: missing user ID" });

    const orders = await Order.find({ userId });
    if (!orders || orders.length === 0) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(orders);

  } catch (err) {
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting order", error: err.message });
  }
};
