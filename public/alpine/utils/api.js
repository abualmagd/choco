window.updateUserData = async (data, id) => {
  try {
    await fetch("/api/user/update/" + id, {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key":
          "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
      },
      method: "POST",
      credentials: "include",
    });
    // window.location.reload();
  } catch (error) {
    window.notify(error);
    console.log(error, " from logout");
  }
};

window.logoutCurrentUser = async () => {
  console.log("log out");
  try {
    await fetch("/api/auth/logout", {
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
        "x-api-key":
          "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
      },
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  } catch (error) {
    window.notify(error);
    console.log(error, " from logout");
  }
};

window.addNewAddress = async (data) => {
  try {
    const res = await fetch("/api/user/address", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key":
          "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
      },
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      throw Error(res.statusText);
    }
    return res.json();
  } catch (error) {
    window.notify(error);
    console.log(error, " from logout");
  }
};

window.updateAddress = async (data) => {
  try {
    const res = await fetch("/api/user/address", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key":
          "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
      },
      method: "PUT",
      credentials: "include",
    });
    if (!res.ok) {
      throw Error(res.statusText);
    } else {
      return res.json();
    }
  } catch (error) {
    window.notify(error);
    console.log(error, " from update adress");
  }
};

window.updateItemQuatity = async (id, quantity) => {
  const res = await fetch(`/api/cart/${id}?quantity=${quantity}`, {
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
      "x-api-key":
        "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
    },
    method: "PUT",
    credentials: "include",
  });
  if (!res.ok) {
    throw Error(res.statusText);
  } else {
    return res.json();
  }
};

window.removeCartItem = async (id) => {
  const res = await fetch("/api/cart/" + id, {
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
      "x-api-key":
        "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
    },
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    console.log(res);
    throw Error(res.statusText);
  } else {
    return res.json();
  }
};

// to backend return cart total price
window.cartTotalPrice = async () => {
  const res = await fetch(`/api/cart`, {
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
      "x-api-key":
        "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
    },
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw Error(res.statusText);
  } else {
    const data = await res.json();
    let total;
    for (item in data.items) {
      const pr = item.product
        ? item.quantity * item.product.price
        : item.quantity * item.variant.price;
      total += pr;
    }

    return total;
  }
};
