// const Razorpay = require("razorpay");
// const instance = new Razorpay({
//   key_id: "",
//   key_secret: "",
// });

// const checkout = async (req, res) => {
//   const option = {
//     amount: 50000,
//     currency: "PKR",
//   };
//   const order = await instance.orders.create(option);
//   res.json({
//     success: true,
//     order,
//   });
// };

// const paymentVerification = async (req, res) => {
//   const { razorPayOrderId, razorpayPaymentId } = req.body;
//   res.json({
//     razorPayOrderId,
//     razorpayPaymentId,
//   });
// };

// module.exports = {
//   checkout,
//   paymentVerification,
// };

// stripe

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// checkout

// const checkout = async (req, res) => {
//   const session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         price_data: {
//           currency: "usd",
//           product_data: {
//             name: "",
//           },
//           unit_amount: 50 * 100,
//         },
//       },
//     ],
//     mode: "payment",
//     success_url: "http://localhost:3000/complete",
//     cancel_url: "http://localhost:3000/cancel",
//   });
// };

const checkoutSession = async (req, res) => {
  // try {
  const { product } = req.body;
  // console.log(product);
  //     const productItems = product.map((product) => ({
  //       price_data: {
  //         currency: "$",
  //         product_data: {
  //           name: product.title,
  //         },
  //         unit_amount: product.price * 100,
  //       },
  //       quantity: product.quantity,
  //     }));
  //     const session = await stripe.checkout.sessions.create({
  //       payments_methods_types: ["cards"],
  //       line_items: productItems,
  //       mode: "payment",
  //       success_url: "http://localhost:4000/complete",
  //       cancel_url: "http://localhost:4000/cancel",
  //     });
  //     res.json({ id: session.id });
  //   } catch (error) {
  //     throw new Error(error);
  //   }
};

module.exports = {
  checkoutSession,
};
