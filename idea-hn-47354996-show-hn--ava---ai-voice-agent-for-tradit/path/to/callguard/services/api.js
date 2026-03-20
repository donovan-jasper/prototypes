import React, { useState, useEffect } from 'react';
import { fetch } from 'expo-fetch';

const api = {
  getCallData: () => {
    // Get the call data from the API
    return fetch('https://example.com/api/call-data')
      .then((response) => response.json())
      .then((data) => data);
  },
};

export default api;
