import localConfig from './env.local.json';
import ngrokConfig from './env.ngrok.json';

const registry = {
  local: localConfig,
  ngrok: ngrokConfig,
};

const activeKey = import.meta.env.VITE_RUNTIME_ENV || 'local';
const runtimeConfig = registry[activeKey] || registry.local;

export const currentEnvironmentKey = activeKey;

export function getRuntimeConfig() {
  return runtimeConfig;
}
