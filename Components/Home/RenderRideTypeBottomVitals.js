/* eslint-disable prettier/prettier */
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import SOCKET_CORE from '../Helpers/managerNode';
import {
  View,
  Text,
  Animated as AnimatedNative,
  Easing,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  InteractionManager,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
//import this.props.App.carIcon from './caradvanced.png';      //Option 1
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
//Import of action creators
import {
  UpdateSchedulerState,
  UpdateCustomFareState,
  UpdateProcessFlowState,
  UpdateRideTypesOnScrollCategories,
  UpdateRideTypesScales,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';

/**
 * @func RenderRideTypeBottomVitals()
 * @params customStep: to customize the title to a non generic element: specifically for the summary
 * Responsible for rendering either the schedule part of the bottom vital booking process or the select
 * car part.
 * REFERENCE
 * titleSelectRideOpacity: new AnimatedNative.Value(1), //Opacity of the header when select ride is active - default: 0
 * titleSelectRidePosition: new AnimatedNative.Value(0), //Left offset position of the header when select ride is active - default : 10
 * selectRideContentOpacity: new AnimatedNative.Value(1), //Opacity of the content holder when select ride is active - default 0
 * selectRideContentPosition: new AnimatedNative.Value(0), //Top offset position of the content holder when select ride is active - default 20
 * ---
 * titleSchedulerSelectRideOpacity: new AnimatedNative.Value(0), //Opacity of the header when schedule ride is active - default: 0
 * titleSchedulerSelectRidePostion: new AnimatedNative.Value(10), //Left offset position of the header when schedule is active - default : 10
 * scheduleRideContentOpacity: new AnimatedNative.Value(0), //Opacity of the content holder when schedule ride is active - default 0
 * scheduleRideContentPosition: new AnimatedNative.Value(20), //Top offset position of the content holder when schedule ride is active - default 20
 */
class RenderRideTypeBottomVitals extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleChooseCarType = this.handleChooseCarType.bind(this);
    this.rideTypeToSchedulerTransistor = this.rideTypeToSchedulerTransistor.bind(
      this,
    );
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
    InteractionManager.runAfterInteractions(() => {
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
          AnimatedNative.timing(
            this.props.App.titleSchedulerSelectRideOpacity,
            {
              toValue: 0,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(
            this.props.App.titleSchedulerSelectRidePostion,
            {
              toValue: 10,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
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
            AnimatedNative.timing(
              globalObject.props.App.titleSelectRideOpacity,
              {
                toValue: 1,
                duration: 250,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
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
    });
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
    InteractionManager.runAfterInteractions(() => {
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
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricComfortTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
            toValue: 0.9,
            duration: 250,
            useNativeDriver: true,
          }),
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricLuxuryTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
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
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricComfortTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
            toValue: 0.9,
            duration: 250,
            useNativeDriver: true,
          }),
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricLuxuryTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
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
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricComfortTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
            toValue: 0.9,
            duration: 250,
            useNativeDriver: true,
          }),
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricLuxuryTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
        ]).start(() => {
          globalObject.props.UpdateRideTypesScales({
            rideType: carType,
            fare: fare,
          });
        });
      } else if (
        carType === 'comfortElectricRide' ||
        carType === 'vanDelivery'
      ) {
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
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricComfortTaxi,
            {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
            toValue: 0.9,
            duration: 250,
            useNativeDriver: true,
          }),
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricLuxuryTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
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
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricComfortTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricLuxuryTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
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
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricComfortTaxi,
            {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            },
          ),
          AnimatedNative.timing(this.props.App.scaleRideTypeLuxuryTaxi, {
            toValue: 0.9,
            duration: 250,
            useNativeDriver: true,
          }),
          AnimatedNative.timing(
            this.props.App.scaleRideTypeElectricLuxuryTaxi,
            {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            },
          ),
        ]).start(() => {
          globalObject.props.UpdateRideTypesScales({
            rideType: carType,
            fare: fare,
          });
        });
      }
    });
  }

  /**
   * @func selectRideScrollManager
   * Responsible for keeping the right interaction level based on the scroll level.
   */
  selectRideScrollManager(event, globalObject) {
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
      InteractionManager.runAfterInteractions(() => {
        //Fade the title quickly and update the state, and reshow the title
        //UpdateRideTypesOnScrollCategories
        AnimatedNative.parallel([
          AnimatedNative.timing(globalObject.props.App.titleSelectRideOpacity, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
          }),
          AnimatedNative.timing(
            globalObject.props.App.titleSelectRidePosition,
            {
              toValue: 10,
              duration: 60,
              useNativeDriver: true,
            },
          ),
        ]).start(() => {
          //Update state
          globalObject.props.UpdateRideTypesOnScrollCategories({
            currentScreen: currentScreen,
            currentScrollposition: currentOffset,
          });
          //The title back in
          AnimatedNative.parallel([
            AnimatedNative.timing(
              globalObject.props.App.titleSelectRideOpacity,
              {
                toValue: 1,
                duration: 60,
                useNativeDriver: true,
              },
            ),
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
      });
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
   * @func connectToTaxiGenericButtonAction()
   * Responsible for closing up the bottom vitals and loading the loader page for about 5 seconds before rendering the main
   * "Finding Taxi" or for delivery screen.
   * @param actionType: RIDE OR DELIVERY depending on the request type
   */
  connectToTaxiGenericButtonAction(actionType) {
    let globalObject = this;
    if (actionType === 'RIDE' || actionType === 'DELIVERY') {
      this.props.parentNodeHome.fire_search_animation();
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
          parentTHIS: globalObject.props.parentNodeHome,
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
              if (globalObject.props.App.intervalProgressLoop === false) {
                if (
                  globalObject.props.App.bottomVitalsFlow._BOOKING_REQUESTED ===
                    false &&
                  globalObject.props.App.bottomVitalsFlow
                    ._error_booking_requested === false
                ) {
                  //Not yet request and no errors
                  //Check wheher an answer was already received - if not keep requesting
                  SOCKET_CORE.emit(
                    'requestRideOrDeliveryForThis',
                    RIDE_OR_DELIVERY_BOOKING_DATA,
                  );
                }
                //Kill interval - if booking request data already received
                else {
                  clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
                  if (globalObject.props.App._TMP_INTERVAL_PERSISTER !== null) {
                    globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
                  }
                }
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
                fontFamily: 'Allrounder-Grotesk-Regular',
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
                fontSize: 17.5,
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
                      fontSize: 17.5,
                      paddingLeft: 5,
                      fontFamily: 'Allrounder-Grotesk-Medium',
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
                      fontSize: 17.5,
                      paddingLeft: 0,
                      fontFamily: 'Allrounder-Grotesk-Medium',
                    },
                  ]}>
                  {this.props.parentNodeHome.ucFirst(
                    this.props.App.wallet_state_vars.selectedPayment_method,
                  )}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{flexDirection: 'row'}}>
              <Text style={{paddingLeft: 10, paddingRight: 10}}>-</Text>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={[
                    {
                      fontSize: 17.5,
                      paddingLeft: 0,
                      fontFamily: 'Allrounder-Grotesk-Medium',
                    },
                  ]}>
                  {this.props.parentNodeHome.ucFirst(
                    this.props.App.wallet_state_vars.selectedPayment_method,
                  )}
                </Text>
              </View>
            </View>
          )}
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
                fontFamily: 'Allrounder-Grotesk-Medium',
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

  customRenderOrderer(customStep = false) {
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
                        InteractionManager.runAfterInteractions(() => {
                          this.props.UpdateSchedulerState({
                            isSelectDatePickerActive: true,
                          });
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
                          : this.props.parentNodeHome.ucFirst(
                              this.props.App.selectedScheduleTime,
                            )}
                      </Text>
                    </TouchableOpacity>
                  </AnimatedNative.View>
                )}
              </>
              <View style={{flex: 1, width: '100%', bottom: 10}}>
                <TouchableOpacity
                  onPressIn={() =>
                    InteractionManager.runAfterInteractions(() => {
                      this.props.parentNodeHome.reallocateScheduleContextCheck(
                        'now',
                      );
                    })
                  }
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
                          fontSize: 17,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        },
                      ]}>
                      {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                        ? 'I want my ride right away'
                        : 'I want my delivery right away'}
                    </Text>
                  </View>
                  {this.props.parentNodeHome.renderCheckForScheduleContext(
                    'now',
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPressIn={() =>
                    InteractionManager.runAfterInteractions(() => {
                      this.props.parentNodeHome.reallocateScheduleContextCheck(
                        'today',
                      );
                    })
                  }
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
                          fontSize: 17,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        },
                      ]}>
                      For today
                    </Text>
                  </View>
                  {this.props.parentNodeHome.renderCheckForScheduleContext(
                    'today',
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPressIn={() =>
                    InteractionManager.runAfterInteractions(() => {
                      this.props.parentNodeHome.reallocateScheduleContextCheck(
                        'tomorrow',
                      );
                    })
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
                          fontSize: 17,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        },
                      ]}>
                      For tomorrow
                    </Text>
                  </View>
                  {this.props.parentNodeHome.renderCheckForScheduleContext(
                    'tomorrow',
                  )}
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
                  InteractionManager.runAfterInteractions(() => {
                    this.rideTypeToSchedulerTransistor(false);
                  })
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
      } //Render select ride type
      else {
        //Separate RIDE from DELIVERY
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
                                            width: 110,
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
                                                fontSize: 15,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Regular',
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
                                                fontSize: 19,
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
                                            width: 110,
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
                                                fontSize: 15,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Regular',
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
                                                fontSize: 19,
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
                                            width: 110,
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
                                                fontSize: 15,
                                                fontFamily:
                                                  'Allrounder-Grotesk-Regular',
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
                                                fontSize: 19,
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
                      onPress={() =>
                        InteractionManager.runAfterInteractions(() => {
                          this.props.UpdateErrorModalLog(
                            true,
                            'show_preferedPaymentMethod_modal',
                            'any',
                          );
                        })
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                        paddingRight: 15,
                        paddingLeft: 0,
                      }}>
                      <IconMaterialIcons
                        name="credit-card"
                        size={28}
                        style={{marginRight: 3}}
                      />
                      <Text
                        style={[
                          {
                            fontSize: 19,
                            color: '#0D8691',
                            fontFamily: 'Allrounder-Grotesk-Medium',
                          },
                        ]}>
                        {this.props.parentNodeHome.ucFirst(
                          this.props.App.wallet_state_vars
                            .selectedPayment_method,
                        )}
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                      }}>
                      <IconAnt name="user" size={16} style={{marginRight: 3}} />
                      <Text
                        style={[
                          {
                            fontSize: 19,
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
                    onPress={() => {
                      InteractionManager.runAfterInteractions(() => {
                        this.rideTypeToSchedulerTransistor(true);
                      });
                    }}
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
                          fontSize: 16.5,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        },
                      ]}>
                      {this.props.App.selectedScheduleTime === 'now'
                        ? 'Schedule'
                        : this.props.parentNodeHome.ucFirst(
                            this.props.App.selectedScheduleTime,
                          )}
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
                    this.props.parentNodeHome.rerouteBookingProcessFlow(
                      'next',
                      'RIDE',
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
                        fontFamily: 'Allrounder-Grotesk-Medium',
                        fontSize: 23.5,
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
                                                  'Allrounder-Grotesk-Regular',
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
                                                  'Allrounder-Grotesk-Regular',
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
                      onPress={() =>
                        InteractionManager.runAfterInteractions(() => {
                          this.props.UpdateErrorModalLog(
                            true,
                            'show_preferedPaymentMethod_modal',
                            'any',
                          );
                        })
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                        paddingRight: 15,
                        paddingLeft: 0,
                      }}>
                      <IconMaterialIcons
                        name="credit-card"
                        size={23}
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
                        {this.props.parentNodeHome.ucFirst(
                          this.props.App.wallet_state_vars
                            .selectedPayment_method,
                        )}
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
                          size={14}
                          style={{marginRight: 3}}
                        />
                        <Text
                          style={[
                            {
                              fontSize: 17,
                              top: 1,
                              fontFamily: 'Allrounder-Grotesk-Regular',
                            },
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
                        : this.props.parentNodeHome.ucFirst(
                            this.props.App.selectedScheduleTime,
                          )}
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
                    this.props.parentNodeHome.rerouteBookingProcessFlow(
                      'next',
                      'DELIVERY',
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
                        fontFamily: 'Allrounder-Grotesk-Medium',
                        fontSize: 23.5,
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
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    fontSize: 22.5,
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
                alignItems: 'center',
                width: '100%',
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
                    borderBottomWidth: 1,
                    width: '100%',
                    borderBottomColor: '#a5a5a5',
                    fontSize: 19,
                    padding: 15,
                    paddingLeft: 0,
                    height: 50,
                    fontFamily: 'Allrounder-Grotesk-Regular',
                  },
                ]}
              />
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  width: '100%',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                <IconFeather name="info" size={16} style={{marginRight: 4}} />
                <Text
                  style={[
                    {fontSize: 16, fontFamily: 'Allrounder-Grotesk-Book'},
                  ]}>
                  Your minimum fare is{' '}
                  <Text
                    style={[
                      {
                        fontFamily: 'Allrounder-Grotesk-Medium',
                        color: '#096ED4',
                      },
                    ]}>
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
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    fontSize: 23.5,
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
                          {
                            color: '#fff',
                            fontSize: 13,
                            fontFamily: 'Allrounder-Grotesk-Regular',
                          },
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
                  onPress={() =>
                    this.props.UpdateErrorModalLog(
                      true,
                      'show_preferedPaymentMethod_modal',
                      'any',
                    )
                  }
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
                    {this.props.parentNodeHome.ucFirst(
                      this.props.App.wallet_state_vars.selectedPayment_method,
                    )}
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
                    : this.props.parentNodeHome.ucFirst(
                        this.props.App.selectedScheduleTime,
                      )}
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
                this.props.parentNodeHome.rerouteBookingProcessFlow(
                  'next',
                  'RIDE',
                )
              }
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

  render() {
    return (
      <>
        {this.customRenderOrderer(
          this.props.customStep !== undefined ? this.props.customStep : false,
        )}
      </>
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
      UpdateSchedulerState,
      UpdateCustomFareState,
      UpdateProcessFlowState,
      UpdateRideTypesOnScrollCategories,
      UpdateRideTypesScales,
      UpdateErrorModalLog,
    },
    dispatch,
  );

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loader: {
    borderTopWidth: 3,
    width: 20,
    marginBottom: 10,
  },
  bttnGenericTc: {
    borderColor: '#000',
    padding: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 3,
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RenderRideTypeBottomVitals);
