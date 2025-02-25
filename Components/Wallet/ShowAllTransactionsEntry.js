import React from 'react';
import {connect} from 'react-redux';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import WalletTransacRecords from './WalletTransacRecords';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {FlatList} from 'react-native-gesture-handler';

class ShowAllTransactionsEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE MAIN SCREEN WHEN UNMOUNTED.

    //Handlers
    this.backHander = null;
    this._navigatorEvent = null;
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMOUNTED
    //...
    /*if (this.backHander !== null) {
      this.backHander.remove();
    }
    //...
    if (this._navigatorEvent !== null) {
      this._navigatorEvent();
      this._navigatorEvent = null;
    }*/
  }

  componentDidMount() {
    let that = this;
    this._isMounted = true;

    //? Add navigator listener - auto clean on focus
    this._navigatorEvent = that.props.navigation.addListener('focus', () => {});
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        that.props.navigation.goBack();
        return true;
      },
    );
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <StatusBar backgroundColor="#000" />
        <FlatList
          data={this.props.App.wallet_state_vars.transactions_details}
          initialNumToRender={15}
          keyboardShouldPersistTaps={'always'}
          maxToRenderPerBatch={35}
          windowSize={61}
          updateCellsBatchingPeriod={10}
          keyExtractor={(item, index) => item + index}
          renderItem={({item}) => (
            <WalletTransacRecords transactionDetails={item} />
          )}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  mainWindow: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    padding: 5,
    paddingTop: 10,
  },
  presentationWindow: {
    flex: 1,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(ShowAllTransactionsEntry));
