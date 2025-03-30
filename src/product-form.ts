"use strict";

import {
  loadProducts as loadFromStorage,
  saveProducts as saveToStorage,
} from "./storage.js";
import { showSuccessModal } from "./modal.js";
import { Product } from "./types";

let products: Product[] = [];
let editingProductId: string | null = null;
let isEditMode: boolean = false;

document.addEventListener("DOMContentLoaded", () => {
  products = loadFromStorage();

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const id = urlParams.get("id");

  if (mode === "edit" && id) {
    isEditMode = true;
    editingProductId = id;
    const product = products.find((p) => p.id === editingProductId);
    if (product) {
      const pageHeader = document.getElementById("pageHeader");
      if (pageHeader) {
        pageHeader.textContent = "Edit Product";
      }

      const productName = document.getElementById(
        "productName"
      ) as HTMLInputElement | null;
      if (productName) {
        productName.value = product.name;
      }

      const productPrice = document.getElementById(
        "productPrice"
      ) as HTMLInputElement | null;
      if (productPrice) {
        productPrice.value = product.price;
      }

      const productDescription = document.getElementById(
        "productDescription"
      ) as HTMLInputElement | null;
      if (productDescription) {
        productDescription.value = product.description;
      }

      const imagePreview = document.getElementById(
        "imagePreview"
      ) as HTMLImageElement | null;
      if (imagePreview) {
        imagePreview.src = product.image;
      }
    }
  }

  const productForm = document.getElementById("productForm");
  if (productForm) {
    productForm.addEventListener("submit", handleFormSubmit);
  }

  const productImage = document.getElementById(
    "productImage"
  ) as HTMLInputElement | null;
  if (productImage) {
    productImage.addEventListener("change", previewImage);
  }

  setupLiveValidation();
});

const handleFormSubmit = (e: Event): void => {
  e.preventDefault();

  const nameEl = document.getElementById(
    "productName"
  ) as HTMLInputElement | null;
  const priceEl = document.getElementById(
    "productPrice"
  ) as HTMLInputElement | null;
  const descriptionEl = document.getElementById(
    "productDescription"
  ) as HTMLInputElement | null;
  const imageEl = document.getElementById(
    "productImage"
  ) as HTMLInputElement | null;

  if (!nameEl || !priceEl || !descriptionEl || !imageEl) return;

  let isValid = true;

  // Validate name
  if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
    nameEl.classList.add("is-invalid");
    isValid = false;
  } else {
    nameEl.classList.remove("is-invalid");
  }

  // Validate price
  if (
    !priceEl.value.trim() ||
    isNaN(Number(priceEl.value)) ||
    Number(priceEl.value) <= 0
  ) {
    priceEl.classList.add("is-invalid");
    isValid = false;
  } else {
    priceEl.classList.remove("is-invalid");
  }

  // Validate description
  if (!descriptionEl.value.trim() || descriptionEl.value.trim().length < 10) {
    descriptionEl.classList.add("is-invalid");
    isValid = false;
  } else {
    descriptionEl.classList.remove("is-invalid");
  }

  // Validate image
  const file: File | undefined = imageEl.files?.[0];
  if (!isEditMode && !file) {
    imageEl.classList.add("is-invalid");
    isValid = false;
  } else if (file && (!file.type.startsWith("image/") || file.size > 1048576)) {
    imageEl.classList.add("is-invalid");
    isValid = false;
  } else {
    imageEl.classList.remove("is-invalid");
  }

  if (!isValid) return;

  const nameValue: string = nameEl.value.trim();
  const priceValue: string = priceEl.value.trim();
  const descriptionValue: string = descriptionEl.value.trim();

  if (file) {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        saveProduct(nameValue, result, priceValue, descriptionValue);
      }
    };
    reader.readAsDataURL(file);
  } else if (editingProductId) {
    const existingProduct = products.find((p) => p.id === editingProductId);
    if (existingProduct) {
      saveProduct(
        nameValue,
        existingProduct.image,
        priceValue,
        descriptionValue
      );
    }
  }
};

function saveProduct(
  name: string,
  image: string,
  price: string,
  description: string
): void {
  if (editingProductId) {
    const index = products.findIndex((p) => p.id === editingProductId);
    if (index !== -1) {
      products[index] = {
        id: editingProductId,
        name,
        image,
        price,
        description,
      };
    }
  } else {
    products.push({
      id: Date.now().toString(),
      name,
      image,
      price,
      description,
    });
  }
  saveToStorage(products);
  const message: string = editingProductId
    ? "Product updated successfully!"
    : "Product added successfully!";
  showSuccessModal(message, true);
}

function previewImage(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file: File | undefined = target.files?.[0];
  if (file && file.size > 1048576) {
    alert("Image file size should not exceed 1MB.");
    target.value = "";
    const imagePreview = document.getElementById(
      "imagePreview"
    ) as HTMLImageElement | null;
    if (imagePreview) {
      imagePreview.src =
        "https://placehold.co/300x300?text=Product+Image&font=roboto";
    }
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const imagePreview = document.getElementById(
      "imagePreview"
    ) as HTMLImageElement | null;
    if (imagePreview) {
      imagePreview.src = reader.result as string;
    }
  };
  if (file) {
    reader.readAsDataURL(file);
  }
}

function setupLiveValidation(): void {
  const nameEl = document.getElementById(
    "productName"
  ) as HTMLInputElement | null;
  const priceEl = document.getElementById(
    "productPrice"
  ) as HTMLInputElement | null;
  const descriptionEl = document.getElementById(
    "productDescription"
  ) as HTMLInputElement | null;
  const imageEl = document.getElementById(
    "productImage"
  ) as HTMLInputElement | null;

  if (!nameEl || !priceEl || !descriptionEl || !imageEl) return;

  nameEl.addEventListener("input", () => {
    const value = nameEl.value.trim();
    nameEl.classList.toggle("is-invalid", value.length < 2);
  });

  priceEl.addEventListener("input", () => {
    const value = parseFloat(priceEl.value);
    priceEl.classList.toggle("is-invalid", isNaN(value) || value <= 0);
  });

  descriptionEl.addEventListener("input", () => {
    const value = descriptionEl.value.trim();
    descriptionEl.classList.toggle("is-invalid", value.length < 10);
  });

  imageEl.addEventListener("change", () => {
    const file: File | undefined = imageEl.files?.[0];
    const isAddMode: boolean = !window.location.search.includes("edit");
    if (!file && isAddMode) {
      imageEl.classList.add("is-invalid");
    } else if (
      file &&
      (!file.type.startsWith("image/") || file.size > 1048576)
    ) {
      imageEl.classList.add("is-invalid");
    } else {
      imageEl.classList.remove("is-invalid");
    }
  });
}
