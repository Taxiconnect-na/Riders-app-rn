import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {StackActions} from '@react-navigation/native';
import {
  View,
  Text,
  Animated as AnimatedNative,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  BackHandler,
  Platform,
  Easing,
} from 'react-native';
import {
  UpdateErrorModalLog,
  UpdateHellosVars,
} from '../Redux/HomeActionsCreators';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconEntypo from 'react-native-vector-icons/Entypo';
import ImagePicker from 'react-native-image-crop-picker';
import Notifiyer from '../Helpers/Notifiyer';
import SyncStorage from 'sync-storage';
import FastImage from 'react-native-fast-image';
import {RFValue} from 'react-native-responsive-fontsize';
import ErrorModal from '../Helpers/ErrorModal';

class SettingsEntryScreen extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE MAIN SCREEN WHEN UNMOUNTED.
    this._shouldShow_errorModal = true; //! ERROR MODAL AUTO-LOCKER - PERFORMANCE IMPROVER.
    this.backListener = null; //Responsible to hold the listener for the go back overwritter.

    //Handlers
    this.backHander = null;

    this.state = {
      showNotifiyer: false, //Whether to show to status notifiyer or not.
      notifiyerMessage: 'No messages to show', //MMessage to desiplay in the notifiyer
      statusColor: '#048320', //The status color - #048320:green, #b22222:red
      isChangingProfile_pic: false, //To know whether or not the profile pic is being changed to show up the loader.
      favoritePlace_label: 'home', //The place label to guid the simplified search.
    };

    this.redirectTo_EntryScreen = this.redirectTo_EntryScreen.bind(this);
  }

  componentDidMount() {
    let that = this;
    this._isMounted = true;

    //? Add navigator listener - auto clean on focus
    //--------------------------------------------------------
    that._navigatorEvent = this.props.navigation.addListener('focus', () => {
      that._navigatorEvent = that.props.navigation.addListener(
        'beforeRemove',
        (e) => {
          // Prevent default behavior of leaving the screen
          e.preventDefault();
          if (/POP/i.test(e.data.action.type)) {
            that.props.navigation.navigate('Home_drawer');
          }
          return;
        },
      );
      //--------------------------------------------------------
      that.backHander = BackHandler.addEventListener(
        'hardwareBackPress',
        function () {
          that.props.navigation.navigate('Home_drawer');
          return true;
        },
      );
    });

    /**
     * SOCKET.IO RESPONSES
     */
    //1. HANDLE CHANGE PROFILE PICTURE response
    this.props.App.socket.on(
      'updateRiders_profileInfos_io-response',
      function (response) {
        that.setState({
          isLoading_something: false,
          isChangingProfile_pic: false,
        });
        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null &&
          response.picture_name !== undefined &&
          response.picture_name !== null
        ) {
          if (/success/i.test(response.response)) {
            that.props.UpdateErrorModalLog(false, false, 'any');
            //Update the local storages
            SyncStorage.set('@user_profile_pic', response.picture_name);
            that.props.App.user_profile_pic = response.picture_name;
            //---------
            that.setState({
              showNotifiyer: true,
              notifiyerMessage: `Successully changed your picture`,
              statusColor: '#048320',
            });
            let tmpTimeoutCloser = setTimeout(function () {
              that.setState({showNotifiyer: false});
              clearTimeout(tmpTimeoutCloser);
            }, 2000);
          } //Error
          else {
            that.props.UpdateErrorModalLog(false, false, 'any');
            that.setState({
              showNotifiyer: true,
              notifiyerMessage: `We couldn't change your picture`,
              statusColor: '#b22222',
            });
            let tmpTimeoutCloser = setTimeout(function () {
              that.setState({showNotifiyer: false});
              clearTimeout(tmpTimeoutCloser);
            }, 2000);
          }
          //?Change state to random value to allow general state update - workaround
          that.props.UpdateErrorModalLog(false, true, 'anyoui');
          //?-------
        } //SOmething so strange happened - error
        else {
          that.props.UpdateErrorModalLog(false, false, 'any');
          that.setState({
            showNotifiyer: true,
            notifiyerMessage: `We couldn't change your picture`,
            statusColor: '#b22222',
          });
          let tmpTimeoutCloser = setTimeout(function () {
            that.setState({showNotifiyer: false});
            clearTimeout(tmpTimeoutCloser);
          }, 2000);
        }
      },
    );
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMOUNTED
    //...
    /*if (this.backHander !== null) {
      this.backHander.remove();
    }
    //...
    if (this.backListener !== null) {
      this.backListener = null;
    }*/
    this._navigatorEvent();
  }

  /**
   * @func renderClean_favoritePlaces
   * Responsible to render cleanly the favorite places to void any dirty update glitches.
   */
  renderClean_favoritePlaces() {
    let j = this.props.App.user_favorites_destinations.map((place, index) => {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            //Update the favorite place label
            this.state.favoritePlace_label = place.name;
            this.props.App.favoritePlace_label = place.name; //! Update the global state var.
            this.props.App.search_showSearchNodeMain = true;
            this.props.UpdateErrorModalLog(
              true,
              'show_simplified_searchLocations',
              'any',
            );
          }}
          style={[styles.locationRender]}>
          <View>
            {/work/i.test(place.name) ? (
              <IconCommunity
                name={place.icon}
                size={20}
                style={{paddingRight: 15}}
                color="#0e8491"
              />
            ) : /home/i.test(place.name) ? (
              <IconEntypo
                name={place.icon}
                size={21}
                style={{paddingRight: 15}}
                color="#0e8491"
              />
            ) : (
              <IconCommunity
                name={place.icon}
                size={21}
                style={{paddingRight: 15}}
                color="#0e8491"
              />
            )}
          </View>
          <View>
            <Text
              style={[
                {
                  fontSize: RFValue(16),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                },
              ]}>
              {place.name}
            </Text>
            <View style={{flexDirection: 'row', marginTop: 5}}>
              {place.location_infos !== false ? (
                <>
                  <Text
                    style={[
                      {
                        fontSize: RFValue(15),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                      },
                    ]}>
                    {place.location_infos.location_name !== false
                      ? place.location_infos.location_name.length > 35
                        ? place.location_infos.location_name.substring(0, 35) +
                          '...'
                        : place.location_infos.location_name
                      : place.location_infos.street === undefined
                      ? ''
                      : place.location_infos.street === false
                      ? ''
                      : place.location_infos.street.length > 20
                      ? place.location_infos.street.substring(0, 20) + '. '
                      : place.location_infos.street + '  '}
                  </Text>
                </>
              ) : (
                <Text
                  style={[
                    styles.detailsSearchRes,
                    {
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                    },
                  ]}>
                  Add a location.
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    });
    if (this.props.App.generalErrorModal_vars.showErrorGeneralModal) {
      return null;
    } else {
      return j;
    }
  }

  /**
   * @func fire_initGreetingAnd_after
   * ? 2. Greeting animation - init and after init
   * Launch greeting animations for hello1 and hello 2
   */
  fire_initGreetingAnd_after() {
    let that = this;
    let timeout0 = setTimeout(function () {
      AnimatedNative.parallel([
        AnimatedNative.timing(
          that.props.App.initialHelloAnimationParams.opacity,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(that.props.App.initialHelloAnimationParams.top, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        let timeout = setTimeout(function () {
          //Close hello 1
          AnimatedNative.parallel([
            AnimatedNative.timing(
              that.props.App.initialHelloAnimationParams.opacity,
              {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              },
            ),
            AnimatedNative.timing(
              that.props.App.initialHelloAnimationParams.top,
              {
                toValue: 10,
                duration: 300,
                useNativeDriver: true,
              },
            ),
          ]).start(() => {
            //Start hello 2
            that.props.UpdateHellosVars({initialHello: true});
            AnimatedNative.parallel([
              AnimatedNative.timing(
                that.props.App.initialHelloAnimationParams.opacity2,
                {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                },
              ),
              AnimatedNative.timing(
                that.props.App.initialHelloAnimationParams.top2,
                {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                },
              ),
            ]).start(() => {
              //Replace text if GPRS is off
              if (that.props.App.gprsGlobals.hasGPRSPermissions === false) {
                //Replace hello 2 text with: Looks like you're off the map
                let gprsOffText = "Looks like you're off the map";
                if (that.props.App.hello2Text !== gprsOffText) {
                  let timeout2 = setTimeout(function () {
                    that.replaceHello2_text(gprsOffText);
                    clearTimeout(timeout2);
                  }, 1000);
                }
              }
            });
          });
          clearTimeout(timeout0);
          clearTimeout(timeout);
        }, 4000);
      });
    }, 1000);
  }

  /**
   * 3. Replace hello 2 text
   * Laucn the animation of replacement of the hello 2 text.
   */
  replaceHello2_text(text) {
    let that = this;
    //Close hello 2
    AnimatedNative.parallel([
      AnimatedNative.timing(
        that.props.App.initialHelloAnimationParams.opacity2,
        {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        },
      ),
      AnimatedNative.timing(that.props.App.initialHelloAnimationParams.top2, {
        toValue: 10,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      //Start hello 2
      that.props.UpdateHellosVars({hello2Text: text});
      AnimatedNative.parallel([
        AnimatedNative.timing(
          that.props.App.initialHelloAnimationParams.opacity2,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ),
        AnimatedNative.timing(that.props.App.initialHelloAnimationParams.top2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  /**
   * @func resetAnimationLoader
   * Reset the line loader to the default values
   */
  resetAnimationLoader() {
    let that = this;
    this.props.App.showLocationSearch_loader = false;
    AnimatedNative.timing(that.props.App.loaderPosition, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      AnimatedNative.timing(that.props.App.loaderBasicWidth, {
        toValue: this.props.App.windowWidth,
        duration: 3000,
        useNativeDriver: true,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
      }).start(() => {
        that.props.App.showLocationSearch_loader = false;
      });
    });
  }

  /**
   * @func updateRiders_profilePic
   * Responsible to handle all the proccesses linked to changing the rider's profile picture.
   * And handle to notifyer button.
   * @param base64String: the image converted to baase64
   */
  updateRiders_profilePic(base64String) {
    let bundleData = {
      user_fingerprint: this.props.App.user_fingerprint,
      dataToUpdate: base64String,
      infoToUpdate: 'picture',
    };
    this.setState({isLoading_something: true, isChangingProfile_pic: true});
    this.props.App.socket.emit('updateRiders_profileInfos_io', bundleData);
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

  redirectTo_EntryScreen() {
    this.props.navigation.navigate('EntryScreen');
  }

  render() {
    return (
      <>
        {this._isMounted ? (
          <SafeAreaView style={styles.mainWindow}>
            {Platform.OS === 'ios' &&
            this.props.App.generalErrorModal_vars.showErrorGeneralModal
              ? this.renderError_modalView()
              : null}
            {this.state.showNotifiyer ? (
              <Notifiyer
                active={this.state.showNotifiyer}
                color={this.state.statusColor}
                message={this.state.notifiyerMessage}
              />
            ) : null}

            <ScrollView style={styles.presentationWindow}>
              {/**Picture section/edit */}
              <View
                style={{
                  borderBottomWidth: 0.7,
                  borderBottomColor: '#d0d0d0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.state.isChangingProfile_pic === false
                      ? ImagePicker.openPicker({
                          width: 300,
                          height: 400,
                          cropping: true,
                          mediaType: 'photo',
                          includeBase64: true,
                          cropperToolbarWidgetColor: '#096ED4',
                        }).then(
                          (image) => {
                            this.updateRiders_profilePic(
                              `data:${image.mime};base64,${image.data}`,
                            );
                          },
                          (error) => {},
                        )
                      : {}
                  }
                  style={{
                    borderWidth: 1,
                    borderColor: '#f0f0f0',
                    height: 80,
                    width: 80,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 150,
                    backgroundColor: '#fff',
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 5,
                    },
                    shadowOpacity: 0.34,
                    shadowRadius: 6.27,

                    elevation: 10,
                  }}>
                  {this.state.isChangingProfile_pic ? (
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 150,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 9000,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <ActivityIndicator size="large" color="#fff" />
                    </View>
                  ) : null}
                  {this.props.App.user_profile_pic !== undefined &&
                  this.props.App.user_profile_pic !== null &&
                  !/user\.png/i.test(this.props.App.user_profile_pic) ? (
                    <FastImage
                      source={{
                        uri: this.props.App.user_profile_pic,
                        priority: FastImage.priority.normal,
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 150,
                      }}
                    />
                  ) : (
                    <Image
                      source={require('../../Media_assets/Images/user.png')}
                      style={{
                        resizeMode: 'contain',
                        width: '60%',
                        height: '80%',
                        borderRadius: 0,
                      }}
                    />
                  )}
                  <View
                    style={{
                      position: 'absolute',
                      right: -5,
                      bottom: -5,
                      backgroundColor: '#000',
                      width: 30,
                      height: 30,
                      borderRadius: 120,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 5,
                      },
                      shadowOpacity: 0.34,
                      shadowRadius: 6.27,

                      elevation: 10,
                    }}>
                    <IconCommunity name="pencil" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
                <View style={{marginTop: 20}}>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'MoveMedium'
                          : 'Uber Move Medium',
                      fontSize: RFValue(19),
                    }}>
                    {`${this.props.App.username} ${
                      this.props.App.surname !== undefined &&
                      this.props.App.surname !== null
                        ? this.props.surname
                        : ''
                    }`}
                  </Text>
                </View>
              </View>
              {/**Identity infos */}
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#d0d0d0',
                  padding: 20,
                }}>
                <View style={{marginBottom: 10}}>
                  <Text
                    style={{
                      fontSize: RFValue(16),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      color: '#AFAFAF',
                    }}>
                    Identity
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('PersonalinfosEntryScreen')
                  }
                  style={{
                    flexDirection: 'row',
                    paddingTop: 5,
                    paddingBottom: 10,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(18),
                      flex: 1,
                    }}>
                    Personal information
                  </Text>
                  <IconMaterialIcons
                    name="keyboard-arrow-right"
                    color="#0e8491"
                    size={25}
                  />
                </TouchableOpacity>
              </View>
              {/**Favorite places */}
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#d0d0d0',
                  padding: 20,
                }}>
                <View style={{marginBottom: 10}}>
                  <Text
                    style={{
                      fontSize: RFValue(16),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      color: '#AFAFAF',
                    }}>
                    Favorite places
                  </Text>
                </View>
                {this.renderClean_favoritePlaces()}
              </View>
              {/**Privacy infos */}
              <View
                style={{
                  padding: 20,
                }}>
                <View style={{marginBottom: 10}}>
                  <Text
                    style={{
                      fontSize: RFValue(16),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      color: '#AFAFAF',
                    }}>
                    Privacy
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL('https://taxiconnectna.com/privacy.html')
                  }
                  style={{
                    flexDirection: 'row',
                    paddingTop: 5,
                    paddingBottom: 10,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      flex: 1,
                    }}>
                    Terms & Conditions
                  </Text>
                  <IconMaterialIcons
                    name="keyboard-arrow-right"
                    color="#AFAFAF"
                    size={25}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL('https://taxiconnectna.com/privacy.html')
                  }
                  style={{
                    flexDirection: 'row',
                    paddingTop: 10,
                    paddingBottom: 10,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      fontSize: RFValue(17),
                      flex: 1,
                    }}>
                    Privacy statements
                  </Text>
                  <IconMaterialIcons
                    name="keyboard-arrow-right"
                    color="#AFAFAF"
                    size={25}
                  />
                </TouchableOpacity>
              </View>
              {/**Log out */}
              <TouchableOpacity
                onPress={() => {
                  Platform.OS === 'ios'
                    ? this.props.UpdateErrorModalLog(
                        true,
                        'show_signOff_modal',
                        'any',
                      )
                    : {};
                }}
                style={{
                  flexDirection: 'row',
                  marginTop: 25,
                  padding: 20,
                  paddingTop: 30,
                  marginBottom: 40,
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderTopColor: '#d0d0d0',
                  opacity: Platform.OS === 'ios' ? 1 : 0.3,
                }}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextBold'
                        : 'Uber Move Text Bold',
                    fontSize: RFValue(17),
                    flex: 1,
                    color: '#b22222',
                  }}>
                  Sign Out
                </Text>
                <IconMaterialIcons
                  name="keyboard-arrow-right"
                  color="#b22222"
                  size={25}
                />
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        ) : null}
      </>
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
  detailsSearchRes: {
    color: '#707070',
    fontSize: 15,
  },
  locationRender: {
    paddingTop: 10,
    paddingBottom: 15,
    flexDirection: 'row',
    borderBottomWidth: 0,
    borderBottomColor: '#d0d0d0',
    marginBottom: 5,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdateErrorModalLog,
      UpdateHellosVars,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(SettingsEntryScreen),
);
