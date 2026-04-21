const sanitizeData = (data: any, schema: any) => {
  const sanitizedData: any = {};

  for (const table in data) {
    sanitizedData[table] = data[table].map((row: any) => {
      const sanitizedRow: any = {};

      for (const column of schema[table]) {
        const columnName = column.column_name;
        const dataType = column.data_type;

        if (dataType === 'varchar' && columnName.includes('email')) {
          sanitizedRow[columnName] = maskEmail(row[columnName]);
        } else if (dataType === 'varchar' && columnName.includes('phone')) {
          sanitizedRow[columnName] = maskPhone(row[columnName]);
        } else {
          sanitizedRow[columnName] = row[columnName];
        }
      }

      return sanitizedRow;
    });
  }

  return sanitizedData;
};

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@');
  return `${localPart.substring(0, 2)}***@${domain}`;
};

const maskPhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1***$2');
};

export { sanitizeData };
