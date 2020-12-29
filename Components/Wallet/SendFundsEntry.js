import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import IconEntypo from 'react-native-vector-icons/Entypo';

class SendFundsEntry extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.mainWindow}>
        <View style={styles.presentationWindow}>
          <Text
            style={[
              systemWeights.semibold,
              {
                fontSize: 18,
                fontFamily: 'Allrounder-Grotesk-Book',
                marginBottom: 20,
                padding: 20,
              },
            ]}>
            Easily transfer funds to anyone.
          </Text>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 0.5,
                paddingBottom: 25,
                paddingLeft: 20,
                paddingRight: 20,
                marginBottom: 30,
              }}>
              <View style={{flexDirection: 'row', flex: 1}}>
                <View style={{width: 40}}>
                  <IconFontAwesome5
                    name="hands-helping"
                    size={25}
                    style={{marginRight: 8}}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    color: '#0e8491',
                  }}>
                  Send to friends
                </Text>
              </View>
              <IconMaterialIcons
                name="arrow-forward-ios"
                size={17}
                color="#0e8491"
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 0.5,
                paddingBottom: 25,
                paddingLeft: 20,
                paddingRight: 20,
              }}>
              <View style={{flexDirection: 'row', flex: 1}}>
                <View style={{width: 40}}>
                  <IconEntypo name="flash" size={25} style={{marginRight: 8}} />
                </View>
                <Text
                  style={[
                    {
                      fontSize: 18,
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      color: '#0e8491',
                    },
                  ]}>
                  Send to friends
                </Text>
              </View>
              <IconMaterialIcons
                name="arrow-forward-ios"
                size={18}
                color="#0e8491"
              />
            </View>
          </View>
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
