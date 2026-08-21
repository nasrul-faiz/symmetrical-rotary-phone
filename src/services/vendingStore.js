const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'vending-data.json');

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeUpper(value) {
  return normalizeText(value).toUpperCase();
}

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const routes = Array.isArray(parsed?.routes) ? parsed.routes : [];
    const locations = Array.isArray(parsed?.locations) ? parsed.locations : [];
    const routeLocations = Array.isArray(parsed?.routeLocations) ? parsed.routeLocations : [];

    return {
      routes,
      locations,
      routeLocations,
    };
  } catch (error) {
    return {
      routes: [],
      locations: [],
      routeLocations: [],
    };
  }
}

const store = loadData();

function persist() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error('[VendingStore] Failed to persist data:', error.message);
  }
}

function listRoutes() {
  return [...store.routes].sort((a, b) => String(a.code).localeCompare(String(b.code)));
}

function listLocations() {
  return [...store.locations].sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

function listRouteLocations() {
  return [...store.routeLocations].sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0));
}

function createRoute(payload = {}) {
  const id = normalizeText(payload.id);
  const code = normalizeUpper(payload.code);
  const name = normalizeText(payload.name);
  const description = normalizeText(payload.description);

  if (!id || !code || !name) {
    throw new Error('Route id, route code and route name are required');
  }

  const duplicateId = store.routes.find((item) => String(item.id) === id);
  if (duplicateId) {
    throw new Error('Route id already exists');
  }

  const existing = store.routes.find((item) => normalizeUpper(item.code) === code);
  if (existing) {
    throw new Error('Route code already exists');
  }

  const route = {
    id,
    code,
    name,
    description,
    createdAt: new Date().toISOString(),
  };

  store.routes.push(route);
  persist();
  return route;
}

function updateRoute(id, payload = {}) {
  const target = store.routes.find((item) => String(item.id) === String(id));
  if (!target) {
    throw new Error('Route not found');
  }

  const code = normalizeUpper(payload.code);
  const name = normalizeText(payload.name);
  const description = normalizeText(payload.description);

  if (!code || !name) {
    throw new Error('Route code and route name are required');
  }

  const duplicate = store.routes.find(
    (item) => String(item.id) !== String(id) && normalizeUpper(item.code) === code
  );
  if (duplicate) {
    throw new Error('Route code already exists');
  }

  target.code = code;
  target.name = name;
  target.description = description;
  target.updatedAt = new Date().toISOString();

  persist();
  return target;
}

function removeRoute(id) {
  const hasRelation = store.routeLocations.some((item) => String(item.routeId) === String(id));
  if (hasRelation) {
    throw new Error('Route is used in Route Location mapping and cannot be deleted');
  }

  const index = store.routes.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    return false;
  }

  store.routes.splice(index, 1);
  persist();
  return true;
}

function createLocation(payload = {}) {
  const id = normalizeText(payload.id);
  const name = normalizeText(payload.name);
  const address = normalizeText(payload.address);
  const notes = normalizeText(payload.notes);

  if (!id || !name) {
    throw new Error('Location id and location name are required');
  }

  const duplicateId = store.locations.find((item) => String(item.id) === id);
  if (duplicateId) {
    throw new Error('Location id already exists');
  }

  const duplicate = store.locations.find((item) => normalizeText(item.name).toLowerCase() === name.toLowerCase());
  if (duplicate) {
    throw new Error('Location name already exists');
  }

  const location = {
    id,
    name,
    address,
    notes,
    createdAt: new Date().toISOString(),
  };

  store.locations.push(location);
  persist();
  return location;
}

function updateLocation(id, payload = {}) {
  const target = store.locations.find((item) => String(item.id) === String(id));
  if (!target) {
    throw new Error('Location not found');
  }

  const name = normalizeText(payload.name);
  const address = normalizeText(payload.address);
  const notes = normalizeText(payload.notes);

  if (!name) {
    throw new Error('Location name is required');
  }

  const duplicate = store.locations.find(
    (item) => String(item.id) !== String(id) && normalizeText(item.name).toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    throw new Error('Location name already exists');
  }

  target.name = name;
  target.address = address;
  target.notes = notes;
  target.updatedAt = new Date().toISOString();

  persist();
  return target;
}

function removeLocation(id) {
  const hasRelation = store.routeLocations.some((item) => String(item.locationId) === String(id));
  if (hasRelation) {
    throw new Error('Location is used in Route Location mapping and cannot be deleted');
  }

  const index = store.locations.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    return false;
  }

  store.locations.splice(index, 1);
  persist();
  return true;
}

function createRouteLocation(payload = {}) {
  const id = normalizeText(payload.id);
  const routeId = normalizeText(payload.routeId);
  const locationId = normalizeText(payload.locationId);
  const sequence = Math.max(1, Number(payload.sequence) || 1);
  const status = normalizeText(payload.status).toLowerCase() === 'inactive' ? 'inactive' : 'active';

  if (!id || !routeId || !locationId) {
    throw new Error('Route Location id, route and location are required');
  }

  const duplicateId = store.routeLocations.find((item) => String(item.id) === id);
  if (duplicateId) {
    throw new Error('Route Location id already exists');
  }

  const routeExists = store.routes.some((item) => String(item.id) === routeId);
  const locationExists = store.locations.some((item) => String(item.id) === locationId);
  if (!routeExists || !locationExists) {
    throw new Error('Selected route/location does not exist');
  }

  const duplicate = store.routeLocations.find(
    (item) => String(item.routeId) === routeId && String(item.locationId) === locationId
  );
  if (duplicate) {
    throw new Error('Route Location mapping already exists');
  }

  const item = {
    id,
    routeId,
    locationId,
    sequence,
    status,
    createdAt: new Date().toISOString(),
  };

  store.routeLocations.push(item);
  persist();
  return item;
}

function updateRouteLocation(id, payload = {}) {
  const target = store.routeLocations.find((item) => String(item.id) === String(id));
  if (!target) {
    throw new Error('Route Location mapping not found');
  }

  const routeId = normalizeText(payload.routeId);
  const locationId = normalizeText(payload.locationId);
  const sequence = Math.max(1, Number(payload.sequence) || 1);
  const status = normalizeText(payload.status).toLowerCase() === 'inactive' ? 'inactive' : 'active';

  if (!routeId || !locationId) {
    throw new Error('Route and Location are required');
  }

  const routeExists = store.routes.some((item) => String(item.id) === routeId);
  const locationExists = store.locations.some((item) => String(item.id) === locationId);
  if (!routeExists || !locationExists) {
    throw new Error('Selected route/location does not exist');
  }

  const duplicate = store.routeLocations.find(
    (item) => String(item.id) !== String(id)
      && String(item.routeId) === routeId
      && String(item.locationId) === locationId
  );
  if (duplicate) {
    throw new Error('Route Location mapping already exists');
  }

  target.routeId = routeId;
  target.locationId = locationId;
  target.sequence = sequence;
  target.status = status;
  target.updatedAt = new Date().toISOString();

  persist();
  return target;
}

function removeRouteLocation(id) {
  const index = store.routeLocations.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    return false;
  }

  store.routeLocations.splice(index, 1);
  persist();
  return true;
}

module.exports = {
  listRoutes,
  listLocations,
  listRouteLocations,
  createRoute,
  updateRoute,
  removeRoute,
  createLocation,
  updateLocation,
  removeLocation,
  createRouteLocation,
  updateRouteLocation,
  removeRouteLocation,
};
