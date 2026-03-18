# CodeCapsule

A mobile app that provides secure, zero-configuration sandbox environments for AI coding assistants, enabling seamless development workflows without compromising system security

**Who it's for:** Mobile developers who use AI coding assistants (e.g., GitHub Copilot, Claude) but need secure, isolated environments for testing and experimentation without risking their device's security

**Gap:** Current mobile AI coding tools either lack security isolation or require complex manual setup. This fills the need for a simple, secure way to use AI coding assistants on mobile devices

**Monetization:** Freemium model with a $4.99/month premium tier for advanced features like extended session time and priority support

**Viability: 8/10 | Competition: 9/10 | Difficulty: Medium — requires deep integration with mobile security models and AI coding APIs**

## Architecture

This app uses a cloud-based backend service for sandboxed code execution:

- **Mobile App (React Native/Expo)**: User interface for writing and running code
- **Backend Service (Node.js + Docker)**: Handles code execution in isolated Docker containers
- **WebSocket Connection**: Real-time communication between app and backend

## Deployment

### Backend Deployment

The backend service needs to be deployed to a server with Docker support. Recommended platforms:

#### Railway
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`
5. Get URL: `railway domain`

#### Render
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Select "Docker" as environment
4. Deploy automatically from `render.yaml`

#### AWS/DigitalOcean
1. Set up a server with Docker installed
2. Clone the repository
3. Run: `docker build -t codecapsule .`
4. Run: `docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock codecapsule`

### Mobile App Configuration

After deploying the backend, update the API URL in `src/context/SessionContext.tsx`:
