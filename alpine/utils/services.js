export const notify = (message, error = false) => {
  Toastify({
    text: message,
    gravity: "bottom",
    stopOnFocus: true,
    position: "center",
    close: true,
    duration: 3000,
    style: {
      background: error
        ? "linear-gradient(to right, #c62336, #f94845)"
        : "linear-gradient(to right, #3fea2c, #31c47f)",
    },
  }).showToast();
};

export const convertCartItemToOrderItem = (cartItem) => {
  return {
    productId: cartItem.product?.id,
    variantId: cartItem.variant?.id,
    price: cartItem.product.price,
    quantity: cartItem.quantity,
    total: cartItem.quantity * cartItem.product.price,
  };
};

export const generatRandomNumber = () => {
  return (
    Math.floor(100000 + Math.random() * 900000).toString() +
    Math.floor(100000 + Math.random() * 900000).toString()
  );
};
