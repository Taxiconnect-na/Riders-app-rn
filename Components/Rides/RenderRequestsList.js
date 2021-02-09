import React from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
} from 'react-native';
import RideLIstGenericElement from './RideLIstGenericElement';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconFeather from 'react-native-vector-icons/Feather';
import {ScrollView} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';

class RenderRequestsList extends React.PureComponent {
  constructor(props) {
    super(props);
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

  render() {
    return (
      <View style={styles.mainWindow}>
        {this.props.App.rides_history_details_data.rides_history_data.length >
        0 ? (
          <FlatList
            data={this.props.App.rides_history_details_data.rides_history_data}
            refreshControl={
              <RefreshControl
                onRefresh={() => this.props.pullRefreshRequest()}
                refreshing={this.props.pullRefreshing}
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
                parentNode={this.props.parentNode}
              />
            )}
          />
        ) : (
          <ScrollView
            style={styles.mainWindow}
            refreshControl={
              <RefreshControl
                onRefresh={() => this.props.pullRefreshRequest()}
                refreshing={this.props.pullRefreshing}
              />
            }>
            {this.fillForEmptyRequests()}
          </ScrollView>
        )}
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

export default React.memo(connect(mapStateToProps)(RenderRequestsList));
