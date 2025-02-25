/* eslint-disable prettier/prettier */
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
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
  Platform,
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
  UpdatePreferredPayment_method,
} from '../Redux/HomeActionsCreators';
import {RFValue} from 'react-native-responsive-fontsize';

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
   * ---
   * titleSchedulerSelectRideOpacity: new AnimatedNative.Value(0), //Opacity of the header when schedule ride is active - default: 0
   * titleSchedulerSelectRidePostion: new AnimatedNative.Value(10), //Left offset position of the header when schedule is active - default : 10
   * scheduleRideContentOpacity: new AnimatedNative.Value(0), //Opacity of the content holder when schedule ride is active - default 0
   * scheduleRideContentPosition: new AnimatedNative.Value(20), //Top offset position of the content holder when schedule ride is active - default 20
   */
  rideTypeToSchedulerTransistor(isSchedulerOnVal) {
    //Work if only props.App value changes
    let that = this;
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
          that.props.App.isSelectTripScheduleOn = isSchedulerOnVal;
          that.forceUpdate(); //To refresh the new UI elements containing the select ride view
          //Restore the current scroll level of the select ride scrollview
          setTimeout(() => {
            that.scrollViewSelectRideRef.scrollTo({
              x:
                that.props.App.windowWidth *
                that.props.App.headerRideTypesVars.currentHeaderIndex,
              y: 0,
              animated: true,
            });
          }, 1);

          //...
          //Fade away the  scheduler -> select ride
          AnimatedNative.parallel([
            AnimatedNative.timing(that.props.App.titleSelectRideOpacity, {
              toValue: 1,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            }),
            AnimatedNative.timing(that.props.App.titleSelectRidePosition, {
              toValue: 0,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            }),
            AnimatedNative.timing(that.props.App.selectRideContentOpacity, {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            }),
            AnimatedNative.timing(that.props.App.selectRideContentPosition, {
              toValue: 0,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            }),
          ]).start(() => {
            that.forceUpdate(); //To refresh the new UI elements containing the scheduler view
          });
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
          that.props.App.isSelectTripScheduleOn = isSchedulerOnVal;
          that.forceUpdate(); //To refresh the new UI elements containing the scheduler view
          //Fade in the scheduler
          AnimatedNative.parallel([
            AnimatedNative.timing(
              that.props.App.titleSchedulerSelectRideOpacity,
              {
                toValue: 1,
                duration: 250,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
            AnimatedNative.timing(
              that.props.App.titleSchedulerSelectRidePostion,
              {
                toValue: 0,
                duration: 250,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
            AnimatedNative.timing(that.props.App.scheduleRideContentOpacity, {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            }),
            AnimatedNative.timing(that.props.App.scheduleRideContentPosition, {
              toValue: 0,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            }),
          ]).start(() => {
            that.forceUpdate(); //To refresh the new UI elements containing the scheduler view
          });
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
    let that = this;

    //?AUTO SELECT THE PAYMENT METHOD BASED ON THE FARE
    if (
      !/Unavailable/i.test(fare) &&
      this.props.App.wallet_state_vars.totalWallet_amount !== undefined &&
      this.props.App.wallet_state_vars.totalWallet_amount !== null
    ) {
      //! CHECK THE WALLET STATE BEFORE CONTINUING
      if (/^unlocked/i.test(that.props.App.wallet_state_vars.wallet_state)) {
        //Received some fares
        try {
          let fareTmp = parseFloat(fare);
          let walletTmp = parseFloat(
            this.props.App.wallet_state_vars.totalWallet_amount,
          );
          //...
          if (walletTmp >= fareTmp) {
            //Has enough funds in the wallet - select the wallet
            this.props.UpdatePreferredPayment_method('wallet');
          } //Not enough funds in the wallet - select cash
          else {
            this.props.UpdatePreferredPayment_method('cash');
          }
        } catch (error) {
          //? Auto select cash then
          this.props.UpdatePreferredPayment_method('cash');
        }
      } //Force to CASH
      else {
        this.props.UpdatePreferredPayment_method('cash');
      }
    }

    //InteractionManager.runAfterInteractions(() => {
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
        that.props.UpdateRideTypesScales({
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
        that.props.UpdateRideTypesScales({
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
        that.props.UpdateRideTypesScales({
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
        that.props.UpdateRideTypesScales({
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
        that.props.UpdateRideTypesScales({
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
        that.props.UpdateRideTypesScales({
          rideType: carType,
          fare: fare,
        });
      });
    }
    //});
  }

  /**
   * @func selectRideScrollManager
   * Responsible for keeping the right interaction level based on the scroll level.
   */
  selectRideScrollManager(event, that) {
    let currentOffset = Math.round(event.nativeEvent.contentOffset.x);
    let currentScreen = Math.round(
      currentOffset / event.nativeEvent.layoutMeasurement.width,
    );
    //Check if the screen has changed
    if (
      that.props.App.headerRideTypesVars.currentHeaderIndex !== currentScreen
    ) {
      //New state
      InteractionManager.runAfterInteractions(() => {
        //Fade the title quickly and update the state, and reshow the title
        //UpdateRideTypesOnScrollCategories
        AnimatedNative.parallel([
          AnimatedNative.timing(that.props.App.titleSelectRideOpacity, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
          AnimatedNative.timing(that.props.App.titleSelectRidePosition, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start(() => {
          //Update state
          that.props.UpdateRideTypesOnScrollCategories({
            currentScreen: currentScreen,
            currentScrollposition: currentOffset,
          });
          //The title back in
          AnimatedNative.parallel([
            AnimatedNative.timing(that.props.App.titleSelectRideOpacity, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
            AnimatedNative.timing(that.props.App.titleSelectRidePosition, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
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
    let that = this;

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
        that.props.UpdateCustomFareState({
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
              that.props.UpdateCustomFareState({
                isEnterCustomFareWindowOn: setTo,
                fareTripSelected: customFare,
              });
            } //Deconsider
            else {
              //Clean the customStringTYpedTMP
              this.props.App.customStringTypedTMP = false;
              that.props.UpdateCustomFareState({
                isEnterCustomFareWindowOn: setTo,
              });
            }
          } //Deconsider
          else {
            //Clean the customStringTYpedTMP
            this.props.App.customStringTypedTMP = false;
            that.props.UpdateCustomFareState({
              isEnterCustomFareWindowOn: setTo,
            });
          }
        } //Deconsider custom fare
        else {
          //Clean the customStringTYpedTMP
          this.props.App.customStringTypedTMP = false;
          that.props.UpdateCustomFareState({
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
    let that = this;
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
        //that.props.App.bottomVitalsFlow.currentStep ='gettingRideProcessScreen';

        that.props.UpdateProcessFlowState({
          flowDirection: 'next',
          parentTHIS: that.props.parentNodeHome,
        });
        //GATHER REQUEST METADATA FOR RIDE OR DELIVERY REQUEST
        //Check if a custom pickup location was specified
        //Point to current location by default
        let org_latitude = that.props.App.latitude;
        let org_longitude = that.props.App.longitude;
        //Check forr custom pickup
        if (
          that.props.App.search_pickupLocationInfos
            .isBeingPickedupFromCurrentLocation === false &&
          that.props.App.search_pickupLocationInfos.passenger0Destination !==
            false
        ) {
          org_latitude =
            that.props.App.search_pickupLocationInfos.passenger0Destination
              .coordinates[1];
          org_longitude =
            that.props.App.search_pickupLocationInfos.passenger0Destination
              .coordinates[0];
        }
        //...................................................
        let RIDE_OR_DELIVERY_BOOKING_DATA = {
          user_fingerprint: that.props.App.user_fingerprint,
          connectType: that.props.App.bottomVitalsFlow.connectType,
          country: that.props.App.userCurrentLocationMetaData.country,
          isAllGoingToSameDestination:
            that.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .isAllgoingToTheSamePlace, //If all the passengers are going to the same destination
          isGoingUntilHome: /RIDE/i.test(
            that.props.App.bottomVitalsFlow.flowParent,
          )
            ? that.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .isGoingUntilHome
            : false, //! Will double the fares for the Economy - Set to false for the DELIVERY
          naturePickup: /RIDE/i.test(that.props.App.bottomVitalsFlow.flowParent)
            ? that.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .locationTypeIdentified !== false
              ? that.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                  .locationTypeIdentified
              : 'PrivateLocation'
            : 'PrivateLocation', //Force PrivateLocation type if nothing found or delivery request,  -Nature of the pickup location (privateLOcation,etc)
          passengersNo: /RIDE/i.test(that.props.App.bottomVitalsFlow.flowParent)
            ? that.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
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
            that.props.App.bottomVitalsFlow.flowParent,
          )
            ? false
            : this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .receiverName,
          receiverPhone_delivery: /RIDE/i.test(
            that.props.App.bottomVitalsFlow.flowParent,
          )
            ? false
            : this.props.App.countryPhoneCode +
              this.props.App.phoneNumberEntered
                .replace(/ /g, '')
                .replace(/^0/, ''),
          packageSizeDelivery: /RIDE/i.test(
            that.props.App.bottomVitalsFlow.flowParent,
          )
            ? false
            : this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .selectedPackageSize,
          //...
          rideType: that.props.App.bottomVitalsFlow.flowParent, //Ride or delivery
          paymentMethod:
            that.props.App.wallet_state_vars.selectedPayment_method, //Payment method
          timeScheduled: that.props.App.selectedScheduleTime,
          pickupNote: that.props.App.additionalNote_inputText, //Additional note for the pickup
          carTypeSelected: that.props.App.carTypeSelected, //Ride selected, Economy normal taxis,etc
          fareAmount:
            that.props.App.customFareTripSelected !== false &&
            that.props.App.customFareTripSelected !== null
              ? that.props.App.customFareTripSelected
              : that.props.App.fareTripSelected, //Ride fare
          pickupData: {
            coordinates: [org_latitude, org_longitude],
            location_name:
              that.props.App.search_pickupLocationInfos
                .isBeingPickedupFromCurrentLocation === false &&
              that.props.App.search_pickupLocationInfos
                .passenger0Destination !== false
                ? that.props.App.search_pickupLocationInfos
                    .passenger0Destination.location_name !== undefined
                  ? that.props.App.search_pickupLocationInfos
                      .passenger0Destination.location_name
                  : false
                : that.props.App.userCurrentLocationMetaData.name !==
                    undefined &&
                  that.props.App.userCurrentLocationMetaData.name !== null
                ? that.props.App.userCurrentLocationMetaData.name
                : false,
            street_name:
              that.props.App.search_pickupLocationInfos
                .isBeingPickedupFromCurrentLocation === false &&
              that.props.App.search_pickupLocationInfos
                .passenger0Destination !== false
                ? that.props.App.search_pickupLocationInfos
                    .passenger0Destination.street !== undefined
                  ? that.props.App.search_pickupLocationInfos
                      .passenger0Destination.sreet
                  : false
                : that.props.App.userCurrentLocationMetaData.street !==
                    undefined &&
                  that.props.App.userCurrentLocationMetaData.street !== null
                ? that.props.App.userCurrentLocationMetaData.street
                : false,
            city:
              that.props.App.userCurrentLocationMetaData.city !== undefined &&
              that.props.App.userCurrentLocationMetaData.city !== null
                ? that.props.App.userCurrentLocationMetaData.city
                : false,
          },
          destinationData: that.props.App.search_passengersDestinations,
        };

        //DOne gathering, make the server request

        //Bind to interval persister
        /*if (that.props.App._TMP_INTERVAL_PERSISTER === null) {
          that.props.App._TMP_INTERVAL_PERSISTER = setInterval(
            function () {
              if (
                that.props.App.intervalProgressLoop === false ||
                that.props.App.isRideInProgress === false
              ) {
                if (
                  that.props.App.bottomVitalsFlow._BOOKING_REQUESTED ===
                    false &&
                  that.props.App.bottomVitalsFlow
                    ._error_booking_requested === false
                ) {
                  //Not yet request and no errors
                  //Check wheher an answer was already received - if not keep requesting
                  that.props.App.socket.emit(
                    'requestRideOrDeliveryForThis',
                    RIDE_OR_DELIVERY_BOOKING_DATA,
                  );
                }
                //Kill interval - if booking request data already received
                else {
                  that.props.App.bottomVitalsFlow._BOOKING_REQUESTED = true;
                  clearInterval(that.props.App._TMP_INTERVAL_PERSISTER);
                  if (that.props.App._TMP_INTERVAL_PERSISTER !== null) {
                    that.props.App._TMP_INTERVAL_PERSISTER = null;
                  }
                }
              } //Kill interval - if booking request data already received
              else {
                that.props.App.bottomVitalsFlow._BOOKING_REQUESTED = true;
                clearInterval(that.props.App._TMP_INTERVAL_PERSISTER);
                if (that.props.App._TMP_INTERVAL_PERSISTER !== null) {
                  that.props.App._TMP_INTERVAL_PERSISTER = null;
                }
              }
            },
            that.props.App._TMP_INTERVAL_PERSISTER_TIME,
          );
        }*/
        //! Make a single request - risky
        //Not yet request and no errors
        //Check wheher an answer was already received - if not keep requesting
        that.props.App.socket.emit(
          'requestRideOrDeliveryForThis',
          RIDE_OR_DELIVERY_BOOKING_DATA,
        );

        //...
        //Fade in the loader screen
        AnimatedNative.timing(
          that.props.App.bottomVitalsFlow.genericLoaderScreenOpacity,
          {
            toValue: 1,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ).start();
      });
    } else {
      //Clear the interval
      that.props.App.bottomVitalsFlow._BOOKING_REQUESTED = true;
      clearInterval(that.props.App._TMP_INTERVAL_PERSISTER);
      if (that.props.App._TMP_INTERVAL_PERSISTER !== null) {
        that.props.App._TMP_INTERVAL_PERSISTER = null;
      }
    }
  }

  /**
   * @func renderSummarySelectedCarType()
   * Render the selected car type in the summary based on the previous user selections.
   * car types: normalTaxiEconomy, electricEconomy
   */
  renderSummarySelectedCarType() {
    return (
      <View
        style={{
          height: 350,
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
              borderTopLeftRadius: Platform.OS === 'android' ? 169 : 200,
              borderBottomLeftRadius: /^bikes$/i.test(
                this.props.App.carTypeSelected,
              )
                ? Platform.OS === 'android'
                  ? 90
                  : 200
                : Platform.OS === 'android'
                ? 170
                : 200,
              resizeMode: 'contain',
            }}
          />
        </View>
        <View
          style={{
            width: 120,
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
                fontSize: RFValue(15),
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextRegular'
                    : 'Uber Move Text',
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
          {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent) ? (
            <View style={{flexDirection: 'row'}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <IconEntypo name="user" size={15} />
                <Text
                  style={[
                    {
                      fontSize: RFValue(17),
                      paddingLeft: 5,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                    },
                  ]}>
                  {
                    this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                      .numberOfPassengersSelected
                  }
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 25,
                }}>
                <IconCommunity
                  name="credit-card-outline"
                  size={20}
                  style={{marginRight: 2}}
                />
                <Text
                  style={[
                    {
                      fontSize: RFValue(17),
                      paddingLeft: 0,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
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
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <IconCommunity
                  name="credit-card-outline"
                  size={20}
                  style={{marginRight: 2}}
                />
                <Text
                  style={[
                    {
                      fontSize: RFValue(17.5),
                      paddingLeft: 0,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
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
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#d0d0d0',
            marginTop: 30,
            marginBottom: 20,
            paddingBottom: 30,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={[
              {
                fontSize: RFValue(24),
                color: '#000',
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextBold'
                    : 'Uber Move Bold',
              },
            ]}>
            N${' '}
            {this.props.App.customFareTripSelected !== undefined &&
            this.props.App.customFareTripSelected !== false &&
            this.props.App.customFareTripSelected !== null
              ? this.props.App.customFareTripSelected
              : this.props.App.fareTripSelected}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPressIn={() => this.switchToEnterCustomFare(true)}>
          <Text
            style={[
              {
                flexDirection: 'row',
                textAlign: 'center',
                fontSize: RFValue(14),
                width: '100%',
                paddingTop: 10,
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextLight'
                    : 'Uber Move Text Light',
              },
            ]}>
            <Text>Or </Text>
            <Text
              style={[
                {
                  fontSize: RFValue(18.5),
                  color: '#0D8691',
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextBold'
                      : 'Uber Move Text Bold',
                },
              ]}>
              {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                ? 'Enter a custom fare'
                : 'Enter a custom price'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
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
                            fontSize: RFValue(17),
                            color: '#096ED4',
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
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
                            fontSize: RFValue(15),
                            color: '#b22222',
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
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
                        paddingTop: 5,
                        paddingBottom: 6,
                        marginTop: 5,
                        marginBottom: 10,
                        borderColor: '#096ED4',
                        backgroundColor: '#096ED4',
                        borderRadius: 70,
                      }}>
                      <Text
                        style={[
                          {
                            fontSize: RFValue(17.5),
                            color: '#fff',
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'MoveMedium'
                                : 'Uber Move Medium',
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
                          fontSize: RFValue(17),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                        },
                      ]}>
                      {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                        ? 'Right away'
                        : 'Right away'}
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
                          fontSize: RFValue(17),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
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
                          fontSize: RFValue(17),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
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
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      fontSize: RFValue(21),
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
                      top: '8%',
                      height: 140,
                    }}>
                    {/**ECONOMY */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
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
                                    //?Auto choose the first car
                                    this.handleChooseCarType(
                                      vehicle.car_type,
                                      vehicle.base_fare,
                                      /normalTaxiEconomy/i.test(
                                        vehicle.car_type,
                                      )
                                        ? this.props.App.carImageNormalRide
                                        : this.props.App.carIconElectricRode,
                                      vehicle.app_label,
                                    );
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
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextRegular'
                                                    : 'Uber Move Text',
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
                                                fontSize: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? RFValue(20)
                                                  : RFValue(15),
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextMedium'
                                                    : 'Uber Move Text Medium',
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
                                              : `${
                                                  vehicle.availability[0] !==
                                                    undefined &&
                                                  vehicle.availability[0] !==
                                                    null
                                                    ? vehicle.availability[0].toUpperCase()
                                                    : 'Unavailable'
                                                }` +
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(17),
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Oups, something's wrong, please try again.
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            fontSize: RFValue(17),
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
                        justifyContent: 'center',
                        alignItems: 'center',
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
                                              ? Platform.OS === 'android'
                                                ? 169
                                                : 200
                                              : Platform.OS === 'android'
                                              ? 179
                                              : 200,
                                            borderBottomLeftRadius: /comfortNormalRide/i.test(
                                              vehicle.car_type,
                                            )
                                              ? Platform.OS === 'android'
                                                ? 170
                                                : 200
                                              : Platform.OS === 'android'
                                              ? 175
                                              : 195,
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
                                                fontSize: RFValue(15),
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextRegular'
                                                    : 'Uber Move Text',
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
                                                fontSize: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? RFValue(20)
                                                  : RFValue(15),
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextMedium'
                                                    : 'Uber Move Text Medium',
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
                                              : `${
                                                  vehicle.availability[0] !==
                                                    undefined &&
                                                  vehicle.availability[0] !==
                                                    null
                                                    ? vehicle.availability[0].toUpperCase()
                                                    : 'Unavailable'
                                                }` +
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(17),
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Oups, something's wrong, please try again.
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            fontSize: RFValue(17),
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
                                                fontSize: RFValue(15),
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextRegular'
                                                    : 'Uber Move Text',
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
                                                fontSize: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? RFValue(20)
                                                  : RFValue(15),
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextMedium'
                                                    : 'Uber Move Text Medium',
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
                                              : `${
                                                  vehicle.availability[0] !==
                                                    undefined &&
                                                  vehicle.availability[0] !==
                                                    null
                                                    ? vehicle.availability[0].toUpperCase()
                                                    : 'Unavailable'
                                                }` +
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(17),
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Oups, something's wrong, please try again.
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            fontSize: RFValue(17),
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
                      onPress={() => {
                        //? Gather Ad analytics *************************************************
                        if (
                          this.props.App.ad_vars !== undefined &&
                          this.props.App.ad_vars !== null &&
                          this.props.App.ad_vars.compaign_id !== undefined &&
                          this.props.App.ad_vars.compaign_id !== null
                        ) {
                          this.props.App.socket.emit(
                            'gatherAdsManagerAnalytics_io',
                            {
                              user_fingerprint: this.props.App.user_fingerprint,
                              user_nature: 'rider',
                              screen_identifier:
                                'BottomInBooking_PaymentMethods',
                              company_identifier: this.props.App.ad_vars
                                .company_id,
                              campaign_identifier: this.props.App.ad_vars
                                .compaign_id,
                            },
                          );
                        }
                        //? *********************************************************************
                        InteractionManager.runAfterInteractions(() => {
                          this.props.UpdateErrorModalLog(
                            true,
                            'show_preferedPaymentMethod_modal',
                            'any',
                          );
                        });
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                        paddingRight: 15,
                        paddingLeft: 0,
                      }}>
                      <IconMaterialIcons
                        name="credit-card"
                        size={24}
                        style={{marginRight: 3}}
                      />
                      <Text
                        style={[
                          {
                            fontSize: RFValue(18.5),
                            color: '#0D8691',
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
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
                      <Image
                        source={require('../../Media_assets/Images/user-3.png')}
                        style={{width: 13, height: 13, marginRight: 4}}
                      />
                      <Text
                        style={[
                          {
                            fontSize: RFValue(18),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
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
                      flex: 1,
                    }}>
                    <IconFeather
                      name="clock"
                      size={16}
                      style={{marginRight: 3}}
                    />
                    <Text
                      style={[
                        {
                          fontSize: RFValue(16),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
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
                    this.props.App.pricingVariables.carTypesPricingMetada.filter(
                      (vehicle) => /^available$/i.test(vehicle.availability),
                    ).length > 0
                      ? this.props.parentNodeHome.rerouteBookingProcessFlow(
                          'next',
                          'RIDE',
                        )
                      : {}
                  }
                  style={{
                    opacity:
                      this.props.App.pricingVariables.carTypesPricingMetada.filter(
                        (vehicle) => /^available$/i.test(vehicle.availability),
                      ).length > 0
                        ? 1
                        : 0.2,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    width: '90%',
                  }}>
                  <View style={[styles.bttnGenericTc]}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(21),
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
                        justifyContent: 'center',
                        alignItems: 'center',
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
                                    //?Auto choose the first car
                                    this.handleChooseCarType(
                                      vehicle.car_type,
                                      vehicle.base_fare,
                                      /electricBikes/i.test(vehicle.car_type)
                                        ? this.props.App.bikesdeliveryElectric
                                        : this.props.App.bikesdeliveryNormal,
                                      vehicle.app_label,
                                    );
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
                                            borderBottomLeftRadius: /electricBikes/i.test(
                                              vehicle.car_type,
                                            )
                                              ? 150
                                              : Platform.OS === 'android'
                                              ? 40
                                              : 10,
                                            top: 5,
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
                                                fontSize: RFValue(14),
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextRegular'
                                                    : 'Uber Move Text',
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
                                                fontSize: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? RFValue(20)
                                                  : RFValue(15),
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextMedium'
                                                    : 'Uber Move Text Medium',
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
                                              : `${
                                                  vehicle.availability[0] !==
                                                    undefined &&
                                                  vehicle.availability[0] !==
                                                    null
                                                    ? vehicle.availability[0].toUpperCase()
                                                    : 'Unavailable'
                                                }` +
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(17),
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Oups, something's wrong, please try again.
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            ffontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            fontSize: RFValue(17),
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
                        justifyContent: 'center',
                        alignItems: 'center',
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
                                              ? Platform.OS === 'android'
                                                ? 169
                                                : 210
                                              : 179,
                                            borderBottomLeftRadius: /carDelivery/i.test(
                                              vehicle.car_type,
                                            )
                                              ? Platform.OS === 'android'
                                                ? 170
                                                : 210
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
                                                fontSize: RFValue(14),
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextRegular'
                                                    : 'Uber Move Text',
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
                                                fontSize: /^available$/i.test(
                                                  vehicle.availability,
                                                )
                                                  ? RFValue(20)
                                                  : RFValue(15),
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextMedium'
                                                    : 'Uber Move Text Medium',
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
                                              : `${
                                                  vehicle.availability[0] !==
                                                    undefined &&
                                                  vehicle.availability[0] !==
                                                    null
                                                    ? vehicle.availability[0].toUpperCase()
                                                    : 'Unavailable'
                                                }` +
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(17),
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            Oups, something's wrong, please try again.
                          </Text>
                        )
                      ) : (
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            fontSize: RFValue(17),
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
                        size={24}
                        style={{marginRight: 3}}
                      />
                      <Text
                        style={[
                          {
                            fontSize: RFValue(18.5),
                            color: '#0D8691',
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                          },
                        ]}>
                        {this.props.parentNodeHome.ucFirst(
                          this.props.App.wallet_state_vars
                            .selectedPayment_method,
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.App.pricingVariables.carTypesPricingMetada.filter(
                        (vehicle) => /^available$/i.test(vehicle.availability),
                      ).length > 0
                        ? this.rideTypeToSchedulerTransistor(true)
                        : {}
                    }
                    style={{
                      opacity:
                        this.props.App.pricingVariables.carTypesPricingMetada.filter(
                          (vehicle) =>
                            /^available$/i.test(vehicle.availability),
                        ).length > 0
                          ? 1
                          : 0.2,
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
                          fontSize: RFValue(16),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
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
                    this.props.App.pricingVariables.carTypesPricingMetada.filter(
                      (vehicle) => /^available$/i.test(vehicle.availability),
                    ).length > 0
                      ? this.props.parentNodeHome.rerouteBookingProcessFlow(
                          'next',
                          'DELIVERY',
                        )
                      : {}
                  }
                  style={{
                    opacity:
                      this.props.App.pricingVariables.carTypesPricingMetada.filter(
                        (vehicle) => /^available$/i.test(vehicle.availability),
                      ).length > 0
                        ? 1
                        : 0.2,
                    borderWidth: 1,
                    borderColor: 'transparent',
                    width: '90%',
                  }}>
                  <View style={[styles.bttnGenericTc]}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(21),
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
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: '1.5%',
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
            <IconMaterialIcons name="info" size={18} color={'#1a1a1a'} />
            <View style={{marginLeft: 5}}>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextLight'
                      : 'Uber Move Text Light',
                  fontSize: RFValue(13),
                }}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                  }}>
                  N$5
                </Text>{' '}
                pickup fee included.
              </Text>
              {this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                .isGoingUntilHome ? (
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    color: '#0e8491',
                    fontSize: RFValue(13),
                  }}>
                  Going until home.
                </Text>
              ) : (
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    color: '#0e8491',
                    fontSize: RFValue(13),
                  }}>
                  Not going until home.
                </Text>
              )}
            </View>
          </View>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              height: 100,
            }}>
            <TouchableOpacity
              onPress={() => {
                //Cancel any previous interval
                clearInterval(this.props.App._TMP_INTERVAL_PERSISTER);
                this.props.App._TMP_INTERVAL_PERSISTER = null;
                //...
                this.connectToTaxiGenericButtonAction(
                  /RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                    ? 'RIDE'
                    : 'DELIVERY',
                );
              }}
              style={{
                borderWidth: 1,
                borderColor: 'transparent',
                width: '90%',
              }}>
              <View style={[styles.bttnGenericTc, {alignItems: 'center'}]}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextBold'
                        : 'Uber Move Text Bold',
                    fontSize: RFValue(19),
                    color: '#fff',
                    flex: 1,
                    textAlign: 'center',
                  }}>
                  {/RIDE/i.test(this.props.App.bottomVitalsFlow.flowParent)
                    ? 'Connect to your ride'
                    : 'Request for delivery'}
                </Text>
                <IconAnt name="arrowright" color={'#fff'} size={26} />
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
                placeholderTextColor="#AFAFAF"
                placeholder="Enter your fare here"
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
                    fontSize: RFValue(19),
                    padding: 15,
                    paddingLeft: 0,
                    paddingTop: 0,
                    paddingBottom: 5,
                    height: 50,
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
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
                <IconMaterialIcons
                  name="info"
                  size={19}
                  style={{marginRight: 4}}
                />
                <Text
                  style={[
                    {
                      fontSize: RFValue(15),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                    },
                  ]}>
                  Your minimum fare is{' '}
                  <Text
                    style={[
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextBold'
                            : 'Uber Move Text Bold',
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
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(21),
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
                        width: 115,
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
                            fontSize: RFValue(14),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
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
                        width: 115,
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
                          {
                            color: '#fff',
                            fontSize: RFValue(14),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                          },
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
      UpdatePreferredPayment_method,
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
    borderRadius: 3,
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

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(RenderRideTypeBottomVitals),
);
