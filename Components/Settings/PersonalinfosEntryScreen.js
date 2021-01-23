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
} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Notifiyer from '../Helpers/Notifiyer';
import ErrorModal from '../Helpers/ErrorModal';

class PersonalinfosEntryScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showNotifiyer: false, //Whether to show to status notifiyer or not.
      notifiyerMessage: 'No messages to show', //MMessage to desiplay in the notifiyer
      statusColor: '#048320', //The status color - #048320:green, #b22222:red
      detailToModify: 'name', //The focused detail to modify: name, surname, gender, phone number, email
    };
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
        <ErrorModal
          active={true}
          error_status={'show_changePersonalDetails_modal'}
          detailToModify={'name'}
        />
        <ScrollView style={styles.presentationWindow}>
          {/**Name */}
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
                Name
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
                Dominique
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#000"
                size={20}
              />
            </View>
          </View>
          {/**Surname */}
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
                Surname
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
                Kanyik
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#000"
                size={20}
              />
            </View>
          </View>
          {/**Gender */}
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
                Gender
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
                Male
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#000"
                size={20}
              />
            </View>
          </View>
          {/**Phone */}
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
                Phone number
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
                +264817563369
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#000"
                size={20}
              />
            </View>
          </View>
          {/**Email */}
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
                Email
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
                domykanyiktesh01@gmail.com
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#000"
                size={20}
              />
            </View>
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

export default connect(mapStateToProps)(PersonalinfosEntryScreen);
