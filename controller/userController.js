const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMdbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailController");
const crypto = require("crypto");

const createUser = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    // create a new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    // user already exists
    throw new Error("User already exists!");
  }
});

// login a user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check id user exists
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstName: findUser?.firstName,
      lastName: findUser?.lastName,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check id user exists
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not authorized");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateUser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstName: findAdmin?.firstName,
      lastName: findAdmin?.lastName,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(`No refresh token present in db or not matched`);
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is someyhing wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// // logout a user
// const logout = asyncHandler(async (req, res) => {
//   const cookie = req.cookies;
//   if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
//   const refreshToken = cookie.refreshToken;
//   const user = await User.findOne({ refreshToken });
//   if (!user) {
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true,
//     });
//     return res.sendStatus(204); // forbidden
//   }
//   await User.findOneAndUpdate(refreshToken, {
//     refreshToken: "",
//   });
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: true,
//   });
//   res.sendStatus(204); //forbidden
// });

const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  // Check if refresh token exists in cookies
  if (!cookies?.refreshToken) {
    return res.sendStatus(204); // No content, no need to throw error
  }
  const refreshToken = cookies.refreshToken;
  // Find user with the provided refresh token
  const user = await User.findOne({ refreshToken });

  if (!user) {
    // Clear the refresh token cookie and return success
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  // Update the user, remove the refresh token from their record
  await User.findOneAndUpdate(
    { _id: user._id }, // Correct filter
    { refreshToken: "" }
  );
  // Clear the refresh token cookie and return success
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  res.sendStatus(204);
});

// update a user
const updatedUser = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// save user address
const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// get all users

const getAllUsers = async (req, res, next) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
};

// get a single user

