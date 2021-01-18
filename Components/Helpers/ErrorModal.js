import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import SOCKET_CORE from '../Helpers/managerNode';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Share,
  Animated,
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
  UpdatePreferredPayment_method,
} from '../Redux/HomeActionsCreators';
import call from 'react-native-phone-call';

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
    SOCKET_CORE.on(
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
          globalObject.state.rating_score = 5;
          globalObject.state.compliment_array = {
            neatAndTidy: false,
            excellentService: false,
            greatMusic: false,
            greatConversation: false,
            expertNavigator: false,
          };
          globalObject.state.custom_note = false;
          globalObject.state.request_fp = false;
          //Received a response
          globalObject.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
          //Reset all the trips
          globalObject.props.ResetStateProps(globalObject.props.parentNode);
        } //error - close the modal
        else {
          globalObject.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
        }
      },
    );

    //2 Handle cancel request response
    SOCKET_CORE.on('cancelRiders_request_io-response', function (response) {
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
        globalObject.props.ResetStateProps(globalObject.props.parentNode);
      } //error - close modal
      else {
        globalObject.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
      }
    });
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
    SOCKET_CORE.emit('confirmRiderDropoff_requests_io', dropoff_bundle);
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
      SOCKET_CORE.emit('cancelRiders_request_io', bundleData);
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
   * @func onShare
   * Responsible for sharing ride content to friends or family
   */
  onShare = async (title, message) => {
    try {
      const result = await Share.share({
        message: message,
        title: title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {}
  };

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
   * @func tryAgain_erroredRequest
   * Responsible for closing the error modal and going the the confirm bottom vitals for the trip request.
   */
  tryAgain_erroredRequest() {
    this.props.App.bottomVitalsFlow.bottomVitalChildHeight = new Animated.Value(
      400,
    );
    this.props.UpdateErrorModalLog(false, false, 'any');
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
    } else if (/service_unavailable/i.test(error_status)) {
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
            height: 360,
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
                {borderRadius: 2, marginBottom: 20},
              ]}>
              <IconFontisto name="male" size={20} color="#fff" />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 20,
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
                {borderRadius: 2, marginBottom: 20},
              ]}>
              <IconFontisto name="female" size={20} color="#fff" />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 20,
                  color: '#fff',
                  marginLeft: 5,
                }}>
                Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.bttnGenericTc,
                {borderRadius: 2, backgroundColor: '#f0f0f0'},
              ]}
              onPress={() => this.props.UpdateUserGenderState('unknown')}>
              <IconEntypo name="block" size={20} color="#000" top={10} />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 20,
                  color: '#000',
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
            height: 340,
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
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
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
                  marginBottom: 15,
                  paddingBottom: 20,
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
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 20,
                  color: '#000',
                  marginLeft: 5,
                  flex: 1,
                }}>
                Past requests
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
                  marginBottom: 15,
                  paddingBottom: 20,
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
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 20,
                  color: '#000',
                  marginLeft: 5,
                  flex: 1,
                }}>
                Scheduled requests
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
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 20,
                  color: '#d0d0d0',
                  marginLeft: 5,
                  flex: 1,
                }}>
                Business requests
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
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{top: 0}}>
                  <IconAnt name="arrowleft" size={23} />
                </View>
                <Text
                  style={[
                    systemWeights.semibold,
                    {
                      fontSize: 19,
                      fontFamily: 'Allrounder-Grotesk-Medium',
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
                      borderWidth: 0.5,
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
                          fontSize: 15,
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
                        color="#ffbf00"
                      />
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Regular',
                          fontSize: 15,
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
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      color: '#096ED4',
                      fontSize: 16.5,
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
                <TouchableOpacity
                  onPress={() =>
                    call({
                      number: this.props.App.generalTRIP_details_driverDetails
                        .driverDetails.phone_number,
                      prompt: true,
                    })
                  }
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
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      fontSize: 17,
                      color: '#096ED4',
                    }}>
                    Call
                  </Text>
                </TouchableOpacity>
                {/inRouteToDestination/i.test(
                  this.props.App.generalTRIP_details_driverDetails
                    .request_status,
                ) ? (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 10,
                    }}>
                    <IconMaterialIcons name="block" color="#b22222" size={20} />
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 17,
                        color: '#b22222',
                      }}>
                      Cancel trip
                    </Text>
                  </TouchableOpacity>
                ) : null}
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
                    fontFamily: 'Allrounder-Grotesk-Regular',
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
                    <Image
                      source={require('../../Media_assets/Images/normaltaxieconomy.jpg')}
                      style={{
                        resizeMode: 'cover',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </View>
                  <View style={{marginLeft: 10, flex: 1}}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Allrounder-Grotesk-Medium',
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
                      <IconFeather name="shield" color="green" size={16} />
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
                    fontFamily: 'Allrounder-Grotesk-Regular',
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
                        <View style={{position: 'absolute', bottom: 0}}>
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
                          <View style={{width: 35}}>
                            <Text
                              style={{
                                fontFamily: 'Allrounder-Grotesk-Book',
                                fontSize: 13,
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
                                  fontFamily: 'Allrounder-Grotesk-Medium',
                                  fontSize: 15,
                                  marginLeft: 5,
                                  flex: 1,
                                }}>
                                {String(
                                  this.props.App
                                    .generalTRIP_details_driverDetails
                                    .basicTripDetails.pickup_name,
                                )}
                              </Text>
                              {/*<Text
                                style={{
                                  fontFamily: 'Allrounder-Grotesk-Book',
                                  fontSize: 14,
                                  marginLeft: 5,
                                  marginTop: 3,
                                  flex: 1,
                                }}>
                                {this.props.App.requests_data_main_vars
                                  .moreDetailsFocused_request
                                  .origin_destination_infos.pickup_infos
                                  .location_name +
                                  ', ' +
                                  this.props.App.requests_data_main_vars
                                    .moreDetailsFocused_request
                                    .origin_destination_infos.pickup_infos
                                    .street_name}
                                </Text>*/}
                            </View>
                          </View>
                        </View>
                        {/**Destination */}
                        <View
                          style={{
                            flexDirection: 'row',
                            marginTop: 25,
                          }}>
                          <View style={{width: 35}}>
                            <Text
                              style={{
                                fontFamily: 'Allrounder-Grotesk-Book',
                                fontSize: 13,
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
                            {this.props.App.generalTRIP_details_driverDetails.basicTripDetails.destination_name
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
                                          'Allrounder-Grotesk-Regular',
                                        fontSize: 16,
                                        marginLeft: 5,
                                        flex: 1,
                                      }}>
                                      {this.props.App.generalTRIP_details_driverDetails.basicTripDetails.destination_name.split(
                                        ',',
                                      ).length > 1 ? (
                                        <Text
                                          style={{
                                            fontFamily:
                                              'Allrounder-Grotesk-Regular',
                                            fontSize: 13,
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
                {/**ETA */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 20,
                    borderTopWidth: 0.7,
                    borderTopColor: '#d0d0d0',
                    borderBottomWidth: 0.7,
                    borderBottomColor: '#d0d0d0',
                    backgroundColor: '#fafafa',
                  }}>
                  <View>
                    <View
                      style={{
                        top: 1,
                        height: 10,
                        width: 10,
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
                          fontSize: 16,
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
                    <IconCommunity name="cash-usd" color={'#000'} size={25} />
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
                    fontSize: 20,
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
                  <IconAnt name="user" size={17} />
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      fontSize: 17.5,
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
                    fontFamily: 'Allrounder-Grotesk-Regular',
                    color: '#a5a5a5',
                    paddingBottom: 25,
                  }}>
                  Safety
                </Text>
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      this.onShare(
                        'My TaxiConnect ride',
                        "Hey, I'm in a TaxiConnect taxi " +
                          (this.props.App.generalTRIP_details_driverDetails
                            .carDetails.taxi_number !== false
                            ? this.props.App.generalTRIP_details_driverDetails
                                .carDetails.taxi_number
                            : this.props.App.generalTRIP_details_driverDetails
                                .carDetails.car_brand) +
                          ' (Plate number: ' +
                          this.props.App.generalTRIP_details_driverDetails
                            .carDetails.plate_number +
                          ') with the driver ' +
                          this.props.App.generalTRIP_details_driverDetails
                            .driverDetails.name +
                          '.\n\nYou can track my trip in realtime here: https://www.taxiconnectna.com/sharedRide/' +
                          this.props.App.generalTRIP_details_driverDetails
                            .basicTripDetails.ride_simplified_id,
                      )
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 20,
                      paddingBottom: 10,
                    }}>
                    <IconCommunity name="earth" color="#000" size={25} />
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 18,
                        color: '#000',
                        marginLeft: 5,
                      }}>
                      Share your trip
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      call({
                        number: '061302302',
                        prompt: true,
                      })
                    }
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <IconMaterialIcons
                      name="shield"
                      color="#b22222"
                      size={25}
                    />
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 18,
                        color: '#b22222',
                        marginLeft: 5,
                      }}>
                      Emergency call
                    </Text>
                  </TouchableOpacity>
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
            height: 340,
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
              style={{fontFamily: 'Allrounder-Grotesk-Regular', fontSize: 22}}>
              Safety
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                this.onShare(
                  'My TaxiConnect ride',
                  "Hey, I'm in a TaxiConnect taxi " +
                    (this.props.App.generalTRIP_details_driverDetails.carDetails
                      .taxi_number !== false
                      ? this.props.App.generalTRIP_details_driverDetails
                          .carDetails.taxi_number
                      : this.props.App.generalTRIP_details_driverDetails
                          .carDetails.car_brand) +
                    ' (Plate number: ' +
                    this.props.App.generalTRIP_details_driverDetails.carDetails
                      .plate_number +
                    ') with the driver ' +
                    this.props.App.generalTRIP_details_driverDetails
                      .driverDetails.name +
                    '.\n\nYou can track my trip in realtime here: https://www.taxiconnectna.com/sharedRide/' +
                    this.props.App.generalTRIP_details_driverDetails
                      .basicTripDetails.ride_simplified_id,
                )
              }
              style={[
                styles.bttnGenericTc,
                {
                  borderRadius: 2,
                  marginBottom: 20,
                  justifyContent: 'flex-start',
                  borderBottomColor: '#d0d0d0',
                  borderBottomWidth: 0.5,
                  paddingLeft: 20,
                  paddingRight: 20,
                  height: 100,
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
              <View style={{height: '100%'}}>
                <IconCommunity name="earth" color="#000" size={28} />
              </View>
              <View style={{flex: 1, marginLeft: 5}}>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    fontSize: 20,
                    flex: 1,
                    color: '#000',
                  }}>
                  Share your trip
                </Text>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Book',
                    fontSize: 14,
                    lineHeight: 15,
                    flex: 1,
                  }}>
                  Allows you to share with your friends and family the realtime
                  details of your ongoing trip.
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                call({
                  number: '061302302',
                  prompt: true,
                })
              }
              style={[
                styles.bttnGenericTc,
                {
                  borderRadius: 2,
                  marginBottom: 20,
                  justifyContent: 'flex-start',
                  paddingLeft: 20,
                  paddingRight: 20,
                  height: 100,
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
              <View style={{height: '100%'}}>
                <IconMaterialIcons name="shield" color="#b22222" size={28} />
              </View>
              <View style={{flex: 1, marginLeft: 5}}>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    fontSize: 20,
                    flex: 1,
                    color: '#b22222',
                  }}>
                  Emergency call
                </Text>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Book',
                    fontSize: 14,
                    lineHeight: 15,
                    flex: 1,
                  }}>
                  Call immediatly the authorities if you feel a threaten.
                </Text>
              </View>
            </TouchableOpacity>
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
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{top: 0}}>
                  <IconAnt name="arrowleft" size={23} />
                </View>
                <Text
                  style={[
                    systemWeights.semibold,
                    {
                      fontSize: 19,
                      fontFamily: 'Allrounder-Grotesk-Medium',
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
                    borderWidth: 0.5,
                    borderColor: '#f0f0f0',
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
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Regular',
                    fontSize: 18,
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
                    fontSize: 14.5,
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
                  size={38}
                  reviewSize={18}
                  reviewColor={'#000'}
                  selectedColor={'#ffbf00'}
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
                    fontFamily: 'Allrounder-Grotesk-Regular',
                    fontSize: 16,
                    width: '100%',
                    textAlign: 'center',
                    color: '#a5a5a5',
                    marginBottom: 5,
                  }}>
                  Give a compliment?
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
                    borderBottomWidth: 0.5,
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
                      fontSize: 17.5,
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
                      fontSize: 23.5,
                      color: '#fff',
                    }}>
                    {this.state.isLoading_something ? (
                      <ActivityIndicator size="large" color="#fff" />
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
                {borderRadius: 2, marginBottom: 30, backgroundColor: '#f0f0f0'},
              ]}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 20,
                  color: '#000',
                  marginLeft: 5,
                }}>
                {this.state.isLoading_something === false ? (
                  'Yes, cancel'
                ) : (
                  <ActivityIndicator size="large" color="#000" />
                )}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.props.UpdateErrorModalLog(false, false, 'any')
                  : {}
              }
              style={[styles.bttnGenericTc, {borderRadius: 2}]}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 20,
                  color: '#fff',
                  marginLeft: 5,
                }}>
                Don't cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/show_error_requesting_modal/i.test(error_status)) {
      //Show delivery input modal
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 300,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconCommunity
              name="network-strength-1-alert"
              size={22}
              style={{marginRight: 5}}
            />
            <Text
              style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 22}}>
              Unable to request
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Book',
                fontSize: 17,
                marginTop: 10,
              }}>
              Sorry, something went wrong while we were trying to make your
              request, please try again later.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() => this.tryAgain_erroredRequest()}
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
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/show_preferedPaymentMethod_modal/i.test(error_status)) {
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
                padding: 20,
                paddingTop: 15,
                paddingBottom: 15,
              }}>
              <TouchableOpacity
                onPress={() =>
                  this.props.UpdateErrorModalLog(false, false, 'any')
                }
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{top: 0}}>
                  <IconAnt name="arrowleft" size={25} />
                </View>
              </TouchableOpacity>
              <Text
                style={[
                  systemWeights.semibold,
                  {
                    fontSize: 22,
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    marginTop: 15,
                  },
                ]}>
                Select a payment method
              </Text>
            </View>
            <ScrollView style={{flex: 1}}>
              <View style={{flex: 1}}>
                <View style={{flex: 1}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottomWidth: 0.5,
                      borderBottomColor: '#a5a5a5',
                      padding: 20,
                      paddingTop: 30,
                    }}>
                    <IconMaterialIcons
                      name="account-balance-wallet"
                      size={30}
                      color={'#096ED4'}
                    />
                    <Text
                      style={[
                        {
                          fontSize: 19.5,
                          fontFamily: 'Allrounder-Grotesk-Regular',
                          marginLeft: 5,
                          flex: 1,
                        },
                      ]}>
                      Your wallet
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: 'Allrounder-Grotesk-Medium',
                        color: '#096ED4',
                      }}>
                      N${this.props.App.wallet_state_vars.totalWallet_amount}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 0.5,
                      paddingBottom: '10%',
                      borderBottomColor: '#a5a5a5',
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Allrounder-Grotesk-Book',
                        color: '#a5a5a5',
                        padding: 20,
                        paddingBottom: 10,
                      }}>
                      Top up with
                    </Text>
                    <View style={{marginTop: 15}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingTop: 0,
                          paddingBottom: 10,
                        }}>
                        <View style={{width: 40}}>
                          <IconAnt name="creditcard" size={28} />
                        </View>
                        <Text
                          style={{
                            fontSize: 18,
                            fontFamily: 'Allrounder-Grotesk-Regular',
                          }}>
                          Credit card
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Allrounder-Grotesk-Book',
                        color: '#a5a5a5',
                        padding: 20,
                        paddingBottom: 10,
                      }}>
                      Preferred payment method
                    </Text>
                    <View style={{marginTop: 15}}>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.App.wallet_state_vars
                            .totalWallet_amount === 0
                            ? {}
                            : this.props.App.customFareTripSelected !== false
                            ? this.props.App.customFareTripSelected <=
                              this.props.App.wallet_state_vars
                                .totalWallet_amount
                              ? this.props.UpdatePreferredPayment_method(
                                  'wallet',
                                )
                              : this.props.UpdatePreferredPayment_method('cash')
                            : this.props.App.fareTripSelected <=
                              this.props.App.wallet_state_vars
                                .totalWallet_amount
                            ? this.props.UpdatePreferredPayment_method('wallet')
                            : this.props.UpdatePreferredPayment_method('cash')
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingTop: 0,
                          paddingBottom: 5,
                          marginBottom: 20,
                          opacity:
                            this.props.App.wallet_state_vars
                              .totalWallet_amount === 0
                              ? 0.15
                              : 1,
                        }}>
                        <View style={{width: 40}}>
                          <IconMaterialIcons name="credit-card" size={32} />
                        </View>
                        <Text
                          style={{
                            fontSize: 18,
                            flex: 1,
                            fontFamily: 'Allrounder-Grotesk-Regular',
                          }}>
                          Wallet
                        </Text>
                        {this.props.App.wallet_state_vars.totalWallet_amount ===
                        0 ? null : /wallet/i.test(
                            this.props.App.wallet_state_vars
                              .selectedPayment_method,
                          ) ? (
                          <IconCommunity
                            name="check-circle"
                            size={25}
                            style={{top: 1}}
                            color={'#096ED4'}
                          />
                        ) : null}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          this.props.UpdatePreferredPayment_method('cash');
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingBottom: 10,
                          borderTopWidth: 0.5,
                          borderTopColor: '#d0d0d0',
                        }}>
                        <View style={{width: 40}}>
                          <IconCommunity
                            name="cash-usd"
                            color={'#000'}
                            size={32}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 18,
                            flex: 1,
                            fontFamily: 'Allrounder-Grotesk-Regular',
                          }}>
                          Cash
                        </Text>
                        {this.props.App.wallet_state_vars.totalWallet_amount ===
                        0 ? null : /cash/i.test(
                            this.props.App.wallet_state_vars
                              .selectedPayment_method,
                          ) ? (
                          <IconCommunity
                            name="check-circle"
                            size={25}
                            style={{top: 1}}
                            color={'#096ED4'}
                          />
                        ) : null}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                paddingLeft: 20,
                paddingRight: 20,
                height: 100,
              }}>
              <TouchableOpacity
                onPress={() =>
                  this.props.UpdateErrorModalLog(false, false, 'any')
                }
                style={{
                  borderColor: 'transparent',
                  width: '100%',
                  justifyContent: 'center',
                }}>
                <View style={[styles.bttnGenericTc]}>
                  <Text
                    style={[
                      {
                        fontFamily: 'Allrounder-Grotesk-Medium',
                        fontSize: 23,
                        color: '#fff',
                      },
                    ]}>
                    Done
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    } else {
      return <></>;
    }
  }

  render() {
    return (
      <View>
        {/**Check if the modal is not yet active with the same error status message */}
        {
          <Modal
            testID={'modal'}
            useNativeDriver={true}
            useNativeDriverForBackdrop={true}
            onBackButtonPress={() =>
              this.props.UpdateErrorModalLog(false, false, 'any')
            }
            onBackdropPress={() =>
              /(show_guardian_toolkit|show_cancel_ride_modal|show_select_ride_type_modal)/i.test(
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
      UpdatePreferredPayment_method,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ErrorModal);
