export const getAllCategories = async () => {
  try {
    const res = await fetch("http://[::1]:3000/api/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY_1!,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      throw Error(res.statusText);
    }
  } catch (error) {
    throw Error(String(error));
  }
};
