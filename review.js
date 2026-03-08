(function () {
    const mapContainer = document.getElementById("review-map");
    const canvas = document.getElementById("review-map-canvas");
    const img = document.getElementById("review-map-image");
    const rows = Array.from(document.querySelectorAll(".flag-table tbody tr"));

    let selectedFlag = null;

    img.addEventListener("load", function () {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        canvas.style.width = iw + "px";
        canvas.style.height = ih + "px";
        img.style.width = iw + "px";
        img.style.height = ih + "px";

        const vw = mapContainer.clientWidth;
        const vh = mapContainer.clientHeight;
        const panX = Math.min(0, (vw - iw) / 2);
        const panY = Math.min(0, (vh - ih) / 2);
        canvas.style.transform = `translate(${panX}px, ${panY}px)`;

        // place markers from data info
        rows.forEach(function (row) {
            const flagId = row.dataset.flag;
            const lat = parseFloat(row.dataset.lat); // normalized 0–1
            const lng = parseFloat(row.dataset.lng);

            const px = lng * iw;
            const py = lat * ih;

            const marker = document.createElement("div");
            marker.className = "review-flag";
            marker.dataset.flag = flagId;
            marker.style.left = px + "px";
            marker.style.top = py + "px";
            canvas.appendChild(marker);

            // select map market by clicking it
            marker.addEventListener("click", function (e) {
                e.stopPropagation();
                toggleSelection(flagId);
            });
        });
    });

    if (img.complete) img.dispatchEvent(new Event("load"));

    // select row by clicking
    rows.forEach(function (row) {
        row.addEventListener("click", function (e) {
            // don't intercept approve/reject button clicks - took forever to figure this out
            if (e.target.classList.contains("action-btn")) return;
            toggleSelection(row.dataset.flag);
        });
    });

    // deselect
    mapContainer.addEventListener("click", function () {
        setSelection(null);
    });

    function toggleSelection(flagId) {
        setSelection(selectedFlag === flagId ? null : flagId);
    }

    function setSelection(flagId) {
        selectedFlag = flagId;

        canvas.querySelectorAll(".review-flag").forEach(function (m) {
            m.classList.toggle("selected", m.dataset.flag === flagId);
        });

        rows.forEach(function (row) {
            row.classList.toggle("selected", row.dataset.flag === flagId);
        });

        // makes sure row for selected flag is visible
        if (flagId) {
            const activeRow = rows.find((r) => r.dataset.flag === flagId);
            if (activeRow)
                activeRow.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth",
                });
        }
    }

    rows.forEach(function (row) {
        row.querySelector(".action-btn.approve").addEventListener(
            "click",
            function (e) {
                e.stopPropagation();
                row.classList.remove("rejected");
                row.classList.add("approved");
                syncMarkerState(row);
            },
        );

        row.querySelector(".action-btn.reject").addEventListener(
            "click",
            function (e) {
                e.stopPropagation();
                row.classList.remove("approved");
                row.classList.add("rejected");
                syncMarkerState(row);
            },
        );
    });

    // faded marker when decision has been made
    function syncMarkerState(row) {
        const marker = canvas.querySelector(
            `.review-flag[data-flag="${row.dataset.flag}"]`,
        );
        if (!marker) return;
        marker.style.opacity =
            row.classList.contains("approved") ||
            row.classList.contains("rejected")
                ? "0.3"
                : "1";
    }
})();
