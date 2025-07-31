export default function AllItems({
  list,
  parent,
  child,
}: {
  list: Array<number> /*model */;
  parent: string;
  child: string;
}) {
  return (
    <div className=" flex  flex-col w-full ">
      <div className=" title-bar flex justify-between mb-3">
        <h1 className=" capitalize font-bold">{child}</h1>
        <div className="position-map md:flex gap-2 hidden">
          <span className="text-gray-300">Dashboard</span>
          <span className="text-gray-300">{">"}</span>
          <span className="text-gray-300">{parent}</span>
          <span className="text-gray-300">{">"}</span>
          <span className=" text-black">{child}</span>
        </div>
      </div>

      <div className=" product-and-filter shadow-md bg-white rounded-md m-2 p-4 text-gray-500">
        <div className="filters flex justify-between items-center">
          <div className="filter-left flex gap-6 items-center">
            <div className=" flex gap-3 items-center">
              <span>show</span>
              <select className="text-sm outline-none text-gray-900  border-0 bg-gray-50 rounded p-1">
                <option value="10">10</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
              <p>enteries</p>
            </div>

            <form className="w-72 mx-auto">
              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
              >
                Search
              </label>
              <div className="flex border h-10 border-gray-300 rounded-lg bg-gray-50 pr-2">
                <input
                  type="search"
                  id="default-search"
                  className="block w-full py-4 ps-4 text-sm outline-none text-gray-900  border-0 "
                  placeholder="Search..."
                  required
                />
                <button type="submit" className="cursor-pointer">
                  {" "}
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          <button className=" border rounded border-pink-400 px-2 py-1 cursor-pointer">
            Add new +
          </button>
        </div>
        <div className="divider h-5"></div>
        {/*products table  */}

        <table id="default-table" className=" w-full">
          <thead className=" bg-[#F6F6F6] h-10">
            <tr>
              <th>
                <span className="flex items-center pl-2">Name</span>
              </th>
              <th data-type="date" data-format="YYYY/DD/MM">
                <span className="flex items-center">Release Date</span>
              </th>
              <th>
                <span className="flex items-center">NPM Downloads</span>
              </th>
              <th>
                <span className="flex items-center">Growth</span>
              </th>
              <th>
                <span className="flex items-center">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((product, index) => {
              return (
                <ProductTr
                  product={{
                    title: product.toString(),
                    slug: undefined,
                    id: undefined,
                  }}
                  index={index}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

declare type model = {
  title: string;
  slug: string | undefined;
  id: number | undefined;
};
const ProductTr = ({ product, index }: { product: model; index: number }) => {
  return (
    <tr
      key={product.title ?? "lmfmk"}
      className={` h-10 ${
        index % 2 == 0 ? "bg-transparent " : " bg-[#F6F6F6] "
      }`}
    >
      <td className="font-medium pl-2 text-gray-900 whitespace-nowrap dark:text-white">
        React {product.title ?? " "}
      </td>
      <td>2013/24/05</td>
      <td>4500000</td>
      <td>24%</td>
      <td>+ - X</td>
    </tr>
  );
};
