import axios from 'axios';

export class FlyioClient {
  private token: string;
  private baseUrl = 'https://api.fly.io/graphql';

  constructor(token: string) {
    this.token = token;
  }

  async getApps() {
    const query = `
      query {
        apps {
          nodes {
            id
            name
            status
            organization { id }
          }
        }
      }
    `;

    const response = await axios.post(
      this.baseUrl,
      { query },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );

    return response.data.data.apps.nodes;
  }

  async getAppStatus(appId: string) {
    const query = `
      query($appId: String!) {
        app(name: $appId) {
          status
          allocations {
            id
            healthy
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.baseUrl,
        { query, variables: { appId } },
        { headers: { Authorization: `Bearer ${this.token}` } }
      );

      return this.parseAppStatus(response.data.data.app);
    } catch (error) {
      if (error.response?.status === 404) {
        return 'deleted';
      }
      throw error;
    }
  }

  parseAppStatus(appData: any): 'healthy' | 'unhealthy' | 'deleted' {
    if (!appData) return 'deleted';
    if (appData.status !== 'running') return 'unhealthy';

    const healthyAllocations = appData.allocations?.filter((a: any) => a.healthy).length || 0;
    return healthyAllocations > 0 ? 'healthy' : 'unhealthy';
  }

  async restartApp(appId: string) {
    const mutation = `
      mutation($appId: String!) {
        restartApp(input: { appId: $appId }) {
          app {
            id
          }
        }
      }
    `;

    await axios.post(
      this.baseUrl,
      { query: mutation, variables: { appId } },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
  }

  async rollbackDeployment(appId: string) {
    const mutation = `
      mutation($appId: String!) {
        rollbackApp(input: { appId: $appId }) {
          app {
            id
          }
        }
      }
    `;

    await axios.post(
      this.baseUrl,
      { query: mutation, variables: { appId } },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
  }

  async getDeploymentHistory(appId: string) {
    const query = `
      query($appId: String!) {
        app(name: $appId) {
          deployments {
            id
            status
            createdAt
            version
          }
        }
      }
    `;

    const response = await axios.post(
      this.baseUrl,
      { query, variables: { appId } },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );

    return response.data.data.app.deployments;
  }
}
