"use strict";

declare const bootstrap: any;

export function showSuccessModal(
  message: string,
  redirect: boolean = true,
  redirectURL: string = "index.html"
): void {
  let successModalEl: HTMLElement | null =
    document.getElementById("successModal");

  if (!successModalEl) {
    const modalHTML: string = `
      <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content text-center">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title w-100">Success</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body pt-2">
              <p id="successMessage" class="mb-0">${message}</p>
            </div>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    successModalEl = document.getElementById("successModal");
  } else {
    const msg: HTMLElement | null = document.getElementById("successMessage");
    if (msg) {
      msg.textContent = message;
    } else {
      console.error("Success message element not found!");
    }
  }

  if (successModalEl) {
    const modalInstance = new bootstrap.Modal(successModalEl);
    modalInstance.show();

    setTimeout(() => {
      modalInstance.hide();
      if (redirect) {
        window.location.href = redirectURL;
      }
    }, 1500);
  }
}
