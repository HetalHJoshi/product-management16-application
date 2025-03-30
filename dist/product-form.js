"use strict";
import { loadProducts as loadFromStorage, saveProducts as saveToStorage, } from "./storage.js";
import { showSuccessModal } from "./modal.js";
let products = [];
let editingProductId = null;
let isEditMode = false;
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
            const productName = document.getElementById("productName");
            if (productName) {
                productName.value = product.name;
            }
            const productPrice = document.getElementById("productPrice");
            if (productPrice) {
                productPrice.value = product.price;
            }
            const productDescription = document.getElementById("productDescription");
            if (productDescription) {
                productDescription.value = product.description;
            }
            const imagePreview = document.getElementById("imagePreview");
            if (imagePreview) {
                imagePreview.src = product.image;
            }
        }
    }
    const productForm = document.getElementById("productForm");
    if (productForm) {
        productForm.addEventListener("submit", handleFormSubmit);
    }
    const productImage = document.getElementById("productImage");
    if (productImage) {
        productImage.addEventListener("change", previewImage);
    }
    setupLiveValidation();
});
const handleFormSubmit = (e) => {
    var _a;
    e.preventDefault();
    const nameEl = document.getElementById("productName");
    const priceEl = document.getElementById("productPrice");
    const descriptionEl = document.getElementById("productDescription");
    const imageEl = document.getElementById("productImage");
    if (!nameEl || !priceEl || !descriptionEl || !imageEl)
        return;
    let isValid = true;
    // Validate name
    if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
        nameEl.classList.add("is-invalid");
        isValid = false;
    }
    else {
        nameEl.classList.remove("is-invalid");
    }
    // Validate price
    if (!priceEl.value.trim() ||
        isNaN(Number(priceEl.value)) ||
        Number(priceEl.value) <= 0) {
        priceEl.classList.add("is-invalid");
        isValid = false;
    }
    else {
        priceEl.classList.remove("is-invalid");
    }
    // Validate description
    if (!descriptionEl.value.trim() || descriptionEl.value.trim().length < 10) {
        descriptionEl.classList.add("is-invalid");
        isValid = false;
    }
    else {
        descriptionEl.classList.remove("is-invalid");
    }
    // Validate image
    const file = (_a = imageEl.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!isEditMode && !file) {
        imageEl.classList.add("is-invalid");
        isValid = false;
    }
    else if (file && (!file.type.startsWith("image/") || file.size > 1048576)) {
        imageEl.classList.add("is-invalid");
        isValid = false;
    }
    else {
        imageEl.classList.remove("is-invalid");
    }
    if (!isValid)
        return;
    const nameValue = nameEl.value.trim();
    const priceValue = priceEl.value.trim();
    const descriptionValue = descriptionEl.value.trim();
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            var _a;
            const result = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
            if (typeof result === "string") {
                saveProduct(nameValue, result, priceValue, descriptionValue);
            }
        };
        reader.readAsDataURL(file);
    }
    else if (editingProductId) {
        const existingProduct = products.find((p) => p.id === editingProductId);
        if (existingProduct) {
            saveProduct(nameValue, existingProduct.image, priceValue, descriptionValue);
        }
    }
};
function saveProduct(name, image, price, description) {
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
    }
    else {
        products.push({
            id: Date.now().toString(),
            name,
            image,
            price,
            description,
        });
    }
    saveToStorage(products);
    const message = editingProductId
        ? "Product updated successfully!"
        : "Product added successfully!";
    showSuccessModal(message, true);
}
function previewImage(event) {
    var _a;
    const target = event.target;
    const file = (_a = target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file && file.size > 1048576) {
        alert("Image file size should not exceed 1MB.");
        target.value = "";
        const imagePreview = document.getElementById("imagePreview");
        if (imagePreview) {
            imagePreview.src =
                "https://placehold.co/300x300?text=Product+Image&font=roboto";
        }
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        const imagePreview = document.getElementById("imagePreview");
        if (imagePreview) {
            imagePreview.src = reader.result;
        }
    };
    if (file) {
        reader.readAsDataURL(file);
    }
}
function setupLiveValidation() {
    const nameEl = document.getElementById("productName");
    const priceEl = document.getElementById("productPrice");
    const descriptionEl = document.getElementById("productDescription");
    const imageEl = document.getElementById("productImage");
    if (!nameEl || !priceEl || !descriptionEl || !imageEl)
        return;
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
        var _a;
        const file = (_a = imageEl.files) === null || _a === void 0 ? void 0 : _a[0];
        const isAddMode = !window.location.search.includes("edit");
        if (!file && isAddMode) {
            imageEl.classList.add("is-invalid");
        }
        else if (file &&
            (!file.type.startsWith("image/") || file.size > 1048576)) {
            imageEl.classList.add("is-invalid");
        }
        else {
            imageEl.classList.remove("is-invalid");
        }
    });
}
