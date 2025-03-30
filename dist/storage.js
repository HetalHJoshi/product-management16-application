"use strict";
export function loadProducts() {
    const stored = localStorage.getItem("products");
    try {
        return stored ? JSON.parse(stored) : [];
    }
    catch (error) {
        console.error("Error parsing stored products", error);
        return [];
    }
}
export function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
}
