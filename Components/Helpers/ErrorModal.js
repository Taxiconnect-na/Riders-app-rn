import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFontisto from 'react-native-vector-icons/Fontisto';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconFeather from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {systemWeights} from 'react-native-typography';
import {AirbnbRating} from 'react-native-ratings';
import {
  ResetGenericPhoneNumberInput,
  UpdateErrorModalLog,
  UpdateUserGenderState,
  UpdateType_rideShown_YourRides_screen,
  UpdateRatingDetailsDuringDropoff_process,
  ResetStateProps,
} from '../Redux/HomeActionsCreators';

class ErrorModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      //Drop off rating metadata
      rating_score: 4, //The rating for the driver selected by the user - default: 4
      compliment_array: {
        neatAndTidy: false,
        excellentService: false,
        greatMusic: false,
        greatConversation: false,
        expertNavigator: false,
      }, //The compliment for the driver selectedd by the user - array of compliment strings - default: [], strings: neatAndTidy, excellentService, greatMusic, greatConversation, expertNavigator
      custom_note: false, //The custom note entered by the user,
      isLoading_something: false, //Responsible for handling any kind of native loader (circle) within the context of this class
    };
  }

  componentDidMount() {
    let globalObject = this;
    /**
     * SOCKET.IO RESPONSES
     */
    //1. Handle request dropoff request response
    this.props.App.socket.on(
      'confirmRiderDropoff_requests_io-response',
      function (response) {
        //Stop the loader and restore
        globalObject.setState({isLoading_something: false});
        if (
          response !== false &&
          response.response !== undefined &&
          response.response !== null
        ) {
          //Reset local drop off related data
          globalObject.setState({
            rating_score: 5,
            compliment_array: {
              neatAndTidy: false,
              excellentService: false,
              greatMusic: false,
              greatConversation: false,
              expertNavigator: false,
            },
            custom_note: false,
            request_fp: false,
          });
          //Received a response
          globalObject.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
          //Reset all the trips
          globalObject.props.ResetStateProps();
        } //error - close the modal
        else {
          globalObject.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
        }
      },
    );

    //2 Handle cancel request response
    this.props.App.socket.on(
      'cancelRiders_request_io-response',
      function (response) {
        //Stop the loader and restore
        globalObject.setState({isLoading_something: false});
        if (
          response !== false &&
          response.response !== undefined &&
          response.response !== null
        ) {
          //Received a response
          globalObject.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
          //Reset all the trips
          globalObject.props.ResetStateProps();
        } //error - close modal
        else {
          globalObject.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
        }
      },
    );
  }

  /**
   * @func confirmRiderDropoff
   * @param request_fp: the request fingerprint
   * Responsible for bundling the request data and requesting for a rider's drop off confirmation.
   */
  confirmRiderDropoff(request_fp) {
    this.setState({isLoading_something: true}); //Activate the loader - and lock the rating, compliment, done button and additional note input
    let dropoff_bundle = {
      user_fingerprint: this.props.App.user_fingerprint,
      dropoff_compliments: this.state.compliment_array,
      dropoff_personal_note: this.state.custom_note,
      rating_score: this.state.rating_score,
      request_fp: request_fp,
    };
    //..
    this.props.App.socket.emit(
      'confirmRiderDropoff_requests_io',
      dropoff_bundle,
    );
  }

  /**
   * @func updateDropOff_medata
   * @param action: the desired action to do
   * @param data: the custom data (start rating, compliment string or custom note)
   * Responsible for updating the drop off data
   */
  updateDropOff_medata(action, data) {
    if (/updateRating/i.test(action)) {
      //Update the rating
      this.setState({
        rating_score: data,
      });
    } else if (/updateCompliment/i.test(action)) {
      //Update the compliment list
      //Auto toggle compliment array depending on whether the compliment was already selected or not
      this.state.compliment_array[data] = !this.state.compliment_array[data];
      console.log(this.state.compliment_array);
      this.forceUpdate();
    }
  }

  /**
   * @func cancelRequest_rider
   * Responsible for cancelling any current request as selected by the user
   */
  cancelRequest_rider() {
    if (
      this.props.App.generalTRIP_details_driverDetails !== undefined &&
      this.props.App.generalTRIP_details_driverDetails !== null &&
      this.props.App.generalTRIP_details_driverDetails !== false
    ) {
      this.setState({isLoading_something: true}); //Activate the loader
      //Bundle the cancel input
      let bundleData = {
        request_fp: this.props.App.generalTRIP_details_driverDetails.request_fp,
        user_fingerprint: this.props.App.user_fingerprint,
      };
      ///...
      this.props.App.socket.emit('cancelRiders_request_io', bundleData);
    } //Invalid request fp - close the modal
    else {
      this.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
    }
  }

  /**
   * @func goBackFUnc
   * @param parentNode: parent of the host class, to do very useful actions like navigate through stack navigations
   * and many more permitted by 'this'
   * Responsible for going back the phone number verification and
   * most importantly reset the validity of the phone number and it's value
   *
   */
  goBackFUnc(parentNode) {
    this.props.ResetGenericPhoneNumberInput();
    parentNode.setState({
      showSendAgain: false,
      otpValue: '',
      showErrorUnmatchedOTP: false,
    }); //Hide send again and show after 30 sec
    parentNode.props.navigation.navigate('PhoneDetailsScreen');
  }

  /**
   * @func skipAddMoreProfileDetails
   * @param parentNode: parent of the host class, to do very useful actions like navigate through stack navigations
   * and many more permitted by 'this'
   * Responsible for going back the phone number verification and
   * most importantly reset the validity of the phone number and it's value
   *
   */
  skipAddMoreProfileDetails(parentNode) {
    this.props.ResetGenericPhoneNumberInput();
    parentNode.setState({
      showSendAgain: false,
      otpValue: '',
      showErrorUnmatchedOTP: false,
    });
    parentNode.props.navigation.navigate('Home');
  }

  /**
   * @func updateYourRidesSHownOnes
   * @param type: Past, Scheduled or Business
   * Responsible for updating the type of ride shown in the "Your rides" tab.
   */
  updateYourRidesSHownOnes(type, parentNode) {
    this.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
    this.props.UpdateType_rideShown_YourRides_screen(type);
    //Update the list of requests from the server
    parentNode.fetchRequestedRequests_history(type);
  }

  /**
   * @func renderModalContent()
   * @param error_status: the identify the error type
   * Render differents modals based on the situation: mainly integrated in the main map for
   * Entering receiver's infos and showing quick safety features.
   */
  renderModalContent(error_status) {
    if (/connection_no_network/i.test(error_status)) {
      //Show delivery input modal
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 260,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconCommunity
              name="network-strength-1-alert"
              size={22}
              style={{marginRight: 5}}
            />
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
              No Internet connection
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Book',
                fontSize: 17,
                marginTop: 10,
              }}>
              It looks like your Internet connection is unavailable, please try
              connecting to a Wi-fi or mobile data point.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ActivityIndicator
                size="small"
                color="#0e8491"
                style={{marginRight: 5}}
              />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 17,
                }}>
                Waiting for Internet connection
              </Text>
            </View>
          </View>
        </View>
      );
    }
    if (/service_unavailable/i.test(error_status)) {
      //Show delivery input modal
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 260,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconCommunity
              name="network-strength-1-alert"
              size={22}
              style={{marginRight: 5}}
            />
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
              Oups, something's wrong
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Book',
                fontSize: 17,
                marginTop: 10,
              }}>
              Sorry, we are unable to establish the connection to TaxiConnect,
              please try again later.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ActivityIndicator
                size="small"
                color="#0e8491"
                style={{marginRight: 5}}
              />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 17,
                }}>
                Establishing connection.
              </Text>
            </View>
          </View>
        </View>
      );
    } else if (/error_checking_user_status_login/i.test(error_status)) {
      //Show delivery input modal
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 300,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconMaterialIcons
              name="error-outline"
              size={22}
              style={{marginRight: 5}}
            />
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
              Something's wrong
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Book',
                fontSize: 17,
                marginTop: 10,
              }}>
              Sorry due to an unexpected error we were unable to move forward
              with the authentication of your phone number, please try again.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() => this.goBackFUnc(this.props.parentNode)}
              style={styles.bttnGenericTc}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 19,
                  color: '#fff',
                }}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/error_checking_otp/i.test(error_status)) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 300,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconMaterialIcons
              name="error-outline"
              size={22}
              style={{marginRight: 5}}
            />
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
              Couldn't check the OTP
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Book',
                fontSize: 17,
                marginTop: 10,
              }}>
              Sorry due to an unexpected error we were unable to move forward
              with the authentication of your OTP, please try again.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() => this.goBackFUnc(this.props.parentNode)}
              style={styles.bttnGenericTc}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 19,
                  color: '#fff',
                }}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/error_creating_account/i.test(error_status)) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 300,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconMaterialIcons
              name="error-outline"
              size={22}
              style={{marginRight: 5}}
            />
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
              Something's wrong
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Book',
                fontSize: 17,
                marginTop: 10,
              }}>
              Sorry due to an unexpected error we were unable to create your
              account, please try again.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() => this.goBackFUnc(this.props.parentNode)}
              style={styles.bttnGenericTc}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 19,
                  color: '#fff',
                }}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/gender_select/i.test(error_status)) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 300,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
              Select your gender
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() => this.props.UpdateUserGenderState('male')}
              style={[
                styles.bttnGenericTc,
                {borderRadius: 2, marginBottom: 10},
              ]}>
              <IconFontisto name="male" size={20} color="#fff" />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 19,
                  color: '#fff',
                  marginLeft: 5,
                }}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.UpdateUserGenderState('female')}
              style={[
                styles.bttnGenericTc,
                {borderRadius: 2, marginBottom: 10},
              ]}>
              <IconFontisto name="female" size={20} color="#fff" />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 19,
                  color: '#fff',
                  marginLeft: 5,
                }}>
                Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bttnGenericTc, {borderRadius: 2}]}
              onPress={() => this.props.UpdateUserGenderState('unknown')}>
              <IconEntypo name="block" size={20} color="#fff" top={10} />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 19,
                  color: '#fff',
                  marginLeft: 5,
                }}>
                Rather not say
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (
      /error_adding_additional_profile_details_new_account/i.test(error_status)
    ) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 300,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconMaterialIcons
              name="error-outline"
              size={22}
              style={{marginRight: 5}}
            />
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
              Something's wrong
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Book',
                fontSize: 17,
                marginTop: 10,
              }}>
              Sorry due to an unexpected error we were unable to update your
              profile information, but no worries you can try again later.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                this.skipAddMoreProfileDetails(this.props.parentNode)
              }
              style={styles.bttnGenericTc}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 19,
                  color: '#fff',
                }}>
                Try again later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/show_select_ride_type_modal/i.test(error_status)) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            //padding: 20,
            height: 300,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              paddingBottom: 5,
            }}>
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Regular', fontSize: 20}}>
              What do you want to see?
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                this.updateYourRidesSHownOnes('Past', this.props.parentNode)
              }
              style={[
                styles.bttnGenericTc,
                {
                  borderRadius: 2,
                  marginBottom: 10,
                  justifyContent: 'flex-start',
                  borderBottomColor: '#d0d0d0',
                  borderBottomWidth: 1,
                  paddingLeft: 20,
                  paddingRight: 20,
                  backgroundColor: '#fff',
                  shadowColor: '#fff',
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0,
                  shadowRadius: 0,

                  elevation: 0,
                },
              ]}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Book',
                  fontSize: 19,
                  color: '#000',
                  marginLeft: 5,
                  flex: 1,
                }}>
                Past rides
              </Text>
              {/past/i.test(this.props.App.shownRides_types) ? (
                <IconFeather name="check" color="#0e8491" size={20} />
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.updateYourRidesSHownOnes(
                  'Scheduled',
                  this.props.parentNode,
                )
              }
              style={[
                styles.bttnGenericTc,
                {
                  borderRadius: 2,
                  marginBottom: 10,
                  justifyContent: 'flex-start',
                  borderBottomColor: '#d0d0d0',
                  borderBottomWidth: 1,
                  paddingLeft: 20,
                  paddingRight: 20,
                  backgroundColor: '#fff',
                  shadowColor: '#fff',
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0,
                  shadowRadius: 0,

                  elevation: 0,
                },
              ]}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Book',
                  fontSize: 19,
                  color: '#000',
                  marginLeft: 5,
                  flex: 1,
                }}>
                Scheduled rides
              </Text>
              {/scheduled/i.test(this.props.App.shownRides_types) ? (
                <IconFeather name="check" color="#0e8491" size={20} />
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.bttnGenericTc,
                {
                  borderRadius: 2,
                  marginBottom: 10,
                  justifyContent: 'flex-start',
                  borderBottomColor: '#d0d0d0',
                  paddingLeft: 20,
                  paddingRight: 20,
                  backgroundColor: '#fff',
                  shadowColor: '#fff',
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0,
                  shadowRadius: 0,

                  elevation: 0,
                },
              ]}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Book',
                  fontSize: 19,
                  color: '#d0d0d0',
                  marginLeft: 5,
                  flex: 1,
                }}>
                Business rides
              </Text>
              {/business/i.test(this.props.App.shownRides_types) ? (
                <IconFeather name="check" color="#0e8491" size={20} />
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/show_modalMore_tripDetails/i.test(error_status)) {
      return (
        <SafeAreaView
          style={{
            backgroundColor: '#fff',
            //padding: 20,
            flex: 1,
          }}>
          <View style={styles.presentationWindow}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
                paddingTop: 15,
                paddingBottom: 15,
                borderBottomWidth: 0.7,
                borderBottomColor: '#d0d0d0',
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,

                elevation: 3,
              }}>
              <TouchableOpacity
                onPress={() =>
                  this.props.UpdateErrorModalLog(false, false, 'any')
                }
                style={{flexDirection: 'row'}}>
                <View style={{top: 1.5}}>
                  <IconAnt name="arrowleft" size={23} />
                </View>
                <Text
                  style={[
                    systemWeights.semibold,
                    {
                      fontSize: 17.5,
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      marginLeft: 5,
                    },
                  ]}>
                  Trip details
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{flex: 1}}>
              {/**Driver details */}
              <View
                style={{
                  backgroundColor: '#fff',
                  flexDirection: 'row',
                  padding: 20,
                  paddingTop: 18,
                  paddingBottom: 15,
                  alignItems: 'center',
                  borderBottomWidth: 0.7,
                  borderBottomColor: '#d0d0d0',
                }}>
                <View style={{flexDirection: 'row', flex: 1}}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#d0d0d0',
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

                      elevation: 5,
                    }}>
                    <IconAnt name="user" size={25} />
                  </View>
                  <View
                    style={{
                      marginLeft: 7,
                      flex: 1,
                      justifyContent: 'center',
                    }}>
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
                          : null}
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
                  </View>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Book',
                      color: '#096ED4',
                      fontSize: 15,
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
              </View>
              {/**Call or cancel */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 0.7,
                  borderBottomColor: '#d0d0d0',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    borderRightWidth: 0.7,
                    borderRightColor: '#d0d0d0',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                  }}>
                  <IconMaterialIcons name="phone" color="#096ED4" size={20} />
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Book',
                      fontSize: 17,
                      color: '#096ED4',
                    }}>
                    Call
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                  }}>
                  <IconMaterialIcons name="close" color="#b22222" size={21} />
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Book',
                      fontSize: 17,
                      color: '#b22222',
                    }}>
                    Cancel trip
                  </Text>
                </View>
              </View>
              {/**Car details */}
              <View
                style={{
                  padding: 20,
                  paddingBottom: 30,
                  borderBottomWidth: 0.7,
                  marginTop: 20,
                  borderBottomColor: '#d0d0d0',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Allrounder-Grotesk-Book',
                    color: '#a5a5a5',
                    paddingBottom: 15,
                  }}>
                  Car details
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#d0d0d0',
                      width: 130,
                      height: 70,
                      borderRadius: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <IconCommunity name="car" size={30} color="#a5a5a5" />
                  </View>
                  <View style={{marginLeft: 10, flex: 1}}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Allrounder-Grotesk-Regular',
                      }}>
                      {
                        this.props.App.generalTRIP_details_driverDetails
                          .carDetails.plate_number
                      }
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Allrounder-Grotesk-Book',
                      }}>
                      {
                        this.props.App.generalTRIP_details_driverDetails
                          .carDetails.car_brand
                      }
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 8,
                        alignItems: 'center',
                      }}>
                      <IconFeather name="shield" color="green" size={17} />
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Allrounder-Grotesk-Book',
                          color: 'green',
                        }}>
                        {
                          this.props.App.generalTRIP_details_driverDetails
                            .carDetails.verification_status
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              {/**Trip/Delivery details */}
              <View style={{}}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Allrounder-Grotesk-Book',
                    color: '#a5a5a5',
                    padding: 20,
                    paddingBottom: 0,
                  }}>
                  {/ride/i.test(
                    this.props.App.generalTRIP_details_driverDetails
                      .basicTripDetails.ride_mode,
                  )
                    ? 'Trip'
                    : 'Delivery'}
                </Text>
                <View
                  style={{
                    padding: 20,
                    borderBottomWidth: 0.7,
                    borderBottomColor: '#d0d0d0',
                    height: 170,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 25,
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
                          height: 50,
                          backgroundColor: '#000',
                        }}></View>
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Book',
                        fontSize: 14,
                        marginLeft: 5,
                        flex: 1,
                      }}>
                      {/ride/i.test(
                        this.props.App.generalTRIP_details_driverDetails
                          .basicTripDetails.ride_mode,
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
                            .basicTripDetails.pickup_name,
                        ).length < 30
                          ? this.props.App.generalTRIP_details_driverDetails
                              .basicTripDetails.pickup_name
                          : this.props.App.generalTRIP_details_driverDetails.basicTripDetails.pickup_name.substring(
                              0,
                              19,
                            ) + '...'}
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 25,
                      alignItems: 'center',
                    }}>
                    <View>
                      <View
                        style={{
                          height: 15,
                          width: 15,
                          borderRadius: 100,
                          backgroundColor: '#096ED4',
                        }}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: 7,
                          width: 2,
                          height: 50,
                          backgroundColor: '#096ED4',
                        }}></View>
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Book',
                        fontSize: 14,
                        marginLeft: 5,
                        flex: 1,
                      }}>
                      {/ride/i.test(
                        this.props.App.generalTRIP_details_driverDetails
                          .basicTripDetails.ride_mode,
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
                            .basicTripDetails.destination_name,
                        ).length < 25
                          ? this.props.App.generalTRIP_details_driverDetails
                              .basicTripDetails.destination_name
                          : this.props.App.generalTRIP_details_driverDetails.basicTripDetails.destination_name.substring(
                              0,
                              19,
                            ) + '...'}
                      </Text>
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View>
                      <View
                        style={{
                          height: 15,
                          width: 15,
                          borderWidth: 3,
                          borderColor: '#096ED4',
                          borderRadius: 100,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                    {this.props.App.generalTRIP_details_driverDetails
                      .ETA_toDestination !== undefined &&
                    this.props.App.generalTRIP_details_driverDetails
                      .ETA_toDestination !== false &&
                    this.props.App.generalTRIP_details_driverDetails
                      .ETA_toDestination !== null ? (
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Book',
                          fontSize: 14,
                          marginLeft: 5,
                          flex: 1,
                        }}>
                        Approximately{' '}
                        <Text
                          style={{
                            fontFamily: 'Allrounder-Grotesk-Medium',
                            fontSize: 15,
                            marginLeft: 5,
                            color: '#096ED4',
                          }}>
                          {this.props.App.generalTRIP_details_driverDetails.ETA_toDestination.replace(
                            ' away',
                            '',
                          )}
                          .
                        </Text>
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Book',
                          fontSize: 14,
                          marginLeft: 5,
                          flex: 1,
                        }}>
                        Couldn't find the ETA.
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              {/**Payment method, amount and passenger number */}
              <View
                style={{
                  padding: 20,
                  borderBottomWidth: 0.7,
                  borderBottomColor: '#d0d0d0',
                  height: 70,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}>
                  {/cash/i.test(
                    String(
                      this.props.App.generalTRIP_details_driverDetails
                        .basicTripDetails.payment_method,
                    ),
                  ) ? (
                    <IconCommunity name="cash-usd" color={'green'} size={25} />
                  ) : (
                    <IconMaterialIcons name="credit-card" size={25} />
                  )}

                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      fontSize: 17,
                      marginLeft: 4,
                    }}>
                    {String(
                      this.props.App.generalTRIP_details_driverDetails
                        .basicTripDetails.payment_method,
                    )[0] +
                      String(
                        this.props.App.generalTRIP_details_driverDetails
                          .basicTripDetails.payment_method,
                      )
                        .substring(
                          1,
                          String(
                            this.props.App.generalTRIP_details_driverDetails
                              .basicTripDetails.payment_method,
                          ).length,
                        )
                        .toLowerCase()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    fontSize: 17,
                    color: 'green',
                    flex: 1,
                    textAlign: 'center',
                  }}>
                  {'N$' +
                    this.props.App.generalTRIP_details_driverDetails
                      .basicTripDetails.fare_amount}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    flex: 1,
                  }}>
                  <IconAnt name="user" size={20} />
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      fontSize: 17,
                      marginLeft: 4,
                    }}>
                    {
                      this.props.App.generalTRIP_details_driverDetails
                        .basicTripDetails.passengers_number
                    }
                  </Text>
                </View>
              </View>
              {/**Guardian */}
              <View
                style={{
                  padding: 20,
                  paddingBottom: 30,
                  marginBottom: 50,
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Allrounder-Grotesk-Book',
                    color: '#a5a5a5',
                    paddingBottom: 25,
                  }}>
                  Safety
                </Text>
                <View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <IconMaterialIcons
                      name="shield"
                      color="#b22222"
                      size={25}
                    />
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 16,
                        color: '#b22222',
                        marginLeft: 5,
                      }}>
                      Emergency call
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    } else if (/show_guardian_toolkit/i.test(error_status)) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            //padding: 20,
            height: 300,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              paddingBottom: 5,
            }}>
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Regular', fontSize: 20}}>
              Safety
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() => {}}
              style={[
                styles.bttnGenericTc,
                {
                  borderRadius: 2,
                  marginBottom: 10,
                  justifyContent: 'flex-start',
                  borderBottomColor: '#d0d0d0',
                  borderBottomWidth: 1,
                  paddingLeft: 20,
                  paddingRight: 20,
                  backgroundColor: '#fff',
                  shadowColor: '#fff',
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0,
                  shadowRadius: 0,

                  elevation: 0,
                  flexDirection: 'row',
                },
              ]}>
              <IconMaterialIcons name="shield" color="#b22222" size={28} />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Book',
                  fontSize: 19,
                  marginLeft: 5,
                  flex: 1,
                  color: '#b22222',
                }}>
                Emergency call
              </Text>
            </TouchableOpacity>
            <View
              style={[
                styles.bttnGenericTc,
                {
                  borderRadius: 2,
                  marginBottom: 10,
                  justifyContent: 'flex-start',
                  paddingLeft: 20,
                  paddingRight: 20,
                  backgroundColor: '#fff',
                  shadowColor: '#fff',
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0,
                  shadowRadius: 0,

                  elevation: 0,
                },
              ]}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Book',
                  fontSize: 14,
                  color: '#a5a5a5',
                  marginLeft: 5,
                  flex: 1,
                  lineHeight: 17,
                }}>
                Use the Emergency call button only in the case of an extreme
                emergency. Otherwise some additional charges may apply.
              </Text>
            </View>
          </View>
        </View>
      );
    } else if (/show_rating_driver_modal/i.test(error_status)) {
      return (
        <SafeAreaView
          style={{
            backgroundColor: '#fff',
            //padding: 20,
            flex: 1,
          }}>
          <View style={styles.presentationWindow}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
                paddingTop: 15,
                paddingBottom: 15,
                borderBottomWidth: 0.7,
                borderBottomColor: '#d0d0d0',
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,

                elevation: 3,
              }}>
              <TouchableOpacity
                onPress={() =>
                  this.props.UpdateErrorModalLog(false, false, 'any')
                }
                style={{flexDirection: 'row'}}>
                <View style={{top: 1.5}}>
                  <IconAnt name="arrowleft" size={23} />
                </View>
                <Text
                  style={[
                    systemWeights.semibold,
                    {
                      fontSize: 17.5,
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      marginLeft: 5,
                    },
                  ]}>
                  Rating
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{flex: 1}}>
              {/**Driver's basic infos */}
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 20,
                  marginBottom: 25,
                }}>
                <View
                  style={{
                    backgroundColor: '#fff',
                    width: 60,
                    height: 60,
                    borderRadius: 150,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 3,
                    },
                    shadowOpacity: 0.27,
                    shadowRadius: 4.65,

                    elevation: 6,
                  }}>
                  <IconAnt name="user" size={25} />
                </View>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Regular',
                    fontSize: 17,
                    marginTop: 10,
                  }}>
                  {
                    this.props.App.generalTRIP_details_driverDetails
                      .driver_details.name
                  }
                </Text>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Book',
                    fontSize: 13,
                    marginTop: 4,
                  }}>
                  {
                    this.props.App.generalTRIP_details_driverDetails
                      .trip_details.date_requested
                  }
                </Text>
              </View>
              {/**Rating section */}
              <View
                style={{
                  borderTopWidth: 0.5,
                  borderTopColor: '#d0d0d0',
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#d0d0d0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 25,
                  paddingTop: 13,
                  paddingBottom: 25,
                  backgroundColor: '#fafafa',
                }}>
                <AirbnbRating
                  count={5}
                  reviews={[
                    'Terrible',
                    'Bad',
                    'Good',
                    'Very good',
                    'Excellent',
                  ]}
                  isDisabled={this.state.isLoading_something}
                  defaultRating={4}
                  onFinishRating={(rating) =>
                    this.setState({rating_score: rating})
                  }
                  size={30}
                  reviewSize={18}
                  reviewColor={'#000'}
                  selectedColor={'#096ED4'}
                />
              </View>
              {/**Compliments */}
              <View
                style={{
                  borderBottomWidth: 0.5,
                  paddingBottom: 25,
                  borderBottomColor: '#d0d0d0',
                }}>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Book',
                    fontSize: 15,
                    width: '100%',
                    textAlign: 'center',
                    color: '#a5a5a5',
                  }}>
                  Compliment the driver?
                </Text>
                <ScrollView
                  horizontal
                  alwaysBounceHorizontal
                  showsHorizontalScrollIndicator={false}
                  style={{
                    flexDirection: 'row',
                    marginTop: 15,
                    paddingLeft: 20,
                  }}>
                  {/**Clean and tidy */}
                  <TouchableOpacity
                    onPress={() =>
                      this.state.isLoading_something === false
                        ? this.updateDropOff_medata(
                            'updateCompliment',
                            'neatAndTidy',
                          )
                        : {}
                    }
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 100,
                    }}>
                    <View
                      style={{
                        width: 55,
                        height: 55,
                        borderRadius: 150,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#d0d0d0',
                        opacity: this.state.compliment_array.neatAndTidy
                          ? 1
                          : 0.4,
                      }}>
                      <Image
                        source={this.props.App.cleanAndTidy}
                        style={{
                          resizeMode: 'contain',
                          width: '70%',
                          height: '70%',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 14,
                        marginTop: 10,
                        flex: 1,
                        textAlign: 'center',
                        lineHeight: 15,
                        paddingTop: 5,
                        opacity: this.state.compliment_array.neatAndTidy
                          ? 1
                          : 0.4,
                      }}>
                      Neat and Tidy
                    </Text>
                  </TouchableOpacity>
                  {/**Excellent service */}
                  <TouchableOpacity
                    onPress={() =>
                      this.state.isLoading_something === false
                        ? this.updateDropOff_medata(
                            'updateCompliment',
                            'excellentService',
                          )
                        : {}
                    }
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 100,
                    }}>
                    <View
                      style={{
                        width: 55,
                        height: 55,
                        borderRadius: 150,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#d0d0d0',
                        opacity: this.state.compliment_array.excellentService
                          ? 1
                          : 0.4,
                      }}>
                      <Image
                        source={this.props.App.excellentService}
                        style={{
                          resizeMode: 'contain',
                          width: '70%',
                          height: '70%',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 14,
                        marginTop: 10,
                        flex: 1,
                        textAlign: 'center',
                        lineHeight: 15,
                        paddingTop: 5,
                        opacity: this.state.compliment_array.excellentService
                          ? 1
                          : 0.4,
                      }}>
                      Excellent service
                    </Text>
                  </TouchableOpacity>
                  {/**Great music */}
                  <TouchableOpacity
                    onPress={() =>
                      this.state.isLoading_something === false
                        ? this.updateDropOff_medata(
                            'updateCompliment',
                            'greatMusic',
                          )
                        : {}
                    }
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 100,
                    }}>
                    <View
                      style={{
                        width: 55,
                        height: 55,
                        borderRadius: 150,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#d0d0d0',
                        opacity: this.state.compliment_array.greatMusic
                          ? 1
                          : 0.4,
                      }}>
                      <Image
                        source={this.props.App.greatMusic}
                        style={{
                          resizeMode: 'contain',
                          width: '70%',
                          height: '70%',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 14,
                        marginTop: 10,
                        flex: 1,
                        textAlign: 'center',
                        lineHeight: 15,
                        paddingTop: 5,
                        opacity: this.state.compliment_array.greatMusic
                          ? 1
                          : 0.4,
                      }}>
                      Great music
                    </Text>
                  </TouchableOpacity>
                  {/**Great conversation */}
                  <TouchableOpacity
                    onPress={() =>
                      this.state.isLoading_something === false
                        ? this.updateDropOff_medata(
                            'updateCompliment',
                            'greatConversation',
                          )
                        : {}
                    }
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 100,
                    }}>
                    <View
                      style={{
                        width: 55,
                        height: 55,
                        borderRadius: 150,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#d0d0d0',
                        opacity: this.state.compliment_array.greatConversation
                          ? 1
                          : 0.4,
                      }}>
                      <Image
                        source={this.props.App.greatConversation}
                        style={{
                          resizeMode: 'contain',
                          width: '70%',
                          height: '70%',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 14,
                        marginTop: 10,
                        flex: 1,
                        textAlign: 'center',
                        lineHeight: 15,
                        paddingTop: 5,
                        opacity: this.state.compliment_array.greatConversation
                          ? 1
                          : 0.4,
                      }}>
                      Great conversation
                    </Text>
                  </TouchableOpacity>
                  {/**Expert navigator */}
                  <TouchableOpacity
                    onPress={() =>
                      this.state.isLoading_something === false
                        ? this.updateDropOff_medata(
                            'updateCompliment',
                            'expertNavigator',
                          )
                        : null
                    }
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 100,
                      marginRight: 30,
                    }}>
                    <View
                      style={{
                        width: 55,
                        height: 55,
                        borderRadius: 150,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#d0d0d0',
                        opacity: this.state.compliment_array.expertNavigator
                          ? 1
                          : 0.4,
                      }}>
                      <Image
                        source={this.props.App.greatNavigation}
                        style={{
                          resizeMode: 'contain',
                          width: '70%',
                          height: '70%',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 14,
                        marginTop: 10,
                        flex: 1,
                        textAlign: 'center',
                        lineHeight: 15,
                        paddingTop: 5,
                        opacity: this.state.compliment_array.expertNavigator
                          ? 1
                          : 0.4,
                      }}>
                      Expert navigator
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
              {/**Add a custom note */}
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  padding: 20,
                  paddingTop: 0,
                  paddingBottom: 0,
                }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    marginTop: 15,
                    width: '100%',
                  }}>
                  <TextInput
                    placeholder="Add a personal note"
                    editable={
                      this.state.isLoading_something === false ? true : false
                    }
                    onChangeText={(text) => this.setState({custom_note: text})}
                    maxLength={40}
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      fontSize: 16,
                    }}
                  />
                </View>
              </View>
              {/**Done, submit rating */}
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  width: '100%',
                  padding: 20,
                  paddingTop: 0,
                  marginTop: 30,
                  marginBottom: 35,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.state.isLoading_something === false
                      ? this.confirmRiderDropoff(
                          this.props.App.generalTRIP_details_driverDetails
                            .trip_details.request_fp,
                        )
                      : {}
                  }
                  style={styles.bttnGenericTc}>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      fontSize: 19,
                      color: '#fff',
                    }}>
                    {this.state.isLoading_something ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      'Done'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    } else if (/show_cancel_ride_modal/i.test(error_status)) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 300,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
              Cancel your ride?
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.cancelRequest_rider()
                  : {}
              }
              style={[
                styles.bttnGenericTc,
                {borderRadius: 2, marginBottom: 15, backgroundColor: '#f0f0f0'},
              ]}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 19,
                  color: '#000',
                  marginLeft: 5,
                }}>
                {this.state.isLoading_something === false ? (
                  'Yes, cancel'
                ) : (
                  <ActivityIndicator size="small" color="#000" />
                )}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.props.UpdateErrorModalLog(false, false, 'any')
                  : {}
              }
              style={[
                styles.bttnGenericTc,
                {borderRadius: 2, marginBottom: 10},
              ]}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 19,
                  color: '#fff',
                  marginLeft: 5,
                }}>
                Don't cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return <></>;
    }
  }

  render() {
    return (
      <View>
        {/**Check if the modal is not yet active with the same error status message */}
        {console.log('Modal called')}
        {
          <Modal
            testID={'modal'}
            useNativeDriver={true}
            useNativeDriverForBackdrop={true}
            onBackButtonPress={() =>
              this.props.UpdateErrorModalLog(false, false, 'any')
            }
            onBackdropPress={() =>
              /(show_guardian_toolkit|show_cancel_ride_modal)/i.test(
                this.props.error_status,
              )
                ? this.props.UpdateErrorModalLog(false, false, 'any')
                : {}
            }
            isVisible={
              this.props.active !== undefined && this.props.active !== null
                ? this.props.error_status !== undefined &&
                  this.props.error_status !== null
                  ? this.props.active
                  : false
                : false
            }
            animationInTiming={300}
            animationOutTiming={300}
            style={styles.modalBottom}>
            {this.renderModalContent(this.props.error_status)}
          </Modal>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalBottom: {
    justifyContent: 'flex-end',
    margin: 0,
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
  presentationWindow: {
    flex: 1,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ResetGenericPhoneNumberInput,
      UpdateErrorModalLog,
      UpdateUserGenderState,
      UpdateType_rideShown_YourRides_screen,
      UpdateRatingDetailsDuringDropoff_process,
      ResetStateProps,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ErrorModal);
