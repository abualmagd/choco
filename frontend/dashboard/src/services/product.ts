export const uploadFile = async (file: File, key: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/upload?key=" + key,
      {
        method: "POST",
        body: formData,
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY_1!,
        },
      }
    );

    if (res.ok) {
      return await res.json();
    } else {
      throw Error(res.statusText);
    }
  } catch (error) {
    throw Error(String(error));
  }
};

//  formData.append("altText", altText);

export const uploadProductImage = async (
  file: File,
  key: string,
  productId: number,
  altText: string | ""
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("altText", altText);

    const res = await fetch(
      import.meta.env.VITE_BACKEND_URL +
        `/upload/product-image/${productId}?key=` +
        key,
      {
        method: "POST",
        body: formData,
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY_1!,
        },
      }
    );

    if (res.ok) {
      return await res.json();
    } else {
      throw Error(res.statusText);
    }
  } catch (error) {
    throw Error(String(error));
  }
};

export async function getFileFromBlobUrl(blobUrl: string) {
  try {
    // 1. Fetch the blob data
    const response = await fetch(blobUrl);

    // 2. Convert to Blob
    const blob = await response.blob();

    // 3. (Optional) Convert to File if you need filename/type
    const file = new File([blob], "filename.ext", {
      type: blob.type || "application/octet-stream",
    });

    return file;
  } catch (error) {
    console.error("Error fetching blob:", error);
    return null;
  }
}
