import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  BackHandler,
  Platform,
} from 'react-native';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {
  ResetGenericPhoneNumberInput,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';
import ErrorModal from '../Helpers/ErrorModal';
import SyncStorage from 'sync-storage';
import {RFValue} from 'react-native-responsive-fontsize';

class CreateAccountEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
    this._isMounted = false;

    this._shouldShow_errorModal = true; //! ERROR MODAL AUTO-LOCKER - PERFORMANCE IMPROVER.

    this.state = {
      networkStateChecker: false,
      loaderState: false,
      creatingAccount: false, //To know whether the Taxiconnect account is being created or not.
    };
  }

  componentDidMount() {
    let that = this;
    this._isMounted = true; //? mark component as mounted

    this.state.creatingAccount = false; //? Reinitialize creating account state var to false.
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        if (that.state.creatingAccount === false) {
          that.props.navigation.navigate('PhoneDetailsScreen');
        }
        return true;
      },
    );

    /**
     * SOCKET.IO RESPONSES
     */
    //1. Creating account response
    this.props.App.socket.on(
      'createInitialRider_account-response',
      function (response) {
        that.setState({loaderState: false}); //Stop loader
        //...
        if (response !== false && response.response !== undefined) {
          if (
            !/error/i.test(response.response) &&
            response.user_fp !== undefined &&
            response.user_fp !== null
          ) {
            //Successfully created
            //Save the fingerprint
            that.props.App.user_fingerprint = response.user_fp; //Save user fingerprint
            SyncStorage.set('@user_fp', response.user_fp);
            //Move forward
            that.props.navigation.navigate('NewAccountAdditionalDetails');
          } //error creating account
          else {
            that.props.App.user_fingerprint = null; //Nullify user fingerprint
            SyncStorage.remove('@user_fp');

            that.setState({creatingAccount: false}); //Reactivate basic view with create account button
            that.props.UpdateErrorModalLog(
              true,
              'error_creating_account',
              'any',
            );
          }
        } //Error creating the account
        else {
          that.props.App.user_fingerprint = null; //Nullify user fingerprint
          SyncStorage.remove('@user_fp');

          that.setState({creatingAccount: false}); //Reactivate basic view with create account button
          that.props.UpdateErrorModalLog(true, 'error_creating_account', 'any');
        }
      },
    );
  }

  componentWillUnmount() {
    //Reset phone number
    this.props.ResetGenericPhoneNumberInput();
    if (this.state.networkStateChecker !== false) {
      this.state.networkStateChecker();
    }
    //...
    /*if (this.backHander !== null) {
      this.backHander.remove();
    }*/
    //? Mark component as unmounted
    this._isMounted = false;
  }

  /**
   * @func goBackFUncPhoneInput
   * Responsible for going back the phone number verification and
   * most importantly reset the validity of the phone number and it's value
   *
   */
  goBackFUncPhoneInput() {
    this.props.ResetGenericPhoneNumberInput();
    this.props.navigation.navigate('PhoneDetailsScreen');
  }

  /**
   * @func createNewAccount
   * Responsible for creating a new minimal rider account with PHONE NUMBER!
   */
  createNewAccount() {
    if (
      this.props.App.finalPhoneNumber !== false &&
      this.props.App.finalPhoneNumber !== undefined &&
      this.props.App.finalPhoneNumber !== null
    ) {
      //Create
      this.setState({loaderState: true, creatingAccount: true});
      this.props.App.socket.emit('createInitialRider_account', {
        phone_number: this.props.App.finalPhoneNumber,
        pushnotif_token: this.props.App.pushnotif_token,
      });
    } //Missing phone number - go back to phone input
    else {
      this.goBackFUncPhoneInput();
    }
  }

  /**
   * @func gobackFromAdditionalDetails
   * Reponsible for going back to entry screen and auto erase the user fp
   */
  gobackFromAdditionalDetails() {
    this.props.App.user_fingerprint = null; //Nullify user fingerprint
    this.props.navigation.navigate('PhoneDetailsScreen');
  }

  /**
   * @func renderError_modalView
   * Responsible for rendering the modal view only once.
   */
  renderError_modalView() {
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

  render() {
    return (
      <SafeAreaView style={styles.mainWindow}>
        <GenericLoader active={this.state.loaderState} thickness={4} />
        {this.props.App.generalErrorModal_vars.showErrorGeneralModal
          ? this.renderError_modalView()
          : null}
        <View style={styles.presentationWindow}>
          <TouchableOpacity
            style={{opacity: this.state.creatingAccount === false ? 1 : 0}}
            onPress={() =>
              this.state.creatingAccount === false
                ? this.gobackFromAdditionalDetails()
                : {}
            }>
            <IconAnt name="arrowleft" size={29} />
          </TouchableOpacity>
          <Text
            style={[
              {
                fontSize: RFValue(30),
                fontFamily:
                  Platform.OS === 'android' ? 'MoveBold' : 'Uber Move Bold',
                marginTop: 15,
                marginBottom: 35,
                width: '100%',
                textAlign: 'center',
              },
            ]}>
            {this.state.creatingAccount === false ? 'Hi' : 'Give us a sec'}
          </Text>
          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
            }}>
            <Image
              source={require('../../Media_assets/Images/newDriverWelcome.jpg')}
              style={{resizeMode: 'contain', width: '105%', height: '105%'}}
            />
          </View>
          <Text
            style={[
              {
                flex: 1,
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextMedium'
                    : 'Uber Move Text Medium',
                color: '#000',
                fontSize: RFValue(20),
                marginTop: '10%',
                textAlign: 'center',
                width: '100%',
              },
            ]}>
            {this.state.creatingAccount === false
              ? 'Would you like to create a new account?'
              : 'Creating your super account...'}
          </Text>
          {this.state.creatingAccount === false ? (
            <View>
              <Text
                style={[
                  {
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextLight'
                        : 'Uber Move Text Light',
                    color: '#000',
                    fontSize: RFValue(14),
                    textAlign: 'left',
                    width: '100%',
                    lineHeight: 20,
                    marginBottom: 15,
                  },
                ]}>
                By clicking{' '}
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                  }}>
                  Create your account
                </Text>
                , you automatically accept our{' '}
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    color: '#0e8491',
                  }}>
                  terms and conditions.
                </Text>
              </Text>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  height: 100,
                }}>
                <TouchableOpacity
                  onPress={() => this.createNewAccount()}
                  style={{
                    borderWidth: 1,
                    borderColor: 'transparent',
                    width: '100%',
                  }}>
                  <View style={[styles.bttnGenericTc]}>
                    <Text
                      style={[
                        {
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextBold'
                              : 'Uber Move Text Bold',
                          fontSize: RFValue(23),
                          color: '#fff',
                        },
                      ]}>
                      Create your account
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
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

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(CreateAccountEntry),
);
