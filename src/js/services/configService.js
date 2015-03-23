'use strict';

angular.module('copayApp.services').factory('configService', function(localStorageService, lodash) {
  var root = {};

  var defaultConfig = {
    // wallet limits
    limits: {
      totalCopayers: 6,
      mPlusN: 100,
    },

    // Bitcore wallet service URL
    bws: {
      url: 'http://localhost:3001/copay/api',
    },

    // insight
    insight: {
      testnet: {
        url: 'https://test-insight.bitpay.com:443',
        transports: ['polling'],
      },
      livenet: {
        url: 'https://insight.bitpay.com:443',
        transports: ['polling'],
      },
    },

    // wallet default config
    wallet: {
      requiredCopayers: 2,
      totalCopayers: 3,
      spendUnconfirmed: true,
      reconnectDelay: 5000,
      idleDurationMin: 4,
      settings: {
        unitName: 'bits',
        unitToSatoshi: 100,
        unitDecimals: 2,
        alternativeName: 'US Dollar',
        alternativeIsoCode: 'USD',
      }
    },

    // local encryption/security config
    passphraseConfig: {
      iterations: 5000,
      storageSalt: 'mjuBtGybi/4=',
    },

    rates: {
      url: 'https://insight.bitpay.com:443/api/rates',
    },
  };

  var configCache = null;

  root.getSync = function() {
    if (!configCache)
      throw new Error('configService#getSync called when cache is not initialized');

    return configCache;
  };

  root.get = function(cb) {
    localStorageService.get('config', function(err, localConfig) {
      configCache = localConfig || defaultConfig;
      return cb(err, configCache);
    });
  };

  root.set = function(newOpts, cb) {
    var config = defaultConfig;
    localStorageService.get('config', function(err, oldOpts) {
      lodash.assign(newOpts, config, oldOpts);
      configCache = newOpts;
      localStorageService.set('config', JSON.stringify(newOpts), cb);
    });
  };

  root.reset = function(cb) {
    localStorageService.remove('config', cb);
  };

  root.getDefaults = function() {
    return defaultConfig;
  };

  return root;
});