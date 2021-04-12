/* eslint-disable prettier/prettier */
import {combineReducers} from 'redux';
import {Animated as AnimatedMapbox} from '@react-native-mapbox-gl/maps';
import SOCKET_CORE from '../../Helpers/managerNode';
import parsePhoneNumber from 'libphonenumber-js';
import {Animated, Easing} from 'react-native';
import STATE from '../Constants/State';
/**
 * Reducer responsible for all the home actions (trip booking, tracking, etc)
 * Centralized file.
 */

const INIT_STATE = STATE;

const HomeReducer = (state = INIT_STATE, action) => {
  //Predefined variables
  let newState = state;
  let generalPurposeReg = null;
  let route = null;
  let routeShape = null;
  let routeDestination = null;
  let routeShapeDestination = null;
  let phoneNumberModuleTmp = null; //Multipurpose phone number input variable
  //? State checks vars
  let checkerArray = null; //Made to be a checker holder array
  //..........
  switch (action.type) {
    case 'RESET_STATE_PROPS':
      console.log('RESET_STATE_PROPS');
      //The payload can be the parent node of the Home screen
      newState.shape = null;
      newState.route = null; //Will manage the animation of the route to the passenger
      newState.routeCoordsPickup = null; //Will hold the coordinates of the route to the passenger for general purpose usage
      newState.routeCoordsDestination = null; //Will hold the coordinates of the route to the passenger's destination for general purpose usage
      newState.routeDestination = null; //Will manage the animation of the route to the destination
      newState.shapeDestination = null; //Will manage the shape of the route to the destination
      newState.actPoint = null; //Will manage the animation of the driver's car to the destination
      newState.actPointDestination = null; //Will manage the animation of the driver's car to the destination
      newState.isRideInProgress = false; //Responsible for the knowledge of whether the ride is in progress or not
      newState.lastDriverCoords = null; //Will hold the last driver's trip during a trip tracking (to passenger/to destination)
      newState.lastDriverBearing = 0; //Will hold the last car's bearing angle during a trip tracking (to passenger/to destination)
      newState.actPointToMinusOne = false; //Will be there to skip the first frame of the driver's car representation in the map during a trip tracking
      newState.carIconRelativeSize = 0.25; //Initial icon size of any car instances on the map
      newState.isInRouteToDestination = false; //Responsible for knowledge of whether to duo (passenger+driver) are heading to destination
      newState.destinationPoint = null; //Will hold the coordinates to the passenger's destination location.
      newState.pickupPoint = null; //Will hodl the coordinations to the passenger's pickup locatiom.

      newState.request_status = null; //! Reset the request status to null

      newState.pickupLocation_metadata = {pickupLocation_name: null}; //Hold all the metadata related to the pickup location, -- pickupLocation_name: null, //Hold the name of the pickup location.
      newState.initializedScenario = null; //To know which scenario has been initialized for animation
      //Update stored trip related variables
      newState.isRideInProgress = false;
      //Reset booking related data
      newState.carTypeSelected = false;
      newState.fareTripSelected = 12;
      newState.customFareTripSelected = false;
      newState.headerRideTypesVars.currentHeaderIndex = 0;
      newState.headerRideTypesVars.currentScrollOffset = 0;
      newState.wasRideChoosedByDefault = false;
      newState.pricingVariables.carTypesPricingMetada = [];
      newState.pricingVariables.didPricingReceivedFromServer = false;
      newState.previewDestinationData.originDestinationPreviewData = false;
      newState.isSelectTripScheduleOn = false;
      newState.scheduledScenarioContext = 'now';
      newState.scheduledScenarioContextHeader = 'now';
      newState.isSelectDatePickerActive = false;
      newState.selectedScheduleTime = 'now';
      newState.isDeliveryReceiverInfosShown = false;
      newState.customStringTypedTMP = false;
      newState.search_querySearch = '';
      newState.search_metadataResponse = [];
      newState.search_passengersDestinations = {
        passenger1Destination: false, //Passenger 1 destination's details
        passenger2Destination: false, //Passenger 2 destination's details
        passenger3Destination: false, //Passenger 3 destination's details
        passenger4Destination: false, //Passenger 4 destination's details
      };
      newState.search_passenger1DestinationInput = false;
      newState.search_passenger2DestinationInput = false;
      newState.search_passenger3DestinationInput = false;
      newState.search_passenger4DestinationInput = false;
      newState.search_pickupLocationInfos = {
        isBeingPickedupFromCurrentLocation: true, //To know whether the rider is being picked up from his/her current location or a different one - default: true
        passenger0Destination: false, //Will contain the custom pickup location infos - default: false
        //Text input
        search_passenger0DestinationInput: false, //Input text for the passenger's 0 field, etc - Pickup location
      };
      newState.currentCharStringAdditionalNote = 0;
      newState.additionalNote_inputText = false;
      newState.countriesDialDataState = null;
      newState.renderCountryCodeSeacher = false;
      newState.countryCodeSelected = 'NA';
      newState.countryPhoneCode = '+264';
      newState.dynamicMaxLength = 10;
      newState.phoneNumberEntered = '';
      newState.phoneNumberPlaceholder = '';
      newState.isFilterCountryShown = false;
      newState.typedCountrySearchQuery = '';
      newState.finalPhoneNumber = false;
      newState.isPhoneNumberValid = false;
      newState.rideOrDeliveryMetadata = {
        currentFlow: [], //Current progress flow
        iconCarSelected: false, //THe icon of the selected car when selected the ride type - default: false
        nameCarSelected: false, //The app name label of the selected ride type - default: false
        locationTypeIdentified: false, //To know whether the type of location was already identified, if !==fase, contain the name
        identifyinfLocationTypeTopTextPosition: new Animated.Value(10), //Position of the title text while working - Left offset
        identifyinfLocationTypeTopTextOpacity: new Animated.Value(0), //Opacity of the title text while working
        identifyingLocationProcessTextOpacity: new Animated.Value(0), //Opacity of the status text while finding out the type of location
        identifyingLocationProcessTextPosition: new Animated.Value(20), //Position of the status text while finding out the type of location - top offset
        identifyingLocationProcessContentOpacity: new Animated.Value(0), //Opacity of the content response after identifying the location
        numberOfPassengersSelected: 1, //Number of passengers selected by the user - default: 1
        isAllgoingToTheSamePlace: false, //T know whether all the passengers are going to the same place - default: false
        //Delivery meta
        selectedPackageSize: 'envelope', //The selected package size for delivery - default: envelope (can be: small, large or envelope)
        receiverName: false, //The name of the receiver from entering the receiver's infos
        paymentMethod: 'CASH', //The customer's payment method
      }; //Current metadata for the booking process: for RIDE or DELIVERIES
      newState.bottomVitalsFlow.currentStep = 'mainView'; //Reset current step to mainView
      newState.intervalProgressLoop = false; //Faslify the interval progress loop
      newState.isRideInProgress = false; //Falsify the key variable to know if there's a ride in progress or not.
      newState.bottomVitalsFlow._BOOKING_REQUESTED = false;
      newState.bottomVitalsFlow._error_booking_requested = false;
      newState.bottomVitalsFlow.isUserLocationCentered = false;
      newState.pickupLocation_metadata = {pickupLocation_name: null}; //Hold all the metadata related to the pickup location, -- pickupLocation_name: null, //Hold the name of the pickup location.
      newState.destinationLocation_metadata = {}; //Hold all the data on the destination location
      newState.generalTRIP_details_driverDetails = {}; //WILL HOLD THE GENERAL TRIP DETAILS AND DRIVER DETAILS - Ref. to the server doc for more - ONLY RELEVANT TO USE WHEN THE TRIP HAS BEEN ACCEPTED BY A DRIVER already! - ALWAYS clean up after usage.
      newState.initializedScenario = null; //To know which scenario has been initialized for animation
      //Reset bottom vital height
      newState.bottomVitalsFlow.bottomVitalChildHeight = new Animated.Value(
        150,
      ); //Height of the bottom vital component, default 150 - for booking 250
      //Initial container Hello animations variables
      newState.bottomVitalsFlow.mainHelloContentPosition = new Animated.Value(
        0,
      ); //Top offset position of the hello content container - default: 0 -> max: 20
      newState.bottomVitalsFlow.mainHelloContentOpacity = new Animated.Value(1); //Opacity of the hello content container - default: 1
      //Common process flow animation variables
      //These variables are common to all the process flows
      newState.bottomVitalsFlow.genericContainerPosition = new Animated.Value(
        20,
      ); //Top offset position of the generic flow container - default: 0 -> max: 20
      newState.bottomVitalsFlow.genericContainerOpacity = new Animated.Value(0); //Opacity of the generic flow container - default: 0 -> max: 20
      //Reset init hello and animation
      newState.initialHello = false; //Will hold the first "Hello" message that appear when the app is opened
      newState.initialHelloAnimationParams = {
        top: new Animated.Value(10), //Hello 1
        opacity: new Animated.Value(0), //Hello 1
        top2: new Animated.Value(10), //Hello 2
        opacity2: new Animated.Value(1), //Hello 2
      };
      //...
      if (
        action.payload !== null &&
        action.payload !== undefined &&
        action.payload !== true
      ) {
        action.payload.resetAnimationLoader();
        action.payload.fire_initGreetingAnd_after();
      }
      //Bind the requests interval persister
      if (
        action.payload.bindRequest_findFetcher !== undefined &&
        action.payload.bindRequest_findFetcher !== null
      ) {
        action.payload.bindRequest_findFetcher();
      }

      //Previous state updated
      return {...state, ...newState};
    case 'UPDATE_GRANTED_GPRS_VARS':
      //? Optimized
      //Update the previous state only if changed
      if (
        newState.gprsGlobals.hasGPRSPermissions !==
          action.payload.hasGPRSPermissions ||
        newState.gprsGlobals.didAskForGprs !== action.payload.didAskForGprs
      ) {
        newState.gprsGlobals.hasGPRSPermissions =
          action.payload.hasGPRSPermissions;
        newState.gprsGlobals.didAskForGprs = action.payload.didAskForGprs;

        return {...state, ...newState};
      } //No change
      else {
        return state;
      }
    case 'UPDATE_PENDING_GLOBAL_VARS':
      //? Optmized
      //Update the previous state
      if (
        `${JSON.stringify(newState.request_status)}` !==
          `${JSON.stringify(action.payload.request_status)}` ||
        `${JSON.stringify(newState.isRideInProgress)}` !==
          `${JSON.stringify(action.payload.isRideInProgress)}` ||
        `${JSON.stringify(newState.pickupLocation_metadata.coordinates)}` !==
          `${JSON.stringify(
            action.payload.pickupLocation_metadata.coordinates,
          )}` ||
        `${JSON.stringify(
          newState.pickupLocation_metadata.pickupLocation_name,
        )}` !==
          `${JSON.stringify(
            action.payload.pickupLocation_metadata.pickupLocation_name,
          )}`
      ) {
        newState.request_status = action.payload.request_status;
        newState.isRideInProgress = action.payload.isRideInProgress;
        newState.pickupLocation_metadata.coordinates =
          action.payload.pickupLocation_metadata.coordinates;
        newState.pickupLocation_metadata.pickupLocation_name =
          action.payload.pickupLocation_metadata.pickupLocation_name;
        //...
        return {...state, ...newState};
      } //No change
      else {
        return state;
      }
    /*newState.request_status = action.payload.request_status;
      newState.isRideInProgress = action.payload.isRideInProgress;
      newState.pickupLocation_metadata.coordinates =
        action.payload.pickupLocation_metadata.coordinates;
      newState.pickupLocation_metadata.pickupLocation_name =
        action.payload.pickupLocation_metadata.pickupLocation_name;
      //...
      return {...state, ...newState};*/

    case 'UPDATE_ROUTE_TO_PICKUP_VARS':
      //? Optmized
      //Update the previous state
      //! Do state change checks
      //! 0 for undefined elements or false conditions (no state change)
      //! 1 for true conditions (new state)
      //? Clean the array first
      checkerArray = new Array();
      //? condition 1
      checkerArray[0] =
        action.payload.lastDriverBearing !== undefined &&
        action.payload.lastDriverBearing !== null
          ? `${JSON.stringify(action.payload.lastDriverBearing)}` !==
            `${JSON.stringify(newState.lastDriverBearing)}`
            ? 1
            : 0
          : 0;
      //? condition 2
      checkerArray[1] =
        action.payload.lastDriverCoords !== undefined &&
        action.payload.lastDriverCoords !== null
          ? `${JSON.stringify(action.payload.lastDriverCoords)}` !==
            `${JSON.stringify(newState.lastDriverCoords)}`
            ? 1
            : 0
          : 0;
      //? condition 3
      checkerArray[2] =
        action.payload.isRideInProgress !== undefined &&
        action.payload.isRideInProgress !== null
          ? `${JSON.stringify(action.payload.isRideInProgress)}` !==
            `${JSON.stringify(newState.isRideInProgress)}`
            ? 1
            : 0
          : 0;
      //? condition 4
      checkerArray[3] =
        action.payload.actPointToMinusOne !== undefined &&
        action.payload.actPointToMinusOne !== null
          ? `${JSON.stringify(action.payload.actPointToMinusOne)}` !==
            `${JSON.stringify(newState.actPointToMinusOne)}`
            ? 1
            : 0
          : 0;
      //? condition 5
      checkerArray[4] =
        action.payload.isInRouteToDestination !== undefined &&
        action.payload.isInRouteToDestination !== null
          ? `${JSON.stringify(action.payload.isInRouteToDestination)}` !==
            `${JSON.stringify(newState.isInRouteToDestination)}`
            ? 1
            : 0
          : 0;
      //! Sum all the array if the result is greater than 1 - command a new state update
      checkerArray = checkerArray.reduce((a, b) => a + b, 0);
      //...
      if (checkerArray > 0) {
        //? New state update
        //...1
        if (
          action.payload.lastDriverBearing !== undefined &&
          action.payload.lastDriverBearing !== null
        ) {
          newState.lastDriverBearing = action.payload.lastDriverBearing;
        }
        //...2
        if (
          action.payload.lastDriverCoords !== undefined &&
          action.payload.lastDriverCoords !== null
        ) {
          newState.lastDriverCoords = action.payload.lastDriverCoords;
        }
        //...3
        if (
          action.payload.isRideInProgress !== undefined &&
          action.payload.isRideInProgress !== null
        ) {
          newState.isRideInProgress = action.payload.isRideInProgress;
        }
        //...4
        if (
          action.payload.actPointToMinusOne !== undefined &&
          action.payload.actPointToMinusOne !== null
        ) {
          newState.actPointToMinusOne = action.payload.actPointToMinusOne;
        }
        //...5
        if (
          action.payload.isInRouteToDestination !== undefined &&
          action.payload.isInRouteToDestination !== null
        ) {
          newState.isInRouteToDestination =
            action.payload.isInRouteToDestination;
        }
        //...
        return {...state, ...newState};
      } //No new state update
      else {
        return state;
      }

    case 'IN_ROUTE_TO_PICKUP_INIT_VARS':
      //The payload is the response from the MAP SERVICES
      //Initialize animation components
      route = new AnimatedMapbox.RouteCoordinatesArray(
        action.payload.routePoints,
      );
      routeShape = new AnimatedMapbox.CoordinatesArray(
        action.payload.routePoints,
      );
      //Initialize animation components for destination route
      routeDestination = new AnimatedMapbox.RouteCoordinatesArray(
        action.payload.routePoints,
      );
      routeShapeDestination = new AnimatedMapbox.CoordinatesArray(
        action.payload.routePoints,
      );
      //......
      newState.route = route;
      newState.shape = routeShape;
      //? actPoint: new AnimatedMapbox.ExtractCoordinateFromArray(routeShape, 0), //Linked to shape
      newState.actPoint = new AnimatedMapbox.ExtractCoordinateFromArray(
        route,
        -1,
      ); //Independent from shape
      newState.actPointToMinusOne = false;
      newState.routeCoordsPickup = action.payload.routePoints; //To pickup
      newState.routeCoordsDestination = action.payload.routePoints;

      newState.lastDriverCoords = [
        parseFloat(action.payload.driverNextPoint[0]),
        parseFloat(action.payload.driverNextPoint[1]),
      ];
      newState.isRideInProgress = true;
      newState.routeDestination = routeDestination;
      newState.shapeDestination = routeShapeDestination;
      newState.actPointDestination = new AnimatedMapbox.ExtractCoordinateFromArray(
        routeDestination,
        -1,
      ); //Independent from shape
      newState.destinationPoint = action.payload.destinationPoint.map(
        parseFloat,
      ); //Destination coords
      newState.pickupPoint = action.payload.pickupPoint.map(parseFloat); //Pickup point
      //...
      return {...state, ...newState};

    case 'IN_ROUTE_TO_DESTINATION_INIT_VARS':
      //The payload is the response from the MAP SERVICES
      //Initialize animation components for destination route
      routeDestination = new AnimatedMapbox.RouteCoordinatesArray(
        action.payload.routePoints,
      );
      routeShapeDestination = new AnimatedMapbox.CoordinatesArray(
        action.payload.routePoints,
      );
      //----
      //? actPoint: new AnimatedMapbox.ExtractCoordinateFromArray(routeShape, 0), //Linked to shape
      newState.actPointToMinusOne = false;
      newState.routeCoordsPickup = action.payload.routePoints; //To pickup
      newState.routeCoordsDestination =
        action.payload.destinationData.routePoints; //To destination
      newState.lastDriverCoords = [
        parseFloat(action.payload.driverNextPoint[0]),
        parseFloat(action.payload.driverNextPoint[1]),
      ];
      newState.isRideInProgress = true;
      newState.routeDestination = routeDestination;
      newState.shapeDestination = routeShapeDestination;
      newState.actPointDestination = new AnimatedMapbox.ExtractCoordinateFromArray(
        routeDestination,
        -1,
      ); //Independent from shape
      newState.destinationPoint = action.payload.destinationPoint; //Destination coords
      //...
      return {...state, ...newState};

    case 'UPDATE_TINY_CAR_ON_MAP_ICON_SIZE':
      //Paylod is the new relative tiny car icon size
      newState.carIconRelativeSize = action.payload;
      //...
      return {...state, ...newState};

    case 'UPDATE_HELLO_VARS':
      if (
        action.payload.initialHello !== undefined &&
        action.payload.initialHello !== null
      ) {
        newState.initialHello = action.payload.initialHello;
      }
      if (
        action.payload.hello2Text !== undefined &&
        action.payload.hello2Text !== null
      ) {
        newState.hello2Text = action.payload.hello2Text;
      }
      //..
      return {...state, ...newState};

    case 'UPDATE_SCHEDULER_STATE':
      if (
        action.payload.scheduledScenarioContext !== undefined &&
        action.payload.scheduledScenarioContext !== null
      ) {
        newState.scheduledScenarioContext =
          action.payload.scheduledScenarioContext;
      }
      if (
        action.payload.selectedScheduleTime !== undefined &&
        action.payload.selectedScheduleTime !== null
      ) {
        newState.selectedScheduleTime = action.payload.selectedScheduleTime;
      }
      if (
        action.payload.scheduledScenarioContextHeader !== undefined &&
        action.payload.scheduledScenarioContextHeader !== null
      ) {
        newState.scheduledScenarioContextHeader =
          action.payload.scheduledScenarioContextHeader;
      }
      if (
        action.payload.isSelectTripScheduleOn !== undefined &&
        action.payload.isSelectTripScheduleOn !== null
      ) {
        newState.isSelectTripScheduleOn = action.payload.isSelectTripScheduleOn;
      }
      if (
        action.payload.isSelectDatePickerActive !== undefined &&
        action.payload.isSelectDatePickerActive !== null
      ) {
        newState.isSelectDatePickerActive =
          action.payload.isSelectDatePickerActive;
      }
      //..
      return {...state, ...newState};

    case 'UPDATE_CUSTOM_FARE_STATE':
      if (
        action.payload.isEnterCustomFareWindowOn !== undefined &&
        action.payload.isEnterCustomFareWindowOn !== null
      ) {
        newState.isEnterCustomFareWindowOn =
          action.payload.isEnterCustomFareWindowOn;
      }
      if (
        action.payload.fareTripSelected !== undefined &&
        action.payload.fareTripSelected !== null
      ) {
        newState.customFareTripSelected = action.payload.fareTripSelected;
      }
      //Update the payment method
      //Auto select cash if the amount in the wallet is not enough
      if (/wallet/i.test(newState.wallet_state_vars.selectedPayment_method)) {
        if (newState.wallet_state_vars.totalWallet_amount === 0) {
          newState.wallet_state_vars.selectedPayment_method = 'cash';
        } else {
          if (newState.customFareTripSelected !== false) {
            if (
              newState.customFareTripSelected <=
              newState.wallet_state_vars.totalWallet_amount
            ) {
              //Do nothing - leave wallet
            } else {
              newState.wallet_state_vars.selectedPayment_method = 'cash';
            }
          } else {
            if (
              newState.fareTripSelected <=
              newState.wallet_state_vars.totalWallet_amount
            ) {
              //Do nothing - leave wallet
            } else {
              newState.wallet_state_vars.selectedPayment_method = 'cash';
            }
          }
        }
      }
      //...
      return {...state, ...newState};

    case 'UPDATE_BOTTOM_VITALS_STATE':
      if (
        action.payload.bottomVitalsFlow !== undefined &&
        action.payload.bottomVitalsFlow !== null
      ) {
        newState.bottomVitalsFlow = action.payload.bottomVitalsFlow;
      }
      //...
      return {...state, ...newState};

    case 'UPDATE_PROCESS_FLOW_STATE':
      //Launch the loader - should be done conditionally to the flow states that require a loader period!
      if (action.payload.parentTHIS !== undefined) {
        SOCKET_CORE.emit('geocode-this-point', {
          latitude: newState.latitude,
          longitude: newState.longitude,
          user_fingerprint: newState.user_fingerprint,
        }); //Update the current location of the user
        //Update the MAIn PARENT
        newState._MAIN_PARENT = action.payload.parentTHIS; //Very important to update local elements based on external behaviors (of other components)
      }
      //Update the connect type if != false (default) - ConnectMe or ConnectUs
      if (action.payload.connectType !== false) {
        if (/connectus/i.test(action.payload.connectType)) {
          //ConnectUs - format
          newState.bottomVitalsFlow.connectType = 'ConnectUs';
        } else if (/connectme/i.test(action.payload.connectType)) {
          //ConnetMe - format
          newState.bottomVitalsFlow.connectType = 'ConnectMe';
          //? if the previous number of passenger is greater or equal to 4 - set to 3
          if (
            newState.bottomVitalsFlow.rideOrDeliveryMetadata
              .numberOfPassengersSelected >= 4
          ) {
            newState.bottomVitalsFlow.rideOrDeliveryMetadata.numberOfPassengersSelected = 1;
          }
        }
      }
      //---------------------------------------------------------------------
      if (
        action.payload.flowParent !== undefined &&
        action.payload.flowParent !== null
      ) {
        newState.bottomVitalsFlow.flowParent = action.payload.flowParent; //Updated the flow parent if elligible.
      }
      //Check for the process parent (RIDE OR DELIVERY)
      if (newState.bottomVitalsFlow.flowParent === 'RIDE') {
        //Loader manager
        if (action.payload.flowDirection === 'next') {
          if (
            action.payload.parentTHIS !== undefined ||
            newState._MAIN_PARENT !== null
          ) {
            //Check if the loader applis to this view
            if (
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) + 1
              ] !== undefined
            ) {
              if (
                newState.bottomVitalsFlow.processLoaderActive.includes(
                  newState.bottomVitalsFlow.rideBookingFlow[
                    newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                      newState.bottomVitalsFlow.currentStep,
                    ) + 1
                  ],
                )
              ) {
                //Fire the loader - reinitialize the loader's values
                newState.loaderPosition = new Animated.Value(0); //For animation loader
                newState.loaderBasicWidth = new Animated.Value(1);
                newState.showLocationSearch_loader = true;
                if (
                  action !== undefined &&
                  action.payload.parentTHIS !== undefined
                ) {
                  action.payload.parentTHIS.fire_search_animation();
                } //Make use of the general state store main parent to animate
                else {
                  newState._MAIN_PARENT.fire_search_animation();
                }
              }
            }
          }
          //Iterate
          if (
            newState.bottomVitalsFlow.rideBookingFlow[
              newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                newState.bottomVitalsFlow.currentStep,
              ) + 1
            ] !== undefined &&
            newState.bottomVitalsFlow.rideBookingFlow[
              newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                newState.bottomVitalsFlow.currentStep,
              ) + 1
            ] !== null
          ) {
            //Update map general usiability : zoom, picthed, rotate, etc
            if (
              newState.bottomVitalsFlow.processCanMapBeMoved.includes(
                newState.bottomVitalsFlow.rideBookingFlow[
                  newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) + 1
                ],
              )
            ) {
              //Can manipulate
              newState.bottomVitalsFlow.zoomEnabled = true;
              newState.bottomVitalsFlow.scrollEnabled = true;
              newState.bottomVitalsFlow.rotateEnabled = true;
              newState.bottomVitalsFlow.pitchEnabled = true;
            } //Can't manipulate
            else {
              newState.bottomVitalsFlow.zoomEnabled = false;
              newState.bottomVitalsFlow.scrollEnabled = false;
              newState.bottomVitalsFlow.rotateEnabled = false;
              newState.bottomVitalsFlow.pitchEnabled = false;
            }
            //---

            //Update reset select ride type header to initials
            newState.headerRideTypesVars.currentHeaderIndex = 0;
            newState.headerRideTypesVars.currentScrollOffset = 0;

            //Update accessibility of gprs recenter button
            if (
              newState.bottomVitalsFlow.processRecenterGPRS.includes(
                newState.bottomVitalsFlow.rideBookingFlow[
                  newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) + 1
                ],
              )
            ) {
              //Can go recenter
              newState.bottomVitalsFlow.canRecenterGPRS = true;
            } //Can't go recenter
            else {
              newState.bottomVitalsFlow.canRecenterGPRS = false;
            }
            //---

            //Update accessibility of can go back button
            if (
              newState.bottomVitalsFlow.processCanGoBack.includes(
                newState.bottomVitalsFlow.rideBookingFlow[
                  newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) + 1
                ],
              )
            ) {
              //Can go back
              newState.bottomVitalsFlow.canGoBack = true;
            } //Can't go back
            else {
              newState.bottomVitalsFlow.canGoBack = false;
            }
            //---
            //Update line loader's color
            newState.loaderColor =
              newState.bottomVitalsFlow.processFlowSpecificColors[
                newState.bottomVitalsFlow.rideBookingFlow[
                  newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) + 1
                ]
              ];
            //-------
            //Reset interval counter persister to null
            if (
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                )
              ] === 'identifyLocation'
            ) {
              newState.pricingVariables.didPricingReceivedFromServer = false; //! Reset did receive pricing
              if (newState.bottomVitalsFlow.locationTypeIdentified !== false) {
                clearInterval(newState._TMP_INTERVAL_PERSISTER);
                newState._TMP_INTERVAL_PERSISTER = null;
              } else {
                if (newState._TMP_INTERVAL_PERSISTER !== null) {
                  clearInterval(newState._TMP_INTERVAL_PERSISTER);
                  newState._TMP_INTERVAL_PERSISTER = null;
                }
              }
            }
            //Activate search module if at "selectDestination"
            if (
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) + 1
              ] === 'selectDestination'
            ) {
              newState.isSearchModuleOn = true;
              newState.search_showSearchNodeMain = true;
            } //Hide search module
            else {
              newState.isSearchModuleOn = false;
              newState.search_showSearchNodeMain = false;
            }
            //...
            newState.bottomVitalsFlow.currentStep =
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) + 1
              ];
          }
        } else if (action.payload.flowDirection === 'previous') {
          //Loader manager
          if (action.payload.parentTHIS !== undefined) {
            //Check if the loader applis to this view
            if (
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] !== undefined
            ) {
              if (
                newState.bottomVitalsFlow.processLoaderActive.includes(
                  newState.bottomVitalsFlow.rideBookingFlow[
                    newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                      newState.bottomVitalsFlow.currentStep,
                    ) - 1
                  ],
                )
              ) {
                //Fire the loader - reinitialize the loader's values
                newState.loaderPosition = new Animated.Value(0); //For animation loader
                newState.loaderBasicWidth = new Animated.Value(1);
                newState.showLocationSearch_loader = true;
                action.payload.parentTHIS.fire_search_animation();
              }
            }
          }
          //Decrement
          if (
            newState.bottomVitalsFlow.rideBookingFlow[
              newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                newState.bottomVitalsFlow.currentStep,
              ) - 1
            ] !== undefined &&
            newState.bottomVitalsFlow.rideBookingFlow[
              newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                newState.bottomVitalsFlow.currentStep,
              ) - 1
            ] !== null
          ) {
            //Update map general usiability : zoom, picthed, rotate, etc
            if (
              newState.bottomVitalsFlow.processCanMapBeMoved.includes(
                newState.bottomVitalsFlow.rideBookingFlow[
                  newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ],
              )
            ) {
              //Can manipulate
              newState.bottomVitalsFlow.zoomEnabled = true;
              newState.bottomVitalsFlow.scrollEnabled = true;
              newState.bottomVitalsFlow.rotateEnabled = true;
              newState.bottomVitalsFlow.pitchEnabled = true;
            } //Can't manipulate
            else {
              newState.bottomVitalsFlow.zoomEnabled = false;
              newState.bottomVitalsFlow.scrollEnabled = false;
              newState.bottomVitalsFlow.rotateEnabled = false;
              newState.bottomVitalsFlow.pitchEnabled = false;
            }
            //---
            //Update accessibility of gprs recenter button
            if (
              newState.bottomVitalsFlow.processRecenterGPRS.includes(
                newState.bottomVitalsFlow.rideBookingFlow[
                  newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ],
              )
            ) {
              //Can go recenter
              newState.bottomVitalsFlow.canRecenterGPRS = true;
            } //Can't go recenter
            else {
              newState.bottomVitalsFlow.canRecenterGPRS = false;
            }
            //---
            //Update accessibility of can go back button
            if (
              newState.bottomVitalsFlow.processCanGoBack.includes(
                newState.bottomVitalsFlow.rideBookingFlow[
                  newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ],
              )
            ) {
              //Can go back
              newState.bottomVitalsFlow.canGoBack = true;
            } //Can't go back
            else {
              newState.bottomVitalsFlow.canGoBack = false;
            }
            //---
            //Update line loader's color
            newState.loaderColor =
              newState.bottomVitalsFlow.processFlowSpecificColors[
                newState.bottomVitalsFlow.rideBookingFlow[
                  newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ]
              ];
            //-------
            //Update scheduler to display to false when 'selectCarTypeAndPaymentMethod
            //REset PRICES ESTIMATES AS WELL
            if (
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                )
              ] === 'selectCarTypeAndPaymentMethod'
            ) {
              newState.isSelectTripScheduleOn = false; //automatically turn off the scheduler
              //Reset prices estimates
              newState.pricingVariables.didPricingReceivedFromServer = false;
              newState.pricingVariables.carTypesPricingMetada = [];
              //Make sure that the height is at 400
              newState.bottomVitalsFlow.genericContainerOpacity = new Animated.Value(
                1,
              );
              newState.bottomVitalsFlow.genericContainerPosition = new Animated.Value(
                0,
              );
              newState.bottomVitalsFlow.bottomVitalChildHeight = new Animated.Value(
                400,
              );
            }

            //Reset autoscroll tracking variablewhen selecting ride types
            //Reset custom fare to false
            //Autoclose custom fare input screen
            if (
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                )
              ] -
                1 ===
              'selectCarTypeAndPaymentMethod'
            ) {
              newState.headerRideTypesVars.currentHeaderIndex = 0;
              newState.headerRideTypesVars.currentScrollOffset = 0;
              //Reset custom fare to false
              newState.customFareTripSelected = false;
              //Close custom fare screen
              newState.isEnterCustomFareWindowOn = false;
              //Make sure that the height is at 400
              newState.bottomVitalsFlow.genericContainerOpacity = new Animated.Value(
                1,
              );
              newState.bottomVitalsFlow.genericContainerPosition = new Animated.Value(
                0,
              );
              newState.bottomVitalsFlow.bottomVitalChildHeight = new Animated.Value(
                400,
              );
            }

            //Reset auto-select of car types to true
            if (
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                )
              ] -
                1 ===
              'addMoreTripDetails'
            ) {
              newState.wasRideChoosedByDefault = true; //automatically turn off the scheduler
            }

            //Reset location identified to false if choose ride or delivery back detected
            if (
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] === 'selectRideOrDelivery'
            ) {
              newState.bottomVitalsFlow.rideOrDeliveryMetadata.locationTypeIdentified = false; //reset pickup location identified
            }

            //Jump from addMoreTripDetails -> selectNoOfPassengers (bypass selectDestination)
            if (
              newState.bottomVitalsFlow.rideBookingFlow[
                newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] === 'selectDestination'
            ) {
              //Reset custom pickup location to current location
              newState.search_pickupLocationInfos.isBeingPickedupFromCurrentLocation = true; //Disable custom pickup
              newState.search_pickupLocationInfos.passenger0Destination = false; //Reset the location details
              newState.search_pickupLocationInfos.search_passenger0DestinationInput = false; //Reset the textinout value.
              //...
              newState.bottomVitalsFlow.currentStep = 'selectNoOfPassengers';
              newState.bottomVitalsFlow.canGoBack = true; //Force go back action button
              //Reset destination details
              newState.search_passengersDestinations.passenger1Destination = false; //Passenger 1 destination's details
              newState.search_passengersDestinations.passenger2Destination = false; //Passenger 2 destination's details
              newState.search_passengersDestinations.passenger3Destination = false; //Passenger 3 destination's details
              newState.search_passengersDestinations.passenger4Destination = false; //Passenger 4 destination's details
              //...Text inputs
              newState.search_passenger1DestinationInput = false; //Input text for the passenger's 1 field, etc
              newState.search_passenger2DestinationInput = false; //Input text for the passenger's 2 field, etc
              newState.search_passenger3DestinationInput = false; //Input text for the passenger's 3 field, etc
              newState.search_passenger4DestinationInput = false; //Input text for the passenger's 4 field, etc
              //Reset destination preview
              newState.previewDestinationData.originDestinationPreviewData = false;
              if (newState._TMP_INTERVAL_PERSISTER !== null) {
                clearInterval(newState._TMP_INTERVAL_PERSISTER);
              }
              newState._TMP_INTERVAL_PERSISTER = null;
              newState.pricingVariables.didPricingReceivedFromServer = false; //! Reset did receive pricing
              //Reset the map usability
              //Enable all usages
              newState.bottomVitalsFlow.zoomEnabled = true;
              newState.bottomVitalsFlow.scrollEnabled = true;
              newState.bottomVitalsFlow.rotateEnabled = true;
              newState.bottomVitalsFlow.pitchEnabled = true;
            } //Normal flow
            else {
              newState.isSearchModuleOn = false;
              newState.bottomVitalsFlow.currentStep =
                newState.bottomVitalsFlow.rideBookingFlow[
                  newState.bottomVitalsFlow.rideBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ];
            }
            //...
          }
        }
      } else if (newState.bottomVitalsFlow.flowParent === 'DELIVERY') {
        newState.bottomVitalsFlow.rideOrDeliveryMetadata.numberOfPassengersSelected = 1; //! Force the one passenger selection.
        newState.bottomVitalsFlow.rideOrDeliveryMetadata.isAllgoingToTheSamePlace = false; //! Deactivate the going to the same destination flag.
        //For deliveries
        //Loader manager
        if (action.payload.flowDirection === 'next') {
          newState.bottomVitalsFlow._error_booking_requested = false; //Reset error booking to false
          if (
            action.payload.parentTHIS !== undefined ||
            newState._MAIN_PARENT !== null
          ) {
            //Check if the loader applis to this view
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) + 1
              ] !== undefined
            ) {
              if (
                newState.bottomVitalsFlow.processLoaderActive.includes(
                  newState.bottomVitalsFlow.deliveryBookingFlow[
                    newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                      newState.bottomVitalsFlow.currentStep,
                    ) + 1
                  ],
                )
              ) {
                //Fire the loader - reinitialize the loader's values
                newState.loaderPosition = new Animated.Value(0); //For animation loader
                newState.loaderBasicWidth = new Animated.Value(1);
                newState.showLocationSearch_loader = true;
                if (action.payload.parentTHIS !== undefined) {
                  action.payload.parentTHIS.fire_search_animation();
                } //Make use of the general state store main parent to animate
                else {
                  newState._MAIN_PARENT.fire_search_animation();
                }
              }
            }
          }
          //Iterate
          if (
            newState.bottomVitalsFlow.deliveryBookingFlow[
              newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                newState.bottomVitalsFlow.currentStep,
              ) + 1
            ] !== undefined &&
            newState.bottomVitalsFlow.deliveryBookingFlow[
              newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                newState.bottomVitalsFlow.currentStep,
              ) + 1
            ] !== null
          ) {
            //Update map general usiability : zoom, picthed, rotate, etc
            if (
              newState.bottomVitalsFlow.processCanMapBeMoved.includes(
                newState.bottomVitalsFlow.deliveryBookingFlow[
                  newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) + 1
                ],
              )
            ) {
              //Can manipulate
              newState.bottomVitalsFlow.zoomEnabled = true;
              newState.bottomVitalsFlow.scrollEnabled = true;
              newState.bottomVitalsFlow.rotateEnabled = true;
              newState.bottomVitalsFlow.pitchEnabled = true;
            } //Can't manipulate
            else {
              newState.bottomVitalsFlow.zoomEnabled = false;
              newState.bottomVitalsFlow.scrollEnabled = false;
              newState.bottomVitalsFlow.rotateEnabled = false;
              newState.bottomVitalsFlow.pitchEnabled = false;
            }
            //---

            //Update reset select ride type header to initials
            newState.headerRideTypesVars.currentHeaderIndex = 0;
            newState.headerRideTypesVars.currentScrollOffset = 0;

            //Update accessibility of gprs recenter button
            if (
              newState.bottomVitalsFlow.processRecenterGPRS.includes(
                newState.bottomVitalsFlow.deliveryBookingFlow[
                  newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) + 1
                ],
              )
            ) {
              //Can go recenter
              newState.bottomVitalsFlow.canRecenterGPRS = true;
            } //Can't go recenter
            else {
              newState.bottomVitalsFlow.canRecenterGPRS = false;
            }
            //---

            //Update accessibility of can go back button
            if (
              newState.bottomVitalsFlow.processCanGoBack.includes(
                newState.bottomVitalsFlow.deliveryBookingFlow[
                  newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) + 1
                ],
              )
            ) {
              //Can go back
              newState.bottomVitalsFlow.canGoBack = true;
            } //Can't go back
            else {
              newState.bottomVitalsFlow.canGoBack = false;
            }
            //---
            //Update line loader's color
            newState.loaderColor =
              newState.bottomVitalsFlow.processFlowSpecificColors[
                newState.bottomVitalsFlow.deliveryBookingFlow[
                  newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) + 1
                ]
              ];
            //-------
            //Update bottom vital height child when inputing receiver's details or selecting the package size
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) + 1
              ] === 'inputReceiverInformations' ||
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) + 1
              ] === 'selectPackageSize'
            ) {
              newState.pricingVariables.didPricingReceivedFromServer = false; //! Reset did receive pricing
              if (newState._MAIN_PARENT !== null) {
                Animated.timing(
                  newState.bottomVitalsFlow.bottomVitalChildHeight,
                  {
                    toValue: newState.windowHeight,
                    duration: 200,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: false,
                  },
                ).start();
              }
            } //Resize the height back to 400
            else {
              if (newState._MAIN_PARENT !== null) {
                Animated.timing(
                  newState.bottomVitalsFlow.bottomVitalChildHeight,
                  {
                    toValue: 400,
                    duration: 200,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: false,
                  },
                ).start();
              }
            }

            //Hack - FOrce show addMoreTripDetails window
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) + 1
              ] === 'addMoreTripDetails'
            ) {
              Animated.parallel([
                Animated.timing(
                  newState.bottomVitalsFlow.genericContainerOpacity,
                  {
                    toValue: 1,
                    duration: 250,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
                Animated.timing(
                  newState.bottomVitalsFlow.genericContainerPosition,
                  {
                    toValue: 0,
                    duration: 250,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
              ]).start();
            }

            //Activate search module if at "selectDestination"
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) + 1
              ] === 'selectDestination'
            ) {
              newState.isSearchModuleOn = true;
              newState.search_showSearchNodeMain = true;
            } //Hide search module
            else {
              newState.isSearchModuleOn = false;
              newState.search_showSearchNodeMain = false;
            }
            //...Move
            newState.bottomVitalsFlow.currentStep =
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) + 1
              ];
          }
        } else if (action.payload.flowDirection === 'previous') {
          newState.bottomVitalsFlow._error_booking_requested = false; //Reset error booking to false
          if (
            action.payload.parentTHIS !== undefined ||
            newState._MAIN_PARENT !== null
          ) {
            //Check if the loader applis to this view
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] !== undefined
            ) {
              if (
                newState.bottomVitalsFlow.processLoaderActive.includes(
                  newState.bottomVitalsFlow.deliveryBookingFlow[
                    newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                      newState.bottomVitalsFlow.currentStep,
                    ) - 1
                  ],
                )
              ) {
                //Fire the loader - reinitialize the loader's values
                newState.loaderPosition = new Animated.Value(0); //For animation loader
                newState.loaderBasicWidth = new Animated.Value(1);
                newState.showLocationSearch_loader = true;
                if (action.payload.parentTHIS !== undefined) {
                  action.payload.parentTHIS.fire_search_animation();
                } //Make use of the general state store main parent to animate
                else {
                  newState._MAIN_PARENT.fire_search_animation();
                }
              }
            }
          }
          //Deiterate
          if (
            newState.bottomVitalsFlow.deliveryBookingFlow[
              newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                newState.bottomVitalsFlow.currentStep,
              ) - 1
            ] !== undefined &&
            newState.bottomVitalsFlow.deliveryBookingFlow[
              newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                newState.bottomVitalsFlow.currentStep,
              ) - 1
            ] !== null
          ) {
            //Update map general usiability : zoom, picthed, rotate, etc
            if (
              newState.bottomVitalsFlow.processCanMapBeMoved.includes(
                newState.bottomVitalsFlow.deliveryBookingFlow[
                  newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ],
              )
            ) {
              //Can manipulate
              newState.bottomVitalsFlow.zoomEnabled = true;
              newState.bottomVitalsFlow.scrollEnabled = true;
              newState.bottomVitalsFlow.rotateEnabled = true;
              newState.bottomVitalsFlow.pitchEnabled = true;
            } //Can't manipulate
            else {
              newState.bottomVitalsFlow.zoomEnabled = false;
              newState.bottomVitalsFlow.scrollEnabled = false;
              newState.bottomVitalsFlow.rotateEnabled = false;
              newState.bottomVitalsFlow.pitchEnabled = false;
            }
            //---

            //Update accessibility of gprs recenter button
            if (
              newState.bottomVitalsFlow.processRecenterGPRS.includes(
                newState.bottomVitalsFlow.deliveryBookingFlow[
                  newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ],
              )
            ) {
              //Can go recenter
              newState.bottomVitalsFlow.canRecenterGPRS = true;
            } //Can't go recenter
            else {
              newState.bottomVitalsFlow.canRecenterGPRS = false;
            }
            //---

            //Update accessibility of can go back button
            if (
              newState.bottomVitalsFlow.processCanGoBack.includes(
                newState.bottomVitalsFlow.deliveryBookingFlow[
                  newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ],
              )
            ) {
              //Can go back
              newState.bottomVitalsFlow.canGoBack = true;
            } //Can't go back
            else {
              newState.bottomVitalsFlow.canGoBack = false;
            }
            //---
            //Update line loader's color
            newState.loaderColor =
              newState.bottomVitalsFlow.processFlowSpecificColors[
                newState.bottomVitalsFlow.deliveryBookingFlow[
                  newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ]
              ];
            //-------
            //Update scheduler to display to false when 'selectCarTypeAndPaymentMethod
            //REset PRICES ESTIMATES AS WELL
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                )
              ] === 'selectCarTypeAndPaymentMethod'
            ) {
              newState.isSelectTripScheduleOn = false; //automatically turn off the scheduler
              //Reset prices estimates
              newState.pricingVariables.didPricingReceivedFromServer = false;
              newState.pricingVariables.carTypesPricingMetada = [];
              //Make sure that the height is at 400
              newState.bottomVitalsFlow.genericContainerOpacity = new Animated.Value(
                1,
              );
              newState.bottomVitalsFlow.genericContainerPosition = new Animated.Value(
                0,
              );
              newState.bottomVitalsFlow.bottomVitalChildHeight = new Animated.Value(
                400,
              );
            }

            //Reset autoscroll tracking variablewhen selecting ride types
            //Reset custom fare to false
            //Autoclose custom fare input screen
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                )
              ] -
                1 ===
              'selectCarTypeAndPaymentMethod'
            ) {
              newState.headerRideTypesVars.currentHeaderIndex = 0;
              newState.headerRideTypesVars.currentScrollOffset = 0;
              //Reset custom fare to false
              newState.customFareTripSelected = false;
              //Close custom fare screen
              newState.isEnterCustomFareWindowOn = false;
              //Make sure that the height is at 400
              newState.bottomVitalsFlow.genericContainerOpacity = new Animated.Value(
                1,
              );
              newState.bottomVitalsFlow.genericContainerPosition = new Animated.Value(
                0,
              );
              newState.bottomVitalsFlow.bottomVitalChildHeight = new Animated.Value(
                400,
              );
            }

            //Reset auto-select of car types to true
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                )
              ] -
                1 ===
              'addMoreTripDetails'
            ) {
              newState.pricingVariables.didPricingReceivedFromServer = false; //! Reset did receive pricing
              newState.wasRideChoosedByDefault = true; //automatically turn off the scheduler
            }

            //Reset location identified to false if choose ride or delivery back detected
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] === 'selectRideOrDelivery'
            ) {
              newState.bottomVitalsFlow.rideOrDeliveryMetadata.locationTypeIdentified = false; //reset pickup location identified
            }

            //Update bottom vital height child when inputing receiver's details or selecting the package size
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] === 'inputReceiverInformations' ||
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] === 'selectPackageSize' ||
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] === 'selectDestination'
            ) {
              newState.pricingVariables.didPricingReceivedFromServer = false; //! Reset did receive pricing
              Animated.timing(
                newState.bottomVitalsFlow.bottomVitalChildHeight,
                {
                  toValue: newState.windowHeight,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: false,
                },
              ).start();
              Animated.parallel([
                Animated.timing(
                  newState.bottomVitalsFlow.genericContainerOpacity,
                  {
                    toValue: 1,
                    duration: 250,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
                Animated.timing(
                  newState.bottomVitalsFlow.genericContainerPosition,
                  {
                    toValue: 0,
                    duration: 250,
                    easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                    useNativeDriver: true,
                  },
                ),
              ]).start();
            } //Resize the height back to 400
            else {
              Animated.timing(
                newState.bottomVitalsFlow.bottomVitalChildHeight,
                {
                  toValue: 400,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: false,
                },
              ).start();
            }
            //RESET the receiver's infos (bottomVitalsFlow) WHEN BACK TO SELECT RIDE OR DELIVERY
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] === 'selectRideOrDelivery'
            ) {
              newState.bottomVitalsFlow.rideOrDeliveryMetadata.receiverName = false;
              newState.phoneNumberEntered = '';
              newState.errorReceiverNameShow = false;
              newState.errorReceiverPhoneNumberShow = false;
              //Reset interval persister
              if (newState._TMP_INTERVAL_PERSISTER !== null) {
                clearInterval(newState._TMP_INTERVAL_PERSISTER);
                newState._TMP_INTERVAL_PERSISTER = null;
              } else if (newState._TMP_INTERVAL_PERSISTER === undefined) {
                newState._TMP_INTERVAL_PERSISTER = null;
              }
            }

            //Jump from addMoreTripDetails -> inputReceiverInformations (bypass selectDestination)
            if (
              newState.bottomVitalsFlow.deliveryBookingFlow[
                newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                  newState.bottomVitalsFlow.currentStep,
                ) - 1
              ] === 'selectDestination'
            ) {
              //Reset custom pickup location to current location
              newState.search_pickupLocationInfos.isBeingPickedupFromCurrentLocation = true; //Disable custom pickup
              newState.search_pickupLocationInfos.passenger0Destination = false; //Reset the location details
              newState.search_pickupLocationInfos.search_passenger0DestinationInput = false; //Reset the textinout value.
              //...
              newState.bottomVitalsFlow.currentStep =
                'inputReceiverInformations';
              newState.bottomVitalsFlow.canGoBack = true; //Force go back action button
              //Reset destination details
              newState.search_passengersDestinations.passenger1Destination = false; //Passenger 1 destination's details
              newState.search_passengersDestinations.passenger2Destination = false; //Passenger 2 destination's details
              newState.search_passengersDestinations.passenger3Destination = false; //Passenger 3 destination's details
              newState.search_passengersDestinations.passenger4Destination = false; //Passenger 4 destination's details
              //...Text inputs
              newState.search_passenger1DestinationInput = false; //Input text for the passenger's 1 field, etc
              newState.search_passenger2DestinationInput = false; //Input text for the passenger's 2 field, etc
              newState.search_passenger3DestinationInput = false; //Input text for the passenger's 3 field, etc
              newState.search_passenger4DestinationInput = false; //Input text for the passenger's 4 field, etc
              //Reset destination preview
              newState.previewDestinationData.originDestinationPreviewData = false;
              if (newState._TMP_INTERVAL_PERSISTER !== null) {
                clearInterval(newState._TMP_INTERVAL_PERSISTER);
              }
              newState._TMP_INTERVAL_PERSISTER = null;
              //Reset the map usability
              //Enable all usages
              newState.bottomVitalsFlow.zoomEnabled = true;
              newState.bottomVitalsFlow.scrollEnabled = true;
              newState.bottomVitalsFlow.rotateEnabled = true;
              newState.bottomVitalsFlow.pitchEnabled = true;
            } //Normal flow
            else {
              newState.isSearchModuleOn = false;
              newState.bottomVitalsFlow.currentStep =
                newState.bottomVitalsFlow.deliveryBookingFlow[
                  newState.bottomVitalsFlow.deliveryBookingFlow.indexOf(
                    newState.bottomVitalsFlow.currentStep,
                  ) - 1
                ];
            }
            //...
          }
        }
      }
      //Update
      return {...state, ...newState};

    case 'UPDATE_SEARCH_METADATA_LOADER_STATE':
      //Payload is an object constaining the new internal state of the search module
      if (
        action.payload.search_showSearchNodeMain !== undefined &&
        action.payload.search_showSearchNodeMain !== null
      ) {
        newState.search_showSearchNodeMain =
          action.payload.search_showSearchNodeMain;
      }
      if (
        action.payload.search_metadataResponse !== undefined &&
        action.payload.search_metadataResponse !== null
      ) {
        newState.search_metadataResponse =
          action.payload.search_metadataResponse;
      }
      if (
        action.payload.search_showLocationSearch_loader !== undefined &&
        action.payload.search_showLocationSearch_loader !== null
      ) {
        newState.search_showLocationSearch_loader =
          action.payload.search_showLocationSearch_loader;
      }
      if (
        action.payload.search_currentFocusedPassenger !== undefined &&
        action.payload.search_currentFocusedPassenger !== null
      ) {
        newState.search_currentFocusedPassenger =
          action.payload.search_currentFocusedPassenger;
        //Enable custom pickup location if passenger 0
        if (action.payload.search_currentFocusedPassenger === 0) {
          //Set default input text value to current location name if false
          newState.search_pickupLocationInfos.isBeingPickedupFromCurrentLocation = false;
          if (
            newState.search_pickupLocationInfos
              .search_passenger0DestinationInput === false
          ) {
            newState.search_pickupLocationInfos.search_passenger0DestinationInput =
              newState.userCurrentLocationMetaData.street !== undefined
                ? newState.userCurrentLocationMetaData.street !== undefined
                  ? newState.userCurrentLocationMetaData.street
                  : newState.userCurrentLocationMetaData.name
                : 'Searching...';
          }
        }
      }

      //...
      return {...state, ...newState};

    case 'UPDATE_MAP_USABILITY_STATE':
      if (
        action.payload.isRecentered === undefined ||
        action.payload.isRecentered === null
      ) {
        if (action.payload) {
          //Enable all usages
          newState.bottomVitalsFlow.zoomEnabled = true;
          newState.bottomVitalsFlow.scrollEnabled = true;
          newState.bottomVitalsFlow.rotateEnabled = true;
          newState.bottomVitalsFlow.pitchEnabled = true;
          //Hide recenter button
          newState.bottomVitalsFlow.isUserLocationCentered = true;
        } //Disable all usages
        else {
          newState.bottomVitalsFlow.zoomEnabled = false;
          newState.bottomVitalsFlow.scrollEnabled = false;
          newState.bottomVitalsFlow.rotateEnabled = false;
          newState.bottomVitalsFlow.pitchEnabled = false;
        }
      } else if (action.payload.isRecentered !== undefined) {
        //Recenter and hide recenter button or not
        if (action.payload.isRecentered === true) {
          //Hide recenter button
          newState.bottomVitalsFlow.isUserLocationCentered = true;
        } //Show recenter button
        else {
          newState.bottomVitalsFlow.isUserLocationCentered = false;
        }
      }
      //Hide recenter if a ride is in progress
      if (newState.isRideInProgress) {
        newState.bottomVitalsFlow.isUserLocationCentered = true;
        newState.bottomVitalsFlow.zoomEnabled = false;
        newState.bottomVitalsFlow.scrollEnabled = false;
        newState.bottomVitalsFlow.rotateEnabled = false;
        newState.bottomVitalsFlow.pitchEnabled = false;
      }

      //...
      return {...state, ...newState};

    case 'UPDATE_RIDE_TYPES_SCALES':
      //check the ride category
      if (
        action.payload.rideType === 'normalTaxiEconomy' ||
        action.payload.rideType === 'electricBikes'
      ) {
        newState.carTypeSelected = action.payload.rideType;
        newState.colorCircleNormalTaxi = '#0D8691';
        newState.colorBannerRideTypeNormalTaxi = '#000';
        newState.colorCircleElectricCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricCar = '#a2a2a2';
        //Comfort
        newState.colorCircleComfortTaxi = '#a2a2a2';
        newState.colorBannerRideTypeComfortTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricComfortCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
        //Luxury
        newState.colorCircleLuxuryTaxi = '#a2a2a2';
        newState.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricLuxuryCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
        //Update the scales
        newState.scaleRideTypeNormalTaxi = new Animated.Value(1);
        newState.scaleRideTypeElectricTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeLuxuryTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricLuxuryTaxi = new Animated.Value(0.9);
        //VERY IMPORTANT - UPDATE THE FARE
        newState.fareTripSelected = action.payload.fare;
      } else if (
        action.payload.rideType === 'electricEconomy' ||
        action.payload.rideType === 'bikes'
      ) {
        newState.carTypeSelected = action.payload.rideType;
        newState.colorCircleNormalTaxi = '#a2a2a2';
        newState.colorBannerRideTypeNormalTaxi = '#a2a2a2';
        newState.colorCircleElectricCar = '#0D8691';
        newState.colorBannerRideTypeElectricCar = '#000';
        //Comfort
        newState.colorCircleComfortTaxi = '#a2a2a2';
        newState.colorBannerRideTypeComfortTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricComfortCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
        //Luxury
        newState.colorCircleLuxuryTaxi = '#a2a2a2';
        newState.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricLuxuryCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
        //Update the scales
        newState.scaleRideTypeNormalTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricTaxi = new Animated.Value(1);
        newState.scaleRideTypeComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeLuxuryTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricLuxuryTaxi = new Animated.Value(0.9);
        //VERY IMPORTANT - UPDATE THE FARE
        newState.fareTripSelected = action.payload.fare;
      } else if (
        action.payload.rideType === 'comfortNormalRide' ||
        action.payload.rideType === 'carDelivery'
      ) {
        newState.carTypeSelected = action.payload.rideType;
        newState.colorCircleNormalTaxi = '#a2a2a2';
        newState.colorBannerRideTypeNormalTaxi = '#a2a2a2';
        newState.colorCircleElectricCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricCar = '#a2a2a2';
        //Comfort
        newState.colorCircleComfortTaxi = '#0D8691';
        newState.colorBannerRideTypeComfortTaxi = '#000';
        //Electric
        newState.colorCircleElectricComfortCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
        //Luxury
        newState.colorCircleLuxuryTaxi = '#a2a2a2';
        newState.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricLuxuryCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
        //Update the scales
        newState.scaleRideTypeNormalTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeComfortTaxi = new Animated.Value(1);
        newState.scaleRideTypeElectricComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeLuxuryTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricLuxuryTaxi = new Animated.Value(0.9);
        //VERY IMPORTANT - UPDATE THE FARE
        newState.fareTripSelected = action.payload.fare;
      } else if (
        action.payload.rideType === 'comfortElectricRide' ||
        action.payload.rideType === 'vanDelivery'
      ) {
        newState.carTypeSelected = action.payload.rideType;
        newState.colorCircleNormalTaxi = '#a2a2a2';
        newState.colorBannerRideTypeNormalTaxi = '#a2a2a2';
        newState.colorCircleElectricCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricCar = '#a2a2a2';
        //Comfort
        newState.colorCircleComfortTaxi = '#a2a2a2';
        newState.colorBannerRideTypeComfortTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricComfortCar = '#0D8691';
        newState.colorBannerRideTypeElectricComfortCar = '#000';
        //Luxury
        newState.colorCircleLuxuryTaxi = '#a2a2a2';
        newState.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricLuxuryCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
        //Update the scales
        newState.scaleRideTypeNormalTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricComfortTaxi = new Animated.Value(1);
        newState.scaleRideTypeLuxuryTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricLuxuryTaxi = new Animated.Value(0.9);
        //VERY IMPORTANT - UPDATE THE FARE
        newState.fareTripSelected = action.payload.fare;
      } else if (action.payload.rideType === 'luxuryNormalRide') {
        newState.carTypeSelected = action.payload.rideType;
        newState.colorCircleNormalTaxi = '#a2a2a2';
        newState.colorBannerRideTypeNormalTaxi = '#a2a2a2';
        newState.colorCircleElectricCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricCar = '#a2a2a2';
        //Comfort
        newState.colorCircleComfortTaxi = '#a2a2a2';
        newState.colorBannerRideTypeComfortTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricComfortCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
        //Luxury
        newState.colorCircleLuxuryTaxi = '#0D8691';
        newState.colorBannerRideTypeLuxuryTaxi = '#000';
        //Electric
        newState.colorCircleElectricLuxuryCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricLuxuryCar = '#a2a2a2';
        //Update the scales
        newState.scaleRideTypeNormalTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeLuxuryTaxi = new Animated.Value(1);
        newState.scaleRideTypeElectricLuxuryTaxi = new Animated.Value(0.9);
        //VERY IMPORTANT - UPDATE THE FARE
        newState.fareTripSelected = action.payload.fare;
      } else if (action.payload.rideType === 'luxuryElectricRide') {
        newState.carTypeSelected = action.payload.rideType;
        newState.colorCircleNormalTaxi = '#a2a2a2';
        newState.colorBannerRideTypeNormalTaxi = '#a2a2a2';
        newState.colorCircleElectricCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricCar = '#a2a2a2';
        //Comfort
        newState.colorCircleComfortTaxi = '#a2a2a2';
        newState.colorBannerRideTypeComfortTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricComfortCar = '#a2a2a2';
        newState.colorBannerRideTypeElectricComfortCar = '#a2a2a2';
        //Luxury
        newState.colorCircleLuxuryTaxi = '#a2a2a2';
        newState.colorBannerRideTypeLuxuryTaxi = '#a2a2a2';
        //Electric
        newState.colorCircleElectricLuxuryCar = '#0D8691';
        newState.colorBannerRideTypeElectricLuxuryCar = '#000';
        //Update the scales
        newState.scaleRideTypeNormalTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricComfortTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeLuxuryTaxi = new Animated.Value(0.9);
        newState.scaleRideTypeElectricLuxuryTaxi = new Animated.Value(1);
        //VERY IMPORTANT - UPDATE THE FARE
        newState.fareTripSelected = action.payload.fare;
      }

      //Update the payment method
      //Auto select cash if the amount in the wallet is not enough
      if (/wallet/i.test(newState.wallet_state_vars.selectedPayment_method)) {
        if (newState.wallet_state_vars.totalWallet_amount === 0) {
          newState.wallet_state_vars.selectedPayment_method = 'cash';
        } else {
          if (newState.customFareTripSelected !== false) {
            if (
              newState.customFareTripSelected <=
              newState.wallet_state_vars.totalWallet_amount
            ) {
              //Do nothing - leave wallet
            } else {
              newState.wallet_state_vars.selectedPayment_method = 'cash';
            }
          } else {
            if (
              newState.fareTripSelected <=
              newState.wallet_state_vars.totalWallet_amount
            ) {
              //Do nothing - leave wallet
            } else {
              newState.wallet_state_vars.selectedPayment_method = 'cash';
            }
          }
        }
      }

      //...
      return {...state, ...newState};

    case 'UPDATE_CURRENT_LOCATION_METADATA':
      //? Optmimized
      //Update the current location metadata - only if different
      if (newState.userCurrentLocationMetaData.city !== undefined) {
        //Had some old data
        generalPurposeReg = new RegExp(JSON.stringify(action.payload));
        if (
          generalPurposeReg.test(
            JSON.stringify(newState.userCurrentLocationMetaData),
          )
        ) {
          //Same data - don't update state
          return state;
        } //New data -update state
        else {
          newState.userCurrentLocationMetaData = action.payload;
          //...
          return {...state, ...newState};
        }
      } //No data at all - update state
      else {
        newState.userCurrentLocationMetaData = action.payload;
        //...
        return {...state, ...newState};
      }

    case 'UPDATE_NUMBER_OF_PASSENGERS_SELECTED':
      //Update the number of passengers selected
      newState.bottomVitalsFlow.rideOrDeliveryMetadata.numberOfPassengersSelected =
        action.payload.numberOfPassengers; //Number of passengers

      newState.bottomVitalsFlow.rideOrDeliveryMetadata.isAllgoingToTheSamePlace =
        action.payload.isAllgoingToTheSamePlace; //If all going to the same place
      //..
      return {...state, ...newState};

    case 'UPDATE_DESTINATION_DETAILS':
      if (action.payload.passengerIndex === 1) {
        //Passenger 1
        newState.search_passengersDestinations.passenger1Destination =
          action.payload.locationObject;
        newState.search_passenger1DestinationInput =
          action.payload.locationObject.location_name;
      } else if (action.payload.passengerIndex === 2) {
        //Passenger 2
        newState.search_passengersDestinations.passenger2Destination =
          action.payload.locationObject;
        newState.search_passenger2DestinationInput =
          action.payload.locationObject.location_name;
      } else if (action.payload.passengerIndex === 3) {
        //Passenger 3
        newState.search_passengersDestinations.passenger3Destination =
          action.payload.locationObject;
        newState.search_passenger3DestinationInput =
          action.payload.locationObject.location_name;
      } else if (action.payload.passengerIndex === 4) {
        //Passenger 4
        newState.search_passengersDestinations.passenger4Destination =
          action.payload.locationObject;
        newState.search_passenger4DestinationInput =
          action.payload.locationObject.location_name;
      }
      //Clean the seach query string
      newState.search_querySearch = '';

      //...
      return {...state, ...newState};

    case 'UPDATE_CUSTOM_PICKUP_SELECTED_DETAILS':
      if (action.payload.locationObject !== false) {
        //Different pickup location
        //Update the custom pickup selected by the user
        newState.search_pickupLocationInfos.isBeingPickedupFromCurrentLocation = false; //Enable custom pickup
        newState.search_pickupLocationInfos.passenger0Destination =
          action.payload.locationObject; //Update the location details
        newState.search_pickupLocationInfos.search_passenger0DestinationInput =
          action.payload.locationObject.location_name; //Update the textinout value.
      } //About the same pickup location or another predefined value (will be precised by the extraString param)
      else {
        if (action.payload.extraString === 'currentPickupLocation') {
          newState.search_pickupLocationInfos.isBeingPickedupFromCurrentLocation = true; //Disable custom pickup
          newState.search_pickupLocationInfos.passenger0Destination = false; //Reset the location details
          newState.search_pickupLocationInfos.search_passenger0DestinationInput = false; //Reset the textinout value.
        }
      }
      //Clean the seach query string
      newState.search_querySearch = '';
      //...
      return {...state, ...newState};

    case 'UPDATE_DESTINATION_INPUT_VALUES':
      if (action.payload.passengerIndex === 1) {
        //Passenger 1
        newState.search_passenger1DestinationInput = action.payload.queryString;
      } else if (action.payload.passengerIndex === 2) {
        //Passenger 2
        newState.search_passenger2DestinationInput = action.payload.queryString;
      } else if (action.payload.passengerIndex === 3) {
        //Passenger 3
        newState.search_passenger3DestinationInput = action.payload.queryString;
      } else if (action.payload.passengerIndex === 4) {
        //Passenger 4
        newState.search_passenger4DestinationInput = action.payload.queryString;
      }
      //..
      return {...state, ...newState};

    case 'UPDATE_ADDTIONAL_PICKUP_NOTE':
      //New text inside the payload - trimed and greater than 0 already checked - not trimed value for storage!
      newState.additionalNote_inputText = action.payload;
      newState.currentCharStringAdditionalNote = action.payload.length;

      if (action.payload.length === 0) {
        newState.additionalNote_inputText = false;
      }

      //...
      return {...state, ...newState};

    case 'UPDATE_RIDE_TYPES_ON_SCROLL_CATEGORIES':
      //Payload contains the window state object
      if (action.payload.currentScreen < 0) {
        //Defaults to 1
        action.payload.currentScreen = 0;
      } else if (action.payload.currentScreen > 2) {
        //Back to 3
        action.payload.currentScreen = 2;
      }
      //Regularise current screen to array index from 0
      //action.payload.currentScreen -= 1;
      //...
      //Update the screen index and scroll position
      newState.headerRideTypesVars.currentHeaderIndex =
        action.payload.currentScreen;
      newState.headerRideTypesVars.currentScrollOffset =
        action.payload.currentScrollposition;

      //..
      return {...state, ...newState};

    case 'UPDATE_PRICING_STATE_DATA':
      //? Optimized
      if (
        `${JSON.stringify(newState.pricingVariables.carTypesPricingMetada)}` ===
        `${JSON.stringify(action.payload)}`
      ) {
        //Same data
        return state;
      } //New data
      else {
        newState.pricingVariables.didPricingReceivedFromServer = true;
        newState.pricingVariables.carTypesPricingMetada = action.payload;

        //...
        return {...state, ...newState};
      }

    case 'UPDATE_ROUTE_PREVIEW_TO_DESTINATION':
      //? Optimized
      //Update route preview data - only if new
      //Clear the interval persister
      if (newState._TMP_INTERVAL_PERSISTER !== null) {
        clearInterval(newState._TMP_INTERVAL_PERSISTER);
        newState._TMP_INTERVAL_PERSISTER = null;
      }
      //...
      /*if (
        `${JSON.stringify(action.payload)}` ===
        `${newState.previewDestinationData.originDestinationPreviewData}`
      ) {
        //Already updated - do not update state
        return state;
      } //New data - update the state
      else {
        newState.previewDestinationData.originDestinationPreviewData =
          action.payload;
        return {...state, ...newState};
      }*/
      newState.previewDestinationData.originDestinationPreviewData =
        action.payload;
      return {...state, ...newState};

    case 'UPDATE_DELIVERY_PACKAGE_SIZE':
      //Update the delivery's package size on user select
      //Payload contains the package size
      newState.bottomVitalsFlow.rideOrDeliveryMetadata.selectedPackageSize =
        action.payload;

      //...
      return {...state, ...newState};

    case 'UPDATE_RIDER_OR_PACKAGE_POSSESSER_SWITCHER':
      if (action.payload.action === 'assign') {
        if (action.payload.riderString.toLowerCase().trim() === 'me') {
          //Account owner - set rider and reset custom phone no
          newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.whoIsRiding = action.payload.riderString
            .toLowerCase()
            .trim();
          newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.riderPhoneNumber = false;
        } //Someone else is riding - update
        else {
          newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.whoIsRiding = action.payload.riderString
            .toLowerCase()
            .trim();
        }
      } else if (action.payload.action === 'doneCustomizing') {
        //- close
        newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.openRiderSwitcher = false;
        if (
          newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars
            .riderPhoneNumber !== false &&
          newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.riderPhoneNumber.trim()
            .length >= 9
        ) {
          //Acceptable - but will need a more advanced check
          newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.riderPhoneNumber = newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.riderPhoneNumber.trim();
        } //Wrong number switch back to account holder
        else {
          newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.whoIsRiding =
            'me';
          newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.riderPhoneNumber = false;
        }
      } else if (action.payload.action === 'openRiderSwitcher') {
        newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.openRiderSwitcher = true;
      } else if (action.payload.action === 'updateCustomPhonenumber') {
        //Replace all unwanted characters by empty
        newState.bottomVitalsFlow.riderOrPackagePosseserSwitchingVars.riderPhoneNumber = action.payload.customPhoneNo.trim();
      }

      //...
      return {...state, ...newState};

    case 'SHOW_COUNTRY_FILTER_HEADER':
      //receive header state : true (show) or false (hide)
      newState.isFilterCountryShown = action.payload;

      //..
      return {...state, ...newState};

    case 'RENDER_COUNTRY_PHONE_CODE_SEARCHER':
      //receive render state : true (show) or false (hide)
      newState.renderCountryCodeSeacher = action.payload;

      //...
      return {...state, ...newState};

    case 'UPDATE_COUNTRY_CODE_FORMAT_AFTER_SELECT':
      //Update phone placeholder, country code and basic number length
      newState.phoneNumberPlaceholder = action.payload.phoneNumberPlaceholder;
      newState.countryPhoneCode = action.payload.countryPhoneCode;
      newState.dynamicMaxLength = action.payload.dynamicMaxLength;

      //...
      return {...state, ...newState};

    case 'UPDATE_DIAL_DATA_OR_QUERY_TYPED':
      if (action.payload.action === 'updateQueryTyped') {
        //Update query typed
        newState.typedCountrySearchQuery =
          action.payload.typedCountrySearchQuery;
      } else if (action.payload.action === 'updateDialData') {
        //Update dial data filtered
        newState.countriesDialDataState = action.payload.countriesDialDataState;
      } else if (action.payload.action === 'resetAll') {
        //Reset dialdata and query typed
        newState.countriesDialDataState =
          action.payload.countriesDialDataStateInvariant;
        newState.typedCountrySearchQuery = '';
      } else if (action.payload.action === 'updateTypedNumber') {
        newState.errorReceiverPhoneNumberShow = false; //Hide corresponding error text
        newState.phoneNumberEntered = action.payload.phoneNumberEntered;
      }

      //..
      return {...state, ...newState};

    case 'UPDATE_RECIVER_NAME_ON_TYPE':
      //Auto replace illegal chars by empy
      newState.errorReceiverNameShow = false; //Hide corresponding error text
      action.payload = action.payload.replace(/[^a-zA-Z \-]/g, '');
      newState.bottomVitalsFlow.rideOrDeliveryMetadata.receiverName =
        action.payload;
      //..
      return {...state, ...newState};

    case 'VALIDATE_RECEIVER_INFOS_FOR_DELIVERY':
      //Validate or return error on error,...auto move next if correct
      //Check the name (3 chars min)
      if (
        newState.bottomVitalsFlow.rideOrDeliveryMetadata.receiverName !==
          false &&
        newState.bottomVitalsFlow.rideOrDeliveryMetadata.receiverName.trim()
          .length >= 3
      ) {
        newState.errorReceiverNameShow = false; //Hide corresponding error text
        newState.bottomVitalsFlow.rideOrDeliveryMetadata.receiverName = newState.bottomVitalsFlow.rideOrDeliveryMetadata.receiverName.trim();
        //Check the phone number validity
        phoneNumberModuleTmp = parsePhoneNumber(
          newState.countryPhoneCode +
            newState.phoneNumberEntered.replace(/ /g, '').replace(/^0/, ''),
          newState.countryCodeSelected.toUpperCase(),
        );
        if (phoneNumberModuleTmp && phoneNumberModuleTmp.isValid()) {
          if (
            /^0/.test(newState.phoneNumberEntered.replace(/ /g, '')) &&
            newState.phoneNumberEntered.replace(/ /g, '').trim().length === 10
          ) {
            //Most african countries
            //Valid
            newState.errorReceiverPhoneNumberShow = false; //Hide corresponding error text
            Animated.timing(newState.bottomVitalsFlow.bottomVitalChildHeight, {
              toValue: 400,
              duration: 400,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: false,
            }).start();
            newState.search_showSearchNodeMain = true; //Activate
            newState.bottomVitalsFlow.currentStep = 'selectDestination'; //Select destination
            newState.isSearchModuleOn = true; //Enable search module
          } else if (
            /^0/.test(newState.phoneNumberEntered.replace(/ /g, '')) ===
              false &&
            newState.phoneNumberEntered.replace(/ /g, '').trim().length === 9
          ) {
            //Valid
            newState.errorReceiverPhoneNumberShow = false; //Hide corresponding error text
            //Move forward
            Animated.timing(newState.bottomVitalsFlow.bottomVitalChildHeight, {
              toValue: 400,
              duration: 400,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: false,
            }).start();
            newState.search_showSearchNodeMain = true; //Activate
            newState.bottomVitalsFlow.currentStep = 'selectDestination'; //Select destination
            newState.isSearchModuleOn = true; //Enable search module
          } //Invalid
          else {
            newState.errorReceiverPhoneNumberShow = true;
            newState.errorReceiverPhoneNumberText = 'The number looks wrong';
          }
        } //Invalid phone
        else {
          newState.errorReceiverPhoneNumberShow = true;
          if (newState.phoneNumberEntered.trim().length === 0) {
            //Empty
            newState.errorReceiverPhoneNumberText = "Shouldn't be empty";
          } //Just wrong
          else {
            newState.errorReceiverPhoneNumberText = 'The number looks wrong';
          }
        }
      } //Error invalid name format - too short
      else {
        newState.errorReceiverNameText =
          'The name should be at least 3 letters long';
        newState.errorReceiverNameShow = true;
      }

      //...
      return {...state, ...newState};

    case 'VALIDATE_GENERIC_PHONE_NUMBER':
      //Check the phone number validity
      phoneNumberModuleTmp = parsePhoneNumber(
        newState.countryPhoneCode +
          newState.phoneNumberEntered.replace(/ /g, '').replace(/^0/, ''),
        newState.countryCodeSelected.toUpperCase(),
      );
      if (phoneNumberModuleTmp && phoneNumberModuleTmp.isValid()) {
        if (
          /^0/.test(newState.phoneNumberEntered.replace(/ /g, '')) &&
          newState.phoneNumberEntered.replace(/ /g, '').trim().length === 10
        ) {
          //Most african countries
          //Valid
          newState.errorReceiverPhoneNumberShow = false; //Hide corresponding error text
          newState.isPhoneNumberValid = true; //MARK phone number as valid - try to reset it later
          newState.finalPhoneNumber =
            newState.countryPhoneCode +
            newState.phoneNumberEntered.replace(/ /g, '').replace(/^0/, ''); //Save the final phone number
        } else if (
          /^0/.test(newState.phoneNumberEntered.replace(/ /g, '')) === false &&
          newState.phoneNumberEntered.replace(/ /g, '').trim().length === 9
        ) {
          //Valid
          newState.errorReceiverPhoneNumberShow = false; //Hide corresponding error text
          newState.isPhoneNumberValid = true; //MARK phone number as valid - try to reset it later
          newState.finalPhoneNumber =
            newState.countryPhoneCode +
            newState.phoneNumberEntered.replace(/ /g, '').replace(/^0/, ''); //Save the final phone number
        } //Invalid
        else {
          newState.errorReceiverPhoneNumberShow = true;
          newState.errorReceiverPhoneNumberText = 'The number looks wrong';
        }
      } //Invalid phone
      else {
        newState.errorReceiverPhoneNumberShow = true;
        if (newState.phoneNumberEntered.trim().length === 0) {
          //Empty
          newState.errorReceiverPhoneNumberText = "Shouldn't be empty";
        } //Just wrong
        else {
          newState.errorReceiverPhoneNumberText = 'The number looks wrong';
        }
      }

      //...
      return {...state, ...newState};

    case 'RESET_GENERIC_PHONE_NUMBER_INPUT':
      //Generic phone number input variable
      newState.countriesDialDataState = null; //Data for all the considered countries - default: complete set, can be filtereed but not altered! - to be initialized in the constructor of the module
      newState.renderCountryCodeSeacher = false; //Whether to show or not the list of country code to select one
      newState.phoneNumberEntered = ''; //Phone number entered by the user
      newState.isFilterCountryShown = false; //Whether or not to show the country search filter on user action - default: false
      newState.typedCountrySearchQuery = ''; //Query typed to search a specific country
      newState.finalPhoneNumber = false; //Store the final generated phone number
      //Generic phone number input variable
      newState.isPhoneNumberValid = false; //TO know if the phone number is valid or not.

      //..
      return {...state, ...newState};

    case 'UPDATE_ERROR_MESSAGES_STATE_INPUT_REC_DELIVERY':
      if (action.payload.kidName === 'name') {
        //Name error text
        newState.errorReceiverNameShow = action.payload.state;
      } else if (action.payload.kidName === 'number') {
        //Number error text
        newState.errorReceiverPhoneNumberShow = action.payload.state;
      }

      //...
      return {...state, ...newState};

    case 'UPDATE_CLOSEST_DRIVERS_LIST':
      //? Optimized
      //Update data only if different
      if (
        `${JSON.stringify(newState._CLOSEST_DRIVERS_DATA)}` ==
        `${JSON.stringify(action.payload)}`
      ) {
        //Same data - don't update
        return state;
      } //Different data - update state
      else {
        newState._CLOSEST_DRIVERS_DATA = action.payload;
        //...
        return {...state, ...newState};
      }

    case 'UPDATE_ERROR_BOTTOM_VITALS':
      newState.bottomVitalsFlow._BOOKING_REQUESTED = 'error';
      newState._error_booking_requested = action.payload;

      //...
      return {...state, ...newState};

    case 'UPDATE_GENERAL_ERROR_MODAL':
      //? Optimized
      //Update only if new state
      if (
        newState.generalErrorModal_vars.showErrorGeneralModal !==
          action.payload.activeStatus ||
        newState.generalErrorModal_vars.generalErrorModalType !==
          action.payload.errorMessage ||
        newState.generalErrorModal_vars.network_type !==
          action.payload.network_type
      ) {
        newState.generalErrorModal_vars.showErrorGeneralModal =
          action.payload.activeStatus;
        newState.generalErrorModal_vars.generalErrorModalType =
          action.payload.errorMessage;
        newState.generalErrorModal_vars.network_type = /any/i.test(
          action.payload.network_type,
        )
          ? newState.generalErrorModal_vars.network_type
          : action.payload.network_type; //Only update the network type of not 'any' value provided (dummy value)

        //...
        return {...state, ...newState};
      } //Same
      else {
        return state;
      }

    case 'UPDATE_USER_GENDER_STATE':
      newState.gender_user = action.payload;
      newState.generalErrorModal_vars.showErrorGeneralModal = false; //Close the modal selecter -reset
      newState.generalErrorModal_vars.generalErrorModalType = false; //Close the modal selecter -reset
      //..
      return {...state, ...newState};

    case 'UPDATE_TYPE_RIDESHOWN_YOURRIDES_SCREEN':
      newState.shownRides_types = action.payload;

      //...
      return {...state, ...newState};

    case 'UPDATERIDES_HISTORY_YOURRIDES_TAB':
      newState.rides_history_details_data.rides_history_data = action.payload;

      //...
      return {...state, ...newState};

    case 'UPDATE_TARGETED_REQUEST_YOURRIDES_HISTORY':
      newState.rides_history_details_data.targetedRequestSelected.request_fp =
        action.payload;

      //...
      return {...state, ...newState};

    case 'UPDATE_RATING_DETAILS_DURINGDROPOFF_PROCESS':
      if (/updateRating/i.test(action.payload.action)) {
        //Update the rating
        newState.dropoff_rating_metadata.rating_score = action.payload.data;
      } else if (/updateCompliment/i.test(action.payload.action)) {
        //Update the compliment list
        //Auto toggle compliment array depending on whether the compliment was already selected or not
        if (
          newState.dropoff_rating_metadata.compliment_array.includes(
            action.payload.data,
          )
        ) {
          //Was already selected - unselect
          newState.dropoff_rating_metadata.compliment_array.splice(
            newState.dropoff_rating_metadata.compliment_array.indexOf(
              action.payload.data,
            ),
            1,
          );
          //...
        } //Wasn't selected before - add
        else {
          newState.dropoff_rating_metadata.compliment_array.push(
            action.payload.data,
          );
        }
      }
      //...
      return {...state, ...newState};

    case 'UPDATE_DROPFFDATA_FORDRIVER_RATING':
      //Update only if necessary
      if (Object.keys(newState.generalTRIP_details_driverDetails).length > 0) {
        //Already had something
        if (
          /riderDropoffConfirmation_left/i.test(
            newState.generalTRIP_details_driverDetails.request_status,
          ) !== true
        ) {
          //Update
          newState.generalTRIP_details_driverDetails = action.payload;
          return {...state, ...newState};
        } //Np change
        else {
          return state;
        }
      } //Set the new variables - update state
      else {
        newState.generalTRIP_details_driverDetails = action.payload;
        return {...state, ...newState};
      }

    case 'UPDATE_TOTAL_WALLET_AMOUNT':
      //Update the total wallet amount only when necessary
      let tmpSizeLocal =
        newState.wallet_state_vars.transactions_details !== undefined &&
        newState.wallet_state_vars.transactions_details !== null
          ? newState.wallet_state_vars.transactions_details.length
          : 0;
      let tmpSizeUpdate =
        action.payload.transactions_data !== undefined &&
        action.payload.transactions_data !== null
          ? action.payload.transactions_data.length
          : 0;

      if (
        newState.wallet_state_vars.totalWallet_amount !==
          action.payload.total ||
        tmpSizeLocal !== tmpSizeUpdate
      ) {
        //New values
        newState.wallet_state_vars.totalWallet_amount = action.payload.total;
        newState.wallet_state_vars.wallet_state = action.payload.wallet_state;
        newState.wallet_state_vars.transactions_details =
          action.payload.transactions_data !== undefined &&
          action.payload.transactions_data !== null
            ? action.payload.transactions_data
            : [];
        //Sort
        if (
          newState.wallet_state_vars.transactions_details !== undefined &&
          newState.wallet_state_vars.transactions_details !== null
        ) {
          newState.wallet_state_vars.transactions_details = newState.wallet_state_vars.transactions_details.sort(
            (a, b) =>
              a.timestamp > b.timestamp
                ? -1
                : b.timestamp > a.timestamp
                ? 1
                : 0,
          );
        }
        return {...state, ...newState};
      } //Same values
      else {
        return state;
      }

    case 'UPDATE_PREFERRED_PAYMENT_METHOD':
      //Update preferred payment method
      newState.wallet_state_vars.selectedPayment_method = action.payload;

      //...
      return {...state, ...newState};

    case 'UPDATE_STATE_OF_KEYBOARD_GLOBALLY':
      if (action.payload !== newState.isKeyboardShown) {
        //New state - update
        newState.isKeyboardShown = action.payload;
        return {...state, ...newState};
      } //No state change
      else {
        return state;
      }

    case 'UPDATE_USER_DETAILS_AFTER_LOGINSIGNUP':
      newState.user_fingerprint = action.payload.user_fp;
      newState.gender_user = action.payload.gender;
      newState.username = action.payload.name;
      newState.surname_user = action.payload.surname;
      newState.user_email = action.payload.email;
      newState.phone_user = action.payload.phone_number;
      newState.user_profile_pic = action.payload.profile_picture;
      newState.pushnotif_token = action.payload.pushnotif_token;

      return {...state, ...newState};

    default:
      return state;
  }
};

export default combineReducers({
  App: HomeReducer,
});
