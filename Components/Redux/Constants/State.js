/* eslint-disable prettier/prettier */
import React from 'react';
import SOCKET_CORE from '../../Helpers/managerNode';
import {Animated} from 'react-native';
import {Dimensions} from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
//Default no GPRS background image
const backgroundVirgin = require('../../../Media_assets/Images/background.jpg');
//Images res
const packageIco = require('../../../Media_assets/Images/box_delivery.png');
const carChooseIco = require('../../../Media_assets/Images/car_selection_img.png');
const taxiRankIco = require('../../../Media_assets/Images/taxi-stop-sign.png');
//Car on MAP
const carIcon = require('../../../Media_assets/Images/cargreentop100.png');
const carIcon_black = require('../../../Media_assets/Images/caradvanced_black.png');
//...
const privateLocationIco = require('../../../Media_assets/Images/home.png');
const airportLocationIco = require('../../../Media_assets/Images/flight.png');
const routingIco = require('../../../Media_assets/Images/route.png');
//Economy
const carImageNormalRide = require('../../../Media_assets/Images/normaltaxieconomy.jpg');
const carIconElectricRode = require('../../../Media_assets/Images/electricEconomy.jpg');
//Comfort
const comfortrideNormal = require('../../../Media_assets/Images/comfortrideNormal_e.jpg');
const comfortrideElectric = require('../../../Media_assets/Images/comfortrideElectric_d.jpg');
//Luxury
const luxuryRideNormal = require('../../../Media_assets/Images/luxuryRideNormal_d.jpg');
const luxuryRideElectric = require('../../../Media_assets/Images/luxuryRideElectric.jpg');
//DELIVERY
//Standard
//Ebikes
const bikesdeliveryElectric = require('../../../Media_assets/Images/bikesdeliveryElectric.jpg');
//Normal bikes
const bikesdeliveryNormal = require('../../../Media_assets/Images/bikesdeliveryNormal_d.jpg');
//Large capacity
//Car
const cardeliveryNormal = carImageNormalRide;
//Mini van
const vandeliveryNormal = require('../../../Media_assets/Images/vandeliveryNormal_c.jpg');
//COMPLIMENTS IMAGES
const cleanAndTidy = require('../../../Media_assets/Images/Compliments/spray.png');
const excellentService = require('../../../Media_assets/Images/Compliments/excellence.png');
const greatMusic = require('../../../Media_assets/Images/Compliments/music-note.png');
const greatNavigation = require('../../../Media_assets/Images/Compliments/navigation.png');
const greatConversation = require('../../../Media_assets/Images/Compliments/chat.png');

