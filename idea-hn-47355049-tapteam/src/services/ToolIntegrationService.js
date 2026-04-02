import {
  insertConnectedTool,
  updateConnectedToolStatus,
  getConnectedToolStatus,
  getAllConnectedTools,
} from '../utils/sqlite';

const connectTool = async (toolName) => {
  const connectedAt = new Date().toISOString();
  const status = 'Connected';

  try {
    const currentStatus = await getConnectedToolStatus(toolName);
    if (currentStatus === null) {
      // Tool not in DB, insert it
      await insertConnectedTool(toolName, status, connectedAt);
    } else {
      // Tool exists, update its status
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
  const connectedAt = null; // Or keep the last connected_at, depending on desired behavior
  const status = 'Not Connected';

  try {
    const currentStatus = await getConnectedToolStatus(toolName);
    if (currentStatus !== null) {
      await updateConnectedToolStatus(toolName, status, connectedAt);
      console.log(`Tool ${toolName} disconnected successfully.`);
      return true;
    } else {
      console.warn(`Attempted to disconnect tool ${toolName} which was not found in DB.`);
      return false; // Or true if we consider it disconnected if not present
    }
  } catch (error) {
    console.error(`Error disconnecting tool ${toolName}:`, error);
    return false;
  }
};

const getToolStatus = async (toolName) => {
  try {
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
};
