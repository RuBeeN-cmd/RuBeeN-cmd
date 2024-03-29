import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

export class api42Service {
	private uid: string = '';
	private secret: string = '';
	private accessToken: string = '';

	constructor() {
		this.uid = process.env.API42_UID;
		this.secret = process.env.API42_SECRET;
	}

	private async fetchAccessToken() {
		try {
			const response = await axios.post('https://api.intra.42.fr/oauth/token', {
				grant_type: 'client_credentials',
				client_id: this.uid,
				client_secret: this.secret
			});
			return response.data.access_token;
		} catch {
			throw new Error('Invalid credentials');
		}
	}

	private async req(url: string) {
		if (this.accessToken === '')
			this.accessToken = await this.fetchAccessToken();
		const response = await axios.get('https://api.intra.42.fr/' + url, {
			headers: { 'Authorization': `Bearer ${this.accessToken}` }
		});
		if (response.status === 200) {
			return response.data;
		} else {
			throw new Error('Error fetching ' + url);
		}
	}

	public async getUserFromLogin(login: string) {
		try {
			const users = await this.req('/v2/users?filter[login]=' + login);
			if (users.length > 0)
				return users[0];
			else
				throw new Error('User not found');
		} catch (error) {
			throw error;
		}
	}

	public async getUserFromId(id: number) {
		try {
			const users = await this.req('/v2/users/' + id);
			return users;
		} catch (error) {
			throw error;
		}
	}

	public async getUserProjects(userId: number) {
		try {
			const projects = await this.req(`/v2/users/${userId}/projects_users?page[size]=100`);
			return projects;
		} catch (error) {
			throw error;
		}
	}

	public async getProject(projectId: number) {
		try {
			const project = await this.req(`/v2/projects/${projectId}`);
			return project;
		} catch (error) {
			throw error;
		}
	}

	public async isCursusProject(projectId: number) {
		try {
			const project = await this.getProject(projectId);
			if (project.exam)
				return false;
			if (project.cursus.findIndex(cursus => cursus.id === 9) !== -1)
				return false;
			return true;
		} catch (error) {
			throw error;
		}
	}
}