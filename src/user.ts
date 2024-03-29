import { api42Service } from './api42Service.js';

interface Project {
	name: string;
	mark: number;
	status: string;
	validated: boolean;
};

export class User {
	private api42Service: api42Service = new api42Service();
	private id: number = -1;
	private login: string = '';
	private fullName: string = '';
	private level: number = 0;
	private projects: Project[] = [];

	constructor(login: string) {
		this.login = login;
	}

	private async updateId() {
		try {
			this.id = (await this.api42Service.getUserFromLogin(this.login)).id;
		} catch (error) {
			throw error;
		}
	}

	private async updateProjects(projectsUser: any[]) {
		projectsUser.sort((a, b) => {
			if (a.created_at < b.created_at)
				return 1;
			else if (a.created_at > b.created_at)
				return -1;
			return 0;
		});
		for (let i = 0; i < projectsUser.length; i++) {
			try {
				if (await this.api42Service.isCursusProject(projectsUser[i].project.id)) {
					this.projects.push({
						name: projectsUser[i].project.name,
						mark: projectsUser[i].final_mark,
						status: projectsUser[i].status,
						validated: projectsUser[i]['validated?']
					});
				}
			} catch (error) {
				throw error;
			}
		}
	}

	public async updateUser() {
		try {
			if (this.id === -1)
				await this.updateId();
			const user = await this.api42Service.getUserFromId(this.id);
			this.fullName = user.displayname;
			if (user.cursus_users.length < 2)
				throw new Error('User has no cursus');
			this.level = user.cursus_users[1].level;
			await this.updateProjects(user.projects_users);
		} catch (error) {
			throw error;
		}
	}

	public getLevel() {
		return this.level;
	}

	public getProjects() {
		return this.projects;
	}
}