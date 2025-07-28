// initialize map
const map = L.map('map').setView([37.9838, 23.7275], 11);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Font‑Awesome icons & colors per category
const faIcons = {
  1: 'fa-house',          // Κατοικίες και Ιστορικά Κτήρια
  2: 'fa-church',         // Θρησκευτικά Μνημεία
  3: 'fa-industry',       // Βιομηχανικά Κτήρια
  4: 'fa-landmark',       // Δημόσια Κτήρια
  5: 'fa-graduation-cap', // Εκπαιδευτικά Ιδρύματα
  6: 'fa-monument',       // Τόποι Μνήμης
  7: 'fa-briefcase-medical' // Δομές Υγείας
};
const iconColors = {
  1: '#67B7D1', 2: '#dcb786', 3: '#777373',
  4: '#e36b6b', 5: '#9a86d3', 6: '#7a7a52',
  7: '#4cb2a2'
};

// build a Leaflet.divIcon for a given category
function createFAIcon(cat) {
  const iconClass = faIcons[cat] || 'fa-map-marker-alt';
  const iconColor = iconColors[cat] || '#333';
  return L.divIcon({
    className: 'fa-icon-marker',
    html: `<i class="fas ${iconClass}" style="font-size:22px;color:${iconColor};"></i>`,
    iconSize: [24,24],
    iconAnchor: [12,24],
    popupAnchor: [0,-24]
  });
}

// render a list of points, given an optional selectedCategory (string or "")
let allMarkers = [];
function showPoints(points, selectedCategory = "") {
  // clear existing
  allMarkers.forEach(m => map.removeLayer(m));
  allMarkers = [];

  // loop once, decide per-point which category-icon to use
  points.forEach(p => {
    // decide which category to use:
    // - if user selected one, use that
    // - else take the first of p.cat (could also pick random if you prefer)
    const catNum = selectedCategory
      ? Number(selectedCategory)
      : (Array.isArray(p.cat) && p.cat.length > 0
          ? p.cat[0]
          : null);

    const marker = L.marker(p.coords, {
      icon: createFAIcon(catNum)
    }).addTo(map);

    // bind popup (same html for all)
    const html = `
 <div style="text-align: center; max-width: 240px;">
    <div style="width: 100%;">
      <img 
        src="${p.image}" 
        alt="${p.name}" 
        style="width: 100%; max-width: 160px; height: auto; aspect-ratio: 4/3; border-radius: 6px; margin-bottom: 6px;" 
      />
    </div>
    <strong>${p.name}</strong><br>
    <small>${p.info}</small><br>
    <a 
      href="${p.url}" 
      target="_blank" 
      rel="noopener noreferrer" 
      style="display: inline-block; margin-top: 4px; color: #007bff; text-decoration: underline;"
    >
      Δείτε Περισσότερα...
    </a>
  </div>`;
    marker.bindPopup(html);

    allMarkers.push(marker);
  });
}

// load data and wire up filter
fetch('monuments.json')
  .then(r => r.json())
  .then(data => {
    const points = data;
    showPoints(points); // initial

    document.getElementById('category')
      .addEventListener('change', function() {
        const sel = this.value;  // "" or "4", etc
        if (sel === "") {
          // no filter → show all
          showPoints(points, "");
        } else {
          // filter and show only matching
          const num = Number(sel);
          const filtered = points.filter(p => p.cat.includes(num));
          showPoints(filtered, sel);
        }
      });
  })
  .catch(err => console.error('Σφάλμα στο monuments.json:', err));
