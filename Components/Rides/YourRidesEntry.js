import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import {
  UpdateErrorModalLog,
  UpdateType_rideShown_YourRides_screen,
  UpdateRides_history_YourRides_tab,
  UpdateTargetedRequest_yourRides_history,
} from '../Redux/HomeActionsCreators';
import ErrorModal from '../Helpers/ErrorModal';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';
import NetInfo from '@react-native-community/netinfo';
import RideLIstGenericElement from './RideLIstGenericElement';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconFeather from 'react-native-vector-icons/Feather';
import {ScrollView} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';

class YourRidesEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE MAIN SCREEN WHEN UNMOUNTED.
    this._shouldShow_errorModal = true; //! ERROR MODAL AUTO-LOCKER - PERFORMANCE IMPROVER.

    //Handlers
    this.backHander = null;

    this.state = {
      loaderState: false,
      fetchingRides_Data: false, //To know whether the loading process is on
      areResultsEmpty: false, //To know whether the results where empty or not
      gotErrorDuringRequest: false, //TO know whether an error occured during the fetching
      pullRefreshing: false, //To activate of not the pull refresh icon - default: false
      networkStateChecker: false,
    };
  }

  /**
   * @func updateYourRidesSHownOnes
   * @param type: Past, Scheduled or Business
   * Responsible for updating the type of ride shown in the "Your rides" tab.
   */
  updateYourRidesSHownOnes(type) {
    this.props.UpdateErrorModalLog(false, false, 'any'); //Close modal
    this.props.UpdateType_rideShown_YourRides_screen(type);
  }

  componentDidMount() {
    let globalObject = this;
    //? Add navigator listener - auto clean on focus
    globalObject._navigatorEvent = this.props.navigation.addListener(
      'focus',
      () => {
        globalObject.fetchRequestedRequests_history();
      },
    );
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
    //Get initial rides - set default: past (always)
    this.updateYourRidesSHownOnes('Past');

    //Network state checker
    this.state.networkStateChecker = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        globalObject.props.UpdateErrorModalLog(
          state.isConnected,
          'connection_no_network',
          state.type,
        );
        globalObject.setState({loaderState: false});
      } //connected
      else {
        globalObject.props.UpdateErrorModalLog(false, false, state.type);
      }
    });

    //connection
    this.props.App.socket.on('connect', () => {
      globalObject.props.UpdateErrorModalLog(false, false, 'any');
    });
    //Socket error handling
    this.props.App.socket.on('error', (error) => {});
    this.props.App.socket.on('disconnect', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_error', () => {
      //Ask for the OTP again
      globalObject.props.UpdateErrorModalLog(
        true,
        'connection_no_network',
        'any',
      );
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_timeout', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect', () => {});
    this.props.App.socket.on('reconnect_error', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect_failed', () => {
      globalObject.props.App.socket.connect();
    });

    /**
     * SOCKET.IO RESPONSES
     */
    this.props.App.socket.on(
      'getRides_historyRiders_batchOrNot-response',
      function (response) {
        globalObject.setState({
          loaderState: false,
          fetchingRides_Data: false,
          pullRefreshing: false,
        });
        if (
          response !== false &&
          response.response !== undefined &&
          response.response !== false &&
          response.data !== undefined &&
          response.data[0] !== undefined &&
          response.data[0] !== false
        ) {
          //Got something
          if (/success/i.test(response.response)) {
            //Successfull
            if (
              response.data !== undefined &&
              response.data !== false &&
              response.data.length > 0
            ) {
              globalObject.state.areResultsEmpty = false;
              globalObject.state.gotErrorDuringRequest = false;

              //Got some results
              //Update the global state
              globalObject.props.UpdateRides_history_YourRides_tab(
                response.data,
              );
            } //EMpty results
            else {
              globalObject.setState({
                areResultsEmpty: true,
                gotErrorDuringRequest: false,
              });
            }
          } //An error happened
          else {
            globalObject.setState({
              areResultsEmpty: true,
              gotErrorDuringRequest: true,
            });
          }
        } //Empty
        else {
          globalObject.setState({
            areResultsEmpty: true,
            gotErrorDuringRequest: true,
          });
        }
      },
    );

    //Request for ride
    this.fetchRequestedRequests_history();

    //Add home going back handler-----------------------------
    this.props.navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      globalObject.props.navigation.navigate('Home_drawer');
      return;
    });
    //--------------------------------------------------------
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMOUNTED
    //Remove the network state listener
    if (this.state.networkStateChecker !== false) {
      this.state.networkStateChecker();
    }
    //Remove navigation event listener
    if (this._navigatorEvent !== false && this._navigatorEvent !== undefined) {
      this._navigatorEvent();
    }
    //...
    if (this.backHander !== null) {
      this.backHander.remove();
    }
  }

  /**
   * @func fetchRequestedRequests_history
   * Responsible for finding the data for the selected ride type
   * @param type: the type of request (past, scheduled, business)
   * Data format:
   * {
   *    destination_name:destination_1,destination_2,...
   *    date_requested: dd/mm/yyyy, hh:mm
   *    car_brand: Toyota corolla
   *    request_fp: XXXXXXXXXX
   * }
   */
  fetchRequestedRequests_history(type = false) {
    //...
    this.setState({
      loaderState: true,
      fetchingRides_Data: true,
      areResultsEmpty: false,
      gotErrorDuringRequest: false,
    }); //Activate the loader
    this.props.App.rides_history_details_data.rides_history_data = []; //! CLEAN HISTORY ARRAY.
    //Get from the server
    this.props.App.socket.emit('getRides_historyRiders_batchOrNot', {
      user_fingerprint: this.props.App.user_fingerprint,
      ride_type: type === false ? this.props.App.shownRides_types : type,
    });
  }

  /**
   * @func fillForEmptyRequests
   * Responsible for filling the page with empty content based on the type of ride
   */
  fillForEmptyRequests() {
    if (/past/i.test(this.props.App.shownRides_types)) {
      //Past rides
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingTop: '35%',
          }}>
          <IconEntypo name="box" size={40} color="#757575" />
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextRegular'
                  : 'Uber Move Text',
              fontSize: RFValue(18),
              marginTop: 15,
              color: '#757575',
            }}>
            No requests so far.
          </Text>
        </View>
      );
    } else if (/scheduled/i.test(this.props.App.shownRides_types)) {
      //Scheduled rides
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingTop: '35%',
          }}>
          <IconFeather name="clock" size={40} color="#757575" />
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextRegular'
                  : 'Uber Move Text',
              fontSize: RFValue(18),
              marginTop: 15,
              color: '#757575',
            }}>
            No pending scheduled requests so far.
          </Text>
        </View>
      );
    } else if (/business/i.test(this.props.App.shownRides_types)) {
      //Business rides
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingTop: '35%',
          }}>
          <IconFeather name="briefcase" size={40} color="#757575" />
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextRegular'
                  : 'Uber Move Text',
              fontSize: RFValue(18),
              marginTop: 15,
              color: '#757575',
            }}>
            No business requests made so far.
          </Text>
        </View>
      );
    }
  }

  /**
   * @func pullRefreshRequest
   * Responsible for launching a fresh loading of the details on pull of the screen
   */
  pullRefreshRequest() {
    this.setState({pullRefreshing: true});
    this.fetchRequestedRequests_history(this.props.App.shownRides_types);
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

  render() {
    return (
      <>
        {this._isMounted ? (
          <View style={styles.mainWindow}>
            <StatusBar backgroundColor="#000" />
            <GenericLoader active={this.state.loaderState} thickness={4} />
            {this.props.App.generalErrorModal_vars.showErrorGeneralModal
              ? this.renderError_modalView()
              : null}

            {this.state.fetchingRides_Data === false ? (
              this.props.App.rides_history_details_data.rides_history_data
                .length > 0 ? (
                <FlatList
                  data={
                    this.props.App.rides_history_details_data.rides_history_data
                  }
                  refreshControl={
                    <RefreshControl
                      onRefresh={() => this.pullRefreshRequest()}
                      refreshing={this.state.pullRefreshing}
                    />
                  }
                  initialNumToRender={15}
                  keyboardShouldPersistTaps={'always'}
                  maxToRenderPerBatch={35}
                  windowSize={61}
                  updateCellsBatchingPeriod={10}
                  keyExtractor={(item, index) => String(index)}
                  renderItem={(item) => (
                    <RideLIstGenericElement
                      requestLightData={item.item}
                      parentNode={this}
                    />
                  )}
                />
              ) : (
                <ScrollView
                  style={styles.mainWindow}
                  refreshControl={
                    <RefreshControl
                      onRefresh={() => this.pullRefreshRequest()}
                      refreshing={this.state.pullRefreshing}
                    />
                  }>
                  {this.fillForEmptyRequests()}
                </ScrollView>
              )
            ) : null}
          </View>
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
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdateErrorModalLog,
      UpdateType_rideShown_YourRides_screen,
      UpdateRides_history_YourRides_tab,
      UpdateTargetedRequest_yourRides_history,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(YourRidesEntry);
