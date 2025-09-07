import { getOrderHash } from "../utils/api";

export default (data) => ({
  amount: data.order.total ?? 0, // Format to 2 decimal places
  hash: null,
  currency: data.currency || "EGP",
  orderId: data.order.id.toString(), // Ensure it's a string
  merchantId: "MID-25920-522",
  merchantRedirect: "https://hungry-rings-rhyme.loca.lt/redirect", // Use actual port
  serverWebhook: "https://hungry-rings-rhyme.loca.lt/order/webhook", // Use actual port
  mode: "test",
  metaData: JSON.stringify({
    order_id: data.order.id,
    user_id: data.user?.id,
  }),
  failureRedirect: "false",
  type: "external",
  display: data.language || "en",
  manualCapture: "false",
  customer: JSON.stringify({
    reference: data.user?.id?.toString() || "guest",
    first_name: data.user?.firstName || "Guest",
    last_name: data.user?.lastName || "User",
    email: data.user?.email || "guest@example.com",
    phone: data.user?.phone || "",
  }),
  saveCard: "optional",
  interactionSource: "Ecommerce",
  enable3DS: "true",
  error: null,
  isLoading: true,

  async init() {
    try {
      const response = await getOrderHash(this.orderId, this.currency);

      if (response && response.data && response.data.hash) {
        this.hash = response.data.hash;
        this.isLoading = false;

        // Wait for next tick and initialize Kashier
        this.$nextTick(() => {
          this.initializeKashier();
        });
      } else {
        throw new Error("Invalid hash response from server");
      }
    } catch (error) {
      console.error("Error loading payment:", error);
      this.error = error.message || "Failed to load payment";
      this.isLoading = false;
    }
  },

  initializeKashier() {
    if (!this.hash) return;

    // Clean up any existing iframe
    const container = document.getElementById("kashier-checkout-container");
    if (!container) return;

    container.innerHTML = "";

    // Create the script element programmatically
    const script = document.createElement("script");
    script.id = "kashier-iFrame";
    script.src = "https://payments.kashier.io/kashier-checkout.js";

    // Set all data attributes
    script.setAttribute("data-amount", this.amount);
    script.setAttribute("data-hash", this.hash);
    script.setAttribute("data-currency", this.currency);
    script.setAttribute("data-orderId", this.orderId);
    script.setAttribute("data-merchantId", this.merchantId);
    script.setAttribute("data-merchantRedirect", this.merchantRedirect);
    script.setAttribute("data-serverWebhook", this.serverWebhook);
    script.setAttribute("data-mode", this.mode);
    script.setAttribute("data-metaData", this.metaData);
    script.setAttribute("data-failureRedirect", this.failureRedirect);
    script.setAttribute("data-type", this.type);
    script.setAttribute("data-display", this.display);
    script.setAttribute("data-manualCapture", this.manualCapture);
    script.setAttribute("data-customer", this.customer);
    script.setAttribute("data-saveCard", this.saveCard);
    script.setAttribute("data-interactionSource", this.interactionSource);
    script.setAttribute("data-enable3DS", this.enable3DS);
    script.setAttribute(
      "data-allowedMethods",
      "card, bank_installments, wallet, fawry"
    );

    script.onload = () => {
      console.log("Kashier script loaded successfully");
    };

    script.onerror = () => {
      this.error = "Failed to load Kashier payment script";
    };

    container.appendChild(script);
  },
});
