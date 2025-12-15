// Simple in-memory logger for debug purposes
const logs = [];
const MAX_LOGS = 100; // Keep last 100 logs

const log = (level, message, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };
  
  logs.push(logEntry);
  
  // Keep only last MAX_LOGS entries
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }
  
  // Also log to console
  const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  consoleMethod(`[${level.toUpperCase()}] ${message}`, data);
};

const getLogs = (limit = 20) => {
  return logs.slice(-limit);
};

const clearLogs = () => {
  logs.length = 0;
};

module.exports = {
  log,
  getLogs,
  clearLogs
};

