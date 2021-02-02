import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TextInput,
  BackHandler,
  Platform,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontisto from 'react-native-vector-icons/Fontisto';
import IconEntypo from 'react-native-vector-icons/Entypo';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {
  ResetGenericPhoneNumberInput,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';
import NetInfo from '@react-native-community/netinfo';
import ErrorModal from '../Helpers/ErrorModal';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';
import EmailValidator from '../Helpers/EmailValidator';
import SyncStorage from 'sync-storage';
import {RFValue} from 'react-native-responsive-fontsize';

class NewAccountAdditionalDetails extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;

    this._shouldShow_errorModal = true; //! ERROR MODAL AUTO-LOCKER - PERFORMANCE IMPROVER.

    this.state = {
      gender: 'male',
      name: '',
      email: '',
      showErrorName: false, //When the name is less than 2 characters -deafult:false
      showEmailError: false, //When the email's format is wrong. - defautl:false
      completingAccountProfile: false, //To know whether the app is completing the profile or not - default:false
      networkStateChecker: false,
      currentFocusName: 'name', //To know which field is currently focused
    };
  }

  componentDidMount() {
    let globalObject = this;
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        if (globalObject.state.completingAccountProfile === false) {
          globalObject.props.navigation.navigate('EntryScreen');
        }
        return true;
      },
    );

    //Reset phone number
    this.props.ResetGenericPhoneNumberInput();
    //Network state checker
    this.state.networkStateChecker = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        globalObject.props.UpdateErrorModalLog(
          state.isConnected,
          'connection_no_network',
          state.type,
        );
      } //connected
      else {
        globalObject.props.UpdateErrorModalLog(false, false, state.type);
      }
    });
    //connection
    this.props.App.socket.on('connect', () => {
      if (
        !/gender_select/i.test(globalObject.props.App.generalErrorModalType)
      ) {
        //Do not interrupt the select gender process
        globalObject.props.UpdateErrorModalLog(false, false, 'any');
      }
    });
    //Socket error handling
    this.props.App.socket.on('error', (error) => {});
    this.props.App.socket.on('disconnect', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_error', () => {
      //Ask for the OTP again
      if (
        !/gender_select/i.test(globalObject.props.App.generalErrorModalType)
      ) {
        //Do not interrupt the select gender process
        globalObject.props.UpdateErrorModalLog(
          true,
          'service_unavailable',
          'any',
        );
      }
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_timeout', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect', () => {});
    this.props.App.socket.on('reconnect_error', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect_failed', () => {
      globalObject.props.App.socket.connect();
    });

    /**
     * SOCKET.IO RESPONSES
     */
    //1. Complete profile details.
    this.props.App.socket.on(
      'updateAdditionalProfileData-response',
      function (response) {
        console.log(response);
        globalObject.setState({loaderState: false}); //stop loader
        if (response !== false && response.response !== undefined) {
          if (!/error/i.test(response.response)) {
            //Success
            //Update the general state infos and move forward
            //! Save the user_fp and the rest of the globals
            globalObject.props.App.user_fingerprint = response.user_fp;
            globalObject.props.App.gender_user = response.gender;
            globalObject.props.App.username = response.name;
            globalObject.props.App.surname_user = response.surname;
            globalObject.props.App.user_email = response.email;
            globalObject.props.App.phone_user = response.phone_number;
            globalObject.props.App.user_profile_pic = response.profile_picture;
            globalObject.props.App.pushnotif_token = response.pushnotif_token;
            //! Save to storage as well.
            SyncStorage.set('@user_fp', response.user_fp);
            SyncStorage.set('@gender_user', response.gender);
            SyncStorage.set('@username', response.name);
            SyncStorage.set('@surname_user', response.surname);
            SyncStorage.set('@user_email', response.email);
            SyncStorage.set('@phone_user', response.phone_number);
            SyncStorage.set('@user_profile_pic', response.profile_picture);
            SyncStorage.set('@accountCreation_state', 'full');
            //....
            globalObject.state.accountCreation_state = 'full';
            //Move to home
            globalObject.props.navigation.navigate('Home');
          } //Error updating the addition details - show error, but can proceed
          else {
            //Remove storage
            SyncStorage.remove('@user_fp');
            SyncStorage.remove('@username');
            SyncStorage.remove('@gender_user');
            SyncStorage.remove('@user_email');
            SyncStorage.set('@accountCreation_state', 'minimal');
            //....
            globalObject.state.accountCreation_state = 'minimal';

            globalObject.props.UpdateErrorModalLog(
              true,
              'error_adding_additional_profile_details_new_account',
              'any',
            );
          }
        } //Error updating the addition details - show error, but can proceed
        else {
          //Remove storage
          SyncStorage.remove('@user_fp');
          SyncStorage.remove('@username');
          SyncStorage.remove('@gender_user');
          SyncStorage.remove('@user_email');
          SyncStorage.set('@accountCreation_state', 'minimal');
          //....
          globalObject.state.accountCreation_state = 'minimal';

          globalObject.props.UpdateErrorModalLog(
            true,
            'error_adding_additional_profile_details_new_account',
            'any',
          );
        }
      },
    );
  }

  componentWillUnmount() {
    //Remove the network state listener
    if (this.state.networkStateChecker !== false) {
      this.state.networkStateChecker();
    }
    //...
    if (this.backHander !== null) {
      this.backHander.remove();
    }
  }

  /**
   * @func updateCurrentFocused_field
   * To update the current field under focused.
   * @param name: the name of the field or none for no fields unfocused.
   * Also hide errors
   */
  updateCurrentFocused_field(name) {
    this.setState({
      currentFocusName: name,
      showEmailError: /email/i.test(name) ? false : this.state.showEmailError,
      showErrorName: /name/i.test(name) ? false : this.state.showErrorName,
    });
  }

  /**
   * @func showModalGenderSelecter
   * Responsible for showing the modal to select the gender
   */
  showModalGenderSelecter() {
    Keyboard.dismiss(); //Hide keyboard
    this.props.UpdateErrorModalLog(true, 'gender_select', 'any');
  }

  /**
   * @func validateAdditionalProfileInfos
   * Responsible for checking the name, gender and email, then request for a profile update for this user (ufp).
   * Can also handle errors linked the those details if any.
   */
  validateAdditionalProfileInfos() {
    //Hide previous errors first - and show loader
    this.setState({
      loaderState: true,
      showErrorName: false,
      showEmailError: false,
    });
    //Check the name
    if (this.state.name.trim().length >= 2) {
      //Good
      //Check the email
      if (EmailValidator(this.state.email)) {
        console.log({
          name: this.state.name,
          email: this.state.email,
          gender: this.props.App.gender_user,
          user_fingerprint: this.props.App.user_fingerprint,
        });
        //Good
        let user_fingerprint = this.props.App.user_fingerprint;
        if (user_fingerprint !== undefined && user_fingerprint !== null) {
          //Good
          //Request for profile update
          this.props.App.socket.emit('updateAdditionalProfileData', {
            name: this.state.name,
            email: this.state.email,
            gender: this.props.App.gender_user,
            user_fingerprint: user_fingerprint,
          });
        } //Go back to entry screen
        else {
          //this.props.navigation.navigate('EntryScreen');
        }
      } //Email with wrong format error
      else {
        this.setState({loaderState: false, showEmailError: true});
      }
    } //SHort name error
    else {
      this.setState({loaderState: false, showErrorName: true});
    }
  }

  /**
   * @func renderError_modalView
   * Responsible for rendering the modal view only once.
   */
  renderError_modalView() {
    if (
      this._shouldShow_errorModal &&
      this.props.App.generalErrorModal_vars.showErrorGeneralModal
    ) {
      //Show once, and lock
      this._shouldShow_errorModal = false; //!LOCK MODAL
      return (
        <ErrorModal
          active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
          error_status={
            this.props.App.generalErrorModal_vars.generalErrorModalType
          }
          parentNode={this}
        />
      );
    } else if (
      this.props.App.generalErrorModal_vars.showErrorGeneralModal === false
    ) {
      //Disable modal lock when modal off
      this._shouldShow_errorModal = true; //!UNLOCK MODAL
      return (
        <ErrorModal
          active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
          error_status={
            this.props.App.generalErrorModal_vars.generalErrorModalType
          }
          parentNode={this}
        />
      );
    } else {
      return (
        <ErrorModal
          active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
          error_status={
            this.props.App.generalErrorModal_vars.generalErrorModalType
          }
          parentNode={this}
        />
      );
    }
  }

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <GenericLoader active={this.state.loaderState} thickness={4} />
          {this.props.App.generalErrorModal_vars.showErrorGeneralModal
            ? this.renderError_modalView()
            : null}
          <View style={styles.presentationWindow}>
            <TouchableOpacity
              onPress={() =>
                this.state.completingAccountProfile === false
                  ? this.props.navigation.navigate('EntryScreen')
                  : {}
              }>
              <IconAnt name="arrowleft" size={29} />
            </TouchableOpacity>
            <Text
              style={[
                {
                  fontSize: RFValue(22),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Medium',
                  marginTop: 15,
                  marginBottom: 35,
                  textAlign: 'center',
                },
              ]}>
              Welcome to TaxiConnect!
            </Text>

            <View>
              <TextInput
                placeholder="What's your name?"
                onFocus={() => this.updateCurrentFocused_field('name')}
                onBlur={() => this.updateCurrentFocused_field('none')}
                autoFocus
                onChangeText={(text) => this.setState({name: text})}
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text Regular',
                  fontSize: RFValue(18.5),
                  borderBottomWidth: /name/i.test(this.state.currentFocusName)
                    ? 1.5
                    : 1.5,
                  borderBottomColor: /name/i.test(this.state.currentFocusName)
                    ? '#0e8491'
                    : '#000',
                  paddingBottom: 20,
                  paddingLeft: 0,
                }}
              />
              {this.state.showErrorName ? (
                <Text
                  style={[
                    {
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text Regular',
                      color: '#b22222',
                      fontSize: RFValue(14),
                      marginTop: 10,
                    },
                  ]}>
                  Should be at least 2 characters long.
                </Text>
              ) : null}
            </View>

            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                marginTop: '10%',
                marginBottom: 15,
                fontSize: RFValue(14),
                color: '#a5a5a5',
              }}>
              Gender
            </Text>
            <TouchableOpacity
              onPress={() => this.showModalGenderSelecter()}
              style={{
                borderBottomWidth: 1.5,
                paddingBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {/^male$/i.test(this.props.App.gender_user) ? (
                <IconFontisto name="male" size={18} color="#0e8491" />
              ) : /^female$/i.test(this.props.App.gender_user) ? (
                <IconFontisto name="female" size={18} color="#0e8491" />
              ) : (
                <IconEntypo name="block" size={18} color="#0e8491" />
              )}

              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text Regular',
                  fontSize: RFValue(18.5),
                  marginLeft: 5,
                  flex: 1,
                  alignItems: 'center',
                }}>
                {/^male$/i.test(this.props.App.gender_user)
                  ? 'Male'
                  : /^female$/i.test(this.props.App.gender_user)
                  ? 'Female'
                  : 'Rather not say'}
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-down"
                color={'#000'}
                size={22}
              />
            </TouchableOpacity>

            <View>
              <TextInput
                placeholder="Email"
                onChangeText={(text) => this.setState({email: text})}
                onFocus={() => this.updateCurrentFocused_field('email')}
                onBlur={() => this.updateCurrentFocused_field('none')}
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text Regular',
                  fontSize: RFValue(18.5),
                  borderBottomWidth: /email/i.test(this.state.currentFocusName)
                    ? 1.5
                    : 1.5,
                  borderBottomColor: /email/i.test(this.state.currentFocusName)
                    ? '#0e8491'
                    : '#000',
                  paddingBottom: 20,
                  paddingLeft: 0,
                  marginTop: '11%',
                  zIndex: 10,
                }}
              />
              {this.state.showEmailError ? (
                <Text
                  style={[
                    {
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text Regular',
                      color: '#b22222',
                      fontSize: RFValue(14),
                      marginTop: 10,
                    },
                  ]}>
                  The email looks wrong.
                </Text>
              ) : null}
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
              <View style={{flexDirection: 'row', flex: 1}}>
                <Text style={[{fontSize: 12, marginLeft: 6}]}></Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={() => this.validateAdditionalProfileInfos()}
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
          </View>
        </SafeAreaView>
      </DismissKeyboard>
    );
  }
}

const styles = StyleSheet.create({
  mainWindow: {
    flex: 1,
    backgroundColor: '#fff',
  },
  presentationWindow: {
    flex: 1,
    padding: 20,
    paddingRight: 30,
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
  root: {flex: 1, padding: 20},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 20},
  cell: {
    flex: 1,
    height: 40,
    lineHeight: 38,
    marginRight: 20,
    fontSize: 25,
    borderBottomWidth: 2,
    borderColor: '#00000030',
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#000',
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
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NewAccountAdditionalDetails);
