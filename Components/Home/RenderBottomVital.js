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
  TextInput,
  Easing,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
//import this.props.App.carIcon from './caradvanced.png';      //Option 1
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
//Import of action creators
import {
  UpdateRiderOrPackagePossesserSwitcher,
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
                    top: -75,
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
                        onPress={() =>
                          this.props.parentNode.recalibrateMap(true)
                        }
                        style={{
                          width: 53,
                          height: 53,
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
              Platform.OS === 'android'
                ? styles.shadowBottomVitals
                : this.props.App.gprsGlobals.hasGPRSPermissions
                ? styles.shadowBottomVitalsIOS
                : styles.shadowBottomVitalsNULL,
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
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'Allrounder-Grotesk-Medium'
                              : 'Allrounder Grotesk Medium',
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
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'Allrounder-Grotesk-Book'
                                : 'Allrounder Grotesk Book',
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
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'Allrounder-Grotesk-Book'
                                : 'Allrounder Grotesk Book',
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'Allrounder-Grotesk-Regular'
                                  : 'Allrounder Grotesk',
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
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'Allrounder-Grotesk-Book'
                            : 'Allrounder Grotesk Book',
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
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'Allrounder-Grotesk-Book'
                              : 'Allrounder Grotesk Book',
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
              <IconMaterialIcons name="shield" color="#096ED4" size={30} />
            </TouchableOpacity>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: 20,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  backgroundColor: '#f0f0f0',
                  width: '100%',
                  padding: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopLeftRadius: 7,
                  borderTopRightRadius: 7,
                  borderColor: '#d0d0d0',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.27,
                  shadowRadius: 4.65,

                  elevation: 6,
                }}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'Allrounder-Grotesk-Medium'
                        : 'Allrounder Grotesk Medium',
                    color: '#000',
                    fontSize: 17.5,
                    flex: 1,
                  }}>
                  {this.props.App.generalTRIP_details_driverDetails.eta !==
                    null &&
                  this.props.App.generalTRIP_details_driverDetails.eta !==
                    false &&
                  this.props.App.generalTRIP_details_driverDetails.eta !==
                    undefined
                    ? this.props.App.generalTRIP_details_driverDetails.eta
                    : 'Driver on his way'}
                </Text>
              </View>
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
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
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
                      borderWidth: 0.5,
                      borderColor: '#f0f0f0',
                      backgroundColor: '#fff',
                      width: 65,
                      height: 65,
                      borderRadius: 150,
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,

                      elevation: 3,
                    }}>
                    <Image
                      source={require('../../Media_assets/Images/driver.jpg')}
                      style={{
                        resizeMode: 'cover',
                        width: '100%',
                        height: '100%',
                        borderRadius: 150,
                      }}
                    />
                  </View>
                  <View style={{marginLeft: 7, flex: 1}}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'Allrounder-Grotesk-Medium'
                            : 'Allrounder Grotesk Medium',
                        fontSize: 19,
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
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'Allrounder-Grotesk-Medium'
                              : 'Allrounder Grotesk Medium',
                          fontSize: 19,
                          color: '#096ED4',
                        }}>
                        {this.props.App.generalTRIP_details_driverDetails
                          .carDetails.taxi_number !== false
                          ? this.props.App.generalTRIP_details_driverDetails
                              .carDetails.taxi_number
                          : this.props.App.generalTRIP_details_driverDetails
                              .carDetails.car_brand}
                      </Text>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <IconMaterialIcons
                          name="star"
                          size={17}
                          color="#ffbf00"
                          style={{marginLeft: 7, marginRight: 4}}
                        />
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'Allrounder-Grotesk-Regular'
                                : 'Allrounder Grotesk',
                            fontSize: 18,
                          }}>
                          {
                            this.props.App.generalTRIP_details_driverDetails
                              .driverDetails.global_rating
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 5,
                  }}>
                  <IconMaterialIcons name="arrow-forward-ios" size={15} />
                </View>
              </TouchableOpacity>
            </View>
          </>
        );
      } else if (
        /riderDropoffConfirmation_left/i.test(this.props.App.request_status)
      ) {
        if (
          this.props.App.generalTRIP_details_driverDetails.trip_details ===
            undefined ||
          this.props.App.generalTRIP_details_driverDetails.trip_details
            .ride_mode === undefined
        ) {
          return null;
        }
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
                      fontSize: 17,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'Allrounder-Grotesk-Medium'
                          : 'Allrounder Grotesk Medium',
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
                      paddingTop: 20,
                      paddingBottom: 20,
                    }}>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <View style={{width: 16, height: '87%', top: 6}}>
                          <View style={{position: 'absolute', top: 0}}>
                            <View
                              style={{
                                height: 11,
                                width: 11,
                                borderRadius: 100,
                                backgroundColor: '#000',
                              }}
                            />
                          </View>

                          <View
                            style={{
                              flex: 1,
                              left: 5,
                              width: 1.5,
                              height: 50,
                              backgroundColor: '#000',
                            }}></View>
                          <View style={{position: 'absolute', bottom: -3}}>
                            <View
                              style={{
                                height: 11,
                                width: 11,
                                borderRadius: 0,
                                backgroundColor: '#096ED4',
                              }}
                            />
                          </View>
                        </View>
                        <View style={{flex: 1}}>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <View style={{width: 45}}>
                              <Text
                                style={{
                                  fontFamily:
                                    Platform.OS === 'android'
                                      ? 'Allrounder-Grotesk-Book'
                                      : 'Allrounder Grotesk Book',
                                  fontSize: 15,
                                  top: 2,
                                }}>
                                From
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                alignItems: 'flex-start',
                              }}>
                              <View
                                style={{
                                  flex: 1,
                                  alignItems: 'flex-start',
                                }}>
                                <Text
                                  style={{
                                    fontFamily:
                                      Platform.OS === 'android'
                                        ? 'Allrounder-Grotesk-Medium'
                                        : 'Allrounder Grotesk Medium',
                                    fontSize: 16,
                                    marginLeft: 5,
                                    flex: 1,
                                  }}>
                                  {String(
                                    this.props.App
                                      .generalTRIP_details_driverDetails
                                      .trip_details.pickup_name,
                                  )}
                                </Text>
                              </View>
                            </View>
                          </View>
                          {/**Destination */}
                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: 25,
                            }}>
                            <View style={{width: 45}}>
                              <Text
                                style={{
                                  fontFamily:
                                    Platform.OS === 'android'
                                      ? 'Allrounder-Grotesk-Book'
                                      : 'Allrounder Grotesk Book',
                                  fontSize: 15,
                                  top: 1,
                                }}>
                                To
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                alignItems: 'flex-start',
                              }}>
                              {this.props.App.generalTRIP_details_driverDetails.trip_details.destination_name
                                .split(',')
                                .map((destination, index) => {
                                  return (
                                    <View
                                      key={String(index + 1)}
                                      style={{
                                        flex: 1,
                                        alignItems: 'flex-start',
                                        marginTop: index > 0 ? 5 : 0,
                                      }}>
                                      <Text
                                        style={{
                                          fontFamily:
                                            Platform.OS === 'android'
                                              ? 'Allrounder-Grotesk-Regular'
                                              : 'Allrounder Grotesk',
                                          fontSize: 16,
                                          marginLeft: 5,
                                          flex: 1,
                                        }}>
                                        {this.props.App.generalTRIP_details_driverDetails.trip_details.destination_name.split(
                                          ',',
                                        ).length > 1 ? (
                                          <Text
                                            style={{
                                              fontFamily:
                                                Platform.OS === 'android'
                                                  ? 'Allrounder-Grotesk-Medium'
                                                  : 'Allrounder Grotesk Medium',
                                              fontSize: 15,
                                              marginLeft: 5,
                                              flex: 1,
                                              color: '#096ED4',
                                            }}>
                                            {index + 1 + '. '}
                                          </Text>
                                        ) : null}
                                        {destination.trim()}
                                      </Text>
                                    </View>
                                  );
                                })}
                            </View>
                          </View>
                        </View>
                      </View>
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
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'Allrounder-Grotesk-Medium'
                        : 'Allrounder Grotesk Medium',
                    fontSize: 22.5,
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
                  <ActivityIndicator size="large" color="#0e8491" />
                </View>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'Allrounder-Grotesk-Regular'
                        : 'Allrounder Grotesk',
                    fontSize: 19,
                  }}>
                  Finding you a Taxi
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
      UpdateRiderOrPackagePossesserSwitcher,
      UpdateErrorModalLog,
    },
    dispatch,
  );

const styles = StyleSheet.create({
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
  shadowBottomVitalsIOS: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15.7,
    elevation: 0,
  },
  shadowBottomVitalsNULL: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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

export default connect(mapStateToProps, mapDispatchToProps)(RenderBottomVital);
