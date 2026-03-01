import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ msg: "No item in cart" });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ msg: "Wrong delivery address" });
    }

    //For Online Payment
    if (paymentMethod === "ONLINE") {
      // 🔹 Create Razorpay Order
      const razorOrder = await instance.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      return res.status(200).json({
        razorOrder,
      });
    }

    //For Cash On Delivery COD
    if (paymentMethod === "COD") {
      const groupItemsByShop = {};

      cartItems.forEach((item) => {
        const shopId = item.shop;
        if (!groupItemsByShop[shopId]) {
          groupItemsByShop[shopId] = [];
        }
        groupItemsByShop[shopId].push(item);
      });

      const shopOrders = await Promise.all(
        Object.keys(groupItemsByShop).map(async (shopId) => {
          const shop = await Shop.findById(shopId).populate("owner");

          if (!shop) {
            throw new Error("Shop not found");
          }

          const items = groupItemsByShop[shopId];

          let subTotal = items.reduce(
            (sum, i) => sum + Number(i.price) * Number(i.quantity),
            0,
          );

          if (subTotal < 500) {
            subTotal = subTotal + 20;
          }

          return {
            shop: shop._id,
            owner: shop.owner._id,
            subTotal,
            status: "pending",
            shopOrderItems: items.map((i) => ({
              item: i.id,
              price: i.price,
              quantity: i.quantity,
              name: i.name,
            })),
          };
        }),
      );

      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        payment: false,
      });
      await newOrder.populate(
        "shopOrders.shopOrderItems.item",
        "name image price",
      );
      await newOrder.populate("shopOrders.shop", "name address");
      await newOrder.populate("shopOrders.owner", "name socketId");
      await newOrder.populate("user", "fullName email mobile");

      const io = req.app.get("io");

      // if(io) {
      //   newOrder.shopOrders.forEach(shopOrder => {
      //     const ownerSocketId = shopOrder?.owner?.socketId
      //     if(ownerSocketId) {
      //       io.to(ownerSocketId).emit('newOrder', {
      //         _id: newOrder._id,
      //         paymentMethod : newOrder.paymentMethod,
      //         user : newOrder.user,
      //         shopOrders : shopOrder,
      //         createdAt : newOrder.createdAt,
      //         deliveryAddress : newOrder.deliveryAddress,
      //         payment : newOrder.payment
      //       })
      //     }
      //   })
      // }

      if (io) {
        newOrder.shopOrders.forEach((shopOrder) => {
          const ownerSocketId = shopOrder?.owner?.socketId;

          if (ownerSocketId) {
            io.to(ownerSocketId).emit("newOrder", {
              ...newOrder.toObject(),
              shopOrders: [shopOrder], // ✅ ALWAYS ARRAY
            });
          }
        });
      }

      return res.status(201).json(newOrder);
    }
  } catch (error) {
    return res.status(500).json({
      msg: "Place order error",
      error: error.message,
    });
  }
};

// export const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_payment_id, orderId } = req.body;
//     const payment = await instance.payments.fetch(razorpay_payment_id);
//     if (!payment || payment.status != "captured") {
//       return res.status(400).json({ msg: "Payment did not capture" });
//     }

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(400).json({ msg: "order not found" });
//     }

//     order.payment = true;
//     order.razorpayPaymentId = razorpay_payment_id;
//     await order.save();

//     await order.populate("shopOrders.shopOrderItems.item", "name image price");
//     await order.populate("shopOrders.shop", "name address");

//     return res.status(200).json(order);
//   } catch (error) {
//     return res.status(500).json({
//       msg: "verify payment error",
//       error: error.message,
//     });
//   }
// };

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      cartItems,
      deliveryAddress,
      totalAmount,
      paymentMethod,
    } = req.body;

    // 🔹 Verify Signature (VERY IMPORTANT)
    const crypto = await import("crypto");

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ msg: "Invalid signature" });
    }

    // 🔹 Fetch payment
    const payment = await instance.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ msg: "Payment not captured" });
    }

    // 🔹 Group items by shop (same logic as before)
    const groupItemsByShop = {};

    cartItems.forEach((item) => {
      if (!groupItemsByShop[item.shop]) {
        groupItemsByShop[item.shop] = [];
      }
      groupItemsByShop[item.shop].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");

        const items = groupItemsByShop[shopId];

        const subTotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0,
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subTotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      }),
    );

    // 🔹 NOW create DB order
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      payment: true,
    });

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price",
    );
    await newOrder.populate("shopOrders.shop", "name address");

    return res.status(200).json(newOrder);
  } catch (error) {
    return res.status(500).json({
      msg: "verify payment error",
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name price image");
      if (!orders) {
        return res.status(400).json({ msg: "Orders not found" });
      }

      return res.status(200).json(orders);
    } else if (user.role === "owner") {
      let orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name price image")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");
      if (!orders || orders.length === 0) {
        return res.status(400).json({ msg: "Orders not found" });
      }

      orders = orders.map((order) => {
        const filteredOrders = order.shopOrders.filter(
          (shop) => shop.owner.toString() === req.userId.toString(),
        );

        return {
          ...order.toObject(),
          shopOrders: filteredOrders,
        };
      });

      return res.status(200).json(orders);
    }
  } catch (error) {
    return res.status(500).json({
      msg: "get user orders error",
      error: error.message,
    });
  }
};

// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId, shopId } = req.params;
//     const { status } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(400).json({ msg: "Order not found" });
//     }

//     const shopOrder = order.shopOrders.find(o =>
//       o.shop.equals(shopId)
//     );

//     if (!shopOrder) {
//       return res.status(400).json({ msg: "Shop Order not found" });
//     }

//     shopOrder.status = status;
//     let deliveryBoysPayload =[];

//     if(status == "out_of_delivery" && !shopOrder.assignment) {
//       const {longitude, latitude} = order.deliveryAddress;
//       const nearbyDeliveryBoy = await User.find({
//         role : "deliveryBoy",
//         location : {
//           $near:{
//             $geometry:{
//               type : "Point",
//               coordinates:[Number(longitude), Number(latitude)]
//             },
//             $maxDistance:5000
//           }
//         }
//       })

//       if(nearbyDeliveryBoy.length === 0) {
//         return res.json({
//           message:"No delivery boy near order address",
//           data : nearbyDeliveryBoy
//         })
//       }

//       const nearbyIds = nearbyDeliveryBoy.map(n => n._id)

//       const busyIds = await DeliveryAssignment.find({
//         assignedTo:{$in:nearbyIds},
//         status:{$nin:["broadcasted", "completed"]}
//       }).distinct("assignedTo")

//       const busyIdSet = new Set(busyIds.map(id => String(id)));

//       const availableBoys = nearbyDeliveryBoy.filter(b=>!busyIdSet.has(String(b._id)))

//       const candidates = availableBoys.map(a => a._id)

//       if(candidates.length == 0) {
//         await order.save();
//         return res.json({
//           message:"order status updated but there is no available delivery boy....."
//         })
//       }
//       const deliveryAssignment = await DeliveryAssignment.create({
//         order : order._id,
//         shop : shopOrder.shop,
//         shopOrderId : shopOrder._id,
//         broadcastedTo : candidates,
//         status : "broadcasted"
//       })

//       shopOrder.assignedDeliveryBoy=deliveryAssignment.assignedTo
//       shopOrder.assignment=deliveryAssignment._id
//       deliveryBoysPayload=availableBoys.map(b => ({
//         id : b._id,
//         fullName : b.fullName,
//         longitude : b.location.coordinates?.[0],
//         latitude : b.location.coordinates?.[1],
//         mobile : b.mobile,
//       }))

//     }

//     await order.save();

//     await order.populate(
//       "shopOrders.shopOrderItems.item",
//       "name image price"
//     );
//     await order.populate(
//       "shopOrders.assignedDeliveryBoy", "fullName email mobile"
//     )

//     const updatedShopOrder = order.shopOrders.find(o =>
//       o.shop.equals(shopId)
//     );

//     return res.status(200).json({
//       shopOrder : updatedShopOrder,
//       assignedDeliveryBoy : updatedShopOrder?.assignedDeliveryBoy,
//       availableBoys : deliveryBoysPayload,
//       assignment: updatedShopOrder?.assignment._id

//     });

