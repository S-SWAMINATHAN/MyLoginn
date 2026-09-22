import Razorpay from "razorpay";
import { getRequiredServerEnv } from "./env";

let client: Razorpay | null = null;

export function getRazorpayClient() {
  if (!client) {
    client = new Razorpay({
      key_id: getRequiredServerEnv("RAZORPAY_KEY_ID"),
      key_secret: getRequiredServerEnv("RAZORPAY_KEY_SECRET"),
    });
  }
  return client;
}
