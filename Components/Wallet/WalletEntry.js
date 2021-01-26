import React from 'react';
import {connect} from 'react-redux';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SectionList,
  StatusBar,
  BackHandler,
} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import WalletTransacRecords from './WalletTransacRecords';
import {systemWeights} from 'react-native-typography';
import DismissKeyboard from '../Helpers/DismissKeyboard';

class WalletEntry extends React.PureComponent {
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

    //Add home going back handler-----------------------------
    this.props.navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      globalObject.props.navigation.navigate('Home_drawer');
      return;
    });
    //--------------------------------------------------------
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.navigate('Home_drawer');
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
            <View
              style={{
                padding: 20,
                backgroundColor: '#fff',
                height: 200,
                marginBottom: 15,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: 'Allrounder-Grotesk-Regular',
                    fontSize: 18,
                    color: '#0e8491',
                  }}>
                  Hey, Dominique
                </Text>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 200,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 7,
                    },
                    shadowOpacity: 0.41,
                    shadowRadius: 9.11,

                    elevation: 14,
                  }}>
                  <Image
                    source={
                      this.props.App.user_profile_pic !== undefined &&
                      this.props.App.user_profile_pic !== null
                        ? {
                            uri: this.props.App.user_profile_pic,
                            cache: 'reload',
                          }
                        : require('../../Media_assets/Images/user.png')
                    }
                    style={{
                      resizeMode:
                        this.props.App.user_profile_pic !== undefined &&
                        this.props.App.user_profile_pic !== null
                          ? 'cover'
                          : 'contain',
                      width:
                        this.props.App.user_profile_pic !== undefined &&
                        this.props.App.user_profile_pic !== null
                          ? '100%'
                          : '60%',
                      height:
                        this.props.App.user_profile_pic !== undefined &&
                        this.props.App.user_profile_pic !== null
                          ? '100%'
                          : '80%',
                      borderRadius:
                        this.props.App.user_profile_pic !== undefined &&
                        this.props.App.user_profile_pic !== null
                          ? 200
                          : 0,
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  //marginTop: 25,
                  flex: 1,
                  justifyContent: 'center',
                }}>
                <Text
                  style={[
                    systemWeights.bold,
                    {
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      fontSize: 36,
                      color: '#0e8491',
                    },
                  ]}>
                  N$450
                </Text>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Regular',
                    color: '#a5a5a5',
                    fontSize: 16,
                  }}>
                  Your balance
                </Text>
              </View>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#d0d0d0',
                borderBottomWidth: 1,
                flex: 1,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                backgroundColor: '#fff',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 20,
                }}>
                {/**Send money */}
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('SendFundsEntry')
                  }
                  style={{alignItems: 'center', marginRight: '11%'}}>
                  <View
                    style={[
                      styles.selectMenu3,
                      {
                        backgroundColor: '#000',
                        borderWidth: 0,
                      },
                    ]}>
                    <IconFeather name="share" size={30} color={'#fff'} />
                  </View>
                  <Text style={[styles.textSelectMenu3, {color: '#000'}]}>
                    Send
                  </Text>
                </TouchableOpacity>

                {/**Top-up wallet */}
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('WalletTopUpEntry')
                  }
                  style={{alignItems: 'center', marginRight: '11%'}}>
                  <View
                    style={[
                      styles.selectMenu3,
                      {
                        backgroundColor: '#000',
                        borderWidth: 0,
                      },
                    ]}>
                    <IconMaterialIcons
                      name="account-balance-wallet"
                      size={30}
                      color={'#fff'}
                    />
                  </View>
                  <Text style={[styles.textSelectMenu3, {color: '#000'}]}>
                    Top-up
                  </Text>
                </TouchableOpacity>

                <View
                  style={[styles.selectMenu3, {borderWidth: 2, opacity: 0}]}>
                  <IconMaterialIcons name="shield" size={30} />
                  <Text style={styles.textSelectMenu3}>Secure</Text>
                </View>
              </View>
              <View style={{padding: 20, flex: 1}}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    paddingBottom: 10,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      fontSize: 18,
                      color: '#a5a5a5',
                      paddingBottom: 15,
                      flex: 1,
                    }}>
                    Last transaction
                  </Text>
                  <Text
                    style={[
                      {
                        fontFamily: 'Allrounder-Grotesk-Medium',
                        fontSize: 17.5,
                        color: '#a5a5a5',
                        paddingBottom: 15,
                        fontWeight: 'bold',
                      },
                    ]}>
                    Show all
                  </Text>
                </TouchableOpacity>

                <View style={{flex: 1}}>
                  <SectionList
                    sections={[
                      {
                        title: 'Top-up',
                        data: [{transaction_type: 'topup', amount: 50}],
                      },
                    ]}
                    keyboardShouldPersistTaps={'always'}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({item}) => <WalletTransacRecords />}
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
  selectMenu3: {
    borderWidth: 1,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 250,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  textSelectMenu3: {
    fontFamily: 'Allrounder-Grotesk-Medium',
    fontSize: 17.5,
    marginTop: 10,
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

export default connect(mapStateToProps)(WalletEntry);
