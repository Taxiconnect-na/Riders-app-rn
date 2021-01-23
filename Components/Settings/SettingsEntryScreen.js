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
} from 'react-native';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';

class SettingsEntryScreen extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.mainWindow}>
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
            <View
              style={{
                borderWidth: 1,
                borderColor: '#f0f0f0',
                height: 75,
                width: 75,
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
            </View>
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
            <View
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
            </View>
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
            <View
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
            </View>
            <View
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
            </View>
          </View>
          {/**Log out */}
          <View
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
          </View>
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

export default connect(mapStateToProps)(SettingsEntryScreen);
