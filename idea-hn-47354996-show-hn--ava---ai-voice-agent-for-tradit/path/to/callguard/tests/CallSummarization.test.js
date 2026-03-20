import React from 'react';
import CallSummarization from '../../components/CallSummarization';

describe('CallSummarization', () => {
  it('gets call summary correctly', () => {
    CallSummarization.getCallSummary().then((calls) => {
      expect(calls).toBeDefined();
    });
  });
});
