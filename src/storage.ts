"use strict";

import { Product } from "./types";

export function loadProducts(): Product[] {
  const stored = localStorage.getItem("products");
  try {
    return stored ? (JSON.parse(stored) as Product[]) : [];
  } catch (error) {
    console.error("Error parsing stored products", error);
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem("products", JSON.stringify(products));
}
