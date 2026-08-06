function qs(id) {
  return document.getElementById(id);
}

function cardHTML(item, className = "data-card") {
  const textHTML = Array.isArray(item.text)
    ? item.text.map(line => `<p class="competency-line">${line}</p>`).join("")
    : `<p>${item.text || ""}</p>`;

  return `<article class="${className}"><h3>${item.title}</h3>${textHTML}</article>`;
}

function competencyStatementsHTML(groups) {
  const statements = (groups || []).flatMap(group =>
    Array.isArray(group.text) ? group.text : []
  );

  return statements
    .map(statement => `<p class="competency-statement">${statement}</p>`)
    .join("");
}

function collectionCardHTML(item, index, sourceKey) {
  const items = Array.isArray(item.items) ? item.items : [];
  const countLabel = items.length === 1 ? "1 item" : `${items.length} items`;

  return `<article class="artifact-card artifact-collection-card">
    <h3>${item.title}</h3>
    <p class="artifact-count">${countLabel}</p>

    <button
      class="artifact-btn artifact-open-btn"
      type="button"
      data-collection-source="${sourceKey}"
      data-collection-index="${index}"
    >
      Open Collection
    </button>
  </article>`;
}

function setContentText(
  id,
  value,
  { hideWhenMissing = false } = {}
) {
  const element = qs(id);

  if (!element) {
    return false;
  }

  const hasValue =
    typeof value === "string" &&
    value.trim() !== "";

  if (hasValue) {
    element.textContent = value;
    element.hidden = false;
    return true;
  }

  if (hideWhenMissing) {
    element.hidden = true;
  }

  return false;
}

function loadContent() {
  setContentText("heroName", siteContent.hero.name);
  setContentText("heroTagline", siteContent.hero.tagline);

  setContentText(
    "heroSubtagline",
    siteContent.hero.subtagline,
    { hideWhenMissing: true }
  );

  const hasWelcome = setContentText(
    "heroWelcome",
    siteContent.hero.welcome,
    { hideWhenMissing: true }
  );

  const hasRole = setContentText(
    "heroRole",
    siteContent.hero.role,
    { hideWhenMissing: true }
  );

  const heroCard = document.querySelector(".hero-card");

  if (heroCard) {
    heroCard.hidden = !hasWelcome && !hasRole;
  }

  const portraitImage = qs("portraitImage");

  if (portraitImage) {
    portraitImage.src = siteContent.hero.portrait;
  }

  const cvDownload = qs("cvDownload");

  if (cvDownload) {
    cvDownload.href = siteContent.cvLink;
  }

  if (qs("identityGrid")) {
    qs("identityGrid").innerHTML =
      siteContent.identity
        .map(item => cardHTML(item, "identity-card"))
        .join("");
  }

  if (qs("competencyGrid")) {
    qs("competencyGrid").innerHTML =
      competencyStatementsHTML(siteContent.competencies);
  }

  if (qs("courseworkList")) {
    qs("courseworkList").innerHTML =
      siteContent.coursework
        .map(course => `<li>${course}</li>`)
        .join("");
  }

  if (qs("artifactGrid")) {
    qs("artifactGrid").innerHTML =
      siteContent.artifacts
        .map((item, index) =>
          collectionCardHTML(item, index, "artifacts")
        )
        .join("");
  }

  if (qs("researchGrid")) {
    qs("researchGrid").innerHTML =
      siteContent.research
        .map(item => cardHTML(item))
        .join("");
  }

  if (qs("evaluationGrid")) {
    qs("evaluationGrid").innerHTML =
      siteContent.evaluations
        .map((item, index) =>
          collectionCardHTML(item, index, "evaluations")
        )
        .join("");
  }

  if (qs("professionalGrid")) {
    qs("professionalGrid").innerHTML =
      siteContent.professionalDevelopment
        .map((item, index) =>
          collectionCardHTML(
            item,
            index,
            "professionalDevelopment"
          )
        )
        .join("");
  }

  if (qs("timeline")) {
    qs("timeline").innerHTML =
      siteContent.learningJourney
        .map(item => `
          <article class="timeline-item">
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </article>
        `)
        .join("");
  }

  if (qs("teachingTabs")) {
    makeTabs(
      siteContent.teachingPhilosophy,
      "teachingTabs"
    );
  }

  if (qs("learningTabs")) {
    makeTabs(
      siteContent.learningPhilosophy,
      "learningTabs",
      "learningTitle",
      "learningText"
    );
  }
}

