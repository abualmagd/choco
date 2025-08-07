import Alpine from "alpinejs";
import productGalleryStore from "./stores/productGalleryStore";
import cartStore from "./stores/cartStore";
import favoriteComponent from "./components/favoriteComponent";
import authModalComponent from "./components/authModalComponent";
import accountComponent from "./components/accountComponent";
import adressComponent from "./components/adressComponent";
import itemComponent from "./components/itemComponent";
import cartComponent from "./components/cartComponent";

window.Alpine = Alpine;

Alpine.store("productGallery", productGalleryStore);

Alpine.store("cart", cartStore);

Alpine.data("cartComponent", cartComponent);

Alpine.data("favoriteComponent", favoriteComponent);

Alpine.data("authModalComponent", authModalComponent);

Alpine.data("accountComponent", accountComponent);

Alpine.data("adressComponent", adressComponent);

Alpine.data("itemCartComponent", itemComponent);

Alpine.start();