const STATE = {
  _TOP_STACK_NAVIGATION: false, //TOP STACK NAVIGATION of the all, save on the entry screen
  //PERSISTANT INTERVAL VARIABLES
  //Will contain temporary variables that will be responsible for perisisting requests when the desired answer is
  //Not received yet.
  _TMP_INTERVAL_PERSISTER: null, //can be a setINterval or timeout - default: null
  _TMP_INTERVAL_PERSISTER_TIME: 2000, //THe frequency of repetition - default: 2s
  //Interval persister for updating closest drivers on map
  _TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS: null, //To update the closest drivers on the map
  _TMP_INTERVAL_PERSISTER_TIME_CLOSEST_DRIVERS: 3000,
  _CLOSEST_DRIVERS_DATA: null, //Will contain the array of all the closest drivers
  //Interval persister for updating requests data
  _TMP_TRIP_INTERVAL_PERSISTER: null, //The interval for updating rides related data
  _TMP_TRIP_INTERVAL_PERSISTER_TIME: 3000, //THe frequency of repetition - default:3s

  _MAIN_PARENT: null, //Main parent of the whole screen

  _NORMAL_MAP_ZOOM_LEVEL: 13.5, //THe normal zoom level of the map

  //ASSETS
  windowWidth: windowWidth,
  windowHeight: windowHeight,
  backgroundVirgin: backgroundVirgin,
  //On map assets
  carIcon: carIcon,
  carIcon_black: carIcon_black,
  //Compliments
  cleanAndTidy: cleanAndTidy,
  excellentService: excellentService,
  greatMusic: greatMusic,
  greatNavigation: greatNavigation,
  greatConversation: greatConversation,
  //...
  packageIco: packageIco,
  carChooseIco: carChooseIco,
  taxiRankIco: taxiRankIco,
  privateLocationIco: privateLocationIco,
  airportLocationIco: airportLocationIco,
  carImageNormalRide: carImageNormalRide,
  carIconElectricRode: carIconElectricRode,
  routingIco: routingIco,
  //Comfort
  comfortrideNormal: comfortrideNormal,
  comfortrideElectric: comfortrideElectric,
  //Luxury
  luxuryRideNormal: luxuryRideNormal,
  luxuryRideElectric: luxuryRideElectric,
  //Delivery
  bikesdeliveryElectric: bikesdeliveryElectric,
  bikesdeliveryNormal: bikesdeliveryNormal,
  cardeliveryNormal: cardeliveryNormal,
  vandeliveryNormal: vandeliveryNormal,
  //...
  user_fingerprint: null, //User fingerprint - default: null

  pushnotif_token: false, //Notification push notification - default: false
  userCurrentLocationMetaData: {}, //Metadata of the user's current location - directly geocoded and shallowly processed
  socket: SOCKET_CORE, //MAIN SOCKET CONNECTOR
  CONSIDER: true, //If it should request for data again;
  _IS_MAP_INITIALIZED: false, //Responsible for determining if the map is ready for initial animation
  intervalRouteTest: null,
  intervalProgressLoop: false, //Will contain the temporary loop for real-time route traking, if inRouteToPickup, inRouteToDropOff and tracking.
  latitude: 0,
  longitude: 0,
  shape: null,
  //shapeFirstChamber: null, //Hold the full shape of the route for drawing progressively in this.state.shape
  route: null, //Will manage the animation of the route to the passenger
  routeCoordsPickup: null, //Will hold the coordinates of the route to the passenger for general purpose usage
  routeCoordsDestination: null, //Will hold the coordinates of the route to the passenger's destination for general purpose usage
  routeDestination: null, //Will manage the animation of the route to the destination
  shapeDestination: null, //Will manage the shape of the route to the destination
  actPoint: null, //Will manage the animation of the driver's car to the destination
  actPointDestination: null, //Will manage the animation of the driver's car to the destination
  isRideInProgress: false, //Responsible for the knowledge of whether the ride is in progress or not
  lastDriverCoords: null, //Will hold the last driver's trip during a trip tracking (to passenger/to destination)
  lastDriverBearing: 0, //Will hold the last car's bearing angle during a trip tracking (to passenger/to destination)
  actPointToMinusOne: false, //Will be there to skip the first frame of the driver's car representation in the map during a trip tracking
  carIconRelativeSize: 0.25, //Initial icon size of any car instances on the map
  isInRouteToDestination: false, //Responsible for knowledge of whether to duo (passenger+driver) are heading to destination
  destinationPoint: null, //Will hold the coordinates to the passenger's destination location.
  pickupPoint: null, //Will hodl the coordinations to the passenger's pickup locatiom.
  request_status: null, //To know the status of the request: pending, in route to pickup, in route to drop off or completed
  pickupLocation_metadata: {pickupLocation_name: null}, //Hold all the metadata related to the pickup location, -- pickupLocation_name: null, //Hold the name of the pickup location.
  destinationLocation_metadata: {}, //Hold all the data on the destination location
  generalTRIP_details_driverDetails: {}, //WILL HOLD THE GENERAL TRIP DETAILS AND DRIVER DETAILS - Ref. to the server doc for more - ONLY RELEVANT TO USE WHEN THE TRIP HAS BEEN ACCEPTED BY A DRIVER already! - ALWAYS clean up after usage.
  initializedScenario: null, //To know which scenario has been initialized for animation
  _MAIN_LOCATION_WATCHER: null, //To hold the location watching of the GPRS.
  //ANIMATION VARS
  //1. LOADER
  loaderPosition: new Animated.Value(0), //For animation loader
  loaderBasicWidth: new Animated.Value(1), //First with for the loader - scale
  showLocationSearch_loader: false,
  loaderColor: '#0D8691', //Color of the line loader
  initialHello: false, //Will hold the first "Hello" message that appear when the app is opened
  initialHelloAnimationParams: {
    top: new Animated.Value(10), //Hello 1
    opacity: new Animated.Value(0), //Hello 1
    top2: new Animated.Value(10), //Hello 2
    opacity2: new Animated.Value(0), //Hello 2
  }, //Contains the initial paramerters for the intial hello
  hello2Text: "How's your day?", //Dynamic hello text
  //PROCESS FLOW VARS
  //Very useful while finding out the correct process step and the render to put forth for the user
  //1. Bottom vitals
  bottomVitalsFlow: {
    //Booking requested vars
    _BOOKING_REQUESTED: false, //To know whether the current booking had been requested or not, will determine how long "gettingRideProcessScreen" will load
    _error_booking_requested: false, //The error message to show to the user after a request has failed to succeed.
    //MAP USABILITY VARIABLES
    isUserLocationCentered: true, //To know whether or not the map is centered to the current using location (for conditional center button displaying) - default : true (don't show center button, false - show)
    centerLocationButtonScale: new Animated.Value(0), //The scale of the button for centering the map on the active user location (X and Y) - default: 0
    tmpVisibleBounds: false, //The temporary visible bounds of the user's map to compare with when trying to determine whether to display the recenter button or not- default: false
    zoomEnabled: false, //Whether or not the map can be zoomed - default: false
    scrollEnabled: false, //Whether or not the map can be scrolled - default: false
    rotateEnabled: false, //Whether or not the map can be rotated - default: false
    pitchEnabled: false, //Whether or not the map can be pitched - default: false
    processCanMapBeMoved: [
      'mainView',
      'selectRideOrDelivery',
      'identifyLocation',
      'selectConnectMeOrUs',
      'selectNoOfPassengers',
    ], //Processes in which the map can be zoomed, scrolled, rotated or picthed
    //-----------
    canGoBack: false, //Whether or not to allow back action during a process flow
    processCanGoBack: [
      'selectRideOrDelivery',
      'identifyLocation',
      'selectNoOfPassengers',
      'addMoreTripDetails',
      'selectConnectMeOrUs',
      'selectCarTypeAndPaymentMethod',
      'confirmFareAmountORCustomize',
      'selectRideOrDelivery',
      'inputReceiverInformations',
      'addMoreDetails',
    ], //Processes on which the go back button is applicable (processes from which the user can go back!)
    canRecenterGPRS: true, //Whether or not to allow the user to press on the GPRS button to recenter - default: true
    processRecenterGPRS: [
      'mainView',
      'selectRideOrDelivery',
      'identifyLocation',
      'selectNoOfPassengers',
      'selectConnectMeOrUs',
    ], //Processes on which the GPRS button is applicable
    processLoaderActive: [
      'mainView',
      'identifyLocation',
      'addMoreTripDetails',
      'selectCarTypeAndPaymentMethod',
      'gettingRideProcessScreen',
    ], //Processes on which the system will auto launch the search loader
    //---
    currentStep: 'mainView', //Current flow step: mainView(when no actions had been taken), noInternet, selectRideOrDelivery, identifyLocation, selectNoOfPassengers, etc... ADD AS THE DEVELOPMENT PROGRESSES
    flowParent: 'RIDE', //Flow under which the steps are ordered : RIDE OR DELIVERY - default: RIDE
    rideBookingFlow: [
      'mainView',
      'selectRideOrDelivery',
      'identifyLocation',
      'selectConnectMeOrUs',
      'selectNoOfPassengers',
      'selectDestination',
      'addMoreTripDetails',
      'selectCarTypeAndPaymentMethod',
      'confirmFareAmountORCustomize',
      'gettingRideProcessScreen',
      'errorRequestingProcessScreen',
    ], //Flow order for the navigation - ride
    deliveryBookingFlow: [
      'mainView',
      'selectRideOrDelivery',
      'inputReceiverInformations',
      'selectDestination',
      'addMoreTripDetails',
      'selectPackageSize',
      'selectCarTypeAndPaymentMethod',
      'confirmFareAmountORCustomize',
      'gettingRideProcessScreen',
      'errorRequestingProcessScreen',
    ], //Flow order for the navigation - ride
    processFlowSpecificColors: {
      mainView: '#0D8691',
      selectRideOrDelivery: '#000',
      identifyLocation: '#000',
      selectNoOfPassengers: '#000',
      selectDestination: '#0D8691',
      addMoreTripDetails: '#000',
      selectConnectMeOrUs: '#096ED4',
      selectCarTypeAndPaymentMethod: '#000',
      confirmFareAmountORCustomize: '#000',
      gettingRideProcessScreen: '#0D8691',
      inputReceiverInformations: '#0D8691',
      addMoreDetails: '#000',
      selectCarTypeAndPaymentMethodDelivery: '#000',
      gettingDeliveryProcessScreen: '#0D8691',
    }, //The colors of the line loader specific to those processes
    //Fares of each category of cars - default: static prices, but will be network updated based on the user pickup and destination
    basicCarTypesTripFares: {
      normalTaxiEconomy: 14, //Normal taxis
      normalTaxiEconomyDelivery: 30, //Norma taxis - deliveries
      electricEconomy: 12, //Electric taxis
      electricEconomyDelivery: 25, //Electric taxis - deliveries
    },
    bottomVitalChildHeight: new Animated.Value(150), //Height of the bottom vital component, default 150 - for booking 250
    //Initial container Hello animations variables
    mainHelloContentPosition: new Animated.Value(0), //Top offset position of the hello content container - default: 0 -> max: 20
    mainHelloContentOpacity: new Animated.Value(1), //Opacity of the hello content container - default: 1
    //Common process flow animation variables
    //These variables are common to all the process flows
    genericContainerPosition: new Animated.Value(20), //Top offset position of the generic flow container - default: 0 -> max: 20
    genericContainerOpacity: new Animated.Value(0), //Opacity of the generic flow container - default: 0 -> max: 20
    //...
    rideOrDeliveryMetadata: {
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
    }, //Current metadata for the booking process: for RIDE or DELIVERIES

    //Generic loader screen after ride or delivery booking animation variables
    genericLoaderScreenOpacity: new Animated.Value(0), //Basic opacity of the screen showing "getting a taxi for your or delivery" after booking opacity - default: 0 -> 0.6
    //ConnectMe or Us data
    connectType: 'ConnectUs', //The connect type - default : ConnectUs, possible values: ConnectMe, ConnectUs

    //Rider or package possesser switching variables
    riderOrPackagePosseserSwitchingVars: {
      whoIsRiding: 'me', //The person who's riding with the current ride - default: me (account owner) (can be: me, someoneelse)
      riderPhoneNumber: false, //The custom rider's phone number - default: false (not set, account owner's phone)
      openRiderSwitcher: false, //Whether the rider switcher is opened or not - default: false
      switcherWindowOpacity: new Animated.Value(0), //Opacity of the switcher window - default: 0
      swictherWindowPosition: new Animated.Value(450), //Top offset position of the switcher window - default: 450
    },
  },
  //GPRS RESOLUTION
  gprsGlobals: {
    didAskForGprs: false, //If the user was ask once to activate the gprs
    hasGPRSPermissions: true, //To know wheter we have the GPRS permissions or not (true/false) - Default to true
  },
  //SEARCH module
  isSearchModuleOn: false, //To know whether or not the search module had been launched and whether to show it or not
  //SELECT CAR TYPE & PAYMENT METHOD
  scrollViewSelectRideRef: React.createRef(), //Reference to the scrollview of the select ride type screen
  carTypeSelected: false, //To know what car type the user had selected - default: normalTaxiEconomy
  fareTripSelected: 12, //Associated fare for the trip - default: N$ 12 - Should be network updated
  customFareTripSelected: false, //Custom associated fare for the trip - default: false - Should be update when insert a custom fare.
  //STANDARD Header select rides types: Economy, Comfort, Luxury
  headerRideTypesVars: {
    headerSelectRideTypes: ['Economy', 'Comfort', 'Luxury'],
    headerSelectRideTypesDelivery: ['Standard', 'Large capacity'],
    currentHeaderIndex: 0, //Default 0 - Economy
    currentScrollOffset: 0, //The current scroll position - so that it can be restored
  }, //The header titles of different car types
  //CAR TYPES METADATA
  //All the categories of cars, prices, and availability - default - [] - error - [{response:'error'}]
  wasRideChoosedByDefault: false, //To know whether or not a car was automatically choosed
  //Pricing variables
  pricingVariables: {
    didPricingReceivedFromServer: false, //Whether or not the pricing infos were received from the pricing service
    carTypesPricingMetada: [], //The pricing metadata received from the server- default [], empty array
  },

  //DESTINATION PREVIEW
  //Previewing.the way to destination after selecting the locations
  previewDestinationData: {
    originDestinationPreviewData: false, //Data for the preview to the destination - default: false
    destinationAnchor: {x: 0, y: 0}, //Anchor for any destination MarkerView
    originAnchor: {x: 0, y: 0}, //Anchor for any origin MarkerView
  },

  //ECONOMY
  //NORMAL TAXI - DEFAULT
  colorCircleNormalTaxi: '#a2a2a2', //The color of the circle in which the car icon lies for a normal taxi type
  colorBannerRideTypeNormalTaxi: '#a2a2a2', //The background-color of the banner in which the taxi type lies for a normal taxi type
  scaleRideTypeNormalTaxi: new Animated.Value(0.9), //Scale X and Y for the animation of the taxi type when selected
  //ELECTRIC CAR
  colorCircleElectricCar: '#a2a2a2', //The color of the circle in which the car icon lies for a electric taxi type
  colorBannerRideTypeElectricCar: '#a2a2a2', //The background-color of the banner in which the taxi type lies for a electric taxi type
  scaleRideTypeElectricTaxi: new Animated.Value(0.9), //Scale X and Y for the animation of the taxi type when selected
  //COMFORT
  //NORMAL TAXI
  colorCircleComfortTaxi: '#a2a2a2', //The color of the circle in which the car icon lies for a normal taxi type
  colorBannerRideTypeComfortTaxi: '#a2a2a2', //The background-color of the banner in which the taxi type lies for a normal taxi type
  scaleRideTypeComfortTaxi: new Animated.Value(0.9), //Scale X and Y for the animation of the taxi type when selected
  //ELECTRIC CAR
  colorCircleElectricComfortCar: '#a2a2a2', //The color of the circle in which the car icon lies for a electric taxi type
  colorBannerRideTypeElectricComfortCar: '#a2a2a2', //The background-color of the banner in which the taxi type lies for a electric taxi type
  scaleRideTypeElectricComfortTaxi: new Animated.Value(0.9), //Scale X and Y for the animation of the taxi type when selected
  //LUXURY
  //NORMAL TAXI
  colorCircleLuxuryTaxi: '#a2a2a2', //The color of the circle in which the car icon lies for a normal taxi type
  colorBannerRideTypeLuxuryTaxi: '#a2a2a2', //The background-color of the banner in which the taxi type lies for a normal taxi type
  scaleRideTypeLuxuryTaxi: new Animated.Value(0.9), //Scale X and Y for the animation of the taxi type when selected
  //ELECTRIC CAR
  colorCircleElectricLuxuryCar: '#a2a2a2', //The color of the circle in which the car icon lies for a electric taxi type
  colorBannerRideTypeElectricLuxuryCar: '#a2a2a2', //The background-color of the banner in which the taxi type lies for a electric taxi type
  scaleRideTypeElectricLuxuryTaxi: new Animated.Value(0.9), //Scale X and Y for the animation of the taxi type when selected

  //SCHEDULE BOTTOM VITAL VARS
  isSelectTripScheduleOn: false, //To know whether to render the scheduler on bottom vitals or not - default: false
  //...
  titleSelectRideOpacity: new Animated.Value(1), //Opacity of the header when select ride is active - default: 0
  titleSelectRidePosition: new Animated.Value(0), //Left offset position of the header when select ride is active - default : 10
  selectRideContentOpacity: new Animated.Value(1), //Opacity of the content holder when select ride is active - default 0
  selectRideContentPosition: new Animated.Value(0), //Top offset position of the content holder when select ride is active - default 20
  //---
  titleSchedulerSelectRideOpacity: new Animated.Value(0), //Opacity of the header when schedule ride is active - default: 0
  titleSchedulerSelectRidePostion: new Animated.Value(10), //Left offset position of the header when schedule is active - default : 10
  scheduleRideContentOpacity: new Animated.Value(0), //Opacity of the content holder when schedule ride is active - default 0
  scheduleRideContentPosition: new Animated.Value(20), //Top offset position of the content holder when schedule ride is active - default 20
  //..
  scheduledScenarioContext: 'now', //To know which schedule context is selected: Now, today or tomorrow - default: now
  scheduledScenarioContextHeader: 'now', //To know which schedule context is selected: Now, today or tomorrow - default: now - responsible for header Animations
  scheduledScreenHeaderNowOpacity: new Animated.Value(1), //Opacity of the header when scheduled screen is on at NOW - default: 1
  scheduledScreenHeaderNowPosition: new Animated.Value(0), //Left offset of the header when scheduled screen is on at NOW - default: 0
  scheduledScreenHeaderNotNowOpacity: new Animated.Value(0), //Opacity of the header when scheduled screen is on at TODAY OR TOMORROW - default: 0
  scheduledScreenHeaderNotNowPosition: new Animated.Value(10), //Left offset of the header when scheduled screen is on at TODAY OR TOMORROW - default: 10
  scheduledScreenHeaderFutureTimeNotSetOpacity: new Animated.Value(0), //Opacity of the header when scheduled screen is on at ERROR FUTURE TIME NOT SET - default: 0
  scheduledScreenHeaderFutureTimeNotSetPosition: new Animated.Value(10), //Left offset of the header when scheduled screen is on at ERROR FUTURE TIME NOT SET - default: 10
  //...
  isSelectDatePickerActive: false, //To know whether or not to dispay the datepicker when scheduling a ride - default: false
  selectedScheduleTime: 'now', //To know the time set for the potential scheduled trip
  //SUMMARY BEFORE REQUEST
  titleSummaryOpacity: new Animated.Value(1), //Opacity of the header when summary ride is active - default: 0
  titleSummaryPosition: new Animated.Value(0), //Left offset position of the header when summary ride is active - default : 10
  summaryContentOpacity: new Animated.Value(1), //Opacity of the content holder when summary ride is active - default 0
  summaryContentPosition: new Animated.Value(0), //Top offset position of the content holder when summary ride is active - default 20
  isEnterCustomFareWindowOn: false, //To know whether to show the bottom vital screen for entering a custom fare or not during the summary session - default: false
  //DELIVERY GLOBAL VARS
  renderGlobalModal: false, //Whether or not to render the main modal
  isDeliveryReceiverInfosShown: false, //Whether so show or not the screen where the user can enter the receiver's informations while booking for delivery

  //...OTHER
  customStringTypedTMP: false, //FOr any text input to use to keep temporary values

  //SEARCH MODULE GLOBAL VARIABLES
  //State variables for destination search
  search_time_requested: null,
  search_querySearch: '',
  search_metadataResponse: [],
  search_loaderPosition: new Animated.Value(0), //Offset position of the loader
  search_headerSearchNodePosition: new Animated.Value(-500), //Position of the header part of the search window
  search_resultSearchNodePosition: new Animated.Value(90), //Position of the footer part of the search window
  search_resultsSearchNodeOpacity: new Animated.Value(0), //Opacity of the footer part if the seach window
  search_showLocationSearch_loader: false, //Whether or not to show the line animation
  search_showSearchNodeMain: true, //Whether or not to show the search results node - default: true
  search_isAllgoingToTheSamePlace: false, //T know whether all the passengers are going to the same place - default: false
  search_currentFocusedPassenger: 1, //Passenger on which the focus is currently, very important for on select location assignation actions. - 0 for my current location
  //Global variable containing the destinations of each passengers - Maximum of 4 passengers
  search_passengersDestinations: {
    passenger1Destination: false, //Passenger 1 destination's details
    passenger2Destination: false, //Passenger 2 destination's details
    passenger3Destination: false, //Passenger 3 destination's details
    passenger4Destination: false, //Passenger 4 destination's details
  },
  //...Text inputs
  search_passenger1DestinationInput: false, //Input text for the passenger's 1 field, etc
  search_passenger2DestinationInput: false, //Input text for the passenger's 2 field, etc
  search_passenger3DestinationInput: false, //Input text for the passenger's 3 field, etc
  search_passenger4DestinationInput: false, //Input text for the passenger's 4 field, etc
  //Pickup location variables
  search_pickupLocationInfos: {
    isBeingPickedupFromCurrentLocation: true, //To know whether the rider is being picked up from his/her current location or a different one - default: true
    passenger0Destination: false, //Will contain the custom pickup location infos - default: false
    //Text input
    search_passenger0DestinationInput: false, //Input text for the passenger's 0 field, etc - Pickup location
  },

  //USER FAVORITE PLACES PREFEDFINED
  //E.g: Home, gym for -> seach module
  user_favorites_destinations: [
    {
      name: 'Home',
      icon: 'home',
      location_infos: false, //Contains infos like street name, coordinates, etc... related to the place
    },
    {
      name: 'Work',
      icon: 'briefcase',
      location_infos: false, //Contains infos like street name, coordinates, etc... related to the place
    },
    {
      name: 'Gym',
      icon: 'human',
      location_infos: false, //Contains infos like street name, coordinates, etc... related to the place
    },
  ],

  //Add more details about trip/delivery MAIN VARS
  maxCharAdditionalNote: 70, //The maximum number of characters in the additional pickup note for rides or deliveries - default: 70 - static
  currentCharStringAdditionalNote: 0, //Current number of characters used for the additional note - not really need, but? - default: 0
  additionalNote_inputText: false, //Input string of the pickup note - default: false

  //PHONE NUMBER INPUT MODULE
  countriesDialDataState: null, //Data for all the considered countries - default: complete set, can be filtereed but not altered! - to be initialized in the constructor of the module
  renderCountryCodeSeacher: false, //Whether to show or not the list of country code to select one
  countryCodeSelected: 'NA', //Country code selected by the user - default: NA (Namibia)
  countryPhoneCode: '+264', //The selected country's phone code - default : +264 (Namibia)
  dynamicMaxLength: 10, //Max length of the phone number based on the country selected - default: 10 characters
  phoneNumberEntered: '', //Phone number entered by the user
  phoneNumberPlaceholder: '', //Placeholder with the correct format before entering the phone number, based on the selected country.
  isFilterCountryShown: false, //Whether or not to show the country search filter on user action - default: false
  typedCountrySearchQuery: '', //Query typed to search a specific country
  finalPhoneNumber: false, //Store the final generated phone number
  //Generic phone number input variable
  isPhoneNumberValid: false, //TO know if the phone number is valid or not.

  //ANIMATION OF SEARCH COUNTRY SCREEN
  searchCountryScreenOpacity: new Animated.Value(0), //Opacity of the seach country screen - default: 0
  searchCountryScreenPosition: new Animated.Value(200), //Top offset of the search country screen - default: 200

  //Input receiver's details vars
  errorReceiverNameText: 'The name should be at least 4 letters long', //Error on the receiver's name text
  errorReceiverPhoneNumberText: 'The number looks wrong', //Error on the receiver's phone number text
  errorReceiverNameShow: false, //Whether to show (true) or not (false) the error on the receiver's name - default:false
  errorReceiverPhoneNumberShow: false, //Whether to show (true) or not (false) the error on the receiver's phone number - default:false

  //Error manager
  generalErrorModal_vars: {
    showErrorGeneralModal: false, //Whether to show or not the error modal - default: false
    generalErrorModalType: false, //The type of the error to handle, based on this the content of the modal will be very different - careful! - default: false
    network_type: false, //The type of the network currently connected.
  },

  //User generic variables
  gender_user: 'male', //The gender of the user - default: male (male, female, unknown)
  username: 'User', //The name of the user - default: false - name
  surname_user: 'Surname', //The name of the user - default: false - surname
  phone_user: '+264856997167', //The user's phone number - default: false
  user_email: 'user@gmail.com', //The email of the user - default: false
  user_profile_pic: null, //The user's profile picture
  last_dataPersoUpdated: null, //The last data updated - default: null
  accountCreation_state: null, //The state of the creation of the account - full or minimal - default: null

  //RIDES tab
  //1.Your rides screen
  shownRides_types: 'Past', //To govern which ride to show :past, scheduled or business - default: false
  //Will contain all the rides details history for "Past", "Scheduled" and "Business" rides/deliveries
  rides_history_details_data: {
    rides_history_data: [],
    targetedRequestSelected: {
      request_fp:
        'd17ccec0a84b5fda99de3b0d2d8d3366e811fe241acc22d2b896a1338db74da6196daa665901e346',
    }, //After the user select one already happened ride for more details - default: false
  },
  //Drop off rating metadata
  dropoff_rating_metadata: {
    rating_score: 5, //The rating for the driver selected by the user - default: 5
    compliment_array: [], //The compliment for the driver selectedd by the user - array of compliment strings - default: [], strings: neatAndTidy, excellentService, greatMusic, greatConversation, expertNavigator
    custom_note: false, //The custom note entered by the user,
    request_fp: false, //The request fingerprint
    user_fp: false,
  },

  //WALLET VARS
  wallet_state_vars: {
    totalWallet_amount: 0, //Current wallet balance - default: 0
    transactions_data: null, //Contains the detailed wallet transactions made from trips or normal wallet transfers. - default: nll
    selectedPayment_method: 'cash', //Default selected payment method - default: cash - auto select wallet after selecting a car type based on the fare amount.
  },
};

export default STATE;
