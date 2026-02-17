// Update user metadata with role caching
const userMetadata = {}; // Store user metadata for caching

function getUserRole(userId) {
    // Check if the user role is already cached
    if (userMetadata[userId]) {
        return userMetadata[userId].role;
    }

    // If not cached, get it from auth (mock function)
    const user = getAuthUser(userId); // Assume this fetches user info from authentication platform
    
    // Cache the user role
    userMetadata[userId] = { role: user.role }; 
    return user.role;
}

// Mock function to simulate getting the authentication user
function getAuthUser(userId) {
    // Mock response
    return { id: userId, role: 'admin' }; // Example role
}