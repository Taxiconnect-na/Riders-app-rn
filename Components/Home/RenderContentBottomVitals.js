import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  View,
  Text,
  Animated as AnimatedNative,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Switch,
  Easing,
  InteractionManager,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
//import this.props.App.carIcon from './caradvanced.png';      //Option 1
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import PhoneNumberInput from '../Modules/PhoneNumberInput/Components/PhoneNumberInput';
//Import of action creators
import {
  UpdateProcessFlowState,
  UpdateNumberOfPassengersSelected,
  UpdateAdditionalPickupNote,
  UpdateDeliveryPackageSize,
  UpdateRiderOrPackagePossesserSwitcher,
  ValidateReceiverInfosForDelivery,
  UpdateErrorMessagesStateInputRecDelivery,
  UpdateReceiverNameOnType,
} from '../Redux/HomeActionsCreators';
import RenderRideTypeBottomVitals from './RenderRideTypeBottomVitals';
import {RFValue} from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';

/**
 * @class RenderContentBottomVitals()
 * Responsible for rendering the specific content of the bottom vitals node
 * Current flow step:
 * ? RIDE
 * mainView : when no actions had been taken,
 * [noGPRS : when the gprs is off,]
 * selectRideOrDelivery: when selecting ride or delivery,
 * identifyLocation: when checking if taxi rank or private location,
 * selectNoOfPassengers: when selecting the number of passenger for the ride, etc... ADD AS THE DEVELOPMENT PROGRESSES
 * addMoreTripDetails: when adding more details about the trip
 * selectConnectMeOrUs: when selecting between connectMe and connectUs
 * selectCarTypeAndPaymentMethod: when selecting the car type (economy, luxury, etc) and sepcifying the payment method (defautl: wallet)
 * confirmFareAmountORCustomize: after evenrything, summary where a user can customize the fare amount or not.
 * ? DELIVERY
 * inputReceiverInformations: When entering the details about the receiver : name and phone number
 * selectCarTypeAndPaymentMethod: When selecting the vehicle type for the delivery
 */
