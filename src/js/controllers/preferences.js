'use strict';

angular.module('copayApp.controllers').controller('preferencesController',
  function($scope, $rootScope, $filter, $timeout, $modal, balanceService, notification, backupService, profileService, isMobile, isCordova, go) {
    this.isSafari = isMobile.Safari();
    this.isCordova = isCordova;
    this.hideAdv = true;
    this.hidePriv = true;
    this.hideSecret = true;
    this.error = null;
    this.success = null;

    // TODO read config
    this.unitName = 'bits';

    this.unitOpts = [{
      name: 'Satoshis (100,000,000 satoshis = 1BTC)',
      shortName: 'SAT',
      value: 1,
      decimals: 0
    }, {
      name: 'bits (1,000,000 bits = 1BTC)',
      shortName: 'bits',
      value: 100,
      decimals: 2
    }, {
      name: 'mBTC (1,000 mBTC = 1BTC)',
      shortName: 'mBTC',
      value: 100000,
      decimals: 5
    }, {
      name: 'BTC',
      shortName: 'BTC',
      value: 100000000,
      decimals: 8
    }];

    for (var ii in this.unitOpts) {
      if (this.unitName === this.unitOpts[ii].shortName) {
        this.selectedUnit = this.unitOpts[ii];
        break;
      }
    }

    this.rateService = function() {
      $scope.selectedAlternative = {
        name: w.settings.alternativeName,
        isoCode: w.settings.alternativeIsoCode
      };
      $scope.alternativeOpts = rateService.isAvailable() ?
        rateService.listAlternatives() : [$scope.selectedAlternative];

      rateService.whenAvailable(function() {
        $scope.alternativeOpts = rateService.listAlternatives();
        for (var ii in $scope.alternativeOpts) {
          if (w.settings.alternativeIsoCode === $scope.alternativeOpts[ii].isoCode) {
            $scope.selectedAlternative = $scope.alternativeOpts[ii];
          }
        }
      }); 
    };  

    var _modalDeleteWallet = function() {
      var ModalInstanceCtrl = function($scope, $modalInstance) {
        $scope.title = 'Are you sure you want to delete this wallet?';
        $scope.loading = false;

        $scope.ok = function() {
          $scope.loading = true;
          $modalInstance.close('ok');
          
        };
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      };

      var modalInstance = $modal.open({
        templateUrl: 'views/modals/confirmation.html',
        windowClass: 'full',
        controller: ModalInstanceCtrl
      });
      modalInstance.result.then(function(ok) {
console.log('[preferences.js:82]',ok); //TODO
      });
    };

    var _deleteWallet = function() {
      this.loading = true;
      $timeout(function() {
        profileService.deleteWallet(w, function(err) {
          this.loading = false;
          if (err) {
            this.error = err.message || err;
            copay.logger.warn(err);
            $timeout(function () { $scope.$digest(); });
          } else {
            go.walletHome();
            $timeout(function() {
              notification.success('Success', 'The wallet "' + (w.name || w.id) + '" was deleted');
            });
          }
        });
      }, 100);
    };

    this.deleteWallet = function() {
      if (isCordova) {
        navigator.notification.confirm(
          'Are you sure you want to delete this wallet?',
          function(buttonIndex) {
console.log('[preferences.js:67]',buttonIndex); //TODO
            if (buttonIndex == 2) {
              _deleteWallet();
            }
          },
          'Confirm',
          ['Cancel','OK']
        );
      }
      else {
        _modalDeleteWallet();
      }
    };

    this.copyText = function(text) {
      if (isCordova) {
        window.cordova.plugins.clipboard.copy(text);
        window.plugins.toast.showShortCenter('Copied to clipboard');
      }
    };

    this.downloadWalletBackup = function() {
      backupService.walletDownload(w);
    };

    this.viewWalletBackup = function() {
      this.loading = true;
      $timeout(function() {
        this.backupWalletPlainText = backupService.walletEncrypted(w);
      }, 100);
    };

    this.copyWalletBackup = function() {
      var ew = backupService.walletEncrypted(w);
      window.cordova.plugins.clipboard.copy(ew);
      window.plugins.toast.showShortCenter('Copied to clipboard');
    };

    this.sendWalletBackup = function() {
      if (isMobile.Android() || isMobile.Windows()) {
        window.ignoreMobilePause = true;
      }
      window.plugins.toast.showShortCenter('Preparing backup...');
      var name = (w.name || w.id);
      var ew = backupService.walletEncrypted(w);
      var properties = {
        subject: 'Copay Wallet Backup: ' + name,
        body: 'Here is the encrypted backup of the wallet ' 
          + name + ': \n\n' + ew 
          + '\n\n To import this backup, copy all text between {...}, including the symbols {}',
        isHtml:  false
      };
      window.plugin.email.open(properties);
    };

  });