import React from 'react';
import {connect} from 'react-redux';
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
import SyncStorage from 'sync-storage';

class EntryScreen extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    //Check for the user_fp
    //Get persisted data and update the general state
    //user_fp, pushnotif_token, userCurrentLocationMetaData, latitude, longitude
    await SyncStorage.init();
    let user_fp = SyncStorage.get('@user_fp');
    let pushnotif_token = SyncStorage.get('@pushnotif_token');
    let userCurrentLocationMetaData = SyncStorage.get(
      '@userCurrentLocationMetaData',
    );
    let userLocationPoint = SyncStorage.get('@userLocationPoint');
    let gender_user = SyncStorage.get('@gender_user');
    let username = SyncStorage.get('@username');
    let surname = SyncStorage.get('@surname_user');
    let user_email = SyncStorage.get('@user_email');
    let phone = SyncStorage.get('@phone_user');
    let user_profile_pic = SyncStorage.get('@user_profile_pic');

    //Update globals
    this.props.App.gender_user = gender_user;
    this.props.App.username = username;
    this.props.App.surname_user = surname;
    this.props.App.user_email = user_email;
    this.props.App.phone_user = phone;
    this.props.App.user_profile_pic = user_profile_pic;
    this.props.App.user_fingerprint = user_fp;
    this.props.App.pushnotif_token = pushnotif_token;
    try {
      userCurrentLocationMetaData = JSON.parse(userCurrentLocationMetaData);
      this.props.App.userCurrentLocationMetaData = userCurrentLocationMetaData;
    } catch (error) {
      this.props.App.userCurrentLocationMetaData = {};
    }
    //..
    try {
      userLocationPoint = JSON.parse(userLocationPoint);
      this.props.App.latitude = userLocationPoint.latitude;
      this.props.App.longitude = userLocationPoint.longitude;
    } catch (error) {
      this.props.App.latitude = 0;
      this.props.App.longitude = 0;
    }
    //...
    if (
      this.props.App.user_fingerprint !== undefined &&
      this.props.App.user_fingerprint !== null &&
      this.props.App.user_fingerprint !== false &&
      this.props.App.user_fingerprint.length > 40
    ) {
      this.props.navigation.navigate('Home');
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.mainWindow}>
        <StatusBar backgroundColor="#0e8491" />
        <TouchableOpacity
          style={{flex: 1}}
          onPressIn={() =>
            this.props.navigation.navigate('PhoneDetailsScreen')
          }>
          <View style={styles.presentationWindow}>
            <View
              style={{
                backgroundColor: '#fff',
                width: 60,
                height: 60,
                borderRadius: 100,
                marginTop: '5%',
              }}>
              <Image
                source={require('../../Media_assets/Images/logo.png')}
                style={{
                  resizeMode: 'contain',
                  width: '100%',
                  height: '100%',
                  borderRadius: 300,
                }}
              />
            </View>
            <View style={{flex: 1, width: '100%'}}>
              <Image
                source={require('../../Media_assets/Images/entryImage0.png')}
                style={{resizeMode: 'contain', width: '105%', height: '105%'}}
              />
            </View>
            <View style={{height: 70}}>
              <Text
                style={[
                  systemWeights.bold,
                  {
                    fontSize: 25,
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    color: '#fff',
                  },
                ]}>
                Get yourself a safe ride.
              </Text>
            </View>
          </View>
          <View
            style={{
              height: 170,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              paddingLeft: '8%',
              paddingRight: '8%',
            }}>
            <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
              <IconMaterialIcons
                name="phone"
                size={25}
                style={{marginRight: 5}}
                color="#000"
              />
              <Text
                style={[
                  systemWeights.regular,
                  {fontFamily: 'Allrounder-Grotesk-Book', fontSize: 19},
                ]}>
                What's your phone number?
              </Text>
            </View>
            <IconMaterialIcons
              name="arrow-forward-ios"
              size={20}
              color="#0e8491"
            />
          </View>
        </TouchableOpacity>
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
    backgroundColor: '#0e8491',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default connect(mapStateToProps)(EntryScreen);
