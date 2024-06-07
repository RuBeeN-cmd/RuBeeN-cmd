import Mustache from 'mustache';
import fs from 'fs';
import { User } from './user.js';

interface Project {
	name: string;
	mark: string;
	markColor: string;
	status: string;
};

interface MustacheData {
	projects: Project[];
	onGoingProjects: Project[];
	roundLevel: string;
};

const DefMustacheData: MustacheData = {
	projects: [],
	onGoingProjects: [],
	roundLevel: ''
};

export class MustacheService {
	private data: MustacheData = DefMustacheData;
	private template: string = 'main.mustache';
	private outFile: string = 'README.md';

	constructor(user: User) {
		this.updateData(user);
	}

	private updateData(user: User) {
		this.data.roundLevel = Math.floor(user.getLevel()).toString();
		this.data.projects = user.getProjects().map(project => {
			let mustacheProject = {
				name: project.name,
				mark: '/',
				markColor: 'black',
				status: ''
			};
			if (project.status === 'finished' && project.mark !== null) {
				mustacheProject.mark = project.mark.toString();
				if (project.mark < 100) {
					mustacheProject.markColor = 'ffcc00';
				} else if (project.mark < 125) {
					mustacheProject.markColor = 'green';
				} else if (project.mark === 125) {
					mustacheProject.markColor = '0d4500';
				}
				if (project.validated == true) {
					mustacheProject.status = '✅';
				} else {
					mustacheProject.status = '❌';
				}
			} else {
				mustacheProject.status = '🚧';
				mustacheProject.mark = '%2F';
			}
			return mustacheProject;
		});
		this.data.onGoingProjects = this.data.projects.filter(project => project.mark !== '%2F');
	}

	async generateReadMe() {
		await fs.readFile(this.template, (err, data) => {
			if (err) throw err;
			const output = Mustache.render(data.toString(), this.data);
			fs.writeFileSync(this.outFile, output);
		});
	}
}