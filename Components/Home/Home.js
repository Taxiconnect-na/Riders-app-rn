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
} from 'react-native';
import bearing from '@turf/bearing';
import {systemWeights} from 'react-native-typography';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
//import this.props.App.carIcon from './caradvanced.png';      //Option 1
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFeather from 'react-native-vector-icons/Feather';
import ErrorModal from '../Helpers/ErrorModal';
import NetInfo from '@react-native-community/netinfo';
import Search from '../Modules/Search/Components/Search';
import SyncStorage from 'sync-storage';
//Import of action creators
import {
  ResetStateProps,
  UpdateGrantedGRPS,
  UpdatePendingGlobalVars,
  UpdateRouteToPickupVars,
  InRouteToPickupInitVars,
  InRouteToDestinationInitVars,
  UpdateTinyCarOnMapIconSize,
  UpdateHellosVars,
  UpdateSchedulerState,
  UpdateCustomFareState,
  UpdateBottomVitalsState,
  UpdateProcessFlowState,
  UpdateMapUsabilityState,
  UpdateRideTypesScales,
  UpdateCurrentLocationMetadat,
  UpdateNumberOfPassengersSelected,
  UpdateAdditionalPickupNote,
  UpdateRideTypesOnScrollCategories,
  UpdatePricingStateData,
  UpdateRoutePreviewToDestination,
  UpdateDeliveryPackageSize,
  UpdateRiderOrPackagePossesserSwitcher,
  ValidateReceiverInfosForDelivery,
  UpdateErrorMessagesStateInputRecDelivery,
  UpdateReceiverNameOnType,
  UpdateClosestDriversList,
  UpdateErrorBottomVitals,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';
import RenderBottomVital from './RenderBottomVital';
import RenderMainMapView from './RenderMainMapView';
//DEBUG
//import {ROUTE} from './Route';

//Origin coords - driver
//const blon = 17.099327;
//const blat = -22.579195;
const blon = 17.060507;
const blat = -22.514987;
//Destination coords
const destinationLat = -22.577673;
const destinationLon = 17.086427;

const INIT_ZOOM_LEVEL = 0.384695086717085;
const PADDING_LIMIT = 150;

//Greetings dictionnary

class Home extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      networkStateChecker: false,
    };
  }

  _RESET_STATE() {
    this.props.ResetStateProps();
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
   * @func requestGPSPermission()
   * Responsible for getting the permission to the GPRS location for the user and
   * lock them from useing the app without the proper GPRS permissions.
   *
   */
  async requestGPSPermission(activateRest = true) {
    let globalObject = this;
    if (this.props.App.gprsGlobals.didAskForGprs === false) {
      this.props.App.gprsGlobals.didAskForGprs = true;
      //Ask only once at start
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'TaxiConnect needs access to your location',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          if (activateRest) {
            globalObject.getCurrentPositionCusto();
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
                globalObject.recalibrateMap();
              },
              () => {
                // See error code charts below.
                //Launch recalibration
                globalObject.recalibrateMap();
              },
              {enableHighAccuracy: true, timeout: 10000, maximumAge: 3000},
            );
            globalObject.props.App.isMapPermitted = true;
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
                globalObject.recalibrateMap();
              },
              () => {},
              {enableHighAccuracy: true, timeout: 10000, maximumAge: 3000},
            );
          }
        } else {
          console.log('GPS permission denied');
          //Permission denied, update gprs global vars and lock the platform
          let newStateVars = {};
          newStateVars.hasGPRSPermissions = false;
          newStateVars.didAskForGprs = true;
          globalObject.props.UpdateGrantedGRPS(newStateVars);
        }
      } catch (err) {
        //console.warn(err);
        //Permission denied, update gprs global vars and lock the platform
        let newStateVars = {};
        newStateVars.hasGPRSPermissions = false;
        newStateVars.didAskForGprs = true;
        globalObject.props.UpdateGrantedGRPS(newStateVars);
        //Close loading animation
        globalObject.resetAnimationLoader();
      }
    } //Lock the interface
    else {
      //Check if the permission was given or not
      if (this.props.App.gprsGlobals.hasGPRSPermissions) {
        //Has the GPRS permissions
        let newStateVars = {};
        newStateVars.hasGPRSPermissions = true;
        newStateVars.didAskForGprs = true;
        globalObject.props.UpdateGrantedGRPS(newStateVars);
        //Launch recalibration
        globalObject.recalibrateMap();
      } //No permissions
      else {
        //Permission denied, update gprs global vars and lock the platform
        let newStateVars = {};
        newStateVars.hasGPRSPermissions = false;
        newStateVars.didAskForGprs = true;
        globalObject.props.UpdateGrantedGRPS(newStateVars);
        //Close loading animation
        globalObject.resetAnimationLoader();
      }
    }
  }

  async componentDidMount() {
    //Check for the user_fp
    await SyncStorage.init();
    let user_fp = SyncStorage.get('@ufp');
    if (
      user_fp !== undefined &&
      user_fp !== null &&
      user_fp !== false &&
      user_fp.length > 50
    ) {
      //Valid
      this.props.App.user_fingerprint = user_fp;
    } //Invalid user fp - back to home
    else {
      this.props.navigation.navigate('EntryScreen');
    }

    this.requestGPSPermission();
    let globalObject = this;

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
        /(show_modalMore_tripDetails|show_rating_driver_modal)/i.test(
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
      /**
       * active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
          error_status={
            this.props.App.generalErrorModal_vars.generalErrorModalType
          }
       */
      if (
        /(show_modalMore_tripDetails|show_rating_driver_modal|show_cancel_ride_modal)/i.test(
          globalObject.props.App.generalErrorModalType,
        ) !== true
      ) {
        if (
          globalObject.props.App.generalErrorModal_vars
            .showErrorGeneralModal === false ||
          /service_unavailable/i.test(
            globalObject.props.App.generalErrorModal_vars.generalErrorModalType,
          ) === false
        ) {
          //console.log('updatinnnnnn leak');
          /*globalObject.props.UpdateErrorModalLog(
            true,
            'service_unavailable',
            'any',
          );*/
        }
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

    /**
     * Bind the request interval
     * Responsible for creating ONCE the interval fetcher for all rides related infos.
     */
    if (this.props.App._TMP_TRIP_INTERVAL_PERSISTER === null) {
      this.props.App._TMP_TRIP_INTERVAL_PERSISTER = setInterval(function () {
        //...
        if (globalObject.props.App.intervalProgressLoop === false) {
          globalObject.updateRemoteLocationsData();
        } //Kill the persister
        else {
          clearInterval(
            globalObject.props.App._TMP_TRIP_INTERVAL_PERSISTER_TIME,
          );
          if (
            globalObject.props.App._TMP_TRIP_INTERVAL_PERSISTER_TIME !== null
          ) {
            globalObject.props.App._TMP_TRIP_INTERVAL_PERSISTER_TIME = null;
          }
        }
      }, this.props.App._TMP_TRIP_INTERVAL_PERSISTER_TIME);
    }

    /**
     * @socket 'trackdriverroute-response
     * Get route tracker response
     * Responsible for redirecting updates to map graphics data based on if the status of the request is: pending, in route to pickup, in route to drop off or completed
     */
    this.props.App.socket.on('trackdriverroute-response', function (response) {
      if (
        response !== null &&
        response !== undefined &&
        /no_rides/i.test(response.request_status) === false
      ) {
        //1. Trip in progress: in route to pickup or in route to drop off
        if (
          response.response === undefined &&
          response.routePoints !== undefined &&
          response.request_status !== 'pending'
        ) {
          //Save the driver's details - car details - and Static ETA to destination info
          globalObject.props.App.generalTRIP_details_driverDetails = {
            eta: response.eta,
            ETA_toDestination: response.ETA_toDestination,
            driverDetails: response.driverDetails,
            carDetails: response.carDetails,
            basicTripDetails: response.basicTripDetails,
          }; //Very important

          //Update route to destination var - request status: inRouteToPickup, inRouteToDestination
          if (response.request_status === 'inRouteToPickup') {
            globalObject.props.App.isInRouteToDestination = false;
            globalObject.props.App.request_status = 'inRouteToPickup';

            //Update loop request
            if (globalObject.props.App.intervalProgressLoop === false) {
              globalObject.props.App.intervalProgressLoop = setInterval(
                function () {
                  if (globalObject.props.App.isRideInProgress === true) {
                    console.log('Interval running.');
                    globalObject.updateRemoteLocationsData();
                  } //clear interval
                  else {
                    clearInterval(globalObject.props.App.intervalProgressLoop);
                  }
                },
                5000,
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
                    console.log('Interval running.');
                    globalObject.updateRemoteLocationsData();
                  } //clear interval
                  else {
                    clearInterval(globalObject.props.App.intervalProgressLoop);
                  }
                },
                5000,
              );
            }
          }
          //----------------------------------------------------------------------------------------

          //----------------------------------------------------------------------------------------
          /* let paddingFit = 100 * (20 / response.routePoints.length);
          //paddingFit += 7;
          paddingFit =
            paddingFit -
            Math.round((paddingFit / PADDING_LIMIT - 1) * PADDING_LIMIT);
          if (paddingFit > PADDING_LIMIT) {
            //paddingFit = PADDING_LIMIT;
          }*/
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
        } else if (response.request_status === 'pending') {
          //Save the main object
          globalObject.props.App.generalTRIP_details_driverDetails = response;
          //Reposition the map
          if (
            globalObject.camera !== undefined &&
            globalObject.camera !== null
          ) {
            globalObject.camera.flyTo(response.pickupLocation_point, 2000);
            /*globalObject.camera.fitBounds(
              response.pickupLocation_point,
              40,
              1000,
            );*/
          }
          //Update loop request
          if (globalObject.props.App.intervalProgressLoop === false) {
            globalObject.props.App.intervalProgressLoop = setInterval(
              function () {
                if (globalObject.props.App.isRideInProgress === true) {
                  console.log('Interval running.');
                  globalObject.updateRemoteLocationsData();
                } //clear interval
                else {
                  clearInterval(globalObject.props.App.intervalProgressLoop);
                }
              },
              5000,
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
          //User drop off confirmation
          globalObject.props.App.request_status = response.request_status;
          globalObject.props.App.isRideInProgress = true;
          //Save the basic trip and driver details for drop off confirmation and rating
          //Save and update the state once - only if the data are different
          if (
            globalObject.props.App.generalTRIP_details_driverDetails !==
              undefined &&
            globalObject.props.App.generalTRIP_details_driverDetails !==
              false &&
            globalObject.props.App.generalTRIP_details_driverDetails !== null &&
            JSON.stringify(
              globalObject.props.App.generalTRIP_details_driverDetails,
            ) !== JSON.stringify({})
          ) {
            //Update if necessary
            if (
              globalObject.props.App.generalTRIP_details_driverDetails
                .trip_details === undefined &&
              globalObject.props.App.generalTRIP_details_driverDetails
                .trip_details.request_fp === undefined
            ) {
              globalObject.props.App.generalTRIP_details_driverDetails = response;
              globalObject.forceUpdate();
            } else if (
              globalObject.props.App.generalTRIP_details_driverDetails
                .trip_details.request_fp !== undefined &&
              globalObject.props.App.generalTRIP_details_driverDetails
                .trip_details.request_fp !== response.trip_details.request_fp
            ) {
              globalObject.props.App.generalTRIP_details_driverDetails = response;
              globalObject.forceUpdate();
            }
          } //Initialize
          else {
            globalObject.props.App.generalTRIP_details_driverDetails = response;
            globalObject.forceUpdate();
          }
        } else if (response.request_status === 'no_rides') {
          if (globalObject.props.App.isRideInProgress) {
            //Reset props.App
            globalObject._RESET_STATE();
          }
        }
      } //No rides
      else {
        //Update status
        globalObject.props.App.request_status = response.request_status;
        //Reset the state partially depending on the state of the trip variables
        if (
          globalObject.props.App.isRideInProgress !== false ||
          /no_rides/i.test(globalObject.props.App.request_status) === false ||
          Object.keys(globalObject.props.App.generalTRIP_details_driverDetails)
            .length !== 0
        ) {
          console.log('LEAK!');
          globalObject._RESET_STATE();
        }
      }
    });

    //Get route snapshot for to driver
    /*this.props.App.socket.on('getIteinerayDestinationInfos-response', function (
      response,
    ) {
      if (
        response.response === undefined &&
        response.routePoints !== undefined &&
        response.destinationData !== null &&
        response.destinationData !== undefined
      ) {
        //Initialize animation components
        const route = new Animated.RouteCoordinatesArray(response.routePoints);
        const routeShape = new Animated.CoordinatesArray(response.routePoints);
        //Initialize animation components for destination route
        const routeDestination = new Animated.RouteCoordinatesArray(
          response.destinationData.routePoints,
        );
        const routeShapeDestination = new Animated.CoordinatesArray(
          response.destinationData.routePoints,
        );
        //----
        if (globalObject.camera !== undefined && globalObject.camera != null) {
          globalObject.camera.fitBounds(
            [globalObject.props.App.longitude, globalObject.props.App.latitude],
            [response.driverNextPoint[0], response.driverNextPoint[1]],
            70,
            2000,
          );
        }

        globalObject.setState({
          route: route,
          shape: routeShape,
          //actPoint: new Animated.ExtractCoordinateFromArray(routeShape, 0), //Linked to shape
          actPoint: new Animated.ExtractCoordinateFromArray(route, -1), //Independent from shape
          actPointToMinusOne: false,
          routeCoordsPickup: response.routePoints, //To pickup
          routeCoordsDestination: response.destinationData.routePoints, //To destination
          lastDriverCoords: [
            response.driverNextPoint[0],
            response.driverNextPoint[1],
          ],
          isRideInProgress: true,
          routeDestination: routeDestination,
          shapeDestination: routeShapeDestination,
          actPointDestination: new Animated.ExtractCoordinateFromArray(
            routeDestination,
            -1,
          ), //Independent from shape
          destinationPoint: response.destinationData.destinationPoint, //Destination coords
        });

        //globalObject.startAnimateRoutePickup();*/

    //Get driver's next point
    /*let currentPoint = response.driverNextPoint;
        let currentPointRm = point(currentPoint);

        globalObject.props.App.shape
          .timing({
            toValue: response.routePoints,
            duration: 300,
            easing: Easing.linear,
          })
          .start(() => {
            if (
              globalObject.camera !== undefined &&
              globalObject.camera != null
            ) {
              globalObject.camera.fitBounds(
                [lon, lat],
                [currentPoint[0], currentPoint[1]],
                70,
                2000,
              );
            }
          });

        globalObject.props.App.route
          .timing({
            toValue: {end: {point: currentPointRm}},
            duration: 2500,
            easing: Easing.linear,
          })
          .start(() => {}); //Excluded *
      }
    });*/

    /**
     * GET GEOCODED USER LOCATION
     * event: geocode-this-point
     * Get the location of the user, parameter of interest: street name
     */
    this.props.App.socket.on(
      'geocode-this-point-response',
      function (response) {
        if (response !== undefined && response !== false) {
          let localData = globalObject.props.App.userCurrentLocationMetaData;
          //Only update if new metadata
          if (localData.city !== undefined) {
            let checkDataSim =
              response.city === localData.city &&
              response.street === localData.street &&
              response.state === localData.state;

            if (checkDataSim === false) {
              globalObject.props.UpdateCurrentLocationMetadat(response);
            }
          } //Empty local data
          else {
            globalObject.props.UpdateCurrentLocationMetadat(response);
          }
        }
      },
    );

    /**
     * IDENTIFY PICKUP LOCATION
     * event: getPickupLocationNature
     * Responsible for identifying whether the user is standing at a taxi rank or a private location.
     * Possible types
     * Airport
     * TaxiRank     //private location
     * PrivateLocation  //Private location
     */
    this.props.App.socket.on(
      'getPickupLocationNature-response',
      function (response) {
        if (response !== undefined) {
          //globalObject.resetAnimationLoader();
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
          //newState.rideOrDeliveryMetadata.locationTypeIdentified = 'TaxiRank';
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
     * event: getPricingForRideorDelivery
     * Responsible for getting the list of fare estimates based on the user-selected parameters
     * from the pricing service.
     * If invalid fare received, try again.
     */
    this.props.App.socket.on(
      'getPricingForRideorDelivery-response',
      function (response) {
        if (response !== false && response.response === undefined) {
          globalObject.resetAnimationLoader();
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
              globalObject.props.App.bottomVitalsFlow.genericContainerPosition,
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
                globalObject.props.App.bottomVitalsFlow.genericContainerOpacity,
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
            ]).start();
          });
        } //No valid estimates due to a problem, try again
        else {
          globalObject.getFareEstimation();
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
     * event: get_closest_drivers_to_point
     * Responsible for updating the live closest drivers on the map, maximum of 7
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
     * event: requestRideOrDeliveryForThis
     * Responsible for handling the request ride or wallet response after booking
     * to know whether the request was successfully dispatched or not.
     */
    //Remove snapshot data
    this.props.App.previewDestinationData.originDestinationPreviewData = false;
    //...
    this.props.App.socket.on(
      'requestRideOrDeliveryForThis',
      function (response) {
        if (
          response !== false &&
          response.response !== undefined &&
          /successfully_requested/i.test(response.response)
        ) {
          //Successfully requested
          //Leave it to the request checker
        } //An unxepected error occured
        else {
          //Update error bottom vitals
          globalObject.props.UpdateErrorBottomVitals(
            'Sorry we were unable to make the request due to an unexpected error, please try again.',
          );
        }
      },
    );
  }

  componentWillUnmount() {
    //Remove the network state listener
    if (this.state.networkStateChecker !== false) {
      this.state.networkStateChecker();
    }
    //Remove any kind of interval fetcher
    if (this.props.App._TMP_TRIP_INTERVAL_PERSISTER !== null) {
      clearInterval(this.props.App._TMP_TRIP_INTERVAL_PERSISTER);
    }
    //...
    if (this.props.App._TMP_INTERVAL_PERSISTER !== null) {
      clearInterval(this.props.App._TMP_INTERVAL_PERSISTER);
    }
    //...
    if (this.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS !== null) {
      clearInterval(this.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS);
    }
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
            try {
              globalObject.camera.fitBounds(
                globalObject.props.App.pickupPoint,
                [currentPoint[0], currentPoint[1]],
                90,
                3500,
              );
            } catch (error) {
              globalObject.camera.fitBounds(
                globalObject.props.App.pickupPoint,
                [currentPoint[0], currentPoint[1]],
                90,
                3500,
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
            try {
              globalObject.camera.fitBounds(
                [
                  globalObject.props.App.destinationPoint[0],
                  globalObject.props.App.destinationPoint[1],
                ],
                [currentPoint[0], currentPoint[1]],
                paddingFit,
                3500,
              );
            } catch (error) {
              globalObject.camera.fitBounds(
                [
                  globalObject.props.App.destinationPoint[0],
                  globalObject.props.App.destinationPoint[1],
                ],
                [currentPoint[0], currentPoint[1]],
                90,
                3500,
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
        //Update initialized scenari memory
        this.props.App.initializedScenario = tripScenario;
        if (this.camera !== undefined && this.camera != null) {
          this.camera.fitBounds(
            response.pickupPoint,
            [response.driverNextPoint[0], response.driverNextPoint[1]],
            70,
            2000,
          );
        }
        //Update state
        this.props.InRouteToPickupInitVars(response);
        //globalObject.startAnimateRoutePickup();
        resolve(true);
      } else if (tripScenario === 'inRouteToDestination') {
        //Update initialized scenario memory
        this.props.App.initializedScenario = tripScenario;
        //----
        if (this.camera !== undefined && this.camera != null) {
          this.camera.fitBounds(
            //[this.props.App.longitude, this.props.App.latitude],
            response.destinationPoint,
            [response.driverNextPoint[0], response.driverNextPoint[1]],
            70,
            2000,
          );
        }
        //...
        this.props.InRouteToDestinationInitVars(response);
        //globalObject.startAnimateRoutePickup();
        resolve(true);
      }
    } else {
      resolve(false);
    }
  }

  _updateUserLocation = () => {
    var globalObject = this;
    GeolocationP.getCurrentPosition(
      (position) => {
        globalObject.props.App.latitude = position.coords.latitude;
        globalObject.props.App.longitude = position.coords.longitude;
        //globalObject.recalibrateMap();
      },
      () => {
        /*console.log(error)*/
      },
      {
        enableHighAccuracy: true,
        timeout: 10,
        maximumAge: 1000,
        distanceFilter: 3,
      },
    );
  };

  componentDidUpdate() {
    this.getCurrentPositionCusto;
  }

  /**
   * @func getCurrentPositionCusto()
   * void
   * Get the current GPRS positions of the user
   */

  getCurrentPositionCusto = () => {
    let globalObject = this;
    GeolocationP.getCurrentPosition(
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
        //Update the list of the closest drivers if no trip in progress
        if (
          globalObject.props.App.isRideInProgress === false &&
          /mainView/i.test(globalObject.props.App.bottomVitalsFlow.currentStep)
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
                },
                globalObject.props.App
                  ._TMP_INTERVAL_PERSISTER_TIME_CLOSEST_DRIVERS,
              );
            }
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
          }
        }
      },
      () => {
        //...
      },
      {
        timeout: 10,
        maximumAge: 1000,
        distanceFilter: 3,
        enableHighAccuracy: true,
      },
    );
  };

  /**
   * @func recalibrateMap()
   * @param fromRecenterButton: to know whether to stop the current animation or not depending on what invoked the action. - default: false
   * Responsible for replacing the camera to the user's current location on the map
   */
  recalibrateMap(fromRecenterButton = false) {
    let globalObject = this;

    if (this.props.App.gprsGlobals.hasGPRSPermissions) {
      //Get user location
      this.props.App.socket.emit('geocode-this-point', {
        latitude: this.props.App.latitude,
        longitude: this.props.App.longitude,
        user_fingerprint: globalObject.props.App.user_fingerprint,
      });

      //Avoid updating map when entering receiver's details and package size (DELIVERY)
      if (
        this.props.App.bottomVitalsFlow.currentStep !==
          'inputReceiverInformations' &&
        this.props.App.bottomVitalsFlow.currentStep !== 'selectPackageSize'
      ) {
        if (
          this.props.App.previewDestinationData.originDestinationPreviewData ===
          false
        ) {
          //If the preview of the route to destination is off
          //Only when a gprs permission is granted
          if (
            this.camera !== undefined &&
            this.camera !== null &&
            this.camera != null
          ) {
            if (this.props.App.isRideInProgress === false) {
              if (fromRecenterButton === false) {
                if (
                  this.props.App.latitude != null &&
                  this.props.App.longitude != null
                ) {
                  if (this.props.App.intervalProgressLoop === false) {
                    this.updateRemoteLocationsData();
                  }
                  this.camera.setCamera({
                    zoomLevel: INIT_ZOOM_LEVEL,
                  });
                  if (
                    this.props.App._IS_MAP_INITIALIZED === false &&
                    this.props.App.gprsGlobals.hasGPRSPermissions &&
                    globalObject.props.App.latitude !== 0 &&
                    globalObject.props.App.longitude !== 0
                  ) {
                    //Initialize view
                    let timeout = setTimeout(function () {
                      globalObject.camera.setCamera({
                        centerCoordinate: [
                          globalObject.props.App.longitude,
                          globalObject.props.App.latitude,
                        ],
                        zoomLevel: 14,
                        animationDuration: 2000,
                      });
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
                    }, 2000);
                  }
                  /*this.camera.setCamera({
                  centerCoordinate: [this.props.App.longitude, this.props.App.latitude],
                  zoomLevel: INIT_ZOOM_LEVEL,
                });
                this.camera.moveTo([this.props.App.longitude, this.props.App.latitude], 200);*/
                  //this.camera.flyTo([this.props.App.longitude, this.props.App.latitude], 2000);
                }
              } //fROM RECENTER button
              else {
                //Hook recenter map state function
                this.props.App.bottomVitalsFlow.tmpVisibleBounds = false;
                globalObject.updateCenterMapButton(true);
                //...
                globalObject.camera.setCamera({
                  centerCoordinate: [
                    globalObject.props.App.longitude,
                    globalObject.props.App.latitude,
                  ],
                  zoomLevel: 14,
                  animationDuration: 1200,
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
              globalObject.camera.fitBounds(
                originPoint,
                destinationPoint,
                [100, 140, 40, 140],
                3500,
              );
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
      let bundle = {
        latitude: this.props.App.latitude,
        longitude: this.props.App.longitude,
        user_fingerprint: this.props.App.user_fingerprint,
      };
      this.props.App.socket.emit('update-passenger-location', bundle);
      //this.getFareEstimation(); //DEBUG
    }
  }

  /**
   * @func getItinarySnapshot()
   * Start animation stimulus - get initial route informations for
   * clear visualization of the driver's position and the destination
   */
  getItinarySnapshot() {
    //Get the generl route detail - coordinates
    //Bundle passenger and driver point
    let bundle = {
      driver: {latitude: blat, longitude: blon},
      passenger: {
        latitude: this.props.App.latitude,
        longitude: this.props.App.longitude,
      },
      destination: {
        latitude: destinationLat,
        longitude: destinationLon,
      },
    };
    //Get infos from server
    this.props.App.socket.emit('getIteinerayDestinationInfos', bundle);
  }

  /**
   * ANIMATIONS' FUNCTIONS
   * ONLY USE ANIMATION WITH NATIVE DRIVER ENABLED. - Make a way.
   */
  //1. Loader animation - init or during an operation
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
   * 2. Greeting animation - init and after init
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
    /*AnimatedNative.parallel([
      AnimatedNative.timing(globalObject.props.App.loaderPosition, {
        toValue: 0,
        duration: 500,
        //easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }),
      AnimatedNative.timing(globalObject.props.App.loaderBasicWidth, {
        toValue: this.props.App.windowWidth,
        duration: 3000,
        useNativeDriver: true,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
      }),
    ]).start(() => {
      globalObject.props.App.showLocationSearch_loader = false;
    });*/
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
   * @func rideTypeToSchedulerTransistor()
   * @param isSchedulerOnVal: value of the props.App value isSelectTripScheduleOn
   * true: will transition to show the scheduler
   * false: will transition to show the select ride type
   * Responsible for transitionaing the view from the ride type to the scheduler and vice versa
   * and all the animations in between based on which view is currently active.
   * REFERENCE
   * titleSelectRideOpacity: new AnimatedNative.Value(1), //Opacity of the header when select ride is active - default: 0
   * titleSelectRidePosition: new AnimatedNative.Value(0), //Left offset position of the header when select ride is active - default : 10
   * selectRideContentOpacity: new AnimatedNative.Value(1), //Opacity of the content holder when select ride is active - default 0
   * selectRideContentPosition: new AnimatedNative.Value(0), //Top offset position of the content holder when select ride is active - default 20
   * //---
   * titleSchedulerSelectRideOpacity: new AnimatedNative.Value(0), //Opacity of the header when schedule ride is active - default: 0
   * titleSchedulerSelectRidePostion: new AnimatedNative.Value(10), //Left offset position of the header when schedule is active - default : 10
   * scheduleRideContentOpacity: new AnimatedNative.Value(0), //Opacity of the content holder when schedule ride is active - default 0
   * scheduleRideContentPosition: new AnimatedNative.Value(20), //Top offset position of the content holder when schedule ride is active - default 20
   */
  rideTypeToSchedulerTransistor(isSchedulerOnVal) {
    //Work if only props.App value changes
    let globalObject = this;
    if (isSchedulerOnVal === this.props.App.isSelectTripScheduleOn) {
      return; //Cancel repetition to avoid execessive props.App update
    }
    //...
    if (isSchedulerOnVal !== true) {
      //this.props.App.isSelectTripScheduleOn = isSchedulerOnVal;
      //Reinforce the scheduled context
      if (this.props.App.selectedScheduleTime !== 'now') {
        this.props.App.scheduledScenarioContextHeader = this.props.App.scheduledScenarioContext;
        this.props.App.scheduledScreenHeaderNotNowOpacity = new AnimatedNative.Value(
          1,
        );
        this.props.App.scheduledScreenHeaderNotNowPosition = new AnimatedNative.Value(
          0,
        );
      } else {
        this.props.App.scheduledScenarioContext = 'now';
        this.props.App.scheduledScenarioContextHeader = 'now';
      }
      //Scheduler currently active
      //Fade in the select ride
      AnimatedNative.parallel([
        AnimatedNative.timing(this.props.App.titleSchedulerSelectRideOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.titleSchedulerSelectRidePostion, {
          toValue: 10,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scheduleRideContentOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scheduleRideContentPosition, {
          toValue: 20,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObject.props.App.isSelectTripScheduleOn = isSchedulerOnVal;
        globalObject.forceUpdate(); //To refresh the new UI elements containing the select ride view
        //Restore the current scroll level of the select ride scrollview
        setTimeout(() => {
          globalObject.scrollViewSelectRideRef.scrollTo({
            x:
              globalObject.props.App.windowWidth *
              globalObject.props.App.headerRideTypesVars.currentHeaderIndex,
            y: 0,
            animated: true,
          });
        }, 1);

        //...
        //Fade away the  scheduler -> select ride
        AnimatedNative.parallel([
          AnimatedNative.timing(globalObject.props.App.titleSelectRideOpacity, {
            toValue: 1,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          }),
          AnimatedNative.timing(
            globalObject.props.App.titleSelectRidePosition,
            {
              toValue: 0,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            globalObject.props.App.selectRideContentOpacity,
            {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            globalObject.props.App.selectRideContentPosition,
            {
              toValue: 0,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
        ]).start();
      });
    } //Select ride type currently active
    else {
      //Fade away the select ride -> scheduler
      AnimatedNative.parallel([
        AnimatedNative.timing(this.props.App.titleSelectRideOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.titleSelectRidePosition, {
          toValue: 10,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.selectRideContentOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.selectRideContentPosition, {
          toValue: 20,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObject.props.App.isSelectTripScheduleOn = isSchedulerOnVal;
        globalObject.forceUpdate(); //To refresh the new UI elements containing the scheduler view
        //Fade in the scheduler
        AnimatedNative.parallel([
          AnimatedNative.timing(
            globalObject.props.App.titleSchedulerSelectRideOpacity,
            {
              toValue: 1,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            globalObject.props.App.titleSchedulerSelectRidePostion,
            {
              toValue: 0,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            globalObject.props.App.scheduleRideContentOpacity,
            {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            globalObject.props.App.scheduleRideContentPosition,
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
   * @func handleChooseCarType()
   * @params carType=sting - default: normalTaxiEconomy
   * @param carIcon: the actual icon of the car type
   * @param carName: app label fo the car type
   * Responsible for updating the props.App and visual elements when the user selects the car type in any category he/she wants
   */
  handleChooseCarType(
    carType = 'normalTaxiEconomy',
    fare = 'Unavailable',
    carIcon = false,
    carName = false,
  ) {
    let globalObject = this;
    if (carIcon !== false && carName !== false) {
      //Update icon and car name only when provided
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata.iconCarSelected = carIcon; //update car icon
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata.nameCarSelected = carName; //Update car name label
    }
    //...RIDES OR DELIVERIES
    if (carType === 'normalTaxiEconomy' || carType === 'electricBikes') {
      //Economy: normal taxi
      //Change focus colors to normal taxi and fade the other types - rescale as well
      //Economy
      this.props.App.carTypeSelected = carType;
      this.props.App.colorCircleNormalTaxi = '#0D8691';
      this.props.App.colorBannerRideTypeNormalTaxi = '#000';
      //Electric
      this.props.App.colorCircleElectricCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricCar = '#a2a2a2';
      //Comfort
      this.props.App.colorCircleComfortTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeComfortTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricComfortCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
      //Luxury
      this.props.App.colorCircleLuxuryTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricLuxuryCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
      //...
      //VERY IMPORTANT - UPDATE THE FARE
      this.props.App.fareTripSelected = fare;
      //...
      this.forceUpdate();
      AnimatedNative.parallel([
        AnimatedNative.timing(this.props.App.scaleRideTypeNormalTaxi, {
          toValue: 1,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObject.props.UpdateRideTypesScales({
          rideType: carType,
          fare: fare,
        });
      });
    } else if (carType === 'electricEconomy' || carType === 'bikes') {
      //Economy: electric car
      //Change focus colors to electric taxi and fade the other types - rescale as well
      this.props.App.carTypeSelected = carType;
      this.props.App.colorCircleNormalTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeNormalTaxi = '#a2a2a2';
      this.props.App.colorCircleElectricCar = '#0D8691';
      this.props.App.colorBannerRideTypeElectricCar = '#000';
      //Comfort
      this.props.App.colorCircleComfortTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeComfortTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricComfortCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
      //Luxury
      this.props.App.colorCircleLuxuryTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricLuxuryCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
      //...
      //VERY IMPORTANT - UPDATE THE FARE
      this.props.App.fareTripSelected = fare;
      //...
      this.forceUpdate();
      AnimatedNative.parallel([
        AnimatedNative.timing(this.props.App.scaleRideTypeNormalTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricTaxi, {
          toValue: 1,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObject.props.UpdateRideTypesScales({
          rideType: carType,
          fare: fare,
        });
      });
    } else if (carType === 'comfortNormalRide' || carType === 'carDelivery') {
      //comfort: normal car
      //Change focus colors to electric taxi and fade the other types - rescale as well
      this.props.App.carTypeSelected = carType;
      this.props.App.colorCircleNormalTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeNormalTaxi = '#a2a2a2';
      this.props.App.colorCircleElectricCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricCar = '#a2a2a2';
      //Comfort
      this.props.App.colorCircleComfortTaxi = '#0D8691';
      this.props.App.colorBannerRideTypeComfortTaxi = '#000';
      //Electric
      this.props.App.colorCircleElectricComfortCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
      //Luxury
      this.props.App.colorCircleLuxuryTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricLuxuryCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
      //...
      //VERY IMPORTANT - UPDATE THE FARE
      this.props.App.fareTripSelected = fare;
      //...
      this.forceUpdate();
      AnimatedNative.parallel([
        AnimatedNative.timing(this.props.App.scaleRideTypeNormalTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricTaxi, {
          toValue: 0.9,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeComfortTaxi, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObject.props.UpdateRideTypesScales({
          rideType: carType,
          fare: fare,
        });
      });
    } else if (carType === 'comfortElectricRide' || carType === 'vanDelivery') {
      //comfort: normal car
      //Change focus colors to electric taxi and fade the other types - rescale as well
      this.props.App.carTypeSelected = carType;
      this.props.App.colorCircleNormalTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeNormalTaxi = '#a2a2a2';
      this.props.App.colorCircleElectricCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricCar = '#a2a2a2';
      //Comfort
      this.props.App.colorCircleComfortTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeComfortTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricComfortCar = '#0D8691';
      this.props.App.colorBannerRideTypeElectricComfortCar = '#000';
      //Luxury
      this.props.App.colorCircleLuxuryTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricLuxuryCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
      //...
      //VERY IMPORTANT - UPDATE THE FARE
      this.props.App.fareTripSelected = fare;
      //...
      this.forceUpdate();
      AnimatedNative.parallel([
        AnimatedNative.timing(this.props.App.scaleRideTypeNormalTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricTaxi, {
          toValue: 0.9,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricComfortTaxi, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObject.props.UpdateRideTypesScales({
          rideType: carType,
          fare: fare,
        });
      });
    } else if (carType === 'luxuryNormalRide') {
      //comfort: normal car
      //Change focus colors to electric taxi and fade the other types - rescale as well
      this.props.App.carTypeSelected = carType;
      this.props.App.colorCircleNormalTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeNormalTaxi = '#a2a2a2';
      this.props.App.colorCircleElectricCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricCar = '#a2a2a2';
      //Comfort
      this.props.App.colorCircleComfortTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeComfortTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricComfortCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
      //Luxury
      this.props.App.colorCircleLuxuryTaxi = '#0D8691';
      this.props.App.colorBannerRideTypeLuxuryTaxi = '#000';
      //Electric
      this.props.App.colorCircleElectricLuxuryCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
      //...
      //VERY IMPORTANT - UPDATE THE FARE
      this.props.App.fareTripSelected = fare;
      //...
      this.forceUpdate();
      AnimatedNative.parallel([
        AnimatedNative.timing(this.props.App.scaleRideTypeNormalTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricTaxi, {
          toValue: 0.9,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObject.props.UpdateRideTypesScales({
          rideType: carType,
          fare: fare,
        });
      });
    } else if (carType === 'luxuryElectricRide') {
      //comfort: normal car
      //Change focus colors to electric taxi and fade the other types - rescale as well
      this.props.App.carTypeSelected = carType;
      this.props.App.colorCircleNormalTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeNormalTaxi = '#a2a2a2';
      this.props.App.colorCircleElectricCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricCar = '#a2a2a2';
      //Comfort
      this.props.App.colorCircleComfortTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeComfortTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricComfortCar = '#a2a2a2';
      this.props.App.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
      //Luxury
      this.props.App.colorCircleLuxuryTaxi = '#a2a2a2';
      this.props.App.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
      //Electric
      this.props.App.colorCircleElectricLuxuryCar = '#0D8691';
      this.props.App.colorBannerRideTypeElectricLuxuryCar = '#000';
      //...
      //VERY IMPORTANT - UPDATE THE FARE
      this.props.App.fareTripSelected = fare;
      //...
      this.forceUpdate();
      AnimatedNative.parallel([
        AnimatedNative.timing(this.props.App.scaleRideTypeNormalTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricTaxi, {
          toValue: 0.9,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricComfortTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.scaleRideTypeElectricLuxuryTaxi, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObject.props.UpdateRideTypesScales({
          rideType: carType,
          fare: fare,
        });
      });
    }
  }

  /**
   * @func renderNoGPRSResolver
   * Responsible for showing up the the component to facilite the user to activate the GPRS to be
   * able to use the platform
   */
  promptGPRSActivation() {
    console.log('pressed');
    this.props.App.gprsGlobals.didAskForGprs = false;
    this.props.App.gprsGlobals.hasGPRSPermissions = false;
    //...
    this.requestGPSPermission();
  }

  renderNoGPRSResolver() {
    if (this.props.App.gprsGlobals.hasGPRSPermissions === false) {
      return (
        <TouchableOpacity
          onPress={() => this.promptGPRSActivation()}
          style={[
            styles.shadowBottomVitals,
            {
              flexDirection: 'row',
              height: 80,
              backgroundColor: '#000',
              padding: 20,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            },
          ]}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={[
                systemWeights.light,
                {fontSize: 13, color: '#fff', lineHeight: 20},
              ]}>
              Your location services need to be enabled for a better experience.
              <Text style={[systemWeights.regular]}>
                {' '}
                Simply press here to do so.
              </Text>
            </Text>
          </View>
          <View
            style={{
              width: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconAnt name="arrowright" color={'#fff'} size={15} />
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
    //DEBUG
    //this.props.App.isSearchModuleOn = true;
    //DEBUG-------
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
          <View
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
          </View>
        ) : null}

        <View
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
            <View style={{flex: 1, alignItems: 'flex-start'}}>
              <TouchableOpacity
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
          ) : null}
        </View>

        {this.renderNoGPRSResolver()}
        {this.props.App.isSearchModuleOn ? (
          <Search />
        ) : this.props.App.bottomVitalsFlow.currentStep !==
          'gettingRideProcessScreen' ? (
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

  render() {
    //DEBUG
    //this.props.App.bottomVitalsFlow.currentStep = 'gettingRideProcessScreen';
    //this.props.App.gprsGlobals.hasGPRSPermissions = false; //DEBUG
    //this.props.App.isSearchModuleOn = true; //DEBUG
    //this.props.App.renderGlobalModal = true; //DEBUG
    //this.props.App.isDeliveryReceiverInfosShown = true; //DEBUG
    //this.resetAnimationLoader(); //DEBUG
    return (
      <View style={styles.window}>
        <StatusBar backgroundColor="#000" />
        <ErrorModal
          active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
          error_status={
            this.props.App.generalErrorModal_vars.generalErrorModalType
          }
          parentNode={this}
        />
        {/*this.fire_search_animation() - so unefficient!*/}

        {/*<Modal
          testID={'modal'}
          isVisible={this.props.App.renderGlobalModal}
          animationInTiming={300}
          animationOutTiming={300}
          useNativeDriver={true}
          style={styles.modalBottom}>
          {this.renderModalContent()}
        </Modal>*/}
        <DateTimePickerModal
          isVisible={this.props.App.isSelectDatePickerActive}
          mode="time"
          is24Hour={true}
          onConfirm={this.handleConfirmDateSchedule}
          onCancel={this.handleCancelScheduleTrip}
        />
        <View style={{flex: 1}}>{this.renderAppropriateModules()}</View>
      </View>
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
      UpdateTinyCarOnMapIconSize,
      UpdateHellosVars,
      UpdateSchedulerState,
      UpdateCustomFareState,
      UpdateBottomVitalsState,
      UpdateProcessFlowState,
      UpdateMapUsabilityState,
      UpdateRideTypesScales,
      UpdateCurrentLocationMetadat,
      UpdateNumberOfPassengersSelected,
      UpdateAdditionalPickupNote,
      UpdateRideTypesOnScrollCategories,
      UpdatePricingStateData,
      UpdateRoutePreviewToDestination,
      UpdateDeliveryPackageSize,
      UpdateRiderOrPackagePossesserSwitcher,
      ValidateReceiverInfosForDelivery,
      UpdateErrorMessagesStateInputRecDelivery,
      UpdateReceiverNameOnType,
      UpdateClosestDriversList,
      UpdateErrorBottomVitals,
      UpdateErrorModalLog,
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
  modalBottom: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  map: {
    flex: 1,
  },
  buttonCnt: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  loader: {
    borderTopWidth: 3,
    width: 20,
    marginBottom: 10,
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
  shadowRideOrDeliveryNodes: {
    backgroundColor: '#fff',
    shadowColor: '#f0f0f0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 3,

    elevation: 3,
  },
  shadowNumberOfRidersButtons: {
    backgroundColor: '#fff',
    shadowColor: '#d0d0d0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2,

    elevation: 4,
  },
  bttnGenericTc: {
    borderColor: '#000',
    padding: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,

    elevation: 3,
  },
  borderIconLocationType: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    bottom: 10,
    borderWidth: 2,
    borderRadius: 100,
    borderColor: '#000',
  },
  buttonNumberOfPassDefault: {
    borderWidth: 1.5,
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#0D8691',
    borderRadius: 250,
  },
  parentButtonNoPassengers: {
    flex: 1,
    alignItems: 'center',
  },
  arrowCircledForwardBasic: {
    backgroundColor: '#0e8491',
    width: 60,
    height: 60,
    borderRadius: 10000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowButtonArrowCircledForward: {
    shadowColor: '#d0d0d0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.6,

    elevation: 6,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
