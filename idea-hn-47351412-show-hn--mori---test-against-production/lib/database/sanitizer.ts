const sanitizeData = (rows: any[], schema: any) => {
  const sanitizedRows = rows.map((row) => {
    const sanitizedRow: any = {};

    for (const column of schema) {
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

  return sanitizedRows;
};

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@');
  return `${localPart.substring(0, 2)}***@${domain}`;
};

const maskPhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1***$2');
};

export { sanitizeData };
