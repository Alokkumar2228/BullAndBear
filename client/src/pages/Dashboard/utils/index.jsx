// src/components/Payment.jsx
import axios from "axios";

 const openRazorpayCheckout = (order,authToken) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "My App",
    description: "Payment for course",
    order_id: order.id,
    handler: async (response) => {
      try {
        const verifyRes = await axios.post("http://localhost:8000/api/payment/verify", response,{
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          }
        });
        if (verifyRes.data.success) {
          alert("Payment successful & verified!");
        } else {
          alert("Payment verification failed");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
      }
    },
    prefill: {
      name: "Customer Name",
      email: "customer@example.com",
      contact: "9876543210",
    },
    theme: { color: "#3399cc" },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

export const createOrder = async (amount, authToken) => {
  const { data } = await axios.post("http://localhost:8000/api/payment/create-order", {
    amount: amount*100,
    currency: "INR",
    receipt: "receipt#1",
    notes: { auth_token: authToken },
  },{
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        }
      });

  if (data.success) {
    openRazorpayCheckout(data.order,authToken);
  } else {
    alert("Failed to create order");
  }
};