function makeTabs(
  data,
  tabId,
  titleId = null,
  textId = null
) {
  if (!data) {
    return;
  }

  const keys = Object.keys(data);
  const tabs = qs(tabId);
  const title = titleId ? qs(titleId) : null;
  const text = textId ? qs(textId) : null;

  if (!tabs || keys.length === 0) {
    return;
  }

  tabs.innerHTML = keys
    .map((key, index) => `
      <button
        type="button"
        class="${index === 0 ? "active" : ""}"
        data-key="${key}"
        aria-haspopup="dialog"
      >
        ${key}
      </button>
    `)
    .join("");

  if (title) {
    title.textContent = keys[0];
  }

  if (text) {
    text.innerHTML = data[keys[0]];
  }

  tabs.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach(otherButton => {
        otherButton.classList.remove("active");
      });

      button.classList.add("active");

      if (tabId === "teachingTabs") {
        openPhilosophyModal(
          button.dataset.key,
          data[button.dataset.key]
        );

        return;
      }

      if (title) {
        title.textContent = button.dataset.key;
      }

      if (text) {
        text.innerHTML = data[button.dataset.key];
      }
    });
  });
}

let philosophyModalTrigger = null;

function openPhilosophyModal(title, html) {
  const modal = qs("philosophyModal");
  const modalBox =
    modal?.querySelector(".philosophy-modal-box");
  const modalText = qs("modalPhilosophyText");
  const modalTitle = qs("modalPhilosophyTitle");

  if (
    !modal ||
    !modalBox ||
    !modalText ||
    !modalTitle
  ) {
    return;
  }

  philosophyModalTrigger = document.activeElement;

  modalTitle.textContent = title;
  modalTitle.style.display = "none";
  modalText.innerHTML = html;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  modalBox.scrollTop = 0;
  modalText.scrollTop = 0;

  requestAnimationFrame(() => {
    modalBox.focus({ preventScroll: true });
  });
}

function closePhilosophyModal() {
  const modal = qs("philosophyModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (
    philosophyModalTrigger &&
    typeof philosophyModalTrigger.focus === "function"
  ) {
    philosophyModalTrigger.focus({
      preventScroll: true
    });
  }
}

function setupPhilosophyModal() {
  const modal = qs("philosophyModal");

  if (!modal) {
    return;
  }

  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closePhilosophyModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      modal.classList.contains("show")
    ) {
      closePhilosophyModal();
    }
  });
}

let artifactModalTrigger = null;

function artifactItemHTML(item) {
  const file =
    typeof item.file === "string"
      ? item.file.trim()
      : "";

  const page =
    typeof item.page === "string"
      ? item.page.trim()
      : "";

  const external =
    typeof item.external === "string"
      ? item.external.trim()
      : "";

  const video =
    typeof item.video === "string"
      ? item.video.trim()
      : "";

  const resources =
    Array.isArray(item.resources)
      ? item.resources
      : [];

  const metadataRows = [
    ["Course", item.course],
    ["Learner level", item.learnerLevel],
    ["Teaching team", item.teachingTeam],
    ["Class size", item.classSize],
    ["Lesson length", item.lessonLength],
    [
      "Primary learning objectives",
      item.objectives
    ]
  ].filter(([, value]) =>
    typeof value === "string" &&
    value.trim() !== ""
  );

  const metadataHTML = metadataRows.length
    ? `<dl class="artifact-metadata">
        ${metadataRows
          .map(([label, value]) => `
            <div class="artifact-metadata-row">
              <dt>${label}</dt>
              <dd>${value}</dd>
            </div>
          `)
          .join("")}
       </dl>`
    : "";

  /*
    The video player is displayed immediately.

    The old "Video file not added yet" placeholder
    has been completely removed.
  */
  let youtubeEmbedUrl = "";

if (video.includes("youtu.be/")) {
  const videoId = video
    .split("youtu.be/")[1]
    .split("?")[0]
    .split("&")[0];

  youtubeEmbedUrl =
    `https://www.youtube-nocookie.com/embed/${videoId}`;
} else if (
  video.includes("youtube.com/embed/")
) {
  youtubeEmbedUrl = video.replace(
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com"
  );
}

const videoHTML = video
  ? youtubeEmbedUrl
    ? `<div class=".replace(
    "https://wwwartifact-video-wrap video-ready">
         <iframe
           class="artifact-video"
           src="${youtubeEmbedUrl}"
           title="${item.title || "Teaching video"}"
           loading="lazy"
           style="width: 100%; aspect-ratio: 16 / 9; border: 0;"
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
           referrerpolicy="strict-origin-when-cross-origin"
           allowfullscreen>
         </iframe>
       </div>`
    : `<div class="artifact-video-wrap video-ready" data-video-wrap>
         <video
           class="artifact-video"
           controls
           playsinline
           preload="metadata"
           aria-label="${item.title || "Teaching video"}">
           <source src="${video}" type="video/mp4">
           Your browser does not support embedded video.
         </video>
       </div>`
  : "";

  const buttons = [];

  if (page) {
    buttons.push(`
      <a
        class="artifact-document-btn"
        href="${page}"
      >
        Open Interactive Preview
      </a>
    `);
  }

  if (file) {
    buttons.push(`
      <a
        class="artifact-document-btn secondary"
        href="${file}"
        target="_blank"
        rel="noopener noreferrer"
      >
        View Original File
      </a>
    `);
  }

  if (external) {
    buttons.push(`
      <a
        class="artifact-document-btn secondary"
        href="${external}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open External Link
      </a>
    `);
  }

  resources.forEach(resource => {
    if (!resource || !resource.href) {
      return;
    }

    buttons.push(`
      <a
        class="artifact-document-btn secondary"
        href="${resource.href}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${resource.label || "Open Resource"}
      </a>
    `);
  });

  const actionArea = buttons.length
    ? `<div class="artifact-item-actions">
         ${buttons.join("")}
       </div>`
    : (
        !video
          ? `<p class="artifact-upload-placeholder">
               Additional evidence can be added later.
             </p>`
          : ""
      );

  return `
    <article
      class="artifact-item-card${
        video ? " artifact-video-card" : ""
      }"
    >
      ${
        item.type
          ? `<p class="artifact-item-type">${item.type}</p>`
          : ""
      }

      <h3>${item.title || "Untitled Item"}</h3>

      ${metadataHTML}

      ${videoHTML}

      ${
        item.description
          ? `<p class="artifact-description">
               ${item.description}
             </p>`
          : ""
      }

      ${
        item.contribution
          ? `<p>
               <strong>My Individual Contribution:</strong>
               ${item.contribution}
             </p>`
          : ""
      }

      ${actionArea}
    </article>
  `;
}

