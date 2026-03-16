import { Config } from '../constants/Config';

// Mock tuner discovery - in a real implementation, this would scan the network
// for OTA tuners like HDHomeRun devices
export const discoverTuners = async (): Promise<any[]> => {
  // Simulate network scan delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock tuners for demo purposes
  return [
    { id: '1', ip: '192.168.1.100', model: 'HDHomeRun PRIME' },
    { id: '2', ip: '192.168.1.101', model: 'HDHomeRun DUAL' },
  ];
};

// Mock channel list retrieval - in a real implementation, this would
// call the tuner's API to get the available channels
export const getChannelList = async (tuner: any): Promise<any[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock channel list
  return [
    { id: '1', name: 'ABC', number: '7.1', currentShow: 'Good Morning America' },
    { id: '2', name: 'CBS', number: '2.1', currentShow: 'The Talk' },
    { id: '3', name: 'NBC', number: '5.1', currentShow: 'Today Show' },
    { id: '4', name: 'FOX', number: '11.1', currentShow: 'Local News' },
    { id: '5', name: 'PBS', number: '9.1', currentShow: 'Sesame Street' },
    { id: '6', name: 'CW', number: '13.1', currentShow: 'Local Sports' },
    { id: '7', name: 'Univision', number: '34.1', currentShow: 'Noticiero Univision' },
    { id: '8', name: 'Telemundo', number: '42.1', currentShow: 'Noticias Telemundo' },
  ];
};
