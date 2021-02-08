import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  BackHandler,
  Platform,
} from 'react-native';
import {
  ResetGenericPhoneNumberInput,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Notifiyer from '../Helpers/Notifiyer';
import ErrorModal from '../Helpers/ErrorModal';
import SyncStorage from 'sync-storage';
import {RFValue} from 'react-native-responsive-fontsize';

class PersonalinfosEntryScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;

    this._shouldShow_errorModal = true; //! ERROR MODAL AUTO-LOCKER - PERFORMANCE IMPROVER.

    this.state = {
      showNotifiyer: false, //Whether to show to status notifiyer or not.
      notifiyerMessage: 'No messages to show', //MMessage to desiplay in the notifiyer
      statusColor: '#048320', //The status color - #048320:green, #b22222:red
      detailToModify: 'name', //The focused detail to modify: name, surname, gender, phone number, email - default: name
    };
  }

  componentWillUnmount() {
    if (this.backHander !== null) {
      this.backHander.remove();
    }
  }

  componentDidMount() {
    let globalObject = this;
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.goBack();
        return true;
      },
    );

    /**
     * SOCKET.IO RESPONSES
     */
    //1. Handle change profile infos.
    this.props.App.socket.on(
      'updateRiders_profileInfos_io-response',
      function (response) {
        console.log(response);
        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null
        ) {
          if (/success/i.test(response.response)) {
            globalObject.props.UpdateErrorModalLog(false, false, 'any');
            //Update the local storages
            if (/^name$/i.test(globalObject.state.detailToModify)) {
              //name
              globalObject.props.App.username =
                globalObject.props.App.last_dataPersoUpdated;
              SyncStorage.set(
                '@username',
                globalObject.props.App.last_dataPersoUpdated,
              );
            } else if (/^surname$/i.test(globalObject.state.detailToModify)) {
              //surname
              globalObject.props.App.surname_user =
                globalObject.props.App.last_dataPersoUpdated;
              SyncStorage.set(
                '@surname_user',
                globalObject.props.App.last_dataPersoUpdated,
              );
            } else if (/^email$/i.test(globalObject.state.detailToModify)) {
              //email
              globalObject.props.App.user_email =
                globalObject.props.App.last_dataPersoUpdated;
              SyncStorage.set(
                '@user_email',
                globalObject.props.App.last_dataPersoUpdated,
              );
            } else if (/^gender$/i.test(globalObject.state.detailToModify)) {
              //gender
              globalObject.props.App.gender_user =
                globalObject.props.App.last_dataPersoUpdated;
              SyncStorage.set(
                '@gender_user',
                globalObject.props.App.last_dataPersoUpdated,
              );
            }
            //---------
            globalObject.setState({
              showNotifiyer: true,
              notifiyerMessage: `Successully changed your ${globalObject.state.detailToModify.toLocaleLowerCase()}`,
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
              notifiyerMessage: `We couldn't change your ${globalObject.state.detailToModify.toLocaleLowerCase()}`,
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
            notifiyerMessage: `We couldn't change your ${globalObject.state.detailToModify.toLocaleLowerCase()}`,
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
   * @func showModalChange_updater
   * Responsible for showing up the modal that will allow the rider to modify the values.
   * @param infoToUpdate: the type of information to update (name,surname,etc...)
   */
  showModalChange_updater(infoToUpdate) {
    if (!/gender/i.test(infoToUpdate)) {
      //Everything but the gender
      this.state.detailToModify = infoToUpdate;
      this.props.UpdateErrorModalLog(
        true,
        'show_changePersonalDetails_modal',
        'any',
      );
    } else if (/gender/i.test(infoToUpdate)) {
      //The gender
      this.state.detailToModify = infoToUpdate;
      this.props.UpdateErrorModalLog(true, 'gender_select', 'any');
    }
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
        detailToModify={this.state.detailToModify}
        parentNode={this}
      />
    );
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
        {this.props.App.generalErrorModal_vars.showErrorGeneralModal
          ? this.renderError_modalView()
          : null}
        <ScrollView style={styles.presentationWindow}>
          {/**Name */}
          <TouchableOpacity
            onPress={() => this.showModalChange_updater('name')}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#d0d0d0',
              padding: 20,
            }}>
            <View style={{marginBottom: 10}}>
              <Text style={styles.labelStyle}>Name</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 5,
                paddingBottom: 10,
                alignItems: 'center',
              }}>
              <Text style={styles.infosValue}>
                {this.props.App.username !== false &&
                this.props.App.username !== null &&
                this.props.App.username !== undefined &&
                this.props.App.username[0] !== undefined
                  ? `${this.props.App.username[0].toUpperCase()}${this.props.App.username
                      .substr(1)
                      .toLowerCase()}`
                  : 'Enter your name'}
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#0e8491"
                size={20}
              />
            </View>
          </TouchableOpacity>
          {/**Surname */}
          <TouchableOpacity
            onPress={() => this.showModalChange_updater('surname')}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#d0d0d0',
              padding: 20,
            }}>
            <View style={{marginBottom: 10}}>
              <Text style={styles.labelStyle}>Surname</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 5,
                paddingBottom: 10,
                alignItems: 'center',
              }}>
              <Text style={styles.infosValue}>
                {this.props.App.surname_user !== false &&
                this.props.App.surname_user !== null &&
                this.props.App.surname_user !== undefined &&
                this.props.App.surname_user[0] !== undefined
                  ? `${this.props.App.surname_user[0].toUpperCase()}${this.props.App.surname_user
                      .substr(1)
                      .toLowerCase()}`
                  : 'Enter your surname'}
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#0e8491"
                size={20}
              />
            </View>
          </TouchableOpacity>
          {/**Gender */}
          <TouchableOpacity
            onPress={() => this.showModalChange_updater('gender')}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#d0d0d0',
              padding: 20,
            }}>
            <View style={{marginBottom: 10}}>
              <Text style={styles.labelStyle}>Gender</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 5,
                paddingBottom: 10,
                alignItems: 'center',
              }}>
              <Text style={styles.infosValue}>
                {this.props.App.gender_user !== false &&
                this.props.App.gender_user !== null &&
                this.props.App.gender_user !== undefined &&
                this.props.App.gender_user[0] !== undefined
                  ? `${this.props.App.gender_user[0].toUpperCase()}${this.props.App.gender_user
                      .substr(1)
                      .toLowerCase()}`
                  : 'Male'}
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#0e8491"
                size={20}
              />
            </View>
          </TouchableOpacity>
          {/**Phone */}
          <TouchableOpacity
            onPress={() => this.showModalChange_updater('phone')}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#d0d0d0',
              padding: 20,
            }}>
            <View style={{marginBottom: 10}}>
              <Text style={styles.labelStyle}>Phone number</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 5,
                paddingBottom: 10,
                alignItems: 'center',
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <View style={{width: 30, height: 30, marginRight: 10}}>
                  <Image
                    source={require('../../Media_assets/Images/Namibia_rect.png')}
                    style={{
                      resizeMode: 'contain',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </View>
                <Text style={styles.infosValue}>
                  {this.props.App.phone_user !== false &&
                  this.props.App.phone_user !== null &&
                  this.props.App.phone_user !== undefined &&
                  this.props.App.phone_user[0] !== undefined
                    ? this.props.App.phone_user
                    : 'Enter a phone number'}
                </Text>
              </View>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#0e8491"
                size={20}
              />
            </View>
          </TouchableOpacity>
          {/**Email */}
          <TouchableOpacity
            onPress={() => this.showModalChange_updater('email')}
            style={{
              padding: 20,
            }}>
            <View style={{marginBottom: 10}}>
              <Text style={styles.labelStyle}>Email</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 5,
                paddingBottom: 10,
                alignItems: 'center',
              }}>
              <Text style={styles.infosValue}>
                {this.props.App.user_email !== false &&
                this.props.App.user_email !== null &&
                this.props.App.user_email !== undefined &&
                this.props.App.user_email[0] !== undefined
                  ? this.props.App.user_email
                  : 'Enter your email'}
              </Text>
              <IconMaterialIcons
                name="keyboard-arrow-right"
                color="#0e8491"
                size={20}
              />
            </View>
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
  labelStyle: {
    fontSize: RFValue(16),
    fontFamily:
      Platform.OS === 'android'
        ? 'UberMoveTextMedium'
        : 'Uber Move Text Medium',
    color: '#AFAFAF',
  },
  infosValue: {
    fontFamily:
      Platform.OS === 'android'
        ? 'UberMoveTextMedium'
        : 'Uber Move Text Medium',
    fontSize: RFValue(17.5),
    flex: 1,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ResetGenericPhoneNumberInput,
      UpdateErrorModalLog,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(PersonalinfosEntryScreen),
);
