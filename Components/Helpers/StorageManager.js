import SyncStorage from 'sync-storage';

//Initialize the storage manager
const storageInit = async () => {
  const data = await SyncStorage.init();
  console.log(data);
};

const StorageManager = (options) => {
  if (/init/i.test(options)) {
    storageInit();
  } //No options passed
  else {
    console.log('No options passedd');
  }
};

export default StorageManager;
