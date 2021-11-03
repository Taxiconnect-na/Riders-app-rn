/* eslint-disable prettier/prettier */
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import GeolocationP from 'react-native-geolocation-service';
import {point} from '@turf/helpers';
import {
  View,
  Text,
  Animated as AnimatedNative,
  Easing,
  PermissionsAndroid,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  InteractionManager,
  BackHandler,
  Platform,
  SafeAreaView,
  Linking,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import bearing from '@turf/bearing';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFeather from 'react-native-vector-icons/Feather';
import ErrorModal from '../Helpers/ErrorModal';
import NetInfo from '@react-native-community/netinfo';
import Search from '../Modules/Search/Components/Search';
import OneSignal from 'react-native-onesignal';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
//Import of action creators
import {
  ResetStateProps,
  UpdateGrantedGRPS,
  UpdatePendingGlobalVars,
  UpdateRouteToPickupVars,
  InRouteToPickupInitVars,
  __Update_InRouteToPickupInitVars,
  InRouteToDestinationInitVars,
  __Update_InRouteToDestinationInitVars,
  UpdateHellosVars,
  UpdateSchedulerState,
  UpdateBottomVitalsState,
  UpdateProcessFlowState,
  UpdateMapUsabilityState,
  UpdateCurrentLocationMetadat,
  UpdatePricingStateData,
  UpdateRoutePreviewToDestination,
  UpdateClosestDriversList,
  UpdateErrorBottomVitals,
  UpdateErrorModalLog,
  UpdateDropoffDataFor_driverRating,
  UpdateTotalWalletAmount,
  UpdateKeyboardStateGlobal,
  UpdateADGetData,
} from '../Redux/HomeActionsCreators';
import RenderBottomVital from './RenderBottomVital';
import RenderMainMapView from './RenderMainMapView';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';
import SyncStorage from 'sync-storage';
import {RFValue} from 'react-native-responsive-fontsize';

//DEBUG
//import {ROUTE} from './Route';
const INIT_ZOOM_LEVEL = 0.384695086717085;
const PADDING_LIMIT = 150;

//Greetings dictionnary

class Home extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE HOME SCREEN WHEN UNMOUNTED.
    this._shouldShow_errorModal = true; //! ERROR MODAL AUTO-LOCKER - PERFORMANCE IMPROVER.

    //Handlers
    this.backHander = null;

    this.state = {
      networkStateChecker: false,
    };
    OneSignal.setAppId('05ebefef-e2b4-48e3-a154-9a00285e394b');
    OneSignal.setRequiresUserPrivacyConsent(false);
    if (Platform.OS === 'ios') {
      OneSignal.promptForPushNotificationsWithUserResponse((response) => {});
    }
  }

  _RESET_STATE() {
    this.props.ResetStateProps(this);
    //...
    if (this.camera !== undefined && this.camera != null) {
      //! Coordinates order fix - major bug fix for ocean bug
      if (
        this.props.App.latitude !== undefined &&
        this.props.App.latitude !== null &&
        this.props.App.latitude !== 0 &&
        this.props.App.longitude !== undefined &&
        this.props.App.longitude !== null &&
        this.props.App.longitude !== 0
      ) {
        //? Switch latitude and longitude - check the negative sign
        if (parseFloat(this.props.App.longitude) < 0) {
          //Negative - switch
          let latitudeTmp = this.props.App.latitude;
          this.props.App.latitude = this.props.App.longitude;
          this.props.App.longitude = latitudeTmp;
        }
      }
      //!--------- Ocean bug fix
      this.camera.moveTo(
        [this.props.App.longitude, this.props.App.latitude],
        70,
        1500,
      );
    }
  }

  /**
   * @func GPRS_resolver()
   * Responsible for getting the permission to the GPRS location for the user and
   * lock them from useing the app without the proper GPRS permissions.
   *
   */
  async GPRS_resolver(promptActivation = false) {
    let that = this;
    //Check if the app already has the GPRS permissions
    if (Platform.OS === 'android') {
      try {
        const checkGPRS = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (checkGPRS) {
          //Permission already granted
          //Unlock the platform if was locked
          if (true) {
            const requestLocationPermission = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: 'Enable location',
                message:
                  'TaxiConnect requires access to your location to provide an optimal experience.',
                buttonPositive: 'Allow',
                buttonNegative: 'Cancel',
              },
            );
            //...
            if (
              requestLocationPermission === PermissionsAndroid.RESULTS.GRANTED
            ) {
              if (
                this.props.App.gprsGlobals.hasGPRSPermissions === false ||
                this.props.App.gprsGlobals.didAskForGprs === false ||
                this.props.App.latitude === 0 ||
                this.props.App.longitude === 0
              ) {
                if (/off the map/i.test(this.props.App.hello2Text)) {
                  that.replaceHello2_text(`Hi ${this.props.App.username}`);
                }
                //Permission granted
                this.getCurrentPositionCusto();
                GeolocationP.getCurrentPosition(
                  (position) => {
                    that.props.App.latitude = position.coords.latitude;
                    that.props.App.longitude = position.coords.longitude;
                    //Update GPRS permission global var
                    let newStateVars = {};
                    newStateVars.hasGPRSPermissions = true;
                    newStateVars.didAskForGprs = true;
                    that.props.UpdateGrantedGRPS(newStateVars);
                    //Launch recalibration
                    that.recalibrateMap();
                  },
                  () => {
                    // See error code charts below.
                    //Launch recalibration
                    that.recalibrateMap();
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 2000,
                    maximumAge: 1000,
                    distanceFilter: 0,
                  },
                );
                this.props.App.isMapPermitted = true;
              } else {
                if (/off the map/i.test(this.props.App.hello2Text)) {
                  that.replaceHello2_text(`Hi ${this.props.App.username}`);
                }
                that.updateDriver_realTimeMap();
                if (that.props.App._MAX_NUMBER_OF_CALLBACKS_MAP > 0) {
                  //! Decrement promise controller
                  that.props.App._MAX_NUMBER_OF_CALLBACKS_MAP -= 1;
                  GeolocationP.getCurrentPosition(
                    (position) => {
                      //! Increment promise controller
                      that.props.App._MAX_NUMBER_OF_CALLBACKS_MAP += 1;
                      //!----
                      that.props.App.latitude = position.coords.latitude;
                      that.props.App.longitude = position.coords.longitude;
                      //Get user location
                      that.props.App.socket.emit('geocode-this-point', {
                        latitude: that.props.App.latitude,
                        longitude: that.props.App.longitude,
                        user_fingerprint: that.props.App.user_fingerprint,
                        geolocationData: position,
                      });
                      //Update GPRS permission global var
                      let newStateVars = {};
                      newStateVars.hasGPRSPermissions = true;
                      newStateVars.didAskForGprs = true;
                      that.props.UpdateGrantedGRPS(newStateVars);
                    },
                    () => {
                      //! Increment promise controller
                      that.props.App._MAX_NUMBER_OF_CALLBACKS_MAP += 1;
                      //!----
                      // See error code charts below.
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        that.recalibrateMap();
                      });
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 2000,
                      maximumAge: 10000,
                      distanceFilter: 0,
                    },
                  );
                }
                //Check the zoom level
                if (this._map !== undefined && this._map != null) {
                  if (
                    this._map !== undefined &&
                    this._map != null &&
                    this.props.App.isRideInProgress === false
                  ) {
                    const mapZoom = await this._map.getZoom();
                    if (mapZoom > 18) {
                      InteractionManager.runAfterInteractions(() => {
                        that.recalibrateMap();
                      });
                    }
                  }
                }
              }
            } //Permission denied
            else {
              //Permission denied, update gprs global vars and lock the platform
              let newStateVars = {};
              newStateVars.hasGPRSPermissions = false;
              newStateVars.didAskForGprs = true;
              this.props.UpdateGrantedGRPS(newStateVars);
              //Close loading animation
              this.resetAnimationLoader();
            }
          }
        } //Permission denied
        else {
          if (promptActivation === false) {
            //Permission denied, update gprs global vars and lock the platform
            let newStateVars = {};
            newStateVars.hasGPRSPermissions = false;
            newStateVars.didAskForGprs = true;
            this.props.UpdateGrantedGRPS(newStateVars);
            //Close loading animation
            this.resetAnimationLoader();
          } //Prompt the activation
          else {
            const requestLocationPermission = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: 'Enable location',
                message:
                  'TaxiConnect requires access to your location to provide an optimal experience.',
                buttonPositive: 'Allow',
                buttonNegative: 'Cancel',
              },
            );
            //...
            if (
              requestLocationPermission === PermissionsAndroid.RESULTS.GRANTED
            ) {
              //Permission granted
              this.getCurrentPositionCusto();
              GeolocationP.getCurrentPosition(
                (position) => {
                  that.props.App.latitude = position.coords.latitude;
                  that.props.App.longitude = position.coords.longitude;
                  //Update GPRS permission global var
                  let newStateVars = {};
                  newStateVars.hasGPRSPermissions = true;
                  newStateVars.didAskForGprs = true;
                  that.props.UpdateGrantedGRPS(newStateVars);
                  //Launch recalibration
                  that.recalibrateMap();
                },
                () => {
                  // See error code charts below.
                  //Launch recalibration
                  that.recalibrateMap();
                },
                {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 1000,
                  distanceFilter: 0,
                },
              );
              this.props.App.isMapPermitted = true;
            } //Permission denied
            else {
              //Permission denied, update gprs global vars and lock the platform
              let newStateVars = {};
              newStateVars.hasGPRSPermissions = false;
              newStateVars.didAskForGprs = true;
              this.props.UpdateGrantedGRPS(newStateVars);
              //Close loading animation
              this.resetAnimationLoader();
            }
          }
        }
      } catch (error) {
        //Permission denied, update gprs global vars and lock the platform
        let newStateVars = {};
        newStateVars.hasGPRSPermissions = false;
        newStateVars.didAskForGprs = true;
        this.props.UpdateGrantedGRPS(newStateVars);
        //Close loading animation
        this.resetAnimationLoader();
      }
    } else if (Platform.OS === 'ios') {
      //! SWITCH LATITUDE->LONGITUDEE AND LONGITUDE->LATITUDE - Only for iOS
      if (promptActivation === false) {
        let newStateVars = {};
        const mapZoom =
          this._map !== undefined && this._map !== null
            ? await this._map.getZoom()
            : this.props._NORMAL_MAP_ZOOM_LEVEL;
        //Normal check
        //Check the GPRS permission
        check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
          .then((result) => {
            switch (result) {
              case RESULTS.UNAVAILABLE:
                //Permission denied, update gprs global vars and lock the platform
                newStateVars.hasGPRSPermissions = false;
                newStateVars.didAskForGprs = true;
                this.props.UpdateGrantedGRPS(newStateVars);
                //Close loading animation
                this.resetAnimationLoader();
                break;
              case RESULTS.DENIED:
                //Permission denied, update gprs global vars and lock the platform
                newStateVars.hasGPRSPermissions = false;
                newStateVars.didAskForGprs = true;
                this.props.UpdateGrantedGRPS(newStateVars);
                //Close loading animation
                this.resetAnimationLoader();
                break;
              case RESULTS.LIMITED:
                if (
                  this.props.App.gprsGlobals.hasGPRSPermissions === false ||
                  this.props.App.gprsGlobals.didAskForGprs === false ||
                  this.props.App.latitude === 0 ||
                  this.props.App.longitude === 0
                ) {
                  if (/off the map/i.test(this.props.App.hello2Text)) {
                    that.replaceHello2_text(`Hi ${this.props.App.username}`);
                  }
                  //Permission granted
                  this.getCurrentPositionCusto();
                  GeolocationP.getCurrentPosition(
                    (position) => {
                      that.props.App.latitude = position.coords.longitude;
                      that.props.App.longitude = position.coords.latitude;
                      //Update GPRS permission global var
                      newStateVars = {};
                      newStateVars.hasGPRSPermissions = true;
                      newStateVars.didAskForGprs = true;
                      that.props.UpdateGrantedGRPS(newStateVars);
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        that.recalibrateMap();
                      });
                    },
                    () => {
                      // See error code charts below.
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        that.recalibrateMap();
                      });
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 5000,
                      maximumAge: 1000,
                      distanceFilter: 0,
                    },
                  );
                  this.props.App.isMapPermitted = true;
                } else {
                  if (/off the map/i.test(this.props.App.hello2Text)) {
                    that.replaceHello2_text(`Hi ${this.props.App.username}`);
                  }
                  that.updateDriver_realTimeMap();
                  GeolocationP.getCurrentPosition(
                    (position) => {
                      that.props.App.latitude = position.coords.longitude;
                      that.props.App.longitude = position.coords.latitude;
                      //Get user location
                      that.props.App.socket.emit('geocode-this-point', {
                        latitude: that.props.App.latitude,
                        longitude: that.props.App.longitude,
                        user_fingerprint: that.props.App.user_fingerprint,
                        geolocationData: position,
                      });
                      //Update GPRS permission global var
                      newStateVars = {};
                      newStateVars.hasGPRSPermissions = true;
                      newStateVars.didAskForGprs = true;
                      that.props.UpdateGrantedGRPS(newStateVars);
                    },
                    () => {
                      // See error code charts below.
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        that.recalibrateMap();
                      });
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 5000,
                      maximumAge: 10000,
                      distanceFilter: 0,
                    },
                  );
                  //Check the zoom level
                  if (this._map !== undefined && this._map != null) {
                    if (
                      this._map !== undefined &&
                      this._map != null &&
                      this.props.App.isRideInProgress === false
                    ) {
                      if (mapZoom > 18) {
                        InteractionManager.runAfterInteractions(() => {
                          that.recalibrateMap();
                        });
                      }
                    }
                  }
                }
                break;
              case RESULTS.GRANTED:
                //! Coordinates order fix - major bug fix for ocean bug
                if (
                  this.props.App.latitude !== undefined &&
                  this.props.App.latitude !== null &&
                  this.props.App.latitude !== 0 &&
                  this.props.App.longitude !== undefined &&
                  this.props.App.longitude !== null &&
                  this.props.App.longitude !== 0
                ) {
                  //? Switch latitude and longitude - check the negative sign
                  if (parseFloat(this.props.App.longitude) < 0) {
                    //Negative - switch
                    let latitudeTmp = this.props.App.latitude;
                    this.props.App.latitude = this.props.App.longitude;
                    this.props.App.longitude = latitudeTmp;
                  }
                }
                //!--------- Ocean bug fix
                if (
                  this.props.App.gprsGlobals.hasGPRSPermissions === false ||
                  this.props.App.gprsGlobals.didAskForGprs === false ||
                  this.props.App.latitude === 0 ||
                  this.props.App.longitude === 0
                ) {
                  if (/off the map/i.test(this.props.App.hello2Text)) {
                    that.replaceHello2_text(`Hi ${this.props.App.username}`);
                  }
                  //Permission granted
                  this.getCurrentPositionCusto();
                  GeolocationP.getCurrentPosition(
                    (position) => {
                      that.props.App.latitude = position.coords.longitude;
                      that.props.App.longitude = position.coords.latitude;

                      //Update GPRS permission global var
                      newStateVars = {};
                      newStateVars.hasGPRSPermissions = true;
                      newStateVars.didAskForGprs = true;
                      that.props.UpdateGrantedGRPS(newStateVars);
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        that.recalibrateMap();
                      });
                    },
                    () => {
                      // See error code charts below.
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        that.recalibrateMap();
                      });
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 5000,
                      maximumAge: 1000,
                      distanceFilter: 0,
                    },
                  );
                  this.props.App.isMapPermitted = true;
                } else {
                  if (/off the map/i.test(this.props.App.hello2Text)) {
                    that.replaceHello2_text(`Hi ${this.props.App.username}`);
                  }
                  that.updateDriver_realTimeMap();
                  if (that.props.App._MAX_NUMBER_OF_CALLBACKS_MAP > 0) {
                    //! Decrement promise controller
                    that.props.App._MAX_NUMBER_OF_CALLBACKS_MAP -= 1;
                    GeolocationP.getCurrentPosition(
                      (position) => {
                        //! Increment promise controller
                        that.props.App._MAX_NUMBER_OF_CALLBACKS_MAP += 1;
                        //!----
                        that.props.App.latitude = position.coords.longitude;
                        that.props.App.longitude = position.coords.latitude;

                        //Get user location
                        that.props.App.socket.emit('geocode-this-point', {
                          latitude: that.props.App.latitude,
                          longitude: that.props.App.longitude,
                          user_fingerprint: that.props.App.user_fingerprint,
                          geolocationData: position,
                        });
                        //Update GPRS permission global var
                        newStateVars = {};
                        newStateVars.hasGPRSPermissions = true;
                        newStateVars.didAskForGprs = true;
                        that.props.UpdateGrantedGRPS(newStateVars);
                      },
                      () => {
                        //! Increment promise controller
                        that.props.App._MAX_NUMBER_OF_CALLBACKS_MAP += 1;
                        //!----
                        // See error code charts below.
                        //Launch recalibration
                        InteractionManager.runAfterInteractions(() => {
                          that.recalibrateMap();
                        });
                      },
                      {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 10000,
                        distanceFilter: 0,
                      },
                    );
                  }
                  //Check the zoom level
                  if (this._map !== undefined && this._map != null) {
                    if (
                      this._map !== undefined &&
                      this._map != null &&
                      this.props.App.isRideInProgress === false
                    ) {
                      if (mapZoom > 18) {
                        InteractionManager.runAfterInteractions(() => {
                          that.recalibrateMap();
                        });
                      }
                    }
                  }
                }
                break;
              case RESULTS.BLOCKED:
                //Permission denied, update gprs global vars and lock the platform
                newStateVars.hasGPRSPermissions = false;
                newStateVars.didAskForGprs = true;
                this.props.UpdateGrantedGRPS(newStateVars);
                //Close loading animation
                this.resetAnimationLoader();
                break;
            }
          })
          .catch((error) => {
            // …
            //Permission denied, update gprs global vars and lock the platform
            newStateVars.hasGPRSPermissions = false;
            newStateVars.didAskForGprs = true;
            this.props.UpdateGrantedGRPS(newStateVars);
            //Close loading animation
            this.resetAnimationLoader();
          });
      } //Location permission explicitly requested
      else {
        GeolocationP.requestAuthorization('whenInUse');
      }
    }
  }

  /**
   * @func bindRequest_findFetcher
   * Bind the request interval
   * Responsible for creating ONCE the interval fetcher for all rides related infos.
   */
  bindRequest_findFetcher() {
    let that = this;
    //...
    if (this.props.App._TMP_TRIP_INTERVAL_PERSISTER === null) {
      that.props.App._TMP_TRIP_INTERVAL_PERSISTER = setInterval(function () {
        //...
        that.GPRS_resolver();
        that.updateRemoteLocationsData();
        //2. Request for the total wallet balance
        that.props.App.socket.emit('getRiders_walletInfos_io', {
          user_fingerprint: that.props.App.user_fingerprint,
          mode: 'detailed',
        });
        //3. Request for any shared ride - if any - and if not ride is in progress
        if (
          that.props.App.sharedSimplifiedLink !== undefined &&
          that.props.App.sharedSimplifiedLink !== null &&
          that.props.App.sharedSimplifiedLink.length > 0
        ) {
          that.props.App.socket.emit('getSharedTrip_information_io', {
            sharedTo_user_fingerprint: that.props.App.user_fingerprint,
            trip_simplified_id: that.props.App.sharedSimplifiedLink,
          });
        }
        //4. Request for any AD infos
        if (
          that.props.App.userCurrentLocationMetaData.city !== undefined &&
          that.props.App.userCurrentLocationMetaData.city !== null
        ) {
          that.props.App.socket.emit('getAdsManagerRunningInfos_io', {
            user_fingerprint: that.props.App.user_fingerprint,
            user_nature: 'rider',
            city: that.props.App.userCurrentLocationMetaData.city,
          });
        }

        //5. NOTIFICATIONS
        that.getNotifications_vars();
      }, that.props.App._TMP_TRIP_INTERVAL_PERSISTER_TIME);
    }
  }

  /**
   * @func getNotifications_vars
   * Responsible for updadting the notifications vars to the local storage.
   */
  async getNotifications_vars() {
    OneSignal.setNotificationWillShowInForegroundHandler(
      (notifReceivedEvent) => {},
    );
    OneSignal.setNotificationWillShowInForegroundHandler(
      (notifReceivedEvent) => {},
    );
    OneSignal.setNotificationOpenedHandler((notification) => {});
    OneSignal.addSubscriptionObserver((event) => {});
    OneSignal.addPermissionObserver((event) => {});
    if (OneSignal !== null && OneSignal !== undefined) {
      const deviceState = await OneSignal.getDeviceState();
      //Save the push notif object
      try {
        if (deviceState.userId !== undefined && deviceState.userId !== null) {
          //SyncStorage.set('@pushnotif_token_global_obj', deviceState);
          this.props.App.pushnotif_token = deviceState;
        }
      } catch (error) {}
    }
  }

  /**
   * @func keyboardStateUpdater
   * Responsible for updating the state of the keyboard in the global state.
   */
  keyboardStateUpdater(state) {
    this.props.UpdateKeyboardStateGlobal(state);
  }

  /**
   * @func componentDidMount
   * Main mounting point of the app
   */

  async componentDidMount() {
    let that = this;
    this.forceUpdate();

    this.props.navigation.addListener('focus', () => {
      if (
        that.props.App.user_fingerprint === null ||
        that.props.App.user_fingerprint === undefined
      ) {
        that.bindRequest_findFetcher();
        //Logged out user
        that.props.UpdateErrorModalLog(false, false, 'any');
        that.props.navigation.navigate('EntryScreen');
      }
    });

    //Add keyboard listeners
    Keyboard.addListener('keyboardDidShow', this.keyboardStateUpdater(true));
    Keyboard.addListener('keyboardDidHide', this.keyboardStateUpdater(false));

    //Add home going back handler-----------------------------
    this.props.navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      return;
    });
    //--------------------------------------------------------
    //? Go back based on the state of the screen.
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        if (/mainView/i.test(that.props.App.bottomVitalsFlow.currentStep)) {
          //Main view
          //Close the app or something.
        } //Go back to previous flow
        else {
          if (
            /selectRideOrDelivery/i.test(
              that.props.App.bottomVitalsFlow.currentStep,
            )
          ) {
            that.deInitialTouchForRideOrDelivery();
          } else if (
            /gettingRideProcessScreen/i.test(
              that.props.App.bottomVitalsFlow.currentStep,
            )
          ) {
            //Do nothing
          } else {
            that.rerouteBookingProcessFlow(
              'previous',
              that.props.App.bottomVitalsFlow.flowParent,
            );
          }
        }
        return true;
      },
    );

    //Check if deep linked for a shared ride
    Linking.getInitialURL().then((url) => {
      that.processDeepLinkedURL(url);
    });
    Linking.addEventListener('url', this.handleOpenURL); //iOS

    //! SET AUTHORIZATION LEVEL FOR iOS LOCATION
    if (Platform.OS === 'ios') {
      GeolocationP.requestAuthorization('whenInUse');
    } else if (Platform.OS === 'android') {
      //Initiate component by asking for the necessary permissions.
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Enable location',
          message:
            'TaxiConnect requires access to your location to provide an optimal experience.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        },
      );
    }

    //...
    that.GPRS_resolver();
    //...

    //Network state checker
    this.state.networkStateChecker = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        that.props.UpdateErrorModalLog(
          state.isConnected,
          'connection_no_network',
          state.type,
        );
      } //connected
      else {
        that.props.UpdateErrorModalLog(false, false, state.type);
      }
    });

    //Initialize loader
    if (this.props.App.showLocationSearch_loader === false) {
      this.props.App.showLocationSearch_loader = true;
      this.fire_search_animation();
    }
    //Initialize initial hello
    if (this.props.App.initialHello === false) {
      this.fire_initGreetingAnd_after();
    }

    //connection
    this.props.App.socket.on('connect', () => {
      if (
        /(show_modalMore_tripDetails|show_rating_driver_modal|show_cancel_ride_modal|show_preferedPaymentMethod_modal)/i.test(
          that.props.App.generalErrorModalType,
        ) !== true
      ) {
        //Do not interrupt the select gender process
        that.props.UpdateErrorModalLog(false, false, 'any');
      }
    });

    this.props.App.socket.on('error', () => {
      // that.props.App.socket.connect();
    });

    this.props.App.socket.on('disconnect', () => {
      //...
    });
    this.props.App.socket.on('connect_error', () => {
      // that.props.App.socket.connect();
      if (
        /(show_modalMore_tripDetails|show_rating_driver_modal|show_cancel_ride_modal|show_preferedPaymentMethod_modal)/i.test(
          that.props.App.generalErrorModalType,
        ) !== true
      ) {
        that.props.UpdateErrorModalLog(true, 'service_unavailable', 'any');
      }
    });
    this.props.App.socket.on('connect_timeout', () => {
      //...
    });
    this.props.App.socket.on('reconnect', () => {});
    this.props.App.socket.on('reconnect_error', () => {});
    this.props.App.socket.on('reconnect_failed', () => {
      //...
    });

    //Bind the requests interval persister
    this.bindRequest_findFetcher();

    /**
     * @socket getAdsManagerRunningInfos_io
     * Get any running AD information
     * Responsible for getting any running AD information.
     */
    this.props.App.socket.on(
      'getAdsManagerRunningInfos_io-response',
      function (response) {
        if (
          response.response === undefined &&
          response.campaign_name !== undefined &&
          response.campaign_name !== null
        ) {
          that.props.UpdateADGetData(response);
        } //No data
        else {
          that.props.UpdateADGetData(null);
        }
      },
    );

    /**
     * @socket getRiders_walletInfos_io-response
     * Get total wallet balance
     * Responsible for only getting the total current balance of the rider and update the global state if different.
     */
    this.props.App.socket.on(
      'getRiders_walletInfos_io-response',
      function (response) {
        if (
          response !== null &&
          response !== undefined &&
          response.total !== undefined
        ) {
          //! CLOSEE ONLY FOR CONNECTION RELATED ERROS
          if (
            /(connection_no_network|service_unavailable)/i.test(
              that.props.App.generalErrorModal_vars.generalErrorModalType,
            )
          ) {
            //Do not interrupt the select gender process
            that.props.UpdateErrorModalLog(false, false, 'any'); //Auto close connection unavailable
          }
          //...
          that.props.UpdateTotalWalletAmount(response);
        }
      },
    );

    /**
     * @socket getRiders_walletInfos_io-response
     * Get total wallet balance
     * Responsible for only getting the total current balance of the rider and update the global state if different.
     */
    this.props.App.socket.on(
      'getSharedTrip_information_io-response',
      function (response) {
        if (
          response !== null &&
          response !== undefined &&
          response.responsePass !== undefined
        ) {
          if (/error/i.test(response.responsePass)) {
            //Error
            that.props.UpdateErrorModalLog(
              true,
              'showStatus_gettingSharedTrip_details__errorGettingTheShared',
              'any',
            );
            that.props.App.sharedSimplifiedLink = null;
            that.props.App.isSharedTripLinkValid = false;
          } else if (/no_rides/i.test(response.responsePass)) {
            //The trip might be completed
            that.props.UpdateErrorModalLog(
              true,
              'showStatus_gettingSharedTrip_details__doneTrip',
              'any',
            );
            that.props.App.sharedSimplifiedLink = null;
            that.props.App.isSharedTripLinkValid = true;
          }
          //Got something
          else if (/success/i.test(response.responsePass)) {
            //? 1. Auto close the loading modal - only close for loading modal
            if (
              /showStatus_gettingSharedTrip_details__gettingLink/i.test(
                that.props.App.generalErrorModal_vars.generalErrorModalType,
              )
            ) {
              //Do not interrupt the select gender process
              that.props.UpdateErrorModalLog(false, false, 'any'); //Auto close connection unavailable
              that.props.App.isSharedTripLinkValid = true;
            }
          } //Error
          else {
            that.props.UpdateErrorModalLog(
              true,
              'showStatus_gettingSharedTrip_details__errorGettingTheShared',
              'any',
            );
            that.props.App.sharedSimplifiedLink = null;
            that.props.App.isSharedTripLinkValid = false;
          }
        } //Error
        else {
          that.props.UpdateErrorModalLog(
            true,
            'showStatus_gettingSharedTrip_details__errorGettingTheShared',
            'any',
          );
          that.props.App.sharedSimplifiedLink = null;
          that.props.App.isSharedTripLinkValid = false;
        }
      },
    );

    //2 Handle cancel request response
    this.props.App.socket.on(
      'cancelRiders_request_io-response',
      function (response) {
        if (
          response !== false &&
          response.response !== undefined &&
          response.response !== null
        ) {
          //Received a response
          that.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
          //Reset all the trips
          //that.props.ResetStateProps(that);
          that._RESET_STATE();
        } //error - close modal
        else {
          that.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
        }
      },
    );

    /**
     * @socket trackdriverroute-response
     * Get route tracker response
     * Responsible for redirecting updates to map graphics data based on if the status of the request is: pending, in route to pickup, in route to drop off or completed
     */
    this.props.App.socket.on('trackdriverroute-response', function (response) {
      try {
        //! CLOSEE ONLY FOR CONNECTION RELATED ERROS
        if (
          /(connection_no_network|service_unavailable)/i.test(
            that.props.App.generalErrorModal_vars.generalErrorModalType,
          )
        ) {
          //Do not interrupt the select gender process
          that.props.UpdateErrorModalLog(false, false, 'any'); //Auto close connection unavailable
        }
        //...
        if (
          response !== null &&
          response !== undefined &&
          /no_rides/i.test(response.request_status) === false
        ) {
          //! RESET EVERYTHING IF THE REQUEST WAS JUST MADE
          //? Reset if the preview graph is present - crucial condition
          if (
            that.props.App.previewDestinationData.originDestinationPreviewData
              .routePoints !== undefined &&
            that.props.App.previewDestinationData.originDestinationPreviewData
              .routePoints !== false &&
            that.props.App.previewDestinationData.originDestinationPreviewData
              .routePoints !== null &&
            /(inRouteToPickup|inRouteToDestination|pending)/i.test(
              response.request_status,
            )
          ) {
            that.props.App.bottomVitalsFlow._BOOKING_REQUESTED = false;
            //Reset
            that._RESET_STATE(); //! Should check
            //Recalibrate map
            if (
              that.map !== undefined &&
              that.map !== null &&
              that.camera !== undefined &&
              that.camera !== null
            ) {
              that.camera.setCamera({
                centerCoordinate: [
                  that.props.App.longitude,
                  that.props.App.latitude,
                ],
                zoomLevel: 14,
                animationDuration: 1200,
              });
            }
          }

          //1. Trip in progress: in route to pickup or in route to drop off
          if (
            response.response === undefined &&
            response.routePoints !== undefined &&
            /(inRouteToPickup|inRouteToDestination)/i.test(
              response.request_status,
            )
          ) {
            that.props.App.bottomVitalsFlow.currentStep = 'mainView'; //Change current step back to mainView
            //Save the driver's details - car details - and Static ETA to destination info
            //? Use redux to update the state
            that.props.App.generalTRIP_details_driverDetails = {
              eta: response.eta,
              ETA_toDestination: response.ETA_toDestination,
              driverDetails: response.driverDetails,
              carDetails: response.carDetails,
              basicTripDetails: response.basicTripDetails,
              riderOwnerInfoBundle:
                response.riderOwnerInfoBundle !== undefined
                  ? response.riderOwnerInfoBundle
                  : undefined,
              requester_fp: response.requester_fp,
              requester_infos: response.requester_infos,
              packageSize: response.delivery_information.packageSize,
              delivery_infos: response.delivery_information.receiver_infos,
            }; //Very important

            //Update route to destination var - request status: inRouteToPickup, inRouteToDestination
            if (/inRouteToPickup/i.test(response.request_status)) {
              //? Force the conversion of the pickupPoint and destinationPoint from string to boolean
              response.pickupPoint = response.pickupPoint.map(parseFloat);
              response.destinationPoint = response.destinationPoint.map(
                parseFloat,
              );
              //? -----------
              that.props.App.isInRouteToDestination = false;
              that.props.App.request_status = 'inRouteToPickup';

              //Update loop request
              //? AVOID TO START THE INTERVAL PERISTER FOR SHARED TRIPS
              /*if (
                that.props.App.intervalProgressLoop === false &&
                that.props.App.sharedSimplifiedLink === null
              ) {
                that.props.App.intervalProgressLoop = setInterval(
                  function () {
                    if (that.props.App.isRideInProgress === true) {
                      that.GPRS_resolver();
                      that.updateRemoteLocationsData();
                    } //clear interval
                    else {
                      clearInterval(
                        that.props.App.intervalProgressLoop,
                      );
                      that.props.App.intervalProgressLoop = false;
                    }
                  },
                  1500,
                );
              }*/
            } else if (response.request_status === 'inRouteToDestination') {
              //? Save the previous status
              let prevStatus = that.props.App.request_status;
              //? Force the conversion of the pickupPoint and destinationPoint from string to Float
              response.pickupPoint = response.pickupPoint.map(parseFloat);
              response.destinationPoint = response.destinationPoint.map(
                parseFloat,
              );
              //? -----------

              that.props.App.request_status = 'inRouteToDestination';
              that.props.App.isInRouteToDestination = true;
              //Update destination metadata
              that.props.App.destinationLocation_metadata.eta = response.eta; //ETA
              that.props.App.destinationLocation_metadata.distance =
                response.distance; //Distance

              //? If the previous state was in route to pickup force the update
              if (/inRouteToPickup/i.test(prevStatus)) {
                that.forceUpdate();
              }

              //Update loop request
              //? AVOID TO START THE INTERVAL PERISTER FOR SHARED TRIPS
              /*if (
                that.props.App.intervalProgressLoop === false &&
                that.props.App.sharedSimplifiedLink === null
              ) {
                that.props.App.intervalProgressLoop = setInterval(
                  function () {
                    if (that.props.App.isRideInProgress === true) {
                      that.GPRS_resolver();
                      that.updateRemoteLocationsData();
                    } //clear interval
                    else {
                      clearInterval(
                        that.props.App.intervalProgressLoop,
                      );
                      that.props.App.intervalProgressLoop;
                    }
                  },
                  1500,
                );
              }*/
            }
            //----------------------------------------------------------------------------------------
            //let paddingFit = 100 * (20 / response.routePoints.length);
            //paddingFit += 7;
            //paddingFit =
            //  paddingFit -
            //  Math.round((paddingFit / PADDING_LIMIT - 1) * PADDING_LIMIT);
            //if (paddingFit > PADDING_LIMIT) {
            //paddingFit = PADDING_LIMIT;
            //}
            let paddingFit = PADDING_LIMIT;

            //Get driver's next point
            let currentPoint = response.driverNextPoint;
            let currentPointRm = point(currentPoint);
            //Compute the car's bearing angle
            if (
              that.props.App.lastDriverCoords === null ||
              that.props.App.initializedScenario !== response.request_status
            ) {
              that.props.App.lastDriverCoords = [];
              that.props.App.lastDriverCoords.push(0);
              that.props.App.lastDriverCoords.push(0);
              //Initialize animation
              new Promise((resolve0) => {
                that.initializeRouteNavigation(
                  response,
                  response.request_status,
                  resolve0,
                );
              }).then(
                (reslt) => {
                  //? Update route data
                  if (/inRouteToPickup/i.test(response.request_status)) {
                    that.props.__Update_InRouteToPickupInitVars(response);
                  } else if (
                    /inRouteToDestination/i.test(response.request_status)
                  ) {
                    that.props.__Update_InRouteToDestinationInitVars(response);
                  }
                  //---------------
                  if (reslt === true) {
                    new Promise((resolve1) => {
                      that.animateRoute(
                        response,
                        currentPoint,
                        currentPointRm,
                        paddingFit,
                        resolve1,
                        /inRouteToDestination/i.test(response.request_status)
                          ? response.pickupPoint
                          : false,
                      );
                    }).then(
                      () => {},
                      () => {},
                    );
                  }
                },
                () => {
                  //? Update route data
                  if (/inRouteToPickup/i.test(response.request_status)) {
                    that.props.__Update_InRouteToPickupInitVars(response);
                  } else if (
                    /inRouteToDestination/i.test(response.request_status)
                  ) {
                    that.props.__Update_InRouteToDestinationInitVars(response);
                  }
                  //---------------
                },
              );
            } //Animate
            else {
              new Promise((resolve1) => {
                that.animateRoute(
                  response,
                  currentPoint,
                  currentPointRm,
                  paddingFit,
                  resolve1,
                  /inRouteToDestination/i.test(response.request_status)
                    ? response.pickupPoint
                    : false,
                );
              }).then(
                () => {
                  //? Update route data
                  if (/inRouteToPickup/i.test(response.request_status)) {
                    that.props.__Update_InRouteToPickupInitVars(response);
                  } else if (
                    /inRouteToDestination/i.test(response.request_status)
                  ) {
                    that.props.__Update_InRouteToDestinationInitVars(response);
                  }
                  //---------------
                },
                () => {
                  //? Update route data
                  if (/inRouteToPickup/i.test(response.request_status)) {
                    that.props.__Update_InRouteToPickupInitVars(response);
                  } else if (
                    /inRouteToDestination/i.test(response.request_status)
                  ) {
                    that.props.__Update_InRouteToDestinationInitVars(response);
                  }
                  //---------------
                },
              );
            }
            //...
          } else if (/pending/i.test(response.request_status)) {
            //! Do a preliminary cleaning
            if (
              that.props.App.request_status !== 'pending' &&
              that.props.App.request_status !== null &&
              that.props.App.bottomVitalsFlow.currentStep !== 'mainView'
            ) {
              that._RESET_STATE(); //! SHOULD CHECK
              /*that.props.UpdatePendingGlobalVars({
                request_status: response.request_status,
                isRideInProgress: true,
                pickupLocation_metadata: {
                  coordinates: response.pickupLocation_point.map(parseFloat),
                  pickupLocation_name: response.pickupLocation_name,
                },
              });*/
            }
            //-------------------------
            //! Convert coords to float
            response.pickupLocation_point = response.pickupLocation_point.map(
              parseFloat,
            );
            //? Get temporary vars
            let pickLatitude = response.pickupLocation_point[1];
            let pickLongitude = response.pickupLocation_point[0];
            //! Coordinates order fix - major bug fix for ocean bug
            if (
              pickLatitude !== undefined &&
              pickLatitude !== null &&
              pickLatitude !== 0 &&
              pickLongitude !== undefined &&
              pickLongitude !== null &&
              pickLongitude !== 0
            ) {
              //? Switch latitude and longitude - check the negative sign
              if (parseFloat(pickLongitude) < 0) {
                //Negative - switch
                response.pickupLocation_point = [
                  response.pickupLocation_point[1],
                  response.pickupLocation_point[0],
                ];
              }
            }
            //!--------- Ocean bug fix
            //...
            if (/Searching/.test(response.pickupLocation_name)) {
              response.pickupLocation_name = 'Pickup';
            }
            //...
            that.props.UpdatePendingGlobalVars({
              request_status: response.request_status,
              isRideInProgress: true,
              pickupLocation_metadata: {
                coordinates: response.pickupLocation_point.map(parseFloat),
                pickupLocation_name: response.pickupLocation_name,
                requester_fp: response.requester_fp,
              },
            });

            //Reposition the map
            if (that.camera !== undefined && that.camera !== null) {
              that.camera.flyTo(response.pickupLocation_point, 1000);
              that.camera.setCamera({
                centerCoordinate: response.pickupLocation_point,
                zoomLevel: 14,
                animationDuration: 500,
              });
            }
            //...
            //! Reset navigation data if an existing previous scenario was set
            if (/^inRouteTo/i.test(that.props.App.request_status)) {
              //! CHECK FOR DRIVER REQUEST GHOSTING BUG!!!
              //Clean it up
              that.props.UpdateErrorModalLog(false, false, 'any'); //in case the modal was opened
              //Recalibrate the map
              that.recalibrateMap();
              //save pending scenario
              that.props.App.request_status = response.request_status;
              //? Update the pending location --force
              that.props.UpdatePendingGlobalVars({
                request_status: response.request_status,
                isRideInProgress: true,
                pickupLocation_metadata: {
                  coordinates: response.pickupLocation_point.map(parseFloat),
                  pickupLocation_name: response.pickupLocation_name,
                },
              });
            }
            //Save the main object
            that.props.App.generalTRIP_details_driverDetails = response;

            //Update loop request
            //? AVOID TO START THE INTERVAL PERISTER FOR SHARED TRIPS
            /*if (
              that.props.App.intervalProgressLoop === false &&
              that.props.App.sharedSimplifiedLink === null
            ) {
              that.props.App.intervalProgressLoop = setInterval(
                function () {
                  if (that.props.App.isRideInProgress === true) {
                    that.GPRS_resolver();
                    that.updateRemoteLocationsData();
                  } //clear interval
                  else {
                    clearInterval(that.props.App.intervalProgressLoop);
                  }
                },
                1500,
              );
            }*/
          } else if (
            response.request_status !== undefined &&
            response.request_status !== null &&
            /riderDropoffConfirmation_left/i.test(response.request_status)
          ) {
            //! Do a preliminary cleaning
            if (
              that.props.App.request_status === null ||
              that.props.App.request_status === undefined ||
              that.props.App.request_status === false
            ) {
              that._RESET_STATE();
            }
            //! Reset navigation data if an existing previous scenario was set
            if (/inRouteTo/i.test(that.props.App.request_status)) {
              //! FIXED DROP OFF CONFIRMED FREEZE
              //Clean it up
              //that._RESET_STATE();  //! Dropoff crasher bug??
              that.props.UpdateErrorModalLog(false, false, 'any'); //in case the modal was opened
              //Recalibrate the map
              that.recalibrateMap();
            }
            //? SHOW THE DONE TRIP MODAL ONLY OR SHARED TRIPS
            if (
              that.props.App.sharedSimplifiedLink !== null &&
              that.props.App.sharedSimplifiedLink !== undefined &&
              that.props.App.isSharedTripLinkValid
            ) {
              //Nullify the shared link
              that.props.App.sharedSimplifiedLink = null;
              that.props.App.isSharedTripLinkValid = false;
              //Show the end modal
              that.props.UpdateErrorModalLog(
                true,
                'showStatus_gettingSharedTrip_details__doneTrip',
                'any',
              );
            } else {
              that.props.App.bottomVitalsFlow.currentStep = 'mainView'; //Change current step back to mainView
              //User drop off confirmation
              that.props.App.request_status = response.request_status;
              that.props.App.isRideInProgress = true;
              //Save the basic trip and driver details for drop off confirmation and rating
              //Save and update the state once - only if the data are different (handled in the reducer)
              that.props.UpdateDropoffDataFor_driverRating(response);
            }
          } else if (response.request_status === 'no_rides') {
            that.props.App.request_status = response.request_status;
            //! Do a preliminary cleaning
            if (
              that.props.App.request_status !== 'no_rides' &&
              that.props.App.request_status !== null
            ) {
              that._RESET_STATE();
            }
            //? SHOW THE DONE TRIP MODAL ONLY OR SHARED TRIPS
            if (
              that.props.App.sharedSimplifiedLink !== null &&
              that.props.App.sharedSimplifiedLink !== undefined &&
              that.props.App.isSharedTripLinkValid
            ) {
              //Nullify the shared link
              that.props.App.sharedSimplifiedLink = null;
              that.props.App.isSharedTripLinkValid = false;
              //Show the end modal
              that.props.UpdateErrorModalLog(
                true,
                'showStatus_gettingSharedTrip_details__doneTrip',
                'any',
              );
            }
            //...
            if (that.props.App.isRideInProgress) {
              //Reset props.App
              //that._RESET_STATE(); //! Drop off crash??
              //Recalibrate the map
              that.recalibrateMap();
            }
          }
        } //No rides
        else {
          //! Do a preliminary cleaning
          if (
            that.props.App.request_status !== 'no_rides' &&
            that.props.App.request_status !== null
          ) {
            that._RESET_STATE();
          }
          //Update status
          if (that.props.App.sharedSimplifiedLink === null) {
            //? ONLY WHEN THERE's no active trip shared
            //Reset the state partially depending on the state of the trip variables
            that.props.App.intervalProgressLoop = false;
            let testReg = new RegExp(response.request_status, 'i');
            if (testReg.test(that.props.App.request_status) === false) {
              if (that.props.App.request_status !== null) {
                that._RESET_STATE();
                //Recalibrate the map
                that.recalibrateMap();
              }
              //...
              that.props.App.request_status = response.request_status;
            }
          } //Show shared trip maybe done
          else {
            //? SHOW THE DONE TRIP MODAL ONLY OR SHARED TRIPS
            if (
              that.props.App.sharedSimplifiedLink !== null &&
              that.props.App.sharedSimplifiedLink !== undefined &&
              that.props.App.isSharedTripLinkValid
            ) {
              //Nullify the shared link
              that.props.App.sharedSimplifiedLink = null;
              that.props.App.isSharedTripLinkValid = false;
              //Show the end modal
              that.props.UpdateErrorModalLog(
                true,
                'showStatus_gettingSharedTrip_details__doneTrip',
                'any',
              );
            }
          }
        }
      } catch (error) {}
    });

    /**
     * GET GEOCODED USER LOCATION
     * @event: geocode-this-point
     * Get the location of the user, parameter of interest: street name
     */
    this.props.App.socket.on(
      'geocode-this-point-response',
      function (response) {
        if (response !== undefined && response !== false) {
          that.props.UpdateCurrentLocationMetadat(response);
        }
      },
    );

    /**
     * IDENTIFY PICKUP LOCATION
     * @event: getPickupLocationNature
     * Responsible for identifying whether the user is standing at a taxi rank or a private location.
     * Possible types
     * Airport
     * TaxiRank
     * PrivateLocation
     */
    this.props.App.socket.on(
      'getPickupLocationNature-response',
      function (response) {
        if (response !== undefined) {
          //Correct
          if (response.locationType === 'PrivateLocation') {
            //PRIVATE LOCATION
            let newState = that.props.App.bottomVitalsFlow;
            newState.rideOrDeliveryMetadata.locationTypeIdentified =
              'PrivateLocation';
            that.props.UpdateBottomVitalsState({
              bottomVitalsFlow: newState,
            });
          } else if (response.locationType === 'Airport') {
            let newState = that.props.App.bottomVitalsFlow;
            newState.rideOrDeliveryMetadata.locationTypeIdentified = 'Airport';
            that.props.UpdateBottomVitalsState({
              bottomVitalsFlow: newState,
            });
          } //Taxi rank
          else if (response.locationType === 'TaxiRank') {
            let newState = that.props.App.bottomVitalsFlow;
            newState.rideOrDeliveryMetadata.locationTypeIdentified = 'TaxiRank';
            that.props.UpdateBottomVitalsState({
              bottomVitalsFlow: newState,
            });
          } else {
            let newState = that.props.App.bottomVitalsFlow;
            newState.rideOrDeliveryMetadata.locationTypeIdentified =
              'PrivateLocation';
            that.props.UpdateBottomVitalsState({
              bottomVitalsFlow: newState,
            });
          }
        } //Defaults to private location
        else {
          let newState = that.props.App.bottomVitalsFlow;
          newState.rideOrDeliveryMetadata.locationTypeIdentified =
            'PrivateLocation';
          that.props.UpdateBottomVitalsState({
            bottomVitalsFlow: newState,
          });
        }
      },
    );

    /**
     * GET FARE ESTIMATION LIST FOR ALL THE RELEVANTS RIDES
     * @event: getPricingForRideorDelivery
     * ? Responsible for getting the list of fare estimates based on the user-selected parameters
     * ? from the pricing service.
     * ! If invalid fare received, try again - leave that to the initiated interval persister.
     */
    this.props.App.socket.on(
      'getPricingForRideorDelivery-response',
      function (response) {
        if (
          response !== false &&
          response.response === undefined &&
          that.props.App.pricingVariables.didPricingReceivedFromServer !==
            true &&
          that.props.App.pricingVariables.carTypesPricingMetada.length === 0
        ) {
          //Estimates computed
          //Convert to object
          if (typeof response === String) {
            try {
              response = JSON.parse(response);
              that.props.App.pricingVariables.didPricingReceivedFromServer = true; //!Stop the estimates fetcher
            } catch (error) {
              response = response;
            }
          } //Try to parse
          else {
            try {
              response = JSON.parse(response);
              that.props.App.pricingVariables.didPricingReceivedFromServer = true; //!Stop the estimates fetcher
            } catch (error) {
              response = response;
            }
          }
          //...
          InteractionManager.runAfterInteractions(() => {
            //Fade loading screen and show results
            //Fade the origin content
            AnimatedNative.parallel([
              AnimatedNative.timing(
                that.props.App.bottomVitalsFlow.genericContainerOpacity,
                {
                  toValue: 0,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                that.props.App.bottomVitalsFlow.genericContainerPosition,
                {
                  toValue: 20,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {
              //Update pricing data in general state
              that.props.UpdatePricingStateData(response);

              AnimatedNative.parallel([
                AnimatedNative.timing(
                  that.props.App.bottomVitalsFlow.genericContainerOpacity,
                  {
                    toValue: 1,
                    duration: 450,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
                AnimatedNative.timing(
                  that.props.App.bottomVitalsFlow.genericContainerPosition,
                  {
                    toValue: 0,
                    duration: 450,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
              ]).start(() => {
                that.resetAnimationLoader();
              });
            });
          });
        } //! No valid estimates due to a problem, try again
        else {
          //? Force the estimates try again.
          //that.getFareEstimation();
        }
      },
    );

    /**
     * GET ROUTE SNAPSHOT PREVIEW OF THE DESTINATION
     * event: getRoute_to_destinationSnapshot
     * Responsible for getting the route to destination polyline and infos after the user has entered
     * the wanted destination location (only consider the first one) and update the map with a preview
     * of the route to the destination and corresponding ETA.
     */
    this.props.App.socket.on(
      'getRoute_to_destinationSnapshot-response',
      function (response) {
        if (response !== false && response.destination !== undefined) {
          //Received something
          //Close animation
          that.resetAnimationLoader();
          let rafinedResponse = {
            routePoints: {
              type: 'LineString',
              coordinates: response.routePoints,
            },
            eta: response.eta,
          };
          that.props.UpdateRoutePreviewToDestination(rafinedResponse);
        } //Nothing valid received
        else {
          //DO nothing because the interval persister will take care of making the request again, until something
          //valid is received from Map service.
        }
      },
    );

    /**
     * UPDATE THE CLOSEST DRIVERS ON THE MAP
     * @event: get_closest_drivers_to_point
     * ? Responsible for updating the live closest drivers on the map, maximum of 7
     */
    this.props.App.socket.on(
      'get_closest_drivers_to_point-response',
      function (response) {
        if (
          response !== false &&
          response.response === undefined &&
          response.length !== undefined &&
          response.length > 0
        ) {
          that.props.UpdateClosestDriversList(response);
        }
      },
    );

    /**
     * CHECK IF A RIDE WAS ACCEPTED
     * @event: requestRideOrDeliveryForThis
     * ? Responsible for handling the request ride or wallet response after booking
     * ? to know whether the request was successfully dispatched or not.
     */
    //Remove snapshot data
    this.props.App.previewDestinationData.originDestinationPreviewData = false;
    //...
    this.props.App.socket.on(
      'requestRideOrDeliveryForThis-response',
      function (response) {
        if (
          response !== false &&
          response.response !== undefined &&
          /successfully_requested/i.test(response.response)
        ) {
          //that._RESET_STATE(); //Major reset
          //Successfully requested
          //Leave it to the request checker
          that.props.App.bottomVitalsFlow._BOOKING_REQUESTED = true; //Mark booking as requested to clear the interval
          //clear any basic interval persister
          clearInterval(that.props.App._TMP_INTERVAL_PERSISTER);
          that.props.App._TMP_INTERVAL_PERSISTER = null;
          //clear the closest drivers interval persister
          clearInterval(that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS);
          that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
          //! RESET
          //that._RESET_STATE();
          that.props.App.bottomVitalsFlow._BOOKING_REQUESTED = true; //Mark booking as requested to clear the interval
        } //An unxepected error occured
        else if (
          response !== false &&
          response.response !== undefined &&
          /already_have_a_pending_request/i.test(response.response)
        ) {
          //that._RESET_STATE();
          //Do nothing
          that.props.App.bottomVitalsFlow._BOOKING_REQUESTED = true; //Mark booking as requested to clear the interval
          //clear any basic interval persister
          clearInterval(that.props.App._TMP_INTERVAL_PERSISTER);
          that.props.App._TMP_INTERVAL_PERSISTER = null;
          //clear the closest drivers interval persister
          clearInterval(that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS);
          that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
          //! RESET if still loading
          if (that.props.App.isRideInProgress === false) {
            //that._RESET_STATE();
          }
        } else {
          //that._RESET_STATE(); //Major reset
          //clear any basic interval persister
          that.props.App.bottomVitalsFlow._error_booking_requested = true;
          //clear the closest drivers interval persister
          clearInterval(that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS);
          that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
          //Update error bottom vitals
          //Go back to previous screen
          that.rerouteBookingProcessFlow(
            'previous',
            that.props.App.bottomVitalsFlow.flowParent.toUpperCase(),
          );
          //Show error modal
          that.props.UpdateErrorModalLog(
            true,
            'show_error_requesting_modal',
            'any',
          );
          //! RESET
          /*if (that.props.App.isRideInProgress === false) {
            that._RESET_STATE();
          }*/
          that.props.App.bottomVitalsFlow._BOOKING_REQUESTED = true; //Mark booking as requested to clear the interval
        }
      },
    );
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMOUNTED.
    //Remove the network state listener
    if (this.state.networkStateChecker !== false) {
      this.state.networkStateChecker();
    }
    //Remove any kind of interval fetcher
    if (this.props.App._TMP_TRIP_INTERVAL_PERSISTER !== null) {
      clearInterval(this.props.App._TMP_TRIP_INTERVAL_PERSISTER);
      this.props.App._TMP_TRIP_INTERVAL_PERSISTER = null;
    }
    //...
    if (this.props.App._TMP_INTERVAL_PERSISTER !== null) {
      clearInterval(this.props.App._TMP_INTERVAL_PERSISTER);
      this.props.App._TMP_INTERVAL_PERSISTER = null;
    }
    //...
    if (this.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS !== null) {
      clearInterval(this.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS);
      this.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
    }
    //...
    //Clear the location watcher
    GeolocationP.clearWatch(this.props.App._MAIN_LOCATION_WATCHER);
    this.props.App._MAIN_LOCATION_WATCHER = null;
    //.
    //Remove keyboard listeners
    Keyboard.removeListener('keyboardDidShow', this.keyboardStateUpdater(true));
    Keyboard.removeListener(
      'keyboardDidHide',
      this.keyboardStateUpdater(false),
    );
    //...
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  /**
   * @func animateRoute()
   * Responsible for animating the route basically
   */
  animateRoute(
    response,
    currentPoint,
    currentPointRm,
    paddingFit,
    resolve = false,
    additionalData = false,
  ) {
    try {
      let that = this;

      let carBearing = bearing(
        point([
          that.props.App.lastDriverCoords[0],
          that.props.App.lastDriverCoords[1],
        ]),
        point([currentPoint[0], currentPoint[1]]),
      );

      let timingRoute = 1000;

      //1. ROUTE TO PICKUP-----------------------------------------------------
      if (
        that.props.App.isInRouteToDestination === false &&
        that.props.App.route !== null &&
        that.props.App.route !== undefined &&
        that.props.App.shape !== undefined &&
        that.props.App.shape !== null
      ) {
        that.props.App.shape
          .timing({
            toValue: response.routePoints,
            duration: 10,
            easing: Easing.linear,
          })
          .start(() => {
            that.props.UpdateRouteToPickupVars({
              lastDriverBearing: carBearing,
              lastDriverCoords: currentPoint,
            });
          });

        that.props.App.CONSIDER = true;

        that.props.App.route
          .timing({
            toValue: {end: {point: currentPointRm}},
            duration: timingRoute,
            easing: Easing.linear,
          })
          .start(() => {
            //Update car infos
            if (that.props.App.actPointToMinusOne === false) {
              that.props.UpdateRouteToPickupVars({
                actPointToMinusOne: true,
              });
            }

            if (that.camera !== undefined && that.camera != null) {
              //Only recenter when the user was not centered already
              try {
                that.camera.fitBounds(
                  that.props.App.pickupPoint,
                  [currentPoint[0], currentPoint[1]],
                  [90, 90, 250, 90],
                  1000,
                );
              } catch (error) {}
            }
          });
        //-------------------------------------------------------------------------
        resolve(true);
      } else if (
        that.props.App.isInRouteToDestination &&
        that.props.App.shapeDestination !== null &&
        that.props.App.shapeDestination !== undefined &&
        that.props.App.routeDestination !== undefined &&
        that.props.App.routeDestination !== null
      ) {
        //2. ROUTE TO DESTINATION
        if (that.props.App.actPointToMinusOne === false) {
          timingRoute = 10;
          that.props.UpdateRouteToPickupVars({
            lastDriverBearing: carBearing,
            lastDriverCoords: currentPoint,
            isRideInProgress: true,
            isInRouteToDestination: true,
          });
        }

        InteractionManager.runAfterInteractions(() => {
          if (
            that.props.App.shapeDestination !== null &&
            that.props.App.shapeDestination !== undefined &&
            that.props.App.routeDestination !== null &&
            that.props.App.routeDestination !== undefined
          ) {
            that.props.App.shapeDestination
              .timing({
                toValue: response.routePoints,
                duration: 10,
                easing: Easing.linear,
              })
              .start(() => {
                that.props.UpdateRouteToPickupVars({
                  lastDriverBearing: carBearing,
                  lastDriverCoords: currentPoint,
                });
              });

            that.props.App.CONSIDER = true;
            that.props.App.routeDestination
              .timing({
                toValue: {end: {point: currentPointRm}},
                duration: timingRoute,
                easing: Easing.linear,
              })
              .start(() => {
                //Update car infos
                if (that.props.App.actPointToMinusOne === false) {
                  that.props.UpdateRouteToPickupVars({
                    actPointToMinusOne: true,
                  });
                }

                if (that.camera !== undefined && that.camera != null) {
                  //Only recenter when the user was not centered already
                  try {
                    that.camera.fitBounds(
                      [
                        that.props.App.destinationPoint[0],
                        that.props.App.destinationPoint[1],
                      ],
                      additionalData,
                      [90, 90, 250, 90],
                      1000,
                    );
                  } catch (error) {}
                }
              });
          }
        });
        //...
        resolve(true);
      } else {
        resolve(true);
      }
    } catch (error) {
      resolve(false);
    }
  }

  /**
   * ? Deep linking tools
   */
  UNSAFE_componentWillMount() {
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  processDeepLinkedURL = (url) => {
    if (url !== null && url !== undefined) {
      if (/sharedTrip/i.test(url)) {
        let route = url;
        let id = url;

        if (/link/i.test(url)) {
          //Android case
          id = url.split('link=')[1].trim();
        } //iOS
        else {
          route = url.replace(/.*?:\/\//g, '');
          id = route.match(/\/([^/]+)\/?$/)[1];
        }

        //Fire the sharing realtime of the received trip if no trip is in progress
        if (this.props.App.isRideInProgress) {
          //Has a ride in progress
          this.props.UpdateErrorModalLog(
            true,
            'showStatus_gettingSharedTrip_details__tripInProgress',
            'any',
          );
          this.props.App.sharedSimplifiedLink = null;
          this.props.App.isSharedTripLinkValid = false;
        } //Can see trip of friends and family
        else {
          //Open modal loader
          this.props.UpdateErrorModalLog(
            true,
            'showStatus_gettingSharedTrip_details__gettingLink',
            'any',
          );
          //!Save the simplified link
          this.props.App.sharedSimplifiedLink = id;
          this.props.App.isSharedTripLinkValid = false;
          //? No need to request here - the MAIN INTERVAL FETCHER WILL TAKE CARE OF IT.
        }
      } //Nullify global var
      else {
        this.props.App.sharedSimplifiedLink = null;
        this.props.App.isSharedTripLinkValid = false;
      }
    } //Nullify the global var
    else {
      this.props.App.sharedSimplifiedLink = null;
      this.props.App.isSharedTripLinkValid = false;
    }
  };
  handleOpenURL = (event) => {
    // D
    if (event !== null && event !== undefined) {
      if (event.url !== undefined) {
        this.processDeepLinkedURL(event.url);
      }
    }
  };

  /**
   * @func initializeRouteNavigation()
   * Inputs: response
   * - response
   * Initialize animation for map
   * this.props.App.route != null &&
      this.props.App.route !== undefined &&
      this.props.App.isRideInProgress &&
      this.props.App.isInRouteToDestination === false &&
      this.props.App.request_status === 'inRouteToPickup'
   */
  initializeRouteNavigation(response, tripScenario, resolve) {
    if (
      response.response === undefined &&
      response.routePoints !== undefined &&
      response.destinationData !== null &&
      response.destinationData !== undefined
    ) {
      if (tripScenario === 'inRouteToPickup') {
        //Update initialized scenario memory
        this.props.App.initializedScenario = tripScenario;
        if (this.camera !== undefined && this.camera != null) {
          this.camera.fitBounds(
            response.pickupPoint,
            [response.driverNextPoint[0], response.driverNextPoint[1]],
            70,
            Platform.OS === 'android' ? 2000 : 1000,
          );
        }
        //Update state
        this.props.InRouteToPickupInitVars(response);
        resolve(true);
      } else if (tripScenario === 'inRouteToDestination') {
        //Update initialized scenario memory
        this.props.App.initializedScenario = tripScenario;
        //----
        if (this.camera !== undefined && this.camera != null) {
          this.camera.fitBounds(
            response.destinationPoint,
            [response.driverNextPoint[0], response.driverNextPoint[1]],
            70,
            Platform.OS === 'android' ? 2000 : 1000,
          );
        }
        //...
        this.props.InRouteToDestinationInitVars(response);
        resolve(true);
      }
    } else {
      resolve(false);
    }
  }

  /**
   * @func getCurrentPositionCusto()
   * void
   * Get the current GPRS positions of the user
   */

  getCurrentPositionCusto = () => {
    let that = this;
    if (this.props.App._MAIN_LOCATION_WATCHER === null) {
      this.props.App._MAIN_LOCATION_WATCHER = GeolocationP.watchPosition(
        (position) => {
          that.props.App.latitude = position.coords.latitude;
          that.props.App.longitude = position.coords.longitude;
          //---
          //Get user location
          that.props.App.socket.emit('geocode-this-point', {
            latitude: that.props.App.latitude,
            longitude: that.props.App.longitude,
            user_fingerprint: that.props.App.user_fingerprint,
            geolocationData: position,
          });
        },
        (error) => {
          //...
        },
        {
          enableHighAccuracy: true,
          timeout: 2000,
          maximumAge: 1000,
          distanceFilter: 0,
        },
      );
    }
  };

  /**
   * @func updateDriver_realTimeMap
   * Responsible for updating a maximum of 7 closest drivers to the rider's location based on the focused bottom vital proccess.
   */
  updateDriver_realTimeMap() {
    let that = this;
    //Update the list of the closest drivers - Promisify
    new Promise((res) => {
      //Update the list of the closest drivers if no trip in progress
      if (
        that.props.App.isRideInProgress === false &&
        /(mainView|selectRideOrDelivery|identifyLocation|selectConnectMeOrUs|selectNoOfPassengers|addMoreTripDetails)/i.test(
          that.props.App.bottomVitalsFlow.currentStep,
        )
      ) {
        //No rides in progress
        //If a latitude, longitude, city and town are available
        if (
          that.props.App.latitude !== undefined &&
          that.props.App.longitude !== undefined &&
          that.props.App.userCurrentLocationMetaData.city !== undefined &&
          that.props.App.userCurrentLocationMetaData.country !== undefined
        ) {
          if (that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS === null) {
            //Initialize the interval if not yet set - only once
            that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = setInterval(
              function () {
                if (
                  that.props.App.intervalProgressLoop === false &&
                  /(mainView|selectRideOrDelivery|identifyLocation|selectConnectMeOrUs|selectNoOfPassengers|addMoreTripDetails)/i.test(
                    that.props.App.bottomVitalsFlow.currentStep,
                  )
                ) {
                  that.props.App.socket.emit('get_closest_drivers_to_point', {
                    org_latitude: that.props.App.latitude,
                    org_longitude: that.props.App.longitude,
                    user_fingerprint: that.props.App.user_fingerprint,
                    city: that.props.App.userCurrentLocationMetaData.city,
                    country: that.props.App.userCurrentLocationMetaData.country,
                    ride_type: 'RIDE',
                  });
                } //Kill closest drivers interval persister
                else {
                  if (
                    that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS !==
                    null
                  ) {
                    clearInterval(
                      that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS,
                    );
                    that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
                  }
                }
              },
              that.props.App._TMP_INTERVAL_PERSISTER_TIME_CLOSEST_DRIVERS,
            );
            res(true);
          } //End the promise
          else {
            res(true);
          }
        } //End the promise
        else {
          res(true);
        }
      } //Kill the interval persister for the closest drivers if any
      else {
        if (that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS !== null) {
          clearInterval(that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS);
          that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
          res(true);
        }
      }
    }).then(
      () => {},
      () => {},
    );
  }

  /**
   * @func recalibrateMap()
   * @param fromRecenterButton: to know whether to stop the current animation or not depending on what invoked the action. - default: false
   * Responsible for replacing the camera to the user's current location on the map
   */
  recalibrateMap(fromRecenterButton = false) {
    let that = this;
    //! Coordinates order fix - major bug fix for ocean bug
    if (
      this.props.App.latitude !== undefined &&
      this.props.App.latitude !== null &&
      this.props.App.latitude !== 0 &&
      this.props.App.longitude !== undefined &&
      this.props.App.longitude !== null &&
      this.props.App.longitude !== 0
    ) {
      //? Switch latitude and longitude - check the negative sign
      if (parseFloat(this.props.App.longitude) < 0) {
        //Negative - switch
        let latitudeTmp = this.props.App.latitude;
        this.props.App.latitude = this.props.App.longitude;
        this.props.App.longitude = latitudeTmp;
      }
    }
    //!--------- Ocean bug fix

    if (this.props.App.gprsGlobals.hasGPRSPermissions) {
      //Avoid updating map when entering receiver's details and package size (DELIVERY)
      if (
        /(inputReceiverInformations|selectPackageSize)/i.test(
          this.props.App.bottomVitalsFlow.currentStep,
        ) === false
      ) {
        if (
          this.props.App.previewDestinationData.originDestinationPreviewData ===
          false
        ) {
          //If the preview of the route to destination is off
          //Only when a gprs permission is granted
          if (this.camera !== undefined && this.camera !== null) {
            if (this.props.App.isRideInProgress === false) {
              if (fromRecenterButton === false) {
                if (
                  this.props.App.latitude != null &&
                  this.props.App.longitude != null
                ) {
                  if (
                    this.props.App.latitude === 0 ||
                    this.props.App.longitude === 0
                  ) {
                    this.camera.setCamera({
                      zoomLevel: INIT_ZOOM_LEVEL,
                    }); //Back to init zoom level only if the coords are 0
                  } //Set the user on the point
                  else {
                    that.camera.setCamera({
                      centerCoordinate: [
                        that.props.App.longitude,
                        that.props.App.latitude,
                      ],
                      zoomLevel: that.props.App._NORMAL_MAP_ZOOM_LEVEL,
                      animationDuration: 700,
                    });
                  }
                  //...
                  if (
                    this.props.App._IS_MAP_INITIALIZED === false &&
                    this.props.App.gprsGlobals.hasGPRSPermissions &&
                    that.props.App.latitude !== 0 &&
                    that.props.App.longitude !== 0
                  ) {
                    //Initialize view
                    let timeout = setTimeout(function () {
                      that.props.App._IS_MAP_INITIALIZED = true;
                      //Enable map usages : zoom, pitch, scrool and rotate
                      that.props.UpdateMapUsabilityState(true);
                      //...
                      //Reset animation only if the current step is the mainView
                      if (
                        that.props.App.bottomVitalsFlow.currentStep ===
                        'mainView'
                      ) {
                        that.resetAnimationLoader(); //Stop the line animation
                      }
                      clearTimeout(timeout);
                    }, 400);
                  }
                }
              } //fROM RECENTER button
              else {
                //Hook recenter map state function
                this.props.App.bottomVitalsFlow.tmpVisibleBounds = false;
                that.updateCenterMapButton(true);
                //...
                InteractionManager.runAfterInteractions(() => {
                  that.camera.setCamera({
                    centerCoordinate: [
                      that.props.App.longitude,
                      that.props.App.latitude,
                    ],
                    zoomLevel: that.props.App._NORMAL_MAP_ZOOM_LEVEL,
                    animationDuration: 500,
                  });
                });
              }
            }
          }
        } //Preview of the route to destination is active
        else {
          if (
            that.props.App.previewDestinationData.originDestinationPreviewData
              .routePoints !== undefined
          ) {
            //Valid point
            //Center the 2 coordinates
            let originPoint =
              that.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[0];
            let destinationPoint =
              that.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[
                that.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates.length -
                  1
              ];
            if (
              this.camera !== undefined &&
              this.camera !== null &&
              this.camera != null
            ) {
              InteractionManager.runAfterInteractions(() => {
                that.camera.fitBounds(
                  originPoint,
                  destinationPoint,
                  Platform.OS === 'android'
                    ? [100, 140, 40, 140]
                    : [100, 100, 40, 100],
                  Platform.OS === 'android' ? 800 : 800,
                );
              });
            }
          }
        }
      }
    }
  }

  /**
   * @func  updateRemoteLocationsData()
   * Sent update locations informations to the server
   */
  updateRemoteLocationsData() {
    if (this.props.App._IS_MAP_INITIALIZED) {
      let that = this;
      //Save the coordinates in storage
      new Promise((res) => {
        SyncStorage.set(
          '@userLocationPoint',
          JSON.stringify({
            latitude: that.props.App.latitude,
            longitude: that.props.App.longitude,
          }),
        ).then(
          () => {
            res(true);
          },
          () => {
            res(false);
          },
        );
      }).then(
        () => {},
        () => {},
      );

      //ONLY GET CURRENT RIDE STATUS WHEN NO RIDE IS UP
      if (this.props.App.sharedSimplifiedLink === null) {
        let bundle = {
          latitude: this.props.App.latitude,
          longitude: this.props.App.longitude,
          user_fingerprint: this.props.App.user_fingerprint,
          user_nature: 'rider',
          pushnotif_token: this.props.App.pushnotif_token,
        };
        this.props.App.socket.emit('update-passenger-location', bundle);
      }
    }
  }

  /**
   * ?ANIMATIONS' FUNCTIONS
   * ONLY USE ANIMATION WITH NATIVE DRIVER ENABLED. - Make a way.
   */

  /**
   * @func fire_search_animation
   * ? 1. Loader animation
   * Responsible for launching the line animator for various processes.
   */
  fire_search_animation() {
    if (this.props.App.showLocationSearch_loader) {
      let that = this;
      AnimatedNative.timing(this.props.App.loaderPosition, {
        toValue: this.props.App.windowWidth,
        duration: 500,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }).start(() => {
        if (that.props.App.loaderBasicWidth === 1) {
          //Resize the length at the same time
          AnimatedNative.parallel([
            AnimatedNative.timing(that.props.App.loaderBasicWidth, {
              toValue: 0.1,
              duration: 500,
              useNativeDriver: true,
            }),
            AnimatedNative.timing(that.props.App.loaderPosition, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => {
            that.fire_search_animation();
          });
        } //Length fine, just go on
        else {
          AnimatedNative.timing(that.props.App.loaderPosition, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            that.fire_search_animation();
          });
        }
      });
    }
  }

  /**
   * @func fire_initGreetingAnd_after
   * ? 2. Greeting animation - init and after init
   * Launch greeting animations for hello1 and hello 2
   */
  fire_initGreetingAnd_after() {
    let that = this;
    let timeout0 = setTimeout(function () {
      AnimatedNative.parallel([
        AnimatedNative.timing(
          that.props.App.initialHelloAnimationParams.opacity,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(that.props.App.initialHelloAnimationParams.top, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        let timeout = setTimeout(function () {
          //Close hello 1
          AnimatedNative.parallel([
            AnimatedNative.timing(
              that.props.App.initialHelloAnimationParams.opacity,
              {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              },
            ),
            AnimatedNative.timing(
              that.props.App.initialHelloAnimationParams.top,
              {
                toValue: 10,
                duration: 300,
                useNativeDriver: true,
              },
            ),
          ]).start(() => {
            //Start hello 2
            that.props.UpdateHellosVars({initialHello: true});
            AnimatedNative.parallel([
              AnimatedNative.timing(
                that.props.App.initialHelloAnimationParams.opacity2,
                {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                that.props.App.initialHelloAnimationParams.top2,
                {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {
              //Replace text if GPRS is off
              if (that.props.App.gprsGlobals.hasGPRSPermissions === false) {
                //Replace hello 2 text with: Looks like you're off the map
                let gprsOffText = "Looks like you're off the map";
                if (that.props.App.hello2Text !== gprsOffText) {
                  let timeout2 = setTimeout(function () {
                    that.replaceHello2_text(gprsOffText);
                    clearTimeout(timeout2);
                  }, 1000);
                }
              }
            });
          });
          clearTimeout(timeout0);
          clearTimeout(timeout);
        }, 4000);
      });
    }, 1000);
  }

  /**
   * 3. Replace hello 2 text
   * Laucn the animation of replacement of the hello 2 text.
   */
  replaceHello2_text(text) {
    let that = this;
    //Close hello 2
    AnimatedNative.parallel([
      AnimatedNative.timing(
        that.props.App.initialHelloAnimationParams.opacity2,
        {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        },
      ),
      AnimatedNative.timing(that.props.App.initialHelloAnimationParams.top2, {
        toValue: 10,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      //Start hello 2
      that.props.UpdateHellosVars({hello2Text: text});
      AnimatedNative.parallel([
        AnimatedNative.timing(
          that.props.App.initialHelloAnimationParams.opacity2,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(that.props.App.initialHelloAnimationParams.top2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  /**
   * @func resetAnimationLoader
   * Reset the line loader to the default values
   */
  resetAnimationLoader() {
    let that = this;
    this.props.App.showLocationSearch_loader = false;
    AnimatedNative.timing(that.props.App.loaderPosition, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      AnimatedNative.timing(that.props.App.loaderBasicWidth, {
        toValue: this.props.App.windowWidth,
        duration: 3000,
        useNativeDriver: true,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
      }).start(() => {
        that.props.App.showLocationSearch_loader = false;
      });
    });
  }

  /**
   * RIDE OR DELIVERY ACTION METHODS
   */

  /**
   * @func deInitialTouchForRideOrDelivery()
   * Responsible for reshaping the bottom vitals when the user press on the back arrow to the initial flow (mainView).
   * Make the initial content fade to the first screen from the 2 choices screen
   * mainView <- selectRideOrDelivery
   */
  deInitialTouchForRideOrDelivery() {
    let that = this;
    InteractionManager.runAfterInteractions(() => {
      //Fade to the origin content
      AnimatedNative.parallel([
        AnimatedNative.timing(
          that.props.App.bottomVitalsFlow.genericContainerOpacity,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          that.props.App.bottomVitalsFlow.genericContainerPosition,
          {
            toValue: 20,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
      ]).start(() => {
        //Update process flow to select ride or delivery
        that.props.UpdateProcessFlowState({
          flowDirection: 'previous',
          flowParent: 'RIDE',
          parentTHIS: that,
        });
        AnimatedNative.parallel([
          AnimatedNative.timing(
            that.props.App.bottomVitalsFlow.bottomVitalChildHeight,
            {
              toValue: 150,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: false,
            },
          ),
          AnimatedNative.timing(
            that.props.App.bottomVitalsFlow.mainHelloContentOpacity,
            {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            that.props.App.bottomVitalsFlow.mainHelloContentPosition,
            {
              toValue: 0,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            that.props.App.initialHelloAnimationParams.top2,
            {
              toValue: 0,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            that.props.App.initialHelloAnimationParams.opacity2,
            {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
        ]).start(() => {
          that.resetAnimationLoader();
          //Recalibrate the map
          that.recalibrateMap();
        });
      });
    });
  }

  /**
   * @func rerouteBookingProcessFlow()
   * @params flowDirection: the direction of the navigation (next OR previous)
   * @params flowParent: the category under which the flow is running (RIDE or DELIVERIES)
   * @params connectType: the connect type (ConnectMe or ConnectUs) for rides only
   * Navigate through the process of booking for either ride or deliveries.
   */
  rerouteBookingProcessFlow(
    flowDirection,
    flowParent = false,
    connectType = false,
  ) {
    if (flowParent === false) {
      //Default flowParent to the current parent: RIDE OR DELIVERY
      flowParent = this.props.App.bottomVitalsFlow.flowParent;
    }
    //..
    let that = this;
    //Fade the origin content
    AnimatedNative.parallel([
      AnimatedNative.timing(
        that.props.App.bottomVitalsFlow.genericContainerOpacity,
        {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        },
      ),
      AnimatedNative.timing(
        that.props.App.bottomVitalsFlow.genericContainerPosition,
        {
          toValue: 20,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        },
      ),
    ]).start(() => {
      //Update process flow to select ride or delivery
      that.props.UpdateProcessFlowState({
        flowDirection: flowDirection,
        flowParent: flowParent,
        parentTHIS: that,
        connectType: connectType,
      });

      AnimatedNative.parallel([
        AnimatedNative.timing(
          that.props.App.bottomVitalsFlow.genericContainerOpacity,
          {
            toValue: 1,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          that.props.App.bottomVitalsFlow.genericContainerPosition,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
      ]).start();
    });
  }

  /**
   * @func getFareEstimation
   * Responsible for launching the request for the fare estimates to the pricing service.
   */
  getFareEstimation() {
    if (
      this.props.App.pricingVariables.didPricingReceivedFromServer === false
    ) {
      if (this.props.App.showLocationSearch_loader === false) {
        //? Launch the loader only if not yet initialized yet
        this.fire_search_animation();
      }
      //Check if a custom pickup location was specified
      //Point to current location by default
      let org_latitude =
        this.props.App.search_pickupLocationInfos
          .isBeingPickedupFromCurrentLocation === false ||
        this.props.App.search_pickupLocationInfos.passenger0Destination ===
          false ||
        this.props.App.search_pickupLocationInfos.passenger0Destination ===
          undefined ||
        this.props.App.search_pickupLocationInfos.passenger0Destination
          .coordinates === undefined ||
        this.props.App.search_pickupLocationInfos.passenger0Destination
          .coordinates[1] === undefined
          ? this.props.App.latitude
          : this.props.App.search_pickupLocationInfos.passenger0Destination
              .coordinates[1];
      //----------------------------------------------
      let org_longitude =
        this.props.App.search_pickupLocationInfos
          .isBeingPickedupFromCurrentLocation === false ||
        this.props.App.search_pickupLocationInfos.passenger0Destination ===
          false ||
        this.props.App.search_pickupLocationInfos.passenger0Destination ===
          undefined ||
        this.props.App.search_pickupLocationInfos.passenger0Destination
          .coordinates === undefined ||
        this.props.App.search_pickupLocationInfos.passenger0Destination
          .coordinates[0] === undefined
          ? this.props.App.longitude
          : this.props.App.search_pickupLocationInfos.passenger0Destination
              .coordinates[0];
      //Check forr custom pickup
      let originLocation = this.props.App.userCurrentLocationMetaData;
      //...
      if (
        this.props.App.search_pickupLocationInfos
          .isBeingPickedupFromCurrentLocation === false &&
        this.props.App.search_pickupLocationInfos.passenger0Destination !==
          false
      ) {
        org_latitude = this.props.App.search_pickupLocationInfos
          .passenger0Destination.coordinates[1];
        org_longitude = this.props.App.search_pickupLocationInfos
          .passenger0Destination.coordinates[0];
        //! Update the  rest of the custom location
        originLocation = {
          name: this.props.App.search_pickupLocationInfos.passenger0Destination
            .location_name,
          street: this.props.App.search_pickupLocationInfos
            .passenger0Destination.street,
          city: this.props.App.search_pickupLocationInfos.passenger0Destination
            .city,
          country: this.props.App.search_pickupLocationInfos
            .passenger0Destination.country,
        };
      }
      if (/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)) {
        //RIDE PRICING
        //Only if results was empty
        //Prod data input
        let pricingInputDataRaw = {
          user_fingerprint: this.props.App.user_fingerprint,
          connectType: this.props.App.bottomVitalsFlow.connectType,
          country: originLocation.country,
          isAllGoingToSameDestination: this.props.App.bottomVitalsFlow
            .rideOrDeliveryMetadata.isAllgoingToTheSamePlace,
          isGoingUntilHome: this.props.App.bottomVitalsFlow
            .rideOrDeliveryMetadata.isGoingUntilHome, //! Will double the fares for the Economy
          naturePickup:
            this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .locationTypeIdentified !== false
              ? this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                  .locationTypeIdentified
              : 'PrivateLocation', //Force PrivateLocation type if nothing found
          passengersNo: this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
            .numberOfPassengersSelected,
          rideType: this.props.App.bottomVitalsFlow.flowParent,
          timeScheduled: this.props.App.selectedScheduleTime,
          pickupData: {
            coordinates: [org_latitude, org_longitude],
            location_name:
              originLocation.name !== undefined && originLocation.name !== null
                ? originLocation.name
                : false,
            street_name:
              originLocation.street !== undefined &&
              originLocation.street !== null
                ? originLocation.street
                : false,
            city:
              originLocation.city !== undefined && originLocation.city !== null
                ? originLocation.city
                : false,
          },
          destinationData: this.props.App.search_passengersDestinations,
        };
        //..ask
        this.props.App.socket.emit(
          'getPricingForRideorDelivery',
          pricingInputDataRaw,
        );
      } else if (/DELIVERY/i.test(this.props.App.bottomVitalsFlow.flowParent)) {
        //DELIVERY PRICING
        //Prod data input
        let pricingInputDataRaw = {
          user_fingerprint: this.props.App.user_fingerprint,
          connectType: 'ConnectUs',
          country: this.props.App.userCurrentLocationMetaData.country,
          isAllGoingToSameDestination: false,
          isGoingUntilHome: false, //! Set going home to false for now.
          naturePickup: 'PrivateLocation', //Force PrivateLocation type if nothing found
          passengersNo: 1, //Default 1 possible destination
          rideType: 'DELIVERY',
          timeScheduled: this.props.App.selectedScheduleTime,
          pickupData: {
            coordinates: [org_latitude, org_longitude],
            location_name:
              this.props.App.userCurrentLocationMetaData.name !== undefined &&
              this.props.App.userCurrentLocationMetaData.name !== null
                ? this.props.App.userCurrentLocationMetaData.name
                : false,
            street_name:
              this.props.App.userCurrentLocationMetaData.street !== undefined &&
              this.props.App.userCurrentLocationMetaData.street !== null
                ? this.props.App.userCurrentLocationMetaData.street
                : false,
            city:
              this.props.App.userCurrentLocationMetaData.city !== undefined &&
              this.props.App.userCurrentLocationMetaData.city !== null
                ? this.props.App.userCurrentLocationMetaData.city
                : false,
          },
          destinationData: this.props.App.search_passengersDestinations,
        };
        //..ask
        this.props.App.socket.emit(
          'getPricingForRideorDelivery',
          pricingInputDataRaw,
        );
      }
    } //Reset search animation
    else {
      this.resetAnimationLoader();
    }
  }

  /**
   * @func renderCheckForScheduleContext()
   * @params context: different booking schedule scenarios -> now, today or tomorrow
   * Responsible for rendering the check-mark when a specific schedule context is selected
   * Contexts: Now, today or tomorrow
   */
  renderCheckForScheduleContext(context) {
    if (this.props.App.scheduledScenarioContext === context) {
      return (
        <View>
          <IconFeather
            name="check"
            size={25}
            style={{top: 1}}
            color={'#096ED4'}
          />
        </View>
      );
    } else {
      return null;
    }
  }

  /**
   * @func ucFirst
   * To uppercase only the firt letter.
   */
  ucFirst(text) {
    if (
      text !== undefined &&
      text !== null &&
      text[0] !== undefined &&
      text[0] !== null
    ) {
      return text[0].toUpperCase() + text.substr(1);
    } else {
      return null;
    }
  }

  /**
   * @func reallocateScheduleContextCheck()
   * @params context: schedule context: now, today or tomorrow
   * Responsible for the check mark that appears at the right of the selected schedule context,
   * upodate the props.App variable "scheduledScenarioContext" and redraw the check mark.
   */
  reallocateScheduleContextCheck(context) {
    if (this.props.App.scheduledScenarioContext !== context) {
      //Only for new contexts
      if (context !== 'errorTimeNotSetAhead') {
        //Do not lowercase error context flags
        context = context.toLowerCase().trim();
      }

      let contexts = [
        'now',
        'today',
        'tomorrow',
        'errorTimeNotSetAhead',
        'nowaftererror',
      ];
      if (contexts.includes(context)) {
        if (context !== 'errorTimeNotSetAhead' && context !== 'nowaftererror') {
          //Update date string based on the scenarios without forcing the user to reset the time
          //But reset if now context
          this.props.UpdateSchedulerState({scheduledScenarioContext: context});
          if (context === 'now') {
            this.props.UpdateSchedulerState({
              scheduledScenarioContext: context,
              selectedScheduleTime: 'now',
            });
          } else {
            if (this.props.App.scheduledScenarioContext === 'today') {
              //today -> tomorrow
              let newTimeString = this.props.App.selectedScheduleTime.replace(
                'tomorrow',
                'today',
              );
              this.props.UpdateSchedulerState({
                scheduledScenarioContext: context,
                selectedScheduleTime: newTimeString,
              });
            } else if (this.props.App.scheduledScenarioContext === 'tomorrow') {
              //tomorrow -> today
              let newTimeString = this.props.App.selectedScheduleTime.replace(
                'today',
                'tomorrow',
              );
              this.props.UpdateSchedulerState({
                scheduledScenarioContext: context,
                selectedScheduleTime: newTimeString,
              });
            }
          }
        } //Never assign scheduledScenarioContext to 'error values - default: now
        else {
          this.props.UpdateSchedulerState({
            scheduledScenarioContext: 'now',
            selectedScheduleTime: 'now',
          });
        }

        let that = this;
        //Update header animation and transition to updated header
        if (context === 'now') {
          //Now context: today or tomorrow -> now
          AnimatedNative.parallel([
            AnimatedNative.timing(
              this.props.App.scheduledScreenHeaderNotNowOpacity,
              {
                toValue: 0,
                duration: 200,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
            AnimatedNative.timing(
              this.props.App.scheduledScreenHeaderNotNowPosition,
              {
                toValue: 10,
                duration: 200,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
          ]).start(() => {
            that.props.UpdateSchedulerState({
              scheduledScenarioContextHeader: context,
            });
            //Fade in now header
            AnimatedNative.parallel([
              AnimatedNative.timing(
                that.props.App.scheduledScreenHeaderNowOpacity,
                {
                  toValue: 1,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                that.props.App.scheduledScreenHeaderNowPosition,
                {
                  toValue: 0,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
            ]).start();
          });
        } else if (context === 'nowaftererror') {
          //Convert context to default value: now
          context = 'now';
          //Shift from error future to now
          //Now context: today or tomorrow -> now
          AnimatedNative.parallel([
            AnimatedNative.timing(
              this.props.App.scheduledScreenHeaderFutureTimeNotSetOpacity,
              {
                toValue: 0,
                duration: 200,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
            AnimatedNative.timing(
              this.props.App.scheduledScreenHeaderFutureTimeNotSetPosition,
              {
                toValue: 10,
                duration: 200,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
          ]).start(() => {
            that.props.UpdateSchedulerState({
              scheduledScenarioContextHeader: context,
            });
            //Fade in now header
            AnimatedNative.parallel([
              AnimatedNative.timing(
                that.props.App.scheduledScreenHeaderNowOpacity,
                {
                  toValue: 1,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                that.props.App.scheduledScreenHeaderNowPosition,
                {
                  toValue: 0,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
            ]).start();
          });
        } else if (context === 'errorTimeNotSetAhead') {
          //The user did not set a future time
          if (this.props.App.scheduledScenarioContextHeader === 'now') {
            //Move from now -> error future time not set
            //Now context: now -> error future time not set
            AnimatedNative.parallel([
              AnimatedNative.timing(
                this.props.App.scheduledScreenHeaderNowOpacity,
                {
                  toValue: 0,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                this.props.App.scheduledScreenHeaderNowPosition,
                {
                  toValue: 10,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {
              that.props.UpdateSchedulerState({
                scheduledScenarioContextHeader: context,
              });
              //Fade in error header
              AnimatedNative.parallel([
                AnimatedNative.timing(
                  that.props.App.scheduledScreenHeaderFutureTimeNotSetOpacity,
                  {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
                AnimatedNative.timing(
                  that.props.App.scheduledScreenHeaderFutureTimeNotSetPosition,
                  {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
              ]).start(() => {
                //Reset now header after 3 seconds
                let timeout = setTimeout(function () {
                  that.reallocateScheduleContextCheck('nowaftererror');
                  clearTimeout(timeout);
                }, 1500);
              });
            });
          } //Move from today/tomorrow -> error future time not set
          else {
            //Fade in error header
            AnimatedNative.parallel([
              AnimatedNative.timing(
                this.props.App.scheduledScreenHeaderNotNowOpacity,
                {
                  toValue: 0,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                this.props.App.scheduledScreenHeaderNotNowPosition,
                {
                  toValue: 10,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {
              that.props.UpdateSchedulerState({
                scheduledScenarioContextHeader: context,
              });
              //Fade in now header
              AnimatedNative.parallel([
                AnimatedNative.timing(
                  that.props.App.scheduledScreenHeaderFutureTimeNotSetOpacity,
                  {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
                AnimatedNative.timing(
                  that.props.App.scheduledScreenHeaderFutureTimeNotSetPosition,
                  {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
              ]).start(() => {
                //Reset now header after 3 seconds
                let timeout = setTimeout(function () {
                  that.reallocateScheduleContextCheck('nowaftererror');
                  clearTimeout(timeout);
                }, 1500);
              });
            });
          }
        }
        //Context today or tomorrow
        else {
          //Now context: now -> today or tomorrow
          AnimatedNative.parallel([
            AnimatedNative.timing(
              this.props.App.scheduledScreenHeaderNowOpacity,
              {
                toValue: 0,
                duration: 200,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
            AnimatedNative.timing(
              this.props.App.scheduledScreenHeaderNowPosition,
              {
                toValue: 10,
                duration: 200,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
          ]).start(() => {
            that.props.UpdateSchedulerState({
              scheduledScenarioContextHeader: context,
            });
            //Fade in today or tomorrow header
            AnimatedNative.parallel([
              AnimatedNative.timing(
                that.props.App.scheduledScreenHeaderNotNowOpacity,
                {
                  toValue: 1,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                that.props.App.scheduledScreenHeaderNotNowPosition,
                {
                  toValue: 0,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
            ]).start();
          });
        }
      }
    }
  }

  /**
   * @func renderNoGPRSResolver
   * Responsible for showing up the the component to facilite the user to activate the GPRS to be
   * able to use the platform
   */
  promptGPRSActivation() {
    this.props.App.gprsGlobals.didAskForGprs = false;
    this.props.App.gprsGlobals.hasGPRSPermissions = false;
    //...
    this.GPRS_resolver(true);
  }

  renderNoGPRSResolver() {
    if (this.props.App.gprsGlobals.hasGPRSPermissions === false) {
      return (
        <TouchableOpacity
          onPress={() => this.promptGPRSActivation()}
          style={[
            Platform.OS === 'android'
              ? styles.shadowBottomVitals
              : styles.shadowBottomVitalsIOS,
            {
              flexDirection: 'row',
              minHeight: 80,
              backgroundColor: '#0e8491',
              padding: 20,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            },
          ]}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <Text
              style={[
                {
                  fontSize: RFValue(16),
                  color: '#fff',
                  lineHeight: 25,
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                },
              ]}>
              Your location services need to be enabled for a better experience.
            </Text>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android' ? 'MoveBold' : 'Uber Move Bold',
                fontSize: RFValue(17.5),
                marginTop: 10,
                color: '#fff',
              }}>
              Turn on your location
            </Text>
          </View>
          <View
            style={{
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconAnt name="arrowright" color={'#fff'} size={25} />
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }

  /**
   * @func update
   */

  /**
   * @func updateCenterMapButton()
   * @param smoothRemoval: to know if the forced removal of the recenter button should be animated - default: false
   * Responsible for sensing when the map is not centered to the user location and show the recenter button
   */
  async updateCenterMapButton(smoothRemoval = false) {
    if (this._map !== undefined && this._map !== null) {
      let that = this;
      if (this.props.App.isRideInProgress === false) {
        const visibleBounds = await this._map.getVisibleBounds();
        //SHow recenter button only
        if (this.props.App.bottomVitalsFlow.tmpVisibleBounds === false) {
          //Not initialized yet
          this.props.App.bottomVitalsFlow.tmpVisibleBounds =
            visibleBounds !== undefined && visibleBounds !== null
              ? `${JSON.stringify(visibleBounds)}false`
              : 'somethingfalse'; //Update the temp visible bounds - semi initialize
          if (smoothRemoval === false) {
            this.props.UpdateMapUsabilityState({
              isRecentered: true,
            });
          } //Animated - in case the user pressed the recenter button
          else {
            //Scale down and remove
            AnimatedNative.parallel([
              AnimatedNative.timing(
                this.props.App.bottomVitalsFlow.centerLocationButtonScale,
                {
                  toValue: 0,
                  duration: 150,
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {
              that.props.UpdateMapUsabilityState({
                isRecentered: true,
              });
            });
          }
        } else {
          if (
            /false/.test(this.props.App.bottomVitalsFlow.tmpVisibleBounds) &&
            visibleBounds !== undefined &&
            visibleBounds !== null
          ) {
            //Semi initialization detected - full y initialize
            this.props.App.bottomVitalsFlow.tmpVisibleBounds = JSON.stringify(
              visibleBounds,
            );
            this.props.UpdateMapUsabilityState({
              isRecentered: true,
            });
          } //Already fully initialized
          else {
            if (
              visibleBounds !== undefined &&
              visibleBounds !== null &&
              JSON.stringify(visibleBounds) ===
                this.props.App.bottomVitalsFlow.tmpVisibleBounds
            ) {
              //Hide recenter button
              if (
                this.props.App.bottomVitalsFlow.isUserLocationCentered === false
              ) {
                //Update only when neccessary
                this.props.App.bottomVitalsFlow.tmpVisibleBounds = JSON.stringify(
                  visibleBounds,
                );
                //Scale down and remove
                AnimatedNative.parallel([
                  AnimatedNative.timing(
                    this.props.App.bottomVitalsFlow.centerLocationButtonScale,
                    {
                      toValue: 0,
                      duration: 150,
                      useNativeDriver: true,
                    },
                  ),
                ]).start(() => {
                  that.props.UpdateMapUsabilityState({
                    isRecentered: true,
                  });
                });
              }
            } //Show recenter button
            else {
              this.props.App.bottomVitalsFlow.tmpVisibleBounds = JSON.stringify(
                visibleBounds,
              ); //Update the temp visible bounds
              //Put and scale up
              this.props.UpdateMapUsabilityState({isRecentered: false});
              AnimatedNative.parallel([
                AnimatedNative.timing(
                  this.props.App.bottomVitalsFlow.centerLocationButtonScale,
                  {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                  },
                ),
              ]).start();
            }
          }
        }
      }
    }
  }

  /**
   * @func renderAppropriateModules()
   * Very important router for rendering the corrects modules
   */
  renderAppropriateModules() {
    return (
      <>
        <View style={styles.mainMainWindow}>
          <RenderMainMapView parentNode={this} />
        </View>

        {
          //Getting ride screen loader
          this.props.App.bottomVitalsFlow.currentStep ===
          'gettingRideProcessScreen' ? (
            <AnimatedNative.View
              style={{
                position: 'absolute',
                top: 0,
                zIndex: 90000000,
                left: 0,
                width: '100%',
                height: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                opacity: this.props.App.bottomVitalsFlow
                  .genericLoaderScreenOpacity,
              }}>
              <View style={{width: '100%', alignItems: 'center'}}>
                <Text
                  style={[
                    {
                      color: '#fff',
                      marginBottom: 40,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(20),
                    },
                  ]}>
                  {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                    ? 'Getting you a ride'
                    : 'Requesting for your delivery'}
                </Text>
                <View style={{width: '100%'}}>
                  <GenericLoader active={true} thickness={4} color={'#fff'} />
                </View>
              </View>
            </AnimatedNative.View>
          ) : null
        }

        {/**Hide menu for some specific screens */}
        {/(mainView)/i.test(this.props.App.bottomVitalsFlow.currentStep) ? (
          <SafeAreaView
            style={{
              position: 'absolute',
              width: 100,
              top: Platform.OS === 'android' ? 20 : 40,
              left: 20,
            }}>
            <TouchableOpacity
              onPress={() => {
                //? Gather Ad analytics *************************************************
                if (
                  this.props.App.ad_vars !== undefined &&
                  this.props.App.ad_vars !== null &&
                  this.props.App.ad_vars.compaign_id !== undefined &&
                  this.props.App.ad_vars.compaign_id !== null
                ) {
                  this.props.App.socket.emit('gatherAdsManagerAnalytics_io', {
                    user_fingerprint: this.props.App.user_fingerprint,
                    user_nature: 'rider',
                    screen_identifier: 'BottomDrawer',
                    company_identifier: this.props.App.ad_vars.company_id,
                    campaign_identifier: this.props.App.ad_vars.compaign_id,
                  });
                }
                //? *********************************************************************
                this.props.navigation.openDrawer();
              }}
              style={{
                backgroundColor: '#fff',
                width: 50,
                height: 50,
                borderRadius: 150,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.32,
                shadowRadius: 5.46,

                elevation: 9,
              }}>
              <IconMaterialIcons name="menu" size={35} />
            </TouchableOpacity>
          </SafeAreaView>
        ) : null}

        <SafeAreaView
          style={{
            position: 'absolute',
            zIndex: 90000000,
            width: 100,
            flexDirection: 'row',
            alignItems: 'center',
            top: Platform.OS === 'android' ? 20 : 40,
            left: 20,
          }}>
          {this.props.App.bottomVitalsFlow.canGoBack &&
          this.props.App.bottomVitalsFlow.currentStep !==
            'gettingRideProcessScreen' &&
          this.props.App.isRideInProgress !== true ? (
            /inputReceiverInformations/i.test(
              this.props.App.bottomVitalsFlow.currentStep,
            ) !== true ? (
              <View style={{flex: 1, alignItems: 'flex-start'}}>
                <TouchableOpacity
                  activeOpacity={0.4}
                  onPress={() =>
                    this.props.App.bottomVitalsFlow.currentStep ===
                    'selectRideOrDelivery'
                      ? this.deInitialTouchForRideOrDelivery()
                      : this.rerouteBookingProcessFlow(
                          'previous',
                          this.props.App.bottomVitalsFlow.flowParent.toUpperCase(),
                        )
                  }
                  style={{
                    width: 45,
                    height: 45,
                    backgroundColor: '#fff',
                    borderRadius: 200,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 5,
                    },
                    shadowOpacity: 0.5,
                    shadowRadius: 6.27,

                    elevation: 10,
                  }}>
                  <IconAnt name="arrowleft" size={29} />
                </TouchableOpacity>
              </View>
            ) : null
          ) : null}
        </SafeAreaView>

        {this.renderNoGPRSResolver()}
        {this.props.App.isSearchModuleOn ? (
          <Search parentNode={this} />
        ) : /(gettingRideProcessScreen)/i.test(
            this.props.App.bottomVitalsFlow.currentStep,
          ) !== true ? (
          /addMoreTripDetails/i.test(
            this.props.App.bottomVitalsFlow.currentStep,
          ) ? (
            this.props.App.isKeyboardShown ? (
              <KeyboardAvoidingView behavior={'padding'}>
                <RenderBottomVital parentNode={this} />
              </KeyboardAvoidingView>
            ) : /confirmFareAmountORCustomize/i.test(
                this.props.App.bottomVitalsFlow.currentStep,
              ) ? (
              <RenderBottomVital parentNode={this} />
            ) : (
              <KeyboardAvoidingView behavior={'padding'}>
                <RenderBottomVital parentNode={this} />
              </KeyboardAvoidingView>
            )
          ) : (
            <RenderBottomVital parentNode={this} />
          )
        ) : null}
      </>
    );
  }

  /**
   * @func handleCancelScheduleTrip
   * Responsible for dismissing the time setter while scheduling a trip, do not change the previous values!
   */
  handleCancelScheduleTrip = () => {
    this.props.UpdateSchedulerState({
      isSelectDatePickerActive: false,
    });
  };

  /**
   * @func handleConfirmDateSchedule
   * @param {*} date : date object when confirming the time
   * Responsible for the microprocessing after the user confirms the time he/she wants for the trip
   * And also checks that the time is set for at least 15 min in the future.
   */
  handleConfirmDateSchedule = (date) => {
    let hours = date.getHours();
    if (hours < 10) {
      hours = '0' + hours;
    }
    let minutes = date.getMinutes();
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    //Check if the date corresponds to the reality of today
    if (
      this.props.App.scheduledScenarioContext === 'Today' ||
      this.props.App.scheduledScenarioContext === 'today'
    ) {
      let normalDate = new Date();
      if (normalDate.getHours() > hours) {
        //Invalid - Scheduled time not set for the future
        //Update date string - Default: now
        this.props.UpdateSchedulerState({
          scheduledScenarioContext: 'now',
          selectedScheduleTime: 'now',
        });
        //Animate header to show error
        this.reallocateScheduleContextCheck('errorTimeNotSetAhead');
      } else if (
        // eslint-disable-next-line eqeqeq
        normalDate.getHours() == hours &&
        normalDate.getMinutes() > minutes
      ) {
        //Invalid - Scheduled time not set for the future
        //Update date string - Default: now
        this.props.UpdateSchedulerState({
          scheduledScenarioContext: 'now',
          selectedScheduleTime: 'now',
        });
        //Animate header to show error
        this.reallocateScheduleContextCheck('errorTimeNotSetAhead');
      } //Valid
      else {
        //Check that there's at least 15min time difference between the current time and scheduled time
        let diff = date.getTime() - normalDate.getTime();
        diff /= 60000;
        if (diff >= 15) {
          //Correct format
          //Update date string
          this.props.UpdateSchedulerState({
            selectedScheduleTime:
              this.props.App.scheduledScenarioContext +
              ' at ' +
              hours +
              ':' +
              minutes,
          });
        } //There should be at least 15 min difference - error
        else {
          //Invalid - Scheduled time not set for the future
          //Update date string - Default: now
          this.props.UpdateSchedulerState({
            scheduledScenarioContext: 'now',
            selectedScheduleTime: 'now',
          });
          //Animate header to show error
          this.reallocateScheduleContextCheck('errorTimeNotSetAhead');
        }
      }
    } //Ride set for tomorrow - so just update the time strings
    else {
      //Update date string
      this.props.UpdateSchedulerState({
        selectedScheduleTime:
          this.props.App.scheduledScenarioContext +
          ' at ' +
          hours +
          ':' +
          minutes,
      });
    }
    this.props.UpdateSchedulerState({isSelectDatePickerActive: false});
  };

  /**
   * @func renderError_modalView
   * Responsible for rendering the modal view only once.
   */
  renderError_modalView() {
    return (
      <ErrorModal
        active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
        error_status={
          this.props.App.generalErrorModal_vars.generalErrorModalType
        }
        parentNode={this}
      />
    );
  }

  render() {
    return (
      <DismissKeyboard>
        <View style={styles.window}>
          {Platform.OS === 'android' ? (
            <StatusBar backgroundColor="#000" />
          ) : (
            <StatusBar barStyle={'dark-content'} />
          )}
          {this.props.App.generalErrorModal_vars.showErrorGeneralModal
            ? this.renderError_modalView()
            : null}
          {this.props.App.isSelectDatePickerActive ? (
            <DateTimePickerModal
              isVisible={this.props.App.isSelectDatePickerActive}
              mode="time"
              is24Hour={true}
              onConfirm={this.handleConfirmDateSchedule}
              onCancel={this.handleCancelScheduleTrip}
            />
          ) : null}
          <View style={{flex: 1}}>{this.renderAppropriateModules()}</View>
        </View>
      </DismissKeyboard>
    );
  }
}

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ResetStateProps,
      UpdateGrantedGRPS,
      UpdatePendingGlobalVars,
      UpdateRouteToPickupVars,
      InRouteToPickupInitVars,
      __Update_InRouteToPickupInitVars,
      InRouteToDestinationInitVars,
      __Update_InRouteToDestinationInitVars,
      UpdateHellosVars,
      UpdateSchedulerState,
      UpdateBottomVitalsState,
      UpdateProcessFlowState,
      UpdateMapUsabilityState,
      UpdateCurrentLocationMetadat,
      UpdatePricingStateData,
      UpdateRoutePreviewToDestination,
      UpdateClosestDriversList,
      UpdateErrorBottomVitals,
      UpdateErrorModalLog,
      UpdateDropoffDataFor_driverRating,
      UpdateTotalWalletAmount,
      UpdateKeyboardStateGlobal,
      UpdateADGetData,
    },
    dispatch,
  );

const styles = StyleSheet.create({
  window: {
    flex: 1,
  },
  mainMainWindow: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loader: {
    borderTopWidth: 3,
    width: 20,
    marginBottom: 10,
  },
  shadowBottomVitalsIOS: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 120.7,
    elevation: 0,
  },
  shadowBottomVitals: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -30,
    },
    shadowOpacity: 0.8,
    shadowRadius: 90.7,
    elevation: 50,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
