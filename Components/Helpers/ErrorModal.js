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
  Share,
  Animated,
  Easing,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Modal from 'react-native-modal';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconFeather from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontisto from 'react-native-vector-icons/Fontisto';
import {systemWeights} from 'react-native-typography';
import {AirbnbRating} from 'react-native-ratings';
import {
  ResetGenericPhoneNumberInput,
  UpdateErrorModalLog,
  UpdateUserGenderState,
  UpdateType_rideShown_YourRides_screen,
  UpdateRatingDetailsDuringDropoff_process,
  ResetStateProps,
  ValidateGenericPhoneNumber,
  UpdatePreferredPayment_method,
} from '../Redux/HomeActionsCreators';
import call from 'react-native-phone-call';
import PhoneNumberInput from '../Modules/PhoneNumberInput/Components/PhoneNumberInput';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import EmailValidator from './EmailValidator';
import SyncStorage from 'sync-storage';
import Search from '../Modules/Search/Components/Search';
import FastImage from 'react-native-fast-image';
import {RFValue} from 'react-native-responsive-fontsize';
import AdManager from '../Modules/AdManager/AdManager';

class ErrorModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      //Drop off rating metadata
      rating_score: 4, //The rating for the driver selected by the user - default: 4
      reason_cancelling: false, //The reason for the cancellation
      compliment_array: {
        neatAndTidy: false,
        excellentService: false,
        greatMusic: false,
        greatConversation: false,
        expertNavigator: false,
      }, //The compliment for the driver selectedd by the user - array of compliment strings - default: [], strings: neatAndTidy, excellentService, greatMusic, greatConversation, expertNavigator
      custom_note: false, //The custom note entered by the user,
      isLoading_something: false, //Responsible for handling any kind of native loader (circle) within the context of this class
      tmpString: null, //Responsible to be used template string for the new values.
      errorString_template: 'An error occured', //TO hold any kind of string error
      isErrorThrown: false, //To know whether or not an error was thrown.
      //Will contain all the temporary information about a referral
      referral_infos: {
        driver_infos: {
          taxi_number: null,
          name: null,
          phone_number: null,
        },
        step_name: 'enterTaxiNumber', //The name of the current step window: enterTaxiNumber, enterFullDetails, successfullyReferred, alreadyReferred, isADriver
        request_status: null, //The status of the request: null, successful, alreadyReferred, isADriver
        showErrors: {
          taxi_number: false,
          driver_name: false,
        }, //Whether or now to show the error strings of the corresponding fields.
        errorsStrings: {
          taxi_number: null,
          driver_name: null,
        }, //Errors strings of the corresponding fields.
        animation_vars: {
          left_position: new Animated.Value(0),
          opacity: new Animated.Value(1),
        },
      },
    };

    this.signOff_theApp = this.signOff_theApp.bind(this);
  }

  componentDidMount() {
    let that = this;
    /**
     * SOCKET.IO RESPONSES
     */
    //1. Handle request dropoff request response
    this.props.App.socket.on(
      'confirmRiderDropoff_requests_io-response',
      function (response) {
        if (
          response !== false &&
          response.response !== undefined &&
          response.response !== null
        ) {
          setTimeout(function () {
            //Stop the loader and restore
            that.setState({isLoading_something: false});
            //Reset local drop off related data
            that.state.rating_score = 5;
            that.state.compliment_array = {
              neatAndTidy: false,
              excellentService: false,
              greatMusic: false,
              greatConversation: false,
              expertNavigator: false,
            };
            that.state.custom_note = false;
            that.state.request_fp = false;
            //Received a response
            that.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
            //Reset all the trips
            //that.props.ResetStateProps(that.props.parentNode);
          }, 3000);
        } //error - close the modal
        else {
          //Stop the loader and restore
          that.setState({isLoading_something: false});
          that.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
        }
      },
    );

    //2 Handle cancel request response
    this.props.App.socket.on(
      'cancelRiders_request_io-response',
      function (response) {
        //Stop the loader and restore
        that.setState({isLoading_something: false});
      },
    );

    //3. Handle referral checking infos
    this.props.App.socket.on(
      'referralOperations_perform_io_CHECKING-response',
      function (response) {
        that.state.isLoading_something = false;
        if (response.response !== undefined && response.response !== null) {
          Animated.parallel([
            Animated.timing(
              that.state.referral_infos.animation_vars.left_position,
              {
                toValue: -100,
                duration: 250,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
            Animated.timing(that.state.referral_infos.animation_vars.opacity, {
              toValue: 0,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (/error/i.test(response.response)) {
              //An error occured
              that.state.referral_infos.step_name = 'error_whileReferring';
              that.forceUpdate();
            } else if (/driver_alreadyRegistered/i.test(response.response)) {
              //Official taxiconnect partner
              that.state.referral_infos.step_name = 'isADriver';
              that.forceUpdate();
            } else if (/driver_alreadyReferred/i.test(response.response)) {
              //Driver already referred
              that.state.referral_infos.step_name = 'alreadyReferred';
              that.forceUpdate();
            } else if (/driver_freeForReferral/i.test(response.response)) {
              //? Free for referral
              that.state.referral_infos.step_name = 'enterFullDetails';
              that.forceUpdate();
            } //Some weird error probably happened
            else {
              that.state.referral_infos.step_name = 'error_whileReferring';
              that.forceUpdate();
            }
            //...
            Animated.parallel([
              Animated.timing(
                that.state.referral_infos.animation_vars.left_position,
                {
                  toValue: 0,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              Animated.timing(
                that.state.referral_infos.animation_vars.opacity,
                {
                  toValue: 1,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {});
          });
        } //Some error occured
        else {
          that.state.referral_infos.step_name = 'error_whileReferring';
          that.forceUpdate();
        }
      },
    );

    //4. Handle referral submit infos
    this.props.App.socket.on(
      'referralOperations_perform_io_SUBMIT-response',
      function (response) {
        that.state.isLoading_something = false;
        if (response.response !== undefined && response.response !== null) {
          Animated.parallel([
            Animated.timing(
              that.state.referral_infos.animation_vars.left_position,
              {
                toValue: -100,
                duration: 250,
                easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                useNativeDriver: true,
              },
            ),
            Animated.timing(that.state.referral_infos.animation_vars.opacity, {
              toValue: 0,
              duration: 200,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (/error_unexpected_foundActive/i.test(response.response)) {
              //Already referred
              //Driver already referred
              that.state.referral_infos.step_name = 'alreadyReferred';
              that.forceUpdate();
            } else if (/successfully_referred/i.test(response.response)) {
              //? Successfully referred
              that.state.referral_infos.step_name = 'successfullyReferred';
              that.forceUpdate();
            } //Error
            else {
              that.state.referral_infos.step_name = 'error_whileReferring';
              that.forceUpdate();
            }
            //...
            Animated.parallel([
              Animated.timing(
                that.state.referral_infos.animation_vars.left_position,
                {
                  toValue: 0,
                  duration: 250,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
              Animated.timing(
                that.state.referral_infos.animation_vars.opacity,
                {
                  toValue: 1,
                  duration: 200,
                  easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {});
          });
        }
        //Some error occured
        else {
          that.state.referral_infos.step_name = 'error_whileReferring';
          that.forceUpdate();
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
      user_fingerprint: /ride/i.test(
        this.props.App.generalTRIP_details_driverDetails.trip_details.ride_mode,
      )
        ? this.props.App.user_fingerprint
        : this.props.App.generalTRIP_details_driverDetails.requester_fp !==
            undefined &&
          this.props.App.user_fingerprint !==
            this.props.App.generalTRIP_details_driverDetails.requester_fp
        ? this.props.App.generalTRIP_details_driverDetails.requester_fp
        : this.props.App.user_fingerprint, //? Assign the requester's fingerprint for delivery requests if different
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
      this.forceUpdate();
    }
  }

  /**
   * @func cancelRequest_rider
   * Responsible for cancelling any current request as selected by the user
   * @param reason: the reason of cancelling the request.
   */
  cancelRequest_rider(reason = false) {
    if (
      this.props.App.generalTRIP_details_driverDetails !== undefined &&
      this.props.App.generalTRIP_details_driverDetails !== null &&
      this.props.App.generalTRIP_details_driverDetails !== false
    ) {
      this.setState({isLoading_something: true, reason_cancelling: reason}); //Activate the loader
      //Bundle the cancel input
      let bundleData = {
        request_fp:
          this.props.App.generalTRIP_details_driverDetails !== undefined &&
          this.props.App.generalTRIP_details_driverDetails.basicTripDetails !==
            undefined &&
          this.props.App.generalTRIP_details_driverDetails.basicTripDetails
            .request_fp !== undefined
            ? this.props.App.generalTRIP_details_driverDetails.basicTripDetails
                .request_fp
            : this.props.App.generalTRIP_details_driverDetails.request_fp,
        user_fingerprint: this.props.App.user_fingerprint,
        reason: reason,
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
  updateYourRidesSHownOnes(type) {
    this.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
    this.props.UpdateType_rideShown_YourRides_screen(type);
    //Update the list of requests from the server
    this.props.App.fetchRequestedRequests_history(type);
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
   * @func updatePersonalInfos
   * Responsible for updating the rider's personal infos: name, surname, gender, phone number, email and picture.
   * @param infoToUpdate: the type of data to update
   * @param dataToUpdate: the true data to update
   */
  updatePersonalInfos(dataToUpdate, infoToUpdate) {
    dataToUpdate = /phone/i.test(infoToUpdate)
      ? this.props.App.phoneNumberEntered
      : dataToUpdate; //Rectify the data to update in the it's the phone number
    //...
    if (
      dataToUpdate !== null &&
      dataToUpdate !== undefined &&
      dataToUpdate.length > 0
    ) {
      if (/^(name|surname|gender|email|phone)$/i.test(infoToUpdate)) {
        let bundleData = {
          user_fingerprint: this.props.App.user_fingerprint,
          dataToUpdate: dataToUpdate,
          infoToUpdate: infoToUpdate,
        };
        //Update the global last data updated - very useful when updating the visual data after a successful modification.
        this.props.App.last_dataPersoUpdated = dataToUpdate;
        //For the name,surname,gender and email
        if (/^email$/i.test(infoToUpdate)) {
          //For the email specifically
          if (EmailValidator(dataToUpdate)) {
            //Check if the email's format's good.
            this.setState({isErrorThrown: false, isLoading_something: true});
            this.props.App.socket.emit(
              'updateRiders_profileInfos_io',
              bundleData,
            );
          } //Wrong email format
          else {
            this.setState({
              errorString_template: 'Your email looks wrong',
              isErrorThrown: true,
            });
          }
        } else if (/^phone$/i.test(infoToUpdate)) {
          //Phone number
          //Check the phone number
          this.props.ValidateGenericPhoneNumber();
          if (this.props.App.isPhoneNumberValid) {
            //Good number - save in the global
            this.props.App.last_dataPersoUpdated = this.props.App.finalPhoneNumber;
            //....
            //? close the modal as well
            this.props.UpdateErrorModalLog(false, false, 'any');
            //...
            this.props.parentNode.props.navigation.navigate(
              'OTPVerificationGeneric',
            );
          } //SHow trivial error
          else {
            //Do nothing
          }
        } else if (/^gender$/i.test(infoToUpdate)) {
          //gender
          this.setState({isErrorThrown: false, isLoading_something: true});
          this.props.App.socket.emit(
            'updateRiders_profileInfos_io',
            bundleData,
          );
        }
        //For the rest proceed
        else {
          if (
            /^(name|surname)$/i.test(infoToUpdate) &&
            dataToUpdate.trim().length > 2
          ) {
            //Name or surname
            this.setState({isErrorThrown: false, isLoading_something: true});
            this.props.App.socket.emit(
              'updateRiders_profileInfos_io',
              bundleData,
            );
          } //Name or surname too short
          else {
            this.setState({
              errorString_template: 'At least 2 characters are required.',
              isErrorThrown: true,
            });
          }
        }
      }
    } //Close the modal
    else {
      this.props.UpdateErrorModalLog(false, false, 'any');
    }
  }

  /**
   * @func updateLocalStateNewPersonal_infos
   * Responsible for updating locally the new rider's details as he/she is typing it.
   * @param dataType: the type of information to update (name,surname,gender,email) - excluding the phone number.
   * @param data: the data to update
   */
  updateLocalStateNewPersonal_infos(dataType = false, data) {
    if (dataType !== false) {
      if (/^(name|surname|gender|email)$/i.test(dataType)) {
        //name
        this.setState({tmpString: data, isErrorThrown: false});
        //? Auto update for gender ONLY
        if (/gender/i.test(dataType)) {
          this.updatePersonalInfos(data, 'gender');
          //Close the modal
          this.props.UpdateErrorModalLog(false, false, 'any');
        }
      }
    }
  }

  /**
   * @func signOff_theApp
   * Responsible for signing the user off the app, clear all the storages and reset everything before.
   */
  signOff_theApp() {
    let that = this;
    this.setState({isLoading_something: true});
    //...
    setTimeout(function () {
      //1. Reset every global processes.
      that.props.ResetStateProps(that.props.parentNode);
      that.props.ResetGenericPhoneNumberInput();
      //2. Clear all the intervals
      if (that.props.App._TMP_INTERVAL_PERSISTER !== null) {
        clearInterval(that.props.App._TMP_INTERVAL_PERSISTER);
        that.props.App._TMP_INTERVAL_PERSISTER = null;
      }
      if (that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS !== null) {
        clearInterval(that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS);
        that.props.App._TMP_INTERVAL_PERSISTER_CLOSEST_DRIVERS = null;
      }
      that.props.App._CLOSEST_DRIVERS_DATA = null;
      //3. Clear all the storages
      SyncStorage.remove('@user_fp');
      SyncStorage.remove('@userLocationPoint');
      SyncStorage.remove('@gender_user');
      SyncStorage.remove('@username');
      SyncStorage.remove('@surname_user');
      SyncStorage.remove('@user_email');
      SyncStorage.remove('@phone_user');
      SyncStorage.remove('@user_profile_pic');
      SyncStorage.remove('@accountCreation_state');

      //Reinitiate values
      that.props.App.user_fingerprint = null;
      that.props.App.gender_user = 'male';
      that.props.App.username = false;
      that.props.App.surname_user = false;
      that.props.App.user_email = false;
      that.props.App.user_profile_pic = null;
      that.props.App.last_dataPersoUpdated = null;
      that.props.App.userCurrentLocationMetaData = {};
      that.props.App.accountCreation_state = null;
      //Log out
      that.props.UpdateErrorModalLog(false, false, 'any');
      that.props.parentNode.props.navigation.navigate('EntryScreen');
    }, 1000);
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
              size={20}
              style={{marginRight: 5}}
            />
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              No Internet connection
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextLight'
                    : 'Uber Move Text',
                fontSize: RFValue(17),
                marginTop: 10,
                lineHeight: 23,
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(17),
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
              size={20}
              style={{marginRight: 5}}
            />
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              Oups, something's wrong
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextLight'
                    : 'Uber Move Text',
                fontSize: RFValue(17),
                marginTop: 10,
                lineHeight: 23,
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(17),
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
            height: 270,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconMaterialIcons
              name="error-outline"
              size={20}
              style={{marginRight: 5}}
            />
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              Something's wrong
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextLight'
                    : 'Uber Move Text',
                fontSize: RFValue(17),
                marginTop: 10,
                lineHeight: 23,
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
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
            height: 270,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconMaterialIcons
              name="error-outline"
              size={20}
              style={{marginRight: 5}}
            />
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              Couldn't check the OTP
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextLight'
                    : 'Uber Move Text',
                fontSize: RFValue(17),
                marginTop: 10,
                lineHeight: 23,
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
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
            height: 270,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconMaterialIcons
              name="error-outline"
              size={20}
              style={{marginRight: 5}}
            />
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              Something's wrong
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextLight'
                    : 'Uber Move Text',
                fontSize: RFValue(17),
                marginTop: 10,
                lineHeight: 23,
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
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
            height: 350,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              Select your gender
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                this.props.App.detailToModify === null
                  ? this.props.UpdateUserGenderState('male')
                  : this.updateLocalStateNewPersonal_infos('gender', 'male')
              }
              style={[
                styles.bttnGenericTc,
                {borderRadius: 2, marginBottom: 15},
              ]}>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
                  color: '#fff',
                }}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.props.App.detailToModify === null
                  ? this.props.UpdateUserGenderState('female')
                  : this.updateLocalStateNewPersonal_infos('gender', 'female')
              }
              style={[
                styles.bttnGenericTc,
                {borderRadius: 2, marginBottom: 15},
              ]}>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
                  color: '#fff',
                }}>
                Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.bttnGenericTc,
                {
                  borderRadius: 2,
                  backgroundColor: '#E2E2E2',
                  alignItems: 'center',
                },
              ]}
              onPress={() =>
                this.props.App.detailToModify === null
                  ? this.props.UpdateUserGenderState('unknown')
                  : this.updateLocalStateNewPersonal_infos('gender', 'unknown')
              }>
              <IconEntypo name="block" size={17} color="#000" top={10} />
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
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
            height: 270,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconMaterialIcons
              name="error-outline"
              size={20}
              style={{marginRight: 5}}
            />
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              Something's wrong
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextLight'
                    : 'Uber Move Text',
                fontSize: RFValue(17),
                marginTop: 10,
                lineHeight: 23,
              }}>
              Sorry due to an unexpected error we were unable to update your
              profile information, but no worries you can try again later.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                this.props.UpdateErrorModalLog(false, false, 'any')
              }
              style={styles.bttnGenericTc}>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
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
            height: 330,
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
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              What do you want to see?
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() => this.updateYourRidesSHownOnes('Past')}
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(19),
                  color: '#000',
                  flex: 1,
                }}>
                Past requests
              </Text>
              {/past/i.test(this.props.App.shownRides_types) ? (
                <IconFeather name="check" color="#0e8491" size={23} />
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.updateYourRidesSHownOnes('Scheduled')}
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(19),
                  color: '#000',
                  flex: 1,
                }}>
                Scheduled requests
              </Text>
              {/scheduled/i.test(this.props.App.shownRides_types) ? (
                <IconFeather name="check" color="#0e8491" size={23} />
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(19),
                  color: '#E2E2E2',
                  flex: 1,
                }}>
                Business requests
              </Text>
              {/business/i.test(this.props.App.shownRides_types) ? (
                <IconFeather name="check" color="#0e8491" size={23} />
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/show_modalMore_tripDetails/i.test(error_status)) {
      try {
        let essay = this.props.App.generalTRIP_details_driverDetails
          .driverDetails.profile_picture;
      } catch (error) {
        return null;
      }
      return (
        <SafeAreaView
          style={{
            backgroundColor: '#fff',
            flex: 1,
          }}>
          <View style={styles.presentationWindow}>
            <View
              style={
                Platform.OS === 'android'
                  ? {
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 20,
                      paddingTop: 15,
                      paddingBottom: 15,
                      borderBottomWidth: 0.7,
                      borderBottomColor: '#d0d0d0',
                      backgroundColor: '#000',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 1,
                      },
                      shadowOpacity: 0.22,
                      shadowRadius: 2.22,

                      elevation: 3,
                    }
                  : {
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 20,
                      paddingTop: 15,
                      paddingBottom: 15,
                      borderBottomWidth: 0.7,
                      borderBottomColor: '#d0d0d0',
                      backgroundColor: '#fff',
                    }
              }>
              <TouchableOpacity
                onPress={() =>
                  this.props.UpdateErrorModalLog(false, false, 'any')
                }
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{top: 0}}>
                  <IconAnt
                    name="arrowleft"
                    color={Platform.OS === 'android' ? '#fff' : '#000'}
                    size={22}
                  />
                </View>
                <Text
                  style={[
                    {
                      fontSize: RFValue(20),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      marginLeft: 5,
                      color: Platform.OS === 'android' ? '#fff' : '#000',
                    },
                  ]}>
                  {/ride/i.test(
                    this.props.App.generalTRIP_details_driverDetails
                      .basicTripDetails.ride_mode,
                  )
                    ? 'Trip details'
                    : 'Delivery details'}
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
                  paddingBottom: 25,
                  alignItems: 'center',
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
                    {/http/i.test(
                      this.props.App.generalTRIP_details_driverDetails
                        .driverDetails.profile_picture,
                    ) &&
                    this.props.App.generalTRIP_details_driverDetails
                      .driverDetails.profile_picture !== undefined &&
                    this.props.App.generalTRIP_details_driverDetails
                      .driverDetails.profile_picture !== null ? (
                      <FastImage
                        source={{
                          uri:
                            this.props.App.generalTRIP_details_driverDetails
                              .driverDetails.profile_picture !== undefined &&
                            this.props.App.generalTRIP_details_driverDetails
                              .driverDetails.profile_picture !== null
                              ? this.props.App.generalTRIP_details_driverDetails
                                  .driverDetails.profile_picture
                              : 'user.png',
                          priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 150,
                        }}
                      />
                    ) : (
                      <Image
                        source={require('../../Media_assets/Images/driver.jpg')}
                        style={{
                          resizeMode: 'cover',
                          width: '100%',
                          height: '100%',
                          borderRadius: 150,
                        }}
                      />
                    )}
                  </View>
                  <View
                    style={{
                      marginLeft: 7,
                      flex: 1,
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(19.5),
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
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                          fontSize: RFValue(18),
                          color: '#096ED4',
                        }}>
                        {this.props.App.generalTRIP_details_driverDetails
                          .carDetails.taxi_number !== false
                          ? this.props.App.generalTRIP_details_driverDetails
                              .carDetails.taxi_number
                          : null}
                      </Text>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <IconMaterialIcons
                          name="star"
                          size={17}
                          style={{marginLeft: 7, marginRight: 4}}
                          color="#ffbf00"
                        />
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            fontSize: RFValue(17),
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
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      color: '#096ED4',
                      fontSize: RFValue(17),
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
              {this.props.App.generalTRIP_details_driverDetails
                .riderOwnerInfoBundle === undefined ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 20,
                    paddingRight: 20,
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.App.generalTRIP_details_driverDetails
                        .driverDetails !== undefined &&
                      this.props.App.generalTRIP_details_driverDetails
                        .driverDetails !== null &&
                      this.props.App.generalTRIP_details_driverDetails
                        .driverDetails.phone_number !== undefined &&
                      this.props.App.generalTRIP_details_driverDetails
                        .driverDetails.phone_number !== null
                        ? call({
                            number: this.props.App
                              .generalTRIP_details_driverDetails.driverDetails
                              .phone_number,
                            prompt: true,
                          })
                        : {}
                    }
                    style={{
                      opacity:
                        this.props.App.generalTRIP_details_driverDetails
                          .driverDetails !== undefined &&
                        this.props.App.generalTRIP_details_driverDetails
                          .driverDetails !== null &&
                        this.props.App.generalTRIP_details_driverDetails
                          .driverDetails.phone_number !== undefined &&
                        this.props.App.generalTRIP_details_driverDetails
                          .driverDetails.phone_number !== null
                          ? 1
                          : 0.2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: /inRouteToPickup/i.test(
                        this.props.App.request_status,
                      )
                        ? this.props.App.generalTRIP_details_driverDetails
                            .requester_fp !== undefined &&
                          this.props.App.user_fingerprint !==
                            this.props.App.generalTRIP_details_driverDetails
                              .requester_fp
                          ? 1
                          : 0
                        : 1,
                      padding: 15,
                      borderRadius: 4,
                      height: 58,
                      borderTopRightRadius: /inRouteToPickup/i.test(
                        this.props.App.request_status,
                      )
                        ? this.props.App.generalTRIP_details_driverDetails
                            .requester_fp !== undefined &&
                          this.props.App.user_fingerprint !==
                            this.props.App.generalTRIP_details_driverDetails
                              .requester_fp
                          ? 4
                          : 0
                        : 4,
                      borderBottomRightRadius: /inRouteToPickup/i.test(
                        this.props.App.request_status,
                      )
                        ? this.props.App.generalTRIP_details_driverDetails
                            .requester_fp !== undefined &&
                          this.props.App.user_fingerprint !==
                            this.props.App.generalTRIP_details_driverDetails
                              .requester_fp
                          ? 4
                          : 0
                        : 4,
                      backgroundColor: '#096ED4',
                      marginRight: /inRouteToPickup/i.test(
                        this.props.App.request_status,
                      )
                        ? this.props.App.generalTRIP_details_driverDetails
                            .requester_fp !== undefined &&
                          this.props.App.user_fingerprint !==
                            this.props.App.generalTRIP_details_driverDetails
                              .requester_fp
                          ? 0
                          : 10
                        : 0,
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,

                      elevation: 5,
                    }}>
                    <IconMaterialIcons name="phone" color="#fff" size={28} />
                  </TouchableOpacity>

                  {/inRouteToPickup/i.test(this.props.App.request_status) ? (
                    this.props.App.generalTRIP_details_driverDetails
                      .requester_fp !== undefined &&
                    this.props.App.user_fingerprint !==
                      this.props.App.generalTRIP_details_driverDetails
                        .requester_fp ? null : (
                      <TouchableOpacity
                        onPress={() => {
                          this.props.UpdateErrorModalLog(false, false, 'any');
                          this.props.UpdateErrorModalLog(
                            true,
                            'show_cancel_ride_modal',
                            'any',
                          );
                        }}
                        style={{
                          flexDirection: 'row',
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 15,
                          height: 58,
                          borderWidth: 1,
                          borderColor: '#d0d0d0',
                          borderRadius: 4,
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          backgroundColor: '#fff',
                          shadowColor: '#d0d0d0',
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,

                          elevation: 3,
                        }}>
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(19),
                            color: '#b22222',
                          }}>
                          Cancel the trip
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : null}
                </View>
              ) : null}
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
                    fontSize: RFValue(16.5),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    color: '#a5a5a5',
                    paddingBottom: 16,
                  }}>
                  Vehicle details
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#d0d0d0',
                      width: 130,
                      height: 80,
                      borderRadius: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {/http/i.test(
                      this.props.App.generalTRIP_details_driverDetails
                        .carDetails.car_image,
                    ) &&
                    this.props.App.generalTRIP_details_driverDetails.carDetails
                      .car_image !== undefined &&
                    this.props.App.generalTRIP_details_driverDetails.carDetails
                      .car_image !== null ? (
                      <FastImage
                        source={{
                          uri:
                            this.props.App.generalTRIP_details_driverDetails
                              .carDetails.car_image !== undefined &&
                            this.props.App.generalTRIP_details_driverDetails
                              .carDetails.car_image !== null
                              ? this.props.App.generalTRIP_details_driverDetails
                                  .carDetails.car_image
                              : 'normaltaxieconomy.png',
                          priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 3,
                        }}
                      />
                    ) : (
                      <Image
                        source={require('../../Media_assets/Images/normaltaxieconomy.jpg')}
                        style={{
                          resizeMode: 'cover',
                          width: '100%',
                          height: '100%',
                          borderRadius: 3,
                        }}
                      />
                    )}
                  </View>
                  <View style={{marginLeft: 10, flex: 1}}>
                    {this.props.App.generalTRIP_details_driverDetails
                      .riderOwnerInfoBundle === undefined ? (
                      <Text
                        style={{
                          fontSize: RFValue(17.5),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                        }}>
                        {
                          this.props.App.generalTRIP_details_driverDetails
                            .carDetails.plate_number
                        }
                      </Text>
                    ) : null}
                    <Text
                      style={{
                        fontSize: RFValue(16.5),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
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
                      <IconMaterialIcons
                        name="shield"
                        color="#09864A"
                        size={14}
                      />
                      <Text
                        style={{
                          fontSize: RFValue(14),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextLight'
                              : 'Uber Move Text Light',
                          color: '#09864A',
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
                    fontSize: RFValue(16.5),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
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
                          <View style={{width: 45}}>
                            <Text
                              style={{
                                fontFamily:
                                  Platform.OS === 'android'
                                    ? 'UberMoveTextLight'
                                    : 'Uber Move Text Light',
                                fontSize: RFValue(15),
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
                                      ? 'UberMoveTextMedium'
                                      : 'Uber Move Text Medium',
                                  fontSize: RFValue(18),
                                  marginLeft: 5,
                                  flex: 1,
                                }}>
                                {String(
                                  this.props.App
                                    .generalTRIP_details_driverDetails
                                    .basicTripDetails.pickup_name !== false &&
                                    this.props.App
                                      .generalTRIP_details_driverDetails
                                      .basicTripDetails.pickup_name !== 'false'
                                    ? this.props.App
                                        .generalTRIP_details_driverDetails
                                        .basicTripDetails.pickup_name
                                    : 'Your location',
                                )}
                              </Text>
                              {/*<Text
                                style={{
                                  fontFamily: Platform.OS==='android' ? 'Allrounder-Grotesk-Book':'Allrounder Grotesk Book',
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
                          <View style={{width: 45}}>
                            <Text
                              style={{
                                fontFamily:
                                  Platform.OS === 'android'
                                    ? 'UberMoveTextLight'
                                    : 'Uber Move Text Light',
                                fontSize: RFValue(15),
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
                                          Platform.OS === 'android'
                                            ? 'UberMoveTextRegular'
                                            : 'Uber Move Text',
                                        fontSize: RFValue(17),
                                        marginLeft: 5,
                                        flex: 1,
                                      }}>
                                      {this.props.App.generalTRIP_details_driverDetails.basicTripDetails.destination_name.split(
                                        ',',
                                      ).length > 1 ? (
                                        <Text
                                          style={{
                                            fontFamily:
                                              Platform.OS === 'android'
                                                ? 'UberMoveTextMedium'
                                                : 'Uber Move Text Medium',
                                            fontSize: RFValue(15),
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
                            {/**Going until home Tag */}
                            <Text
                              style={{
                                fontFamily:
                                  Platform.OS === 'android'
                                    ? 'UberMoveTextRegular'
                                    : 'Uber Move Text',
                                fontSize: RFValue(16),
                                color: '#096ED4',
                                marginTop: '2%',
                                marginLeft: 5,
                              }}>
                              {this.props.App.generalTRIP_details_driverDetails
                                .basicTripDetails.isGoingUntilHome !==
                                undefined &&
                              this.props.App.generalTRIP_details_driverDetails
                                .basicTripDetails.isGoingUntilHome !== null
                                ? this.props.App
                                    .generalTRIP_details_driverDetails
                                    .basicTripDetails.isGoingUntilHome
                                  ? 'Going until home'
                                  : 'Not going until home'
                                : 'Not going until home.'}
                            </Text>
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

                    backgroundColor: '#f6f6f6',
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
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(16.5),
                        marginLeft: 5,
                        flex: 1,
                      }}>
                      About{' '}
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                          fontSize: RFValue(16),
                          marginLeft: 5,
                          color: '#096ED4',
                        }}>
                        {this.props.App.generalTRIP_details_driverDetails.ETA_toDestination.replace(
                          ' away',
                          '',
                        )}
                      </Text>
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(15),
                        marginLeft: 5,
                        flex: 1,
                      }}>
                      ...
                    </Text>
                  )}
                </View>
              </View>
              {/**Add package type for deliveries only */}
              {/delivery/i.test(
                this.props.App.generalTRIP_details_driverDetails
                  .basicTripDetails.ride_mode,
              ) ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    padding: 20,
                    paddingBottom: 10,
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <IconFeather name="package" color={'#000'} size={24} />
                    <View style={{marginLeft: 5}}>
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                          fontSize: RFValue(17),
                        }}>
                        {/envelope/i.test(
                          this.props.App.generalTRIP_details_driverDetails
                            .packageSize,
                        )
                          ? 'Small'
                          : /small/i.test(
                              this.props.App.generalTRIP_details_driverDetails
                                .packageSize,
                            )
                          ? 'Medium'
                          : 'Large'}
                      </Text>
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextLight'
                              : 'Uber Move Text Light',
                          fontSize: RFValue(14),
                        }}>
                        Package type
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}
              {/**Receiver's/Sender infos */}
              {/Delivery/i.test(
                this.props.App.generalTRIP_details_driverDetails
                  .basicTripDetails.ride_mode,
              ) &&
              this.props.App.generalTRIP_details_driverDetails
                .requester_infos !== undefined &&
              this.props.App.generalTRIP_details_driverDetails
                .requester_infos !== null &&
              this.props.App.user_fingerprint !==
                this.props.App.generalTRIP_details_driverDetails
                  .requester_fp ? (
                <View style={{marginBottom: 15}}>
                  <Text
                    style={{
                      fontSize: RFValue(16.5),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      color: '#a5a5a5',
                      padding: 20,
                      paddingBottom: 10,
                    }}>
                    Sender's information
                  </Text>
                  <View
                    style={{
                      padding: 20,
                      backgroundColor: '#F6F6F6',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingTop: 0,
                      paddingBottom: 0,
                    }}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(17),
                        flex: 1,
                      }}>
                      {
                        this.props.App.generalTRIP_details_driverDetails
                          .requester_infos.requester_name
                      }
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        call({
                          number: this.props.App
                            .generalTRIP_details_driverDetails.requester_infos
                            .phone,
                          prompt: true,
                        })
                      }
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 5,
                        flexDirection: 'row',
                        padding: 15,
                      }}>
                      <IconMaterialIcons
                        name="phone"
                        color="#096ED4"
                        size={30}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : /Delivery/i.test(
                  this.props.App.generalTRIP_details_driverDetails
                    .basicTripDetails.ride_mode,
                ) ? (
                <View style={{marginBottom: 15}}>
                  <Text
                    style={{
                      fontSize: RFValue(16.5),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      color: '#a5a5a5',
                      padding: 20,
                      paddingBottom: 10,
                    }}>
                    Receiver's information
                  </Text>
                  <View
                    style={{
                      padding: 20,
                      backgroundColor: '#F6F6F6',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingTop: 0,
                      paddingBottom: 0,
                    }}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(17),
                        flex: 1,
                      }}>
                      {
                        this.props.App.generalTRIP_details_driverDetails
                          .delivery_infos.receiverName_delivery
                      }
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        call({
                          number: this.props.App
                            .generalTRIP_details_driverDetails.delivery_infos
                            .receiverPhone_delivery,
                          prompt: true,
                        })
                      }
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 5,
                        flexDirection: 'row',
                        padding: 15,
                      }}>
                      <IconMaterialIcons
                        name="phone"
                        color="#096ED4"
                        size={30}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
              {/**Payment method, amount and passenger number */}
              {/ride/i.test(
                this.props.App.generalTRIP_details_driverDetails
                  .basicTripDetails.ride_mode,
              ) &&
              this.props.App.generalTRIP_details_driverDetails
                .riderOwnerInfoBundle === undefined ? (
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
                      <IconCommunity name="cash-usd" color={'#000'} size={26} />
                    ) : (
                      <IconMaterialIcons name="credit-card" size={26} />
                    )}

                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(19),
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
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      fontSize: RFValue(20),
                      color: '#09864A',
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
                    <IconAnt name="user" size={16} />
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(19),
                        marginLeft: 4,
                      }}>
                      {
                        this.props.App.generalTRIP_details_driverDetails
                          .basicTripDetails.passengers_number
                      }
                    </Text>
                  </View>
                </View>
              ) : /Delivery/i.test(
                  this.props.App.generalTRIP_details_driverDetails
                    .basicTripDetails.ride_mode,
                ) &&
                this.props.App.generalTRIP_details_driverDetails
                  .requester_infos !== undefined &&
                this.props.App.generalTRIP_details_driverDetails
                  .requester_infos !== null &&
                this.props.App.user_fingerprint !==
                  this.props.App.generalTRIP_details_driverDetails
                    .requester_fp ? null : (
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
                      <IconCommunity name="cash-usd" color={'#000'} size={26} />
                    ) : (
                      <IconMaterialIcons name="credit-card" size={26} />
                    )}

                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(19),
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
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      fontSize: RFValue(20),
                      color: '#09864A',
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
                    <IconAnt name="user" size={16} />
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(19),
                        marginLeft: 4,
                      }}>
                      {
                        this.props.App.generalTRIP_details_driverDetails
                          .basicTripDetails.passengers_number
                      }
                    </Text>
                  </View>
                </View>
              )}
              {/**Guardian */}
              {this.props.App.generalTRIP_details_driverDetails
                .riderOwnerInfoBundle === undefined ? (
                <View
                  style={{
                    padding: 20,
                    paddingBottom: 30,
                    marginBottom: 50,
                    paddingTop: 30,
                  }}>
                  <Text
                    style={{
                      fontSize: RFValue(18),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      color: '#a5a5a5',
                      paddingBottom: 35,
                    }}>
                    Safety
                  </Text>
                  <View>
                    {/ride/i.test(
                      this.props.App.generalTRIP_details_driverDetails
                        .basicTripDetails.ride_mode,
                    ) ? (
                      <TouchableOpacity
                        onPress={() =>
                          this.onShare(
                            'My TaxiConnect ride',
                            "Hey, I'm in a TaxiConnect taxi " +
                              (this.props.App.generalTRIP_details_driverDetails
                                .carDetails.taxi_number !== false
                                ? this.props.App
                                    .generalTRIP_details_driverDetails
                                    .carDetails.taxi_number
                                : this.props.App
                                    .generalTRIP_details_driverDetails
                                    .carDetails.car_brand) +
                              ' with the driver ' +
                              this.props.App.generalTRIP_details_driverDetails
                                .driverDetails.name +
                              '.\n\nYou can track my trip in realtime here: https://www.taxiconnectna.com/sharedTrip/trip.html?link=' +
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
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(19),
                            color: '#000',
                            marginLeft: 5,
                            flex: 1,
                          }}>
                          Share your trip
                        </Text>
                      </TouchableOpacity>
                    ) : /Delivery/i.test(
                        this.props.App.generalTRIP_details_driverDetails
                          .basicTripDetails.ride_mode,
                      ) &&
                      this.props.App.generalTRIP_details_driverDetails
                        .requester_infos !== undefined &&
                      this.props.App.generalTRIP_details_driverDetails
                        .requester_infos !== null &&
                      this.props.App.user_fingerprint !==
                        this.props.App.generalTRIP_details_driverDetails
                          .requester_fp ? null : (
                      <TouchableOpacity
                        onPress={() =>
                          this.onShare(
                            'My TaxiConnect ride',
                            "Hey, I'm in a TaxiConnect taxi " +
                              (this.props.App.generalTRIP_details_driverDetails
                                .carDetails.taxi_number !== false
                                ? this.props.App
                                    .generalTRIP_details_driverDetails
                                    .carDetails.taxi_number
                                : this.props.App
                                    .generalTRIP_details_driverDetails
                                    .carDetails.car_brand) +
                              ' with the driver ' +
                              this.props.App.generalTRIP_details_driverDetails
                                .driverDetails.name +
                              '.\n\nYou can track my trip in realtime here: https://www.taxiconnectna.com/sharedTrip/trip.html?link=' +
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
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(19),
                            color: '#000',
                            marginLeft: 5,
                            flex: 1,
                          }}>
                          Share your trip
                        </Text>
                      </TouchableOpacity>
                    )}
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
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                          fontSize: RFValue(19),
                          color: '#b22222',
                          marginLeft: 5,
                        }}>
                        Emergency call
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    } else if (/show_guardian_toolkit/i.test(error_status)) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            height: Platform.OS === 'android' ? 350 : 360,
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
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
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
                    '.\n\nYou can track my trip in realtime here: https://www.taxiconnectna.com/sharedTrip/trip.html?link=' +
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
                <IconCommunity name="earth" color="#000" size={23} />
              </View>
              <View style={{flex: 1, marginLeft: 5}}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(20),
                    flex: 1,
                    color: '#000',
                  }}>
                  Share your trip
                </Text>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextLight'
                        : 'Uber Move Text Light',
                    fontSize: RFValue(14),
                    lineHeight: 19,
                    flex: Platform.OS === 'android' ? 1 : 0,
                    bottom: 5,
                  }}>
                  Share your live location with your friends and family.
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                call({
                  number: '+2646110111',
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
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(20),
                    flex: 1,
                    color: '#b22222',
                  }}>
                  Emergency call
                </Text>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextLight'
                        : 'Uber Move Text Light',
                    fontSize: RFValue(14),
                    lineHeight: 19,
                    flex: Platform.OS === 'android' ? 1 : 0,
                    bottom: 5,
                  }}>
                  Call the authorities immediatly if you feel a threaten.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/show_rating_driver_modal/i.test(error_status)) {
      //! Auto dismiss if no_rides status found
      if (
        this.props.App.generalTRIP_details_driverDetails === undefined ||
        this.props.App.generalTRIP_details_driverDetails.driver_details ===
          undefined ||
        this.props.App.generalTRIP_details_driverDetails.driver_details
          .profile_picture === undefined ||
        Object.keys(this.props.App.generalTRIP_details_driverDetails).length <=
          0
      ) {
        //Stop the loader and restore
        this.setState({isLoading_something: false});
        //Reset local drop off related data
        this.state.rating_score = 5;
        this.state.compliment_array = {
          neatAndTidy: false,
          excellentService: false,
          greatMusic: false,
          greatConversation: false,
          expertNavigator: false,
        };
        this.state.custom_note = false;
        this.state.request_fp = false;
        //Received a response
        this.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
        //Reset all the trips
        //this.props.ResetStateProps(this.props.parentNode);
        return <></>;
      }
      //...
      try {
        return (
          <>
            <SafeAreaView
              style={{
                backgroundColor: '#fff',
                flex: 1,
              }}>
              <View style={styles.presentationWindow}>
                <View
                  style={
                    Platform.OS === 'android'
                      ? {
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingTop: 15,
                          paddingBottom: 15,
                          backgroundColor: '#000',
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 1,
                          },
                          shadowOpacity: 0.22,
                          shadowRadius: 2.22,

                          elevation: 3,
                        }
                      : {
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingTop: 15,
                          paddingBottom: 15,
                          borderBottomWidth: 0.7,
                          borderBottomColor: '#d0d0d0',
                          backgroundColor: '#fff',
                        }
                  }>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.UpdateErrorModalLog(false, false, 'any')
                    }
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{top: 0}}>
                      <IconAnt
                        name="arrowleft"
                        color={Platform.OS === 'android' ? '#fff' : '#000'}
                        size={22}
                      />
                    </View>
                    <Text
                      style={[
                        {
                          fontSize: RFValue(20),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          marginLeft: 5,
                          color: Platform.OS === 'android' ? '#fff' : '#000',
                        },
                      ]}>
                      Rating
                    </Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={{flex: 1}}>
                  <KeyboardAvoidingView behavior={'position'}>
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
                        {this.props.App.generalTRIP_details_driverDetails
                          .driver_details.profile_picture !== undefined &&
                        this.props.App.generalTRIP_details_driverDetails
                          .driver_details.profile_picture !== null &&
                        /http/i.test(
                          this.props.App.generalTRIP_details_driverDetails
                            .driver_details.profile_picture,
                        ) ? (
                          <FastImage
                            source={{
                              uri:
                                this.props.App.generalTRIP_details_driverDetails
                                  .driver_details.profile_picture !==
                                  undefined &&
                                this.props.App.generalTRIP_details_driverDetails
                                  .driver_details.profile_picture !== null
                                  ? this.props.App
                                      .generalTRIP_details_driverDetails
                                      .driver_details.profile_picture
                                  : 'user.png',
                              priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 150,
                            }}
                          />
                        ) : (
                          <Image
                            source={require('../../Media_assets/Images/driver.jpg')}
                            style={{
                              resizeMode: 'cover',
                              width: '100%',
                              height: '100%',
                              borderRadius: 150,
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                          fontSize: RFValue(20),
                          marginTop: 10,
                        }}>
                        {
                          this.props.App.generalTRIP_details_driverDetails
                            .driver_details.name
                        }
                      </Text>
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          fontSize: RFValue(16),
                          marginTop: 4,
                        }}>
                        {this.props.App.generalTRIP_details_driverDetails.trip_details.date_requested.replace(
                          /\//g,
                          '-',
                        )}
                      </Text>
                    </View>
                    {/**Rating section */}
                    <View
                      style={{
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
                        //borderBottomWidth: 0.5,
                        paddingBottom: 25,
                        borderBottomColor: '#d0d0d0',
                      }}>
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                          fontSize: RFValue(17),
                          width: '100%',
                          textAlign: 'center',
                          color: '#757575',
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(14),
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
                              opacity: this.state.compliment_array
                                .excellentService
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(14),
                              marginTop: 10,
                              flex: 1,
                              textAlign: 'center',
                              lineHeight: 15,
                              paddingTop: 5,
                              opacity: this.state.compliment_array
                                .excellentService
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(14),
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
                              opacity: this.state.compliment_array
                                .greatConversation
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(14),
                              marginTop: 10,
                              flex: 1,
                              textAlign: 'center',
                              lineHeight: 15,
                              paddingTop: 5,
                              opacity: this.state.compliment_array
                                .greatConversation
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
                              opacity: this.state.compliment_array
                                .expertNavigator
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(14),
                              marginTop: 10,
                              flex: 1,
                              textAlign: 'center',
                              lineHeight: 15,
                              paddingTop: 5,
                              opacity: this.state.compliment_array
                                .expertNavigator
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
                          borderWidth: 1,
                          marginTop: 10,
                          width: '100%',
                          padding: 10,
                          borderColor: '#EEEEEE',
                          backgroundColor: '#EEEEEE',
                        }}>
                        <TextInput
                          placeholderTextColor="#AFAFAF"
                          placeholder="Add a personal note"
                          editable={
                            this.state.isLoading_something === false
                              ? true
                              : false
                          }
                          onChangeText={(text) =>
                            this.setState({custom_note: text})
                          }
                          maxLength={150}
                          style={{
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            fontSize: RFValue(17.5),
                            paddingTop: Platform.OS === 'android' ? 0 : 10,
                            paddingBottom: Platform.OS === 'android' ? 0 : 10,
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
                      <AdManager bottom={'3%'} />
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
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(23),
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
                  </KeyboardAvoidingView>
                </ScrollView>
              </View>
            </SafeAreaView>
          </>
        );
      } catch (error) {
        //Stop the loader and restore
        this.setState({isLoading_something: false});
        //Reset local drop off related data
        this.state.rating_score = 5;
        this.state.compliment_array = {
          neatAndTidy: false,
          excellentService: false,
          greatMusic: false,
          greatConversation: false,
          expertNavigator: false,
        };
        this.state.custom_note = false;
        this.state.request_fp = false;
        //Received a response
        this.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
        //Reset all the trips
        this.props.ResetStateProps(this.props.parentNode);
        return <></>;
      }
    } else if (/show_cancel_ride_modal/i.test(error_status)) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: '70%',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              Cancel your ride?
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 5,
            }}>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextRegular'
                    : 'Uber Move Text Light',
                fontSize: RFValue(15),
              }}>
              Help us improve your next experience.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.cancelRequest_rider('No available driver')
                  : {}
              }
              style={styles.bttnGenericTcCancelSelection}>
              {this.state.isLoading_something === false ||
              /No available driver/i.test(this.state.reason_cancelling) ===
                false ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      color: '#000',
                      flex: 1,
                      paddingRight: 10,
                    }}>
                    No available driver
                  </Text>
                  <IconCommunity name="arrow-right" color="#096ED4" size={25} />
                </View>
              ) : (
                <ActivityIndicator size="large" color="#000" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.cancelRequest_rider('Driver too close')
                  : {}
              }
              style={styles.bttnGenericTcCancelSelection}>
              {this.state.isLoading_something === false ||
              /Driver too close/i.test(this.state.reason_cancelling) ===
                false ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      color: '#000',
                      flex: 1,
                      paddingRight: 10,
                    }}>
                    Driver too close
                  </Text>
                  <IconCommunity name="arrow-right" color="#096ED4" size={25} />
                </View>
              ) : (
                <ActivityIndicator size="large" color="#000" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.cancelRequest_rider('Change of plans')
                  : {}
              }
              style={styles.bttnGenericTcCancelSelection}>
              {this.state.isLoading_something === false ||
              /Change of plans/i.test(this.state.reason_cancelling) ===
                false ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      color: '#000',
                      flex: 1,
                      paddingRight: 10,
                    }}>
                    Change of plans
                  </Text>
                  <IconCommunity name="arrow-right" color="#096ED4" size={25} />
                </View>
              ) : (
                <ActivityIndicator size="large" color="#000" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.cancelRequest_rider('Driver too far')
                  : {}
              }
              style={styles.bttnGenericTcCancelSelection}>
              {this.state.isLoading_something === false ||
              /Driver too far/i.test(this.state.reason_cancelling) === false ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      color: '#000',
                      flex: 1,
                      paddingRight: 10,
                    }}>
                    Driver too far
                  </Text>
                  <IconCommunity name="arrow-right" color="#096ED4" size={25} />
                </View>
              ) : (
                <ActivityIndicator size="large" color="#000" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.cancelRequest_rider('Just testing')
                  : {}
              }
              style={styles.bttnGenericTcCancelSelection}>
              {this.state.isLoading_something === false ||
              /Just testing/i.test(this.state.reason_cancelling) === false ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      color: '#000',
                      flex: 1,
                      paddingRight: 10,
                    }}>
                    Just testing
                  </Text>
                  <IconCommunity name="arrow-right" color="#096ED4" size={25} />
                </View>
              ) : (
                <ActivityIndicator size="large" color="#000" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.props.UpdateErrorModalLog(false, false, 'any')
                  : {}
              }
              style={[styles.bttnGenericTc, {borderRadius: 2, marginTop: 20}]}>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(20),
                  color: '#fff',
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
            height: 270,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconCommunity
              name="network-strength-1-alert"
              size={20}
              style={{marginRight: 5}}
            />
            <Text
              style={{
                ontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              Unable to request
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextLight'
                    : 'Uber Move Text',
                fontSize: RFValue(17),
                marginTop: 10,
                lineHeight: 23,
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
                  color: '#fff',
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
                  <IconFontisto name="close-a" size={20} />
                </View>
              </TouchableOpacity>
              <Text
                style={[
                  systemWeights.semibold,
                  {
                    fontSize: RFValue(25),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'MoveMedium'
                        : 'Uber Move Text Medium',
                    marginTop: 15,
                  },
                ]}>
                Payment methods
              </Text>
            </View>
            <ScrollView style={{flex: 1}}>
              <View style={{flex: 1}}>
                <View style={{flex: 1}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottomWidth: 1,
                      borderBottomColor: '#EEEEEE',
                      padding: 20,
                      paddingTop: 20,
                    }}>
                    {/**Wallet header */}
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View style={{width: 20, height: 20, marginRight: 10}}>
                        <Image
                          source={require('../../Media_assets/Images/wallet.png')}
                          style={{
                            resizeMode: 'contain',
                            width: '100%',
                            height: '100%',
                          }}
                        />
                      </View>
                      <Text
                        style={[
                          {
                            fontSize: RFValue(17),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            flex: 1,
                          },
                        ]}>
                        Your wallet
                      </Text>
                      <Text
                        style={{
                          fontSize: RFValue(20),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                          color: '#096ED4',
                        }}>
                        N${this.props.App.wallet_state_vars.totalWallet_amount}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text
                      style={{
                        fontSize: RFValue(16),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        color: '#AFAFAF',
                        padding: 20,
                        paddingBottom: 5,
                      }}>
                      Preferred method
                    </Text>
                    <View style={{marginTop: 15}}>
                      <TouchableOpacity
                        onPress={() =>
                          /^unlocked/i.test(
                            this.props.App.wallet_state_vars.wallet_state,
                          )
                            ? this.props.App.wallet_state_vars
                                .totalWallet_amount === 0
                              ? {}
                              : this.props.App.fareTripSelected !== false
                              ? this.props.App.fareTripSelected <=
                                this.props.App.wallet_state_vars
                                  .totalWallet_amount
                                ? this.props.UpdatePreferredPayment_method(
                                    'wallet',
                                  )
                                : this.props.UpdatePreferredPayment_method(
                                    'cash',
                                  )
                              : this.props.App.fareTripSelected <=
                                this.props.App.wallet_state_vars
                                  .totalWallet_amount
                              ? this.props.UpdatePreferredPayment_method(
                                  'wallet',
                                )
                              : this.props.UpdatePreferredPayment_method('cash')
                            : this.props.UpdatePreferredPayment_method('cash')
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingTop: 0,
                          paddingBottom: 5,
                          marginBottom: 20,
                          opacity: /^unlocked/i.test(
                            this.props.App.wallet_state_vars.wallet_state,
                          )
                            ? this.props.App.wallet_state_vars
                                .totalWallet_amount === 0
                              ? 0.15
                              : 1
                            : 0.15,
                        }}>
                        <View style={{width: 30, height: 30}}>
                          <Image
                            source={require('../../Media_assets/Images/wallet.png')}
                            style={{
                              resizeMode: 'contain',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            marginLeft: 10,
                            flex: 1,
                            fontSize: RFValue(18),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
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
                        }}>
                        <View style={{width: 30, height: 30}}>
                          <Image
                            source={require('../../Media_assets/Images/cash-payment.png')}
                            style={{
                              resizeMode: 'contain',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            marginLeft: 10,
                            flex: 1,
                            fontSize: RFValue(18),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                          }}>
                          Cash
                        </Text>
                        {/cash/i.test(
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
            <AdManager
              paddingLeft={20}
              paddingRight={20}
              borderRadius={5}
              bottom={'3%'}
            />
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
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(21),
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
    } else if (/show_changePersonalDetails_modal/i.test(error_status)) {
      return (
        <DismissKeyboard>
          <SafeAreaView
            style={{
              backgroundColor: '#fff',
              flex: 1,
            }}>
            <GenericLoader
              active={this.state.isLoading_something}
              thickness={5}
            />
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
                    {
                      fontSize: RFValue(22),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'MoveMedium'
                          : 'Uber Move Medium',
                      marginTop: 15,
                    },
                  ]}>
                  {/^name$/i.test(this.props.App.detailToModify)
                    ? 'Change your name'
                    : /^surname$/i.test(this.props.App.detailToModify)
                    ? 'Change your surname'
                    : /^gender$/i.test(this.props.App.detailToModify)
                    ? 'Modify the gender'
                    : /^phone$/i.test(this.props.App.detailToModify)
                    ? 'Change your phone number'
                    : /^email$/i.test(this.props.App.detailToModify)
                    ? 'Change your email'
                    : 'Oups try restarting the app.'}
                </Text>
              </View>
              <View style={{padding: 20, flex: 1}}>
                {/^name$/i.test(this.props.App.detailToModify) ? (
                  <TextInput
                    placeholderTextColor="#AFAFAF"
                    editable={!this.state.isLoading_something}
                    placeholder="What's your name?"
                    value={
                      this.state.tmpString !== null &&
                      this.state.tmpString !== undefined
                        ? this.state.tmpString
                        : this.props.App.username
                    }
                    onChangeText={(text) =>
                      this.updateLocalStateNewPersonal_infos(
                        this.props.App.detailToModify,
                        text,
                      )
                    }
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(19.5),
                      borderBottomWidth: 1.7,
                      paddingLeft: 0,
                      paddingBottom: 15,
                    }}
                  />
                ) : /^surname$/i.test(this.props.App.detailToModify) ? (
                  <TextInput
                    placeholderTextColor="#AFAFAF"
                    editable={!this.state.isLoading_something}
                    placeholder="What's your surname?"
                    value={
                      this.state.tmpString !== null &&
                      this.state.tmpString !== undefined
                        ? this.state.tmpString
                        : this.props.App.surname_user
                    }
                    onChangeText={(text) =>
                      this.updateLocalStateNewPersonal_infos(
                        this.props.App.detailToModify,
                        text,
                      )
                    }
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(19.5),
                      borderBottomWidth: 1.7,
                      paddingLeft: 0,
                      paddingBottom: 15,
                    }}
                  />
                ) : /^gender$/i.test(this.props.App.detailToModify) ? (
                  <TextInput
                    placeholderTextColor="#AFAFAF"
                    editable={!this.state.isLoading_something}
                    placeholder="What's your gender?"
                    value={
                      this.state.tmpString !== null &&
                      this.state.tmpString !== undefined
                        ? this.state.tmpString
                        : this.props.App.gender_user
                    }
                    onChangeText={(text) =>
                      this.updateLocalStateNewPersonal_infos(
                        this.props.App.detailToModify,
                        text,
                      )
                    }
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(19.5),
                      borderBottomWidth: 1.7,
                      paddingLeft: 0,
                      paddingBottom: 15,
                    }}
                  />
                ) : /^phone$/i.test(this.props.App.detailToModify) ? (
                  <PhoneNumberInput autoFocus={true} />
                ) : /^email$/i.test(this.props.App.detailToModify) ? (
                  <TextInput
                    placeholderTextColor="#AFAFAF"
                    editable={!this.state.isLoading_something}
                    placeholder="What's your email?"
                    value={
                      this.state.tmpString !== null &&
                      this.state.tmpString !== undefined
                        ? this.state.tmpString
                        : this.props.App.user_email
                    }
                    onChangeText={(text) =>
                      this.updateLocalStateNewPersonal_infos(
                        this.props.App.detailToModify,
                        text,
                      )
                    }
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(19.5),
                      borderBottomWidth: 1.7,
                      paddingLeft: 0,
                      paddingBottom: 15,
                    }}
                  />
                ) : (
                  <TextInput placeholderTextColor="#AFAFAF" placeholder="" />
                )}
                {this.state.isErrorThrown ? (
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(15),
                      marginTop: 15,
                      color: '#b22222',
                    }}>
                    {this.state.errorString_template}
                  </Text>
                ) : null}
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  paddingLeft: 20,
                  paddingRight: 20,
                  height: 100,
                }}>
                {this.state.isLoading_something === false ? (
                  this.props.App.renderCountryCodeSeacher === false ? (
                    <TouchableOpacity
                      onPress={() =>
                        this.state.isLoading_something
                          ? {}
                          : this.updatePersonalInfos(
                              this.state.tmpString,
                              this.props.App.detailToModify,
                            )
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
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextMedium'
                                  : 'Uber Move Text Medium',
                              fontSize: RFValue(22),
                              color: '#fff',
                            },
                          ]}>
                          Save
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null
                ) : null}
              </View>
            </View>
          </SafeAreaView>
        </DismissKeyboard>
      );
    } else if (/show_signOff_modal/i.test(error_status)) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            height: 340,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                fontSize: RFValue(20),
              }}>
              Do you want to sign out?
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextLight'
                    : 'Uber Move Text',
                fontSize: RFValue(17),
                marginTop: 10,
                lineHeight: 23,
              }}>
              Stay signed in to book your next ride or delivery faster.
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                this.state.isLoading_something === false
                  ? this.signOff_theApp()
                  : {}
              }
              style={[
                styles.bttnGenericTc,
                {borderRadius: 2, marginBottom: 20, backgroundColor: '#E2E2E2'},
              ]}>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
                  color: '#000',
                }}>
                {this.state.isLoading_something === false ? (
                  'Yes, sign out'
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
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(21),
                  color: '#fff',
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (/show_simplified_searchLocations/i.test(error_status)) {
      return (
        <SafeAreaView
          style={{
            backgroundColor: '#fff',
            flex: 1,
          }}>
          <Search
            showSimplified={true}
            favoritePlace_label={this.props.App.favoritePlace_label}
          />
        </SafeAreaView>
      );
    } else if (/showStatus_gettingSharedTrip_details/i.test(error_status)) {
      //? Will always append the message type at the end of the "error_status" with a __ (double underscore)
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 0,
            height: 340,
          }}>
          {/gettingLink/i.test(error_status) ? (
            <GenericLoader active={true} thickness={3} />
          ) : null}
          <View
            style={{
              padding: 20,
              flex: 1,
              paddingTop: 0,
            }}>
            {/gettingLink/i.test(error_status) ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                    fontSize: RFValue(20),
                  }}>
                  Getting the trip shared with you
                </Text>
              </View>
            ) : /errorGetting/i.test(error_status) ? (
              <View style={{flex: 1}}>
                <View
                  style={{
                    flex: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconAnt name="closecircleo" size={35} color={'#b22222'} />
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextBold'
                          : 'Uber Move Text Bold',
                      fontSize: RFValue(20),
                      marginTop: 15,
                    }}>
                    We couldn't get the shared link.
                  </Text>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      marginTop: 10,
                      textAlign: 'center',
                    }}>
                    Due to an unexpected error, we were unable to link you to
                    the shared trip.
                  </Text>
                </View>
                <View style={{flex: 1, justifyContent: 'center'}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.UpdateErrorModalLog(false, false, 'any')
                    }
                    style={[styles.bttnGenericTc, {borderRadius: 2}]}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextBold'
                            : 'Uber Move Text Bold',
                        fontSize: RFValue(21),
                        color: '#fff',
                      }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : /doneTrip/i.test(error_status) ? (
              <View style={{flex: 1}}>
                <View
                  style={{
                    flex: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconAnt name="checkcircleo" color="#09864A" size={35} />
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextBold'
                          : 'Uber Move Text Bold',
                      fontSize: RFValue(20),
                      marginTop: 15,
                    }}>
                    Trip already completed
                  </Text>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      marginTop: 10,
                      textAlign: 'center',
                    }}>
                    Call the sender of this link to confirm the successful
                    dropoff. Thank you.
                  </Text>
                </View>
                <View style={{flex: 1, justifyContent: 'center'}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.UpdateErrorModalLog(false, false, 'any')
                    }
                    style={[styles.bttnGenericTc, {borderRadius: 2}]}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextBold'
                            : 'Uber Move Text Bold',
                        fontSize: RFValue(21),
                        color: '#fff',
                      }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : /tripInProgress/i.test(error_status) ? (
              <View style={{flex: 1}}>
                <View
                  style={{
                    flex: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconAnt name="closecircleo" size={35} color={'#b22222'} />
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextBold'
                          : 'Uber Move Text Bold',
                      fontSize: RFValue(20),
                      marginTop: 15,
                    }}>
                    You have a trip in progress
                  </Text>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      marginTop: 10,
                      textAlign: 'center',
                    }}>
                    Sorry you cannot track someone else's trip while you have an
                    active one.
                  </Text>
                </View>
                <View style={{flex: 1, justifyContent: 'center'}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.UpdateErrorModalLog(false, false, 'any')
                    }
                    style={[styles.bttnGenericTc, {borderRadius: 2}]}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextBold'
                            : 'Uber Move Text Bold',
                        fontSize: RFValue(21),
                        color: '#fff',
                      }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{flex: 1}}>
                <View
                  style={{
                    flex: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconAnt name="closecircleo" size={35} color={'#b22222'} />
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextBold'
                          : 'Uber Move Text Bold',
                      fontSize: RFValue(20),
                      marginTop: 15,
                    }}>
                    We couldn't get the shared link.
                  </Text>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      marginTop: 10,
                      textAlign: 'center',
                    }}>
                    Due to an unexpected error, we were unable to link you to
                    the shared trip.
                  </Text>
                </View>
                <View style={{flex: 1, justifyContent: 'center'}}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.UpdateErrorModalLog(false, false, 'any')
                    }
                    style={[styles.bttnGenericTc, {borderRadius: 2}]}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextBold'
                            : 'Uber Move Text Bold',
                        fontSize: RFValue(21),
                        color: '#fff',
                      }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      );
    } else if (/show_refer_driver_dialog/i.test(error_status)) {
      //! DEBUG INFOS
      //this.state.referral_infos.step_name = 'error_whileReferring';
      //! -------------
      return (
        <SafeAreaView
          style={{
            backgroundColor: '#fff',
            flex: 1,
          }}>
          <Animated.View
            style={[
              styles.presentationWindow,
              {
                opacity: this.state.referral_infos.animation_vars.opacity,
                transform: [
                  {
                    translateX: this.state.referral_infos.animation_vars
                      .left_position,
                  },
                ],
              },
            ]}>
            {/**Refer a driver: enter taxi number */}
            {/enterTaxiNumber/i.test(this.state.referral_infos.step_name) ? (
              <>
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
                      {
                        fontSize: RFValue(24),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'MoveBold'
                            : 'Uber Move Bold',
                        marginTop: 15,
                      },
                    ]}>
                    Refer a driver
                  </Text>
                </View>
                {this.state.isLoading_something === false ? null : (
                  <GenericLoader
                    active={this.state.isLoading_something}
                    thickness={5}
                  />
                )}
                <View style={{padding: 20, flex: 1}}>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(16),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        marginBottom: '7%',
                        color: '#525252',
                      },
                    ]}>
                    Please enter the Taxi number of the driver that you wish to
                    refer.
                  </Text>
                  <TextInput
                    placeholderTextColor="#AFAFAF"
                    editable={!this.state.isLoading_something}
                    placeholder="What's the Taxi number?"
                    value={
                      this.state.referral_infos.driver_infos.taxi_number !==
                        null &&
                      this.state.referral_infos.driver_infos.taxi_number !==
                        undefined
                        ? this.state.referral_infos.driver_infos.taxi_number
                        : ''
                    }
                    onChangeText={(text) => {
                      this.state.referral_infos.showErrors.taxi_number = false;
                      this.state.referral_infos.driver_infos.taxi_number = text.trim();
                      this.forceUpdate();
                    }}
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(19.5),
                      borderBottomWidth: 1.7,
                      paddingLeft: 0,
                      paddingBottom: 15,
                    }}
                  />
                  {this.state.referral_infos.showErrors.taxi_number ? (
                    <Text
                      style={[
                        {
                          fontSize: RFValue(16),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          marginTop: '4%',
                          color: '#b22222',
                        },
                      ]}>
                      {this.state.referral_infos.errorsStrings.taxi_number !==
                        null &&
                      this.state.referral_infos.errorsStrings.taxi_number !==
                        undefined
                        ? this.state.referral_infos.errorsStrings.taxi_number
                        : ''}
                    </Text>
                  ) : null}
                </View>
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
                      this.state.isLoading_something === false
                        ? this.moveForward_WithReferral_steps(
                            'enterFullDetails',
                          )
                        : {}
                    }
                    style={{
                      borderColor: 'transparent',
                      width: '100%',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <View style={[styles.bttnGenericTc, {flex: 1}]}>
                      {this.state.isLoading_something === false ? (
                        <>
                          <Text
                            style={[
                              {
                                fontFamily:
                                  Platform.OS === 'android'
                                    ? 'UberMoveTextMedium'
                                    : 'Uber Move Text Medium',
                                fontSize: RFValue(22),
                                color: '#fff',
                                flex: 1,
                                textAlign: 'center',
                              },
                            ]}>
                            Next
                          </Text>
                          <IconCommunity
                            name="arrow-right"
                            color={'#fff'}
                            size={28}
                          />
                        </>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : /enterFullDetails/i.test(
                this.state.referral_infos.step_name,
              ) ? (
              <>
                <View
                  style={{
                    padding: 20,
                    paddingTop: 15,
                    paddingBottom: 15,
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.moveForward_WithReferral_steps('enterTaxiNumber')
                    }
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{top: 0}}>
                      <IconAnt name="arrowleft" size={25} />
                    </View>
                  </TouchableOpacity>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(24),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'MoveBold'
                            : 'Uber Move Bold',
                        marginTop: 15,
                      },
                    ]}>
                    Refer a driver
                  </Text>
                </View>
                {this.state.isLoading_something === false ? null : (
                  <GenericLoader
                    active={this.state.isLoading_something}
                    thickness={5}
                  />
                )}
                <View style={{padding: 20, flex: 1}}>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(16),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        marginBottom: '7%',
                        color: '#525252',
                      },
                    ]}>
                    Please fill in the remaining driver information to complete
                    your referral
                  </Text>
                  {/**Name */}
                  <TextInput
                    placeholderTextColor="#AFAFAF"
                    autoFocus={true}
                    editable={!this.state.isLoading_something}
                    placeholder="Driver's name"
                    value={
                      this.state.referral_infos.driver_infos.name !== null &&
                      this.state.referral_infos.driver_infos.name !== undefined
                        ? this.state.referral_infos.driver_infos.name
                        : ''
                    }
                    onChangeText={(text) => {
                      this.state.referral_infos.showErrors.driver_name = false;
                      this.state.referral_infos.driver_infos.name = text.trim();
                      this.forceUpdate();
                    }}
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(19.5),
                      borderBottomWidth: 1.7,
                      paddingLeft: 0,
                      paddingBottom: 10,
                      marginBottom: '10%',
                    }}
                  />
                  {this.state.referral_infos.showErrors.driver_name ? (
                    <Text
                      style={[
                        {
                          fontSize: RFValue(16),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          marginBottom: '5%',
                          color: '#b22222',
                        },
                      ]}>
                      {this.state.referral_infos.errorsStrings.driver_name !==
                        null &&
                      this.state.referral_infos.errorsStrings.driver_name !==
                        undefined
                        ? this.state.referral_infos.errorsStrings.driver_name
                        : ''}
                    </Text>
                  ) : null}
                  {/**Phone */}
                  <PhoneNumberInput autoFocus={false} />
                </View>
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
                      this.state.isLoading_something === false
                        ? this.moveForward_WithReferral_steps(
                            'finalizeFormSubmit',
                          )
                        : {}
                    }
                    style={{
                      borderColor: 'transparent',
                      width: '100%',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <View style={[styles.bttnGenericTc, {flex: 1}]}>
                      {this.state.isLoading_something === false ? (
                        <>
                          <Text
                            style={[
                              {
                                fontFamily:
                                  Platform.OS === 'android'
                                    ? 'UberMoveTextMedium'
                                    : 'Uber Move Text Medium',
                                fontSize: RFValue(22),
                                color: '#fff',
                                flex: 1,
                                textAlign: 'center',
                              },
                            ]}>
                            Refer
                          </Text>
                          <IconCommunity
                            name="arrow-right"
                            color={'#fff'}
                            size={28}
                          />
                        </>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : /alreadyReferred/i.test(this.state.referral_infos.step_name) ? (
              <>
                <View
                  style={{
                    padding: 20,
                    paddingTop: 15,
                    paddingBottom: 15,
                    width: '100%',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.UpdateErrorModalLog(false, false, 'any');
                      this.clearReferralData();
                    }}
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{top: 0}}>
                      <IconAnt name="arrowleft" size={25} />
                    </View>
                  </TouchableOpacity>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      marginBottom: '6%',
                      marginTop: '7%',
                    }}>
                    <IconMaterialIcons
                      name="error"
                      color={'#b22222'}
                      size={45}
                    />
                  </View>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(24),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'MoveMedium'
                            : 'Uber Move Medium',
                        marginTop: 15,
                        textAlign: 'center',
                      },
                    ]}>
                    Driver already referred
                  </Text>
                </View>
                <View style={{padding: 20, flex: 1}}>
                  <Text
                    style={[
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(18),
                        flex: 1,
                        textAlign: 'center',
                      },
                    ]}>
                    Sorry this driver is already referred by someone else,
                    please try referring another driver.
                  </Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    paddingLeft: 20,
                    paddingRight: 20,
                    height: 100,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.UpdateErrorModalLog(false, false, 'any');
                      //! Clear data
                      this.clearReferralData();
                    }}
                    style={{
                      borderColor: 'transparent',
                      width: '100%',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <View style={[styles.bttnGenericTc, {flex: 1}]}>
                      <Text
                        style={[
                          {
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(22),
                            color: '#fff',
                            flex: 1,
                            textAlign: 'center',
                          },
                        ]}>
                        Close
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : /isADriver/i.test(this.state.referral_infos.step_name) ? (
              <>
                <View
                  style={{
                    padding: 20,
                    paddingTop: 15,
                    paddingBottom: 15,
                    width: '100%',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.UpdateErrorModalLog(false, false, 'any');
                      this.clearReferralData();
                    }}
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{top: 0}}>
                      <IconAnt name="arrowleft" size={25} />
                    </View>
                  </TouchableOpacity>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      marginBottom: '6%',
                      marginTop: '7%',
                    }}>
                    <IconMaterialIcons
                      name="check-circle"
                      color={'#09864A'}
                      size={45}
                    />
                  </View>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(24),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'MoveMedium'
                            : 'Uber Move Medium',
                        marginTop: 15,
                        color: '#09864A',
                        textAlign: 'center',
                      },
                    ]}>
                    TaxiConnect Partner
                  </Text>
                </View>
                <View style={{padding: 20, flex: 1}}>
                  <Text
                    style={[
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(18),
                        flex: 1,
                        textAlign: 'center',
                      },
                    ]}>
                    Sorry you can only refer drivers that are not yet
                    TaxiConnect partners.
                  </Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    paddingLeft: 20,
                    paddingRight: 20,
                    height: 100,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.UpdateErrorModalLog(false, false, 'any');
                      //! Clear data
                      this.clearReferralData();
                    }}
                    style={{
                      borderColor: 'transparent',
                      width: '100%',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <View style={[styles.bttnGenericTc, {flex: 1}]}>
                      <Text
                        style={[
                          {
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(22),
                            color: '#fff',
                            flex: 1,
                            textAlign: 'center',
                          },
                        ]}>
                        Close
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : /successfullyReferred/i.test(
                this.state.referral_infos.step_name,
              ) ? (
              <>
                <View
                  style={{
                    padding: 20,
                    paddingTop: 15,
                    paddingBottom: 15,
                    width: '100%',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.UpdateErrorModalLog(false, false, 'any');
                      this.clearReferralData();
                    }}
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{top: 0}}>
                      <IconAnt name="arrowleft" size={25} />
                    </View>
                  </TouchableOpacity>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      marginBottom: '6%',
                      marginTop: '7%',
                    }}>
                    <IconMaterialIcons
                      name="check-circle"
                      color={'#09864A'}
                      size={45}
                    />
                  </View>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(24),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'MoveBold'
                            : 'Uber Move Bold',
                        marginTop: 15,
                        color: '#09864A',
                        textAlign: 'center',
                      },
                    ]}>
                    Referral received
                  </Text>
                </View>
                <View style={{padding: 20, flex: 1}}>
                  <Text
                    style={[
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(18),
                        flex: 1,
                        textAlign: 'center',
                      },
                    ]}>
                    We have received your referral for taxi driver (
                    <Text style={{fontWeight: 'bold'}}>
                      {this.state.referral_infos.driver_infos.taxi_number !==
                        null &&
                      this.state.referral_infos.driver_infos.taxi_number !==
                        undefined
                        ? this.state.referral_infos.driver_infos.taxi_number.toUpperCase()
                        : 'Current'}
                    </Text>
                    ). Upon the driver's successful onboarding, you will be
                    notified to claim your{' '}
                    <Text style={{fontWeight: 'bold'}}>NAD50.00</Text>.
                  </Text>
                  <Text
                    style={[
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(18),
                        color: '#fff',
                        flex: 1,
                        marginTop: '2%',
                      },
                    ]}>
                    Thank you!
                  </Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    paddingLeft: 20,
                    paddingRight: 20,
                    height: 100,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.UpdateErrorModalLog(false, false, 'any');
                      //! Clear data
                      this.clearReferralData();
                    }}
                    style={{
                      borderColor: 'transparent',
                      width: '100%',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <View style={[styles.bttnGenericTc, {flex: 1}]}>
                      <Text
                        style={[
                          {
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(22),
                            color: '#fff',
                            flex: 1,
                            textAlign: 'center',
                          },
                        ]}>
                        Close
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : /error_whileReferring/i.test(
                this.state.referral_infos.step_name,
              ) ? (
              <>
                <View
                  style={{
                    padding: 20,
                    paddingTop: 15,
                    paddingBottom: 15,
                    width: '100%',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.UpdateErrorModalLog(false, false, 'any');
                      this.clearReferralData();
                    }}
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{top: 0}}>
                      <IconAnt name="arrowleft" size={25} />
                    </View>
                  </TouchableOpacity>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      marginBottom: '6%',
                      marginTop: '7%',
                    }}>
                    <IconMaterialIcons
                      name="error"
                      color={'#b22222'}
                      size={45}
                    />
                  </View>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(24),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'MoveMedium'
                            : 'Uber Move Medium',
                        marginTop: 15,
                        textAlign: 'center',
                      },
                    ]}>
                    Unable to refer the driver
                  </Text>
                </View>
                <View style={{padding: 20, flex: 1}}>
                  <Text
                    style={[
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(18),
                        flex: 1,
                        textAlign: 'center',
                      },
                    ]}>
                    Sorry due to an unexpected error, we were unable to
                    successfully complete your referral request. Please try
                    again later.
                  </Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    paddingLeft: 20,
                    paddingRight: 20,
                    height: 100,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.UpdateErrorModalLog(false, false, 'any');
                      //! Clear data
                      this.clearReferralData();
                    }}
                    style={{
                      borderColor: 'transparent',
                      width: '100%',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <View style={[styles.bttnGenericTc, {flex: 1}]}>
                      <Text
                        style={[
                          {
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(22),
                            color: '#fff',
                            flex: 1,
                            textAlign: 'center',
                          },
                        ]}>
                        Close
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </Animated.View>
        </SafeAreaView>
      );
    } else {
      this.props.UpdateErrorModalLog(false, false, 'any');
      return <></>;
    }
  }

  /**
   * @func clearReferralData
   * Responsibel for clearing the referral information after usage.
   */
  clearReferralData() {
    this.props.ResetGenericPhoneNumberInput();
    this.setState({
      referral_infos: {
        driver_infos: {
          taxi_number: null,
          name: null,
          phone_number: null,
        },
        step_name: 'enterTaxiNumber', //The name of the current step window: enterTaxiNumber, enterFullDetails, successfullyReferred, alreadyReferred, isADriver
        request_status: null, //The status of the request: null, successful, alreadyReferred, isADriver
        showErrors: {
          taxi_number: false,
          driver_name: false,
        }, //Whether or now to show the error strings of the corresponding fields.
        errorsStrings: {
          taxi_number: null,
          driver_name: null,
        }, //Errors strings of the corresponding fields.
        animation_vars: {
          left_position: new Animated.Value(0),
          opacity: new Animated.Value(1),
        },
      },
    });
  }

  /**
   * @func moveForward_WithReferral_steps
   * Responsible for managing the navigation flow of the referral windows and all the
   * checkings and API calls in between.
   * @param step: the step to be moved to -> enterTaxiNumber, enterFullDetails, alreadyReferred, isADriver, successfullyReferred, error_whileReferring
   */
  moveForward_WithReferral_steps(step) {
    if (/enterTaxiNumber/i.test(step)) {
      let that = this;
      //Go back to the initial route
      Animated.parallel([
        Animated.timing(
          that.state.referral_infos.animation_vars.left_position,
          {
            toValue: -100,
            duration: 250,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          },
        ),
        Animated.timing(that.state.referral_infos.animation_vars.opacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }),
      ]).start(() => {
        //?0 Move back the previous screen first!
        that.state.referral_infos.step_name = step;
        that.state.referral_infos.driver_infos.name = null;
        that.state.referral_infos.driver_infos.phone_number = null;
        that.forceUpdate();
        //1. Reset the generic and later state phone numbers
        that.props.ResetGenericPhoneNumberInput();
        //...
        Animated.parallel([
          Animated.timing(
            that.state.referral_infos.animation_vars.left_position,
            {
              toValue: 0,
              duration: 250,
              easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
              useNativeDriver: true,
            },
          ),
          Animated.timing(that.state.referral_infos.animation_vars.opacity, {
            toValue: 1,
            duration: 200,
            easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
            useNativeDriver: true,
          }),
        ]).start(() => {});
      });
    } else if (/enterFullDetails/i.test(step)) {
      //Move the full details entry if the checks are true
      let newState = this.state.referral_infos;
      //1. Check that the enterTaxiNumber field is not empty.
      this.state.referral_infos.driver_infos.taxi_number =
        this.state.referral_infos.driver_infos.taxi_number !== null &&
        this.state.referral_infos.driver_infos.taxi_number !== undefined
          ? this.state.referral_infos.driver_infos.taxi_number
          : '';
      if (this.state.referral_infos.driver_infos.taxi_number.length >= 3) {
        //2. Check the Taxi number free state and decide whether or not to move forward.
        //! Activate the loader
        this.setState({isLoading_something: true});
        this.props.App.socket.emit('referralOperations_perform_io', {
          user_fingerprint: this.props.App.user_fingerprint,
          user_nature: 'rider',
          action: 'check',
          taxi_number: this.state.referral_infos.driver_infos.taxi_number,
        });
      } else if (
        this.state.referral_infos.driver_infos.taxi_number.length > 0 &&
        this.state.referral_infos.driver_infos.taxi_number.length < 3
      ) {
        //Too short
        //Show error empty taxi number
        newState.errorsStrings.taxi_number = 'Taxi number too short';
        newState.showErrors.taxi_number = true;
        //...
        this.state.referral_infos = newState;
        this.forceUpdate();
      }
      //Empty taxi number
      else {
        //Show error empty taxi number
        newState.errorsStrings.taxi_number =
          'Please enter a Taxi number first.';
        newState.showErrors.taxi_number = true;
        //...
        this.state.referral_infos = newState;
        this.forceUpdate();
      }
    } else if (/finalizeFormSubmit/i.test(step)) {
      this.props.ValidateGenericPhoneNumber();
      //! Check that the name and phone number are set
      this.state.referral_infos.driver_infos.name =
        this.state.referral_infos.driver_infos.name !== undefined &&
        this.state.referral_infos.driver_infos.name !== null
          ? this.state.referral_infos.driver_infos.name
          : '';
      if (this.state.referral_infos.driver_infos.name.trim().length > 0) {
        //! Check the phone number
        if (this.props.App.isPhoneNumberValid) {
          //Valid phone
          this.setState({isLoading_something: true});
          //Submit the referral
          let infoSubmit = {
            user_fingerprint: this.props.App.user_fingerprint,
            user_nature: 'rider',
            action: 'submit',
            taxi_number: this.state.referral_infos.driver_infos.taxi_number,
            driver_name: this.state.referral_infos.driver_infos.name,
            driver_phone: this.props.App.finalPhoneNumber,
          };
          //...
          this.props.App.socket.emit(
            'referralOperations_perform_io',
            infoSubmit,
          );
        } //Invalid phone
        else {
          //Do nothing
        }
      } //Empty name field
      else {
        //Show error empty taxi number
        this.state.referral_infos.errorsStrings.driver_name =
          "Please enter the driver's name";
        this.state.referral_infos.showErrors.driver_name = true;
        //...
        this.forceUpdate();
      }
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
            //useNativeDriverForBackdrop={true}
            onBackButtonPress={() =>
              this.props.UpdateErrorModalLog(false, false, 'any')
            }
            onBackdropPress={() =>
              /(show_guardian_toolkit|show_cancel_ride_modal|show_select_ride_type_modal|gender_select)/i.test(
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
            animationInTiming={200}
            animationOutTiming={200}
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
  presentationWindow: {
    flex: 1,
  },
  bttnGenericTcCancelSelection: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    borderRadius: 2,
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
      ValidateGenericPhoneNumber,
      UpdatePreferredPayment_method,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(ErrorModal),
);
