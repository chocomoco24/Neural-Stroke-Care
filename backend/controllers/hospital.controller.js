const axios = require("axios");

// GET /hospitals?lat=...&lon=...
const nearbyHospitals = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: "lat and lon query parameters are required" });
    }

    const query =
      `[out:json][timeout:30];` +
      `(` +
      `node['amenity'='hospital'](around:8000,${lat},${lon});` +
      `way['amenity'='hospital'](around:8000,${lat},${lon});` +
      `node['healthcare'='hospital'](around:8000,${lat},${lon});` +
      `);` +
      `out center;`;

    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      new URLSearchParams({ data: query }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "StrokeApp/1.0" },
        timeout: 25000,
      }
    );

    const results = [];
    for (const el of response.data.elements || []) {
      const tags = el.tags || {};
      const name = tags.name || "Unnamed Hospital";
      if (/eye|dental|clinic|optical|vision/i.test(name)) continue;

      const lat2 = el.lat ?? el.center?.lat;
      const lon2 = el.lon ?? el.center?.lon;
      if (!lat2 || !lon2) continue;

      // Haversine distance
      const R = 6371;
      const dLat = ((lat2 - lat) * Math.PI) / 180;
      const dLon = ((lon2 - lon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      results.push({
        name,
        address: tags["addr:full"] || tags["addr:street"] || "Address not available",
        distance: Math.round(distance * 10) / 10,
      });
    }

    results.sort((a, b) => a.distance - b.distance);
    res.json(results.slice(0, 10));
  } catch (err) {
    console.error("hospital lookup error:", err.message);
    res.status(500).json({ message: "Could not fetch hospitals" });
  }
};

module.exports = { nearbyHospitals };
