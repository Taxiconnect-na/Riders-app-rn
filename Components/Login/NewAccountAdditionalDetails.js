import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
  TextInput,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import DropDownPicker from 'react-native-dropdown-picker';
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

class NewAccountAdditionalDetails extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      gender: 'male',
      name: '',
      email: '',
      showErrorName: false, //When the name is less than 2 characters -deafult:false
      showEmailError: false, //When the email's format is wrong. - defautl:false
      completingAccountProfile: false, //To know whether the app is completing the profile or not - default:false
      networkStateChecker: false,
    };
  }

  componentDidMount() {
    let globalObject = this;
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

      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
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
    this.props.App.socket.on('error', (error) => {
      //console.log('something');
    });
    this.props.App.socket.on('disconnect', () => {
      //console.log('something');
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_error', () => {
      console.log('connect_error');
      //Ask for the OTP again
      if (
        !/gender_select/i.test(globalObject.props.App.generalErrorModalType)
      ) {
        //Do not interrupt the select gender process
        globalObject.props.UpdateErrorModalLog(
          true,
          'connection_no_network',
          'any',
        );
      }
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_timeout', () => {
      console.log('connect_timeout');
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect', () => {
      ////console.log('something');
    });
    this.props.App.socket.on('reconnect_error', () => {
      console.log('reconnect_error');
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect_failed', () => {
      console.log('reconnect_failed');
      globalObject.props.App.socket.connect();
    });

    /**
     * SOCKET.IO RESPONSES
     */
    //1. Complete profile details.
    this.props.App.socket.on(
      'updateAdditionalProfileData-response',
      function (response) {
        globalObject.setState({loaderState: false}); //stop loader
        if (response !== false && response.response !== undefined) {
          if (!/error/i.test(response.response)) {
            //Success
            //Update the general state infos and move forward
            globalObject.props.App.username = response.name;
            globalObject.props.App.gender_user = response.gender;
            globalObject.props.App.email = response.email;
            //Move to home
            globalObject.props.navigation.navigate('Home');
          } //Error updating the addition details - show error, but can proceed
          else {
            globalObject.props.UpdateErrorModalLog(
              true,
              'error_adding_additional_profile_details_new_account',
              'any',
            );
          }
        } //Error updating the addition details - show error, but can proceed
        else {
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
        //Good
        let user_fingerprint = SyncStorage.get('@ufp');
        if (user_fingerprint !== undefined) {
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
          this.props.navigation.navigate('EntryScreen');
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

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <GenericLoader active={this.state.loaderState} />
          <ErrorModal
            active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
            error_status={
              this.props.App.generalErrorModal_vars.generalErrorModalType
            }
            parentNode={this}
          />
          <View style={styles.presentationWindow}>
            <TouchableOpacity>
              <IconAnt name="arrowleft" size={29} />
            </TouchableOpacity>
            <Text
              style={[
                systemWeights.semibold,
                {
                  fontSize: 19,
                  fontFamily: 'Allrounder-Grotesk-Book',
                  marginTop: 15,
                  marginBottom: 35,
                },
              ]}>
              Welcome to TaxiConnect!
            </Text>

            <View>
              <TextInput
                placeholder="What's your name?"
                autoFocus
                onChangeText={(text) => this.setState({name: text})}
                style={{
                  fontFamily: 'Allrounder-Grotesk-Book',
                  fontSize: 18,
                  borderBottomWidth: 0.7,
                  paddingBottom: 20,
                  paddingLeft: 0,
                }}
              />
              {this.state.showErrorName ? (
                <Text
                  style={[
                    {
                      fontFamily: 'Allrounder-Grotesk-Book',
                      color: '#b22222',
                      fontSize: 15,
                      marginTop: 10,
                    },
                  ]}>
                  Should be at least 2 characters long.
                </Text>
              ) : null}
            </View>

            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Book',
                marginTop: '10%',
                marginBottom: 10,
                fontSize: 13,
              }}>
              Gender
            </Text>
            <TouchableOpacity
              onPress={() => this.showModalGenderSelecter()}
              style={{
                borderBottomWidth: 0.7,
                paddingBottom: 10,
                flexDirection: 'row',
              }}>
              {/^male$/i.test(this.props.App.gender_user) ? (
                <IconFontisto name="male" size={18} color="#0e8491" />
              ) : /^female$/i.test(this.props.App.gender_user) ? (
                <IconFontisto name="female" size={18} color="#0e8491" />
              ) : (
                <IconEntypo
                  name="block"
                  size={18}
                  style={{top: 2}}
                  color="#0e8491"
                />
              )}

              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 17,
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
                color={'#0e8491'}
                size={22}
              />
            </TouchableOpacity>

            <View>
              <TextInput
                placeholder="Email"
                onChangeText={(text) => this.setState({email: text})}
                style={{
                  fontFamily: 'Allrounder-Grotesk-Book',
                  fontSize: 18,
                  borderBottomWidth: 0.7,
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
                      fontFamily: 'Allrounder-Grotesk-Book',
                      color: '#b22222',
                      fontSize: 15,
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
                <Text
                  style={[
                    systemWeights.light,
                    {fontSize: 12, marginLeft: 6},
                  ]}></Text>
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
