(function () {
    // animated entrance
    const cards = document.querySelectorAll(".stat-card[data-animate]");

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const card = entry.target;
                card.classList.add("visible");

                const valueEl = card.querySelector(".stat-value[data-count]");
                if (valueEl) countUp(valueEl);

                observer.unobserve(card);
            });
        },
        { threshold: 0.2 },
    );

    cards.forEach((c) => observer.observe(c));

    function countUp(el) {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 900;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function openModal(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add("open");
            el.setAttribute("aria-hidden", "false");
        }
    }

    function closeModal(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("open");
            el.setAttribute("aria-hidden", "true");
        }
    }

    document
        .getElementById("btn-file-upload")
        .addEventListener("click", () => openModal("modal-file"));
    document
        .getElementById("btn-opentopo")
        .addEventListener("click", () => openModal("modal-opentopo"));

    document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", () => closeModal(btn.dataset.close));
    });
    // click outside modal to close too
    document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
        backdrop.addEventListener("click", function (e) {
            if (e.target === backdrop) closeModal(backdrop.id);
        });
    });

    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("file-input");
    const fileList = document.getElementById("file-list");
    const addedFiles = new Set();

    if (dropzone) {
        dropzone.addEventListener("click", () => fileInput.click());

        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("drag-over");
        });
        dropzone.addEventListener("dragleave", () =>
            dropzone.classList.remove("drag-over"),
        );
        dropzone.addEventListener("drop", function (e) {
            e.preventDefault();
            dropzone.classList.remove("drag-over");
            addFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener("change", () => addFiles(fileInput.files));
    }

    function addFiles(files) {
        Array.from(files).forEach(function (file) {
            if (addedFiles.has(file.name)) return;
            addedFiles.add(file.name);

            const li = document.createElement("li");
            li.className = "file-item";
            li.innerHTML =
                `<span>${file.name}</span>` +
                `<button class="file-remove" aria-label="Remove ${file.name}">✕</button>`;
            li.querySelector(".file-remove").addEventListener(
                "click",
                function () {
                    addedFiles.delete(file.name);
                    li.remove();
                },
            );
            fileList.appendChild(li);
        });
    }

    document.querySelectorAll(".reviewer-add-btn").forEach(function (btn) {
        const listId = btn.dataset.target;
        const list = document.getElementById(listId);
        const input = btn.previousElementSibling;

        btn.addEventListener("click", function () {
            const val = input.value.trim();
            if (!val) return;

            const li = document.createElement("li");
            li.className = "reviewer-tag";
            li.innerHTML =
                `<span>${val}</span>` +
                `<button class="reviewer-remove" aria-label="Remove ${val}">✕</button>`;
            li.querySelector(".reviewer-remove").addEventListener("click", () =>
                li.remove(),
            );
            list.appendChild(li);
            input.value = "";
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // API key visibility
    document.querySelectorAll(".toggle-visibility").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const field = document.getElementById(btn.dataset.target);
            field.type = field.type === "password" ? "text" : "password";
            btn.style.color =
                field.type === "text"
                    ? "var(--color-sage-light)"
                    : "var(--color-slate-dark)";
        });
    });
})();
