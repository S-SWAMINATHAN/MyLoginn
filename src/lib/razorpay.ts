import Razorpay from "razorpay";
<<<<<<< HEAD
import { getRequiredServerEnv } from "./env";
=======
>>>>>>> 9a00051 (Initial commit)

let client: Razorpay | null = null;

export function getRazorpayClient() {
  if (!client) {
    client = new Razorpay({
<<<<<<< HEAD
      key_id: getRequiredServerEnv("RAZORPAY_KEY_ID"),
      key_secret: getRequiredServerEnv("RAZORPAY_KEY_SECRET"),
=======
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
>>>>>>> 9a00051 (Initial commit)
    });
  }
  return client;
}
