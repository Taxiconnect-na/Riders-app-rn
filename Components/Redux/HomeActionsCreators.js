/* eslint-disable prettier/prettier */
/**
 * ACTIONS CREATORS FOR MAINLY HOME GLOBAL STATE
 * This file maps all the actions mainly targeting the home screen, but can also
 * include other screens actions.
 * For actions without a specific payload, defaults the payload to - true.
 */

//1. Reset state action
//@param homeParentNode: optional - the parent instance of the Home screen
export const ResetStateProps = (homeParentNode = true) => ({
  type: 'RESET_STATE_PROPS',
  payload: homeParentNode,
});

//2. Update GPRS GLOBALS for granted permissions
//@params gprsVars a litteral object have the permission state or not and if did ask for gprs once
export const UpdateGrantedGRPS = (gprsVars) => ({
  type: 'UPDATE_GRANTED_GPRS_VARS',
  payload: gprsVars,
});

//3. UPdate pending trip global state vars
export const UpdatePendingGlobalVars = (tripVars) => ({
  type: 'UPDATE_PENDING_GLOBAL_VARS',
  payload: tripVars,
});

//4. Update route to pickup vars
export const UpdateRouteToPickupVars = (tripVars) => ({
  type: 'UPDATE_ROUTE_TO_PICKUP_VARS',
  payload: tripVars,
});

//5. IN ROUTE TO PICKUP initialization vars
//@param response: from the MAP SERVICES
export const InRouteToPickupInitVars = (response) => ({
  type: 'IN_ROUTE_TO_PICKUP_INIT_VARS',
  payload: response,
});

//6. IN ROUTE TO DESTINATION initialization vars
//@param response: from the MAP SERVICES
export const InRouteToDestinationInitVars = (response) => ({
  type: 'IN_ROUTE_TO_DESTINATION_INIT_VARS',
  payload: response,
});

//7. Update tiny car on map icon size
//@param newSize: new relative car size.
export const UpdateTinyCarOnMapIconSize = (newSize) => ({
  type: 'UPDATE_TINY_CAR_ON_MAP_ICON_SIZE',
  payload: newSize,
});

//8. Update HELLOs relative messages
//@param hellosVars: differents variations of the update stages (ref. to home code for more insights!)
export const UpdateHellosVars = (hellosVars) => ({
  type: 'UPDATE_HELLO_VARS',
  payload: hellosVars,
});

//9. UPDATE scheduler vars
//@param schedulerState: scheduler vars
export const UpdateSchedulerState = (schedulerState) => ({
  type: 'UPDATE_SCHEDULER_STATE',
  payload: schedulerState,
});

//10. Enter custom fare vars
//@param customFareState
export const UpdateCustomFareState = (customFareState) => ({
  type: 'UPDATE_CUSTOM_FARE_STATE',
  payload: customFareState,
});

//11. Bottom vitals vars update
//@param bottomVitalsVars
export const UpdateBottomVitalsState = (bottomVitalsVars) => ({
  type: 'UPDATE_BOTTOM_VITALS_STATE',
  payload: bottomVitalsVars,
});

//12. Update bottom vitals process flow
//@param flowDirection: to indicate if the process should go forward (next) or backward (previous) or could be the flow parent update
export const UpdateProcessFlowState = (flowDirection) => ({
  type: 'UPDATE_PROCESS_FLOW_STATE',
  payload: flowDirection,
});

//SEARCH MODULE ACTIONS CREATORS
//13. UPDATE search metadata and loader state
export const UpdateSearchMetadataLoaderState = (searchState) => ({
  type: 'UPDATE_SEARCH_METADATA_LOADER_STATE',
  payload: searchState,
});

//14. Update map usability state (zoom, pitched, scroll and rotate)
//@param state: true (enable all usage) or false (disable all usage) or object containing recenter show or not
export const UpdateMapUsabilityState = (state) => ({
  type: 'UPDATE_MAP_USABILITY_STATE',
  payload: state,
});

//15. UPdate ride types scales
//@param metaTransitions: to indicate the ride category (eg. normalTaxiEconomy) and the fare (eg. NAD12)
export const UpdateRideTypesScales = (metaTransitions) => ({
  type: 'UPDATE_RIDE_TYPES_SCALES',
  payload: metaTransitions,
});

//16. Update current location metadata
//Responsible for updating the current location metadata of the user
//@param currentLocationMtd: metadata of the current user location.
export const UpdateCurrentLocationMetadat = (currentLocationMtd) => ({
  type: 'UPDATE_CURRENT_LOCATION_METADATA',
  payload: currentLocationMtd,
});

//17. Update number of passengers selected
//Responsible for updating on the state the number of passengers selected during booking (rides only!)
//Must also update "all going to the same place" variable.
//@param passengersParam: (int) of the number of passengers (1-4) and if all going to the same place var
export const UpdateNumberOfPassengersSelected = (passengersParam) => ({
  type: 'UPDATE_NUMBER_OF_PASSENGERS_SELECTED',
  payload: passengersParam,
});

