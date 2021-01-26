import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import SOCKET_CORE from '../Helpers/managerNode';
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
} from 'react-native';
import {UpdateErrorModalLog} from '../Redux/HomeActionsCreators';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-crop-picker';
import ErrorModal from '../Helpers/ErrorModal';
import Notifiyer from '../Helpers/Notifiyer';

class SettingsEntryScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showNotifiyer: false, //Whether to show to status notifiyer or not.
      notifiyerMessage: 'No messages to show', //MMessage to desiplay in the notifiyer
      statusColor: '#048320', //The status color - #048320:green, #b22222:red
      isChangingProfile_pic: false, //To know whether or not the profile pic is being changed to show up the loader.
    };
  }

  componentDidMount() {
    let globalObject = this;
    /**
     * SOCKET.IO RESPONSES
     */
    //1.
  }

  /**
   * @func updateRiders_profilePic
   * Responsible to handle all the proccesses linked to changing the rider's profile picture.
   * And handle to notifyer button.
   * @param base64String: the image converted to baase64
   */
  updateRiders_profilePic(base64String) {
    console.log(base64String);
    let bundleData = {
      user_fingerprint: this.props.App.user_fingerprint,
      dataToUpdate: base64String,
      infoToUpdate: 'picture',
    };
    //Update the global last data updated - very useful when updating the visual data after a successful modification.
    //this.props.App.last_dataPersoUpdated = dataToUpdate;
    //this.setState({isErrorThrown: false, isLoading_something: true});
    SOCKET_CORE.emit('updateRiders_profileInfos_io', bundleData);
  }

  render() {
    return (
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
            active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
            error_status={
              this.props.App.generalErrorModal_vars.generalErrorModalType
            }
            parentNode={this}
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
                      () => {},
                    )
                  : {}
              }
              style={{
                borderWidth: 1,
                borderColor: '#f0f0f0',
                height: 80,
                width: 80,
                borderRadius: 150,
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
                source={require('../../Media_assets/Images/woman.webp')}
                style={{
                  resizeMode: 'cover',
                  width: '100%',
                  height: '100%',
                  borderRadius: 150,
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
                  fontSize: 17,
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
            {this.props.App.user_favorites_destinations.map((place, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {}}
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
                    <Text style={[{fontSize: 17}]}>{place.name}</Text>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                      {place.location_infos !== false ? (
                        <>
                          <Text
                            style={[
                              styles.detailsSearchRes,
                              {fontFamily: 'Allrounder-Grotesk-Book'},
                            ]}>
                            Street
                          </Text>
                          <Text
                            style={[
                              {
                                color: '#707070',
                                paddingLeft: 10,
                                fontFamily: 'Allrounder-Grotesk-Book',
                              },
                            ]}>
                            City
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
            })}
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
                Linking.openURL('https://www.taxiconnectna.com/privacy.html')
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
                Linking.openURL('https://www.taxiconnectna.com/privacy.html')
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
              this.props.UpdateErrorModalLog(true, 'show_signOff_modal', 'any')
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