function setupArtifactVideos(container) {
  if (!container) {
    return;
  }

  container
    .querySelectorAll("[data-video-wrap]")
    .forEach(wrap => {
      const video = wrap.querySelector("video");

      if (!video) {
        return;
      }

      /*
        The CSS uses video-ready to reveal the player.
        Add it immediately instead of waiting for metadata.
      */
      wrap.classList.add("video-ready");

      video.hidden = false;

      /*
        Reload the source after the collection opens.
      */
      video.load();
    });
}

function openDocumentCollection(
  sourceKey,
  index
) {
  const collections = siteContent[sourceKey];

  const collection =
    Array.isArray(collections)
      ? collections[index]
      : null;

  const modal = qs("artifactModal");
  const modalBox =
    modal?.querySelector(".artifact-modal-box");
  const title = qs("artifactModalTitle");
  const grid = qs("artifactItemsGrid");

  if (
    !collection ||
    !modal ||
    !modalBox ||
    !title ||
    !grid
  ) {
    return;
  }

  artifactModalTrigger = document.activeElement;

  title.textContent = collection.title;

  const items =
    Array.isArray(collection.items)
      ? collection.items
      : [];

  grid.innerHTML = items.length
    ? items.map(artifactItemHTML).join("")
    : `<div class="artifact-empty-state">
         <h3>No documents added yet</h3>
         <p>
           This collection is ready for individual documents.
         </p>
       </div>`;

  setupArtifactVideos(grid);

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  modalBox.scrollTop = 0;

  requestAnimationFrame(() => {
    modalBox.focus({ preventScroll: true });
  });
}

function closeArtifactModal() {
  const modal = qs("artifactModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (
    artifactModalTrigger &&
    typeof artifactModalTrigger.focus === "function"
  ) {
    artifactModalTrigger.focus({
      preventScroll: true
    });
  }
}

function setupArtifactModal() {
  const modal = qs("artifactModal");

  const closeButton =
    modal?.querySelector(".artifact-modal-close");

  if (!modal || !closeButton) {
    return;
  }

  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  document.addEventListener("click", event => {
    const button = event.target.closest(
      "[data-collection-source][data-collection-index]"
    );

    if (!button) {
      return;
    }

    const sourceKey =
      button.dataset.collectionSource;

    const index =
      Number(button.dataset.collectionIndex);

    if (
      sourceKey &&
      Number.isInteger(index)
    ) {
      openDocumentCollection(
        sourceKey,
        index
      );
    }
  });

  closeButton.addEventListener(
    "click",
    closeArtifactModal
  );

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeArtifactModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      modal.classList.contains("show")
    ) {
      closeArtifactModal();
    }
  });
}

