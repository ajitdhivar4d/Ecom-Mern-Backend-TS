import { Request, Response } from "express";
import Order from "../models/order.js";
import Product from "../models/product.js";

// Define types for incoming request body
interface OrderItem {
  _id: string;
  qty: number;
  price?: number; // price is optional because it will be fetched from the database
}

// Utility Function
function calcPrices(orderItems: OrderItem[]): {
  itemsPrice: string;
  shippingPrice: string;
  taxPrice: string;
  totalPrice: string;
} {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + (item.price ?? 0) * item.qty,
    0,
  );

  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxRate = 0.15;
  const taxPrice = parseFloat((itemsPrice * taxRate).toFixed(2));

  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice,
  };
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No order items provided" });
    }

    const productIds = orderItems.map((item: { _id: any }) => item._id);

    // Validate product IDs
    if (productIds.some((id: any) => !id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID in order items" });
    }

    const itemsFromDB = await Product.find({
      _id: { $in: productIds },
    }).exec();

    if (itemsFromDB.length !== productIds.length) {
      return res
        .status(404)
        .json({ success: false, message: "One or more products not found" });
    }

    const dbOrderItems = orderItems.map((itemFromClient: { _id: any }) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id,
      );

      return {
        ...itemFromClient,
        product: matchingItemFromDB!._id, // Non-null assertion because we know the product exists
        price: matchingItemFromDB!.price, // Non-null assertion for the price
      };
    });

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user!._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    return res.status(201).json({
      success: true,
      order: createdOrder,
      message: "Order created successfully",
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({}).populate("user", "id username").exec();

    res.status(200).json({
      success: true,
      orders,
      message: "get all orders",
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user!._id }).exec();

    if (!orders || orders.length === 0) {
      res
        .status(404)
        .json({ success: false, message: "No orders found for this user" });
      return;
    }

    res.status(200).json({
      success: true,
      orders,
      message: "Fetch all My Orders",
    });
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    res
      .status(500)
      .json({ success: true, message: "Server error, please try again later" });
  }
};

export const countTotalOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const totalOrders = await Order.countDocuments().exec();

    res.status(200).json({
      success: true,
      totalOrders,
      message: "Total Count Documents",
    });
  } catch (error: any) {
    console.error("Error counting total orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};

export const calculateTotalSales = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find().select("totalPrice").exec();
    const totalSales = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0,
    );

    res.status(200).json({
      success: true,
      totalSales,
      message: "Total Sales",
    });
  } catch (error: any) {
    console.error("Error calculating total sales:", error);
    res.status(500).json({ error: "Server error, please try again later" });
  }
};

export const calculateTotalSalesByDate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const salesByDate = await Order.aggregate([
      {
        $match: {
          isPaid: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
          },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { _id: 1 }, // Optional: Sort by date ascending
      },
    ]);

    res.status(200).json({
      success: true,
      salesByDate,
      message: "Sales by date",
    });
  } catch (error: any) {
    console.error("Error calculating sales by date:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error, please try again later",
      });
  }
};

export const findOrderById = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .exec();

    if (order) {
      res.status(200).json({
        success: true,
        order,
        message: "Order Fetched Successfully",
      });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (error: any) {
    console.error("Error finding order by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};

export const markOrderAsPaid = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error: any) {
    console.error("Error marking order as paid:", error);
    res.status(500).json({ error: "Server error, please try again later" });
  }
};

export const markOrderAsDelivered = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();

      const updatedOrder = await order.save();
      res.status(200).json({
        success: true,
        order: updatedOrder,
        message: "Order marked as delivered successfully",
      });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (error: any) {
    console.error("Error marking order as delivered:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};
