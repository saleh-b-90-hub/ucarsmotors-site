const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
}

const chips = document.querySelectorAll("[data-filter]");
const filterItems = document.querySelectorAll("[data-category]");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");

    const filter = chip.dataset.filter;
    filterItems.forEach((item) => {
      const match = filter === "all" || item.dataset.category === filter;
      item.style.display = match ? "block" : "none";
    });
  });
});

const brandFilter = document.querySelector("#brandFilter");
const modelFilter = document.querySelector("#modelFilter");
const priceFilter = document.querySelector("#priceFilter");
const carCards = document.querySelectorAll(".car-card");

function applyCarFilters() {
  if (!carCards.length) return;
  const brand = brandFilter?.value || "all";
  const model = modelFilter?.value || "all";
  const maxPrice = Number(priceFilter?.value || "999999");

  carCards.forEach((card) => {
    const cardBrand = card.dataset.brand;
    const cardModel = card.dataset.model;
    const cardPrice = Number(card.dataset.price || "0");
    const brandMatch = brand === "all" || cardBrand === brand;
    const modelMatch = model === "all" || cardModel === model;
    const priceMatch = cardPrice <= maxPrice;
    card.style.display = brandMatch && modelMatch && priceMatch ? "block" : "none";
  });
}

[brandFilter, modelFilter, priceFilter].forEach((control) => {
  if (control) {
    control.addEventListener("change", applyCarFilters);
  }
});

applyCarFilters();

const contactForm = document.querySelector("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#name")?.value?.trim() || "";
    const email = document.querySelector("#email")?.value?.trim() || "";
    const message = document.querySelector("#message")?.value?.trim() || "";
    const text = encodeURIComponent(
      `New inquiry from UCARS MOTORS website:%0AName: ${name}%0AEmail: ${email}%0AMessage: ${message}`
    );
    window.open(`https://wa.me/49178551145?text=${text}`, "_blank");
  });
}
