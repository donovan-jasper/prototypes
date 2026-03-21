import { executeTaskChain } from '../utils/taskChainExecutor';

const RaccoonAIService = {
  executeTaskChain: async (taskChain) => {
    const result = await executeTaskChain(taskChain);
    return result;
  },
};

export default RaccoonAIService;