//18. Update the destination details of all the users
//Responsible for updating the destination selected for alll the users from the search module.
//@param destinationObject: containing the user index to update and the destination object
export const UpdateDestinationDetails = (destinationObject) => ({
  type: 'UPDATE_DESTINATION_DETAILS',
  payload: destinationObject,
});
//18b. Update the custom pickup details
//Responsible for updating the custom pickup (different than the current one) selected from the search module.
//@param destinationObject: containing the user index to update and the destination object
export const UpdateCustomPickupDetails = (customPickupObject) => ({
  type: 'UPDATE_CUSTOM_PICKUP_SELECTED_DETAILS',
  payload: customPickupObject,
});

//19. Update destination input values for all users
//Responsible for updating the destination string inputed by the user for the search module
//@param destinationObject: containing the user index to update and the destination object
export const UpdateDestinationInputValues = (destinationObject) => ({
  type: 'UPDATE_DESTINATION_INPUT_VALUES',
  payload: destinationObject,
});

//20. Update additional pickup note for rides or deliveries
//Responsible for updating the pickup note and all UI elements related
//@param text: new text typed
export const UpdateAdditionalPickupNote = (text) => ({
  type: 'UPDATE_ADDTIONAL_PICKUP_NOTE',
  payload: text,
});

//21. Update ride types on scroll categories
//Responsible for contantly checking the scroll of the select ride type screen and updating every visual
//elements accordingly and keep up with the interactivity levels.
//@param currentWindowState: object containing all the useful state infos about the current positions.
export const UpdateRideTypesOnScrollCategories = (currentWindowState) => ({
  type: 'UPDATE_RIDE_TYPES_ON_SCROLL_CATEGORIES',
  payload: currentWindowState,
});

//22. Update pricing state data
//Responsible for updating the state about the newly computed fares from the pricing service.
//@param networkPricingObject: Object received from the pricing service as a valid responsie of successful computation.
export const UpdatePricingStateData = (networkPricingObject) => ({
  type: 'UPDATE_PRICING_STATE_DATA',
  payload: networkPricingObject,
});

//23. Update the route preview for the user
//Responsible for updating the variable state responsible for showing to the user the preview of the route to the first
//destination selected on the app while booking (ride or delivery) with the data from the Map service.
export const UpdateRoutePreviewToDestination = (destinationPreviewData) => ({
  type: 'UPDATE_ROUTE_PREVIEW_TO_DESTINATION',
  payload: destinationPreviewData,
});

//24. Update delivery package size on user select
//Responsible for updating in the global state the package size selected when the user selects it
export const UpdateDeliveryPackageSize = (packageSelected) => ({
  type: 'UPDATE_DELIVERY_PACKAGE_SIZE',
  payload: packageSelected,
});

//25. Update the rider or package possesser switcher
//Responsible for updating the state variables when a user switch offical riders while booking (ride or delivery)
//@param is an object containing the rider selected (me or someoneelse) and phone number or false if phone not provided
export const UpdateRiderOrPackagePossesserSwitcher = (riderInfo) => ({
  type: 'UPDATE_RIDER_OR_PACKAGE_POSSESSER_SWITCHER',
  payload: riderInfo,
});

//25a. Update the receiver's name on type
//Responsible for updating the receiver's name during the input of the receiver's infos
//@param name: name as typed
export const UpdateReceiverNameOnType = (name) => ({
  type: 'UPDATE_RECIVER_NAME_ON_TYPE',
  payload: name,
});

//PHONE NUMBER INPUT MODULE
//26. SHow filter header
//Responsible.for showing the country filter in the phone number input module on user select
//@param state: true (show) or false (hide)
export const ShowCountryFilterHeader = (state) => ({
  type: 'SHOW_COUNTRY_FILTER_HEADER',
  payload: state,
});

//27. Render country phone code searcher
//Responsible for rendering or not the main window of the phone searcher
//@param state: true(render) or false(hide)
export const RenderCountryPhoneCodeSearcher = (state) => ({
  type: 'RENDER_COUNTRY_PHONE_CODE_SEARCHER',
  payload: state,
});

//28. Update country code format after select
//Responsible for updating the country code format after a country is selected (format include code and placeholder)
//@param formatObj: which contains the placeholder of the country's number, the country phone code and the typical length of the phone number
export const UpdateCountryCodeFormatAfterSelect = (formatObj) => ({
  type: 'UPDATE_COUNTRY_CODE_FORMAT_AFTER_SELECT',
  payload: formatObj,
});

