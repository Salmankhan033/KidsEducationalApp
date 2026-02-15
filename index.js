/**
 * @format
 */

import { AppRegistry, TurboModuleRegistry } from 'react-native';

// Stub missing RNGoogleMobileAdsModule so the app doesn't crash when some code expects it (e.g. leftover or transitive dependency).
if (typeof TurboModuleRegistry !== 'undefined' && TurboModuleRegistry.getEnforcing) {
  const originalGetEnforcing = TurboModuleRegistry.getEnforcing.bind(TurboModuleRegistry);
  TurboModuleRegistry.getEnforcing = function (name) {
    if (name === 'RNGoogleMobileAdsModule') {
      return new Proxy(
        {},
        {
          get() {
            return () => {};
          },
        }
      );
    }
    return originalGetEnforcing(name);
  };
}

// Use require() so App loads after the patch above (imports are hoisted).
const App = require('./App').default;
const { name: appName } = require('./app.json');

AppRegistry.registerComponent(appName, () => App);
