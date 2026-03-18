interface FollowUpInput {
  company: string;
  ticketId: string;
  daysOverdue: number;
}

export function generateFollowUp(input: FollowUpInput): string {
  const { company, ticketId, daysOverdue } = input;
  
  if (daysOverdue <= 2) {
    return `Hi ${company} Support,

I wanted to follow up on my support request ${ticketId}. I submitted this ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago and haven't received a response yet.

Could you please provide an update on the status?

Thank you for your help.`;
  }
  
  if (daysOverdue <= 5) {
    return `Hi ${company} Support,

I'm following up on ticket ${ticketId}, which I submitted ${daysOverdue} days ago. I understand you may be experiencing high volume, but I would appreciate an update on when I can expect a response.

This matter is becoming time-sensitive for me.

Thank you.`;
  }
  
  return `Hi ${company} Support,

I urgently need assistance with ticket ${ticketId}. It has been ${daysOverdue} days since I submitted this request, and I have not received any response.

This is now a critical issue that requires immediate attention. Please escalate this to a supervisor if necessary.

I look forward to your prompt response.`;
}
