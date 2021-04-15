import SyncStorage from 'sync-storage';

//Initialize the storage manager
const storageInit = async () => {
  const data = await SyncStorage.init();
};

const StorageManager = (options) => {
  if (/init/i.test(options)) {
    storageInit();
  } //No options passed
  else {
  }
};

export default StorageManager;
