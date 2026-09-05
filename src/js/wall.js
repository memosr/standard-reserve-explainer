const X_ICON = `<svg class="wall-x-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const researchCard = ({ author, url, note }) => `
  <a class="wall-card wall-card-research" href="${url}" target="_blank" rel="noopener">
    <div class="wall-card-body">
      <div class="wall-card-head">
        <span class="wall-card-author">${escapeHtml(author)}</span>
        ${X_ICON}
      </div>
      <p class="wall-card-note">${escapeHtml(note)}</p>
    </div>
  </a>`;

const archiveCard = ({ author, url, context, hasMedia }) => `
  <a class="wall-card wall-card-archive" href="${url}" target="_blank" rel="noopener">
    <div class="wall-card-body">
      <div class="wall-card-head">
        <span class="wall-card-author">${escapeHtml(author)}</span>
        ${hasMedia ? '<span class="wall-badge-media">Media</span>' : ""}
      </div>
      <p class="wall-card-context">${escapeHtml(context)}</p>
      <span class="wall-card-link">${X_ICON} View on X</span>
    </div>
  </a>`;

const mineCard = ({ title, url, note, image }) => `
  <a class="wall-card wall-card-mine" href="${url}" target="_blank" rel="noopener">
    ${image ? `<img class="wall-card-mine-image" src="${image}" alt="" loading="lazy" onerror="this.remove()">` : ""}
    <div class="wall-card-body">
      <h3 class="wall-card-title">${escapeHtml(title)}</h3>
      <p class="wall-card-note">${escapeHtml(note)}</p>
      <span class="wall-card-link">${X_ICON} View on X</span>
    </div>
  </a>`;

const renderSection = (listName, items, cardFn) => {
  const grid = document.querySelector(`[data-wall-list="${listName}"]`);
  const count = document.querySelector(`[data-wall-count="${listName}"]`);
  if (!grid) return;
  grid.innerHTML = items.map(cardFn).join("");
  if (count) count.textContent = items.length;
};

const loadWall = async () => {
  const status = document.querySelector("[data-wall-status]");
  try {
    const res = await fetch("docs/wall.json");
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    renderSection("research", data.research ?? [], researchCard);
    renderSection("archive", data.archive ?? [], archiveCard);
    renderSection("mine", data.mine ?? [], mineCard);
  } catch (err) {
    if (status) {
      status.hidden = false;
      status.textContent = "Couldn't load docs/wall.json.";
    }
  }
};

loadWall();
