import { FollowUpOptions } from './types';
import { format } from 'date-fns';

const TEMPLATES = {
  polite: `Hi [company],

I hope you're doing well. I wanted to follow up on my support ticket [ticketId] which was submitted on [date]. I haven't received any updates and was wondering if there's been any progress.

Could you please let me know the current status? I'd really appreciate your help with this.

Best regards,
[Your Name]`,
  firm: `Hi [company] Support Team,

I'm following up on my ticket [ticketId] which was submitted on [date]. I noticed it's been [days] days since my last update and I'm still waiting for a resolution.

Could you please provide an update on the status of this issue? I'd like to know if there's a timeline for when I can expect a response.

Thank you for your assistance.

Best,
[Your Name]`,
  urgent: `Hi [company],

I'm reaching out regarding my support ticket [ticketId] which was submitted on [date]. It's been [days] days since I last heard back, and I'm still experiencing the issue.

This is urgent for me, so I'd appreciate it if you could prioritize this ticket and provide an update as soon as possible. Please let me know what steps you're taking to resolve this.

Thank you for your prompt attention to this matter.

Best regards,
[Your Name]`
};

export function generateFollowUp(options: FollowUpOptions): string {
  let template: string;

  if (options.daysOverdue >= 7) {
    template = TEMPLATES.urgent;
  } else if (options.daysOverdue >= 3) {
    template = TEMPLATES.firm;
  } else {
    template = TEMPLATES.polite;
  }

  return template
    .replace('[company]', options.company)
    .replace('[ticketId]', options.ticketId)
    .replace('[date]', format(options.submittedAt, 'MMMM d, yyyy'))
    .replace('[days]', options.daysOverdue.toString());
}
