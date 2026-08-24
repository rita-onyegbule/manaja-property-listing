// lib/api-service.js

// Always use proxy for production to avoid CORS issues
const USE_PROXY = true;

/**
 * Get the authentication token from localStorage or cookies
 */
function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || null;
  }
  return null;
}

/**
 * Helper function for making API requests
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const url = USE_PROXY 
    ? `/api/proxy${endpoint}` 
    : endpoint;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// PUBLIC LISTINGS ENDPOINT
// ============================================

/**
 * Fetch public listings from /listings endpoint
 * Only returns properties with occupancy_status = available
 */
export async function getListings(params = {}) {
  const queryParams = new URLSearchParams();
  
  const paramMap = {
    search: 'search',
    type: 'property_type',
    state: 'state',
    beds: 'bedrooms',
    property_status: 'property_status',
    limit: 'limit',
    offset: 'offset',
    occupancy_status: 'occupancy_status',
    property_id: 'property_id',
  };

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      const apiKey = paramMap[key] || key;
      queryParams.append(apiKey, value);
    }
  });

  if (!params.limit) queryParams.append('limit', 10);
  if (params.offset === undefined) queryParams.append('offset', 0);
  
  // ALWAYS request occupancy_status=available for public listings
  if (!params.occupancy_status) {
    queryParams.append('occupancy_status', 'available');
  }

  const url = `/listings?${queryParams.toString()}`;
  return apiRequest(url);
}

// ============================================
// PROPERTY ENDPOINTS
// ============================================

/**
 * Fetch a single property by name using /listings endpoint (public)
 */
export async function getPropertyById(name) {
  try {
    console.log('=== getPropertyById DEBUG ===');
    console.log('Searching for property with name:', name);
    console.log('Decoded name:', decodeURIComponent(name));
    
    // Use the public /listings endpoint to get all properties, then filter by exact name match
    const queryParams = new URLSearchParams();
    queryParams.append('limit', 100); // Get more properties to find the exact match
    const url = `/listings?${queryParams.toString()}`;
    const data = await apiRequest(url);
    
    // Handle different response formats
    const properties = Array.isArray(data) ? data : (data?.items || data?.properties || []);
    
    console.log('Total properties fetched:', properties.length);
    console.log('Available property names:', properties.map(p => p.name));
    
    // Find exact name match (case-insensitive, handle URL encoding)
    const decodedName = decodeURIComponent(name);
    const exactMatch = properties.find(p => {
      const decodedPropName = decodeURIComponent(p.name || '');
      return decodedPropName === decodedName || 
             decodedPropName?.toLowerCase() === decodedName?.toLowerCase() ||
             p.name === name || 
             p.name?.toLowerCase() === name?.toLowerCase();
    });
    
    console.log('Match found:', exactMatch ? exactMatch.name : 'No match');
    console.log('============================');
    
    return exactMatch || null;
  } catch (error) {
    console.error('Failed to fetch property by name:', error);
    return null;
  }
}

/**
 * Get property stats for dashboard - /metro/properties/stats
 */
export async function getPropertyStats() {
  try {
    return await apiRequest('/metro/properties/stats');
  } catch (error) {
    console.error('Failed to fetch property stats:', error);
    return { total_properties: 0, portfolio_value: '0' };
  }
}

/**
 * Get similar properties
 */
export async function getSimilarProperties(propertyId, limit = 3) {
  try {
    const property = await getPropertyById(propertyId);
    if (!property) return [];
    
    const allListings = await getListings({ limit: 100 });
    const properties = Array.isArray(allListings) ? allListings : (allListings?.items || []);
    
    return properties
      .filter(p => 
        p.id !== propertyId && 
        (p.property_type === property.property_type || 
         p.state === property.state)
      )
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    return [];
  }
}

// ============================================
// PUBLIC MANAGERS - Using available endpoints
// ============================================

/**
 * Get all managers with their properties
 * This extracts manager info from property listings
 * since there's no /metro/managers/public endpoint yet
 */
