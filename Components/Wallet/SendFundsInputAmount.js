import React from 'react';
import {connect} from 'react-redux';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Platform,
} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {TextInput} from 'react-native-gesture-handler';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {RFValue} from 'react-native-responsive-fontsize';

class SendFundsInputAmount extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
    this._navigatorEvent = null;

    this.state = {
      amountInputed: null, //Will hold the amount inserted by the user - default: null
      showErrorWithAmount: false, //Whether or not to show an error linked to the amount inserted. - default: false
      errorWithAmountMessage: null, //The message to display for the corresponding error - default: null
    };
  }

  componentWillUnmount() {
    if (this.backHander !== null) {
      this.backHander.remove();
    }
    //...
    if (this._navigatorEvent !== null) {
      this._navigatorEvent();
      this._navigatorEvent = null;
    }
  }

  componentDidMount() {
    let globalObject = this;

    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.goBack();
        return true;
      },
    );

    //? Add navigator listener - auto clean on focus
    this._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        if (
          globalObject.props.App.recipient_crucial_data.amount !== undefined &&
          globalObject.props.App.recipient_crucial_data.amount !== null
        ) {
          globalObject.props.App.recipient_crucial_data.amount = null; //! Clear amount data if any
        }

        globalObject.setState({
          amountInputed: null,
          showErrorWithAmount: false,
          errorWithAmountMessage: null,
        });
      },
    );
  }

  /**
   * @func activelyCheck_amountToSend
   * Responsible for checking as the user types that the amount criteria's are strictly respected.
   * ? Remove all spaces.
   * @param currentText
   */
  activelyCheck_amountToSend(currentText) {
    try {
      currentText = parseFloat(currentText.trim());
      if (!isNaN(currentText)) {
        //Not NaN
        this.setState({
          amountInputed: currentText,
          showErrorWithAmount: false,
        });
      } //NaN
      else {
        this.setState({
          amountInputed: null,
          showErrorWithAmount: false,
        });
      }
    } catch (error) {
      this.setState({amountInputed: null, showErrorWithAmount: false});
    }
  }

  /**
   * @func validateAmount_inserted
   * Responsible for validating and moving to the confirmation page of the process if amount valid.
   */
  validateAmount_inserted() {
    let amountInserted = parseFloat(this.state.amountInputed);

    if (amountInserted > 0 && amountInserted <= 1000) {
      //Valid amount
      this.props.App.recipient_crucial_data['amount'] = amountInserted; //! SAVE THE AMOUNT INSERTED
      this.props.navigation.navigate('SendFundsConfirmation');
    } //In valid amount
    else {
      if (amountInserted <= 0) {
        //Should be at least N$1
        this.setState({
          showErrorWithAmount: true,
          errorWithAmountMessage: 'Should be at least N$1',
          amountInputed: null,
        });
      } else if (amountInserted > 1000) {
        //To high
        this.setState({
          showErrorWithAmount: true,
          errorWithAmountMessage: 'Should be at most N$1000',
          amountInputed: null,
        });
      } //Strange amount
      else {
        this.setState({
          showErrorWithAmount: true,
          errorWithAmountMessage: 'Please insert a valid amount',
          amountInputed: null,
        });
      }
    }
  }

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <StatusBar backgroundColor="#000" />
          <View style={styles.presentationWindow}>
            <Text
              style={[
                {
                  fontSize: RFValue(21),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text',
                  marginBottom: 35,
                  marginTop: 10,
                },
              ]}>
              How much?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                padding: 10,
                paddingLeft: 0,
                borderColor: '#E2E2E2',
              }}>
              <Text
                style={{
                  fontSize: RFValue(20),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  paddingRight: 5,
                }}>
                N$
              </Text>
              <TextInput
                placeholderTextColor="#AFAFAF"
                style={{
                  fontSize: RFValue(20),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  flex: 1,
                }}
                value={
                  this.state.amountInputed !== undefined &&
                  this.state.amountInputed !== null
                    ? String(this.state.amountInputed)
                    : ''
                }
                onChangeText={(text) => this.activelyCheck_amountToSend(text)}
                maxLength={4}
                placeholder="Amount"
                keyboardType="number-pad"
                autoFocus
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: '8%',
                alignItems: 'center',
                width: '100%',
              }}>
              <View
                style={{
                  marginRight: 5,
                  justifyContent: 'flex-start',
                }}>
                <IconAnt
                  name="infocirlce"
                  color={
                    this.state.showErrorWithAmount === false
                      ? '#0e8491'
                      : '#b22222'
                  }
                  size={15}
                />
              </View>
              {this.state.showErrorWithAmount === false ? (
                <Text
                  style={[
                    {
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      color: '#000',
                      fontSize: 15,
                      lineHeight: 20,
                      flex: 1,
                    },
                  ]}>
                  Your maximum amount is{' '}
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                    }}>
                    N$1000.
                  </Text>
                </Text>
              ) : (
                <Text
                  style={[
                    {
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      color: '#b22222',
                      fontSize: 15,
                      lineHeight: 20,
                      flex: 1,
                    },
                  ]}>
                  {this.state.errorWithAmountMessage}
                </Text>
              )}
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
                    {
                      fontSize: RFValue(14),
                      marginLeft: 6,
                      lineHeight: 18,
                      color: '#141414',
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                    },
                  ]}>
                  Visit the <Text style={{fontWeight: 'bold'}}>Support</Text>{' '}
                  tab for any queries.
                </Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={() => this.validateAmount_inserted()}
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

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(SendFundsInputAmount));
