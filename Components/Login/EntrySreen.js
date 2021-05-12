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
  Platform,
} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SyncStorage from 'sync-storage';
import {acc} from 'react-native-reanimated';
import {RFValue} from 'react-native-responsive-fontsize';

class EntryScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    this.backListener = null; //Responsible to hold the listener for the go back overwritter.
  }

  async componentDidMount() {
    //Add home going back handler-----------------------------
    this.props.navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      return;
    });
    //--------------------------------------------------------
    //Check for the user_fp
    //Get persisted data and update the general state
    //user_fp, pushnotif_token, userCurrentLocationMetaData, latitude, longitude
    await SyncStorage.init();
    let user_fp = SyncStorage.get('@user_fp');
    let pushnotif_token = SyncStorage.get('@pushnotif_token_global_obj');
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
    let accountCreation_state = SyncStorage.get('@accountCreation_state');
    let favorite_places = SyncStorage.get('@favorite_places');

    //Update globals
    this.props.App.gender_user =
      gender_user !== undefined && gender_user !== null
        ? gender_user
        : 'unknown';
    this.props.App.username =
      username !== undefined && username !== null ? username : 'User';
    this.props.App.surname_user =
      surname !== undefined && surname !== null ? surname : '';
    this.props.App.user_email =
      user_email !== undefined && user_email !== null ? user_email : '';
    this.props.App.phone_user =
      phone !== undefined && phone !== null ? phone : '';
    this.props.App.user_profile_pic =
      user_profile_pic !== undefined && user_profile_pic !== null
        ? user_profile_pic
        : null;
    this.props.App.user_fingerprint = user_fp;
    this.props.App.pushnotif_token = pushnotif_token;
    this.props.App.accountCreation_state =
      accountCreation_state !== undefined && accountCreation_state !== null
        ? accountCreation_state
        : 'minimal'; //full or minimal

    this.props.App.user_favorites_destinations =
      favorite_places !== undefined && favorite_places !== null
        ? favorite_places
        : [
            {
              name: 'Home',
              icon: 'home',
              location_infos: false, //Contains infos like street name, coordinates, etc... related to the place
            },
            {
              name: 'Work',
              icon: 'briefcase',
              location_infos: false, //Contains infos like street name, coordinates, etc... related to the place
            },
            {
              name: 'Gym',
              icon: 'human',
              location_infos: false, //Contains infos like street name, coordinates, etc... related to the place
            },
          ];

    try {
      userCurrentLocationMetaData = JSON.parse(userCurrentLocationMetaData);
      this.props.App.userCurrentLocationMetaData = userCurrentLocationMetaData;
    } catch (error) {
      this.props.App.userCurrentLocationMetaData = {};
    }
    //..
    try {
      userLocationPoint = JSON.parse(userLocationPoint);
      if (Platform.OS === 'android') {
        this.props.App.latitude = userLocationPoint.latitude;
        this.props.App.longitude = userLocationPoint.longitude;
      } else {
        this.props.App.latitude = userLocationPoint.longitude;
        this.props.App.longitude = userLocationPoint.latitude;
      }
    } catch (error) {
      this.props.App.latitude = 0;
      this.props.App.longitude = 0;
    }
    //...
    if (
      this.props.App.user_fingerprint !== undefined &&
      this.props.App.user_fingerprint !== null &&
      this.props.App.user_fingerprint !== false &&
      this.props.App.user_fingerprint.length > 40 &&
      /full/i.test(this.props.App.accountCreation_state)
    ) {
      this.props.navigation.navigate('Home');
    }
  }

  componentWillUnmount() {
    /*if (this.backListener !== null) {
      this.backListener = null;
    }*/
  }

  render() {
    return (
      <View style={styles.mainWindow}>
        <StatusBar backgroundColor="#0e8491" barStyle={'light-content'} />
        <TouchableOpacity
          style={{flex: 1}}
          onPressIn={() =>
            this.props.navigation.navigate('PhoneDetailsScreen')
          }>
          <SafeAreaView style={{flex: 1, backgroundColor: '#0e8491'}}>
            <View style={styles.presentationWindow}>
              {/**Pattern */}
              <Image
                source={require('../../Media_assets/Images/back.png')}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0.035,
                }}
              />
              {/**--- */}
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
              <View style={{flex: 3, width: '100%'}}>
                <Image
                  source={require('../../Media_assets/Images/entryImage0.png')}
                  style={{resizeMode: 'contain', width: '105%', height: '105%'}}
                />
              </View>
              <View
                style={{
                  height: '15%',
                  flex: 1,
                  width: '80%',
                  alignItems: 'center',
                }}>
                <Text
                  style={[
                    {
                      fontSize: RFValue(28),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'MoveBold'
                          : 'Uber Move Bold',
                      color: '#fff',
                    },
                  ]}>
                  Get yourself a safe ride
                </Text>
              </View>
            </View>
          </SafeAreaView>
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
                size={23}
                style={{marginRight: 5}}
                color="#000"
              />
              <Text
                style={[
                  {
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                    fontSize: RFValue(19),
                    flex: 1,
                  },
                ]}>
                What's your phone number?
              </Text>
              <IconMaterialIcons
                name="arrow-forward-ios"
                size={17}
                color="#0e8491"
                style={{marginTop: 3}}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
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

export default React.memo(connect(mapStateToProps)(EntryScreen));
