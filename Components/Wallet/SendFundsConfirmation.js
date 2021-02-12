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
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {RFValue} from 'react-native-responsive-fontsize';

class PayDriverConfirmation extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
  }

  componentWillUnmount() {
    if (this.backHander !== null) {
      this.backHander.remove();
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
                  fontSize: RFValue(17),
                  lineHeight: 23,
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextLight'
                      : 'Uber Move Text Light',
                  marginBottom: 20,
                },
              ]}>
              You are about to send cab fare.
            </Text>

            <View style={{flex: 1}}>
              {/**Destination infos */}
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#EEEEEE',
                  marginTop: 5,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <IconCommunity name="information" size={17} />
                  <Text
                    style={[
                      {
                        fontSize: RFValue(18),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        marginLeft: 5,
                      },
                    ]}>
                    Receiver's information
                  </Text>
                </View>
                <Text
                  style={{
                    marginTop: 20,
                    fontSize: RFValue(17),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                    marginBottom: 5,
                  }}>
                  {this.props.App.recipient_crucial_data.receipient_name}
                </Text>
                {/**ONLY FOR DRIVERS */}
                {/driver/i.test(this.props.App.user_sender_nature) ? (
                  <Text
                    style={{
                      fontSize: RFValue(17),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      marginBottom: 5,
                      color: '#0e8491',
                    }}>
                    {this.props.App.paymentNumberOrTaxiNumber}
                  </Text>
                ) : null}
                {/**--- */}
                <Text
                  style={{
                    fontSize: RFValue(17),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    marginBottom: 20,
                    color: '#0e8491',
                  }}>
                  {this.props.App.recipient_crucial_data.recipient_number}
                </Text>
              </View>

              <View style={{marginTop: 20}}>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextLight'
                        : 'Uber Move Text Light',
                    marginBottom: 10,
                  }}>
                  {this.props.App.userCurrentLocationMetaData.city !==
                    undefined &&
                  this.props.App.userCurrentLocationMetaData.city !== false
                    ? this.props.App.userCurrentLocationMetaData.city
                    : this.props.App.userCurrentLocationMetaData.street !==
                        undefined &&
                      this.props.App.userCurrentLocationMetaData.street !==
                        false
                    ? this.props.App.userCurrentLocationMetaData.street
                    : this.props.App.userCurrentLocationMetaData.country !==
                        undefined &&
                      this.props.App.userCurrentLocationMetaData.country !==
                        false
                    ? this.props.App.userCurrentLocationMetaData.country
                    : null}
                  {this.props.App.userCurrentLocationMetaData.country !==
                    undefined &&
                  this.props.App.userCurrentLocationMetaData.country !== false
                    ? `, ${this.props.App.userCurrentLocationMetaData.country}`
                    : null}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                marginBottom: 10,
              }}>
              <Text
                style={[
                  {
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                    fontSize: RFValue(14),
                    lineHeight: 19,
                    color: '#a5a5a5',
                    flex: 1,
                  },
                ]}>
                There will be no handling charges deducted.
              </Text>
            </View>

            <View
              style={{
                width: '100%',
                alignItems: 'center',
                height: 100,
              }}>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('TransactionFinalReport')
                }
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
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(22),
                        color: '#fff',
                      },
                    ]}>
                    {`Proceed - N$${this.props.App.recipient_crucial_data.amount}`}
                  </Text>
                </View>
              </TouchableOpacity>
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
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(PayDriverConfirmation));
