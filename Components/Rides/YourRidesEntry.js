import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {View, Text, StyleSheet, FlatList, RefreshControl} from 'react-native';
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
import SyncStorage from 'sync-storage';

const DATA = new Array(2).fill(50);

class YourRidesEntry extends React.PureComponent {
  constructor(props) {
    super(props);

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

  async componentDidMount() {
    //Check for the user_fp
    await SyncStorage.init();
    let user_fp = SyncStorage.get('@ufp');
    if (
      user_fp !== undefined &&
      user_fp !== null &&
      user_fp !== false &&
      user_fp.length > 50
    ) {
      //Valid
      this.props.App.user_fingerprint = user_fp;
    } //Invalid user fp - back to home
    else {
      this.props.navigation.navigate('EntryScreen');
    }

    let globalObject = this;
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

      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
    });

    //connection
    this.props.App.socket.on('connect', () => {
      globalObject.props.UpdateErrorModalLog(false, false, 'any');
    });
    //Socket error handling
    this.props.App.socket.on('error', (error) => {
      //console.log('something');
    });
    this.props.App.socket.on('disconnect', () => {
      //console.log('something');
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_error', () => {
      console.log('connect_error');
      //Ask for the OTP again
      globalObject.props.UpdateErrorModalLog(
        true,
        'connection_no_network',
        'any',
      );
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_timeout', () => {
      console.log('connect_timeout');
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect', () => {
      ////console.log('something');
    });
    this.props.App.socket.on('reconnect_error', () => {
      console.log('reconnect_error');
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect_failed', () => {
      console.log('reconnect_failed');
      globalObject.props.App.socket.connect();
    });

    /**
     * SOCKET.IO RESPONSES
     */
    this.props.App.socket.on(
      'getRides_historyRiders_batchOrNot-response',
      function (response) {
        console.log(response);
        globalObject.setState({
          loaderState: false,
          fetchingRides_Data: false,
          pullRefreshing: false,
        });
        if (
          response !== false &&
          response.response !== undefined &&
          response.response !== false
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
  }

  componentWillUnmount() {
    //Remove the network state listener
    if (this.state.networkStateChecker !== false) {
      this.state.networkStateChecker();
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
    this.setState({
      loaderState: true,
      fetchingRides_Data: true,
      areResultsEmpty: false,
      gotErrorDuringRequest: false,
    }); //Activate the loader
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
          <IconEntypo name="box" size={40} color="#a5a5a5" />
          <Text
            style={{
              fontFamily: 'Allrounder-Grotesk-Book',
              fontSize: 16,
              marginTop: 15,
            }}>
            You're not yet made a request with us.
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
          <IconFeather name="clock" size={40} color="#a5a5a5" />
          <Text
            style={{
              fontFamily: 'Allrounder-Grotesk-Book',
              fontSize: 16,
              marginTop: 15,
            }}>
            No pending scheduled request so far.
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
          <IconFeather name="briefcase" size={40} color="#a5a5a5" />
          <Text
            style={{
              fontFamily: 'Allrounder-Grotesk-Book',
              fontSize: 16,
              marginTop: 15,
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

  render() {
    return (
      <View style={styles.mainWindow}>
        <GenericLoader active={this.state.loaderState} />
        <ErrorModal
          active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
          error_status={
            this.props.App.generalErrorModal_vars.generalErrorModalType
          }
          parentNode={this}
        />

        {this.state.fetchingRides_Data === false ? (
          this.state.areResultsEmpty === false ? (
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
            this.fillForEmptyRequests()
          )
        ) : null}
      </View>
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