class RenderContentBottomVitals extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      pickupNote: '', //To hold the additional ride/delivery note
      receiverName: '', //To hold the receiver's name information.
    };
  }

  /**
   * @func findPreviewRouteToDestination
   * Responsible for requesting the route to destination.
   */
  findPreviewRouteToDestination() {
    //Check if a custom pickup location was specified
    //Point to current location by default
    let org_latitude = this.props.App.latitude;
    let org_longitude = this.props.App.longitude;
    //Check forr custom pickup
    if (
      this.props.App.search_pickupLocationInfos
        .isBeingPickedupFromCurrentLocation === false &&
      this.props.App.search_pickupLocationInfos.passenger0Destination !== false
    ) {
      org_latitude = this.props.App.search_pickupLocationInfos
        .passenger0Destination.coordinates[1];
      org_longitude = this.props.App.search_pickupLocationInfos
        .passenger0Destination.coordinates[0];
    }

    let previewTripRouteData = {
      user_fingerprint: this.props.App.user_fingerprint,
      org_latitude: org_latitude,
      org_longitude: org_longitude,
      dest_latitude: this.props.App.search_passengersDestinations
        .passenger1Destination.coordinates[1],
      dest_longitude: this.props.App.search_passengersDestinations
        .passenger1Destination.coordinates[0],
    };
    //..
    this.props.App.socket.emit(
      'getRoute_to_destinationSnapshot',
      previewTripRouteData,
    );
  }

  /**
   * @func renderIdentifiedLocationType()
   * Responsible for rendering the identified location type (taxi rank or private location) after computing
   */
  renderIdentifiedLocationType() {
    if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .locationTypeIdentified !== false
    ) {
      //True identified
      this.revealIdentifiedLocationOnReady();
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
                paddingBottom: 10,
              }}>
              <View style={styles.borderIconLocationType}>
                <Image
                  source={this.props.App.taxiRankIco}
                  style={{resizeMode: 'contain', width: '60%', height: '60%'}}
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
                      fontSize: RFValue(18.5),
                      paddingBottom: 7,
                      color: '#0D8691',
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                    },
                  ]}>
                  Taxi Rank
                </Text>
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
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                    }}>
                    +N$5
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
                onPress={() =>
                  this.props.parentNode.rerouteBookingProcessFlow(
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
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(21),
                        color: '#fff',
                      },
                    ]}>
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
                paddingBottom: 10,
              }}>
              <View style={[styles.borderIconLocationType]}>
                <Image
                  source={this.props.App.privateLocationIco}
                  style={{resizeMode: 'contain', width: '60%', height: '60%'}}
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
                      fontSize: RFValue(18.5),
                      paddingBottom: 7,
                      color: '#0D8691',
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                    },
                  ]}>
                  Private location
                </Text>
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
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                    }}>
                    +N$5
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
                onPress={() =>
                  this.props.parentNode.rerouteBookingProcessFlow(
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
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(21),
                        color: '#fff',
                      },
                    ]}>
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
                paddingBottom: 10,
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
                      fontSize: RFValue(18.5),
                      paddingBottom: 7,
                      color: '#0D8691',
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                    },
                  ]}>
                  Airport
                </Text>
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
                onPress={() =>
                  this.props.parentNode.rerouteBookingProcessFlow(
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
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(21),
                        color: '#fff',
                      },
                    ]}>
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
                fontSize: RFValue(17.5),
                bottom: 25,
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextRegular'
                    : 'Uber Move Text',
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
        //Initial request of the location nature
        globalObject.props.App.socket.emit('getPickupLocationNature', {
          latitude: globalObject.props.App.latitude,
          longitude: globalObject.props.App.longitude,
          user_fingerprint: globalObject.props.App.user_fingerprint,
        });
        //...
        this.props.App._TMP_INTERVAL_PERSISTER = setInterval(function () {
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
          }
        }, this.props.App._TMP_INTERVAL_PERSISTER_TIME - 1500);
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
      ]).start(() => {
        globalObject.props.parentNode.resetAnimationLoader();
      });
    }
  }

  /**
   * @func initialTouchForRideOrDelivery()
   * Responsible for reshaping the bottom vitals when the user press on the virgin component for the first time.
   * Make the initial content fade and show the 2 choices screen
   * mainView -> selectRideOrDelivery
   */
  initialTouchForRideOrDelivery() {
    let globalObject = this;
    InteractionManager.runAfterInteractions(() => {
      //Fade the origin content
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
          parentTHIS: globalObject.props.parentNode,
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
    });
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
    if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .numberOfPassengersSelected === 1
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
                    fontSize: RFValue(19.5),
                    color: '#fff',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(19.5),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(19.5),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                      fontSize: RFValue(19.5),
                      color: '#000',
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
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
        .numberOfPassengersSelected === 2
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
                    fontSize: RFValue(19.5),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(19.5),
                    color: '#fff',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(19.5),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                      fontSize: RFValue(19.5),
                      color: '#000',
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
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
        .numberOfPassengersSelected === 3
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
                    fontSize: RFValue(19.5),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(19.5),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(19.5),
                    color: '#fff',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                      fontSize: RFValue(19.5),
                      color: '#000',
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
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
        .numberOfPassengersSelected === 4
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
                    fontSize: RFValue(19.5),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(19.5),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(19.5),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(19.5),
                    color: '#fff',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
   * @func _updatePickupNoteVars
   * Responsible for updating the pickup note for rides or deliveries and all UI interfaces related
   * @param text: text typed
   * Change Skip button to next if text entered.
   */
  _updatePickupNoteVars(text) {
    //? Update the note state
    this.setState({pickupNote: text});
    //Only if text detected.
    this.props.UpdateAdditionalPickupNote(text);
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
                fontSize: RFValue(18),
                color: '#000',
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
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
                    width: '100%',
                    textAlign: 'center',
                    fontSize: RFValue(18),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(16),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
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
                  fontSize: RFValue(16),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
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
                    width: '100%',
                    textAlign: 'center',
                    fontSize: RFValue(18),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                    fontSize: RFValue(16),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
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
                  fontSize: RFValue(16),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
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
              fontSize: RFValue(18),
              color: '#000',
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextMedium'
                  : 'Uber Move Text Medium',
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

  //DEBUG DATA
  //this.props.App.bottomVitalsFlow.flowParent = 'DELIVERY';
  //this.props.App.bottomVitalsFlow.currentStep = 'addMoreTripDetails';
  //DEBUG DATA
  customRenderOrderer() {
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
            onPressIn={() =>
              this.props.App.gprsGlobals.hasGPRSPermissions
                ? this.initialTouchForRideOrDelivery()
                : {}
            }
            style={{height: '100%'}}>
            <View
              style={{
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconMaterialIcons name="keyboard-arrow-up" size={25} />
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                paddingBottom: 30,
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
                  <Text
                    style={[
                      {
                        fontSize: RFValue(22),
                        color: '#000',
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        bottom: 5,
                        flex: 1,
                        textAlign: 'center',
                      },
                    ]}>
                    {/your day/i.test(this.props.App.hello2Text)
                      ? `Hi ${this.props.App.username}`
                      : this.props.App.hello2Text}
                  </Text>
                </AnimatedNative.View>
              ) : (
                <AnimatedNative.Text
                  style={[
                    {
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      bottom: 3,
                      fontSize: RFValue(22),
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
      this.props.parentNode.resetAnimationLoader();
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
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={[
                  {
                    fontSize: RFValue(18),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                  },
                ]}>
                You're the boss
              </Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: RFValue(13),
                  color: '#000',
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextLight'
                      : 'Uber Move Text Light',
                }}>
                Choose the wanted service
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
                  this.props.parentNode.rerouteBookingProcessFlow(
                    'next',
                    'DELIVERY',
                  )
                }
                style={[
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
                      style={{width: 45, height: 45}}
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
                      {
                        fontSize: RFValue(20),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextBold'
                            : 'Uber Move Text Bold',
                      },
                    ]}>
                    Delivery
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(13),
                        marginTop: 5,
                        color: '#000',
                        paddingLeft: 8,
                        paddingRight: 5,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextLight'
                            : 'Uber Move Text Light',
                        minHeight: 50,
                      },
                    ]}>
                    Send your packages from one place to another.
                  </Text>
                </View>
              </TouchableOpacity>
              <LinearGradient
                colors={['#fff', '#545454', '#fff']}
                style={{
                  width: 1.8,
                  backgroundColor: 'red',
                  height: 200,
                  marginLeft: '5%',
                  marginRight: '5%',
                }}></LinearGradient>
              {/* Ride */}
              <TouchableOpacity
                onPress={() =>
                  this.props.parentNode.rerouteBookingProcessFlow(
                    'next',
                    'RIDE',
                  )
                }
                style={[
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
                      style={{width: 60, height: 28}}
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
                      {
                        fontSize: RFValue(20),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextBold'
                            : 'Uber Move Text Bold',
                      },
                    ]}>
                    Ride
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(13),
                        marginTop: 5,
                        color: '#000',
                        paddingLeft: 8,
                        paddingRight: 5,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextLight'
                            : 'Uber Move Text Light',
                        minHeight: 50,
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
                height: 50,
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
                    fontSize: RFValue(18),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                  },
                ]}>
                Hey, we're good to go
              </AnimatedNative.Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AnimatedNative.Text
                style={{
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
                  fontSize: RFValue(13),
                  color: '#000',
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextLight'
                      : 'Uber Move Text Light',
                }}>
                We autodected your pickup location
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
      this.props.parentNode.resetAnimationLoader();
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
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AnimatedNative.Text
                style={[
                  {
                    fontSize: RFValue(18),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                  },
                ]}>
                How many are you?
              </AnimatedNative.Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: RFValue(13),
                  color: '#000',
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextLight'
                      : 'Uber Move Text Light',
                }}>
                Number of passengers for the ride
              </Text>
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
                        fontSize: RFValue(15),
                        marginLeft: Platform.OS === 'android' ? 0 : 5,
                        flex: 1,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        color: this.props.App.bottomVitalsFlow
                          .rideOrDeliveryMetadata.isAllgoingToTheSamePlace
                          ? '#0D8691'
                          : '#000',
                      },
                    ]}>
                    {this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                      .isAllgoingToTheSamePlace
                      ? 'All going to the same place.'
                      : 'Not going to the same place.'}
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
                    this.props.parentNode.rerouteBookingProcessFlow(
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
            </View>
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep === 'addMoreTripDetails'
    ) {
      //Preview the route to destination and ETA
      let globalObject = this;
      let initialCondition =
        globalObject.props.App.previewDestinationData
          .originDestinationPreviewData.routePoints === undefined ||
        globalObject.props.App.previewDestinationData
          .originDestinationPreviewData.routePoints === false ||
        globalObject.props.App.previewDestinationData
          .originDestinationPreviewData.routePoints === null;
      //...
      if (this.props.App._TMP_INTERVAL_PERSISTER === null && initialCondition) {
        //Make an initial preview to destination request
        this.findPreviewRouteToDestination();
        //this.props.parentNode.fire_search_animation(); //Fire animation
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
              if (
                globalObject.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints === undefined ||
                globalObject.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints === false ||
                globalObject.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints === null
              ) {
                //Not found yet -make a request
                globalObject.findPreviewRouteToDestination();
              } //Data already received - kill interval
              else {
                if (globalObject.props.App._TMP_INTERVAL_PERSISTER !== null) {
                  clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
                  globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
                  globalObject.props.parentNode.resetAnimationLoader();
                }
              }
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
              globalObject.props.parentNode.resetAnimationLoader();
            }
          }
        }, this.props.App._TMP_INTERVAL_PERSISTER_TIME - 500);
      } else {
        if (globalObject.props.App._TMP_INTERVAL_PERSISTER !== null) {
          clearInterval(globalObject.props.App._TMP_INTERVAL_PERSISTER);
          globalObject.props.App._TMP_INTERVAL_PERSISTER = null;
          globalObject.props.parentNode.resetAnimationLoader();
        }
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
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AnimatedNative.Text
                style={[
                  {
                    fontSize: RFValue(18),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                  },
                ]}>
                {/Ride/i.test(this.props.App.bottomVitalsFlow.flowParent)
                  ? 'Pickup note?'
                  : 'Delivery note?'}
              </AnimatedNative.Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: RFValue(13),
                  color: '#000',
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextLight'
                      : 'Uber Move Text Light',
                }}>
                Let the driver know of your preferences
              </Text>
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
                    top: 20,
                  }}>
                  <TextInput
                    placeholderTextColor="#AFAFAF"
                    placeholder={'Add a note to the driver?'}
                    multiline={true}
                    textAlignVertical={'top'}
                    maxLength={70}
                    onChangeText={(text) => this._updatePickupNoteVars(text)}
                    value={this.state.pickupNote}
                    style={[
                      {
                        borderColor: '#EEEEEE',
                        borderRadius: 1,
                        width: '100%',
                        height: '100%',
                        padding: 15,
                        paddingTop: Platform.OS === 'android' ? 15 : 20,
                        fontSize: RFValue(17),
                        backgroundColor: '#EEEEEE',
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
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
                      {
                        fontSize: RFValue(14),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextLight'
                            : 'Uber Move Text Light',
                      },
                    ]}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                      }}>
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
                    globalObject.props.App.previewDestinationData
                      .originDestinationPreviewData.routePoints !== undefined &&
                    globalObject.props.App.previewDestinationData
                      .originDestinationPreviewData.routePoints !== false &&
                    globalObject.props.App.previewDestinationData
                      .originDestinationPreviewData.routePoints !== null
                      ? this.props.parentNode.rerouteBookingProcessFlow(
                          'next',
                          /RIDE/i.test(
                            this.props.App.bottomVitalsFlow.flowParent,
                          )
                            ? 'RIDE'
                            : 'DELIVERY',
                        )
                      : globalObject.findPreviewRouteToDestination()
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
      this.props.parentNode.resetAnimationLoader();
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
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={[
                  {
                    fontSize: RFValue(18),
                    color: '#000',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                  },
                ]}>
                Private or shared?
              </Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: RFValue(13),
                  color: '#000',
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextLight'
                      : 'Uber Move Text Light',
                }}>
                We can handle your convenience
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
                  this.props.parentNode.rerouteBookingProcessFlow(
                    'next',
                    'RIDE',
                    'ConnectMe',
                  )
                }
                style={[
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
                    width: 70,
                    height: 70,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 300,
                    borderColor: '#f6f6f6',
                    backgroundColor: '#f6f6f6',
                    top: 10,
                  }}>
                  <Image
                    source={require('../../Media_assets/Images/user-3.png')}
                    style={{
                      resizeMode: 'contain',
                      width: '50%',
                      height: '50%',
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                  }}>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(19),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextBold'
                            : 'Uber Move Text Bold',
                      },
                    ]}>
                    ConnectMe
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(13),
                        marginTop: 3,
                        color: '#096ED4',
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                      },
                    ]}>
                    Private booking
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(13),
                        marginTop: 15,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextLight'
                            : 'Uber Move Text Light',
                      },
                    ]}>
                    From{' '}
                    <Text
                      style={[
                        {
                          fontSize: RFValue(14),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                        },
                      ]}>
                      N$45
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
              <LinearGradient
                colors={['#fff', '#545454', '#fff']}
                style={{
                  width: 1.8,
                  backgroundColor: 'red',
                  height: 200,
                  marginLeft: '5%',
                  marginRight: '5%',
                }}></LinearGradient>
              {/* ConnectUs */}
              <TouchableOpacity
                onPress={() =>
                  this.props.parentNode.rerouteBookingProcessFlow(
                    'next',
                    'RIDE',
                    'ConnectUs',
                  )
                }
                style={[
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
                    width: 70,
                    height: 70,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 300,
                    borderColor: '#f6f6f6',
                    backgroundColor: '#f6f6f6',
                    top: 10,
                  }}>
                  <Image
                    source={require('../../Media_assets/Images/user-2.png')}
                    style={{
                      resizeMode: 'contain',
                      width: '60%',
                      height: '60%',
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                  }}>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(19),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextBold'
                            : 'Uber Move Text Bold',
                      },
                    ]}>
                    ConnectUs
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(13),
                        marginTop: 3,
                        color: '#096ED4',
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                      },
                    ]}>
                    Shared booking
                  </Text>
                  <Text
                    style={[
                      {
                        marginTop: 15,
                        fontSize: RFValue(14),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                      },
                    ]}>
                    Normal
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
      //Request for fare estimation from the server - PROD
      if (
        this.props.App.pricingVariables.didPricingReceivedFromServer !== false
      ) {
        this.props.parentNode.resetAnimationLoader();
      } //? Only call if the prices where not received yet
      else {
        this.props.parentNode.getFareEstimation();
      }

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
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {this.props.App.pricingVariables.didPricingReceivedFromServer
                ? this.renderTitlePartSelectRideScheduler()
                : null}
            </View>
            {this.props.App.pricingVariables.didPricingReceivedFromServer ? (
              <RenderRideTypeBottomVitals
                parentNode={this}
                parentNodeHome={this.props.parentNode}
              />
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
                      fontSize: RFValue(17),
                      bottom: 25,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
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
      this.props.parentNode.resetAnimationLoader();
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
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {this.renderTitlePartSelectRideScheduler('summary')}
            </View>
            {this.props.App.isEnterCustomFareWindowOn ? (
              <RenderRideTypeBottomVitals
                parentNode={this}
                parentNodeHome={this.props.parentNode}
                customStep={'enterCustomFare'}
              />
            ) : (
              <RenderRideTypeBottomVitals
                parentNode={this}
                parentNodeHome={this.props.parentNode}
                customStep={'summary'}
              />
            )}
          </View>
        </AnimatedNative.View>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep ===
      'inputReceiverInformations'
    ) {
      this.props.parentNode.resetAnimationLoader();
      return (
        <SafeAreaView style={{flex: 1}}>
          <AnimatedNative.View
            style={{
              backgroundColor: '#fff',
              flex: 1,
              padding: 20,
              paddingTop: Platform.OS === 'android' ? 20 : '2%',
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
                this.props.parentNode.rerouteBookingProcessFlow(
                  'previous',
                  'DELIVERY',
                )
              }>
              <IconAnt name="arrowleft" size={28} />
            </TouchableOpacity>
            <Text
              style={[
                {
                  marginTop: 15,
                  marginBottom: 25,
                  fontSize: RFValue(21),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                },
              ]}>
              Who's receiving the package?
            </Text>
            <View style={{marginBottom: '13%'}}>
              <TextInput
                placeholderTextColor="#AFAFAF"
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
                onChangeText={(text) => {
                  this.setState({receiverName: text});
                  this.props.UpdateReceiverNameOnType(text);
                }}
                value={this.state.receiverName}
                style={[
                  {
                    borderBottomWidth: 1.5,
                    fontSize: RFValue(19),
                    paddingLeft: 0,
                    paddingBottom: 5,
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                  },
                ]}
              />
              {this.props.App.errorReceiverNameShow ? (
                <Text
                  style={[
                    {
                      color: '#b22222',
                      fontSize: RFValue(14),
                      top: 11,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                    },
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
              <View
                style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                <Text
                  style={[
                    {
                      fontSize: RFValue(13),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                    },
                  ]}>
                  The <Text style={{color: '#0e8491'}}>receiver can track</Text>{' '}
                  the delivery of the package{' '}
                  <Text style={{color: '#0e8491'}}>in real-time</Text>.
                </Text>
              </View>
              {this.props.App.renderCountryCodeSeacher === false ? (
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.ValidateReceiverInfosForDelivery()
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
              ) : null}
            </View>
          </AnimatedNative.View>
        </SafeAreaView>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep === 'selectPackageSize'
    ) {
      this.props.parentNode.resetAnimationLoader();
      return (
        <SafeAreaView style={{flex: 1}}>
          <AnimatedNative.View
            style={{
              backgroundColor: '#fff',
              flex: 1,
              padding: 20,
              paddingTop: Platform.OS === 'android' ? 20 : '2%',
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
                this.props.parentNode.rerouteBookingProcessFlow(
                  'previous',
                  'DELIVERY',
                )
              }>
              <IconAnt name="arrowleft" size={28} />
            </TouchableOpacity>
            <Text
              style={[
                {
                  marginTop: 15,
                  marginBottom: 25,
                  fontSize: RFValue(21),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
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
                  }}>
                  <IconFeather
                    name="box"
                    color={
                      /envelope/i.test(
                        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                          .selectedPackageSize,
                      )
                        ? '#0D8691'
                        : '#000'
                    }
                    size={24}
                  />
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
                      {
                        fontSize: RFValue(17),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        color: /envelope/i.test(
                          this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                            .selectedPackageSize,
                        )
                          ? '#0D8691'
                          : '#000',
                      },
                    ]}>
                    Small package
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(15.5),
                        color: '#757575',
                        marginTop: 5,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                      },
                    ]}>
                    24cm x 25cm
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
                      size={23}
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
                  }}>
                  <IconFeather
                    name="package"
                    color={
                      /small/i.test(
                        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                          .selectedPackageSize,
                      )
                        ? '#0D8691'
                        : '#000'
                    }
                    size={24}
                  />
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
                      {
                        fontSize: RFValue(17),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        color: /small/i.test(
                          this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                            .selectedPackageSize,
                        )
                          ? '#0D8691'
                          : '#000',
                      },
                    ]}>
                    Medium package
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(15.5),
                        color: '#757575',
                        marginTop: 5,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                      },
                    ]}>
                    47cm x 68cm x 50cm
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
                  <IconCommunity
                    name="package"
                    color={
                      /large/i.test(
                        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                          .selectedPackageSize,
                      )
                        ? '#0D8691'
                        : '#000'
                    }
                    size={24}
                  />
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
                      {
                        fontSize: RFValue(17),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        color: /large/i.test(
                          this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
                            .selectedPackageSize,
                        )
                          ? '#0D8691'
                          : '#000',
                      },
                    ]}>
                    Large package
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(15.5),
                        color: '#757575',
                        marginTop: 5,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                      },
                    ]}>
                    62cm x 46cm x 76cm
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
              <View
                style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                <Text
                  style={{
                    fontSize: RFValue(13),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                  }}>
                  Select the right package size for a{' '}
                  <Text style={{color: '#0e8491'}}>
                    better delivery handling experience
                  </Text>
                  .
                </Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={() =>
                    this.props.parentNode.rerouteBookingProcessFlow(
                      'next',
                      'DELIVERY',
                    )
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
        </SafeAreaView>
      );
    } else if (
      this.props.App.bottomVitalsFlow.currentStep ===
      'selectCarTypeAndPaymentMethodDelivery'
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
                height: 40,
                paddingTop: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {this.renderTitlePartSelectRideScheduler()}
            </View>
            <RenderRideTypeBottomVitals
              parentNode={this}
              parentNodeHome={this.props.parentNode}
              customStep={'delivery'}
            />
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(17.5),
                }}>
                Unable to make the request
              </Text>
            </View>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextRegular'
                    : 'Uber Move Text',
                fontSize: RFValue(17),
              }}>
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

  render() {
    return <>{this.customRenderOrderer()}</>;
  }
}

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdateProcessFlowState,
      UpdateNumberOfPassengersSelected,
      UpdateAdditionalPickupNote,
      UpdateDeliveryPackageSize,
      UpdateRiderOrPackagePossesserSwitcher,
      ValidateReceiverInfosForDelivery,
      UpdateErrorMessagesStateInputRecDelivery,
      UpdateReceiverNameOnType,
    },
    dispatch,
  );

const styles = StyleSheet.create({
  window: {
    flex: 1,
  },
  loader: {
    borderTopWidth: 3,
    width: 20,
    marginBottom: 10,
  },
  shadowRideOrDeliveryNodes: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8.65,

    elevation: 4,
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
    borderRadius: 3, //Was 200
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
    width: 75,
    height: 75,
    bottom: 10,
    borderWidth: 1.5,
    borderRadius: 100,
    borderColor: '#000',
    backgroundColor: '#fff',
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

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(RenderContentBottomVitals),
);
