const express = require("express");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const authRouter = require("./routes/auth");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/prodCategoryRoute");
const blogCategoryRouter = require("./routes/blogCategoryRoute");
const brandRouter = require("./routes/brandRoute");
const colorRouter = require("./routes/colorRoute");
const enquiryRouter = require("./routes/enquiryRoute");
const uploadRouter = require("./routes/uploadRoute");
const paymentRouter = require("./routes/paymentRoute");

const couponRouter = require("./routes/couponRoute");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const Product = require("./models/productModel");

const stripe = require("stripe")(
  "sk_test_51QVeoJCplrVSllH3ypzXCTMzCKE0HfCc14DxJU5MXR1N5faMHOrPgYzAfvJoXSRltf3KEjYk2M8CClBAELRFFX4W00S5z9lilS"
);

const __dirname = path.resolve();

const app = express();

const PORT = process.env.PORT || 4000;

dbConnect();

// app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Allow CORS from specific origin (Frontend URL)
const corsOptions = {
  origin: "https://ecom-frontend-wheat.vercel.app/",  // Replace with your actual frontend domain
  // methods: ["GET", "POST", "PUT", "DELETE"],
  // allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use("/", (req, res) => {
  res.send("Hello from server side");
});

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogCategory", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enquiryRouter);
app.use("/api/upload", uploadRouter);
app.use("/api", paymentRouter);

app.get("/", (req, res) => {
  app.use(express.static(path.resolve(__dirname, "client", "dist")));
  res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});

// checkout api

// app.post("/api/create-checkout-session", async (req, res) => {
//   const { products } = req.body;
//   console.log(products);
//   const productItems = products.map((product) => ({
//     price_data: {
//       currency: "usd",
//       product_data: {
//         name: product.title,
//       },
//       unit_amount: product.price * 100,
//     },
//     quantity: product.quantity,
//   }));
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: productItems,
//     mode: "payment",
//     success_url: "http://localhost:4000/complete",
//     cancel_url: "http://localhost:4000/cancel",
//   });
//   res.json({ id: session.id });
// });

// app.post("/api/create-checkout-session", async (req, res) => {
// const { products } = req.body;
// console.log(products);
//   try {
//     // const productItems = products.map((product) => ({
//     //   price_data: {
//     //     currency: "usd", // Corrected currency
//     //     product_data: {
//     //       name: product.title,
//     //     },
//     //     unit_amount: product.price * 100,
//     //   },
//     //   quantity: product.quantity,
//     // }));

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"], // Fixed key
//       line_items: [
//         {
//           name: "Samsung Galaxy A20s 3GB Ram 64GB Storage",
//           price: 250,
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: "http://localhost:4000/complete",
//       cancel_url: "http://localhost:4000/cancel",
//     });
//     console.log("Session ID:", session.id);
//     res.json({ id: session.id });
//   } catch (error) {
//     console.error("Error creating checkout session:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// new code
// app.post("/api/checkout-session", async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: req.body.products.map((item) => {
//         return {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: item.title,
//             },
//             unit_amount: item.price * 100,
//           },
//           quantity: item.quantity,
//         };
//       }),
//       success_url: "http://localhost:3000/success",
//       cancel_url: "http://localhost:3000/cancel",
//     });
//     res.json({ url: session.url });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// new code 2

app.post("/api/checkout-session", async (req, res) => {
  console.log(req.body);
  try {
    // Validate request body
    if (!req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const lineItems = req.body.items.map((item) => {
      if (!item.title || !item.price || !item.quantity) {
        throw new Error("Invalid item data");
      }
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
