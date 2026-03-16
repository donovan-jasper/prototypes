import { Router } from 'express';
import twilio from 'twilio';

const router = Router();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

router.post('/voice', async (req, res) => {
    const { CallSid } = req.body;
    console.log(`Incoming call from Twilio. CallSid: ${CallSid}`);

    const workflowId = req.query.workflow_id || 'default-workflow-id';

    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect();
    connect.stream({
        url: `wss://${req.headers.host}/ws?call_sid=${CallSid}&workflow_id=${workflowId}`,
        track: 'inbound_track'
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

router.post('/stream', (req, res) => {
    res.status(400).send('This endpoint is for WebSocket connections, not HTTP POST.');
});

export default router;
