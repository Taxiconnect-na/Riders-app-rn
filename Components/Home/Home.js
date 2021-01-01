/* eslint-disable prettier/prettier */
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  Animated,
  MapView,
  Camera,
  UserLocation,
  ShapeSource,
  SymbolLayer,
  CircleLayer,
  PointAnnotation,
  MarkerView,
} from '@react-native-mapbox-gl/maps';
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
  Image,
  TextInput,
  Switch,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import PulseCircleLayer from '../Modules/PulseCircleLayer';
import bearing from '@turf/bearing';
import {systemWeights} from 'react-native-typography';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
var turf = require('@turf/turf');
//import this.props.App.carIcon from './caradvanced.png';      //Option 1
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import ErrorModal from '../Helpers/ErrorModal';
import NetInfo from '@react-native-community/netinfo';
import Search from '../Modules/Search/Components/Search';
import PhoneNumberInput from '../Modules/PhoneNumberInput/Components/PhoneNumberInput';
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
const MAX_MAP_ZOOM_RELATIVE_CAR = 18;
const MINIMAL_CAR_ICON = 0.18;
const MAXIMUM_CAR_ICON = 0.28;
const DIFF_CAR_ICON_SIZE = MAXIMUM_CAR_ICON - MINIMAL_CAR_ICON;
const PADDING_LIMIT = 150;

//Greetings dictionnary
const greetingsDICO = {
  day: {},
  night: {},
  initial: {},
};

//Annotations
//1. Destination annotation
const AnnotationDriver = ({title}) => (
  <View
    style={{
      padding: 10,
      width: 140,
      borderWidth: 1,
      borderColor: 'transparent',
    }}>
    <View
      style={{
        backgroundColor: '#fff',
        flexDirection: 'row',
        height: 35,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        borderRadius: 3,
      }}>
      <View
        style={{
          backgroundColor: '#096ED4',
          padding: 5,
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 3,
        }}>
        <Text
          style={[
            {
              fontSize: 13,
              color: '#fff',
              fontFamily: 'Allrounder-Grotesk-Regular',
            },
          ]}>
          2
        </Text>
        <Text
          style={[
            {
              fontSize: 10,
              color: '#fff',
              fontFamily: 'Allrounder-Grotesk-Book',
            },
          ]}>
          MIN
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          paddingLeft: 5,
          paddingRight: 10,
        }}>
        <Text style={[{fontSize: 13, fontFamily: 'Allrounder-Grotesk-Book'}]}>
          {title}
        </Text>
      </View>
    </View>
  </View>
);

const AnnotationPickup = ({title}) => (
  <View
    style={{
      padding: 10,
      width: 140,
      borderWidth: 1,
      borderColor: 'transparent',
    }}>
    <View
      style={{
        backgroundColor: '#fff',
        flexDirection: 'row',
        height: 35,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.7,

        elevation: 6,
        borderRadius: 3,
      }}>
      <View
        style={{
          backgroundColor: '#000',
          padding: 5,
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 3,
        }}></View>
      <View
        style={{
          justifyContent: 'center',
          paddingLeft: 5,
          paddingRight: 10,
        }}>
        <Text style={[{fontSize: 13, fontFamily: 'Allrounder-Grotesk-Book'}]}>
          {title.length > 11 ? title.substring(0, 11) + '.' : title}
        </Text>
      </View>
    </View>
  </View>
);

