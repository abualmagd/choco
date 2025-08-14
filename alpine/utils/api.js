import { notify } from "./services";

export const updateUserData = async (data, id) => {
  try {
    await fetch("/api/user/update/" + id, {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "POST",
      credentials: "include",
    });
    // window.location.reload();
  } catch (error) {
    notify(error);
    console.log(error, " from logout");
  }
};

export const logoutCurrentUser = async () => {
  console.log("log out");
  try {
    await fetch("/api/auth/logout", {
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  } catch (error) {
    notify(error);
  }
};

export const addNewAddress = async (data) => {
  try {
    const res = await fetch("/api/user/address", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      throw Error(res.statusText);
    }
    return res.json();
  } catch (error) {
    notify(error);
  }
};

export const updateAddress = async (data) => {
  try {
    const res = await fetch("/api/user/address", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
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
    notify(error);
  }
};

export const updateItemQuatity = async (id, quantity) => {
  const res = await fetch(`/api/cart/${id}?quantity=${quantity}`, {
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY_1,
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

export const removeCartItem = async (id) => {
  const res = await fetch("/api/cart/" + id, {
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY_1,
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
export const cartTotalPrice = async () => {
  const res = await fetch(`/api/cart/total`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY_1,
    },
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw Error(res.statusText);
  } else {
    const data = await res.json();
    return data.data;
  }
};

export const addToCartApi = async function AddToCart(data) {
  try {
    const response = await fetch("/api/cart/add", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "POST",
    });

    if (!response.ok) {
      console.info("res", response);
      throw new Error("Failed to add to cart");
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const addToWishList = async (data) => {
  try {
    const response = await fetch("/api/wishItems", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.statusText === "Unauthorized") {
        throw new Error("Unauthorized");
      } else {
        throw new Error("Failed to add to wishlist");
      }
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const removeFromWishList = async (id) => {
  try {
    const response = await fetch(`/api/wishItems/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.statusText === "Unauthorized") {
        throw new Error("Unauthorized");
      } else {
        throw new Error("Failed to add to wishlist");
      }
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const loginEmail = async (data) => {
  try {
    const response = await fetch("/api/auth/login", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("wrong email or password");
      throw new Error("Failed to login");
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const registerEmail = async (data) => {
  try {
    const response = await fetch("/api/auth/register", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401)
        throw new Error("user may be registered before");
      throw new Error("Failed to register");
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await fetch("/api/auth/logout", {
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  } catch (error) {
    notify(error);
  }
};

export const createOrder = async (data) => {
  try {
    const response = await fetch("/api/order-items", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "POST",
      credentials: "include",
    });
    console.log(response);
    if (!response.ok) {
      if (response.statusText === "Unauthorized") {
        throw new Error("Unauthorized");
      } else {
        throw new Error("Failed to add to wishlist");
      }
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateOrderById = async (id, data) => {
  try {
    const response = await fetch("/api/orders" + id, {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY_1,
      },
      method: "PUT",
      credentials: "include",
    });
    console.log(response);
    if (!response.ok) {
      if (response.statusText === "Unauthorized") {
        throw new Error("Unauthorized");
      } else {
        throw new Error("Failed to add to wishlist");
      }
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
