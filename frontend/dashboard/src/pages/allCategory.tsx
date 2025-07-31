import AllItems from "../components/allItems";

export default function AllCategories() {
  const list = [
    1, 2, 3, 1, 2, 3, 21, 52, 52, 15, 2, 51, 52, 14, 52, 51, 52, 5, 2,
  ];
  return (
    <AllItems list={list} parent={"categories"} child={"All categories"} />
  );
}