const AnnotationDestination = ({title, etaInfos}) => (
  <View
    style={{
      padding: 10,
      width: 140,
      borderWidth: 1,
      borderColor: 'transparent',
    }}>
    <View
      style={{
        backgroundColor: '#fff',
        flexDirection: 'row',
        height: 35,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.7,

        elevation: 6,
        borderRadius: 3,
      }}>
      <View
        style={{
          backgroundColor: '#096ED4',
          padding: 5,
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 3,
        }}>
        <Text
          style={[
            {
              fontSize: 13,
              color: '#fff',
              fontFamily: 'Allrounder-Grotesk-Regular',
            },
          ]}>
          {etaInfos.eta.split(' ')[0]}
        </Text>
        <Text
          style={[
            {
              fontSize: 10,
              color: '#fff',
              fontFamily: 'Allrounder-Grotesk-Book',
            },
          ]}>
          {etaInfos.eta.split(' ')[1].toUpperCase()}
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          paddingLeft: 5,
          paddingRight: 10,
        }}>
        <Text style={[{fontSize: 13, fontFamily: 'Allrounder-Grotesk-Book'}]}>
          {title.length > 11 ? title.substring(0, 11) + '.' : title}
        </Text>
      </View>
    </View>
  </View>
);

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
              (error) => {
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
              (error) => {},
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

    this.props.App.socket.on('error', (error) => {});
    this.props.App.socket.on('disconnect', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_error', () => {
      if (
        /(show_modalMore_tripDetails|show_rating_driver_modal|show_cancel_ride_modal)/i.test(
          globalObject.props.App.generalErrorModalType,
        ) !== true
      ) {
        console.log('updatinnnnnn leak');
        globalObject.props.UpdateErrorModalLog(
          true,
          'connection_no_network',
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
                    globalObject.updateRemoteLocationsData('from loop');
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
                    globalObject.updateRemoteLocationsData('from loop');
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
          //globalObject.normalizeCarSizeToZoom();
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
            globalObject.props.App.initializedScenario !=
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
              (error) => {},
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
                  globalObject.updateRemoteLocationsData('from loop');
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
      (error) => {
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
   * @func updateClosestLiveDriversMap
   * Responsible for updating on the map the closest drivers after the response from the MAP service
   * is received.
   */
  updateClosestLiveDriversMap() {
    let globalObject = this;
    //Update the list of the closest drivers if no trip in progress
    if (
      this.props.App.isRideInProgress === false &&
      /mainView/i.test(this.props.App.bottomVitalsFlow.currentStep) &&
      this.props.App._CLOSEST_DRIVERS_DATA !== null &&
      this.props.App._CLOSEST_DRIVERS_DATA.length !== undefined &&
      this.props.App._CLOSEST_DRIVERS_DATA.length > 0
    ) {
      let tmp = this.props.App._CLOSEST_DRIVERS_DATA.map((driver, index) => {
        //Compute the bearing
        let carBearing = bearing(
          point([
            driver.driver_coordinates.longitude,
            driver.driver_coordinates.latitude,
          ]),
          point([
            driver.prev_driver_coordinates.longitude,
            driver.prev_driver_coordinates.latitude,
          ]),
        );
        //...
        return (
          <ShapeSource
            key={index + 1}
            id={'currentLocationSource' + (index + 1)}
            shape={{
              type: 'Point',
              coordinates: [
                driver.driver_coordinates.longitude,
                driver.driver_coordinates.latitude,
              ],
            }}>
            <Animated.SymbolLayer
              id={'symbolCarLayer' + (index + 2)}
              minZoomLevel={1}
              style={{
                iconAllowOverlap: true,
                iconImage: globalObject.props.App.carIcon_black,
                iconSize: globalObject.props.App.carIconRelativeSize,
                iconRotate: carBearing,
              }}
            />
          </ShapeSource>
        );
      });
      return tmp;
    } else {
      return null;
    }
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
          )
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
      (error) => {
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
  updateRemoteLocationsData(origin = 'other') {
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

  async normalizeCarSizeToZoom() {
    if (this._map !== undefined && this._map != null) {
      //Hook the recenter button state function
      this.updateCenterMapButton();
      //...
      //if (this._map !== undefined && this._map != null && this.props.App.isRideInProgress) {
      /*const mapZoom = await this._map.getZoom();
      let carIconUpdateSize =
        (mapZoom * 0.1) / MAX_MAP_ZOOM_RELATIVE_CAR +
        MINIMAL_CAR_ICON -
        DIFF_CAR_ICON_SIZE / 10;*/
      let carIconUpdateSize = 0.3;

      /*if (mapZoom < 12.6 && mapZoom >= 10.6) {
        carIconUpdateSize -= 0.08;
      } else if (mapZoom < 10.6) {
        carIconUpdateSize -= 0.08;
      }*/
      //...
      if (carIconUpdateSize > 0.28) {
        carIconUpdateSize = 0.28;
      } else if (carIconUpdateSize < 0.18) {
        carIconUpdateSize = 0.18;
      }
      //Update Icon
      if (this.props.App.carIconRelativeSize !== carIconUpdateSize) {
        this.props.UpdateTinyCarOnMapIconSize(carIconUpdateSize);
      }
    }
  }

  renderDriverTracker() {
    if (
      this.props.App.route != null &&
      this.props.App.route !== undefined &&
      this.props.App.isRideInProgress &&
      this.props.App.isInRouteToDestination === false &&
      this.props.App.request_status === 'inRouteToPickup'
    ) {
      //Pickup scenarios animations
      return (
        <>
          <Animated.ShapeSource
            id={'shape'}
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: this.props.App.shape,
              })
            }>
            <Animated.LineLayer
              id={'lineRoutePickup'}
              style={{
                lineCap: 'round',
                lineWidth: 6,
                lineOpacity: 0.8,
                lineColor: '#000',
              }}
            />
          </Animated.ShapeSource>

          {/*<Animated.ShapeSource
            id="currentLocationSource"
            shape={
              new Animated.Shape({
                type: 'Point',
                coordinates: this.props.App.actPoint,
              })
            }>
            <Animated.CircleLayer
              id="currentLocationCircle"
              style={{
                circleOpacity: 1,
                circleColor: '#000',
                circleRadius: 10,
              }}
            />
            </Animated.ShapeSource>*/}
          {this.props.App.actPointToMinusOne === false ? (
            <ShapeSource
              id="currentLocationSource"
              shape={{
                type: 'Point',
                coordinates:
                  this.props.App.lastDriverCoords == null
                    ? [0, 0]
                    : this.props.App.lastDriverCoords,
              }}>
              <CircleLayer
                id="currentLocationCircle"
                style={{
                  circleOpacity: 1,
                  circleColor: '#000',
                  circleRadius: 8,
                }}
              />
            </ShapeSource>
          ) : (
            <Animated.ShapeSource
              id="symbolCarIcon"
              shape={
                new Animated.Shape({
                  type: 'Point',
                  coordinates: this.props.App.actPoint,
                })
              }>
              <Animated.SymbolLayer
                id="symbolCarLayer"
                minZoomLevel={1}
                style={{
                  iconAllowOverlap: true,
                  iconImage: this.props.App.carIcon,
                  iconSize: 0.28,
                  iconRotate: this.props.App.lastDriverBearing,
                }}
              />
            </Animated.ShapeSource>
          )}
        </>
      );
    } else if (
      this.props.App.routeDestination != null &&
      this.props.App.routeDestination !== undefined &&
      this.props.App.isRideInProgress &&
      this.props.App.isInRouteToDestination &&
      this.props.App.request_status === 'inRouteToDestination'
    ) {
      this.repositionMaviewMarker(
        this.props.App.destinationPoint,
        'destination',
      );
      //Destination routes animation scenarios
      return (
        <View>
          <Animated.ShapeSource
            id={'shape'}
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: this.props.App.shapeDestination,
              })
            }>
            <Animated.LineLayer
              id={'lineRoutePickup'}
              style={{
                lineCap: 'round',
                lineWidth: 6,
                lineOpacity: 0.8,
                lineColor: '#000',
              }}
            />
          </Animated.ShapeSource>

          {this.props.App.actPointToMinusOne === false ? (
            <ShapeSource
              id="currentLocationSource"
              shape={{
                type: 'Point',
                coordinates:
                  this.props.App.lastDriverCoords == null
                    ? [0, 0]
                    : this.props.App.lastDriverCoords,
              }}>
              <CircleLayer
                id="currentLocationCircle"
                style={{
                  circleOpacity: 1,
                  circleColor: '#000',
                  circleRadius: 8,
                }}
              />
            </ShapeSource>
          ) : (
            <Animated.ShapeSource
              id="symbolCarIcon"
              shape={
                new Animated.Shape({
                  type: 'Point',
                  coordinates: this.props.App.actPointDestination,
                })
              }>
              <Animated.SymbolLayer
                id="symbolCarLayer"
                minZoomLevel={1}
                style={{
                  iconAllowOverlap: true,
                  iconImage: this.props.App.carIcon,
                  iconSize: this.props.App.carIconRelativeSize,
                  iconRotate: this.props.App.lastDriverBearing,
                }}
              />
            </Animated.ShapeSource>
          )}

          <PointAnnotation
            id="riderPickupLocation_tooltip"
            //anchor={{x: 1, y: 1}}
            anchor={this.props.App.previewDestinationData.destinationAnchor}
            coordinate={this.props.App.destinationPoint.map(parseFloat)}>
            <AnnotationDestination
              title={'Destination'}
              etaInfos={this.props.App.destinationLocation_metadata}
            />
          </PointAnnotation>
          {/*<Animated.ShapeSource
            id="symbolCarIcon"
            shape={
              new Animated.Shape({
                type: 'Point',
                coordinates: this.props.App.actPointDestination,
              })
            }>
            <Animated.SymbolLayer
              id="symbolCarLayer"
              minZoomLevel={1}
              style={{
                iconAllowOverlap: true,
                iconImage: this.props.App.carIcon,
                iconSize: this.props.App.carIconRelativeSize,
                iconRotate: this.props.App.lastDriverBearing,
              }}
            />
            </Animated.ShapeSource>*/}
        </View>
      );
    } else if (this.props.App.request_status === 'pending') {
      //....
      //Pending request
      //Pickup location and request status bar
      return (
        <View>
          <PointAnnotation
            id="riderPickupLocation_tooltip"
            anchor={{x: 1, y: 1}}
            coordinate={this.props.App.pickupLocation_metadata.coordinates.map(
              parseFloat,
            )}>
            <AnnotationPickup
              title={this.props.App.pickupLocation_metadata.pickupLocation_name}
            />
          </PointAnnotation>
        </View>
      );
    } else {
      return null;
    }
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
        if (globalObject.props.App.loaderBasicWidth == 1) {
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
   * @func initialTouchForRideOrDelivery()
   * Responsible for reshaping the bottom vitals when the user press on the virgin component for the first time.
   * Make the initial content fade and show the 2 choices screen
   * mainView -> selectRideOrDelivery
   */
  initialTouchForRideOrDelivery() {
    let globalObject = this;
    //Fade the origin content
    /*AnimatedNative.parallel([
      AnimatedNative.timing(
        this.props.App.bottomVitalsFlow.bottomVitalChildHeight,
        {
          toValue: 400,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: false,
        },
      ),
      AnimatedNative.timing(
        this.props.App.bottomVitalsFlow.mainHelloContentOpacity,
        {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        },
      ),
      AnimatedNative.timing(
        this.props.App.bottomVitalsFlow.mainHelloContentPosition,
        {
          toValue: 20,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        },
      ),
    ]).start(() => {
      //Update process flow to select ride or delivery
      globalObject.props.UpdateProcessFlowState({
        flowDirection: 'next',
        parentTHIS: this,
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
    });*/

    AnimatedNative.parallel([
      AnimatedNative.timing(
        this.props.App.bottomVitalsFlow.bottomVitalChildHeight,
        {
          toValue: 400,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: false,
        },
      ),
      AnimatedNative.timing(
        this.props.App.bottomVitalsFlow.mainHelloContentOpacity,
        {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        },
      ),
      AnimatedNative.timing(
        this.props.App.bottomVitalsFlow.mainHelloContentPosition,
        {
          toValue: 20,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        },
      ),
    ]).start(() => {
      //Update process flow to select ride or delivery
      globalObject.props.UpdateProcessFlowState({
        flowDirection: 'next',
        parentTHIS: this,
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
   * @func connectToTaxiGenericButtonAction()
   * Responsible for closing up the bottom vitals and loading the loader page for about 5 seconds before rendering the main
   * "Finding Taxi" or for delivery screen.
   * @param actionType: RIDE OR DELIVERY depending on the request type
   */
  connectToTaxiGenericButtonAction(actionType) {
    let globalObject = this;
    if (actionType === 'RIDE' || actionType === 'DELIVERY') {
      this.fire_search_animation();
      //Fade out the bottom vitals and generic contents to fade in the ride loader screen
      AnimatedNative.parallel([
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.bottomVitalChildHeight,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: false,
          },
        ),
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.mainHelloContentOpacity,
          {
            toValue: 0,
            duration: 200,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.mainHelloContentPosition,
          {
            toValue: 20,
            duration: 200,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.genericContainerOpacity,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.genericContainerPosition,
          {
            toValue: 0,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(this.props.App.loaderPosition, {
          toValue: 0,
          duration: 50,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.loaderBasicWidth, {
          toValue: 1,
          duration: 50,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
      ]).start(() => {
        //globalObject.props.App.bottomVitalsFlow.currentStep ='gettingRideProcessScreen';

        globalObject.props.UpdateProcessFlowState({
          flowDirection: 'next',
          parentTHIS: globalObject,
        });
        //GATHER REQUEST METADATA FOR RIDE OR DELIVERY REQUEST
        //Check if a custom pickup location was specified
        //Point to current location by default
        let org_latitude = globalObject.props.App.latitude;
        let org_longitude = globalObject.props.App.longitude;
        //Check forr custom pickup
        if (
          globalObject.props.App.search_pickupLocationInfos
            .isBeingPickedupFromCurrentLocation === false &&
          globalObject.props.App.search_pickupLocationInfos
            .passenger0Destination !== false
        ) {
          org_latitude =
            globalObject.props.App.search_pickupLocationInfos
              .passenger0Destination.coordinates[1];
          org_longitude =
            globalObject.props.App.search_pickupLocationInfos
              .passenger0Destination.coordinates[0];
        }
        //...................................................
        let RIDE_OR_DELIVERY_BOOKING_DATA = {
          user_fingerprint: globalObject.props.App.user_fingerprint,
          connectType: globalObject.props.App.bottomVitalsFlow.connectType,
          country: globalObject.props.App.userCurrentLocationMetaData.country,
          isAllGoingToSameDestination:
            globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .isAllgoingToTheSamePlace, //If all the passengers are going to the same destination
          naturePickup: /RIDE/i.test(
            globalObject.props.App.bottomVitalsFlow.flowParent,
          )
            ? globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .locationTypeIdentified !== false
              ? globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                  .locationTypeIdentified
              : 'PrivateLocation'
            : 'PrivateLocation', //Force PrivateLocation type if nothing found or delivery request,  -Nature of the pickup location (privateLOcation,etc)
          passengersNo: /RIDE/i.test(
            globalObject.props.App.bottomVitalsFlow.flowParent,
          )
            ? globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .numberOfPassengersSelected
            : 1, //Force to 1 passenger for deliveries
          actualRider: /^me$/i.test(
            this.props.App.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars
              .whoIsRiding,
          )
            ? 'me'
            : this.props.App.bottomVitalsFlow
                .riderOrPackagePosseserSwitchingVars.riderPhoneNumber === false
            ? 'me'
            : 'someonelese',
          actualRiderPhone_number:
            this.props.App.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars
              .riderPhoneNumber === false
              ? false
              : this.props.App.bottomVitalsFlow
                  .riderOrPackagePosseserSwitchingVars.riderPhoneNumber,
          //DELIVERY SPECIFIC INFOS (receiver infos:name and phone)
          receiverName_delivery: /RIDE/i.test(
            globalObject.props.App.bottomVitalsFlow.flowParent,
          )
            ? false
            : this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .receiverName,
          receiverPhone_delivery: /RIDE/i.test(
            globalObject.props.App.bottomVitalsFlow.flowParent,
          )
            ? false
            : this.props.App.countryPhoneCode +
              this.props.App.phoneNumberEntered
                .replace(/ /g, '')
                .replace(/^0/, ''),
          packageSizeDelivery: /RIDE/i.test(
            globalObject.props.App.bottomVitalsFlow.flowParent,
          )
            ? false
            : this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .selectedPackageSize,
          //...
          rideType: globalObject.props.App.bottomVitalsFlow.flowParent, //Ride or delivery
          paymentMethod:
            globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .paymentMethod, //Payment method
          timeScheduled: globalObject.props.App.selectedScheduleTime,
          pickupNote: globalObject.props.App.additionalNote_inputText, //Additional note for the pickup
          carTypeSelected: globalObject.props.App.carTypeSelected, //Ride selected, Economy normal taxis,etc
          fareAmount:
            globalObject.props.App.customFareTripSelected !== false &&
            globalObject.props.App.customFareTripSelected !== null
              ? globalObject.props.App.customFareTripSelected
              : globalObject.props.App.fareTripSelected, //Ride fare
          pickupData: {
            coordinates: [org_latitude, org_longitude],
            location_name:
              globalObject.props.App.search_pickupLocationInfos
                .isBeingPickedupFromCurrentLocation === false &&
              globalObject.props.App.search_pickupLocationInfos
                .passenger0Destination !== false
                ? globalObject.props.App.search_pickupLocationInfos
                    .passenger0Destination.location_name !== undefined
                  ? globalObject.props.App.search_pickupLocationInfos
                      .passenger0Destination.location_name
                  : false
                : globalObject.props.App.userCurrentLocationMetaData.name !==
                    undefined &&
                  globalObject.props.App.userCurrentLocationMetaData.name !==
                    null
                ? globalObject.props.App.userCurrentLocationMetaData.name
                : false,
            street_name:
              globalObject.props.App.search_pickupLocationInfos
                .isBeingPickedupFromCurrentLocation === false &&
              globalObject.props.App.search_pickupLocationInfos
                .passenger0Destination !== false
                ? globalObject.props.App.search_pickupLocationInfos
                    .passenger0Destination.street !== undefined
                  ? globalObject.props.App.search_pickupLocationInfos
                      .passenger0Destination.sreet
                  : false
                : globalObject.props.App.userCurrentLocationMetaData.street !==
                    undefined &&
                  globalObject.props.App.userCurrentLocationMetaData.street !==
                    null
                ? globalObject.props.App.userCurrentLocationMetaData.street
                : false,
            city:
              globalObject.props.App.userCurrentLocationMetaData.city !==
                undefined &&
              globalObject.props.App.userCurrentLocationMetaData.city !== null
                ? globalObject.props.App.userCurrentLocationMetaData.city
                : false,
          },
          destinationData: globalObject.props.App.search_passengersDestinations,
        };

        //DOne gathering, make the server request
        //Cancel any previous interval
        clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
        globalObject.props.App._TMP_INTERVAL_PERSISTER = null;

        //Bind to interval persister
        if (globalObject.props.App._TMP_INTERVAL_PERSISTER === null) {
          globalObject.props.App._TMP_INTERVAL_PERSISTER = setInterval(
            function () {
              if (globalObject.props.App.isRideInProgress === false) {
                //Check wheher an answer was already received - if not keep requesting
                console.log('Ride or Delivery request');
                globalObject.props.App.socket.emit(
                  'requestRideOrDeliveryForThis',
                  RIDE_OR_DELIVERY_BOOKING_DATA,
                );
              } //Kill interval - if booking request data already received
              else {
                clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
                if (globalObject.props.App._TMP_INTERVAL_PERSISTER !== null) {
                  globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
                }
              }
            },
            globalObject.props.App._TMP_INTERVAL_PERSISTER_TIME,
          );
        }

        //...
        //Fade in the loader screen
        AnimatedNative.timing(
          globalObject.props.App.bottomVitalsFlow.genericLoaderScreenOpacity,
          {
            toValue: 1,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ).start();
      });
    }
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
   * @func renderContentBottomVitals()
   * Responsible for rendering the specific content of the bottom vitals node
   * Current flow step:
   * //RIDE
   * mainView : when no actions had been taken,
   * [noGPRS : when the gprs is off,]
   * selectRideOrDelivery: when selecting ride or delivery,
   * identifyLocation: when checking if taxi rank or private location,
   * selectNoOfPassengers: when selecting the number of passenger for the ride, etc... ADD AS THE DEVELOPMENT PROGRESSES
   * addMoreTripDetails: when adding more details about the trip
   * selectConnectMeOrUs: when selecting between connectMe and connectUs
   * selectCarTypeAndPaymentMethod: when selecting the car type (economy, luxury, etc) and sepcifying the payment method (defautl: wallet)
   * confirmFareAmountORCustomize: after evenrything, summary where a user can customize the fare amount or not.
   * //DELIVERY
   * inputReceiverInformations: When entering the details about the receiver : name and phone number
   * selectCarTypeAndPaymentMethod: When selecting the vehicle type for the delivery
   */
  renderContentBottomVitals() {
    //DEBUG DATA
    //this.props.App.bottomVitalsFlow.flowParent = 'DELIVERY';
    //this.props.App.bottomVitalsFlow.currentStep = 'addMoreTripDetails';
    //DEBUG DATA

    if (this.props.App.bottomVitalsFlow.currentStep === 'mainView') {
      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.mainHelloContentOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .mainHelloContentPosition,
              },
            ],
          }}>
          <TouchableOpacity
            onPressIn={() => this.initialTouchForRideOrDelivery()}
            style={{height: '100%'}}>
            <View
              style={{
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconMaterialIcons name="keyboard-arrow-up" size={30} />
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                paddingBottom: 20,
              }}>
              {this.props.App.initialHello ? (
                <AnimatedNative.View
                  style={{
                    flexDirection: 'row',
                    opacity: this.props.App.initialHelloAnimationParams
                      .opacity2,
                    transform: [
                      {
                        translateY: this.props.App.initialHelloAnimationParams
                          .top2,
                      },
                    ],
                  }}>
                  <IconMaterialIcons
                    name="cloud"
                    size={23}
                    color={'#0D8691'}
                    style={{marginRight: 5, bottom: 2}}
                  />
                  <Text
                    style={[
                      //systemWeights.semibold,
                      {
                        fontSize: 18.5,
                        color: '#000',
                        fontFamily: 'Allrounder-Grotesk-Medium',
                        bottom: 3,
                      },
                    ]}>
                    {this.props.App.hello2Text}
                  </Text>
                </AnimatedNative.View>
              ) : (
                <AnimatedNative.Text
                  style={[
                    //systemWeights.semibold,
                    {
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      bottom: 3,
                      fontSize: 18.5,
                      color: '#000',
                      opacity: this.props.App.initialHelloAnimationParams
                        .opacity,
                      transform: [
                        {
                          translateY: this.props.App.initialHelloAnimationParams
                            .top,
                        },
                      ],
                    },
                  ]}>
                  Hey there
                </AnimatedNative.Text>
              )}
            </View>
          </TouchableOpacity>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep === 'selectRideOrDelivery'
    ) {
      this.resetAnimationLoader();
      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <View style={{height: '100%'}}>
            <View
              style={{
                height: 35,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={[
                  //systemWeights.semibold,
                  {
                    fontSize: 18,
                    color: '#454545',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                You're the boss
              </Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                flexDirection: 'row',
                paddingLeft: '9%',
                paddingRight: '9%',
                paddingBottom: '8%',
              }}>
              {/* Delivery */}
              <TouchableOpacity
                onPress={() =>
                  this.rerouteBookingProcessFlow('next', 'DELIVERY')
                }
                style={[
                  styles.shadowRideOrDeliveryNodes,
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '45%',
                    height: 200,
                    borderRadius: 5,
                  },
                ]}>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    top: 10,
                  }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderWidth: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 300,
                      borderColor: '#f6f6f6',
                      backgroundColor: '#f6f6f6',
                    }}>
                    <Image
                      source={this.props.App.packageIco}
                      style={{width: 40, height: 40}}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                  <Text
                    style={[
                      {fontSize: 17, fontFamily: 'Allrounder-Grotesk-Medium'},
                    ]}>
                    Delivery
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: 11,
                        marginTop: 5,
                        color: '#1a1a1a',
                        paddingLeft: 8,
                        paddingRight: 5,
                        fontFamily: 'Allrounder-Grotesk-Book',
                        lineHeight: 15,
                      },
                    ]}>
                    Send your packages from one place to another.
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={{width: '8%'}}></View>
              {/* Ride */}
              <TouchableOpacity
                onPress={() => this.rerouteBookingProcessFlow('next', 'RIDE')}
                style={[
                  styles.shadowRideOrDeliveryNodes,
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '45%',
                    height: 200,
                    borderRadius: 5,
                  },
                ]}>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    top: 10,
                  }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderWidth: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 300,
                      borderColor: '#f6f6f6',
                      backgroundColor: '#f6f6f6',
                    }}>
                    <Image
                      source={this.props.App.carChooseIco}
                      style={{width: 60, height: 25}}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                  <Text
                    style={[
                      {fontSize: 17, fontFamily: 'Allrounder-Grotesk-Medium'},
                    ]}>
                    Ride
                  </Text>
                  <Text
                    style={[
                      systemWeights.light,
                      {
                        fontSize: 11,
                        marginTop: 5,
                        color: '#1a1a1a',
                        paddingLeft: 8,
                        paddingRight: 5,
                        fontFamily: 'Allrounder-Grotesk-Book',
                        lineHeight: 15,
                      },
                    ]}>
                    The easiest way to move around the city.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep === 'identifyLocation'
    ) {
      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <View style={{height: '100%'}}>
            <View
              style={{
                height: 35,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AnimatedNative.Text
                style={[
                  {
                    opacity: this.props.App.bottomVitalsFlow
                      .rideOrDeliveryMetadata
                      .identifyinfLocationTypeTopTextOpacity,
                    transform: [
                      {
                        translateX: this.props.App.bottomVitalsFlow
                          .rideOrDeliveryMetadata
                          .identifyinfLocationTypeTopTextPosition,
                      },
                    ],
                    fontSize: 18,
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    color: '#454545',
                  },
                ]}>
                Hey, we're good to go
              </AnimatedNative.Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}>
              {this.renderIdentifiedLocationType()}
            </View>
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep === 'selectNoOfPassengers'
    ) {
      this.resetAnimationLoader();
      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <View style={{height: '100%'}}>
            <View
              style={{
                height: 35,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AnimatedNative.Text
                style={[
                  {
                    fontSize: 18,
                    color: '#454545',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                How many are you?
              </AnimatedNative.Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                flex: 1,
              }}>
              <View
                style={{
                  flex: 1,
                  width: '90%',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {this.renderNumberOfPassengersStep()}
                </View>

                <View
                  style={{
                    height: 80,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Switch
                    trackColor={{false: '#767577', true: '#000'}}
                    thumbColor={
                      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                        .isAllgoingToTheSamePlace
                        ? '#0D8691'
                        : '#f4f3f4'
                    }
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(val) =>
                      this.updateIsAllGoingToTheSamePlaceSwitch(val)
                    }
                    value={
                      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                        .isAllgoingToTheSamePlace
                    }
                  />
                  <Text
                    style={[
                      {
                        fontSize: 15,
                        flex: 1,
                        fontFamily: 'Allrounder-Grotesk-Book',
                      },
                    ]}>
                    {this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                      .isAllgoingToTheSamePlace
                      ? 'We are all going to the same place.'
                      : 'We are not going to the same place.'}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  height: 100,
                }}>
                <TouchableOpacity
                  onPress={() => this.rerouteBookingProcessFlow('next', 'RIDE')}
                  style={{
                    borderWidth: 1,
                    borderColor: 'transparent',
                    width: '90%',
                  }}>
                  <View style={[styles.bttnGenericTc]}>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Book',
                        fontSize: 21,
                        fontWeight: 'bold',
                        color: '#fff',
                      }}>
                      Next
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep === 'addMoreTripDetails'
    ) {
      //this.fire_search_animation(); //Fire animation
      //Preview the route to destination and ETA
      let globalObject = this;
      //MUST BE UNCOMMENTTED WHEN DONE
      if (this.props.App._TMP_INTERVAL_PERSISTER === null) {
        this.fire_search_animation(); //Fire animation
        this.props.App._TMP_INTERVAL_PERSISTER = setInterval(function () {
          if (
            globalObject.props.App.previewDestinationData
              .originDestinationPreviewData === false ||
            globalObject.props.App.previewDestinationData
              .originDestinationPreviewData === undefined
          ) {
            if (
              globalObject.props.App.search_passengersDestinations
                .passenger1Destination !== false
            ) {
              //globalObject.fire_search_animation(); //Fire animation
              //Not found yet -make a request
              //Check if a custom pickup location was specified
              //Point to current location by default
              let org_latitude = globalObject.props.App.latitude;
              let org_longitude = globalObject.props.App.longitude;
              //Check forr custom pickup
              if (
                globalObject.props.App.search_pickupLocationInfos
                  .isBeingPickedupFromCurrentLocation === false &&
                globalObject.props.App.search_pickupLocationInfos
                  .passenger0Destination !== false
              ) {
                org_latitude =
                  globalObject.props.App.search_pickupLocationInfos
                    .passenger0Destination.coordinates[1];
                org_longitude =
                  globalObject.props.App.search_pickupLocationInfos
                    .passenger0Destination.coordinates[0];
              }

              let previewTripRouteData = {
                user_fingerprint: globalObject.props.App.user_fingerprint,
                org_latitude: org_latitude,
                org_longitude: org_longitude,
                dest_latitude:
                  globalObject.props.App.search_passengersDestinations
                    .passenger1Destination.coordinates[1],
                dest_longitude:
                  globalObject.props.App.search_passengersDestinations
                    .passenger1Destination.coordinates[0],
              };
              //..
              globalObject.props.App.socket.emit(
                'getRoute_to_destinationSnapshot',
                previewTripRouteData,
              );
            } else {
              if (globalObject.props.App._TMP_INTERVAL_PERSISTER !== null) {
                clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
                globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
              }
            }
          } //Data already received - kill interval
          else {
            if (globalObject.props.App._TMP_INTERVAL_PERSISTER !== null) {
              clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
              globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
              globalObject.resetAnimationLoader();
            }
          }
        }, 5000);
      }
      //...
      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <View style={{height: '100%'}}>
            <View
              style={{
                height: 35,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AnimatedNative.Text
                style={[
                  systemWeights.semibold,
                  {
                    fontSize: 18,
                    color: '#454545',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                {/Ride/i.test(this.props.App.bottomVitalsFlow.flowParent)
                  ? 'More details about your pickup'
                  : 'More details about your package'}
              </AnimatedNative.Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                flex: 1,
              }}>
              <View
                style={{
                  flex: 1,
                  width: '90%',
                }}>
                {this.props.App.bottomVitalsFlow
                  .riderOrPackagePosseserSwitchingVars.openRiderSwitcher ===
                false ? (
                  <>
                    <Text
                      style={[
                        {
                          color: '#a2a2a2',
                          fontSize: 15,
                          marginTop: 15,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        },
                      ]}>
                      {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                        ? "Who's the rider?"
                        : 'Who has the package?'}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.updateAssigningRiderSwitcherWindow('open')
                      }
                      style={{
                        //borderWidth: 0.5,
                        borderColor: '#d0d0d0',
                        flexDirection: 'row',
                        paddingLeft: 10,
                        paddingRight: 10,
                        paddingBottom: 15,
                        paddingTop: 15,
                        marginTop: 5,
                        borderRadius: 3,
                        backgroundColor: '#fff',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.22,
                        shadowRadius: 2.22,

                        elevation: 3,
                      }}>
                      <IconAnt
                        name={
                          /^me$/i.test(
                            this.props.App.bottomVitalsFlow
                              .riderOrPackagePosseserSwitchingVars.whoIsRiding,
                          )
                            ? 'pluscircleo'
                            : 'pluscircle'
                        }
                        size={20}
                        color={'#0D8691'}
                      />
                      <View
                        style={{
                          paddingLeft: 5,
                          justifyContent: 'center',
                          flex: 1,
                        }}>
                        <Text
                          style={[
                            {
                              fontSize: 17,
                              fontFamily: 'Allrounder-Grotesk-Regular',
                            },
                          ]}>
                          {/RIDE/i.test(
                            this.props.App.bottomVitalsFlow.flowParent,
                          )
                            ? /^me$/i.test(
                                this.props.App.bottomVitalsFlow
                                  .riderOrPackagePosseserSwitchingVars
                                  .whoIsRiding,
                              )
                              ? 'I am the rider'
                              : "Someone else's riding"
                            : /^me$/i.test(
                                this.props.App.bottomVitalsFlow
                                  .riderOrPackagePosseserSwitchingVars
                                  .whoIsRiding,
                              )
                            ? 'I have the package'
                            : "Someone else's got the package"}
                        </Text>
                      </View>
                      <IconMaterialIcons
                        name="arrow-forward-ios"
                        size={18}
                        style={{top: 1}}
                        color={'#0D8691'}
                      />
                    </TouchableOpacity>
                  </>
                ) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    top: 20,
                  }}>
                  <TextInput
                    placeholder={'Add a note to the driver?'}
                    multiline={true}
                    textAlignVertical={'top'}
                    maxLength={70}
                    onChangeText={(text) => this._updatePickupNoteVars(text)}
                    value={
                      this.props.App.additionalNote_inputText === false
                        ? ''
                        : this.props.App.additionalNote_inputText
                    }
                    style={[
                      systemWeights.regular,
                      {
                        //borderWidth: 1,
                        borderColor: '#d0d0d0',
                        borderRadius: 4,
                        width: '100%',
                        height: '100%',
                        padding: 15,
                        fontSize: 17,
                        backgroundColor: '#f6f6f6',
                        fontFamily: 'Allrounder-Grotesk-Regular',
                      },
                    ]}
                  />
                </View>

                <View
                  style={{
                    height: 80,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[
                      {fontSize: 14, fontFamily: 'Allrounder-Grotesk-Book'},
                    ]}>
                    <Text style={{fontFamily: 'Allrounder-Grotesk-Medium'}}>
                      {this.props.App.maxCharAdditionalNote -
                        this.props.App.currentCharStringAdditionalNote}
                    </Text>{' '}
                    character
                    {this.props.App.maxCharAdditionalNote -
                      this.props.App.currentCharStringAdditionalNote >
                      1 ||
                    this.props.App.maxCharAdditionalNote -
                      this.props.App.currentCharStringAdditionalNote <=
                      0
                      ? 's'
                      : ''}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  height: 100,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.rerouteBookingProcessFlow(
                      'next',
                      /RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                        ? 'RIDE'
                        : 'DELIVERY',
                    )
                  }
                  style={{
                    borderWidth: 1,
                    borderColor: 'transparent',
                    width: '90%',
                  }}>
                  <View style={[styles.bttnGenericTc]}>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Book',
                        fontSize: 21,
                        fontWeight: 'bold',
                        color: '#fff',
                      }}>
                      {this.props.App.additionalNote_inputText === false
                        ? /^me$/i.test(
                            this.props.App.bottomVitalsFlow
                              .riderOrPackagePosseserSwitchingVars.whoIsRiding,
                          )
                          ? 'Skip'
                          : 'Next'
                        : 'Next'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep === 'selectConnectMeOrUs'
    ) {
      this.resetAnimationLoader();
      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <View style={{height: '100%'}}>
            <View
              style={{
                height: 35,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={[
                  {
                    fontSize: 18,
                    color: '#454545',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                Private or Shared?
              </Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                flexDirection: 'row',
                paddingLeft: '9%',
                paddingRight: '9%',
                paddingBottom: '8%',
              }}>
              {/* ConnectMe */}
              <TouchableOpacity
                onPress={() =>
                  this.rerouteBookingProcessFlow('next', 'RIDE', 'ConnectMe')
                }
                style={[
                  styles.shadowRideOrDeliveryNodes,
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '45%',
                    height: 200,
                    borderRadius: 5,
                  },
                ]}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 300,
                    borderColor: '#f6f6f6',
                    backgroundColor: '#f6f6f6',
                    top: 10,
                  }}>
                  <IconEntypo name="user" size={32} color={'#096ED4'} />
                </View>
                <View
                  style={{
                    flex: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={[
                      {fontSize: 16.5, fontFamily: 'Allrounder-Grotesk-Medium'},
                    ]}>
                    ConnectMe
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: 13,
                        marginTop: 3,
                        color: '#096ED4',
                        fontFamily: 'Allrounder-Grotesk-Book',
                      },
                    ]}>
                    Private booking
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: 13,
                        marginTop: 15,
                        fontFamily: 'Allrounder-Grotesk-Book',
                      },
                    ]}>
                    From{' '}
                    <Text
                      style={[
                        {fontSize: 14, fontFamily: 'Allrounder-Grotesk-Medium'},
                      ]}>
                      N$45
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={{width: '8%'}}></View>
              {/* ConnectUs */}
              <TouchableOpacity
                onPress={() =>
                  this.rerouteBookingProcessFlow('next', 'RIDE', 'ConnectUs')
                }
                style={[
                  styles.shadowRideOrDeliveryNodes,
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '45%',
                    height: 200,
                    borderRadius: 5,
                  },
                ]}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 300,
                    borderColor: '#f6f6f6',
                    backgroundColor: '#f6f6f6',
                    top: 10,
                  }}>
                  <IconEntypo name="users" size={32} color={'#096ED4'} />
                </View>
                <View
                  style={{
                    flex: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={[
                      {fontSize: 16.5, fontFamily: 'Allrounder-Grotesk-Medium'},
                    ]}>
                    ConnectUs
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: 13,
                        marginTop: 3,
                        color: '#096ED4',
                        fontFamily: 'Allrounder-Grotesk-Book',
                      },
                    ]}>
                    Shared booking
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: 13,
                        marginTop: 15,
                        fontFamily: 'Allrounder-Grotesk-Book',
                      },
                    ]}>
                    <Text
                      style={[
                        {fontSize: 14, fontFamily: 'Allrounder-Grotesk-Medium'},
                      ]}>
                      Normal
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep ===
      'selectCarTypeAndPaymentMethod'
    ) {
      //this.resetAnimationLoader();
      //DEBUG
      //this.props.App.isSelectTripScheduleOn = true;
      //this.rideTypeToSchedulerTransistor(true);
      //this.props.App.pricingVariables.didPricingReceivedFromServer = true;
      //DEBUG
      //Request for fare estimation from the server - PROD
      if (
        this.props.App.pricingVariables.didPricingReceivedFromServer !== false
      ) {
        this.resetAnimationLoader();
      }

      this.getFareEstimation();

      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <View style={{height: '100%'}}>
            <View
              style={{
                height: 35,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {this.props.App.pricingVariables.didPricingReceivedFromServer
                ? this.renderTitlePartSelectRideScheduler()
                : null}
            </View>
            {this.props.App.pricingVariables.didPricingReceivedFromServer ? (
              this.renderRideTypeBottomVitals()
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={[
                    {
                      fontSize: 17.5,
                      bottom: 25,
                      fontFamily: 'Allrounder-Grotesk-Book',
                    },
                  ]}>
                  {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                    ? 'Estimating your fares, hold on...'
                    : 'Estimating your fees, hold on...'}
                </Text>
              </View>
            )}
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep ===
      'confirmFareAmountORCustomize'
    ) {
      this.resetAnimationLoader();
      //DEBUG
      //this.props.App.isSelectTripScheduleOn = true;
      //this.rideTypeToSchedulerTransistor(true);
      //DEBUG
      //DEBUG
      //this.props.App.isEnterCustomFareWindowOn = true;
      //DEBUG

      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <View style={{height: '100%'}}>
            <View
              style={{
                height: 35,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {this.renderTitlePartSelectRideScheduler('summary')}
            </View>
            {this.props.App.isEnterCustomFareWindowOn
              ? this.renderRideTypeBottomVitals('enterCustomFare')
              : this.renderRideTypeBottomVitals('summary')}
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep ===
      'inputReceiverInformations'
    ) {
      this.resetAnimationLoader();
      return (
        <AnimatedNative.View
          style={{
            backgroundColor: '#fff',
            flex: 1,
            padding: 20,
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          {/*<View style={{flex: 1, borderWidth: 1}}>
            <View>
              <IconAnt name="arrowleft" size={28} />
            </View>
            <Text
              style={[
                systemWeights.regular,
                {fontSize: 19, marginTop: 15, marginBottom: 25},
              ]}>
              Can you tell us more about the receiver?
            </Text>
            <View>
              <TextInput
                placeholder={'Name'}
                autoCorrect={false}
                spellCheck={false}
                style={[
                  systemWeights.light,
                  {
                    borderBottomWidth: 1.5,
                    fontSize: 17,
                    paddingLeft: 0,
                    marginBottom: '15%',
                  },
                ]}
              />
              <PhoneNumberInput />
            </View>
          </View>*/}
          <TouchableOpacity
            onPress={() =>
              this.rerouteBookingProcessFlow('previous', 'DELIVERY')
            }>
            <IconAnt name="arrowleft" size={28} />
          </TouchableOpacity>
          <Text
            style={[
              {
                fontSize: 20,
                marginTop: 15,
                marginBottom: 25,
                fontFamily: 'Allrounder-Grotesk-Medium',
              },
            ]}>
            Who's receiving the package?
          </Text>
          <View style={{marginBottom: '13%'}}>
            <TextInput
              autoFocus
              placeholder={'Name'}
              autoCorrect={false}
              spellCheck={false}
              onFocus={() =>
                this.props.UpdateErrorMessagesStateInputRecDelivery({
                  kidName: 'name',
                  state: false,
                })
              }
              onChangeText={(text) => this.props.UpdateReceiverNameOnType(text)}
              value={
                this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                  .receiverName === false
                  ? ''
                  : this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                      .receiverName
              }
              style={[
                {
                  borderBottomWidth: 1.5,
                  fontSize: 17,
                  paddingLeft: 0,
                  fontFamily: 'Allrounder-Grotesk-Book',
                },
              ]}
            />
            {this.props.App.errorReceiverNameShow ? (
              <Text
                style={[
                  systemWeights.light,
                  {color: '#b22222', fontSize: 13, top: 11},
                ]}>
                {this.props.App.errorReceiverNameText}
              </Text>
            ) : null}
          </View>
          <PhoneNumberInput />
          <View
            style={{
              flexDirection: 'row',
              position: 'absolute',
              bottom: '10%',
              left: 20,
              right: 20,
              width: '100%',
            }}>
            <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
              <Image
                source={this.props.App.routingIco}
                style={{width: 20, height: 20, bottom: 14}}
              />
              <Text
                style={[
                  {
                    fontSize: 13,
                    marginLeft: 6,
                    fontFamily: 'Allrounder-Grotesk-Book',
                    lineHeight: 14,
                  },
                ]}>
                The receiver can use the app to track in real-time the delivery
                of the package.
              </Text>
            </View>
            {this.props.App.renderCountryCodeSeacher === false ? (
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={() => this.props.ValidateReceiverInfosForDelivery()}
                  style={[
                    styles.arrowCircledForwardBasic,
                    styles.shadowButtonArrowCircledForward,
                  ]}>
                  <IconMaterialIcons
                    name="arrow-forward-ios"
                    size={30}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep === 'selectPackageSize'
    ) {
      this.resetAnimationLoader();
      return (
        <AnimatedNative.View
          style={{
            backgroundColor: '#fff',
            flex: 1,
            padding: 20,
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <TouchableOpacity
            onPress={() =>
              this.rerouteBookingProcessFlow('previous', 'DELIVERY')
            }>
            <IconAnt name="arrowleft" size={28} />
          </TouchableOpacity>
          <Text
            style={[
              {
                fontSize: 20,
                marginTop: 15,
                marginBottom: 25,
                fontFamily: 'Allrounder-Grotesk-Medium',
              },
            ]}>
            What's your package size?
          </Text>
          <View style={{}}>
            <TouchableOpacity
              onPress={() => this.props.UpdateDeliveryPackageSize('envelope')}
              style={{
                borderWidth: 1,
                borderColor: /envelope/i.test(
                  this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                    .selectedPackageSize,
                )
                  ? '#0D8691'
                  : '#d0d0d0',
                flexDirection: 'row',
                borderRadius: 3,
                paddingLeft: 10,
                paddingRight: 10,
                marginBottom: 15,
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,

                elevation: 2,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  paddingTop: 10,
                  //justifyContent: 'center',
                }}>
                <IconFeather name="box" size={24} />
              </View>
              <View
                style={{
                  flex: 1,
                  paddingLeft: 10,
                  paddingTop: 10,
                  paddingBottom: 10,
                }}>
                <Text
                  style={[
                    {fontSize: 17, fontFamily: 'Allrounder-Grotesk-Regular'},
                  ]}>
                  Envelope
                </Text>
                <Text
                  style={[
                    {
                      fontSize: 13,
                      color: '#8a8a8a',
                      marginTop: 5,
                      fontFamily: 'Allrounder-Grotesk-Book',
                    },
                  ]}>
                  Small package (24cm x 25cm)
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {/envelope/i.test(
                  this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                    .selectedPackageSize,
                ) ? (
                  <IconFeather
                    name="check"
                    size={25}
                    style={{top: 1}}
                    color={'#0D8691'}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
            {/*Small box*/}
            <TouchableOpacity
              onPress={() => this.props.UpdateDeliveryPackageSize('small')}
              style={{
                borderWidth: 1,
                borderColor: /small/i.test(
                  this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                    .selectedPackageSize,
                )
                  ? '#0D8691'
                  : '#d0d0d0',
                flexDirection: 'row',
                borderRadius: 3,
                paddingLeft: 10,
                paddingRight: 10,
                marginBottom: 15,
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,

                elevation: 2,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  paddingTop: 10,
                  //justifyContent: 'center',
                }}>
                <IconFeather name="package" size={24} />
              </View>
              <View
                style={{
                  flex: 1,
                  paddingLeft: 10,
                  paddingTop: 10,
                  paddingBottom: 10,
                }}>
                <Text
                  style={[
                    {fontSize: 17, fontFamily: 'Allrounder-Grotesk-Regular'},
                  ]}>
                  Small box
                </Text>
                <Text
                  style={[
                    {
                      fontSize: 13,
                      color: '#8a8a8a',
                      marginTop: 5,
                      fontFamily: 'Allrounder-Grotesk-Book',
                    },
                  ]}>
                  Medium package (47cm x 68cm x 50cm)
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {/small/i.test(
                  this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                    .selectedPackageSize,
                ) ? (
                  <IconFeather
                    name="check"
                    size={25}
                    style={{top: 1}}
                    color={'#0D8691'}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
            {/**Large box */}
            <TouchableOpacity
              onPress={() => this.props.UpdateDeliveryPackageSize('large')}
              style={{
                borderWidth: 1,
                borderColor: /large/i.test(
                  this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                    .selectedPackageSize,
                )
                  ? '#0D8691'
                  : '#d0d0d0',
                flexDirection: 'row',
                borderRadius: 3,
                paddingLeft: 10,
                paddingRight: 10,
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,

                elevation: 2,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  paddingTop: 10,
                  //justifyContent: 'center',
                }}>
                <IconCommunity name="package" size={24} />
              </View>
              <View
                style={{
                  flex: 1,
                  paddingLeft: 10,
                  paddingTop: 10,
                  paddingBottom: 10,
                }}>
                <Text
                  style={[
                    {fontSize: 17, fontFamily: 'Allrounder-Grotesk-Regular'},
                  ]}>
                  Large box
                </Text>
                <Text
                  style={[
                    {
                      fontSize: 13,
                      color: '#8a8a8a',
                      marginTop: 5,
                      fontFamily: 'Allrounder-Grotesk-Book',
                    },
                  ]}>
                  Large package (62cm x 46cm x 76cm)
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {/large/i.test(
                  this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                    .selectedPackageSize,
                ) ? (
                  <IconFeather
                    name="check"
                    size={25}
                    style={{top: 1}}
                    color={'#0D8691'}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              position: 'absolute',
              bottom: '10%',
              left: 20,
              right: 20,
              width: '100%',
            }}>
            <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
              <IconCommunity name="truck" size={18} style={{bottom: 15}} />
              <Text
                style={{
                  fontSize: 13,
                  marginLeft: 6,
                  fontFamily: 'Allrounder-Grotesk-Book',
                  lineHeight: 14,
                }}>
                Select the right package size for a better delivery handling
                experience.
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <TouchableOpacity
                onPress={() =>
                  this.rerouteBookingProcessFlow('next', 'DELIVERY')
                }
                style={[
                  styles.arrowCircledForwardBasic,
                  styles.shadowButtonArrowCircledForward,
                ]}>
                <IconMaterialIcons
                  name="arrow-forward-ios"
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep ===
      'selectCarTypeAndPaymentMethodDelivery'
    ) {
      this.resetAnimationLoader();
      //DEBUG
      //this.props.App.isSelectTripScheduleOn = true;
      //this.rideTypeToSchedulerTransistor(true);
      //DEBUG
      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <View style={{height: '100%'}}>
            <View
              style={{
                height: 35,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {this.renderTitlePartSelectRideScheduler()}
            </View>
            {this.renderRideTypeBottomVitals('delivery')}
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep === 'gettingRideProcessScreen'
    ) {
      return null;
    } else if (
      this.props.App.bottomVitalsFlow.currentStep ===
      'errorRequestingProcessScreen'
    ) {
      return (
        <AnimatedNative.View
          style={{
            height: '100%',
            opacity: this.props.App.bottomVitalsFlow.genericContainerOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .genericContainerPosition,
              },
            ],
          }}>
          <View style={{height: '100%'}}>
            <View
              style={{
                height: 35,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 17.5,
                }}>
                Unable to make the request
              </Text>
            </View>
            <Text style={{fontFamily: 'Allrounder-Grotesk-Book', fontSize: 17}}>
              Sorry, we were unable to make your ride request due to some
              unexpected error, please try again later.
            </Text>
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep ===
      'requestTimedoutProcessScreen'
    ) {
      return null;
    }
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
   * @func _updatePickupNoteVars
   * Responsible for updating the pickup note for rides or deliveries and all UI interfaces related
   * @param text: text typed
   * Change Skip button to next if text entered.
   */
  _updatePickupNoteVars(text) {
    //Only if text detected.
    this.props.UpdateAdditionalPickupNote(text);
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
   * @func renderTitlePartSelectRideScheduler()
   * @params customStep: to customize the title to a non generic element: specifically for the summary
   * Responsible for rendering the title for either the select ride type or scheduler.
   */
  renderTitlePartSelectRideScheduler(customStep = false) {
    if (customStep === false) {
      //Not summary yet
      if (this.props.App.isSelectTripScheduleOn) {
        //Scheduler
        return (
          <AnimatedNative.Text
            style={[
              {
                fontSize: 17.5,
                color: '#454545',
                fontFamily: 'Allrounder-Grotesk-Medium',
                opacity: this.props.App.titleSchedulerSelectRideOpacity,
                transform: [
                  {
                    translateX: this.props.App.titleSchedulerSelectRidePostion,
                  },
                ],
              },
            ]}>
            {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
              ? 'Schedule your ride'
              : 'Schedule the delivery'}
          </AnimatedNative.Text>
        );
      } //Select ride type : all... (delivery included)
      else {
        if (/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)) {
          //Rides
          return (
            <AnimatedNative.View
              style={[
                {
                  width: '100%',
                  opacity: this.props.App.titleSelectRideOpacity,
                  transform: [
                    {
                      translateX: this.props.App.titleSelectRidePosition,
                    },
                  ],
                },
              ]}>
              <Text
                style={[
                  {
                    fontSize: 18,
                    width: '100%',
                    textAlign: 'center',
                    color: '#454545',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                {
                  this.props.App.headerRideTypesVars.headerSelectRideTypes[
                    this.props.App.headerRideTypesVars.currentHeaderIndex
                  ]
                }
              </Text>
              {this.props.App.headerRideTypesVars.currentHeaderIndex > 0 ? (
                <Text
                  style={{
                    position: 'absolute',
                    left: 5,
                    bottom: 0,
                    color: '#a2a2a2',
                    fontFamily: 'Allrounder-Grotesk-Book',
                  }}>
                  {
                    this.props.App.headerRideTypesVars.headerSelectRideTypes[
                      this.props.App.headerRideTypesVars.currentHeaderIndex - 1
                    ]
                  }
                </Text>
              ) : null}

              <Text
                style={{
                  position: 'absolute',
                  right: 5,
                  bottom: 0,
                  color: '#a2a2a2',
                  fontFamily: 'Allrounder-Grotesk-Book',
                }}>
                {this.props.App.headerRideTypesVars.currentHeaderIndex < 2
                  ? this.props.App.headerRideTypesVars.headerSelectRideTypes[
                      this.props.App.headerRideTypesVars.currentHeaderIndex + 1
                    ]
                  : this.props.App.headerRideTypesVars.headerSelectRideTypes[
                      this.props.App.headerRideTypesVars.headerSelectRideTypes -
                        1
                    ]}
              </Text>
            </AnimatedNative.View>
          );
        } //Deliveries
        else {
          return (
            <AnimatedNative.View
              style={[
                {
                  width: '100%',
                  opacity: this.props.App.titleSelectRideOpacity,
                  transform: [
                    {
                      translateX: this.props.App.titleSelectRidePosition,
                    },
                  ],
                },
              ]}>
              <Text
                style={[
                  {
                    fontSize: 18,
                    width: '100%',
                    textAlign: 'center',
                    color: '#454545',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                {
                  this.props.App.headerRideTypesVars
                    .headerSelectRideTypesDelivery[
                    this.props.App.headerRideTypesVars.currentHeaderIndex
                  ]
                }
              </Text>
              {this.props.App.headerRideTypesVars.currentHeaderIndex > 0 ? (
                <Text
                  style={{
                    position: 'absolute',
                    left: 5,
                    bottom: 0,
                    color: '#a2a2a2',
                    fontFamily: 'Allrounder-Grotesk-Book',
                  }}>
                  {
                    this.props.App.headerRideTypesVars
                      .headerSelectRideTypesDelivery[
                      this.props.App.headerRideTypesVars.currentHeaderIndex - 1
                    ]
                  }
                </Text>
              ) : null}

              <Text
                style={{
                  position: 'absolute',
                  right: 5,
                  bottom: 0,
                  color: '#a2a2a2',
                  fontFamily: 'Allrounder-Grotesk-Book',
                }}>
                {this.props.App.headerRideTypesVars.currentHeaderIndex < 2
                  ? this.props.App.headerRideTypesVars
                      .headerSelectRideTypesDelivery[
                      this.props.App.headerRideTypesVars.currentHeaderIndex + 1
                    ]
                  : this.props.App.headerRideTypesVars
                      .headerSelectRideTypesDelivery[
                      this.props.App.headerRideTypesVars
                        .headerSelectRideTypesDelivery - 1
                    ]}
              </Text>
            </AnimatedNative.View>
          );
        }
      }
    } else if (customStep === 'summary') {
      //Summary bottom vitals
      return (
        <AnimatedNative.Text
          style={[
            {
              fontFamily: 'Allrounder-Grotesk-Medium',
              fontSize: 17.5,
              color: '#454545',
              opacity: this.props.App.titleSummaryOpacity,
              transform: [
                {
                  translateX: this.props.App.titleSummaryPosition,
                },
              ],
            },
          ]}>
          {this.props.App.isEnterCustomFareWindowOn
            ? /RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
              ? "What's your custom fare?"
              : "What's your custom amount?"
            : 'Summary'}
        </AnimatedNative.Text>
      );
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
      (text !== null) & (text[0] !== undefined) &&
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
   * @func selectRideScrollManager
   * Responsible for keeping the right interaction level based on the scroll level.
   */
  selectRideScrollManager(event, globalObject) {
    const referenceWidth = Math.round(event.nativeEvent.contentSize.width);
    const numberOfScreens = Math.round(
      referenceWidth / event.nativeEvent.layoutMeasurement.width,
    );
    let currentOffset = Math.round(event.nativeEvent.contentOffset.x);
    let currentScreen = Math.round(
      currentOffset / event.nativeEvent.layoutMeasurement.width,
    );
    //Check if the screen has changed
    if (
      globalObject.props.App.headerRideTypesVars.currentHeaderIndex !==
      currentScreen
    ) {
      //New state
      //Fade the title quickly and update the state, and reshow the title
      //UpdateRideTypesOnScrollCategories
      AnimatedNative.parallel([
        AnimatedNative.timing(globalObject.props.App.titleSelectRideOpacity, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
        AnimatedNative.timing(globalObject.props.App.titleSelectRidePosition, {
          toValue: 10,
          duration: 60,
          useNativeDriver: true,
        }),
      ]).start(() => {
        //Update state
        globalObject.props.UpdateRideTypesOnScrollCategories({
          currentScreen: currentScreen,
          currentScrollposition: currentOffset,
        });
        //The title back in
        AnimatedNative.parallel([
          AnimatedNative.timing(globalObject.props.App.titleSelectRideOpacity, {
            toValue: 1,
            duration: 60,
            useNativeDriver: true,
          }),
          AnimatedNative.timing(
            globalObject.props.App.titleSelectRidePosition,
            {
              toValue: 0,
              duration: 60,
              useNativeDriver: true,
            },
          ),
        ]).start();
      });
    }
  }

  /**
   * @func renderRideTypeBottomVitals()
   * @params customStep: to customize the title to a non generic element: specifically for the summary
   * Responsible for rendering either the schedule part of the bottom vital booking process or the select
   * car part.
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
  renderRideTypeBottomVitals(customStep = false) {
    if (customStep === false) {
      //No summary
      if (this.props.App.isSelectTripScheduleOn) {
        //Render the scheduler
        return (
          <AnimatedNative.View
            style={{
              alignItems: 'center',
              flex: 1,
              opacity: this.props.App.scheduleRideContentOpacity,
              transform: [
                {
                  translateY: this.props.App.scheduleRideContentPosition,
                },
              ],
            }}>
            <View
              style={{
                flex: 1,
                width: '90%',
                //paddingTop: 15,
                alignItems: 'center',
              }}>
              <>
                {this.props.App.scheduledScenarioContextHeader === 'now' ? (
                  <AnimatedNative.View
                    style={{
                      opacity: this.props.App.scheduledScreenHeaderNowOpacity,
                      transform: [
                        {
                          translateX: this.props.App
                            .scheduledScreenHeaderNowPosition,
                        },
                      ],
                    }}>
                    <View style={{padding: 15}}>
                      <Text
                        style={[
                          {
                            fontSize: 17.5,
                            color: '#096ED4',
                            fontFamily: 'Allrounder-Grotesk-Medium',
                          },
                        ]}>
                        Alright!
                      </Text>
                    </View>
                  </AnimatedNative.View>
                ) : this.props.App.scheduledScenarioContextHeader ===
                  'errorTimeNotSetAhead' ? (
                  <AnimatedNative.View
                    style={{
                      opacity: this.props.App
                        .scheduledScreenHeaderFutureTimeNotSetOpacity,
                      transform: [
                        {
                          translateX: this.props.App
                            .scheduledScreenHeaderFutureTimeNotSetPosition,
                        },
                      ],
                    }}>
                    <View style={{padding: 15}}>
                      <Text
                        style={[
                          {
                            fontSize: 15,
                            color: 'red',
                            fontFamily: 'Allrounder-Grotesk-Book',
                          },
                        ]}>
                        Your time must be at least 15 min ahead
                      </Text>
                    </View>
                  </AnimatedNative.View>
                ) : (
                  <AnimatedNative.View
                    style={{
                      opacity: this.props.App
                        .scheduledScreenHeaderNotNowOpacity,
                      transform: [
                        {
                          translateX: this.props.App
                            .scheduledScreenHeaderNotNowPosition,
                        },
                      ],
                    }}>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.UpdateSchedulerState({
                          isSelectDatePickerActive: true,
                        })
                      }
                      style={{
                        padding: 15,
                        borderWidth: 1,
                        paddingTop: 10,
                        paddingBottom: 11,
                        marginTop: 10,
                        borderColor: '#096ED4',
                        backgroundColor: '#f0f0f0',
                        borderRadius: 7,
                      }}>
                      <Text
                        style={[
                          {
                            fontSize: 17.5,
                            color: '#096ED4',
                            fontFamily: 'Allrounder-Grotesk-Medium',
                          },
                        ]}>
                        {this.props.App.selectedScheduleTime === 'now'
                          ? 'Set your time'
                          : this.ucFirst(this.props.App.selectedScheduleTime)}
                      </Text>
                    </TouchableOpacity>
                  </AnimatedNative.View>
                )}
              </>
              <View style={{flex: 1, width: '100%', bottom: 10}}>
                <TouchableOpacity
                  onPressIn={() => this.reallocateScheduleContextCheck('now')}
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderBottomColor: '#d0d0d0',
                    alignItems: 'center',
                    padding: 15,
                    flex: 1,
                    paddingLeft: 0,
                    paddingRight: 0,
                  }}>
                  <View>
                    <IconCommunity
                      name="checkbox-intermediate"
                      size={18}
                      color={
                        this.props.App.scheduledScenarioContext === 'now'
                          ? '#096ED4'
                          : '#000'
                      }
                      style={{marginRight: 5}}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        {
                          fontSize: 16.5,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        },
                      ]}>
                      {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                        ? 'I want my ride right away'
                        : 'I want my delivery right away'}
                    </Text>
                  </View>
                  {this.renderCheckForScheduleContext('now')}
                </TouchableOpacity>
                <TouchableOpacity
                  onPressIn={() => this.reallocateScheduleContextCheck('today')}
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderBottomColor: '#d0d0d0',
                    alignItems: 'center',
                    padding: 15,
                    flex: 1,
                    paddingLeft: 0,
                    paddingRight: 0,
                  }}>
                  <View>
                    <IconEntypo
                      name="calendar"
                      size={18}
                      color={
                        this.props.App.scheduledScenarioContext === 'today'
                          ? '#096ED4'
                          : '#000'
                      }
                      style={{marginRight: 5}}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        {
                          fontSize: 16.5,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        },
                      ]}>
                      For today
                    </Text>
                  </View>
                  {this.renderCheckForScheduleContext('today')}
                </TouchableOpacity>
                <TouchableOpacity
                  onPressIn={() =>
                    this.reallocateScheduleContextCheck('tomorrow')
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 15,
                    flex: 1,
                    paddingLeft: 0,
                    paddingRight: 0,
                  }}>
                  <View>
                    <IconEntypo
                      name="calendar"
                      color={
                        this.props.App.scheduledScenarioContext === 'tomorrow'
                          ? '#096ED4'
                          : '#000'
                      }
                      size={18}
                      style={{marginRight: 5}}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        {
                          fontSize: 16.5,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        },
                      ]}>
                      For tomorrow
                    </Text>
                  </View>
                  {this.renderCheckForScheduleContext('tomorrow')}
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                width: '100%',
                alignItems: 'center',
                height: 100,
              }}>
              <TouchableOpacity
                onPress={() => this.rideTypeToSchedulerTransistor(false)}
                style={{
                  borderWidth: 1,
                  borderColor: 'transparent',
                  width: '90%',
                }}>
                <View style={[styles.bttnGenericTc]}>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Book',
                      fontSize: 21,
                      fontWeight: 'bold',
                      color: '#fff',
                    }}>
                    Done
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </AnimatedNative.View>
        );
      } //Render select ride type
      else {
        let globalObject = this;
        //Separate RIDE from DELIBERY
        if (/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)) {
          //Rides
          return (
            <AnimatedNative.View
              style={{
                alignItems: 'center',
                flex: 1,
                opacity: this.props.App.selectRideContentOpacity,
                transform: [
                  {
                    translateY: this.props.App.selectRideContentPosition,
                  },
                ],
              }}>
              <View
                style={{
                  flex: 1,
                  width: '90%',
                  alignItems: 'center',
                }}>
                <ScrollView
                  ref={(scroller) => {
                    this.scrollViewSelectRideRef = scroller;
                  }}
                  onScroll={(event) =>
                    this.selectRideScrollManager(event, this)
                  }
                  snapToInterval={this.props.App.windowWidth}
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  horizontal>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      top: '12%',
                      //width: this.props.App.windowWidth,
                      height: 140,
                    }}>
                    {/**ECONOMY */}
                    <View
                      style={{
                        flexDirection: 'row',
                        //flex: 3,
                        justifyContent: 'center',
                        alignItems: 'center',
                        //paddingTop: '10%',
                        width: this.props.App.windowWidth,
                        paddingRight: '3%',
                      }}>
                      {this.props.App.pricingVariables.carTypesPricingMetada
                        .length > 0 ? (
                        this.props.App.pricingVariables.carTypesPricingMetada[0]
                          .response === undefined ? (
                          this.props.App.pricingVariables.carTypesPricingMetada.map(
                            (vehicle) => {
                              if (/Economy/i.test(vehicle.category)) {
                                //AUTOSELECT A CAR TYPE
                                if (
                                  this.props.App.wasRideChoosedByDefault ===
                                  false
                                ) {
                                  this.props.App.wasRideChoosedByDefault = true;
                                  //Do a quick vote based on the availability if the car and auto-scroll to it.
                                  if (
                                    /^available$/.test(vehicle.availability)
                                  ) {
                                    //Update icon and app label name for this vehicle
                                    this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata.iconCarSelected = /normalTaxiEconomy/i.test(
                                      vehicle.car_type,
                                    )
                                      ? this.props.App.carImageNormalRide
                                      : this.props.App.carIconElectricRode; //update car icon
                                    this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata.nameCarSelected =
                                      vehicle.app_label; //Update car name label
                                    //Pick this one
                                    this.props.App.carTypeSelected =
                                      vehicle.car_type;
                                    //VERY IMPORTANT - UPDATE THE FARE
                                    this.props.App.fareTripSelected =
                                      vehicle.base_fare;
                                    if (
                                      vehicle.car_type === 'normalTaxiEconomy'
                                    ) {
                                      this.props.App.colorCircleNormalTaxi =
                                        '#0D8691';
                                      this.props.App.colorBannerRideTypeNormalTaxi =
                                        '#000';
                                      //Update the scales
                                      this.props.App.scaleRideTypeNormalTaxi = new AnimatedNative.Value(
                                        1,
                                      );
                                    } else if (
                                      vehicle.car_type === 'electricEconomy'
                                    ) {
                                      this.props.App.colorCircleElectricCar =
                                        '#0D8691';
                                      this.props.App.colorBannerRideTypeElectricCar =
                                        '#000';
                                      this.props.App.scaleRideTypeElectricTaxi = new AnimatedNative.Value(
                                        1,
                                      );
                                    } else if (
                                      vehicle.car_type === 'comfortNormalRide'
                                    ) {
                                      this.props.App.colorCircleComfortTaxi =
                                        '#0D8691';
                                      this.props.App.colorBannerRideTypeComfortTaxi =
                                        '#000';
                                      this.props.App.scaleRideTypeComfortTaxi = new AnimatedNative.Value(
                                        1,
                                      );
                                    } else if (
                                      vehicle.car_type === 'comfortElectricRide'
                                    ) {
                                      this.props.App.colorCircleElectricComfortCar =
                                        '#0D8691';
                                      this.props.App.colorBannerRideTypeElectricComfortCar =
                                        '#000';
                                      this.props.App.scaleRideTypeElectricComfortTaxi = new AnimatedNative.Value(
                                        1,
                                      );
                                    } else if (
                                      vehicle.car_type === 'luxuryNormalRide'
                                    ) {
                                      this.props.App.colorCircleLuxuryTaxi =
                                        '#0D8691';
                                      this.props.App.colorBannerRideTypeLuxuryTaxi =
                                        '#000';
                                      this.props.App.scaleRideTypeLuxuryTaxi = new AnimatedNative.Value(
                                        1,
                                      );
                                    } else if (
                                      vehicle.car_type === 'luxuryElectricRide'
                                    ) {
                                      this.props.App.colorCircleElectricLuxuryCar =
                                        '#0D8691';
                                      this.props.App.colorBannerRideTypeElectricLuxuryCar =
                                        '#000';
                                      this.props.App.scaleRideTypeElectricLuxuryTaxi = new AnimatedNative.Value(
                                        1,
                                      );
                                    }
                                  }
                                }
                                return (
                                  <AnimatedNative.View
                                    key={vehicle.id}
                                    style={{
                                      flex: 1,
                                      transform: [
                                        {
                                          scaleX: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /normalTaxiEconomy/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeNormalTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricTaxi
                                            : 0.9,
                                        },
                                        {
                                          scaleY: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /normalTaxiEconomy/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeNormalTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricTaxi
                                            : 0.9,
                                        },
                                      ],
                                    }}>
                                    <TouchableOpacity
                                      activeOpacity={1}
                                      onPress={() =>
                                        /^available$/i.test(
                                          vehicle.availability,
                                        )
                                          ? this.handleChooseCarType(
                                              vehicle.car_type,
                                              vehicle.base_fare,
                                              /normalTaxiEconomy/i.test(
                                                vehicle.car_type,
                                              )
                                                ? this.props.App
                                                    .carImageNormalRide
                                                : this.props.App
                                                    .carIconElectricRode,
                                              vehicle.app_label,
                                            )
                                          : {}
                                      }
                                      style={{
                                        height: 150,
                                        flex: 1,
                                        alignItems: 'center',
                                      }}>
                                      <View
                                        style={{
                                          alignItems: 'center',
                                          width: 85,
                                          height: 85,
                                          borderWidth: 2,
                                          borderColor: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /normalTaxiEconomy/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .colorCircleNormalTaxi
                                              : this.props.App
                                                  .colorCircleElectricCar
                                            : '#a2a2a2',
                                          borderRadius: 200,
                                        }}>
                                        <Image
                                          source={
                                            /normalTaxiEconomy/i.test(
                                              vehicle.car_type,
                                            )
                                              ? this.props.App
                                                  .carImageNormalRide
                                              : this.props.App
                                                  .carIconElectricRode
                                          }
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: 200,
                                            resizeMode: 'contain',
                                          }}
                                        />
                                        <View
                                          style={{
                                            width: 95,
                                            padding: 7,
                                            borderRadius: 200,
                                            backgroundColor: /^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? /normalTaxiEconomy/i.test(
                                                  vehicle.car_type,
                                                )
                                                ? this.props.App
                                                    .colorBannerRideTypeNormalTaxi
                                                : this.props.App
                                                    .colorBannerRideTypeElectricCar
                                              : '#a2a2a2',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bottom: 15,
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                color: '#fff',
                                                fontSize: 14,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Book',
                                              },
                                            ]}>
                                            {vehicle.app_label}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: 100,
                                            alignItems: 'center',
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                fontSize: 17,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Medium',
                                                color: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? /normalTaxiEconomy/i.test(
                                                      vehicle.car_type,
                                                    )
                                                    ? this.props.App
                                                        .colorBannerRideTypeNormalTaxi
                                                    : this.props.App
                                                        .colorBannerRideTypeElectricCar
                                                  : '#a2a2a2',
                                              },
                                            ]}>
                                            {/^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? 'N$ ' + vehicle.base_fare
                                              : vehicle.availability[0].toUpperCase() +
                                                vehicle.availability.substring(
                                                  1,
                                                )}
                                          </Text>
                                        </View>
                                      </View>
                                    </TouchableOpacity>
                                  </AnimatedNative.View>
                                );
                              }
                            },
                          )
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Allrounder-Grotesk-Book',
                              fontSize: 17,
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Internet connection error
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'Allrounder-Grotesk-Book',
                            fontSize: 17,
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          Estimating your fares, hold on...
                        </Text>
                      )}
                    </View>

                    {/*COMFORT*/}
                    <View
                      style={{
                        flexDirection: 'row',
                        //flex: 3,
                        justifyContent: 'center',
                        alignItems: 'center',
                        //paddingTop: '10%',
                        width: this.props.App.windowWidth,
                        paddingRight: '3%',
                      }}>
                      {this.props.App.pricingVariables.carTypesPricingMetada
                        .length > 0 ? (
                        this.props.App.pricingVariables.carTypesPricingMetada[0]
                          .response === undefined ? (
                          this.props.App.pricingVariables.carTypesPricingMetada.map(
                            (vehicle) => {
                              if (/Comfort/i.test(vehicle.category)) {
                                return (
                                  <AnimatedNative.View
                                    key={vehicle.id}
                                    style={{
                                      flex: 1,
                                      transform: [
                                        {
                                          scaleX: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /comfortNormalRide/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeComfortTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricComfortTaxi
                                            : 0.9,
                                        },
                                        {
                                          scaleY: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /comfortNormalRide/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeComfortTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricComfortTaxi
                                            : 0.9,
                                        },
                                      ],
                                    }}>
                                    <TouchableOpacity
                                      activeOpacity={1}
                                      onPress={() =>
                                        /^available$/i.test(
                                          vehicle.availability,
                                        )
                                          ? this.handleChooseCarType(
                                              vehicle.car_type,
                                              vehicle.base_fare,
                                              /comfortNormalRide/i.test(
                                                vehicle.car_type,
                                              )
                                                ? this.props.App
                                                    .comfortrideNormal
                                                : this.props.App
                                                    .comfortrideElectric,
                                              vehicle.app_label,
                                            )
                                          : {}
                                      }
                                      style={{
                                        height: 150,
                                        flex: 1,
                                        alignItems: 'center',
                                      }}>
                                      <View
                                        style={{
                                          alignItems: 'center',
                                          width: 85,
                                          height: 85,
                                          borderWidth: 2,
                                          borderColor: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /comfortNormalRide/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .colorCircleComfortTaxi
                                              : this.props.App
                                                  .colorCircleElectricComfortCar
                                            : '#a2a2a2',
                                          borderRadius: 200,
                                        }}>
                                        <Image
                                          source={
                                            /comfortNormalRide/i.test(
                                              vehicle.car_type,
                                            )
                                              ? this.props.App.comfortrideNormal
                                              : this.props.App
                                                  .comfortrideElectric
                                          }
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: 200,
                                            borderTopLeftRadius: /comfortNormalRide/i.test(
                                              vehicle.car_type,
                                            )
                                              ? 169
                                              : 179,
                                            borderBottomLeftRadius: /comfortNormalRide/i.test(
                                              vehicle.car_type,
                                            )
                                              ? 170
                                              : 175,
                                            resizeMode: 'contain',
                                          }}
                                        />
                                        <View
                                          style={{
                                            width: 95,
                                            padding: 7,
                                            borderRadius: 200,
                                            backgroundColor: /^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? /comfortNormalRide/i.test(
                                                  vehicle.car_type,
                                                )
                                                ? this.props.App
                                                    .colorBannerRideTypeComfortTaxi
                                                : this.props.App
                                                    .colorBannerRideTypeElectricComfortCar
                                              : '#a2a2a2',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bottom: 15,
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                color: '#fff',
                                                fontSize: 14,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Book',
                                              },
                                            ]}>
                                            {vehicle.app_label}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: 100,
                                            alignItems: 'center',
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                fontSize: 17,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Medium',
                                                color: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? /comfortNormalRide/i.test(
                                                      vehicle.car_type,
                                                    )
                                                    ? this.props.App
                                                        .colorBannerRideTypeComfortTaxi
                                                    : this.props.App
                                                        .colorBannerRideTypeElectricComfortCar
                                                  : '#a2a2a2',
                                              },
                                            ]}>
                                            {/^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? 'N$ ' + vehicle.base_fare
                                              : vehicle.availability[0].toUpperCase() +
                                                vehicle.availability.substring(
                                                  1,
                                                )}
                                          </Text>
                                        </View>
                                      </View>
                                    </TouchableOpacity>
                                  </AnimatedNative.View>
                                );
                              }
                            },
                          )
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Allrounder-Grotesk-Book',
                              fontSize: 17,
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Internet connection error
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'Allrounder-Grotesk-Book',
                            fontSize: 17,
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          Estimating your fares, hold on...
                        </Text>
                      )}
                    </View>

                    {/** LUXURY */}
                    <View
                      style={{
                        flexDirection: 'row',
                        //flex: 3,
                        justifyContent: 'center',
                        alignItems: 'center',
                        //paddingTop: '10%',
                        width: this.props.App.windowWidth,
                        paddingRight: '3%',
                      }}>
                      {this.props.App.pricingVariables.carTypesPricingMetada
                        .length > 0 ? (
                        this.props.App.pricingVariables.carTypesPricingMetada[0]
                          .response === undefined ? (
                          this.props.App.pricingVariables.carTypesPricingMetada.map(
                            (vehicle) => {
                              if (/Luxury/i.test(vehicle.category)) {
                                return (
                                  <AnimatedNative.View
                                    key={vehicle.id}
                                    style={{
                                      flex: 1,
                                      transform: [
                                        {
                                          scaleX: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /luxuryNormalRide/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeLuxuryTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricLuxuryTaxi
                                            : 0.9,
                                        },
                                        {
                                          scaleY: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /luxuryNormalRide/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeLuxuryTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricLuxuryTaxi
                                            : 0.9,
                                        },
                                      ],
                                    }}>
                                    <TouchableOpacity
                                      activeOpacity={1}
                                      onPress={() =>
                                        /^available$/i.test(
                                          vehicle.availability,
                                        )
                                          ? this.handleChooseCarType(
                                              vehicle.car_type,
                                              vehicle.base_fare,
                                              /luxuryNormalRide/i.test(
                                                vehicle.car_type,
                                              )
                                                ? this.props.App
                                                    .luxuryRideNormal
                                                : this.props.App
                                                    .luxuryRideElectric,
                                              vehicle.app_label,
                                            )
                                          : {}
                                      }
                                      style={{
                                        height: 150,
                                        flex: 1,
                                        alignItems: 'center',
                                      }}>
                                      <View
                                        style={{
                                          alignItems: 'center',
                                          width: 85,
                                          height: 85,
                                          borderWidth: 2,
                                          borderColor: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /luxuryNormalRide/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .colorCircleLuxuryTaxi
                                              : this.props.App
                                                  .colorCircleElectricLuxuryCar
                                            : '#a2a2a2',
                                          borderRadius: 200,
                                        }}>
                                        <Image
                                          source={
                                            /luxuryNormalRide/i.test(
                                              vehicle.car_type,
                                            )
                                              ? this.props.App.luxuryRideNormal
                                              : this.props.App
                                                  .luxuryRideElectric
                                          }
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: 200,
                                            resizeMode: 'contain',
                                          }}
                                        />
                                        <View
                                          style={{
                                            width: 95,
                                            padding: 7,
                                            borderRadius: 200,
                                            backgroundColor: /^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? /luxuryNormalRide/i.test(
                                                  vehicle.car_type,
                                                )
                                                ? this.props.App
                                                    .colorBannerRideTypeLuxuryTaxi
                                                : this.props.App
                                                    .colorBannerRideTypeElectricLuxuryCar
                                              : '#a2a2a2',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bottom: 15,
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                color: '#fff',
                                                fontSize: 14,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Book',
                                              },
                                            ]}>
                                            {vehicle.app_label}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: 100,
                                            alignItems: 'center',
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                fontSize: 17,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Medium',
                                                color: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? /luxuryNormalRide/i.test(
                                                      vehicle.car_type,
                                                    )
                                                    ? this.props.App
                                                        .colorBannerRideTypeLuxuryTaxi
                                                    : this.props.App
                                                        .colorBannerRideTypeElectricLuxuryCar
                                                  : '#a2a2a2',
                                              },
                                            ]}>
                                            {/^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? 'N$ ' + vehicle.base_fare
                                              : vehicle.availability[0].toUpperCase() +
                                                vehicle.availability.substring(
                                                  1,
                                                )}
                                          </Text>
                                        </View>
                                      </View>
                                    </TouchableOpacity>
                                  </AnimatedNative.View>
                                );
                              }
                            },
                          )
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Allrounder-Grotesk-Book',
                              fontSize: 17,
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Internet connection error
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'Allrounder-Grotesk-Book',
                            fontSize: 17,
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          Estimating your fares, hold on...
                        </Text>
                      )}
                    </View>
                  </View>
                </ScrollView>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderColor: '#d0d0d0',
                    marginTop: 5,
                    paddingTop: 0,
                    paddingBottom: 5,
                    width: '95%',
                  }}>
                  <View style={{border: 1, flexDirection: 'row', flex: 1}}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                        paddingRight: 15,
                        paddingLeft: 0,
                      }}>
                      <IconMaterialIcons
                        name="credit-card"
                        size={22}
                        style={{marginRight: 3}}
                      />
                      <Text
                        style={[
                          {
                            fontSize: 17,
                            color: '#0D8691',
                            fontFamily: 'Allrounder-Grotesk-Regular',
                          },
                        ]}>
                        Wallet
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                      }}>
                      <IconAnt name="user" size={15} style={{marginRight: 3}} />
                      <Text
                        style={[
                          {
                            fontSize: 17,
                            fontFamily: 'Allrounder-Grotesk-Regular',
                          },
                        ]}>
                        {
                          this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                            .numberOfPassengersSelected
                        }
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => this.rideTypeToSchedulerTransistor(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      padding: 5,
                      paddingLeft: 15,
                      paddingRight: 0,
                    }}>
                    <IconFeather
                      name="clock"
                      size={18}
                      style={{marginRight: 3}}
                    />
                    <Text
                      style={[
                        {
                          fontSize: 15.5,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        },
                      ]}>
                      {this.props.App.selectedScheduleTime === 'now'
                        ? 'Schedule'
                        : this.ucFirst(this.props.App.selectedScheduleTime)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  height: 100,
                }}>
                <TouchableOpacity
                  onPress={() => this.rerouteBookingProcessFlow('next', 'RIDE')}
                  style={{
                    borderWidth: 1,
                    borderColor: 'transparent',
                    width: '90%',
                  }}>
                  <View style={[styles.bttnGenericTc]}>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Book',
                        fontSize: 21,
                        fontWeight: 'bold',
                        color: '#fff',
                      }}>
                      Next
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </AnimatedNative.View>
          );
        } //Deliveries
        else {
          return (
            <AnimatedNative.View
              style={{
                alignItems: 'center',
                flex: 1,
                opacity: this.props.App.selectRideContentOpacity,
                transform: [
                  {
                    translateY: this.props.App.selectRideContentPosition,
                  },
                ],
              }}>
              <View
                style={{
                  flex: 1,
                  width: '90%',
                  alignItems: 'center',
                }}>
                <ScrollView
                  ref={(scroller) => {
                    this.scrollViewSelectRideRef = scroller;
                  }}
                  onScroll={(event) =>
                    this.selectRideScrollManager(event, this)
                  }
                  snapToInterval={this.props.App.windowWidth}
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  horizontal>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      top: '12%',
                      //width: this.props.App.windowWidth,
                      height: 140,
                    }}>
                    {/**ECONOMY->STANDARD */}
                    <View
                      style={{
                        flexDirection: 'row',
                        //flex: 3,
                        justifyContent: 'center',
                        alignItems: 'center',
                        //paddingTop: '10%',
                        width: this.props.App.windowWidth,
                        paddingRight: '3%',
                      }}>
                      {this.props.App.pricingVariables.carTypesPricingMetada
                        .length > 0 ? (
                        this.props.App.pricingVariables.carTypesPricingMetada[0]
                          .response === undefined ? (
                          this.props.App.pricingVariables.carTypesPricingMetada.map(
                            (vehicle) => {
                              if (/Economy/i.test(vehicle.category)) {
                                //AUTOSELECT A CAR TYPE
                                if (
                                  this.props.App.wasRideChoosedByDefault ===
                                  false
                                ) {
                                  this.props.App.wasRideChoosedByDefault = true;
                                  //Do a quick vote based on the availability if the car and auto-scroll to it.
                                  if (
                                    /^available$/.test(vehicle.availability)
                                  ) {
                                    //Update icon and app label name for this vehicle
                                    this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata.iconCarSelected = /electricBikes/i.test(
                                      vehicle.car_type,
                                    )
                                      ? this.props.App.bikesdeliveryElectric
                                      : this.props.App.bikesdeliveryNormal; //update car icon
                                    this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata.nameCarSelected =
                                      vehicle.app_label; //Update car name label
                                    //Pick this one
                                    this.props.App.carTypeSelected =
                                      vehicle.car_type;
                                    //VERY IMPORTANT - UPDATE THE FARE
                                    this.props.App.fareTripSelected =
                                      vehicle.base_fare;
                                    if (vehicle.car_type === 'electricBikes') {
                                      this.props.App.colorCircleNormalTaxi =
                                        '#0D8691';
                                      this.props.App.colorBannerRideTypeNormalTaxi =
                                        '#000';
                                      //Update the scales
                                      this.props.App.scaleRideTypeNormalTaxi = new AnimatedNative.Value(
                                        1,
                                      );
                                    } else if (vehicle.car_type === 'bikes') {
                                      this.props.App.colorCircleElectricCar =
                                        '#0D8691';
                                      this.props.App.colorBannerRideTypeElectricCar =
                                        '#000';
                                      this.props.App.scaleRideTypeElectricTaxi = new AnimatedNative.Value(
                                        1,
                                      );
                                    }
                                  }
                                }
                                return (
                                  <AnimatedNative.View
                                    key={vehicle.id}
                                    style={{
                                      flex: 1,
                                      transform: [
                                        {
                                          scaleX: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /electricBikes/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeNormalTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricTaxi
                                            : 0.9,
                                        },
                                        {
                                          scaleY: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /electricBikes/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeNormalTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricTaxi
                                            : 0.9,
                                        },
                                      ],
                                    }}>
                                    <TouchableOpacity
                                      activeOpacity={1}
                                      onPress={() =>
                                        /^available$/i.test(
                                          vehicle.availability,
                                        )
                                          ? this.handleChooseCarType(
                                              vehicle.car_type,
                                              vehicle.base_fare,
                                              /electricBikes/i.test(
                                                vehicle.car_type,
                                              )
                                                ? this.props.App
                                                    .bikesdeliveryElectric
                                                : this.props.App
                                                    .bikesdeliveryNormal,
                                              vehicle.app_label,
                                            )
                                          : {}
                                      }
                                      style={{
                                        height: 150,
                                        flex: 1,
                                        alignItems: 'center',
                                      }}>
                                      <View
                                        style={{
                                          alignItems: 'center',
                                          width: 85,
                                          height: 85,
                                          borderWidth: 2,
                                          borderColor: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /electricBikes/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .colorCircleNormalTaxi
                                              : this.props.App
                                                  .colorCircleElectricCar
                                            : '#a2a2a2',
                                          borderRadius: 200,
                                        }}>
                                        <Image
                                          source={
                                            /electricBikes/i.test(
                                              vehicle.car_type,
                                            )
                                              ? this.props.App
                                                  .bikesdeliveryElectric
                                              : this.props.App
                                                  .bikesdeliveryNormal
                                          }
                                          style={{
                                            width: '80%',
                                            height: '80%',
                                            marginBottom: '20%',
                                            borderRadius: /electricBikes/i.test(
                                              vehicle.car_type,
                                            )
                                              ? 150
                                              : 40,
                                            top: 5,
                                            resizeMode: 'contain',
                                          }}
                                        />
                                        <View
                                          style={{
                                            width: 95,
                                            padding: 7,
                                            borderRadius: 200,
                                            backgroundColor: /^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? /electricBikes/i.test(
                                                  vehicle.car_type,
                                                )
                                                ? this.props.App
                                                    .colorBannerRideTypeNormalTaxi
                                                : this.props.App
                                                    .colorBannerRideTypeElectricCar
                                              : '#a2a2a2',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bottom: 15,
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                color: '#fff',
                                                fontSize: 14,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Book',
                                              },
                                            ]}>
                                            {vehicle.app_label}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: 100,
                                            alignItems: 'center',
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                fontFamily:
                                                  'Allrounder-Grotesk-Medium',
                                                fontSize: 17,
                                                color: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? /electricBikes/i.test(
                                                      vehicle.car_type,
                                                    )
                                                    ? this.props.App
                                                        .colorBannerRideTypeNormalTaxi
                                                    : this.props.App
                                                        .colorBannerRideTypeElectricCar
                                                  : '#a2a2a2',
                                              },
                                            ]}>
                                            {/^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? 'N$ ' + vehicle.base_fare
                                              : vehicle.availability[0].toUpperCase() +
                                                vehicle.availability.substring(
                                                  1,
                                                )}
                                          </Text>
                                        </View>
                                      </View>
                                    </TouchableOpacity>
                                  </AnimatedNative.View>
                                );
                              }
                            },
                          )
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Allrounder-Grotesk-Book',
                              fontSize: 17,
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Internet connection error
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'Allrounder-Grotesk-Book',
                            fontSize: 17,
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          Estimating your fares, hold on...
                        </Text>
                      )}
                    </View>

                    {/*COMFORT*/}
                    <View
                      style={{
                        flexDirection: 'row',
                        //flex: 3,
                        justifyContent: 'center',
                        alignItems: 'center',
                        //paddingTop: '10%',
                        width: this.props.App.windowWidth,
                        paddingRight: '3%',
                      }}>
                      {this.props.App.pricingVariables.carTypesPricingMetada
                        .length > 0 ? (
                        this.props.App.pricingVariables.carTypesPricingMetada[0]
                          .response === undefined ? (
                          this.props.App.pricingVariables.carTypesPricingMetada.map(
                            (vehicle) => {
                              if (/Comfort/i.test(vehicle.category)) {
                                return (
                                  <AnimatedNative.View
                                    key={vehicle.id}
                                    style={{
                                      flex: 1,
                                      transform: [
                                        {
                                          scaleX: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /carDelivery/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeComfortTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricComfortTaxi
                                            : 0.9,
                                        },
                                        {
                                          scaleY: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /carDelivery/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .scaleRideTypeComfortTaxi
                                              : this.props.App
                                                  .scaleRideTypeElectricComfortTaxi
                                            : 0.9,
                                        },
                                      ],
                                    }}>
                                    <TouchableOpacity
                                      activeOpacity={1}
                                      onPress={() =>
                                        /^available$/i.test(
                                          vehicle.availability,
                                        )
                                          ? this.handleChooseCarType(
                                              vehicle.car_type,
                                              vehicle.base_fare,
                                              /carDelivery/i.test(
                                                vehicle.car_type,
                                              )
                                                ? this.props.App
                                                    .cardeliveryNormal
                                                : this.props.App
                                                    .vandeliveryNormal,
                                              vehicle.app_label,
                                            )
                                          : {}
                                      }
                                      style={{
                                        height: 150,
                                        flex: 1,
                                        alignItems: 'center',
                                      }}>
                                      <View
                                        style={{
                                          alignItems: 'center',
                                          width: 85,
                                          height: 85,
                                          borderWidth: 2,
                                          borderColor: /^available$/i.test(
                                            vehicle.availability,
                                          )
                                            ? /carDelivery/i.test(
                                                vehicle.car_type,
                                              )
                                              ? this.props.App
                                                  .colorCircleComfortTaxi
                                              : this.props.App
                                                  .colorCircleElectricComfortCar
                                            : '#a2a2a2',
                                          borderRadius: 200,
                                        }}>
                                        <Image
                                          source={
                                            /carDelivery/i.test(
                                              vehicle.car_type,
                                            )
                                              ? this.props.App.cardeliveryNormal
                                              : this.props.App.vandeliveryNormal
                                          }
                                          style={{
                                            width: /carDelivery/i.test(
                                              vehicle.car_type,
                                            )
                                              ? '100%'
                                              : '80%',
                                            height: /carDelivery/i.test(
                                              vehicle.car_type,
                                            )
                                              ? '100%'
                                              : '80%',
                                            borderRadius: 200,
                                            marginBottom: /carDelivery/i.test(
                                              vehicle.car_type,
                                            )
                                              ? 0
                                              : '20%',
                                            top: /carDelivery/i.test(
                                              vehicle.car_type,
                                            )
                                              ? 0
                                              : 6,
                                            borderTopLeftRadius: /carDelivery/i.test(
                                              vehicle.car_type,
                                            )
                                              ? 169
                                              : 179,
                                            borderBottomLeftRadius: /carDelivery/i.test(
                                              vehicle.car_type,
                                            )
                                              ? 170
                                              : 175,
                                            resizeMode: 'contain',
                                          }}
                                        />
                                        <View
                                          style={{
                                            width: 95,
                                            padding: 7,
                                            borderRadius: 200,
                                            backgroundColor: /^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? /carDelivery/i.test(
                                                  vehicle.car_type,
                                                )
                                                ? this.props.App
                                                    .colorBannerRideTypeComfortTaxi
                                                : this.props.App
                                                    .colorBannerRideTypeElectricComfortCar
                                              : '#a2a2a2',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bottom: 15,
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                color: '#fff',
                                                fontSize: 14,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Book',
                                              },
                                            ]}>
                                            {vehicle.app_label}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            width: 100,
                                            alignItems: 'center',
                                          }}>
                                          <Text
                                            style={[
                                              {
                                                fontFamily:
                                                  'Allrounder-Grotesk-Book',
                                                fontSize: 17,
                                                color: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? /carDelivery/i.test(
                                                      vehicle.car_type,
                                                    )
                                                    ? this.props.App
                                                        .colorBannerRideTypeComfortTaxi
                                                    : this.props.App
                                                        .colorBannerRideTypeElectricComfortCar
                                                  : '#a2a2a2',
                                              },
                                            ]}>
                                            {/^available$/i.test(
                                              vehicle.availability,
                                            )
                                              ? 'N$ ' + vehicle.base_fare
                                              : vehicle.availability[0].toUpperCase() +
                                                vehicle.availability.substring(
                                                  1,
                                                )}
                                          </Text>
                                        </View>
                                      </View>
                                    </TouchableOpacity>
                                  </AnimatedNative.View>
                                );
                              }
                            },
                          )
                        ) : (
                          <Text
                            style={{
                              fontFamily: 'Allrounder-Grotesk-Book',
                              fontSize: 17,
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Internet connection error
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'Allrounder-Grotesk-Book',
                            fontSize: 17,
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          Estimating your fares, hold on...
                        </Text>
                      )}
                    </View>
                  </View>
                </ScrollView>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderColor: '#d0d0d0',
                    marginTop: 5,
                    paddingTop: 0,
                    paddingBottom: 5,
                    width: '95%',
                  }}>
                  <View style={{border: 1, flexDirection: 'row', flex: 1}}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                        paddingRight: 15,
                        paddingLeft: 0,
                      }}>
                      <IconMaterialIcons
                        name="credit-card"
                        size={22}
                        style={{marginRight: 3}}
                      />
                      <Text
                        style={[
                          {
                            fontSize: 17,
                            color: '#0D8691',
                            fontFamily: 'Allrounder-Grotesk-Regular',
                          },
                        ]}>
                        Wallet
                      </Text>
                    </TouchableOpacity>

                    {/RIDE/i.test(
                      this.props.App.bottomVitalsFlow.flowParent,
                    ) ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 5,
                        }}>
                        <IconEntypo
                          name="user"
                          size={15}
                          style={{marginRight: 3}}
                        />
                        <Text
                          style={[
                            systemWeights.regular,
                            {fontSize: 17, top: 1},
                          ]}>
                          {
                            this.props.App.bottomVitalsFlow
                              .rideOrDeliveryMetadata.numberOfPassengersSelected
                          }
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => this.rideTypeToSchedulerTransistor(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      padding: 5,
                      paddingLeft: 15,
                      paddingRight: 0,
                    }}>
                    <IconFeather
                      name="clock"
                      size={18}
                      style={{marginRight: 3}}
                    />
                    <Text
                      style={[
                        {fontSize: 15, fontFamily: 'Allrounder-Grotesk-Book'},
                      ]}>
                      {this.props.App.selectedScheduleTime === 'now'
                        ? 'Schedule'
                        : this.ucFirst(this.props.App.selectedScheduleTime)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  height: 100,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.rerouteBookingProcessFlow('next', 'DELIVERY')
                  }
                  style={{
                    borderWidth: 1,
                    borderColor: 'transparent',
                    width: '90%',
                  }}>
                  <View style={[styles.bttnGenericTc]}>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Book',
                        fontSize: 21,
                        fontWeight: 'bold',
                        color: '#fff',
                      }}>
                      Next
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </AnimatedNative.View>
          );
        }
      }
    } //Summary
    else if (customStep === 'summary') {
      return (
        <AnimatedNative.View
          style={{
            alignItems: 'center',
            flex: 1,
            opacity: this.props.App.summaryContentOpacity,
            transform: [
              {
                translateY: this.props.App.summaryContentPosition,
              },
            ],
          }}>
          <View
            style={{
              flex: 1,
              width: '90%',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: '90%',
              }}>
              {this.renderSummarySelectedCarType()}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              height: 100,
            }}>
            <TouchableOpacity
              onPress={() =>
                this.connectToTaxiGenericButtonAction(
                  /RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                    ? 'RIDE'
                    : 'DELIVERY',
                )
              }
              style={{
                borderWidth: 1,
                borderColor: 'transparent',
                width: '90%',
              }}>
              <View style={[styles.bttnGenericTc]}>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Book',
                    fontSize: 21,
                    fontWeight: 'bold',
                    color: '#fff',
                  }}>
                  {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                    ? 'Connect to your ride'
                    : 'Request for delivery'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </AnimatedNative.View>
      );
    } else if (customStep === 'enterCustomFare') {
      //To enter custom fare
      return (
        <AnimatedNative.View
          style={{
            alignItems: 'center',
            flex: 1,
            opacity: this.props.App.summaryContentOpacity,
            transform: [
              {
                translateY: this.props.App.summaryContentPosition,
              },
            ],
          }}>
          <View
            style={{
              flex: 1,
              width: '90%',
              alignItems: 'center',
            }}>
            <View
              style={{
                flex: 1,
                //justifyContent: 'center',
                alignItems: 'center',
                width: '90%',
                marginTop: '10%',
              }}>
              <TextInput
                placeholder="Enter your fare (N$)"
                keyboardType={'number-pad'}
                maxLength={3}
                onChangeText={(text) =>
                  (this.props.App.customStringTypedTMP = text)
                }
                style={[
                  {
                    borderWidth: 1,
                    borderRadius: 4,
                    borderColor: '#d0d0d0',
                    fontSize: 18,
                    padding: 15,
                    height: 50,
                    width: 250,
                    fontFamily: 'Allrounder-Grotesk-Book',
                  },
                ]}
              />
              <View style={{flexDirection: 'row', marginTop: 30}}>
                <IconFeather
                  name="info"
                  size={16}
                  style={{marginRight: 4, top: 2}}
                />
                <Text
                  style={[
                    {fontSize: 15, fontFamily: 'Allrounder-Grotesk-Book'},
                  ]}>
                  Your minimum fare is{' '}
                  <Text style={[{fontFamily: 'Allrounder-Grotesk-Medium'}]}>
                    N${this.props.App.fareTripSelected}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              height: 100,
            }}>
            <TouchableOpacity
              onPress={() =>
                this.switchToEnterCustomFare(false, 'considerCustomFare')
              }
              style={{
                borderWidth: 1,
                borderColor: 'transparent',
                width: '90%',
              }}>
              <View style={[styles.bttnGenericTc]}>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Book',
                    fontSize: 21,
                    fontWeight: 'bold',
                    color: '#fff',
                  }}>
                  Done
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </AnimatedNative.View>
      );
    } else if (customStep === 'delivery') {
      return (
        <AnimatedNative.View
          style={{
            alignItems: 'center',
            flex: 1,
            opacity: this.props.App.selectRideContentOpacity,
            transform: [
              {
                translateY: this.props.App.selectRideContentPosition,
              },
            ],
          }}>
          <View
            style={{
              flex: 1,
              width: '90%',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                flex: 3,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: '10%',
                width: '90%',
              }}>
              <AnimatedNative.View
                style={{
                  flex: 1,
                  transform: [
                    {scaleX: this.props.App.scaleRideTypeNormalTaxi},
                    {scaleY: this.props.App.scaleRideTypeNormalTaxi},
                  ],
                }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPressIn={() =>
                    this.handleChooseCarType('normalTaxiEconomy')
                  }
                  style={{
                    height: 150,
                    flex: 1,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      width: 85,
                      height: 85,
                      borderWidth: 2,
                      borderColor: this.props.App.colorCircleNormalTaxi,
                      borderRadius: 200,
                    }}>
                    <Image
                      source={this.props.App.carImageNormalRide}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 200,
                        borderTopLeftRadius: 169,
                        borderBottomLeftRadius: 170,
                        resizeMode: 'contain',
                      }}
                    />
                    <View
                      style={{
                        width: 95,
                        padding: 7,
                        borderRadius: 200,
                        backgroundColor: this.props.App
                          .colorBannerRideTypeNormalTaxi,
                        alignItems: 'center',
                        justifyContent: 'center',
                        bottom: 15,
                      }}>
                      <Text
                        style={[
                          systemWeights.light,
                          {color: '#fff', fontSize: 13},
                        ]}>
                        Normal Taxi
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          systemWeights.semibold,
                          {
                            fontSize: 17,
                            color: this.props.App.colorBannerRideTypeNormalTaxi,
                          },
                        ]}>
                        N${' '}
                        {
                          this.props.App.bottomVitalsFlow.basicCarTypesTripFares
                            .normalTaxiEconomyDelivery
                        }
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </AnimatedNative.View>

              <AnimatedNative.View
                style={{
                  flex: 1,
                  transform: [
                    {scaleX: this.props.App.scaleRideTypeElectricTaxi},
                    {scaleY: this.props.App.scaleRideTypeElectricTaxi},
                  ],
                }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPressIn={() => this.handleChooseCarType('electricEconomy')}
                  style={{
                    height: 150,
                    flex: 1,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      width: 85,
                      height: 85,
                      borderWidth: 2,
                      borderColor: this.props.App.colorCircleElectricCar,
                      borderRadius: 200,
                    }}>
                    <Image
                      source={this.props.App.carIconElectricRode}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 400,
                        resizeMode: 'contain',
                      }}
                    />
                    <View
                      style={{
                        width: 95,
                        padding: 7,
                        borderRadius: 200,
                        backgroundColor: this.props.App
                          .colorBannerRideTypeElectricCar,
                        alignItems: 'center',
                        justifyContent: 'center',
                        bottom: 15,
                      }}>
                      <Text
                        style={[
                          systemWeights.light,
                          {color: '#fff', fontSize: 13},
                        ]}>
                        E-Bikes
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          systemWeights.semibold,
                          {
                            fontSize: 17,
                            color: this.props.App
                              .colorBannerRideTypeElectricCar,
                          },
                        ]}>
                        N${' '}
                        {
                          this.props.App.bottomVitalsFlow.basicCarTypesTripFares
                            .electricEconomyDelivery
                        }
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </AnimatedNative.View>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                borderTopWidth: 1,
                borderColor: '#d0d0d0',
                marginTop: 10,
                paddingTop: 0,
                paddingBottom: 5,
                width: '95%',
              }}>
              <View style={{border: 1, flexDirection: 'row', flex: 1}}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 5,
                    paddingRight: 15,
                    paddingLeft: 0,
                  }}>
                  <IconAnt
                    name="creditcard"
                    size={22}
                    style={{marginRight: 3}}
                  />
                  <Text
                    style={[
                      systemWeights.semibold,
                      {fontSize: 17, top: 1, color: '#0D8691'},
                    ]}>
                    Wallet
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => this.rideTypeToSchedulerTransistor(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: 5,
                  paddingLeft: 15,
                  paddingRight: 0,
                }}>
                <IconFeather name="clock" size={18} style={{marginRight: 3}} />
                <Text style={[systemWeights.light, {fontSize: 15, top: 1}]}>
                  {this.props.App.selectedScheduleTime === 'now'
                    ? 'Schedule'
                    : this.ucFirst(this.props.App.selectedScheduleTime)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              height: 100,
            }}>
            <TouchableOpacity
              onPress={() => this.rerouteBookingProcessFlow('next', 'RIDE')}
              style={{
                borderWidth: 1,
                borderColor: 'transparent',
                width: '90%',
              }}>
              <View style={[styles.bttnGenericTc]}>
                <Text
                  style={[
                    systemWeights.semibold,
                    {fontSize: 20, color: '#fff'},
                  ]}>
                  Deliver your package
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </AnimatedNative.View>
      );
    }
  }

  /**
   * @func switchToEnterCustomFare()
   * @params setTo: to indicate whether to show custom fare screen (true) or not (false)
   * @params extraAction (default: false) - like "considerCustomFare" to validate and update if good custom fare entered by the user.
   * Responsible for switching main summary screen to enter custom fare one
   */
  switchToEnterCustomFare(setTo, extraAction = false) {
    let globalObject = this;

    //Show enter custom fare
    AnimatedNative.parallel([
      AnimatedNative.timing(this.props.App.summaryContentOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }),
      AnimatedNative.timing(this.props.App.summaryContentPosition, {
        toValue: 20,
        duration: 250,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }),
      AnimatedNative.timing(this.props.App.titleSummaryOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }),
      AnimatedNative.timing(this.props.App.titleSummaryPosition, {
        toValue: 10,
        duration: 250,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }),
    ]).start(() => {
      //Update main var for determing whether to show custom fare bottom vital or jot
      if (extraAction === false) {
        globalObject.props.UpdateCustomFareState({
          isEnterCustomFareWindowOn: setTo,
        });
      } else if (extraAction === 'considerCustomFare') {
        //Validate and update custom fare if good, else deconsider and let the previous fare be
        if (
          this.props.App.customStringTypedTMP !== false &&
          this.props.App.customStringTypedTMP.length > 1
        ) {
          //Custom fare entered
          let customFare = parseInt(this.props.App.customStringTypedTMP);
          if (customFare !== null && customFare !== undefined) {
            if (customFare >= this.props.App.fareTripSelected) {
              //Greater than the normal fare for the ride
              //Clean the customStringTYpedTMP
              this.props.App.customStringTypedTMP = false;
              globalObject.props.UpdateCustomFareState({
                isEnterCustomFareWindowOn: setTo,
                fareTripSelected: customFare,
              });
            } //Deconsider
            else {
              //Clean the customStringTYpedTMP
              this.props.App.customStringTypedTMP = false;
              globalObject.props.UpdateCustomFareState({
                isEnterCustomFareWindowOn: setTo,
              });
            }
          } //Deconsider
          else {
            //Clean the customStringTYpedTMP
            this.props.App.customStringTypedTMP = false;
            globalObject.props.UpdateCustomFareState({
              isEnterCustomFareWindowOn: setTo,
            });
          }
        } //Deconsider custom fare
        else {
          //Clean the customStringTYpedTMP
          this.props.App.customStringTypedTMP = false;
          globalObject.props.UpdateCustomFareState({
            isEnterCustomFareWindowOn: setTo,
          });
        }
      }
      //Update details
      AnimatedNative.parallel([
        AnimatedNative.timing(this.props.App.summaryContentOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.summaryContentPosition, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.titleSummaryOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
        AnimatedNative.timing(this.props.App.titleSummaryPosition, {
          toValue: 0,
          duration: 250,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  /**
   * @func renderSummarySelectedCarType()
   * Render the selected car type in the summary based on the previous user selections.
   * car types: normalTaxiEconomy, electricEconomy
   */
  renderSummarySelectedCarType() {
    return (
      <TouchableOpacity
        onPressIn={() => this.switchToEnterCustomFare(true)}
        style={{
          height: 200,
          flex: 1,
          alignItems: 'center',
        }}>
        <View
          style={{
            alignItems: 'center',
            width: 85,
            height: 85,
            borderWidth: 2,
            borderColor: '#0D8691',
            borderRadius: 200,
          }}>
          <Image
            source={
              this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .iconCarSelected
            }
            style={{
              width: /RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                ? '100%'
                : '80%',
              height: /RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                ? '100%'
                : '80%',
              borderRadius: /RIDE/i.test(
                this.props.App.bottomVitalsFlow.flowParent,
              )
                ? 200
                : 160,
              top: /RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                ? 0
                : 6,
              borderTopLeftRadius: 169,
              borderBottomLeftRadius: 170,
              resizeMode: 'contain',
            }}
          />
        </View>
        <View
          style={{
            width: 95,
            padding: 7,
            borderRadius: 200,
            backgroundColor: '#000',
            alignItems: 'center',
            justifyContent: 'center',
            bottom: 15,
          }}>
          <Text
            style={[
              {
                color: '#fff',
                fontSize: 14,
                fontFamily: 'Allrounder-Grotesk-Book',
              },
            ]}>
            {this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .nameCarSelected !== false &&
            this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .nameCarSelected !== undefined
              ? this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                  .nameCarSelected
              : 'Your ride'}
          </Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text
            style={[
              {
                fontSize: 17,
                color: '#000',
                fontFamily: 'Allrounder-Grotesk-Medium',
              },
            ]}>
            N${' '}
            {this.props.App.customFareTripSelected !== undefined &&
            this.props.App.customFareTripSelected !== false &&
            this.props.App.customFareTripSelected !== null
              ? this.props.App.customFareTripSelected
              : this.props.App.fareTripSelected}
          </Text>
          {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent) ? (
            <View style={{flexDirection: 'row'}}>
              <Text style={{paddingLeft: 10, paddingRight: 10}}>-</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <IconAnt name="user" size={16} />
                <Text
                  style={[
                    {
                      fontSize: 17,
                      paddingLeft: 5,
                      fontFamily: 'Allrounder-Grotesk-Regular',
                    },
                  ]}>
                  {
                    this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                      .numberOfPassengersSelected
                  }
                </Text>
              </View>
              <Text style={{paddingLeft: 10, paddingRight: 10}}>-</Text>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={[
                    {
                      fontSize: 15,
                      paddingLeft: 0,
                      fontFamily: 'Allrounder-Grotesk-Book',
                    },
                  ]}>
                  {this.props.App.bottomVitalsFlow.connectType}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        <Text
          style={[
            {
              flexDirection: 'row',
              textAlign: 'center',
              fontSize: 14,
              width: 200,
              paddingTop: 20,
              fontFamily: 'Allrounder-Grotesk-Book',
            },
          ]}>
          <Text>Or </Text>
          <Text
            style={[
              {
                fontSize: 15,
                color: '#0D8691',
                fontFamily: 'Allrounder-Grotesk-Regular',
              },
            ]}>
            {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
              ? 'enter a custom fare'
              : 'enter a custom price'}
          </Text>
        </Text>
      </TouchableOpacity>
    );
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
   * @func updateIsAllGoingToTheSamePlaceSwitch()
   * Responsible for updating the switch that mark with true or false if all the passengers are going to the same place
   */
  updateIsAllGoingToTheSamePlaceSwitch(val) {
    /*if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .isAllgoingToTheSamePlace
    ) {
      this.props.UpdateNumberOfPassengersSelected({
        numberOfPassengers: this.props.App.bottomVitalsFlow
          .rideOrDeliveryMetadata.numberOfPassengersSelected,
        isAllgoingToTheSamePlace: false,
      });
    } else {
      this.props.UpdateNumberOfPassengersSelected({
        numberOfPassengers: this.props.App.bottomVitalsFlow
          .rideOrDeliveryMetadata.numberOfPassengersSelected,
        isAllgoingToTheSamePlace: true,
      });
    }*/
    this.props.UpdateNumberOfPassengersSelected({
      numberOfPassengers: this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .numberOfPassengersSelected,
      isAllgoingToTheSamePlace: val,
    });
  }

  /**
   * @func renderNumberOfPassengersStep()
   * Responsible for figuring out what number of passenger the user has selected during the "select number of passengers" step
   * and render the correct visual data.
   */
  renderNumberOfPassengersStep() {
    //DEBUG
    //this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata.numberOfPassengersSelected = 4;
    //DEBUG
    if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .numberOfPassengersSelected == 1
    ) {
      return (
        <>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(1)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
                {backgroundColor: '#0D8691'},
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#fff',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                1
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(2)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#000',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                2
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(3)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#000',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                3
              </Text>
            </TouchableOpacity>
          </View>
          {/ConnectMe/i.test(
            this.props.App.bottomVitalsFlow.connectType,
          ) ? null : (
            <View style={styles.parentButtonNoPassengers}>
              <TouchableOpacity
                onPress={() => this.updateNumberOfPassengers(4)}
                style={[
                  styles.shadowNumberOfRidersButtons,
                  styles.buttonNumberOfPassDefault,
                ]}>
                <Text
                  style={[
                    {
                      fontSize: 19,
                      color: '#000',
                      fontFamily: 'Allrounder-Grotesk-Medium',
                    },
                  ]}>
                  4
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    } else if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .numberOfPassengersSelected == 2
    ) {
      return (
        <>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(1)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#000',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                1
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(2)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
                {backgroundColor: '#0D8691'},
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#fff',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                2
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(3)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#000',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                3
              </Text>
            </TouchableOpacity>
          </View>
          {/ConnectMe/i.test(
            this.props.App.bottomVitalsFlow.connectType,
          ) ? null : (
            <View style={styles.parentButtonNoPassengers}>
              <TouchableOpacity
                onPress={() => this.updateNumberOfPassengers(4)}
                style={[
                  styles.shadowNumberOfRidersButtons,
                  styles.buttonNumberOfPassDefault,
                ]}>
                <Text
                  style={[
                    {
                      fontSize: 19,
                      color: '#000',
                      fontFamily: 'Allrounder-Grotesk-Medium',
                    },
                  ]}>
                  4
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    } else if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .numberOfPassengersSelected == 3
    ) {
      return (
        <>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(1)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#000',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                1
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(2)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#000',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                2
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(3)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
                {backgroundColor: '#0D8691'},
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#fff',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                3
              </Text>
            </TouchableOpacity>
          </View>
          {/ConnectMe/i.test(
            this.props.App.bottomVitalsFlow.connectType,
          ) ? null : (
            <View style={styles.parentButtonNoPassengers}>
              <TouchableOpacity
                onPress={() => this.updateNumberOfPassengers(4)}
                style={[
                  styles.shadowNumberOfRidersButtons,
                  styles.buttonNumberOfPassDefault,
                ]}>
                <Text
                  style={[
                    {
                      fontSize: 19,
                      color: '#000',
                      fontFamily: 'Allrounder-Grotesk-Medium',
                    },
                  ]}>
                  4
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    } else if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .numberOfPassengersSelected == 4
    ) {
      return (
        <>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(1)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#000',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                1
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(2)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#000',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                2
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(3)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#000',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                3
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.parentButtonNoPassengers}>
            <TouchableOpacity
              onPress={() => this.updateNumberOfPassengers(4)}
              style={[
                styles.shadowNumberOfRidersButtons,
                styles.buttonNumberOfPassDefault,
                {backgroundColor: '#0D8691'},
              ]}>
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#fff',
                    fontFamily: 'Allrounder-Grotesk-Medium',
                  },
                ]}>
                4
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }
  }

  /**
   * @func updateNumberOfPassengers()
   * Responsible for updating the number of passenger on select by the user
   */
  updateNumberOfPassengers(passengerNo) {
    if (passengerNo >= 1 && passengerNo <= 4) {
      this.props.UpdateNumberOfPassengersSelected({
        numberOfPassengers: passengerNo,
        isAllgoingToTheSamePlace: this.props.App.bottomVitalsFlow
          .rideOrDeliveryMetadata.isAllgoingToTheSamePlace,
      });
    } //Invalid passenger's number - reset to 1
    else {
      this.props.UpdateNumberOfPassengersSelected({
        numberOfPassengers: 1,
        isAllgoingToTheSamePlace: this.props.App.bottomVitalsFlow
          .rideOrDeliveryMetadata.isAllgoingToTheSamePlace,
      });
    }
  }

  /**
   * @func renderIdentifiedLocationType()
   * Responsible for rendering the identified location type (taxi rank or private location) after computing
   */
  renderIdentifiedLocationType() {
    //this.fire_search_animation();
    //DEBUG
    //this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata.locationTypeIdentified ='TaxiRank';
    //DEBUG
    if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .locationTypeIdentified !== false
    ) {
      //True identified
      this.revealIdentifiedLocationOnReady(); //For debug, to be called only after API response.
      if (
        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
          .locationTypeIdentified === 'TaxiRank'
      ) {
        return (
          <AnimatedNative.View
            style={{
              opacity: this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .identifyingLocationProcessContentOpacity,
              width: '100%',
              alignItems: 'center',
              flex: 1,
            }}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}>
              <View style={styles.borderIconLocationType}>
                <Image
                  source={this.props.App.taxiRankIco}
                  style={{width: '60%', height: '60%'}}
                />
              </View>
              <View
                style={{
                  paddingTop: 20,
                  alignItems: 'center',
                  bottom: 10,
                }}>
                <Text
                  style={[
                    {
                      fontSize: 18.5,
                      paddingBottom: 7,
                      color: '#0D8691',
                      fontFamily: 'Allrounder-Grotesk-Medium',
                    },
                  ]}>
                  Taxi rank
                </Text>
                <Text
                  style={[
                    {fontSize: 14, fontFamily: 'Allrounder-Grotesk-Book'},
                  ]}>
                  No pickup fee
                </Text>
              </View>
            </View>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                height: 100,
              }}>
              <TouchableOpacity
                onPress={() => this.rerouteBookingProcessFlow('next', 'RIDE')}
                style={{
                  borderWidth: 1,
                  borderColor: 'transparent',
                  width: '90%',
                }}>
                <View style={[styles.bttnGenericTc]}>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Book',
                      fontSize: 21,
                      fontWeight: 'bold',
                      color: '#fff',
                    }}>
                    Next
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </AnimatedNative.View>
        );
      } else if (
        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
          .locationTypeIdentified === 'PrivateLocation'
      ) {
        return (
          <AnimatedNative.View
            style={{
              opacity: this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .identifyingLocationProcessContentOpacity,
              width: '100%',
              alignItems: 'center',
              flex: 1,
            }}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}>
              <View style={styles.borderIconLocationType}>
                <Image
                  source={this.props.App.privateLocationIco}
                  style={{width: '60%', height: '60%'}}
                />
              </View>
              <View
                style={{
                  paddingTop: 20,
                  alignItems: 'center',
                  bottom: 10,
                }}>
                <Text
                  style={[
                    {
                      fontSize: 18.5,
                      paddingBottom: 7,
                      color: '#0D8691',
                      fontFamily: 'Allrounder-Grotesk-Medium',
                    },
                  ]}>
                  Private location
                </Text>
                <Text
                  style={[
                    {fontSize: 14, fontFamily: 'Allrounder-Grotesk-Book'},
                  ]}>
                  <Text style={{fontFamily: 'Allrounder-Grotesk-Medium'}}>
                    + N$5
                  </Text>{' '}
                  pickup fee
                </Text>
              </View>
            </View>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                height: 100,
              }}>
              <TouchableOpacity
                onPress={() => this.rerouteBookingProcessFlow('next', 'RIDE')}
                style={{
                  borderWidth: 1,
                  borderColor: 'transparent',
                  width: '90%',
                }}>
                <View style={[styles.bttnGenericTc]}>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Book',
                      fontSize: 21,
                      fontWeight: 'bold',
                      color: '#fff',
                    }}>
                    Next
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </AnimatedNative.View>
        );
      } else if (
        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
          .locationTypeIdentified === 'Airport'
      ) {
        return (
          <AnimatedNative.View
            style={{
              opacity: this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .identifyingLocationProcessContentOpacity,
              width: '100%',
              alignItems: 'center',
              flex: 1,
            }}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}>
              <View style={styles.borderIconLocationType}>
                <Image
                  source={this.props.App.airportLocationIco}
                  style={{width: '60%', height: '60%'}}
                />
              </View>
              <View
                style={{
                  paddingTop: 20,
                  alignItems: 'center',
                  bottom: 10,
                }}>
                <Text
                  style={[
                    {
                      fontSize: 18.5,
                      paddingBottom: 7,
                      color: '#0D8691',
                      fontFamily: 'Allrounder-Grotesk-Medium',
                    },
                  ]}>
                  Airport
                </Text>
                <Text
                  style={[
                    {fontSize: 14, fontFamily: 'Allrounder-Grotesk-Book'},
                  ]}>
                  No pickup fee
                </Text>
              </View>
            </View>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                height: 100,
              }}>
              <TouchableOpacity
                onPress={() => this.rerouteBookingProcessFlow('next', 'RIDE')}
                style={{
                  borderWidth: 1,
                  borderColor: 'transparent',
                  width: '90%',
                }}>
                <View style={[styles.bttnGenericTc]}>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Book',
                      fontSize: 21,
                      fontWeight: 'bold',
                      color: '#fff',
                    }}>
                    Next
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </AnimatedNative.View>
        );
      }
    } //Not identified yet loading
    else {
      return (
        <AnimatedNative.View
          style={{
            opacity: this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .identifyingLocationProcessTextOpacity,
            transform: [
              {
                translateY: this.props.App.bottomVitalsFlow
                  .rideOrDeliveryMetadata
                  .identifyingLocationProcessTextPosition,
              },
            ],
          }}>
          <Text
            style={[
              {
                fontSize: 17,
                bottom: 25,
                fontFamily: 'Allrounder-Grotesk-Book',
              },
            ]}>
            {this.revealIdentifiedLocationOnReady()}
            Identifying your location, hold on.
          </Text>
        </AnimatedNative.View>
      );
    }
  }
  /**
   * @func revealIdentifiedLocationOnReady()
   * Responsbile for showing the identified location when finished process
   * OR show the loading text when the identified location is not yet ready.
   * Key props.App variable: locationTypeIdentified
   * Native driver ONLY.
   */
  revealIdentifiedLocationOnReady() {
    let globalObject = this;
    if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .locationTypeIdentified !== false
    ) {
      //Location identified
      //SIMULATE DONE IDENTIFYING LOCATION -- DEBUG
      //Fade loader
      AnimatedNative.parallel([
        AnimatedNative.timing(
          globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
            .identifyingLocationProcessTextOpacity,
          {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
            .identifyingLocationProcessTextPosition,
          {
            toValue: 20,
            duration: 200,
            useNativeDriver: true,
          },
        ),
      ]).start(() => {
        AnimatedNative.timing(
          globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
            .identifyingLocationProcessContentOpacity,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ).start(() => {
          //Animate in the title
          AnimatedNative.parallel([
            AnimatedNative.timing(
              globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .identifyinfLocationTypeTopTextOpacity,
              {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              },
            ),
            AnimatedNative.timing(
              globalObject.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .identifyinfLocationTypeTopTextPosition,
              {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              },
            ),
          ]).start(() => {
            //globalObject.resetAnimationLoader();
          });
        });
      });
    } //Still loading
    else {
      //Include the interval persister
      if (this.props.App._TMP_INTERVAL_PERSISTER === null) {
        this.props.App._TMP_INTERVAL_PERSISTER = setInterval(function () {
          globalObject.fire_search_animation();
          globalObject.props.App.socket.emit('getPickupLocationNature', {
            latitude: globalObject.props.App.latitude,
            longitude: globalObject.props.App.longitude,
            user_fingerprint: globalObject.props.App.user_fingerprint,
          });
          //Cancel interval interval
          if (
            globalObject.props.App.bottomVitalsFlow.locationTypeIdentified !==
            false
          ) {
            clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
            globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
            globalObject.resetAnimationLoader();
          }
        }, this.props.App._TMP_INTERVAL_PERSISTER_TIME);
      }

      AnimatedNative.parallel([
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
            .identifyingLocationProcessTextOpacity,
          {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
            .identifyingLocationProcessTextPosition,
          {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          },
        ),
      ]).start();
    }
  }

  /**
   * @func updateAssigningRiderSwitcherWindow
   * Responsible for definetely updating all the rider swicther global variables.
   * @param state: open or close (to open or close - and finalize the values as it closes)
   *
   */
  updateAssigningRiderSwitcherWindow(state) {
    let globalObject = this;
    if (state === 'close') {
      //Fade switcher window out
      AnimatedNative.parallel([
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars
            .switcherWindowOpacity,
          {
            toValue: 0,
            duration: 350,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars
            .swictherWindowPosition,
          {
            toValue: 450,
            duration: 350,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
      ]).start(() => {
        globalObject.props.UpdateRiderOrPackagePossesserSwitcher({
          action: 'doneCustomizing',
        });
      });
    } else if (state === 'open') {
      //Appear swicther and animate
      globalObject.props.UpdateRiderOrPackagePossesserSwitcher({
        action: 'openRiderSwitcher',
      });
      AnimatedNative.parallel([
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars
            .switcherWindowOpacity,
          {
            toValue: 1,
            duration: 350,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(
          this.props.App.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars
            .swictherWindowPosition,
          {
            toValue: 0,
            duration: 350,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
      ]).start();
    }
  }

  /**
   * @func renderBottomVital()
   * Responsible for rendering the bottom part of the user interface responsible for vital things like requesting the ride, etc.
   */
  renderBottomVital() {
    if (this.props.App.isRideInProgress === false) {
      //No rides in progress
      return (
        <View>
          {this.props.App.gprsGlobals.hasGPRSPermissions ? (
            this.props.App.bottomVitalsFlow.canRecenterGPRS ? (
              this.props.App.bottomVitalsFlow.isUserLocationCentered ? null : (
                <View
                  style={{
                    position: 'absolute',
                    width: 100,
                    top: -70,
                    right: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingRight: 20,
                  }}>
                  <View style={{flex: 1, alignItems: 'flex-end'}}>
                    <AnimatedNative.View
                      style={{
                        transform: [
                          {
                            scaleX: this.props.App.bottomVitalsFlow
                              .centerLocationButtonScale,
                          },
                          {
                            scaleY: this.props.App.bottomVitalsFlow
                              .centerLocationButtonScale,
                          },
                        ],
                      }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => this.recalibrateMap(true)}
                        style={{
                          width: 47,
                          height: 47,
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
                        <IconMaterialIcons name="gps-fixed" size={35} />
                      </TouchableOpacity>
                    </AnimatedNative.View>
                  </View>
                </View>
              )
            ) : null
          ) : null}

          <AnimatedNative.View
            style={[
              styles.shadowBottomVitals,
              {
                height: this.props.App.bottomVitalsFlow.bottomVitalChildHeight, //- DISABLED FOR DEBUG - height: 400, For all the ride booking process flow and all but one deliveries process flows.
                //height: this.props.App.windowHeight, //Only for input receiver's informations for delivery and Package sizes
                backgroundColor: '#fff',
                zIndex: 90000,
              },
            ]}>
            <View>
              <AnimatedNative.View
                style={[
                  styles.loader,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    borderTopColor: this.props.App.showLocationSearch_loader
                      ? this.props.App.loaderColor
                      : this.props.App._IS_MAP_INITIALIZED
                      ? this.props.App.loaderColor
                      : '#0D8691',
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
            {this.renderContentBottomVitals()}
            {this.props.App.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars
              .openRiderSwitcher ? (
              <AnimatedNative.View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  transform: [
                    {
                      translateY: this.props.App.bottomVitalsFlow
                        .riderOrPackagePosseserSwitchingVars
                        .swictherWindowPosition,
                    },
                  ],
                  opacity: this.props.App.bottomVitalsFlow
                    .riderOrPackagePosseserSwitchingVars.switcherWindowOpacity,
                  width: '100%',
                  backgroundColor: '#fff',
                  height: 400,
                  zIndex: 9000,
                  borderTopWidth: 5,
                  paddingTop: 10,
                }}>
                <View style={{flex: 1}}>
                  <View
                    style={{
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 4,
                    }}>
                    <Text
                      style={[
                        {
                          fontSize: 18,
                          color: '#454545',
                          fontFamily: 'Allrounder-Grotesk-Medium',
                        },
                      ]}>
                      {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                        ? "Who's riding?"
                        : 'Who has the package?'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.UpdateRiderOrPackagePossesserSwitcher({
                        action: 'assign',
                        riderString: 'me',
                        customPhoneNo: false,
                      })
                    }
                    style={{
                      borderBottomWidth: 0.5,
                      flexDirection: 'row',
                      paddingLeft: 20,
                      paddingRight: 20,
                      paddingBottom: 15,
                      paddingTop: 15,
                      marginTop: 5,
                      alignItems: 'center',
                      borderBottomColor: '#d0d0d0',
                    }}>
                    <IconAnt
                      name="user"
                      size={20}
                      color={
                        /^me$/i.test(
                          this.props.App.bottomVitalsFlow
                            .riderOrPackagePosseserSwitchingVars.whoIsRiding,
                        )
                          ? '#0D8691'
                          : '#000'
                      }
                    />
                    <View
                      style={{
                        paddingLeft: 5,
                        justifyContent: 'center',
                        flex: 1,
                      }}>
                      <Text
                        style={[
                          {
                            fontSize: 17.5,
                            fontFamily: 'Allrounder-Grotesk-Book',
                          },
                        ]}>
                        Me
                      </Text>
                    </View>
                    {/^me$/i.test(
                      this.props.App.bottomVitalsFlow
                        .riderOrPackagePosseserSwitchingVars.whoIsRiding,
                    ) ? (
                      <IconFeather
                        name="check"
                        size={25}
                        style={{top: 1}}
                        color={'#0D8691'}
                      />
                    ) : null}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.UpdateRiderOrPackagePossesserSwitcher({
                        action: 'assign',
                        riderString: 'someoneelse',
                        customPhoneNo: this.props.App.bottomVitalsFlow
                          .riderOrPackagePosseserSwitchingVars.riderPhoneNumber,
                      })
                    }
                    style={{
                      borderBottomWidth: 0.5,
                      flexDirection: 'row',
                      paddingLeft: 20,
                      paddingRight: 20,
                      paddingBottom: 20,
                      paddingTop: 15,
                      marginTop: 5,
                      alignItems: 'center',
                      borderBottomColor: '#d0d0d0',
                    }}>
                    <IconAnt
                      name="adduser"
                      size={20}
                      color={
                        /^someoneelse$/i.test(
                          this.props.App.bottomVitalsFlow
                            .riderOrPackagePosseserSwitchingVars.whoIsRiding,
                        )
                          ? '#0D8691'
                          : '#000'
                      }
                    />
                    <View
                      style={{
                        paddingLeft: 5,
                        justifyContent: 'center',
                        flex: 1,
                      }}>
                      <Text
                        style={[
                          {
                            fontSize: 17.5,
                            fontFamily: 'Allrounder-Grotesk-Book',
                          },
                        ]}>
                        Someone else
                      </Text>
                    </View>
                    {/^someoneelse$/i.test(
                      this.props.App.bottomVitalsFlow
                        .riderOrPackagePosseserSwitchingVars.whoIsRiding,
                    ) ? (
                      <IconFeather
                        name="check"
                        size={25}
                        style={{top: 1}}
                        color={'#0D8691'}
                      />
                    ) : null}
                  </TouchableOpacity>
                  {/^someoneelse$/i.test(
                    this.props.App.bottomVitalsFlow
                      .riderOrPackagePosseserSwitchingVars.whoIsRiding,
                  ) ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingLeft: 20,
                        paddingRight: 10,
                        paddingBottom: 15,
                        marginTop: 5,
                        alignItems: 'center',
                      }}>
                      <IconCommunity name="phone" size={20} />
                      <View
                        style={{
                          paddingLeft: 5,
                          flex: 1,
                          justifyContent: 'center',
                        }}>
                        <TextInput
                          autoFocus
                          selectTextOnFocus
                          maxLength={10}
                          keyboardType={'number-pad'}
                          value={
                            this.props.App.bottomVitalsFlow
                              .riderOrPackagePosseserSwitchingVars
                              .riderPhoneNumber === false
                              ? ''
                              : this.props.App.bottomVitalsFlow
                                  .riderOrPackagePosseserSwitchingVars
                                  .riderPhoneNumber
                          }
                          onChangeText={(text) =>
                            this.props.UpdateRiderOrPackagePossesserSwitcher({
                              action: 'updateCustomPhonenumber',
                              customPhoneNo: text.replace(/[^0-9]/g, ''),
                            })
                          }
                          style={[
                            {
                              fontSize: 17,
                              fontFamily: 'Allrounder-Grotesk-Regular',
                            },
                          ]}
                          placeholder="What's the rider's phone number?"
                        />
                      </View>
                    </View>
                  ) : null}

                  <Text
                    style={[
                      {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        fontSize: 14,
                        paddingLeft: 20,
                        paddingRight: 20,
                        paddingTop: 10,
                        color: '#a2a2a2',
                        fontFamily: 'Allrounder-Grotesk-Book',
                      },
                    ]}>
                    This phone number will receive calls or SMS relative to this
                    trip.
                  </Text>
                </View>

                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 100,
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.updateAssigningRiderSwitcherWindow('close')
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: 'transparent',
                      width: '90%',
                    }}>
                    <View style={[styles.bttnGenericTc]}>
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Book',
                          fontSize: 21,
                          fontWeight: 'bold',
                          color: '#fff',
                        }}>
                        Done
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </AnimatedNative.View>
            ) : null}
          </AnimatedNative.View>
        </View>
      );
    } //There's a ride in progress
    else {
      //In route to pickup or destination
      if (/inRouteTo/i.test(this.props.App.request_status)) {
        //Driver in route to pickup the rider
        return (
          <>
            <TouchableOpacity
              onPress={() =>
                this.props.UpdateErrorModalLog(
                  true,
                  'show_guardian_toolkit',
                  'any',
                )
              }
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                backgroundColor: '#fff',
                width: 55,
                height: 55,
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
              <IconMaterialIcons name="shield" size={30} />
            </TouchableOpacity>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: 20,
                paddingBottom: 26,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() =>
                  /inroute/i.test(this.props.App.request_status)
                    ? this.props.UpdateErrorModalLog(
                        true,
                        'show_modalMore_tripDetails',
                        'any',
                      )
                    : {}
                }
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  flexDirection: 'row',
                  padding: 20,
                  paddingTop: 18,
                  paddingLeft: 15,
                  paddingBottom: 15,
                  borderRadius: 7,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.27,
                  shadowRadius: 4.65,

                  elevation: 6,
                }}>
                <View style={{flexDirection: 'row', flex: 1}}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#d0d0d0',
                      backgroundColor: '#fff',
                      width: 70,
                      height: 70,
                      borderRadius: 150,
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,

                      elevation: 5,
                    }}>
                    <IconAnt name="user" size={25} />
                  </View>
                  <View style={{marginLeft: 7, flex: 1}}>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 17,
                      }}>
                      {
                        this.props.App.generalTRIP_details_driverDetails
                          .driverDetails.name
                      }
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 1,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Medium',
                          fontSize: 14,
                          color: '#096ED4',
                        }}>
                        {this.props.App.generalTRIP_details_driverDetails
                          .carDetails.taxi_number !== false
                          ? this.props.App.generalTRIP_details_driverDetails
                              .carDetails.taxi_number
                          : this.props.App.generalTRIP_details_driverDetails
                              .carDetails.car_brand}
                      </Text>
                      <IconMaterialIcons
                        name="star"
                        size={14}
                        style={{marginLeft: 7}}
                      />
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Book',
                          fontSize: 14,
                        }}>
                        {
                          this.props.App.generalTRIP_details_driverDetails
                            .driverDetails.global_rating
                        }
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Book',
                          color: '#096ED4',
                          fontSize: 15,
                        }}>
                        {this.props.App.generalTRIP_details_driverDetails
                          .eta !== null &&
                        this.props.App.generalTRIP_details_driverDetails.eta !==
                          false &&
                        this.props.App.generalTRIP_details_driverDetails.eta !==
                          undefined
                          ? this.props.App.generalTRIP_details_driverDetails.eta
                          : 'Driver on his way'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 5,
                  }}>
                  <IconAnt name="caretdown" size={14} />
                </View>
              </TouchableOpacity>
            </View>
          </>
        );
      } else if (
        /riderDropoffConfirmation_left/i.test(this.props.App.request_status)
      ) {
        //Confirm drop off
        return (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: 20,
              paddingBottom: 26,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#fff',
                padding: 20,
                paddingTop: 18,
                paddingLeft: 15,
                paddingBottom: 15,
                marginBottom: 10,
                borderRadius: 7,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,

                elevation: 6,
                width: '100%',
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flex: 1,
                  width: '100%',
                }}>
                <View style={{flex: 1, width: '100%'}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Allrounder-Grotesk-Book',
                      color: '#a5a5a5',
                      padding: 20,
                      paddingTop: 0,
                      paddingLeft: 0,
                      paddingBottom: 0,
                    }}>
                    {/ride/i.test(
                      this.props.App.generalTRIP_details_driverDetails
                        .trip_details.ride_mode,
                    )
                      ? 'Trip summary'
                      : 'Delivery summary'}
                  </Text>
                  <View
                    style={{
                      padding: 20,
                      paddingLeft: 0,
                      height: 120,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginBottom: 35,
                        alignItems: 'center',
                      }}>
                      <View>
                        <View
                          style={{
                            height: 15,
                            width: 15,
                            borderRadius: 100,
                            backgroundColor: '#000',
                          }}
                        />
                        <View
                          style={{
                            position: 'absolute',
                            top: 3,
                            left: 7,
                            width: 2,
                            height: 55,
                            backgroundColor: '#000',
                          }}></View>
                      </View>
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Book',
                          fontSize: 14,
                          marginLeft: 5,
                          flex: 1,
                          bottom: 0.5,
                        }}>
                        {/ride/i.test(
                          this.props.App.generalTRIP_details_driverDetails
                            .trip_details.ride_mode,
                        )
                          ? 'Pickup'
                          : 'Collection'}{' '}
                        at{' '}
                        <Text
                          style={{
                            fontFamily: 'Allrounder-Grotesk-Medium',
                            fontSize: 15,
                            marginLeft: 5,
                          }}>
                          {String(
                            this.props.App.generalTRIP_details_driverDetails
                              .trip_details.pickup_name,
                          ).length < 19
                            ? this.props.App.generalTRIP_details_driverDetails
                                .trip_details.pickup_name
                            : this.props.App.generalTRIP_details_driverDetails.trip_details.pickup_name.substring(
                                0,
                                19,
                              ) + '...'}
                        </Text>
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View>
                        <View
                          style={{
                            height: 15,
                            width: 15,
                            borderRadius: 100,
                            backgroundColor: '#096ED4',
                            left: 0.5,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Book',
                          fontSize: 14,
                          marginLeft: 5,
                          flex: 1,
                          bottom: 0.5,
                        }}>
                        {/ride/i.test(
                          this.props.App.generalTRIP_details_driverDetails
                            .trip_details.ride_mode,
                        )
                          ? 'Drop off'
                          : 'Delivery'}{' '}
                        at{' '}
                        <Text
                          style={{
                            fontFamily: 'Allrounder-Grotesk-Medium',
                            fontSize: 15,
                            marginLeft: 5,
                          }}>
                          {String(
                            this.props.App.generalTRIP_details_driverDetails
                              .trip_details.destination_name,
                          ).length < 19
                            ? this.props.App.generalTRIP_details_driverDetails
                                .trip_details.destination_name
                            : this.props.App.generalTRIP_details_driverDetails.trip_details.destination_name.substring(
                                0,
                                19,
                              ) + '...'}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {/**Confirm drop off button */}
            <TouchableOpacity
              onPress={() =>
                this.props.UpdateErrorModalLog(
                  true,
                  'show_rating_driver_modal',
                  'any',
                )
              }
              style={{
                flex: 1,
                backgroundColor: '#096ED4',
                flexDirection: 'row',
                padding: 20,
                paddingTop: 18,
                paddingLeft: 15,
                paddingBottom: 15,
                height: 80,
                borderRadius: 7,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,

                elevation: 6,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}>
                <IconCommunity name="shield-check" color="#fff" size={25} />
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Regular',
                    fontSize: 18,
                    marginLeft: 5,
                    color: '#fff',
                  }}>
                  Confirm Drop off
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      } else if (/pending/i.test(this.props.App.request_status)) {
        //Pending requests
        return (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: 20,
              paddingBottom: 26,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {/**Pending notificator */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#fff',
                flexDirection: 'row',
                padding: 20,
                paddingTop: 18,
                paddingLeft: 15,
                paddingBottom: 15,
                height: 80,
                borderRadius: 7,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,

                elevation: 6,
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    marginRight: 5,
                  }}>
                  <ActivityIndicator size="small" color="#0e8491" />
                </View>
                <Text
                  style={{fontFamily: 'Allrounder-Grotesk-Book', fontSize: 16}}>
                  Finding you a Taxi...
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  this.props.UpdateErrorModalLog(
                    true,
                    'show_cancel_ride_modal',
                    'any',
                  )
                }
                style={{
                  borderLeftWidth: 0.5,
                  borderLeftColor: '#d0d0d0',
                  height: '100%',
                  paddingLeft: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconMaterialIcons name="close" color="#b22222" size={30} />
              </TouchableOpacity>
            </View>
          </View>
        );
      }
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
   * @func repositionMaviewMarker
   * @param point: point next to which the MarkerView should be placed - required
   * @param label: to know which kind of state variable to update (destination or origin markerView stuff), can be "destination" or "origin" - Required
   * Responsible for placing optimally ANY MarkerView next to any point provided in the current
   * bounded area of the map.
   */
  async repositionMaviewMarker(point = false, label = false) {
    if (point !== false && label !== false) {
      point = {
        latitude: point[1],
        longitude: point[0],
      };
      //...
      if (point.latitude !== undefined && point.longitude !== false) {
        //Check if the camera module's ready
        if (
          this.camera !== undefined &&
          this.camera !== null &&
          this.camera != null &&
          this._map !== undefined &&
          this._map !== null
        ) {
          //Find the current bounds - [longitude, latitude] - NE and SW points
          const currentBounds = await this._map.getVisibleBounds();
          let NEBound = currentBounds[0];
          let SWBound = currentBounds[1];
          //...Convert bounds to turfs
          let NEBoundTurf = turf.point([NEBound[1], NEBound[0]]);
          let SWBoundTurf = turf.point([SWBound[1], SWBound[0]]);
          //..Convert ppoint provided to turf
          let targetPointTurf = turf.point([point.latitude, point.longitude]);
          //Find the relevant distances
          /**
           * Find the closest bounds to the provided point (@param point)
           * and deduce appropriate anchor position.
           */
          let toNEDistance = turf.distance(NEBoundTurf, targetPointTurf, {
            units: 'miles',
          });
          let toSWDistance = turf.distance(SWBoundTurf, targetPointTurf, {
            units: 'miles',
          });
          //Compare the distances
          if (toNEDistance > toSWDistance) {
            //The point is closer to the SW bound
            if (label === 'destination') {
              this.props.App.previewDestinationData.destinationAnchor = {
                x: 1,
                y: 0.4,
              };
            } else {
              this.props.App.previewDestinationData.originAnchor = {
                x: 1,
                y: 0.4,
              };
            }
          } //The point is closer to the NE bound
          else {
            if (label === 'destination') {
              this.props.App.previewDestinationData.destinationAnchor = {
                x: -0.1,
                y: 0.9,
              };
            } else {
              this.props.App.previewDestinationData.originAnchor = {
                x: -0.05,
                y: 0.9,
              };
            }
          }
        } else {
          return {x: 0, y: 0};
        }
      }
    }
  }

  /**
   * @func previewRouteToDestinationSnapshot
   * Responsible for showing to the user the way to the first destination after selecting
   * the destination location on the booking flow. -> Find the best anchor combination
   */
  previewRouteToDestinationSnapshot() {
    if (
      this.props.App.previewDestinationData.originDestinationPreviewData !==
        undefined &&
      this.props.App.previewDestinationData.originDestinationPreviewData !==
        false
    ) {
      //Reposition MarkerViews optimally
      //Destination anchor
      this.repositionMaviewMarker(
        this.props.App.previewDestinationData.originDestinationPreviewData
          .routePoints.coordinates[
          this.props.App.previewDestinationData.originDestinationPreviewData
            .routePoints.coordinates.length - 1
        ],
        'destination',
      );
      //Origin anchor
      this.repositionMaviewMarker(
        this.props.App.previewDestinationData.originDestinationPreviewData
          .routePoints.coordinates[0],
        'origin',
      );

      //Fit to bounds
      this.recalibrateMap();
      return (
        <>
          <MarkerView
            id="riderPickupLocation_tooltip"
            anchor={this.props.App.previewDestinationData.destinationAnchor}
            coordinate={
              this.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[
                this.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates.length -
                  1
              ]
            }>
            <AnnotationDestination
              title={
                this.props.App.search_passengersDestinations
                  .passenger1Destination.location_name !== undefined &&
                this.props.App.search_passengersDestinations
                  .passenger1Destination.location_name !== false
                  ? this.props.App.search_passengersDestinations
                      .passenger1Destination.location_name
                  : this.props.App.search_passengersDestinations
                      .passenger1Destination.street_name !== undefined &&
                    this.props.App.search_passengersDestinations
                      .passenger1Destination.street_name !== false
                  ? this.props.App.search_passengersDestinations
                      .passenger1Destination.street_name
                  : 'Destination'
              }
              etaInfos={{
                eta: this.props.App.previewDestinationData
                  .originDestinationPreviewData.eta,
              }}
            />
          </MarkerView>
          <PulseCircleLayer
            radius={8}
            aboveLayerID={'lineRoutePickup'}
            innerCircleStyle={{
              circleColor: '#fff',
              circleStrokeColor: '#096ED4',
              circleStrokeWidth: 0.5,
            }}
            outerCircleStyle={{
              circleOpacity: 0.4,
              circleColor: '#096ED4',
            }}
            pulseRadius={20}
            shape={{
              type: 'Point',
              coordinates: this.props.App.previewDestinationData
                .originDestinationPreviewData.routePoints.coordinates[
                this.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates.length -
                  1
              ],
            }}
          />
          <Animated.ShapeSource
            id={'shape'}
            shape={
              new Animated.Shape(
                this.props.App.previewDestinationData.originDestinationPreviewData.routePoints,
              )
            }>
            <Animated.LineLayer
              id={'lineRoutePickup'}
              style={{
                lineCap: 'square',
                lineWidth: 4,
                //lineOpacity: 0.8,
                lineColor: '#096ED4',
              }}
            />
          </Animated.ShapeSource>
          <PointAnnotation
            id={'originAnnotationPreview'}
            aboveLayerID={'lineRoutePickup'}
            //anchor={{x: -0.2, y: 0.5}}
            coordinate={
              this.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[0]
            }>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: '#096ED4',
              }}></View>
          </PointAnnotation>
          <MarkerView
            id="riderPickupLocation_tooltip"
            anchor={this.props.App.previewDestinationData.originAnchor}
            //anchor={{x: 0, y: 1}}
            coordinate={
              this.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[0]
            }>
            <AnnotationPickup
              title={
                this.props.App.search_pickupLocationInfos
                  .isBeingPickedupFromCurrentLocation === false &&
                this.props.App.search_pickupLocationInfos
                  .passenger0Destination !== false
                  ? this.props.App.search_pickupLocationInfos
                      .passenger0Destination.location_name !== undefined &&
                    this.props.App.search_pickupLocationInfos
                      .passenger0Destination.location_name !== false
                    ? this.props.App.search_pickupLocationInfos
                        .passenger0Destination.location_name
                    : this.props.App.search_pickupLocationInfos
                        .passenger0Destination.street !== undefined &&
                      this.props.App.search_pickupLocationInfos
                        .passenger0Destination.street !== false
                    ? this.props.App.search_pickupLocationInfos
                        .passenger0Destination.street
                    : 'Pickup location'
                  : 'My location'
              }
            />
          </MarkerView>
        </>
      );
    } else {
      return null;
    }
  }

  /**
   * @func renderMainMapView()
   * Responsible to show the map content ONLY when proper GRPS permission had been granted
   */
  renderMainMapView() {
    //Preview the route to destination and ETA- DEBUG
    /*let globalObject = this;
    if (this.props.App._TMP_INTERVAL_PERSISTER === null) {
      this.props.App._TMP_INTERVAL_PERSISTER = setInterval(function () {
        if (
          globalObject.props.App.previewDestinationData
            .originDestinationPreviewData === false ||
          globalObject.props.App.previewDestinationData
            .originDestinationPreviewData === undefined
        ) {
          globalObject.fire_search_animation(); //Fire animation
          //Not found yet -make a request
          let previewTripRouteData = {
            user_fingerprint:
              '7c57cb6c9471fd33fd265d5441f253eced2a6307c0207dea57c987035b496e6e8dfa7105b86915da',
            org_latitude: -22.576655,
            org_longitude: 17.083548,
            dest_latitude: -22.572605,
            dest_longitude: 17.082044,
          };
          //..
          globalObject.props.App.socket.emit(
            'getRoute_to_destinationSnapshot',
            previewTripRouteData,
          );
        } //Data already received - kill interval
        else {
          if (globalObject.props.App._TMP_INTERVAL_PERSISTER !== null) {
            clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
            globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
          }
        }
      }, this.props.App._TMP_INTERVAL_PERSISTER_TIME);
    }*/
    //...
    if (this.props.App.gprsGlobals.hasGPRSPermissions) {
      return (
        <MapView
          ref={(c) => (this._map = c)}
          style={styles.map}
          onDidFinishLoadingMap={() => this.recalibrateMap()}
          onUserLocationUpdate={() => this.recalibrateMap()}
          onDidFailLoadingMap={() => this.recalibrateMap()}
          onDidFinishRenderingMapFully={() => this.recalibrateMap()}
          //onRegionDidChange={() => this.normalizeCarSizeToZoom()}
          scrollEnabled={
            this.props.App.isRideInProgress
              ? false
              : this.props.App.bottomVitalsFlow.scrollEnabled
          }
          zoomEnabled={
            this.props.App.isRideInProgress
              ? false
              : this.props.App.bottomVitalsFlow.zoomEnabled
          }
          rotateEnabled={
            this.props.App.isRideInProgress
              ? false
              : this.props.App.bottomVitalsFlow.rotateEnabled
          }
          pitchEnabled={
            this.props.App.isRideInProgress
              ? false
              : this.props.App.bottomVitalsFlow.pitchEnabled
          }
          attributionEnabled={false}
          compassEnabled={false}
          id={'mainMapViewElement'}
          styleURL={'mapbox://styles/dominiquektt/ckax4kse10a791iofjbx59jzm'}>
          <Camera
            ref={(c) => (this.camera = c)}
            zoomLevel={20}
            //centerCoordinate={[this.props.App.longitude, this.props.App.latitude]}
            //followUserLocation={this.props.App.isRideInProgress ? false : true} //<------------------BREAKS FITBOUNDS.
          />

          {this.props.App.isRideInProgress === false ||
          /riderDropoffConfirmation_left/i.test(
            this.props.App.request_status,
          ) ? (
            /riderDropoffConfirmation_left/i.test(
              this.props.App.request_status,
            ) === false ? (
              <>
                <Animated.ShapeSource
                  id={'shape'}
                  aboveLayerID={'lineRoutePickup'}
                  shape={
                    new Animated.Shape({
                      type: 'LineString',
                      coordinates: [
                        [0, 0],
                        [1, 1],
                      ],
                    })
                  }>
                  <Animated.LineLayer id={'lineRoutePickup'} />
                </Animated.ShapeSource>
                <PulseCircleLayer
                  radius={10}
                  pulseRadius={25}
                  aboveLayerID={'lineRoutePickup'}
                  innerCircleStyle={{
                    circleColor: '#fff',
                    circleStrokeColor: '#0e8491',
                    circleStrokeWidth: 0.5,
                  }}
                  innerCirclePulseStyle={{
                    circleColor: '#0e8491',
                    circleStrokeColor: '#0e8491',
                  }}
                  outerCircleStyle={{
                    circleOpacity: 0.4,
                    circleColor: '#0e8491',
                  }}
                  shape={{
                    type: 'Point',
                    coordinates: [
                      this.props.App.longitude,
                      this.props.App.latitude,
                    ],
                  }}
                />
              </>
            ) : null
          ) : /pending/i.test(this.props.App.request_status) ? (
            <>
              <Animated.ShapeSource
                id={'shape'}
                aboveLayerID={'lineRoutePickup'}
                shape={
                  new Animated.Shape({
                    type: 'LineString',
                    coordinates: [
                      [0, 0],
                      [1, 1],
                    ],
                  })
                }>
                <Animated.LineLayer id={'lineRoutePickup'} />
              </Animated.ShapeSource>
              <PulseCircleLayer
                radius={10}
                aboveLayerID={'lineRoutePickup'}
                pulseRadius={25}
                shape={{
                  type: 'Point',
                  coordinates: this.props.App.pickupLocation_metadata.coordinates.map(
                    parseFloat,
                  ),
                }}
              />
            </>
          ) : /inRouteToDestination/i.test(this.props.App.request_status) ? (
            <PulseCircleLayer
              radius={10}
              pulseRadius={25}
              aboveLayerID={'lineRoutePickup'}
              innerCircleStyle={{
                circleColor: '#fff',
                circleStrokeColor: '#007fff',
                circleStrokeWidth: 0.5,
              }}
              outerCircleStyle={{
                circleOpacity: 0.4,
                circleColor: '#007fff',
              }}
              shape={{
                type: 'Point',
                coordinates: this.props.App.destinationPoint.map(parseFloat),
              }}
            />
          ) : (
            <PulseCircleLayer
              radius={10}
              pulseRadius={25}
              aboveLayerID={'lineRoutePickup'}
              shape={{
                type: 'Point',
                coordinates: this.props.App.pickupPoint,
              }}
            />
          )}

          {/*
              <Animated.ShapeSource
                id="symbolCarIcon"
                shape={
                  new Animated.Shape({
                    type: 'Point',
                    coordinates: [17.0809403, -22.5704406],
                  })
                }>
                <Animated.SymbolLayer
                  id="symbolCarLayer"
                  minZoomLevel={1}
                  style={{
                    iconImage: this.props.App.carIcon,
                    iconSize: this.props.App.carIconRelativeSize,
                    iconRotate: 100,
                  }}
                />
              </Animated.ShapeSource>
            */}

          {/*<PointAnnotation
              id="DriverLocation_tooltip"
              anchor={{x: 1, y: 1}}
              coordinate={[this.props.App.longitude, this.props.App.latitude]}>
              <AnnotationDriver title={'Your driver'} />
            </PointAnnotation>*/}

          {this.previewRouteToDestinationSnapshot()}
          {this.renderDriverTracker()}
          {this.updateClosestLiveDriversMap()}
          {/*this.props.App.isRideInProgress === false &&
          /mainView/i.test(this.props.App.bottomVitalsFlow.currentStep) &&
          this.props.App._CLOSEST_DRIVERS_DATA !== null &&
          this.props.App._CLOSEST_DRIVERS_DATA.length !== undefined &&
          this.props.App._CLOSEST_DRIVERS_DATA.length > 0
            ? this.props.App._CLOSEST_DRIVERS_DATA.map((driver, index) => {
                return (
                  <ShapeSource
                    key={index + 1}
                    id={'currentLocationSource' + (index + 1)}
                    shape={{
                      type: 'Point',
                      coordinates: [
                        driver.driver_coordinates.longitude,
                        driver.driver_coordinates.latitude,
                      ],
                    }}>
                    <Animated.SymbolLayer
                      id={'symbolCarLayer' + (index + 2)}
                      minZoomLevel={1}
                      style={{
                        iconAllowOverlap: true,
                        iconImage: this.props.App.carIcon,
                        iconSize: this.props.App.carIconRelativeSize,
                        //iconRotate: this.props.App.lastDriverBearing,
                      }}
                    />
                  </ShapeSource>
                );
              })
            : null*/}
          {/*<ShapeSource
            id="currentLocationSource"
            shape={{
              type: 'Point',
              coordinates: [this.props.App.latitude, this.props.App.longitude],
            }}>
            <CircleLayer
              id="currentLocationCircle"
              style={{
                circleOpacity: 1,
                circleColor: '#000',
                circleRadius: 8,
              }}
            />
            </ShapeSource>*/}
        </MapView>
      );
    } //Close the interface until proper GRPS detected
    else {
      //Stop animation by default
      this.resetAnimationLoader();
      return (
        <ImageBackground
          source={this.props.App.backgroundVirgin}
          style={{
            flex: 1,
            resizeMode: 'cover',
            justifyContent: 'center',
            opacity: 0.17,
          }}
        />
      );
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
        <View style={styles.mainMainWindow}>{this.renderMainMapView()}</View>

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
            <IconMaterialIcons name="menu" size={30} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            position: 'absolute',
            top: 0,
            zIndex: 90000000,
            left: 0,
            width: 100,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: '9%',
          }}>
          {this.props.App.bottomVitalsFlow.canGoBack &&
          this.props.App.bottomVitalsFlow.currentStep !==
            'gettingRideProcessScreen' ? (
            <View style={{flex: 1, alignItems: 'flex-start', marginTop: '9%'}}>
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
          this.renderBottomVital()
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
    borderTopWidth: 5,
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