//   } catch (error) {
//     return res.status(500).json({
//       msg: "update order status error",
//       error: error.message,
//     });
//   }
// };

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "preparing",
      "out_of_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const shopOrder = order.shopOrders.find((o) => o.shop.equals(shopId));

    if (!shopOrder) {
      return res.status(404).json({ msg: "Shop order not found" });
    }

    shopOrder.status = status;
    let deliveryBoysPayload = [];

    // ---------------- OUT FOR DELIVERY LOGIC ----------------
    if (status === "out_of_delivery" && !shopOrder.assignment) {
      const { latitude, longitude } = order.deliveryAddress || {};

      if (!latitude || !longitude) {
        return res.status(400).json({
          msg: "Delivery address coordinates missing",
        });
      }

      const nearbyDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      if (!nearbyDeliveryBoys.length) {
        await order.save();
        return res.json({
          message: "Order updated but no nearby delivery boys found",
        });
      }

      const nearbyIds = nearbyDeliveryBoys.map((b) => b._id);

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearbyIds },
        status: { $in: ["assigned"] },
      }).distinct("assignedTo");

      const busySet = new Set(busyIds.map((id) => String(id)));

      const availableBoys = nearbyDeliveryBoys.filter(
        (b) => !busySet.has(String(b._id)),
      );

      if (!availableBoys.length) {
        await order.save();
        return res.json({
          message: "Order updated but no available delivery boy",
        });
      }

      const candidateIds = availableBoys.map((b) => b._id);

      const assignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidateIds,
        status: "broadcasted",
      });

      shopOrder.assignment = assignment._id;
      shopOrder.assignedDeliveryBoy = assignment.assignedTo;

      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        mobile: b.mobile,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
      }));

      await assignment.populate("order");
      await assignment.populate("shop");

      const relatedShopOrder = assignment.order.shopOrders.find((so) =>
        so._id.equals(assignment.shopOrderId),
      );

      const io = req.app.get("io");

      if (io) {
        availableBoys.forEach((boy) => {
          if (boy.socketId) {
            io.to(boy.socketId).emit("newAssignment", {
              assignmentId: assignment._id,
              orderId: assignment.order._id,
              shopName: assignment.shop.name,
              deliveryAddress: assignment.order.deliveryAddress,
              items: relatedShopOrder?.shopOrderItems || [],
              subTotal: relatedShopOrder?.subTotal || 0,
            });
          }
        });
      }
    }

    await order.save();

    await order.populate([
      {
        path: "shopOrders.shopOrderItems.item",
        select: "name image price",
      },
      {
        path: "shopOrders.assignedDeliveryBoy",
        select: "fullName email mobile socketId",
      },
      { path: "user", select: "fullName email mobile socketId" },
    ]);

    const updatedShopOrder = order.shopOrders.find((o) =>
      o.shop.equals(shopId),
    );

    const io = req.app.get("io");
    if (io) {
      const userSocketId = order.user?.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId: shopId,
          status: updatedShopOrder.status,
        });
      }
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Update order status failed",
      error: error.message,
    });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryboyId = req.userId;
    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryboyId,
      status: "broadcasted",
    })
      .populate("order")
      .populate("shop");

    // const formated = assignments.map(a => ({
    //   assignmentId : a._id,
    //   orderId : a.order._id,
    //   shopName : a.shop.name,
    //   deliveryAddress : a.order.deliveryAddress,
    //   items : a.order.shopOrders.find(so => so._id == a.shopOrderId).shopOrderItems || [],
    //   subTotal : a.order.shopOrders.find(so => so._id == a.shopOrderId).subTotal
    // }))

    const formated = assignments.map((a) => {
      const shopOrder = a.order.shopOrders.find((so) =>
        so._id.equals(a.shopOrderId),
      );

      return {
        assignmentId: a._id,
        orderId: a.order._id,
        shopName: a.shop.name,
        deliveryAddress: a.order.deliveryAddress,
        items: shopOrder?.shopOrderItems || [],
        subTotal: shopOrder?.subTotal || 0,
      };
    });

    return res.status(200).json(formated);
  } catch (error) {
    return res.status(500).json({
      msg: "Get assignment error",
      error: error.message,
    });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ msg: "Assignment not found" });
    }

    if (assignment.status !== "broadcasted") {
      return res.status(400).json({ msg: "Assignment expired" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    });

    if (alreadyAssigned) {
      return res.status(400).json({ msg: "You are assigned to another order" });
    }

    assignment.status = "assigned";
    assignment.assignedTo = req.userId;
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return req.status(400).json({ msg: "order not found" });
    }

    const shopOrder = order.shopOrders.id(assignment.shopOrderId);

    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();

    await order.populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

    res.status(200).json({
      msg: "Order accepted",
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Accept Order error",
      error: error.message,
    });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }],
      });
    if (!assignment) {
      return res.status(400).json({ msg: "assignment not found" });
    }
    if (!assignment.order) {
      return res.status(400).json({ msg: "order not found" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) == String(assignment.shopOrderId),
    );

    if (!shopOrder) {
      return res.status(400).json({ msg: "shop-order not found" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }
    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "get current Order error",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(400).json({ msg: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({
      msg: "get Order by id error",
      error: error.message,
    });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ msg: "enter valid order/shopOrder" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
    await order.save();

    await sendDeliveryOtpMail(order.user.email, otp);

    return res
      .status(200)
      .json({ msg: `Otp sent Successfully to ${order?.user.fullName}` });
  } catch (error) {
    return res.status(500).json({
      msg: "delivery OTP error",
      error: error.message,
    });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ msg: "enter valid order/shopOrder" });
    }

    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ msg: "Invalid/ Expired otp" });
    }

    shopOrder.status = "delivered";
    order.payment = true;
    shopOrder.deliveredAt = Date.now();
    await order.save();

    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    return res.status(200).json({ msg: "Order delivered successfully" });
  } catch (error) {
    return res.status(500).json({
      msg: "delivery OTP verification error",
      error: error.message,
    });
  }
};


export const deliveryBoyDeliveredOrders = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({
      "shopOrders.status" : "delivered",
      "shopOrders.assignedDeliveryBoy" : req.userId,
    })
    .populate("user")
    .populate({
      path : "shopOrders.shop",
      model : "Shop",
    })
    .populate({
      path : "shopOrders.assignedDeliveryBoy",
      model : "User"
    })
    .populate({
      path : "shopOrders.shopOrderItems.item",
      model : "Item",
    })
    .lean();

    return res.status(200).json(deliveredOrders)

  } catch (error) {
    return res.status(500).json({
      msg: "get delivered orders error",
      error: error.message,
    });
  }
}