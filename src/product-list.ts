"use strict";

import {
  loadProducts as loadFromStorage,
  saveProducts as saveToStorage,
} from "./storage.js";
import { showSuccessModal } from "./modal.js";
import { Product } from "./types";

let products: Product[] = [];
let deleteProductId: string | null = null;
let currentPage: number = 1;
const productsPerPage: number = 4;
let deleteModalInstance: any = null;

document.addEventListener("DOMContentLoaded", () => {
  products = loadFromStorage();
  renderProductCards();

  // Show the "Add Product" button if it exists.
  const addBtn = document.getElementById("addProductBtn");
  if (addBtn) {
    addBtn.classList.remove("d-none");
  }

  // Attach event listeners to filters and sort controls.
  const filterIdEl = document.getElementById(
    "filterId"
  ) as HTMLInputElement | null;
  const filterNameEl = document.getElementById(
    "filterName"
  ) as HTMLInputElement | null;
  const filterDescriptionEl = document.getElementById(
    "filterDescription"
  ) as HTMLInputElement | null;
  const filterPriceEl = document.getElementById(
    "filterPrice"
  ) as HTMLInputElement | null;
  const sortByEl = document.getElementById(
    "sortBy"
  ) as HTMLSelectElement | null;
  const sortOrderEl = document.getElementById(
    "sortOrder"
  ) as HTMLSelectElement | null;

  filterIdEl?.addEventListener("input", () => {
    currentPage = 1;
    renderProductCards();
  });
  filterNameEl?.addEventListener("input", () => {
    currentPage = 1;
    renderProductCards();
  });
  filterDescriptionEl?.addEventListener("input", () => {
    currentPage = 1;
    renderProductCards();
  });
  filterPriceEl?.addEventListener("input", () => {
    currentPage = 1;
    renderProductCards();
  });
  sortByEl?.addEventListener("change", () => {
    currentPage = 1;
    renderProductCards();
  });
  sortOrderEl?.addEventListener("change", () => {
    currentPage = 1;
    renderProductCards();
  });
});

