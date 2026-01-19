import localConfig from './env.local.json';
import ngrokConfig from './env.ngrok.json';
import productionConfig from './env.production.json';

const registry = {
  local: localConfig,
  ngrok: ngrokConfig,
  production: productionConfig,
};

// 生产构建时默认使用 production 配置
const defaultKey = import.meta.env.PROD ? 'production' : 'local';
const activeKey = import.meta.env.VITE_RUNTIME_ENV || defaultKey;
const runtimeConfig = registry[activeKey] || registry.local;

export const currentEnvironmentKey = activeKey;

export function getRuntimeConfig() {
  return runtimeConfig;
}
