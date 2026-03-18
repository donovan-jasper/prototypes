const scanEmailsForSubscriptions = async (accessToken, provider) => {
  const emails = await fetchEmails(accessToken, provider);
  const subscriptions = [];
  const seen = new Set();

  for (const email of emails) {
    const subscription = extractSubscriptionFromEmail(email);
    
    if (subscription && !seen.has(subscription.source)) {
      seen.add(subscription.source);
      subscriptions.push({
        ...subscription,
        tempId: `temp-${Date.now()}-${Math.random()}`,
      });
    }
  }

  return subscriptions;
};

const fetchEmails = async (accessToken, provider) => {
  if (provider === 'gmail') {
    return fetchGmailEmails(accessToken);
  } else if (provider === 'outlook') {
    return fetchOutlookEmails(accessToken);
  }
  return [];
};

const fetchGmailEmails = async (accessToken) => {
  try {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=unsubscribe OR billing OR newsletter',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    
    if (!data.messages) return [];

    const emails = [];
    for (const message of data.messages.slice(0, 50)) {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      const detail = await detailResponse.json();
      emails.push(parseGmailMessage(detail));
    }

    return emails;
  } catch (error) {
    console.error('Gmail fetch error:', error);
    return [];
  }
};

const fetchOutlookEmails = async (accessToken) => {
  try {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/messages?$top=100&$filter=contains(subject,\'unsubscribe\') or contains(subject,\'billing\') or contains(subject,\'newsletter\')&$select=from,subject,body',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    
    if (!data.value) return [];

    return data.value.map(parseOutlookMessage);
  } catch (error) {
    console.error('Outlook fetch error:', error);
    return [];
  }
};

const parseGmailMessage = (message) => {
  const headers = message.payload.headers;
  const from = headers.find(h => h.name === 'From')?.value || '';
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  
  let body = '';
  if (message.payload.body.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  } else if (message.payload.parts) {
    const textPart = message.payload.parts.find(p => p.mimeType === 'text/plain' || p.mimeType === 'text/html');
    if (textPart && textPart.body.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  }

  return { from, subject, body };
};

const parseOutlookMessage = (message) => {
  return {
    from: message.from?.emailAddress?.address || '',
    subject: message.subject || '',
    body: message.body?.content || '',
  };
};

const extractSubscriptionFromEmail = (email) => {
  const unsubscribeUrl = extractUnsubscribeUrl(email.body);
  
  if (!unsubscribeUrl) return null;

  const sourceEmail = extractEmail(email.from);
  const name = extractServiceName(email.from, email.subject);
  const cost = extractCost(email.body, email.subject);

  return {
    name,
    source: sourceEmail,
    unsubscribe_url: unsubscribeUrl,
    cost,
  };
};

const extractUnsubscribeUrl = (body) => {
  const patterns = [
    /https?:\/\/[^\s<>"]+unsubscribe[^\s<>"]*/gi,
    /<a[^>]+href=["'](https?:\/\/[^"']+unsubscribe[^"']*)["']/gi,
    /https?:\/\/[^\s<>"]+\/optout[^\s<>"]*/gi,
    /https?:\/\/[^\s<>"]+\/opt-out[^\s<>"]*/gi,
  ];

  for (const pattern of patterns) {
    const matches = body.match(pattern);
    if (matches && matches.length > 0) {
      let url = matches[0];
      const hrefMatch = url.match(/href=["'](https?:\/\/[^"']+)["']/i);
      if (hrefMatch) {
        url = hrefMatch[1];
      }
      return url.replace(/[<>"]/g, '');
    }
  }

  return null;
};

const extractEmail = (fromField) => {
  const match = fromField.match(/[\w.-]+@[\w.-]+\.\w+/);
  return match ? match[0] : fromField;
};

const extractServiceName = (from, subject) => {
  const fromMatch = from.match(/^([^<@]+)/);
  if (fromMatch) {
    return fromMatch[1].trim();
  }

  const subjectMatch = subject.match(/^([^-:|]+)/);
  if (subjectMatch) {
    return subjectMatch[1].trim();
  }

  const domainMatch = from.match(/@([\w-]+)\./);
  if (domainMatch) {
    return domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
  }

  return 'Unknown Service';
};

const extractCost = (body, subject) => {
  const text = body + ' ' + subject;
  
  const patterns = [
    /\$(\d+\.?\d*)\s*(?:per|\/)\s*(?:month|mo)/gi,
    /(\d+\.?\d*)\s*(?:USD|dollars?)\s*(?:per|\/)\s*(?:month|mo)/gi,
    /monthly.*?\$(\d+\.?\d*)/gi,
    /subscription.*?\$(\d+\.?\d*)/gi,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const priceMatch = match[0].match(/\d+\.?\d*/);
      if (priceMatch) {
        return parseFloat(priceMatch[0]);
      }
    }
  }

  return 0;
};

export { scanEmailsForSubscriptions };
