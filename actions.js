var map = L.map('map').setView([37.9838, 23.7275], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

var allMarkers = [];
var points = [];

const faIcons = {
  1: 'fa-house',        // Κατοικία
  2: 'fa-church',       // Εκκλησία
  3: 'fa-industry',     // Βιομηχανία
  4: 'fa-landmark'      // Δημόσιο Κτίριο
};

function createFAIcon(cat) {
  const iconClass = faIcons[cat] || 'fa-map-marker-alt';
  return L.divIcon({
    className: 'fa-icon-marker',
    html: `<i class="fas ${iconClass}" style="font-size: 24px; color: #67B7D1;"></i>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
}

function showPoints(filteredPoints) {
  allMarkers.forEach(marker => map.removeLayer(marker));
  allMarkers = [];

  filteredPoints.forEach(p => {
    const marker = L.marker(p.coords, {
      icon: createFAIcon(p.cat)
    }).addTo(map)
      .bindPopup(`
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
</div>

        `);
    allMarkers.push(marker);
  });
}

fetch('monuments.json')
  .then(response => response.json())
  .then(data => {
    points = data;
    showPoints(points); // initial

    document.getElementById('category').addEventListener('change', function () {
      const selected = this.value;
      if (selected === "") {
        showPoints(points);
      } else {
        const filtered = points.filter(p => p.cat == selected);
        showPoints(filtered);
      }
    });
  })
  .catch(error => {
    console.error('Σφάλμα κατά τη φόρτωση του monuments.json:', error);
  });