function setupCursor() {
  const glow = qs("cursorGlow");
  const ring = qs("clickRing");

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (
    !glow ||
    !ring ||
    !finePointer.matches ||
    reducedMotion.matches
  ) {
    if (glow) {
      glow.hidden = true;
    }

    if (ring) {
      ring.hidden = true;
    }

    return;
  }

  let lastX = null;
  let lastY = null;

  window.addEventListener(
    "pointermove",
    event => {
      const x = event.clientX;
      const y = event.clientY;

      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;

      glow.classList.add("is-visible");

      if (
        lastX !== null &&
        lastY !== null
      ) {
        const dx = x - lastX;
        const dy = y - lastY;
        const distance = Math.hypot(dx, dy);

        if (distance > 0.5) {
          const angle =
            Math.atan2(dy, dx) *
            180 /
            Math.PI;

          const tailLength = Math.min(
            105,
            Math.max(
              42,
              42 + distance * 2.2
            )
          );

          const tailOpacity = Math.min(
            0.88,
            Math.max(
              0.28,
              0.28 + distance / 42
            )
          );

          glow.style.setProperty(
            "--cursor-angle",
            `${angle}deg`
          );

          glow.style.setProperty(
            "--cursor-tail-length",
            `${tailLength}px`
          );

          glow.style.setProperty(
            "--cursor-tail-opacity",
            tailOpacity.toFixed(2)
          );
        }
      }

      lastX = x;
      lastY = y;

      const interactive = event.target.closest(
        "a, button, input, textarea, select, summary, [role='button'], [tabindex]:not([tabindex='-1'])"
      );

      document.body.classList.toggle(
        "cursor-over-interactive",
        Boolean(interactive)
      );
    }
  );

  document.addEventListener(
    "pointerleave",
    () => {
      glow.classList.remove("is-visible");

      document.body.classList.remove(
        "cursor-over-interactive"
      );
    }
  );

  document.addEventListener(
    "pointerenter",
    () => {
      glow.classList.add("is-visible");
    }
  );

  window.addEventListener(
    "click",
    event => {
      ring.style.left =
        `${event.clientX}px`;

      ring.style.top =
        `${event.clientY}px`;

      ring.classList.remove("active");

      void ring.offsetWidth;

      ring.classList.add("active");
    }
  );
}

function setupReveals() {
  const observer =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "visible"
            );
          }
        });
      },
      {
        threshold: 0.12
      }
    );

  document
    .querySelectorAll(".reveal")
    .forEach(element => {
      observer.observe(element);
    });
}

function petals() {
  const container = qs("flower-container");

  if (!container) {
    return;
  }

  for (let i = 0; i < 30; i++) {
    const petal =
      document.createElement("div");

    petal.className = "flower";

    petal.style.left =
      Math.random() * 100 + "vw";

    petal.style.animationDelay =
      Math.random() * 2 + "s";

    petal.style.animationDuration =
      3 + Math.random() * 4 + "s";

    container.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, 7500);
  }
}

function activeNav() {
  const links =
    document.querySelectorAll(
      ".side-menu a[href^='#']"
    );

  window.addEventListener(
    "scroll",
    () => {
      let current = "home";

      document
        .querySelectorAll("section[id]")
        .forEach(section => {
          if (
            scrollY >=
            section.offsetTop - 170
          ) {
            current = section.id;
          }
        });

      links.forEach(link => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") ===
            `#${current}`
        );
      });
    }
  );
}

window.addEventListener(
  "DOMContentLoaded",
  () => {
    loadContent();
    setupCursor();
    setupReveals();
    activeNav();
    setupPhilosophyModal();
    setupArtifactModal();
    petals();
  }
);

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const hamburgerBtn =
      document.getElementById(
        "hamburgerBtn"
      );

    const sideMenu =
      document.getElementById(
        "sideMenu"
      );

    if (
      hamburgerBtn &&
      sideMenu
    ) {
      sideMenu
        .querySelectorAll(
          "a[href^='#']"
        )
        .forEach(link => {
          link.addEventListener(
            "click",
            () => {
              sideMenu.classList.remove(
                "open"
              );

              hamburgerBtn.setAttribute(
                "aria-expanded",
                "false"
              );
            }
          );
        });
    }

    document
      .querySelectorAll(
        ".menu-dropdown-btn"
      )
      .forEach(function (button) {
        button.onclick = function () {
          button.classList.toggle(
            "active"
          );

          const dropdown =
            button.nextElementSibling;

          if (dropdown) {
            dropdown.classList.toggle(
              "open"
            );
          }
        };
      });
  }
);