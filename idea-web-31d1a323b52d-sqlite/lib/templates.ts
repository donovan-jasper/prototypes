const templates = [
  {
    name: 'Inventory',
    fields: [
      { name: 'product_name', type: 'TEXT' },
      { name: 'quantity', type: 'INTEGER' },
      { name: 'reorder_level', type: 'INTEGER' }
    ]
  },
  {
    name: 'Contacts',
    fields: [
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' },
      { name: 'phone', type: 'TEXT' }
    ]
  },
  {
    name: 'Projects',
    fields: [
      { name: 'project_name', type: 'TEXT' },
      { name: 'start_date', type: 'TEXT' },
      { name: 'end_date', type: 'TEXT' },
      { name: 'status', type: 'TEXT' }
    ]
  },
  {
    name: 'Events',
    fields: [
      { name: 'event_name', type: 'TEXT' },
      { name: 'date', type: 'TEXT' },
      { name: 'location', type: 'TEXT' },
      { name: 'attendees', type: 'INTEGER' }
    ]
  },
  {
    name: 'Collections',
    fields: [
      { name: 'item_name', type: 'TEXT' },
      { name: 'category', type: 'TEXT' },
      { name: 'acquisition_date', type: 'TEXT' },
      { name: 'value', type: 'REAL' }
    ]
  }
];

export const getTemplate = (name) => {
  return templates.find(template => template.name.toLowerCase() === name.toLowerCase());
};

export const listTemplates = () => {
  return templates;
};