//29. Update dialData or query type
//Responsible for updating the dial data while filtering, the query typed, the typed phone number (on change) and also to reset
//@param updateStringObj: contains the actions (updateQueryTyped, updateDialData, updateTypedNumber, resetAll) and corresponding variables (same name as the varaibles)
export const UpdateDialDataORQueryTyped = (updateStringObj) => ({
  type: 'UPDATE_DIAL_DATA_OR_QUERY_TYPED',
  payload: updateStringObj,
});

//30. Validate receiver's informations for delivery
//Responsible for validating the receiver's informations, show error made and auto move next if valid data found
export const ValidateReceiverInfosForDelivery = () => ({
  type: 'VALIDATE_RECEIVER_INFOS_FOR_DELIVERY',
});

//31. Update error messages state - input receiver's details
//Responsible for updating the state of the error messages during the input of the receiver's details - delivery
//@param stateObj: contains the message to update (name or number) and the state (state, true-show or false-hide)
export const UpdateErrorMessagesStateInputRecDelivery = (stateObj) => ({
  type: 'UPDATE_ERROR_MESSAGES_STATE_INPUT_REC_DELIVERY',
  payload: stateObj,
});

//32. Update the list of the closest drivers
//Responsible for updating the list of closest drivers when received from the Map service
//@param closestDrivers: contains the list of maximum 7 closest drivers from the rider's location.
export const UpdateClosestDriversList = (closestDrivers) => ({
  type: 'UPDATE_CLOSEST_DRIVERS_LIST',
  payload: closestDrivers,
});

//33. Update error bottom vitals
//Responsible for updating the error bottom screen logs when a request fail to succeed.
//@param errorMessage: message to show to the user on fail
export const UpdateErrorBottomVitals = (errorMessage) => ({
  type: 'UPDATE_ERROR_BOTTOM_VITALS',
  payload: errorMessage,
});

//34. Validate generic phone number
//Responsible for validiting globally any phone number inputed in the phone number input module
export const ValidateGenericPhoneNumber = () => ({
  type: 'VALIDATE_GENERIC_PHONE_NUMBER',
  payload: false,
});

//35. Reset generic phone number variables
//Responsible for resetting the phone number variables to the default ones
export const ResetGenericPhoneNumberInput = () => ({
  type: 'RESET_GENERIC_PHONE_NUMBER_INPUT',
  payload: false,
});

//36. Update the error modal log
//Responsible for updating the state of the error log and the correspoding error message
export const UpdateErrorModalLog = (
  activeStatus,
  errorMessage,
  network_type,
) => ({
  type: 'UPDATE_GENERAL_ERROR_MODAL',
  payload: {
    activeStatus: activeStatus,
    errorMessage: errorMessage,
    network_typenetwork_type: network_type,
  },
});

//37. Update user gender state
//Responsible for updating the gender of the user while creating the account.
//@parm gender: the gender string (male, female or unknown)
export const UpdateUserGenderState = (gender) => ({
  type: 'UPDATE_USER_GENDER_STATE',
  payload: gender,
});

//38. UPdate the type of ride shown in the "Your rides" screen
//Responsible for updating the state variable of the type of ride shown in the "Your rides" screen
//@param type: Past, Scheduled or Business (coming soon)
export const UpdateType_rideShown_YourRides_screen = (type) => ({
  type: 'UPDATE_TYPE_RIDESHOWN_YOURRIDES_SCREEN',
  payload: type,
});

//39. UPdate the ride history after fetch from the server for the "Your rides" tab
//Responsible for getting the relevant rides as selected by the user (past, scheduled, business)
//@param ridesHistory: the data fetched
export const UpdateRides_history_YourRides_tab = (ridesHistory) => ({
  type: 'UPDATERIDES_HISTORY_YOURRIDES_TAB',
  payload: ridesHistory,
});

//40. Update the targeted request when selected on the "Your rides" tab
//Responsible for updating the global variables for the targeted history ride
//@param request_fp
export const UpdateTargetedRequest_yourRides_history = (request_fp) => ({
  type: 'UPDATE_TARGETED_REQUEST_YOURRIDES_HISTORY',
  payload: request_fp,
});

//41. Update the rating details while confirming drop off
//Responsible for updating the state vars during the drop off confirmation process.
//THE CUSTOM NOTE WILL BE UPDATED INSIDE THE LOCAL STATE OF THE MODAL MANAGER
//@param updateBundle -> action (updateRating, updateCompliment) + data
export const UpdateRatingDetailsDuringDropoff_process = (updateBundle) => ({
  type: 'UPDATE_RATING_DETAILS_DURINGDROPOFF_PROCESS',
  payload: updateBundle,
});

/*
 * 42. Update dropoff data for driver rating after drop off
 * Responsible for updating the state vars for the trip after the driver has confirmed drop off.
 * @param tripResponse: the summary for the trip coming straight from the server.
 */
export const UpdateDropoffDataFor_driverRating = (tripResponse) => ({
  type: 'UPDATE_DROPFFDATA_FORDRIVER_RATING',
  payload: tripResponse,
});
