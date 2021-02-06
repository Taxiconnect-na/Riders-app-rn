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
  TouchableHighlightBase,
  BackHandler,
  Platform,
  SafeAreaView,
} from 'react-native';
import bearing from '@turf/bearing';
import {systemWeights} from 'react-native-typography';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFeather from 'react-native-vector-icons/Feather';
import ErrorModal from '../Helpers/ErrorModal';
import NetInfo from '@react-native-community/netinfo';
import Search from '../Modules/Search/Components/Search';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
//Import of action creators
import {
  ResetStateProps,
  UpdateGrantedGRPS,
  UpdatePendingGlobalVars,
  UpdateRouteToPickupVars,
  InRouteToPickupInitVars,
  InRouteToDestinationInitVars,
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
} from '../Redux/HomeActionsCreators';
import RenderBottomVital from './RenderBottomVital';
import RenderMainMapView from './RenderMainMapView';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import SyncStorage from 'sync-storage';
import {TouchableNativeFeedback} from 'react-native-gesture-handler';
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
  }

  _RESET_STATE() {
    this.props.ResetStateProps(this);
    //...
    if (this.camera !== undefined && this.camera != null) {
      this.camera.moveTo(
        [this.props.App.longitude, this.props.App.latitude],
        70,
        2000,
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
    let globalObject = this;
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
                  globalObject.replaceHello2_text(
                    `Hi ${this.props.App.username}`,
                  );
                }
                //Permission granted
                this.getCurrentPositionCusto();
                GeolocationP.getCurrentPosition(
                  (position) => {
                    globalObject.props.App.latitude = position.coords.latitude;
                    globalObject.props.App.longitude =
                      position.coords.longitude;
                    //Update GPRS permission global var
                    let newStateVars = {};
                    newStateVars.hasGPRSPermissions = true;
                    newStateVars.didAskForGprs = true;
                    globalObject.props.UpdateGrantedGRPS(newStateVars);
                    //Launch recalibration
                    InteractionManager.runAfterInteractions(() => {
                      globalObject.recalibrateMap();
                    });
                  },
                  () => {
                    // See error code charts below.
                    //Launch recalibration
                    InteractionManager.runAfterInteractions(() => {
                      globalObject.recalibrateMap();
                    });
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 200000,
                    maximumAge: 1000,
                    distanceFilter: 3,
                  },
                );
                this.props.App.isMapPermitted = true;
              } else {
                globalObject.updateDriver_realTimeMap();
                GeolocationP.getCurrentPosition(
                  (position) => {
                    globalObject.props.App.latitude = position.coords.latitude;
                    globalObject.props.App.longitude =
                      position.coords.longitude;
                    //Get user location
                    globalObject.props.App.socket.emit('geocode-this-point', {
                      latitude: globalObject.props.App.latitude,
                      longitude: globalObject.props.App.longitude,
                      user_fingerprint: globalObject.props.App.user_fingerprint,
                    });
                    //Update GPRS permission global var
                    let newStateVars = {};
                    newStateVars.hasGPRSPermissions = true;
                    newStateVars.didAskForGprs = true;
                    globalObject.props.UpdateGrantedGRPS(newStateVars);
                  },
                  () => {
                    // See error code charts below.
                    //Launch recalibration
                    InteractionManager.runAfterInteractions(() => {
                      globalObject.recalibrateMap();
                    });
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 200000,
                    maximumAge: 10000,
                    distanceFilter: 3,
                  },
                );
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
                        globalObject.recalibrateMap();
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
                  globalObject.props.App.latitude = position.coords.latitude;
                  globalObject.props.App.longitude = position.coords.longitude;
                  //Update GPRS permission global var
                  let newStateVars = {};
                  newStateVars.hasGPRSPermissions = true;
                  newStateVars.didAskForGprs = true;
                  globalObject.props.UpdateGrantedGRPS(newStateVars);
                  //Launch recalibration
                  InteractionManager.runAfterInteractions(() => {
                    globalObject.recalibrateMap();
                  });
                },
                () => {
                  // See error code charts below.
                  //Launch recalibration
                  InteractionManager.runAfterInteractions(() => {
                    globalObject.recalibrateMap();
                  });
                },
                {
                  enableHighAccuracy: true,
                  timeout: 2000,
                  maximumAge: 1000,
                  distanceFilter: 3,
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
                    globalObject.replaceHello2_text(
                      `Hi ${this.props.App.username}`,
                    );
                  }
                  //Permission granted
                  this.getCurrentPositionCusto();
                  GeolocationP.getCurrentPosition(
                    (position) => {
                      globalObject.props.App.latitude =
                        position.coords.latitude;
                      globalObject.props.App.longitude =
                        position.coords.longitude;
                      //Update GPRS permission global var
                      let newStateVars = {};
                      newStateVars.hasGPRSPermissions = true;
                      newStateVars.didAskForGprs = true;
                      globalObject.props.UpdateGrantedGRPS(newStateVars);
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        globalObject.recalibrateMap();
                      });
                    },
                    () => {
                      // See error code charts below.
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        globalObject.recalibrateMap();
                      });
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 200000,
                      maximumAge: 1000,
                      distanceFilter: 3,
                    },
                  );
                  this.props.App.isMapPermitted = true;
                } else {
                  globalObject.updateDriver_realTimeMap();
                  GeolocationP.getCurrentPosition(
                    (position) => {
                      globalObject.props.App.latitude =
                        position.coords.latitude;
                      globalObject.props.App.longitude =
                        position.coords.longitude;
                      //Get user location
                      globalObject.props.App.socket.emit('geocode-this-point', {
                        latitude: globalObject.props.App.latitude,
                        longitude: globalObject.props.App.longitude,
                        user_fingerprint:
                          globalObject.props.App.user_fingerprint,
                      });
                      //Update GPRS permission global var
                      let newStateVars = {};
                      newStateVars.hasGPRSPermissions = true;
                      newStateVars.didAskForGprs = true;
                      globalObject.props.UpdateGrantedGRPS(newStateVars);
                    },
                    () => {
                      // See error code charts below.
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        globalObject.recalibrateMap();
                      });
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 200000,
                      maximumAge: 10000,
                      distanceFilter: 3,
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
                          globalObject.recalibrateMap();
                        });
                      }
                    }
                  }
                }
                break;
              case RESULTS.GRANTED:
                if (
                  this.props.App.gprsGlobals.hasGPRSPermissions === false ||
                  this.props.App.gprsGlobals.didAskForGprs === false ||
                  this.props.App.latitude === 0 ||
                  this.props.App.longitude === 0
                ) {
                  console.log(
                    `at ZERO with -> lat: ${globalObject.props.App.latitude}, lng: ${globalObject.props.App.longitude}`,
                  );
                  if (/off the map/i.test(this.props.App.hello2Text)) {
                    globalObject.replaceHello2_text(
                      `Hi ${this.props.App.username}`,
                    );
                  }
                  //Permission granted
                  this.getCurrentPositionCusto();
                  GeolocationP.getCurrentPosition(
                    (position) => {
                      globalObject.props.App.latitude =
                        position.coords.longitude;
                      globalObject.props.App.longitude =
                        position.coords.latitude;
                      //Update GPRS permission global var
                      let newStateVars = {};
                      newStateVars.hasGPRSPermissions = true;
                      newStateVars.didAskForGprs = true;
                      globalObject.props.UpdateGrantedGRPS(newStateVars);
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        globalObject.recalibrateMap();
                      });
                    },
                    () => {
                      // See error code charts below.
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        globalObject.recalibrateMap();
                      });
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 200000,
                      maximumAge: 1000,
                      distanceFilter: 3,
                    },
                  );
                  this.props.App.isMapPermitted = true;
                } else {
                  globalObject.updateDriver_realTimeMap();
                  GeolocationP.getCurrentPosition(
                    (position) => {
                      globalObject.props.App.latitude =
                        position.coords.longitude;
                      globalObject.props.App.longitude =
                        position.coords.latitude;
                      //Get user location
                      globalObject.props.App.socket.emit('geocode-this-point', {
                        latitude: globalObject.props.App.latitude,
                        longitude: globalObject.props.App.longitude,
                        user_fingerprint:
                          globalObject.props.App.user_fingerprint,
                      });
                      //Update GPRS permission global var
                      let newStateVars = {};
                      newStateVars.hasGPRSPermissions = true;
                      newStateVars.didAskForGprs = true;
                      globalObject.props.UpdateGrantedGRPS(newStateVars);
                    },
                    () => {
                      // See error code charts below.
                      //Launch recalibration
                      InteractionManager.runAfterInteractions(() => {
                        globalObject.recalibrateMap();
                      });
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 200000,
                      maximumAge: 10000,
                      distanceFilter: 3,
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
                          console.log(
                            `Recalibrate with -> lat: ${globalObject.props.App.latitude}, lng: ${globalObject.props.App.longitude}`,
                          );
                          globalObject.recalibrateMap();
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
          });
      } //Location permission explicitly requested
      else {
        console.log('requested permission by click');
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
    let globalObject = this;
    //...
    if (this.props.App._TMP_TRIP_INTERVAL_PERSISTER === null) {
      InteractionManager.runAfterInteractions(() => {
        globalObject.props.App._TMP_TRIP_INTERVAL_PERSISTER = setInterval(
          function () {
            //...
            if (globalObject.props.App.intervalProgressLoop === false) {
              InteractionManager.runAfterInteractions(() => {
                globalObject.GPRS_resolver();
                globalObject.updateRemoteLocationsData();
              });
              //Request for the total wallet balance

              globalObject.props.App.socket.emit('getRiders_walletInfos_io', {
                user_fingerprint: globalObject.props.App.user_fingerprint,
                mode: 'detailed',
              });
            } //Kill the persister
            else {
              clearInterval(
                globalObject.props.App._TMP_TRIP_INTERVAL_PERSISTER,
              );
              if (
                globalObject.props.App._TMP_TRIP_INTERVAL_PERSISTER !== null
              ) {
                globalObject.props.App._TMP_TRIP_INTERVAL_PERSISTER = null;
              }
            }
          },
          globalObject.props.App._TMP_TRIP_INTERVAL_PERSISTER_TIME,
        );
      });
    }
  }

  /**
   * @func componentDidMount
   * Main mounting point of the app
   */

  async componentDidMount() {
    let globalObject = this;
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
        if (
          /mainView/i.test(globalObject.props.App.bottomVitalsFlow.currentStep)
        ) {
          //Main view
          //Close the app or something.
        } //Go back to previous flow
        else {
          if (
            /selectRideOrDelivery/i.test(
              globalObject.props.App.bottomVitalsFlow.currentStep,
            )
          ) {
            globalObject.deInitialTouchForRideOrDelivery();
          } else if (
            /gettingRideProcessScreen/i.test(
              globalObject.props.App.bottomVitalsFlow.currentStep,
            )
          ) {
            //Do nothing
          } else {
            globalObject.rerouteBookingProcessFlow(
              'previous',
              globalObject.props.App.bottomVitalsFlow.flowParent,
            );
          }
        }
        return true;
      },
    );

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
    globalObject.GPRS_resolver();
    //...

    //Network state checker
    this.state.networkStateChecker = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        globalObject.props.UpdateErrorModalLog(
          state.isConnected,
          'connection_no_network',
          state.type,
        );
      } //connected
      else {
        globalObject.props.UpdateErrorModalLog(false, false, state.type);
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
          globalObject.props.App.generalErrorModalType,
        ) !== true
      ) {
        //Do not interrupt the select gender process
        globalObject.props.UpdateErrorModalLog(false, false, 'any');
      }
    });

    this.props.App.socket.on('error', () => {});
    this.props.App.socket.on('disconnect', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_error', () => {
      if (
        /(show_modalMore_tripDetails|show_rating_driver_modal|show_cancel_ride_modal|show_preferedPaymentMethod_modal)/i.test(
          globalObject.props.App.generalErrorModalType,
        ) !== true
      ) {
        globalObject.props.UpdateErrorModalLog(
          true,
          'service_unavailable',
          'any',
        );
      }
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_timeout', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect', () => {});
    this.props.App.socket.on('reconnect_error', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect_failed', () => {
      globalObject.props.App.socket.connect();
    });

    //Bind the requests interval persister
    this.bindRequest_findFetcher();

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
              globalObject.props.App.generalErrorModalType,
            )
          ) {
            //Do not interrupt the select gender process
            globalObject.props.UpdateErrorModalLog(false, false, 'any'); //Auto close connection unavailable
          }
          //...
          globalObject.props.UpdateTotalWalletAmount(response);
        }
      },
    );

    /**
     * @socket trackdriverroute-response
     * Get route tracker response
     * Responsible for redirecting updates to map graphics data based on if the status of the request is: pending, in route to pickup, in route to drop off or completed
     */
    this.props.App.socket.on('trackdriverroute-response', function (response) {
      if (
        response !== null &&
        response !== undefined &&
        /no_rides/i.test(response.request_status) === false
      ) {
        //! RESET EVERYTHING IF THE REQUEST WAS JUST MADE
        if (globalObject.props.App.bottomVitalsFlow._BOOKING_REQUESTED) {
          /*globalObject.props.App.bottomVitalsFlow._BOOKING_REQUESTED = false;
          //Reset
          globalObject._RESET_STATE();
          //Recalibrate map
          if (
            globalObject.map !== undefined &&
            globalObject.map !== null &&
            globalObject.camera !== undefined &&
            globalObject.camera !== null
          ) {
            globalObject.camera.setCamera({
              centerCoordinate: [
                globalObject.props.App.longitude,
                globalObject.props.App.latitude,
              ],
              zoomLevel: 14,
              animationDuration: 2000,
            });
          }*/
        }

        //1. Trip in progress: in route to pickup or in route to drop off
        if (
          response.response === undefined &&
          response.routePoints !== undefined &&
          /(inRouteToPickup|inRouteToDestination)/i.test(
            response.request_status,
          )
        ) {
          globalObject.props.App.bottomVitalsFlow.currentStep = 'mainView'; //Change current step back to mainView
          //Save the driver's details - car details - and Static ETA to destination info
          globalObject.props.App.generalTRIP_details_driverDetails = {
            eta: response.eta,
            ETA_toDestination: response.ETA_toDestination,
            driverDetails: response.driverDetails,
            carDetails: response.carDetails,
            basicTripDetails: response.basicTripDetails,
          }; //Very important

          //Update route to destination var - request status: inRouteToPickup, inRouteToDestination
          if (/inRouteToPickup/i.test(response.request_status)) {
            globalObject.props.App.isInRouteToDestination = false;
            globalObject.props.App.request_status = 'inRouteToPickup';

            //Update loop request
            if (globalObject.props.App.intervalProgressLoop === false) {
              globalObject.props.App.intervalProgressLoop = setInterval(
                function () {
                  if (globalObject.props.App.isRideInProgress === true) {
                    globalObject.GPRS_resolver();
                    globalObject.updateRemoteLocationsData();
                  } //clear interval
                  else {
                    clearInterval(globalObject.props.App.intervalProgressLoop);
                    globalObject.props.App.intervalProgressLoop = false;
                  }
                },
                3000,
              );
            }
          } else if (response.request_status === 'inRouteToDestination') {
            globalObject.props.App.request_status = 'inRouteToDestination';
            globalObject.props.App.isInRouteToDestination = true;
            //Update destination metadata
            globalObject.props.App.destinationLocation_metadata.eta =
              response.eta; //ETA
            globalObject.props.App.destinationLocation_metadata.distance =
              response.distance; //Distance

            //Update loop request
            if (globalObject.props.App.intervalProgressLoop === false) {
              globalObject.props.App.intervalProgressLoop = setInterval(
                function () {
                  if (globalObject.props.App.isRideInProgress === true) {
                    globalObject.GPRS_resolver();
                    globalObject.updateRemoteLocationsData();
                  } //clear interval
                  else {
                    clearInterval(globalObject.props.App.intervalProgressLoop);
                    globalObject.props.App.intervalProgressLoop;
                  }
                },
                3000,
              );
            }
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
            globalObject.props.App.lastDriverCoords === null ||
            globalObject.props.App.initializedScenario !==
              response.request_status
          ) {
            globalObject.props.App.lastDriverCoords = [];
            globalObject.props.App.lastDriverCoords.push(0);
            globalObject.props.App.lastDriverCoords.push(0);
            //Initialize animation
            new Promise((resolve0) => {
              globalObject.initializeRouteNavigation(
                response,
                response.request_status,
                resolve0,
              );
            }).then(
              (reslt) => {
                if (reslt === true) {
                  new Promise((resolve1) => {
                    globalObject.animateRoute(
                      response,
                      currentPoint,
                      currentPointRm,
                      paddingFit,
                      resolve1,
                    );
                  }).then(
                    () => {},
                    () => {},
                  );
                }
              },
              () => {},
            );
          } //Animate
          else {
            new Promise((resolve2) => {
              globalObject.animateRoute(
                response,
                currentPointRm,
                currentPointRm,
                paddingFit,
                resolve2,
              );
            }).then(
              () => {},
              () => {},
            );
          }
          //...
        } else if (/pending/i.test(response.request_status)) {
          globalObject.props.App.bottomVitalsFlow.currentStep = 'mainView'; //Change current step back to mainView
          //Save the main object
          globalObject.props.App.generalTRIP_details_driverDetails = response;

          //Update loop request
          if (globalObject.props.App.intervalProgressLoop === false) {
            //Reposition the map
            if (
              globalObject.camera !== undefined &&
              globalObject.camera !== null
            ) {
              globalObject.camera.flyTo(
                response.pickupLocation_point.map(parseFloat),
                2000,
              );
              globalObject.camera.setCamera({
                centerCoordinate: response.pickupLocation_point.map(parseFloat),
                zoomLevel: 14,
                animationDuration: 1000,
              });
            }
            globalObject.props.App.intervalProgressLoop = setInterval(
              function () {
                if (globalObject.props.App.isRideInProgress === true) {
                  globalObject.GPRS_resolver();
                  globalObject.updateRemoteLocationsData();
                } //clear interval
                else {
                  clearInterval(globalObject.props.App.intervalProgressLoop);
                }
              },
              3000,
            );
          }
          //Trip pending
          if (
            globalObject.props.App.request_status !== response.request_status &&
            globalObject.props.App.pickupLocation_metadata
              .pickupLocation_name !== response.pickupLocation_name
          ) {
            //...
            if (/Searching/.test(response.pickupLocation_name)) {
              response.pickupLocation_name = 'Pickup';
            }
            //...
            globalObject.props.UpdatePendingGlobalVars({
              request_status: response.request_status,
              isRideInProgress: true,
              pickupLocation_metadata: {
                coordinates: response.pickupLocation_point,
                pickupLocation_name: response.pickupLocation_name,
              },
            });
          }
        } else if (
          response.request_status !== undefined &&
          response.request_status !== null &&
          /riderDropoffConfirmation_left/i.test(response.request_status)
        ) {
          globalObject.props.App.bottomVitalsFlow.currentStep = 'mainView'; //Change current step back to mainView
          //User drop off confirmation
          globalObject.props.App.request_status = response.request_status;
          globalObject.props.App.isRideInProgress = true;
          //Save the basic trip and driver details for drop off confirmation and rating
          //Save and update the state once - only if the data are different (handled in the reducer)
          globalObject.props.UpdateDropoffDataFor_driverRating(response);
        } else if (response.request_status === 'no_rides') {
          if (globalObject.props.App.isRideInProgress) {
            //Reset props.App
            globalObject._RESET_STATE();
          }
        }
      } //No rides
      else {
        //Update status
        //Reset the state partially depending on the state of the trip variables
        globalObject.props.App.intervalProgressLoop = false;
        let testReg = new RegExp(response.request_status, 'i');
        if (testReg.test(globalObject.props.App.request_status) === false) {
          if (globalObject.props.App.request_status !== null) {
            console.log('LEAK!');
            globalObject._RESET_STATE();
          }
          //...
          globalObject.props.App.request_status = response.request_status;
        }
      }
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
          globalObject.props.UpdateCurrentLocationMetadat(response);
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
            let newState = globalObject.props.App.bottomVitalsFlow;
            newState.rideOrDeliveryMetadata.locationTypeIdentified =
              'PrivateLocation';
            globalObject.props.UpdateBottomVitalsState({
              bottomVitalsFlow: newState,
            });
          } else if (response.locationType === 'Airport') {
            let newState = globalObject.props.App.bottomVitalsFlow;
            newState.rideOrDeliveryMetadata.locationTypeIdentified = 'Airport';
            globalObject.props.UpdateBottomVitalsState({
              bottomVitalsFlow: newState,
            });
          } //Taxi rank
          else if (response.locationType === 'TaxiRank') {
            let newState = globalObject.props.App.bottomVitalsFlow;
            newState.rideOrDeliveryMetadata.locationTypeIdentified = 'TaxiRank';
            globalObject.props.UpdateBottomVitalsState({
              bottomVitalsFlow: newState,
            });
          } else {
            let newState = globalObject.props.App.bottomVitalsFlow;
            newState.rideOrDeliveryMetadata.locationTypeIdentified =
              'PrivateLocation';
            globalObject.props.UpdateBottomVitalsState({
              bottomVitalsFlow: newState,
            });
          }
        } //Defaults to private location
        else {
          let newState = globalObject.props.App.bottomVitalsFlow;
          newState.rideOrDeliveryMetadata.locationTypeIdentified =
            'PrivateLocation';
          globalObject.props.UpdateBottomVitalsState({
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
        if (response !== false && response.response === undefined) {
          //Estimates computed
          //Convert to object
          if (typeof response === String) {
            try {
              response = JSON.parse(response);
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
                globalObject.props.App.bottomVitalsFlow.genericContainerOpacity,
                {
                  toValue: 0,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                globalObject.props.App.bottomVitalsFlow
                  .genericContainerPosition,
                {
                  toValue: 20,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {
              //Update pricing data in general state
              globalObject.props.UpdatePricingStateData(response);

              AnimatedNative.parallel([
                AnimatedNative.timing(
                  globalObject.props.App.bottomVitalsFlow
                    .genericContainerOpacity,
                  {
                    toValue: 1,
                    duration: 450,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
                AnimatedNative.timing(
                  globalObject.props.App.bottomVitalsFlow
                    .genericContainerPosition,
                  {
                    toValue: 0,
                    duration: 450,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
              ]).start(() => {
                globalObject.resetAnimationLoader();
              });
            });
          });
        } //! No valid estimates due to a problem, try again
        else {
          //Interval persister will try again after the specified timeout of the interval.
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
          globalObject.resetAnimationLoader();
          let rafinedResponse = {
            routePoints: {
              type: 'LineString',
              coordinates: response.routePoints,
            },
            eta: response.eta,
          };
          globalObject.props.UpdateRoutePreviewToDestination(rafinedResponse);
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
          globalObject.props.UpdateClosestDriversList(response);
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
          //Successfully requested
          //Leave it to the request checker
          globalObject.props.App.bottomVitalsFlow._BOOKING_REQUESTED = true; //Mark booking as requested to clear the interval
          //clear any basic interval persister
          clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
          globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
          //clear the closest drivers interval persister
          clearInterval(
            globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS,
          );
          globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
        } //An unxepected error occured
        else if (
          response !== false &&
          response.response !== undefined &&
          /already_have_a_pending_request/i.test(response.response)
        ) {
          //Do nothing
          globalObject.props.App.bottomVitalsFlow._BOOKING_REQUESTED = true; //Mark booking as requested to clear the interval
          //clear any basic interval persister
          clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
          globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
          //clear the closest drivers interval persister
          clearInterval(
            globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS,
          );
          globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
        } else {
          //clear any basic interval persister
          globalObject.props.App.bottomVitalsFlow._error_booking_requested = true;
          //clear the closest drivers interval persister
          clearInterval(
            globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS,
          );
          globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
          //Update error bottom vitals
          //Go back to previous screen
          globalObject.rerouteBookingProcessFlow(
            'previous',
            globalObject.props.App.bottomVitalsFlow.flowParent.toUpperCase(),
          );
          //Show error modal
          globalObject.props.UpdateErrorModalLog(
            true,
            'show_error_requesting_modal',
            'any',
          );
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
    if (this.backHander !== null) {
      this.backHander.remove();
    }
    //Clear the location watcher
    GeolocationP.clearWatch(this.props.App._MAIN_LOCATION_WATCHER);
    this.props.App._MAIN_LOCATION_WATCHER = null;
  }

  /**
   * @func animateRoute()
   * Responsible for animating the route basically
   */
  animateRoute(response, currentPoint, currentPointRm, paddingFit, resolve) {
    let globalObject = this;

    let carBearing = bearing(
      point([
        globalObject.props.App.lastDriverCoords[0],
        globalObject.props.App.lastDriverCoords[1],
      ]),
      point([currentPoint[0], currentPoint[1]]),
    );

    let timingRoute = 2100;

    //1. ROUTE TO PICKUP-----------------------------------------------------
    if (globalObject.props.App.isInRouteToDestination === false) {
      globalObject.props.App.shape
        .timing({
          toValue: response.routePoints,
          duration: 10,
          easing: Easing.linear,
        })
        .start(() => {
          globalObject.props.UpdateRouteToPickupVars({
            lastDriverBearing: carBearing,
            lastDriverCoords: currentPoint,
          });
        });

      globalObject.props.App.CONSIDER = true;

      globalObject.props.App.route
        .timing({
          toValue: {end: {point: currentPointRm}},
          duration: timingRoute,
          easing: Easing.linear,
        })
        .start(() => {
          //Update car infos
          if (globalObject.props.App.actPointToMinusOne === false) {
            globalObject.props.UpdateRouteToPickupVars({
              actPointToMinusOne: true,
            });
          }

          if (
            globalObject.camera !== undefined &&
            globalObject.camera != null
          ) {
            //Only recenter when the user was not centered already
            try {
              globalObject.camera.fitBounds(
                globalObject.props.App.pickupPoint,
                [currentPoint[0], currentPoint[1]],
                [90, 90, 200, 90],
                Platform.OS === 'android' ? 3500 : 1500,
              );
            } catch (error) {
              globalObject.camera.fitBounds(
                globalObject.props.App.pickupPoint,
                [currentPoint[0], currentPoint[1]],
                [90, 90, 200, 90],
                Platform.OS === 'android' ? 3500 : 1500,
              );
            }
          }
        });
      //-------------------------------------------------------------------------
      resolve(true);
    } else if (globalObject.props.App.isInRouteToDestination) {
      //2. ROUTE TO DESTINATION
      if (globalObject.props.App.actPointToMinusOne === false) {
        timingRoute = 10;
        globalObject.props.UpdateRouteToPickupVars({
          lastDriverBearing: carBearing,
          lastDriverCoords: currentPoint,
          isRideInProgress: true,
          isInRouteToDestination: true,
        });
      }

      globalObject.props.App.shapeDestination
        .timing({
          toValue: response.routePoints,
          duration: 10,
          easing: Easing.linear,
        })
        .start(() => {
          globalObject.props.UpdateRouteToPickupVars({
            lastDriverBearing: carBearing,
            lastDriverCoords: currentPoint,
          });
        });

      globalObject.props.App.CONSIDER = true;
      globalObject.props.App.routeDestination
        .timing({
          toValue: {end: {point: currentPointRm}},
          duration: timingRoute,
          easing: Easing.linear,
        })
        .start(() => {
          //Update car infos
          if (globalObject.props.App.actPointToMinusOne === false) {
            globalObject.props.UpdateRouteToPickupVars({
              actPointToMinusOne: true,
            });
          }

          if (
            globalObject.camera !== undefined &&
            globalObject.camera != null
          ) {
            //Only recenter when the user was not centered already
            try {
              globalObject.camera.fitBounds(
                [
                  globalObject.props.App.destinationPoint[0],
                  globalObject.props.App.destinationPoint[1],
                ],
                [currentPoint[0], currentPoint[1]],
                [paddingFit, paddingFit, paddingFit + 100, paddingFit],
                Platform.OS === 'android' ? 3500 : 1000,
              );
            } catch (error) {
              globalObject.camera.fitBounds(
                [
                  globalObject.props.App.destinationPoint[0],
                  globalObject.props.App.destinationPoint[1],
                ],
                [currentPoint[0], currentPoint[1]],
                [90, 90, 200, 90],
                Platform.OS === 'android' ? 3500 : 1000,
              );
            }
          }
        });
      //...
      resolve(true);
    }
  }

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
    let globalObject = this;
    if (this.props.App._MAIN_LOCATION_WATCHER === null) {
      this.props.App._MAIN_LOCATION_WATCHER = GeolocationP.watchPosition(
        (position) => {
          globalObject.props.App.latitude = position.coords.latitude;
          globalObject.props.App.longitude = position.coords.longitude;
          //---
          //Get user location
          globalObject.props.App.socket.emit('geocode-this-point', {
            latitude: globalObject.props.App.latitude,
            longitude: globalObject.props.App.longitude,
            user_fingerprint: globalObject.props.App.user_fingerprint,
          });
        },
        (error) => {
          //...
        },
        {
          enableHighAccuracy: true,
          timeout: 2000,
          maximumAge: 1000,
          distanceFilter: 3,
        },
      );
    }
  };

  /**
   * @func updateDriver_realTimeMap
   * Responsible for updating a maximum of 7 closest drivers to the rider's location based on the focused bottom vital proccess.
   */
  updateDriver_realTimeMap() {
    let globalObject = this;
    //Update the list of the closest drivers - Promisify
    let promiseClosestDrivers = new Promise((res) => {
      //Update the list of the closest drivers if no trip in progress
      if (
        globalObject.props.App.isRideInProgress === false &&
        /(mainView|selectRideOrDelivery|identifyLocation|selectConnectMeOrUs|selectNoOfPassengers|addMoreTripDetails)/i.test(
          globalObject.props.App.bottomVitalsFlow.currentStep,
        )
      ) {
        //No rides in progress
        //If a latitude, longitude, city and town are available
        if (
          globalObject.props.App.latitude !== undefined &&
          globalObject.props.App.longitude !== undefined &&
          globalObject.props.App.userCurrentLocationMetaData.city !==
            undefined &&
          globalObject.props.App.userCurrentLocationMetaData.country !==
            undefined
        ) {
          if (
            globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS ===
            null
          ) {
            //Initialize the interval if not yet set - only once
            globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = setInterval(
              function () {
                if (
                  globalObject.props.App.intervalProgressLoop === false &&
                  /(mainView|selectRideOrDelivery|identifyLocation|selectConnectMeOrUs|selectNoOfPassengers|addMoreTripDetails)/i.test(
                    globalObject.props.App.bottomVitalsFlow.currentStep,
                  )
                ) {
                  globalObject.props.App.socket.emit(
                    'get_closest_drivers_to_point',
                    {
                      org_latitude: globalObject.props.App.latitude,
                      org_longitude: globalObject.props.App.longitude,
                      user_fingerprint: globalObject.props.App.user_fingerprint,
                      city:
                        globalObject.props.App.userCurrentLocationMetaData.city,
                      country:
                        globalObject.props.App.userCurrentLocationMetaData
                          .country,
                      ride_type: 'RIDE',
                    },
                  );
                } //Kill closest drivers interval persister
                else {
                  if (
                    globalObject.props.App
                      ._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS !== null
                  ) {
                    clearInterval(
                      globalObject.props.App
                        ._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS,
                    );
                    globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
                  }
                }
              },
              globalObject.props.App
                ._TMP_INTERVAL_PERSISTER_TIME_CLOSEST_DRIVERS,
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
        if (
          globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS !==
          null
        ) {
          clearInterval(
            globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS,
          );
          globalObject.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
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
    let globalObject = this;
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
                    globalObject.camera.setCamera({
                      centerCoordinate: [
                        globalObject.props.App.longitude,
                        globalObject.props.App.latitude,
                      ],
                      zoomLevel: globalObject.props.App._NORMAL_MAP_ZOOM_LEVEL,
                      animationDuration: 700,
                    });
                  }
                  //...
                  if (
                    this.props.App._IS_MAP_INITIALIZED === false &&
                    this.props.App.gprsGlobals.hasGPRSPermissions &&
                    globalObject.props.App.latitude !== 0 &&
                    globalObject.props.App.longitude !== 0
                  ) {
                    //Initialize view
                    let timeout = setTimeout(function () {
                      globalObject.props.App._IS_MAP_INITIALIZED = true;
                      //Enable map usages : zoom, pitch, scrool and rotate
                      globalObject.props.UpdateMapUsabilityState(true);
                      //...
                      //Reset animation only if the current step is the mainView
                      if (
                        globalObject.props.App.bottomVitalsFlow.currentStep ===
                        'mainView'
                      ) {
                        globalObject.resetAnimationLoader(); //Stop the line animation
                      }
                      clearTimeout(timeout);
                    }, 400);
                  }
                }
              } //fROM RECENTER button
              else {
                //Hook recenter map state function
                this.props.App.bottomVitalsFlow.tmpVisibleBounds = false;
                globalObject.updateCenterMapButton(true);
                //...
                InteractionManager.runAfterInteractions(() => {
                  globalObject.camera.setCamera({
                    centerCoordinate: [
                      globalObject.props.App.longitude,
                      globalObject.props.App.latitude,
                    ],
                    zoomLevel: globalObject.props.App._NORMAL_MAP_ZOOM_LEVEL,
                    animationDuration: 1000,
                  });
                });
              }
            }
          }
        } //Preview of the route to destination is active
        else {
          if (
            globalObject.props.App.previewDestinationData
              .originDestinationPreviewData.routePoints !== undefined
          ) {
            //Valid point
            //Center the 2 coordinates
            let originPoint =
              globalObject.props.App.previewDestinationData
                .originDestinationPreviewData.routePoints.coordinates[0];
            let destinationPoint =
              globalObject.props.App.previewDestinationData
                .originDestinationPreviewData.routePoints.coordinates[
                globalObject.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates.length -
                  1
              ];
            if (
              this.camera !== undefined &&
              this.camera !== null &&
              this.camera != null
            ) {
              InteractionManager.runAfterInteractions(() => {
                globalObject.camera.fitBounds(
                  originPoint,
                  destinationPoint,
                  [100, 140, 40, 140],
                  Platform.OS === 'android' ? 1500 : 1000,
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
      let globalObject = this;
      //Save the coordinates in storage
      let promiseSync = new Promise((res) => {
        SyncStorage.set(
          '@userLocationPoint',
          JSON.stringify({
            latitude: globalObject.props.App.latitude,
            longitude: globalObject.props.App.longitude,
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
      let bundle = {
        latitude: this.props.App.latitude,
        longitude: this.props.App.longitude,
        user_fingerprint: this.props.App.user_fingerprint,
      };
      this.props.App.socket.emit('update-passenger-location', bundle);
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
      let globalObject = this;
      AnimatedNative.timing(this.props.App.loaderPosition, {
        toValue: this.props.App.windowWidth,
        duration: 500,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }).start(() => {
        if (globalObject.props.App.loaderBasicWidth === 1) {
          //Resize the length at the same time
          AnimatedNative.parallel([
            AnimatedNative.timing(globalObject.props.App.loaderBasicWidth, {
              toValue: 0.1,
              duration: 500,
              useNativeDriver: true,
            }),
            AnimatedNative.timing(globalObject.props.App.loaderPosition, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => {
            globalObject.fire_search_animation();
          });
        } //Length fine, just go on
        else {
          AnimatedNative.timing(globalObject.props.App.loaderPosition, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            globalObject.fire_search_animation();
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
    let globalObject = this;
    let timeout0 = setTimeout(function () {
      AnimatedNative.parallel([
        AnimatedNative.timing(
          globalObject.props.App.initialHelloAnimationParams.opacity,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          globalObject.props.App.initialHelloAnimationParams.top,
          {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          },
        ),
      ]).start(() => {
        let timeout = setTimeout(function () {
          //Close hello 1
          AnimatedNative.parallel([
            AnimatedNative.timing(
              globalObject.props.App.initialHelloAnimationParams.opacity,
              {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              },
            ),
            AnimatedNative.timing(
              globalObject.props.App.initialHelloAnimationParams.top,
              {
                toValue: 10,
                duration: 300,
                useNativeDriver: true,
              },
            ),
          ]).start(() => {
            //Start hello 2
            globalObject.props.UpdateHellosVars({initialHello: true});
            AnimatedNative.parallel([
              AnimatedNative.timing(
                globalObject.props.App.initialHelloAnimationParams.opacity2,
                {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                globalObject.props.App.initialHelloAnimationParams.top2,
                {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {
              //Replace text if GPRS is off
              if (
                globalObject.props.App.gprsGlobals.hasGPRSPermissions === false
              ) {
                //Replace hello 2 text with: Looks like you're off the map
                let gprsOffText = "Looks like you're off the map";
                if (globalObject.props.App.hello2Text !== gprsOffText) {
                  let timeout2 = setTimeout(function () {
                    globalObject.replaceHello2_text(gprsOffText);
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
    let globalObject = this;
    //Close hello 2
    AnimatedNative.parallel([
      AnimatedNative.timing(
        globalObject.props.App.initialHelloAnimationParams.opacity2,
        {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        },
      ),
      AnimatedNative.timing(
        globalObject.props.App.initialHelloAnimationParams.top2,
        {
          toValue: 10,
          duration: 300,
          useNativeDriver: true,
        },
      ),
    ]).start(() => {
      //Start hello 2
      globalObject.props.UpdateHellosVars({hello2Text: text});
      AnimatedNative.parallel([
        AnimatedNative.timing(
          globalObject.props.App.initialHelloAnimationParams.opacity2,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          globalObject.props.App.initialHelloAnimationParams.top2,
          {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          },
        ),
      ]).start();
    });
  }

  /**
   * @func resetAnimationLoader
   * Reset the line loader to the default values
   */
  resetAnimationLoader() {
    let globalObject = this;
    this.props.App.showLocationSearch_loader = false;
    AnimatedNative.timing(globalObject.props.App.loaderPosition, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      AnimatedNative.timing(globalObject.props.App.loaderBasicWidth, {
        toValue: this.props.App.windowWidth,
        duration: 3000,
        useNativeDriver: true,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
      }).start(() => {
        globalObject.props.App.showLocationSearch_loader = false;
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
    let globalObject = this;
    InteractionManager.runAfterInteractions(() => {
      //Fade to the origin content
      AnimatedNative.parallel([
        AnimatedNative.timing(
          globalObject.props.App.bottomVitalsFlow.genericContainerOpacity,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          globalObject.props.App.bottomVitalsFlow.genericContainerPosition,
          {
            toValue: 20,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
      ]).start(() => {
        //Update process flow to select ride or delivery
        globalObject.props.UpdateProcessFlowState({
          flowDirection: 'previous',
          flowParent: 'RIDE',
          parentTHIS: globalObject,
        });
        AnimatedNative.parallel([
          AnimatedNative.timing(
            globalObject.props.App.bottomVitalsFlow.bottomVitalChildHeight,
            {
              toValue: 150,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: false,
            },
          ),
          AnimatedNative.timing(
            globalObject.props.App.bottomVitalsFlow.mainHelloContentOpacity,
            {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            globalObject.props.App.bottomVitalsFlow.mainHelloContentPosition,
            {
              toValue: 0,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            globalObject.props.App.initialHelloAnimationParams.top2,
            {
              toValue: 0,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            globalObject.props.App.initialHelloAnimationParams.opacity2,
            {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
        ]).start(() => {
          globalObject.resetAnimationLoader();
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
    let globalObject = this;
    //Fade the origin content
    AnimatedNative.parallel([
      AnimatedNative.timing(
        globalObject.props.App.bottomVitalsFlow.genericContainerOpacity,
        {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        },
      ),
      AnimatedNative.timing(
        globalObject.props.App.bottomVitalsFlow.genericContainerPosition,
        {
          toValue: 20,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        },
      ),
    ]).start(() => {
      //Update process flow to select ride or delivery
      globalObject.props.UpdateProcessFlowState({
        flowDirection: flowDirection,
        flowParent: flowParent,
        parentTHIS: globalObject,
        connectType: connectType,
      });

      AnimatedNative.parallel([
        AnimatedNative.timing(
          globalObject.props.App.bottomVitalsFlow.genericContainerOpacity,
          {
            toValue: 1,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          globalObject.props.App.bottomVitalsFlow.genericContainerPosition,
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
      this.fire_search_animation();
      //Check if a custom pickup location was specified
      //Point to current location by default
      let org_latitude = this.props.App.latitude;
      let org_longitude = this.props.App.longitude;
      //Check forr custom pickup
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
      }
      if (/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)) {
        //RIDE PRICING
        //Only if results was empty
        //Prod data input
        let pricingInputDataRaw = {
          user_fingerprint: this.props.App.user_fingerprint,
          connectType: this.props.App.bottomVitalsFlow.connectType,
          country: this.props.App.userCurrentLocationMetaData.country,
          isAllGoingToSameDestination: this.props.App.bottomVitalsFlow
            .rideOrDeliveryMetadata.isAllgoingToTheSamePlace,
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
      } else if (/DELIVERY/i.test(this.props.App.bottomVitalsFlow.flowParent)) {
        //DEBUG
        //this.resetAnimationLoader();
        //DEBUG---
        //DELIVERY PRICING
        //Prod data input
        let pricingInputDataRaw = {
          user_fingerprint: this.props.App.user_fingerprint,
          connectType: 'ConnectUs',
          country: this.props.App.userCurrentLocationMetaData.country,
          isAllGoingToSameDestination: false,
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

        let globalObject = this;
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
            globalObject.props.UpdateSchedulerState({
              scheduledScenarioContextHeader: context,
            });
            //Fade in now header
            AnimatedNative.parallel([
              AnimatedNative.timing(
                globalObject.props.App.scheduledScreenHeaderNowOpacity,
                {
                  toValue: 1,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                globalObject.props.App.scheduledScreenHeaderNowPosition,
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
            globalObject.props.UpdateSchedulerState({
              scheduledScenarioContextHeader: context,
            });
            //Fade in now header
            AnimatedNative.parallel([
              AnimatedNative.timing(
                globalObject.props.App.scheduledScreenHeaderNowOpacity,
                {
                  toValue: 1,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                globalObject.props.App.scheduledScreenHeaderNowPosition,
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
              globalObject.props.UpdateSchedulerState({
                scheduledScenarioContextHeader: context,
              });
              //Fade in error header
              AnimatedNative.parallel([
                AnimatedNative.timing(
                  globalObject.props.App
                    .scheduledScreenHeaderFutureTimeNotSetOpacity,
                  {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
                AnimatedNative.timing(
                  globalObject.props.App
                    .scheduledScreenHeaderFutureTimeNotSetPosition,
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
                  globalObject.reallocateScheduleContextCheck('nowaftererror');
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
              globalObject.props.UpdateSchedulerState({
                scheduledScenarioContextHeader: context,
              });
              //Fade in now header
              AnimatedNative.parallel([
                AnimatedNative.timing(
                  globalObject.props.App
                    .scheduledScreenHeaderFutureTimeNotSetOpacity,
                  {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
                AnimatedNative.timing(
                  globalObject.props.App
                    .scheduledScreenHeaderFutureTimeNotSetPosition,
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
                  globalObject.reallocateScheduleContextCheck('nowaftererror');
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
            globalObject.props.UpdateSchedulerState({
              scheduledScenarioContextHeader: context,
            });
            //Fade in today or tomorrow header
            AnimatedNative.parallel([
              AnimatedNative.timing(
                globalObject.props.App.scheduledScreenHeaderNotNowOpacity,
                {
                  toValue: 1,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                globalObject.props.App.scheduledScreenHeaderNotNowPosition,
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
                  fontSize: 17.5,
                  color: '#fff',
                  lineHeight: 20,
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'Allrounder-Grotesk-Book'
                      : 'Allrounder Grotesk Book',
                },
              ]}>
              Your location services need to be enabled for a better experience.
            </Text>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'Allrounder-Grotesk-Medium'
                    : 'Allrounder Grotesk Medium',
                fontSize: 17,
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
            <IconAnt name="arrowright" color={'#fff'} size={20} />
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
      let globalObject = this;
      if (this.props.App.isRideInProgress === false) {
        const visibleBounds = await this._map.getVisibleBounds();
        //SHow recenter button only
        if (this.props.App.bottomVitalsFlow.tmpVisibleBounds === false) {
          //Not initialized yet
          this.props.App.bottomVitalsFlow.tmpVisibleBounds =
            JSON.stringify(visibleBounds) + 'false'; //Update the temp visible bounds - semi initialize
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
              globalObject.props.UpdateMapUsabilityState({
                isRecentered: true,
              });
            });
          }
        } else {
          if (/false/.test(this.props.App.bottomVitalsFlow.tmpVisibleBounds)) {
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
                  globalObject.props.UpdateMapUsabilityState({
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
                    duration: 150,
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
                    systemWeights.light,
                    {fontSize: 20, color: '#fff', marginBottom: 40},
                  ]}>
                  {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                    ? 'Getting a Taxi for you'
                    : 'Requesting for your delivery'}
                </Text>
                <View style={{width: '100%'}}>
                  <AnimatedNative.View
                    style={[
                      styles.loader,
                      // eslint-disable-next-line react-native/no-inline-styles
                      {
                        borderTopColor: '#fff',
                        transform: [
                          {
                            translateX: this.props.App.loaderPosition,
                          },
                          {
                            scaleX: this.props.App.loaderBasicWidth,
                          },
                        ],
                      },
                    ]}
                  />
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
              top: 20,
              left: 20,
            }}>
            <TouchableOpacity
              onPress={() => this.props.navigation.openDrawer()}
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
            top: 20,
            left: 20,
          }}>
          {this.props.App.bottomVitalsFlow.canGoBack &&
          this.props.App.bottomVitalsFlow.currentStep !==
            'gettingRideProcessScreen' ? (
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
          <RenderBottomVital parentNode={this} />
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
      InRouteToDestinationInitVars,
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
