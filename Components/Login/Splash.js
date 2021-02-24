import React from 'react';
import {connect} from 'react-redux';
import {
  Animated,
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Easing,
  Platform,
} from 'react-native';
import SyncStorage from 'sync-storage';

class Splash extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      animatedParent: new Animated.Value(0),
      animatedOpacity: new Animated.Value(1),
    };
  }

  async componentDidMount() {
    //Add home going back handler-----------------------------
    this.props.navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      return;
    });
    //--------------------------------------------------------
    let globalApp = this;
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
    //...
    setTimeout(() => {
      if (
        this.props.App.user_fingerprint !== undefined &&
        this.props.App.user_fingerprint !== null &&
        this.props.App.user_fingerprint !== false &&
        this.props.App.user_fingerprint.length > 40 &&
        /full/i.test(this.props.App.accountCreation_state)
      ) {
        //was already logged in
        //Go to Home
        setTimeout(function () {
          Animated.timing(globalApp.state.animatedParent, {
            toValue: 1,
            duration: 2000,
            easing: Easing.ease,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(function () {
              Animated.timing(globalApp.state.animatedOpacity, {
                toValue: 0,
                duration: 500,
                easing: Easing.ease,
                useNativeDriver: true,
              }).start(() => {
                globalApp.props.navigation.navigate('Home');
              });
            }, 100);
          });
        }, 100);
      } //Newcommer
      else {
        //Login
        setTimeout(function () {
          Animated.timing(globalApp.state.animatedParent, {
            toValue: 1,
            duration: 2000,
            easing: Easing.ease,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(function () {
              Animated.timing(globalApp.state.animatedOpacity, {
                toValue: 0,
                duration: 500,
                easing: Easing.ease,
                useNativeDriver: true,
              }).start(() => {
                globalApp.props.navigation.navigate('EntryScreen');
              });
            }, 100);
          });
        }, 100);
      }
    }, 1800);
  }

  render() {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={{flex: 4, alignItems: 'center', justifyContent: 'center'}}>
          <Animated.View
            style={{
              transform: [
                {
                  translateX: this.state.animatedParent.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 120],
                  }),
                },
                {
                  translateY: this.state.animatedParent.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 250],
                  }),
                },
                {
                  scaleX: this.state.animatedParent.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 150],
                  }),
                },
                {
                  scaleY: this.state.animatedParent.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 150],
                  }),
                },
              ],
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#000',
              width: 110, //Should be to 110
              height: 110,
              borderRadius: 1000,
              backgroundColor: '#fff',
            }}
          />
          <Animated.View
            style={{
              opacity: this.state.animatedOpacity,
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#fff',
              width: 110,
              height: 110,
              borderRadius: 1000,
              backgroundColor: '#fff',
            }}>
            <Image
              source={require('../../Media_assets/Images/logo.png')}
              style={{
                resizeMode: 'contain',
                width: '90%',
                height: '90%',
                borderRadius: 1000,
              }}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0e8491',
  },
  tconnect: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 20,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tconnectText: {
    color: '#000',
    fontSize: 25,
    letterSpacing: 4,
    fontWeight: 'bold',
    marginTop: 35,
    right: 1,
    marginBottom: 30,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default connect(mapStateToProps)(Splash);
