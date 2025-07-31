import { useState } from "react";

declare type Image = {
  src: string;
  altText: string;
};

export default function AddProduct() {
  const [images, updateImages] = useState<Array<Image>>([]);

  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log("files", e.target.files);
      const url = URL.createObjectURL(e.target.files[0]);
      images?.push({ src: url, altText: "" });
      console.log("imgs", images);
      updateImages(images);
    }
  };

  const remove = (src: string) => {
    console.log("removed");
    const filtered = images?.filter((image) => image.src !== src);
    updateImages(filtered);
  };

  return (
    <div className=" flex flex-col w-full px-3">
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
      <div className="upload-image w-full h-64 rounded shadow flex flex-col">
        <h2 className=" font-semibold capitalize m-2">upload images</h2>
        <div className="flex flex-row gap-6 justify-between p-10">
          {/*image displayer */}
          <div className=" image-lists flex gap-3 ">
            {images.map((image) => {
              return (
                <ImageShower src={image.src} remove={() => remove(image.src)} />
              );
            })}
          </div>

          {/*image uploader */}
          <div className="w-64 h-full">
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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
    </div>
  );
}

const ImageShower = ({ src, remove }: { src: string; remove: () => void }) => {
  return (
    <div className="h-60 w-44 rounded relative bg-amber-300">
      <button className="absolute top-0 right-0" onClick={() => remove()}>
        X
      </button>
      <img src={src} alt="nothing" className=" w-full h-[80%]" />
      <input type="text" name="altText" id="altText" placeholder="altText" />
    </div>
  );
};
