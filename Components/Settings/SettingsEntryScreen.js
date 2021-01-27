import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  BackHandler,
} from 'react-native';
import {UpdateErrorModalLog} from '../Redux/HomeActionsCreators';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-crop-picker';
import ErrorModal from '../Helpers/ErrorModal';
import Notifiyer from '../Helpers/Notifiyer';
import SyncStorage from 'sync-storage';

class SettingsEntryScreen extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE MAIN SCREEN WHEN UNMOUNTED.

    //Handlers
    this.backHander = null;

    this.state = {
      showNotifiyer: false, //Whether to show to status notifiyer or not.
      notifiyerMessage: 'No messages to show', //MMessage to desiplay in the notifiyer
      statusColor: '#048320', //The status color - #048320:green, #b22222:red
      isChangingProfile_pic: false, //To know whether or not the profile pic is being changed to show up the loader.
      favoritePlace_label: 'home', //The place label to guid the simplified search.
    };
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMOUNTED
    //...
    if (this.backHander !== null) {
      this.backHander.remove();
    }
  }

  componentDidMount() {
    let globalObject = this;
    this._isMounted = true;

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

    /**
     * SOCKET.IO RESPONSES
     */
    //1. HANDLE CHANGE PROFILE PICTURE response
    this.props.App.socket.on(
      'updateRiders_profileInfos_io-response',
      function (response) {
        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null
        ) {
          if (/success/i.test(response.response)) {
            globalObject.props.UpdateErrorModalLog(false, false, 'any');
            //Update the local storages
            SyncStorage.set('@user_profile_pic', response.picture_name);
            globalObject.props.App.user_profile_pic = response.picture_name;
            //---------
            globalObject.setState({
              showNotifiyer: true,
              notifiyerMessage: `Successully changed your picture`,
              statusColor: '#048320',
            });
            let tmpTimeoutCloser = setTimeout(function () {
              globalObject.setState({showNotifiyer: false});
              clearTimeout(tmpTimeoutCloser);
            }, 2000);
          } //Error
          else {
            globalObject.props.UpdateErrorModalLog(false, false, 'any');
            globalObject.setState({
              showNotifiyer: true,
              notifiyerMessage: `We couldn't change your picture`,
              statusColor: '#b22222',
            });
            let tmpTimeoutCloser = setTimeout(function () {
              globalObject.setState({showNotifiyer: false});
              clearTimeout(tmpTimeoutCloser);
            }, 2000);
          }
        } //SOmething so strange happened - error
        else {
          globalObject.props.UpdateErrorModalLog(false, false, 'any');
          globalObject.setState({
            showNotifiyer: true,
            notifiyerMessage: `We couldn't change your picture`,
            statusColor: '#b22222',
          });
          let tmpTimeoutCloser = setTimeout(function () {
            globalObject.setState({showNotifiyer: false});
            clearTimeout(tmpTimeoutCloser);
          }, 2000);
        }
      },
    );
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
            this.props.App.search_showSearchNodeMain = true;
            this.props.UpdateErrorModalLog(
              true,
              'show_simplified_searchLocations',
              'any',
            );
          }}
          style={[styles.locationRender]}>
          <View>
            {place.name !== 'Gym' ? (
              <IconFeather
                name={place.icon}
                size={20}
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
                  fontSize: 17,
                  fontFamily: 'Allrounder-Grotesk-Medium',
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
                        fontSize: 14,
                        fontFamily: 'Allrounder-Grotesk-Book',
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
                    {fontFamily: 'Allrounder-Grotesk-Book'},
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
    //this.setState({isErrorThrown: false, isLoading_something: true});
    this.props.App.socket.emit('updateRiders_profileInfos_io', bundleData);
  }

  render() {
    return (
      <>
        {this._isMounted ? (
          <SafeAreaView style={styles.mainWindow}>
            {this.state.showNotifiyer ? (
              <Notifiyer
                active={this.state.showNotifiyer}
                color={this.state.statusColor}
                message={this.state.notifiyerMessage}
              />
            ) : null}
            {this.props.App.generalErrorModal_vars.showErrorGeneralModal ? (
              <ErrorModal
                active={
                  this.props.App.generalErrorModal_vars.showErrorGeneralModal
                }
                error_status={
                  this.props.App.generalErrorModal_vars.generalErrorModalType
                }
                parentNode={this}
                favoritePlace_label={this.state.favoritePlace_label}
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
                          : '70%',
                      height:
                        this.props.App.user_profile_pic !== undefined &&
                        this.props.App.user_profile_pic !== null
                          ? '100%'
                          : '70%',
                      borderRadius:
                        this.props.App.user_profile_pic !== undefined &&
                        this.props.App.user_profile_pic !== null
                          ? 150
                          : 0,
                    }}
                  />
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
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      fontSize: 18,
                    }}>
                    Dominique Kanyik
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
                      fontSize: 16.5,
                      color: '#a5a5a5',
                      fontFamily: 'Allrounder-Grotesk-Regular',
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
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      fontSize: 18,
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
                      fontSize: 16.5,
                      color: '#a5a5a5',
                      fontFamily: 'Allrounder-Grotesk-Regular',
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
                      fontSize: 16.5,
                      color: '#a5a5a5',
                      fontFamily: 'Allrounder-Grotesk-Regular',
                    }}>
                    Privacy
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      'https://www.taxiconnectna.com/privacy.html',
                    )
                  }
                  style={{
                    flexDirection: 'row',
                    paddingTop: 5,
                    paddingBottom: 10,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      fontSize: 17,
                      flex: 1,
                    }}>
                    Terms & Conditions
                  </Text>
                  <IconMaterialIcons
                    name="keyboard-arrow-right"
                    color="#d0d0d0"
                    size={25}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      'https://www.taxiconnectna.com/privacy.html',
                    )
                  }
                  style={{
                    flexDirection: 'row',
                    paddingTop: 10,
                    paddingBottom: 10,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      fontSize: 17,
                      flex: 1,
                    }}>
                    Privacy statements
                  </Text>
                  <IconMaterialIcons
                    name="keyboard-arrow-right"
                    color="#d0d0d0"
                    size={25}
                  />
                </TouchableOpacity>
              </View>
              {/**Log out */}
              <TouchableOpacity
                onPress={() =>
                  this.props.UpdateErrorModalLog(
                    true,
                    'show_signOff_modal',
                    'any',
                  )
                }
                style={{
                  flexDirection: 'row',
                  marginTop: 25,
                  padding: 20,
                  paddingTop: 30,
                  marginBottom: 40,
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderTopColor: '#d0d0d0',
                }}>
                <Text
                  style={{
                    fontFamily: 'Allrounder-Grotesk-Medium',
                    fontSize: 17,
                    flex: 1,
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
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsEntryScreen);
