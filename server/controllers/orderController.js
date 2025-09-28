import Order from "../models/OrderModel.js";

// ✅ Create Order
  export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // comes from clerkAuth middleware
    const {
      symbol,
      mode,
      quantity,
      purchasePrice,
      actualPrice,
      name,
      changePercent,
    } = req.body;

    if (
      !symbol ||
      !mode ||
      !quantity ||
      !purchasePrice ||
      !actualPrice ||
      !name ||
      !changePercent  
    ) {
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
    res
      .status(500)
      .json({ message: "Error creating order", error: err.message });
  }
};

// ✅ Get Orders by User ID
  export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id; // from middleware
    const orders = await Order.find({ userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

      res.status(200).json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: err.message });
  }
};

// ✅ Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting order", error: err.message });
  }
};
