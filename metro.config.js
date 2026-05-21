const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const opentelemetryStub = path.resolve(__dirname, 'metro-stubs/opentelemetry-api.js');

// Resolve optional @opentelemetry/api required by @supabase/supabase-js (web + native)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@opentelemetry/api': opentelemetryStub,
};

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === '@opentelemetry/api' ||
    moduleName.startsWith('@opentelemetry/api/')
  ) {
    return {
      filePath: opentelemetryStub,
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
