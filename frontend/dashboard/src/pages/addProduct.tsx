import { useEffect, useState, type ChangeEvent } from "react";
import { getAllCategories } from "../services/category";
import { getFileFromBlobUrl, uploadProductImage } from "../services/product";
import { v4 as uuidv4 } from "uuid";

declare type Image = {
  src: string;
  altText: string;
};

export default function AddProduct() {
  const [images, updateImages] = useState<Array<Image>>([]);
  const [myProduct, updateMyProduct] = useState<Product>({
    id: undefined,
    allowBackorder: undefined,
    trackInventory: undefined,
    name: " ",
    slug: "",
    description: "",
    price: 0,
    compareAtPrice: 0,
    costPrice: 0,
    sku: "",
    brand: "",
    inventoryQuantity: 0,
    weight: undefined,
    height: undefined,
    width: undefined,
    length: undefined,
    isActive: undefined,
    isFeatured: undefined,
    isDigital: undefined,
    downloadUrl: undefined,
    seoTitle: undefined,
    seoDescription: undefined,
    categories: [],
    images: [],
  });

  const [categories, updateCategories] = useState([]);

  const handleChangeInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    updateMyProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    updateMyProduct((prev) => ({
      ...prev,
      [e.target.name]: e.target.value === "on" ? true : false,
    }));
  };

  const handleChangeCategory = (e: ChangeEvent<HTMLSelectElement>) => {
    updateMyProduct((prev) => ({
      ...prev,
      Category: [e.target.value],
    }));
  };

  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log("files", e.target.files);
      const url = URL.createObjectURL(e.target.files[0]);
      updateImages((prev) => [...prev, { src: url, altText: "" }]);
    }
  };

  const updateAltTEXTOfImage = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target?.value) {
      updateImages((prev) =>
        prev.map((image, i) =>
          i === index ? { ...image, altText: e.target.value } : image
        )
      );
    }
  };

  /**after create product  */
  const uploadImagesToBackend = async (productId: number) => {
    for (let index = 0; index < images.length; index++) {
      try {
        const file = await getFileFromBlobUrl(images[index].src);
        const key = uuidv4();
        await uploadProductImage(file!, key, productId, images[index].altText);
      } catch (error) {
        console.log(error);
        /**toastify here  */
      }
    }
  };

  const remove = (src: string) => {
    const filtered = images?.filter((image) => image.src !== src);
    updateImages(filtered);
  };

  useEffect(() => {
    async function fetch() {
      const catgs = await getAllCategories();
      if (catgs) {
        updateCategories(catgs);
      }
    }
    fetch();
  }, []);

  return (
    <div className=" flex flex-col  h-fit overflow-x-hidden flex-1 px-3">
      <div className=" title-bar flex justify-between mb-3">
        <h1 className=" capitalize font-bold">add products</h1>
        <div className="position-map md:flex gap-2 hidden">
          <span className="text-gray-300">Dashboard</span>
          <span className="text-gray-300">{">"}</span>
          <span className="text-gray-300">products</span>
          <span className="text-gray-300">{">"}</span>
          <span className=" text-black">add product</span>
        </div>
      </div>
      <div className="h-5"></div>
      {/**image partition */}
      <div className="upload-image  overflow-x-hidden md:min-h-64 rounded shadow flex flex-col">
        <h2 className=" font-semibold capitalize m-2">upload images</h2>
        <div className="flex md:flex-row w-full flex-col gap-6 justify-between p-10">
          {/*image displayer */}
          <div className=" image-lists flex flex-wrap  overflow-x-hidden md:w-96 w-full gap-3 ">
            {images.map((image, i) => {
              return (
                <ImageShower
                  src={image.src}
                  remove={() => remove(image.src)}
                  updateAltTxt={updateAltTEXTOfImage}
                  index={i}
                />
              );
            })}
          </div>

          {/*image uploader */}
          <div className="w-44  h-full">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50  dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span>
                  </p>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadImage(e)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/**product partition */}
      <div className=" w-full rounded-md shadow flex flex-col gap-5 mt-5 p-5 ">
        {/**product name */}
        <div>
          <label
            htmlFor="product_name"
            className="block mb-2 text-sm font-medium text-gray-900 "
          >
            Product name <span className=" text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            onChange={handleChangeInput}
            id="product_name"
            className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
            placeholder="name"
            required
          />
        </div>

        {/**product slug */}
        <div>
          <label
            htmlFor="product_slug"
            className="block mb-2 text-sm font-medium text-gray-900 "
          >
            Product slug <span className=" text-red-400">*</span>
          </label>
          <input
            type="text"
            id="product_slug"
            name="slug"
            onChange={handleChangeInput}
            className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
            placeholder="title"
            required
          />
        </div>

        {/**product description */}
        <div>
          <label
            htmlFor="product_descr"
            className="block mb-2 text-sm font-medium text-gray-900 "
          >
            Product description <span className=" text-red-400">*</span>
          </label>
          <textarea
            maxLength={250}
            id="product_descr"
            name="description"
            onChange={handleChangeInput}
            className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
            placeholder="product description"
            required
          />
        </div>

        {/**product seo title */}
        <div>
          <label
            htmlFor="product_title"
            className="block mb-2 text-sm font-medium text-gray-900 "
          >
            seo title
          </label>
          <input
            type="text"
            id="product_title"
            name="seoTitle"
            onChange={handleChangeInput}
            className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
            placeholder="seo title"
          />
        </div>

        {/**Seo description */}
        <div>
          <label
            htmlFor="seo_descr"
            className="block mb-2 text-sm font-medium text-gray-900 "
          >
            Seo description
          </label>
          <textarea
            maxLength={250}
            id="seo_descr"
            name="seoDescription"
            onChange={handleChangeInput}
            className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
            placeholder="seo description"
          />
        </div>

        {/**category */}
        <div>
          <label
            htmlFor="catehory"
            className="block mb-2 text-sm font-medium text-gray-900 "
          >
            Category: <span className=" text-red-400">*</span>
          </label>
          <select
            onChange={handleChangeCategory}
            id="category"
            className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
          >
            {categories!.map((category: Category, i: number) => {
              return (
                <option value={category.id} key={i}>
                  {category.name}
                </option>
              );
            })}
          </select>
        </div>

        {/**small inputs */}
        <div className=" flex gap-6 flex-wrap justify-between">
          {/**price */}
          <div>
            <label
              htmlFor="product_price"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Price <span className=" text-red-400">*</span>
            </label>
            <input
              type="number"
              id="product_price"
              name="price"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="00"
              required
            />
          </div>

          {/** compareAtPrice */}
          <div>
            <label
              htmlFor="compareAtPrice"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Compare At Price <span className=" text-red-400">*</span>
            </label>
            <input
              type="number"
              id="compareAtPrice"
              name="compareAtPrice"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="00"
              required
            />
          </div>

          {/**costPrice */}
          <div>
            <label
              htmlFor="cost_price"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Cost Price <span className=" text-red-400">*</span>
            </label>
            <input
              type="number"
              id="cost_price"
              name="costPrice"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="00"
              required
            />
          </div>

          {/**inventoryQuantity */}
          <div>
            <label
              htmlFor="inventory_quantity"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Stock <span className=" text-red-400">*</span>
            </label>
            <input
              type="number"
              id="inventory_quantity"
              name="inventoryQuantity"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="00"
              required
            />
          </div>

          {/**brand */}
          <div>
            <label
              htmlFor="brand"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Brand <span className=" text-red-400">*</span>
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="polo"
              required
            />
          </div>

          {/**sku */}

          <div>
            <label
              htmlFor="sku"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Sku <span className=" text-red-400">*</span>
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="sku"
              required
            />
          </div>

          {/**  weight        */}
          <div>
            <label
              htmlFor="weight"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Weight
            </label>
            <input
              name="weight"
              onChange={handleChangeInput}
              type="number"
              id="weight"
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="10gm"
            />
          </div>

          {/**       height         */}
          <div>
            <label
              htmlFor="height"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Height
            </label>
            <input
              type="number"
              id="height"
              name="height"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="10cm"
            />
          </div>

          {/**       length         */}
          <div>
            <label
              htmlFor="length"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              length
            </label>
            <input
              type="number"
              id="length"
              name="length"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="10cm"
            />
          </div>

          {/**       width         */}
          <div>
            <label
              htmlFor="width"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Width
            </label>
            <input
              type="number"
              id="width"
              name="width"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="10cm"
            />
          </div>

          {/**optionValues */}
          <div>
            <label
              htmlFor="color"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Color
            </label>
            <input
              type="text"
              id="color"
              name="color"
              onChange={handleChangeInput}
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
              placeholder="Red"
            />
          </div>

          <div>
            <label
              htmlFor="size"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Size
            </label>
            <select
              name="size"
              onChange={handleChangeInput}
              id="size"
              className="bg-gray-50 border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  block w-full p-2.5  "
            >
              <option value={"xl"}>Xl</option>
              <option value={"lg"}>lG</option>
              <option value={"md"}>MD</option>
              <option value={"sm"}>SM</option>
              <option value={"xs"}>XS</option>
            </select>
          </div>

          {/**  isActive*/}
          <div className="flex items-center w-full">
            <input
              id="aactive-checkbox"
              type="checkbox"
              name="isActive"
              onChange={handleChangeCheckbox}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500   focus:ring-2"
            />
            <label
              htmlFor="active-checkbox"
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              isActive
            </label>
          </div>

          {/**  isFeatured  */}
          <div className="flex items-center w-full">
            <input
              id="checked-checkbox"
              type="checkbox"
              name="isFeatured"
              onChange={handleChangeCheckbox}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500   focus:ring-2"
            />
            <label
              htmlFor="checked-checkbox"
              className="ms-2 text-sm font-medium text-gray-900"
            >
              isFeatured
            </label>
          </div>

          {/*isDigital */}
          <div className="flex items-center">
            <input
              id="isDigital-checkbox"
              type="checkbox"
              name="isDigital"
              onChange={handleChangeCheckbox}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500   focus:ring-2"
            />
            <label
              htmlFor="isDigital-checkbox"
              className="ms-2 text-sm font-medium text-gray-900"
            >
              isDigital
            </label>
          </div>
        </div>

        <div className=" flex md:w-1/2 w-full gap-3 my-3">
          <button
            onClick={() => console.log(myProduct)}
            className=" bg-amber-300 w-full p-2 rounded text-center cursor-pointer hover:scale-105 hover:bg-amber-200 font-semibold capitalize"
          >
            Add product
          </button>
          <button className="w-full p-2 rounded text-center border cursor-pointer hover:scale-105 hover:shadow font-semibold capitalize">
            cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const ImageShower = ({
  src,
  remove,
  updateAltTxt,
  index,
}: {
  src: string;
  remove: () => void;
  updateAltTxt: (e: ChangeEvent<HTMLInputElement>, i: number) => void;
  index: number;
}) => {
  return (
    <div className=" h-52 w-44 rounded-md relative border ">
      <button
        className="absolute top-0 right-0 cursor-pointer bg-gray-200 items-center rounded-full w-8 h-8"
        onClick={() => remove()}
      >
        X
      </button>
      <img src={src} alt="nothing" className=" rounded-md w-full h-[80%]" />
      <input
        type="text"
        name="altText"
        id="altText"
        placeholder="altText"
        className=" bg-gray-200 outline-none p-1 w-full rounded-md"
        onChange={(e) => updateAltTxt(e, index)}
      />
    </div>
  );
};
