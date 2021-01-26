import React from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  BackHandler,
  Linking,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import call from 'react-native-phone-call';

class SupportEntry extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  handleBackButton = () => {
    this.props.navigation.navigate('Home_drawer');
    return true;
  };

  componentDidMount() {
    let globalObject = this;
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    //Add home going back handler-----------------------------
    this.props.navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      globalObject.props.navigation.navigate('Home_drawer');
      return;
    });
    //--------------------------------------------------------
  }

  render() {
    return (
      <ScrollView style={styles.mainContainer}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
              marginBottom: '5%',
            }}>
            <View style={{width: 32, height: 32}}>
              <Image
                source={require('../../Media_assets/Images/supportIcon.png')}
                style={{width: '100%', height: '100%', resizeMode: 'cover'}}
              />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'Allrounder-Grotesk-Regular',
                marginLeft: 5,
              }}>
              We're available 24/7h for you.
            </Text>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
            }}>
            <Text
              style={{
                textAlign: 'left',
                fontSize: 17,
                lineHeight: 23,
                fontFamily: 'Allrounder-Grotesk-Book',
              }}>
              If you <Text style={{fontWeight: 'bold'}}>left</Text> your
              belongings in the taxi or you need{' '}
              <Text style={{fontWeight: 'bold'}}>assistance</Text> on using the{' '}
              <Text style={{fontWeight: 'bold'}}>TaxiConnect platform</Text>.
            </Text>
            <Text
              style={{
                textAlign: 'left',
                marginBottom: 20,
                fontSize: 17,
                lineHeight: 23,
                fontFamily: 'Allrounder-Grotesk-Book',
              }}>
              If there is an <Text style={{fontWeight: 'bold'}}>emergency</Text>{' '}
              and you need to contact the{' '}
              <Text style={{fontWeight: 'bold'}}>police</Text>.
            </Text>
          </View>
          {/**Buttons */}
          <TouchableOpacity
            style={[styles.bttnGenericTc, {marginBottom: 20, marginTop: '10%'}]}
            onPress={() => call({number: '+264814400089', prompt: true})}>
            <IconCommunity
              name="phone"
              color={'#fff'}
              size={25}
              style={{marginRight: 5}}
            />
            <Text
              style={{
                fontSize: 22,
                color: '#fff',
                fontFamily: 'Allrounder-Grotesk-Medium',
              }}>
              Call TaxiConnect
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bttnGenericTc}
            onPress={() => call({number: '061302302', prompt: true})}>
            <IconCommunity
              name="shield"
              color={'#fff'}
              size={25}
              style={{marginRight: 5}}
            />
            <Text
              style={{
                fontSize: 22,
                color: '#fff',
                fontFamily: 'Allrounder-Grotesk-Medium',
              }}>
              Call City Police
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  bttnGenericTc: {
    borderColor: 'red',
    padding: 12,
    height: 60,
    width: '100%',
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

export default SupportEntry;
