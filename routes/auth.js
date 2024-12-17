const express = require("express");
const {
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
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderByUserId,
  removeProductFromCart,
  updateProductQuantityFromCart,
  getMyOrders,
  getMonthWiseOrderIncome,
  getYearlyTotalOrders,
  getSingleOrder,
  updateOrder,
} = require("../controller/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  checkout,
  paymentVerification,
} = require("../controller/paymentController");

const router = express.Router();

router.post("/register", createUser);
router.post("/forgotPasswordToken", forgotPasswordToken);

router.put("/resetPassword/:token", resetPassword);

router.put("/changePassword", authMiddleware, updatePassword);
router.post("/login", loginUser);
router.post("/adminLogin", loginAdmin);
router.post("/cart", authMiddleware, cartUser);
// router.post("/order/checkout", authMiddleware, checkout);
// router.post("/order/paymentVerification", authMiddleware, paymentVerification);
// router.post("/cart/applyCoupon", authMiddleware, applyCoupon);
router.post("/cart/createOrder", authMiddleware, createOrder);
router.get("/getUsers", getAllUsers);

router.get("/getOrders", authMiddleware, getMyOrders);
router.get("/getAllOrders", authMiddleware, isAdmin, getAllOrders);
router.get("/getOrder/:id", authMiddleware, isAdmin, getSingleOrder);
router.put("/updateOrder/:id", authMiddleware, isAdmin, updateOrder);

router.get("/getMonthWiseOrderIncome", authMiddleware, getMonthWiseOrderIncome);
router.get("/getYearlyOrders", authMiddleware, getYearlyTotalOrders);

// router.get("/getAllOrders", authMiddleware, isAdmin, getAllOrders);
// router.post("/getOrderByUser/:id", authMiddleware, isAdmin, getOrderByUserId);

router.get("/refreshToken", handleRefreshToken);

router.get("/logout", logout);
router.get("/getWishlist", authMiddleware, getWishList);
router.get("/userCart", authMiddleware, getUserCart);

router.get("/:id", authMiddleware, isAdmin, getUser);

router.delete(
  "/deleteProductCart/:cartItemId",
  authMiddleware,
  removeProductFromCart
);

router.put(
  "/updateProductCart/:cartItemId/:newQuantity",
  authMiddleware,
  updateProductQuantityFromCart
);

// router.delete("/emptyCart", authMiddleware, emptyCart);
router.delete("/:id", deleteUser);

router.put("/editUser", authMiddleware, updatedUser);
router.put("/saveAddress", authMiddleware, saveAddress);

router.put("/blockUser/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblockUser/:id", authMiddleware, isAdmin, unblockUser);

// router.put(
//   "/order/updateOrder/:id",
//   authMiddleware,
//   isAdmin,
//   updateOrderStatus
// );

module.exports = router;
