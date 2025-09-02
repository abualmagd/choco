import { getOrderHash } from "../utils/api";

export default (data) => ({
  amount: data.order.total ?? 0,
  hash: null,
  currency: data.currency,
  orderId: data.order.id,
  merchantId: "MID-25920-522",
  merchantRedirect: encodeURIComponent("http://localhost.com/redirect"),
  serverWebhook: encodeURIComponent("http://localhost.com/webhook"),
  mode: "test",
  metaData: encodeURIComponent(JSON.stringify(data.user)),
  failureRedirect: false,
  type: "external",
  display: data.language || "en",
  manualCapture: false,
  customer: JSON.stringify(data.user),
  saveCard: "optional",
  interactionSource: "Ecommerce",
  enable3DS: "true",
  error: null,
  isLoading: true,

  async init() {
    try {
      const response = await getOrderHash(this.orderId, this.currency);
      this.hash = response.data.hash;
      this.isLoading = false;

      // Load Kashier script only after hash is ready
      this.$nextTick(() => {
        //this.loadKashierScript();
      });
    } catch (error) {
      this.error = error;
      this.isLoading = false;
    }
  },

  loadKashierScript() {
    // 1. Check if the script element already exists in the DOM. This is the most reliable method.
    if (!document.getElementById("kashier-script")) {
      const script = document.createElement("script");
      script.id = "kashier-script";
      script.src = "https://checkout.kashier.io/kashier-checkout.js";
      script.onload = () => {
        console.log("Kashier script loaded successfully");
        // No need to set a state variable, the DOM check is sufficient
      };
      script.onerror = () => {
        this.error = new Error("Failed to load Kashier script");
      };
      document.head.appendChild(script);
    } else {
      console.log("Kashier script already loaded, skipping.");
    }
  },
});
