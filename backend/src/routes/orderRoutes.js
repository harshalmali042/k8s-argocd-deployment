import express from "express";
import {
  getAllOrders,
  trackOrder,
  createOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.route("/")
  .get(getAllOrders)
  .post(createOrder);

router.get("/track/:trackingId", trackOrder);

export default router;
