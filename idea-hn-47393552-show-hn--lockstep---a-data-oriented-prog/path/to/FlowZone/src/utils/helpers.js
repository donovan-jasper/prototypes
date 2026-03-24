export const formatWorkflow = (workflow) => {
  return {
    id: workflow.id,
    name: workflow.name,
    steps: JSON.parse(workflow.steps),
  };
};

export const formatTask = (task) => {
  return {
    id: task.id,
    name: task.name,
    workflowId: task.workflowId,
  };
};

export const formatData = (data) => {
  return {
    id: data.id,
    name: data.name,
    value: data.value,
  };
};
