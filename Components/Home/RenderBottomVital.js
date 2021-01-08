/* eslint-disable prettier/prettier */
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
  ActivityIndicator,
  Switch,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
//import this.props.App.carIcon from './caradvanced.png';      //Option 1
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import PhoneNumberInput from '../Modules/PhoneNumberInput/Components/PhoneNumberInput';
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
import RenderContentBottomVitals from './RenderContentBottomVitals';

/**
 * @class RenderBottomVital()
 * Responsible for rendering the bottom part of the user interface responsible for vital things like requesting the ride, etc.
 */
class RenderBottomVital extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  customRenderOrderer() {
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
            <RenderContentBottomVitals parentNode={this.props.parentNode} />
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

export default connect(mapStateToProps, mapDispatchToProps)(RenderBottomVital);
