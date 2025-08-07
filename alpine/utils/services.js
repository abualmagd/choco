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
