// Optimize dashboard loading with in-memory role caching
const roleCache = new Map();

// Function to get roles for a user
async function getRoles(userId) {
    if (roleCache.has(userId)) {
        return roleCache.get(userId);
    }

    const roles = await fetchRolesFromDatabase(userId); // Fetch from database
    roleCache.set(userId, roles);
    return roles;
}

// Other code for handling dashboard loading...