function renderProductCards(): void {
  const container = document.getElementById("productCardContainer");
  const noProductsMessage = document.getElementById("noProductsMessage");
  if (!container || !noProductsMessage) return;
  container.innerHTML = "";

  // Get filter values.
  const filterId = (
    document.getElementById("filterId") as HTMLInputElement
  ).value.trim();
  const filterName = (
    document.getElementById("filterName") as HTMLInputElement
  ).value
    .trim()
    .toLowerCase();
  const filterDescription = (
    document.getElementById("filterDescription") as HTMLInputElement
  ).value
    .trim()
    .toLowerCase();
  const filterPrice = (
    document.getElementById("filterPrice") as HTMLInputElement
  ).value.trim();

  // Filter products.
  let filteredProducts = products.filter((product) => {
    return (
      (!filterId || product.id.toString().includes(filterId)) &&
      (!filterName || product.name.toLowerCase().includes(filterName)) &&
      (!filterDescription ||
        product.description.toLowerCase().includes(filterDescription)) &&
      (!filterPrice || parseFloat(product.price) === parseFloat(filterPrice))
    );
  });

  // Sorting.
  const sortByEl = document.getElementById("sortBy") as HTMLSelectElement;
  const sortOrderEl = document.getElementById("sortOrder") as HTMLSelectElement;
  const sortKey = sortByEl.value;
  const sortOrder = sortOrderEl.value;
  if (sortKey) {
    filteredProducts.sort((a, b) => {
      let aValue: number | string, bValue: number | string;
      if (sortKey === "price") {
        aValue = parseFloat(a.price);
        bValue = parseFloat(b.price);
      } else {
        aValue = (a as any)[sortKey]?.toString().toLowerCase();
        bValue = (b as any)[sortKey]?.toString().toLowerCase();
      }
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  // Show "no products" message if needed.
  if (filteredProducts.length === 0) {
    const filters = [
      { id: "filterId", label: "Product ID" },
      { id: "filterName", label: "Product Name" },
      { id: "filterDescription", label: "Description" },
      { id: "filterPrice", label: "Price" },
    ];
    const activeFilter = filters.find((f) => {
      const inputEl = document.getElementById(f.id) as HTMLInputElement | null;
      return inputEl && inputEl.value.trim() !== "";
    });
    if (activeFilter) {
      const inputEl = document.getElementById(
        activeFilter.id
      ) as HTMLInputElement;
      noProductsMessage.innerText = `No products found for ${
        activeFilter.label
      } "${inputEl.value.trim()}".`;
    } else {
      noProductsMessage.innerText = "No products found.";
    }
    (noProductsMessage as HTMLElement).style.display = "block";
  } else {
    (noProductsMessage as HTMLElement).style.display = "none";
  }

  // Pagination calculations.
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  // Update header pagination info.
  const paginationInfo = document.getElementById("paginationInfo");
  if (paginationInfo) {
    const startCount = totalProducts > 0 ? startIndex + 1 : 0;
    const endCount = Math.min(startIndex + productsPerPage, totalProducts);
    paginationInfo.textContent = `Products ${startCount}-${endCount} of ${totalProducts}`;
  }

  // Render product cards.
  paginatedProducts.forEach((product) => {
    const card = document.createElement("div");
    card.className = "col-md-6 mb-4";
    card.innerHTML = `
      <div class="card h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="object-fit: cover; height: 200px;">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text"><strong>ID:</strong> ${product.id}</p>
          <p class="card-text"><strong>Price:</strong> $${product.price}</p>
          <p class="card-text">${product.description}</p>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <a href="product.html?mode=edit&id=${product.id}" class="btn btn-sm btn-info">Edit</a>
          <button class="btn btn-sm btn-danger" onclick="confirmDelete('${product.id}')">Delete</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  renderPaginationControls(totalProducts);
}

function renderPaginationControls(totalProducts: number): void {
  const paginationContainer = document.querySelector(
    "ul.pagination"
  ) as HTMLElement | null;
  if (!paginationContainer) return;

  paginationContainer.style.display = totalProducts === 0 ? "none" : "flex";
  paginationContainer.classList.add("pagination-container");
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  paginationContainer.innerHTML = "";

  // Previous button.
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  const prevLink = document.createElement("a");
  prevLink.className = "page-link";
  prevLink.href = "#";
  prevLink.textContent = "Previous";
  prevLink.dataset.page = String(currentPage - 1);
  prevLi.appendChild(prevLink);
  paginationContainer.appendChild(prevLi);

  // Page number buttons.
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.textContent = String(i);
    a.dataset.page = String(i);
    li.appendChild(a);
    paginationContainer.appendChild(li);
  }

  // Next button.
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  const nextLink = document.createElement("a");
  nextLink.className = "page-link";
  nextLink.href = "#";
  nextLink.textContent = "Next";
  nextLink.dataset.page = String(currentPage + 1);
  nextLi.appendChild(nextLink);
  paginationContainer.appendChild(nextLi);

  // Pagination link event listeners.
  const pageLinks = paginationContainer.querySelectorAll("a.page-link");
  pageLinks.forEach((link) => {
    link.addEventListener("click", (e: Event) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLAnchorElement;
      const page = parseInt(target.dataset.page || "0", 10);
      if (!isNaN(page)) {
        changePage(page);
      }
    });
  });
}

function changePage(page: number): void {
  currentPage = page;
  renderProductCards();
}

(window as any).confirmDelete = (productId: string): void => {
  deleteProductId = productId;
  const modalEl = document.getElementById("deleteConfirmModal");
  if (modalEl) {
    // @ts-ignore: bootstrap is available globally.
    deleteModalInstance = new bootstrap.Modal(modalEl);
    deleteModalInstance.show();
  }
};

const confirmBtn = document.getElementById("confirmDeleteBtn");
if (confirmBtn) {
  confirmBtn.addEventListener("click", () => {
    if (deleteProductId) {
      products = products.filter((product) => product.id !== deleteProductId);
      saveToStorage(products);
      renderProductCards();
      if (deleteModalInstance) {
        deleteModalInstance.hide();
      }
      showSuccessModal("Product deleted successfully!");
      deleteProductId = null;
    }
  });
}

(window as any).clearFilters = (): void => {
  const filterIdEl = document.getElementById("filterId") as HTMLInputElement;
  const filterNameEl = document.getElementById(
    "filterName"
  ) as HTMLInputElement;
  const filterDescriptionEl = document.getElementById(
    "filterDescription"
  ) as HTMLInputElement;
  const filterPriceEl = document.getElementById(
    "filterPrice"
  ) as HTMLInputElement;
  const sortByEl = document.getElementById("sortBy") as HTMLSelectElement;
  const sortOrderEl = document.getElementById("sortOrder") as HTMLSelectElement;

  filterIdEl.value = "";
  filterNameEl.value = "";
  filterDescriptionEl.value = "";
  filterPriceEl.value = "";
  sortByEl.value = "";
  sortOrderEl.value = "asc";
  currentPage = 1;
  renderProductCards();
};
