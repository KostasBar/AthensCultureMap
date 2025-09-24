// =========================
// Map init
// =========================
const map = L.map('map', {
  zoomControl: true
}).setView([38.3, 25], 7);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// =========================
// FontAwesome icons per category
// =========================
const faIcons = {
  1: 'fa-house',           // Κατοικίες και Ιστορικά Κτήρια
  2: 'fa-church',          // Θρησκευτικά Μνημεία
  3: 'fa-industry',        // Βιομηχανικά Κτήρια
  4: 'fa-landmark',        // Κτήρια Αρχιτεκτονικής/Ιστορικής Αξίας
  5: 'fa-graduation-cap',  // Εκπαιδευτικά Ιδρύματα
  6: 'fa-monument',        // Τόποι Μνήμης
  7: 'fa-briefcase-medical'// Δομές Υγείας
};

const iconColors = {
  1: '#67B7D1', 2: '#dcb786', 3: '#777373',
  4: '#e36b6b', 5: '#9a86d3', 6: '#7a7a52',
  7: '#4cb2a2'
};

// =========================
// Leaflet.divIcon factory
// =========================
function createFAIcon(cat) {
  const iconClass = faIcons[cat] || 'fa-map-marker-alt';
  const iconColor = iconColors[cat] || '#333';
  return L.divIcon({
    className: 'fa-icon-marker',
    html: `<i class="fas ${iconClass}" style="font-size:22px;color:${iconColor};"></i>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
}

// =========================
/* State */
// =========================
let allMarkers = [];

// =========================
// Helpers
// =========================
function buildPopupHtml(p) {
  const safeName = (p.name ?? '').toString();
  const safeInfo = (p.info ?? '').toString();
  const safeUrl  = (p.url ?? '#').toString();
  const safeImg  = (p.image ?? '').toString();

  return `
    <div class="popup-card">
      ${safeImg ? `
        <img
          src="${safeImg}"
          alt="${safeName}"
          loading="lazy"
          decoding="async"
          width="240" height="180"
        />
      ` : ''}
      <strong>${safeName}</strong>
      ${safeInfo ? `<small>${safeInfo}</small>` : ''}
      <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="more-link">
        Δείτε Περισσότερα...
      </a>
    </div>
  `;
}

function clearMarkers() {
  allMarkers.forEach(m => map.removeLayer(m));
  allMarkers = [];
}

// =========================
// Render points (optionally filtered)
// selectedCategory: string ("" for all)
// =========================
function showPoints(points, selectedCategory = "") {
  clearMarkers();

  const visiblePoints = selectedCategory
    ? points.filter(p => Array.isArray(p.cat) && p.cat.includes(Number(selectedCategory)))
    : points;

  const markersInThisBatch = [];

  visiblePoints.forEach(p => {
    const catNum = selectedCategory
      ? Number(selectedCategory)
      : (Array.isArray(p.cat) && p.cat.length ? p.cat[0] : null);

    const marker = L.marker(p.coords, { icon: createFAIcon(catNum) });
    marker.bindPopup(buildPopupHtml(p), {
      maxWidth: 300,          
      keepInView: false,
      autoPan: true,
      autoPanPadding: [20, 20]
    });

    marker.addTo(map);
    allMarkers.push(marker);
    markersInThisBatch.push(marker);
  });

  if (markersInThisBatch.length) {
    const grp = L.featureGroup(markersInThisBatch);
    map.fitBounds(grp.getBounds(), { padding: [30, 30] });
  }
}

// =========================
/* Data load & filter wiring */
// =========================
fetch('monuments.json', { cache: 'no-cache' })
  .then(r => r.json())
  .then(points => {
    showPoints(points);

    const catEl = document.getElementById('category');
    if (catEl) {
      catEl.addEventListener('change', function () {
        const sel = this.value || "";
        showPoints(points, sel);
      });
    }
  })
  .catch(err => console.error('Σφάλμα στο monuments.json:', err));
