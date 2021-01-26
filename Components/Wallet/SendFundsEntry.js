import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  BackHandler,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import IconEntypo from 'react-native-vector-icons/Entypo';
import DismissKeyboard from '../Helpers/DismissKeyboard';

class SendFundsEntry extends React.PureComponent {
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
                systemWeights.semibold,
                {
                  fontSize: 21,
                  fontFamily: 'Allrounder-Grotesk-Book',
                  marginBottom: 30,
                  marginTop: 10,
                  padding: 20,
                },
              ]}>
              Easily transfer funds to anyone.
            </Text>
            <View>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('SendFundsFriendInputNumber')
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#d0d0d0',
                  paddingBottom: 35,
                  paddingLeft: 20,
                  paddingRight: 20,
                  marginBottom: 40,
                }}>
                <View style={{flexDirection: 'row', flex: 1, minHeight: 70}}>
                  <View style={{width: 35, paddingTop: 1}}>
                    <IconFontAwesome5
                      name="mobile"
                      size={25}
                      style={{marginRight: 8}}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        {
                          fontSize: 19,
                          fontFamily: 'Allrounder-Grotesk-Medium',
                          color: '#0e8491',
                          flex: 1,
                        },
                      ]}>
                      Send to friends
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: 'Allrounder-Grotesk-Book',
                        lineHeight: 17,
                        fontSize: 13.5,
                      }}>
                      Send rides or deliveries money to your friends and family
                      instantlly and hustle free.
                    </Text>
                  </View>
                </View>
                <View style={{height: '100%', paddingTop: 5}}>
                  <IconMaterialIcons
                    name="arrow-forward-ios"
                    size={14}
                    color="#000"
                  />
                </View>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 0,
                  borderBottomColor: '#d0d0d0',
                  paddingBottom: 25,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}>
                <View style={{flexDirection: 'row', flex: 1, minHeight: 70}}>
                  <View style={{width: 35, paddingTop: 1}}>
                    <IconEntypo
                      name="flash"
                      size={25}
                      style={{marginRight: 8}}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        {
                          fontSize: 19,
                          fontFamily: 'Allrounder-Grotesk-Medium',
                          color: '#0e8491',
                          flex: 1,
                        },
                      ]}>
                      Pay a driver
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: 'Allrounder-Grotesk-Book',
                        lineHeight: 17,
                        fontSize: 13.5,
                      }}>
                      Directly send payments to your driver's wallet seamlessly
                      without any VAT.
                    </Text>
                  </View>
                </View>
                <View style={{height: '100%', paddingTop: 5}}>
                  <IconMaterialIcons
                    name="arrow-forward-ios"
                    size={14}
                    color="#000"
                  />
                </View>
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

export default SendFundsEntry;
