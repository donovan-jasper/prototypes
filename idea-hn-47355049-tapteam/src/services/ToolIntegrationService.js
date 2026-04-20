import {
  insertConnectedTool,
  updateConnectedToolStatus,
  getConnectedToolStatus,
  getAllConnectedTools,
} from '../utils/sqlite';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_SCOPES, GOOGLE_DRIVE_TOKEN_KEY } from '../utils/constants';

// Ensure WebBrowser is ready for use
WebBrowser.maybeCompleteAuthSession();

// --- SecureStore for Google Drive Token ---
const getGoogleDriveAccessToken = async () => {
  try {
    return await SecureStore.getItemAsync(GOOGLE_DRIVE_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting Google Drive access token:", error);
    return null;
  }
};

const setGoogleDriveAccessToken = async (token) => {
  try {
    await SecureStore.setItemAsync(GOOGLE_DRIVE_TOKEN_KEY, token);
    console.log("Google Drive access token stored securely.");
    return true;
  } catch (error) {
    console.error("Error setting Google Drive access token:", error);
    return false;
  }
};

const clearGoogleDriveAccessToken = async () => {
  try {
    await SecureStore.deleteItemAsync(GOOGLE_DRIVE_TOKEN_KEY);
    console.log("Google Drive access token cleared.");
    return true;
  } catch (error) {
    console.error("Error clearing Google Drive access token:", error);
    return false;
  }
};

// --- Google Drive OAuth and API Integration ---

const initiateGoogleDriveAuth = async () => {
  if (!GOOGLE_DRIVE_CLIENT_ID || GOOGLE_DRIVE_CLIENT_ID === "YOUR_GOOGLE_DRIVE_CLIENT_ID") {
    console.error("Google Drive Client ID is not configured. Please update src/utils/constants.js and app.json.");
    return { success: false, error: "Google Drive Client ID not configured." };
  }

  const redirectUri = AuthSession.makeRedirectUri({
    native: 'raccoonai://redirect', // Use the custom scheme defined in app.json
    useProxy: true, // Required for Expo Go
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_DRIVE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token&` +
    `scope=${encodeURIComponent(GOOGLE_DRIVE_SCOPES.join(' '))}&` +
    `access_type=offline&` + // Request refresh token (though we only handle access token here)
    `prompt=consent`; // Always show consent screen

  console.log("Google Drive Auth URL:", authUrl);
  console.log("Google Drive Redirect URI:", redirectUri);

  try {
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.params && result.params.access_token) {
      const accessToken = result.params.access_token;
      await setGoogleDriveAccessToken(accessToken);
      await connectTool('Google Drive'); // Update local DB status
      return { success: true, accessToken };
    } else if (result.type === 'cancel') {
      console.log("Google Drive authentication cancelled.");
      return { success: false, error: "Authentication cancelled" };
    } else if (result.type === 'error') {
      console.error("Google Drive authentication error:", result.error);
      return { success: false, error: result.error || "Authentication failed" };
    } else {
      console.log("Google Drive authentication result:", result);
      return { success: false, error: "Unknown authentication result" };
    }
  } catch (error) {
    console.error("Error during Google Drive authentication:", error);
    return { success: false, error: error.message || "Authentication process failed" };
  }
};

const listGoogleDriveFolders = async () => {
  const accessToken = await getGoogleDriveAccessToken();
  if (!accessToken) {
    console.warn("No Google Drive access token found.");
    return { success: false, error: "Not authenticated with Google Drive." };
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=' +
      encodeURIComponent("'root' in parents and mimeType = 'application/vnd.google-apps.folder'") +
      '&fields=files(id,name)',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Drive API error:", response.status, errorData);
      // If token is expired or invalid, clear it
      if (response.status === 401) {
        await clearGoogleDriveAccessToken();
        await disconnectTool('Google Drive');
        return { success: false, error: "Google Drive token expired or invalid. Please reconnect." };
      }
      return { success: false, error: `Google Drive API error: ${response.status} - ${errorData.error.message}` };
    }

    const data = await response.json();
    return { success: true, folders: data.files };
  } catch (error) {
    console.error("Error listing Google Drive folders:", error);
    return { success: false, error: error.message || "Failed to list folders." };
  }
};

// --- Existing Tool Integration Logic (modified for Google Drive) ---

const connectTool = async (toolName) => {
  const connectedAt = new Date().toISOString();
  const status = 'Connected';

  try {
    const currentStatus = await getConnectedToolStatus(toolName);
    if (currentStatus === null) {
      await insertConnectedTool(toolName, status, connectedAt);
    } else {
      await updateConnectedToolStatus(toolName, status, connectedAt);
    }
    console.log(`Tool ${toolName} connected successfully.`);
    return true;
  } catch (error) {
    console.error(`Error connecting tool ${toolName}:`, error);
    return false;
  }
};

const disconnectTool = async (toolName) => {
  const connectedAt = null;
  const status = 'Not Connected';

  try {
    if (toolName === 'Google Drive') {
      await clearGoogleDriveAccessToken(); // Clear token for Google Drive
    }

    const currentStatus = await getConnectedToolStatus(toolName);
    if (currentStatus !== null) {
      await updateConnectedToolStatus(toolName, status, connectedAt);
      console.log(`Tool ${toolName} disconnected successfully.`);
      return true;
    } else {
      console.warn(`Attempted to disconnect tool ${toolName} which was not found in DB.`);
      return false;
    }
  } catch (error) {
    console.error(`Error disconnecting tool ${toolName}:`, error);
    return false;
  }
};

const getToolStatus = async (toolName) => {
  try {
    // For Google Drive, also check if a token exists in SecureStore
    if (toolName === 'Google Drive') {
      const token = await getGoogleDriveAccessToken();
      return token ? 'Connected' : 'Not Connected';
    }
    const status = await getConnectedToolStatus(toolName);
    return status || 'Not Connected'; // Default to 'Not Connected' if not found
  } catch (error) {
    console.error(`Error getting status for tool ${toolName}:`, error);
    return 'Error';
  }
};

const getToolsWithStatus = async (supportedTools) => {
  try {
    const allDbTools = await getAllConnectedTools();
    const toolStatusMap = {};

    // Initialize all supported tools as 'Not Connected'
    supportedTools.forEach(tool => {
      toolStatusMap[tool] = 'Not Connected';
    });

    // Override with actual statuses from DB
    allDbTools.forEach(dbTool => {
      if (supportedTools.includes(dbTool.tool_name)) {
        toolStatusMap[dbTool.tool_name] = dbTool.status;
      }
    });

    // Special handling for Google Drive to reflect actual token presence
    if (supportedTools.includes('Google Drive')) {
      const token = await getGoogleDriveAccessToken();
      if (token) {
        toolStatusMap['Google Drive'] = 'Connected';
        // Also ensure DB reflects this if it somehow got out of sync
        const dbStatus = await getConnectedToolStatus('Google Drive');
        if (dbStatus !== 'Connected') {
          await connectTool('Google Drive'); // Re-sync DB status
        }
      } else {
        toolStatusMap['Google Drive'] = 'Not Connected';
        // Also ensure DB reflects this if it somehow got out of sync
        const dbStatus = await getConnectedToolStatus('Google Drive');
        if (dbStatus === 'Connected') {
          await disconnectTool('Google Drive'); // Re-sync DB status
        }
      }
    }

    return toolStatusMap;
  } catch (error) {
    console.error('Error fetching all tool statuses:', error);
    return {};
  }
};

export {
  connectTool,
  disconnectTool,
  getToolStatus,
  getToolsWithStatus,
  initiateGoogleDriveAuth,
  listGoogleDriveFolders,
  getGoogleDriveAccessToken,
  clearGoogleDriveAccessToken,
};
