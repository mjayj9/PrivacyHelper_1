import fs from 'fs';
import path from 'path';

interface ServerConfig {
  nvidiaApiKey: string;
  selectedModel: string;
  updatedAt: string;
}

const DEFAULT_INITIAL_KEY = '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';

// In-memory cache
let inMemoryConfig: ServerConfig = {
  nvidiaApiKey: process.env.NVIDIA_API_KEY || DEFAULT_INITIAL_KEY,
  selectedModel: 'z-ai/glm-5.2',
  updatedAt: new Date().toISOString()
};

const CONFIG_FILE_PATH = path.join(process.cwd(), '.server_ai_config.json');

// Helper to load persistent file config if available
function loadPersistedConfig(): ServerConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return {
          nvidiaApiKey: parsed.nvidiaApiKey || process.env.NVIDIA_API_KEY || '',
          selectedModel: parsed.selectedModel || 'z-ai/glm-5.2',
          updatedAt: parsed.updatedAt || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('Could not read persistent server config:', err);
  }
  return inMemoryConfig;
}

// Helper to save persistent file config
function savePersistedConfig(config: ServerConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save persistent server config to disk:', err);
  }
}

// Initialize on module load
inMemoryConfig = loadPersistedConfig();

export function getServerNvidiaApiKey(): string {
  if (inMemoryConfig.nvidiaApiKey) return inMemoryConfig.nvidiaApiKey;
  if (process.env.NVIDIA_API_KEY) return process.env.NVIDIA_API_KEY;
  const loaded = loadPersistedConfig();
  return loaded.nvidiaApiKey || process.env.NVIDIA_API_KEY || '';
}

export function getServerSelectedModel(): string {
  return inMemoryConfig.selectedModel || 'z-ai/glm-5.2';
}

export function setServerConfig(apiKey: string, model: string = 'z-ai/glm-5.2'): ServerConfig {
  inMemoryConfig = {
    nvidiaApiKey: apiKey.trim(),
    selectedModel: model.trim() || 'z-ai/glm-5.2',
    updatedAt: new Date().toISOString()
  };
  savePersistedConfig(inMemoryConfig);
  return inMemoryConfig;
}

export function getServerConfigStatus() {
  const currentKey = getServerNvidiaApiKey();
  const currentModel = getServerSelectedModel();
  
  let keyMasked = '';
  if (currentKey) {
    if (currentKey.length > 10) {
      keyMasked = `${currentKey.slice(0, 7)}...${currentKey.slice(-4)}`;
    } else {
      keyMasked = '********';
    }
  }

  return {
    isConfigured: Boolean(currentKey && currentKey.length > 5),
    keyMasked,
    selectedModel: currentModel,
    updatedAt: inMemoryConfig.updatedAt
  };
}
