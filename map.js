(function () {
    const mapContainer = document.getElementById("map");
    const flagCountEl = document.getElementById("flag-count");
    const submitBtn = document.querySelector(".sidebar button");

    const canvas = document.createElement("div");
    canvas.id = "map-canvas";
    mapContainer.appendChild(canvas);

    const img = document.createElement("img");
    img.id = "map-image";
    img.alt = "Section DEMO-1 map";
    img.src = "examplemap.webp";
    canvas.appendChild(img);

    let panX = 0,
        panY = 0; // current canvas offset
    let spaceDown = false;
    let isPanning = false;
    let panStartX = 0,
        panStartY = 0;
    let panOriginX = 0,
        panOriginY = 0;

    const flags = [];
    let activePopup = null;

    // center view after image loaded
    img.addEventListener("load", function () {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        canvas.style.width = 1.5 * iw + "px"; // arbitrary scale for demo purposes
        canvas.style.height = 1.5 * ih + "px";
        img.style.width = 1.5 * iw + "px";
        img.style.height = 1.5 * ih + "px";

        const vw = mapContainer.clientWidth;
        const vh = mapContainer.clientHeight;
        panX = Math.min(0, (vw - iw) / 2);
        panY = Math.min(0, (vh - ih) / 2);
        applyPan();
    });

    function applyPan() {
        // clamp so image can't be dragged off-screen
        const iw = img.naturalWidth || canvas.offsetWidth;
        const ih = img.naturalHeight || canvas.offsetHeight;
        const vw = mapContainer.clientWidth;
        const vh = mapContainer.clientHeight;

        panX = Math.min(0, Math.max(panX, vw - iw));
        panY = Math.min(0, Math.max(panY, vh - ih));

        canvas.style.transform = `translate(${panX}px, ${panY}px)`;
    }

    // panning
    window.addEventListener("keydown", function (e) {
        if (e.code === "Space" && !spaceDown) {
            e.preventDefault();
            spaceDown = true;
            mapContainer.classList.add("panning");
        }
    });

    window.addEventListener("keyup", function (e) {
        if (e.code === "Space") {
            spaceDown = false;
            isPanning = false;
            mapContainer.classList.remove("panning", "dragging");
        }
    });

    mapContainer.addEventListener("mousedown", function (e) {
        if (!spaceDown) return;
        if (e.button !== 0) return;
        e.preventDefault();
        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        panOriginX = panX;
        panOriginY = panY;
        mapContainer.classList.add("dragging");
    });

    window.addEventListener("mousemove", function (e) {
        if (!isPanning) return;
        panX = panOriginX + (e.clientX - panStartX);
        panY = panOriginY + (e.clientY - panStartY);
        applyPan();
    });

    window.addEventListener("mouseup", function () {
        if (!isPanning) return;
        isPanning = false;
        mapContainer.classList.remove("dragging");
    });

    // place flag when not panning
    mapContainer.addEventListener("click", function (e) {
        if (spaceDown) return;
        if (e.target.closest(".flag-marker") || e.target.closest(".flag-popup"))
            return;

        closeActivePopup();

        const rect = mapContainer.getBoundingClientRect();
        const px = e.clientX - rect.left - panX;
        const py = e.clientY - rect.top - panY;

        const iw = img.naturalWidth || canvas.offsetWidth;
        const ih = img.naturalHeight || canvas.offsetHeight;

        // fake latitude for demo image, still right relative to each other
        const lat = (py / ih).toFixed(5);
        const lng = (px / iw).toFixed(5);

        const index = flags.length + 1;

        const marker = document.createElement("div");
        marker.className = "flag-marker";
        marker.dataset.idx = index;
        marker.style.left = px + "px";
        marker.style.top = py + "px";
        canvas.appendChild(marker);

        // popup when selecting existing flag
        const popup = document.createElement("div");
        popup.className = "flag-popup";
        popup.innerHTML =
            `<strong>Flag ${index}</strong>` +
            `<span>Lat: ${lat}</span>` +
            `<span>Lng: ${lng}</span>` +
            `<button class="popup-remove" data-idx="${index}">Remove</button>`;
        canvas.appendChild(popup);

        positionPopup(popup, px, py, iw, ih);
        showPopup(popup);
        activePopup = popup;

        flags.push({ lat, lng, marker, popup });
        flagCountEl.textContent = flags.length;

        popup
            .querySelector(".popup-remove")
            .addEventListener("click", function (e) {
                e.stopPropagation();
                removeFlag(parseInt(this.dataset.idx, 10));
            });

        marker.addEventListener("click", function (e) {
            e.stopPropagation();
            if (popup.classList.contains("visible")) {
                closeActivePopup();
            } else {
                closeActivePopup();
                showPopup(popup);
                activePopup = popup;
            }
        });
    });

    // close popup on map click
    mapContainer.addEventListener("click", function (e) {
        if (
            !e.target.closest(".flag-marker") &&
            !e.target.closest(".flag-popup")
        ) {
            closeActivePopup();
        }
    });

    // helper functions
    function showPopup(popup) {
        popup.classList.add("visible");
    }

    function closeActivePopup() {
        if (activePopup) {
            activePopup.classList.remove("visible");
            activePopup = null;
        }
    }

    function positionPopup(popup, px, py, canvasW, canvasH) {
        const popupW = 160;
        const popupH = 100;
        let left = px - popupW / 2;
        let top = py - popupH - 18;

        if (left < 4) left = 4;
        if (left + popupW > canvasW - 4) left = canvasW - popupW - 4;
        if (top < 4) top = py + 18;

        popup.style.left = left + "px";
        popup.style.top = top + "px";
    }

    function removeFlag(idx) {
        const i = flags.findIndex(
            (f) => parseInt(f.marker.dataset.idx, 10) === idx,
        );
        if (i === -1) return;
        flags[i].marker.remove();
        flags[i].popup.remove();
        flags.splice(i, 1);
        flagCountEl.textContent = flags.length;
        activePopup = null;
    }

    // submit
    submitBtn.addEventListener("click", function () {
        if (flags.length === 0) {
            alert("Place at least one flag before submitting.");
            return;
        }
        const summary = flags
            .map((f, i) => `  Flag ${i + 1} - Lat: ${f.lat}, Lng: ${f.lng}`)
            .join("\n");
        alert(
            `Section DEMO-1 submitted with ${flags.length} flag${flags.length !== 1 ? "s" : ""}:\n\n${summary}`,
        );
    });

    window.addEventListener(
        "keydown",
        function (e) {
            if (e.code === "Space") e.preventDefault();
        },
        { passive: false },
    );
})();