const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getUser = await User.findById(id);
    res.json({
      getUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// delete a user
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({
      deleteUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// block user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User is blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});
// unblock user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User is unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found! Please enter correct email");
  try {
    const token = await user.createPasswordResetToken();
    console.log(token);
    await user.save();
    const resetURL = `Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href="http://localhost:3000/reset-password/${token}">Click Here</a>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

// get wishlist

const getWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

// cart user
const cartUser = asyncHandler(async (req, res) => {
  // res.send(req.user);
  const { productId, color, quantity, price } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  console.log(req.user);

  // Validate required fields
  if (!productId || !quantity || !price) {
    return res.status(400).json({
      message: "ValidationError: productId, quantity, and price are required.",
    });
  }

  try {
    // let products = [];
    // const user = await User.findById(_id);
    // // check id user already have products in cart
    // const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
    // if (alreadyExistCart) {
    //   alreadyExistCart.deleteOne();
    // }
    // for (let i = 0; i < cart.length; i++) {
    //   let object = {};
    //   object.product = cart[i]._id;
    //   object.count = cart[i].count;
    //   object.color = cart[i].color;

    //   let getPrice = await Product.findById(cart[i]._id).select("price").exec();
    //   // Check if the product exists
    //   if (!getPrice) {
    //     throw new Error(`Product with ID ${cart[i]._id} not found`);
    //   }

    //   object.price = getPrice.price;
    //   products.push(object);
    // }
    // let cartTotal = 0;
    // for (let i = 0; i < products.length; i++) {
    //   cartTotal = cartTotal + products[i].price * products[i].count;
    // }

    let newCart = await new Cart({
      userId: _id,
      productId,
      color,
      quantity,
      price,
    }).save();

    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ userId: _id })
      .populate("productId")
      .populate("color");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId } = req.params;
  validateMongoDbId(_id);
  try {
    const deleteProductFromCart = await Cart.deleteOne({
      userId: _id,
      _id: cartItemId,
    });
    res.json(deleteProductFromCart);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId, newQuantity } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({ userId: _id, _id: cartItemId });
    cartItem.quantity = newQuantity;
    cartItem.save();
    res.json(cartItem);
  } catch (error) {
    throw new Error(error);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    totalPrice,
    totalPriceAfterDiscount,
    paymentInfo,
  } = req.body;
  const { _id } = req.user;
  try {
    const order = await Order.create({
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
      paymentInfo,
      user: _id,
    });
    res.json({
      order,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const orders = await Order.find({ user: _id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({ orders });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find().populate("user");
    res.json({ orders });
  } catch (error) {
    throw new Error(error);
  }
});

const getSingleOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await Order.findOne({ _id: id })
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({ orders });
  } catch (error) {
    throw new Error(error);
  }
});

const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await Order.findById(id);
    orders.orderStatus = req.body.status;
    await orders.save();
    res.json({ orders });
  } catch (error) {
    throw new Error(error);
  }
});

// const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
//   let monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];
//   let date = new Date();
//   let endDate = "";
//   date.setDate(1);
//   for (let index = 0; index < 11; index++) {
//     date.setMonth(date.getMonth() - 1);
//     endDate = monthNames[date.getMonth()] + " " + date.getFullYear();
//   }
//   const data = await Order.aggregate([
//     {
//       $match: {
//         createdAt: {
//           $lte: new Date(),
//           $gte: new Date(endDate),
//         },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           month: "$month",
//         },
//         amount: { $sum: "$totalPriceAfterDiscount" },
//       },
//     },
//   ]);
//   res.json(data);
// });

// const getMonthWiseOrderCount = asyncHandler(async (req, res) => {
//   let monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];
//   let date = new Date();
//   let endDate = "";
//   date.setDate(1);
//   for (let index = 0; index < 11; index++) {
//     date.setMonth(date.getMonth() - 1);
//     endDate = monthNames[date.getMonth()] + " " + date.getFullYear();
//   }
//   const data = await Order.aggregate([
//     {
//       $match: {
//         createdAt: {
//           $lte: new Date(),
//           $gte: new Date(endDate),
//         },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           month: "$month",
//         },
//         count: { $sum: 1 },
//       },
//     },
//   ]);
//   res.json(data);
// });

const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
  let date = new Date();
  date.setDate(1); // Start from the first day of the current month
  date.setMonth(date.getMonth() - 11); // Go back 11 months for a full year range

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date, // Start date 11 months ago
          $lte: new Date(), // Current date
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
        },
        amount: { $sum: "$totalPriceAfterDiscount" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.json(data);
});

const getYearlyTotalOrders = asyncHandler(async (req, res) => {
  let date = new Date();
  date.setDate(1); // Start from the first day of the current month
  date.setMonth(date.getMonth() - 11); // Go back 11 months for a full year range

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date, // Start date 11 months ago
          $lte: new Date(), // Current date
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        amount: { $sum: "$totalPriceAfterDiscount" },
      },
    },
  ]);

  res.json(data);
});

// const emptyCart = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   try {
//     const user = await User.findOne({ _id });
//     const cart = await Cart.findOneAndDelete({ orderBy: user._id });
//     res.json(user);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const applyCoupon = asyncHandler(async (req, res) => {
//   const { coupon } = req.body;
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   const validCoupon = await Coupon.findOne({ name: coupon });
//   if (validCoupon === null) {
//     throw new Error("Invalid Coupon");
//   }
//   const user = await User.findOne({ _id });
//   let { cartTotal } = await Cart.findOne({
//     orderBy: user._id,
//   }).populate("products.product");
//   let totalAfterDiscount = (
//     cartTotal -
//     (cartTotal * validCoupon.discount) / 100
//   ).toFixed(2);
//   await Cart.findOneAndUpdate(
//     { orderBy: user._id },
//     { totalAfterDiscount },
//     { new: true }
//   );
//   res.json(totalAfterDiscount);
// });

// const createOrder = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   const { COD, couponApplied } = req.body;
//   try {
//     if (!COD) throw new Error("Create cash order failed");
//     const user = await User.findById(_id);
//     let userCart = await Cart.findOne({ orderBy: user._id });
//     let finalAmount = 0;
//     if (couponApplied && userCart.totalAfterDiscount) {
//       finalAmount = userCart.totalAfterDiscount;
//     } else {
//       finalAmount = userCart.cartTotal;
//     }
//     let newOrder = await new Order({
//       products: userCart.products,
//       paymentIntent: {
//         id: uniqid(),
//         method: "COD",
//         amount: finalAmount,
//         status: "Cash on Delivery",
//         created: Date.now(),
//         currency: "usd",
//       },
//       orderBy: user._id,
//       orderStatus: "Cash on Delivery",
//     }).save();
//     let updateStock = userCart.products.map((item) => {
//       return {
//         updateOne: {
//           filter: { _id: item.product._id },
//           update: { $inc: { quantity: -item.count, sold: +item.count } },
//         },
//       };
//     });
//     const updatedStock = await Product.bulkWrite(updateStock, {});
//     res.json({ message: "success" });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const getOrders = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   try {
//     const userOrders = await Order.findOne({ orderBy: _id })
//       .populate("products.product")
//       .populate("orderBy")
//       .exec();
//     res.json(userOrders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const getAllOrders = asyncHandler(async (req, res) => {
//   try {
//     const allUserOrders = await Order.find()
//       .populate("products.product")
//       .populate("orderBy")
//       .exec();
//     res.json(allUserOrders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const getOrderByUserId = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const userOrders = await Order.findOne({ orderBy: id })
//       .populate("products.product")
//       .populate("orderBy")
//       .exec();
//     res.json(userOrders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const updateOrderStatus = await Order.findByIdAndUpdate(
//       id,
//       {
//         orderStatus: status,
//         paymentIntent: {
//           status: status,
//         },
//       },
//       { new: true }
//     );
//     res.json(updateOrderStatus);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishList,
  saveAddress,
  cartUser,
  getUserCart,
  // emptyCart,
  // applyCoupon,
  // createOrder,
  // getOrders,
  // getAllOrders,
  // updateOrderStatus,
  // getOrderByUserId,
  removeProductFromCart,
  updateProductQuantityFromCart,
  createOrder,
  getMyOrders,
  getMonthWiseOrderIncome,
  getYearlyTotalOrders,
  getAllOrders,
  getSingleOrder,
  updateOrder,
};