export async function getPublicManagers() {
  try {
    // Get all available listings
    const listings = await getListings({ limit: 100 });
    const properties = Array.isArray(listings) ? listings : (listings?.items || []);
    
    // Group properties by landlord_id
    const managerMap = new Map();
    
    for (const prop of properties) {
      if (prop.landlord_id) {
        if (!managerMap.has(prop.landlord_id)) {
          managerMap.set(prop.landlord_id, {
            id: prop.landlord_id,
            name: prop.landlord_name || `Manager ${prop.landlord_id.slice(0, 8)}`,
            company: prop.landlord_company || '',
            location: prop.state || '',
            properties: [],
            is_verified: prop.landlord_verified || false,
            listing_count: 0,
            rating: 4.5,
            specialties: [],
            phone: prop.landlord_phone || '',
            email: prop.landlord_email || '',
          });
        }
        managerMap.get(prop.landlord_id).properties.push(prop);
        managerMap.get(prop.landlord_id).listing_count += 1;
      }
    }
    
    // Convert map to array
    const managers = Array.from(managerMap.values());
    
    // Try to get additional manager details if authenticated
    try {
      const token = getAuthToken();
      if (token && managers.length > 0) {
        // Try to get manager details from /metro/managers/me
        const response = await fetch('/api/proxy/metro/managers/me', {
          headers: { 'Authorization': token }
        });
        if (response.ok) {
          const data = await response.json();
          // Update the matching manager
          const manager = managers.find(m => m.id === data.id);
          if (manager) {
            manager.name = data.display_name || data.name || manager.name;
            manager.is_verified = data.is_active || manager.is_verified;
            manager.phone = data.phone_number || manager.phone;
          }
        }
      }
    } catch (e) {
      // Silently fail if we can't get additional details
    }
    
    return managers;
  } catch (error) {
    console.error('Failed to fetch public managers:', error);
    return [];
  }
}

/**
 * Get a single manager by ID with their properties
 */
export async function getPublicManagerById(managerId) {
  try {
    // Get all listings
    const listings = await getListings({ limit: 100 });
    const properties = Array.isArray(listings) ? listings : (listings?.items || []);
    
    // Filter properties for this manager
    const managerProperties = properties.filter(p => p.landlord_id === managerId);
    
    if (managerProperties.length === 0) {
      return null;
    }
    
    const firstProp = managerProperties[0];
    
    const manager = {
      id: managerId,
      name: firstProp.landlord_name || `Manager ${managerId.slice(0, 8)}`,
      company: firstProp.landlord_company || '',
      location: firstProp.state || '',
      phone: firstProp.landlord_phone || '',
      email: firstProp.landlord_email || '',
      is_verified: firstProp.landlord_verified || false,
      listing_count: managerProperties.length,
      rating: 4.5,
      specialties: [],
      properties: managerProperties,
    };
    
    // Try to get additional manager details (if authenticated)
    try {
      const token = getAuthToken();
      if (token) {
        const response = await fetch('/api/proxy/metro/managers/me', {
          headers: { 'Authorization': token }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.id === managerId || data.employee_id === managerId) {
            manager.name = data.display_name || data.name || manager.name;
            manager.is_verified = data.is_active || manager.is_verified;
            manager.phone = data.phone_number || manager.phone;
          }
        }
      }
    } catch (e) {
      // Silently fail
    }
    
    return manager;
  } catch (error) {
    console.error('Failed to fetch manager by ID:', error);
    return null;
  }
}

/**
 * Get properties for a specific manager
 */
export async function getManagerProperties(managerId, params = {}) {
  try {
    // Get all listings and filter by landlord_id
    const listings = await getListings({ 
      limit: 100,
      ...params
    });
    const properties = Array.isArray(listings) ? listings : (listings?.items || []);
    
    return properties.filter(p => p.landlord_id === managerId);
  } catch (error) {
    console.error('Failed to fetch manager properties:', error);
    return [];
  }
}

// ============================================
// HELPERS
// ============================================

export async function submitContactForm(data) {
  return apiRequest('/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}