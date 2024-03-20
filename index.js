const axios = require('axios');
const fs = require('fs');
const Mustache = require('mustache');

const MUSTACHE_MAIN_DIR = './main.mustache';

let DATA = {
	unix_projects: []
};

// Credentials
const UID = '';
const SECRET = '';

// Function to fetch an access token from the 42 API
async function getAccessToken() {
    try {
        const response = await axios.post('https://api.intra.42.fr/oauth/token', {
            grant_type: 'client_credentials',
            client_id: UID,
            client_secret: SECRET
        });
		return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function req(url) {
	const accessToken = await getAccessToken();
	const response = await axios.get('https://api.intra.42.fr/' + url, {
		headers: { 'Authorization': `Bearer ${accessToken}` }
	});
	if (response.status === 200) {
		return response.data;
	} else {
		throw new Error('Error fetching ' + url);
	}
}

async function getUserIdByLogin(login) {
	try {
		const users = await req('/v2/users?filter[login]=' + login);
        if (users.length > 0) {
            return users[0].id;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        throw error;
    }
}

async function getProjectsUser(login) {
    try {
		const userId = await getUserIdByLogin(login);
		const projectsUsers = await req(`/v2/users/${userId}/projects_users?page[size]=100`);
		return projectsUsers;
    } catch (error) {
        console.error('Error fetching projects user:', error.response ? error.response.data : error.message);
    }
}

async function isCursusProject(project_user) {
	try {
		const project = await req(`/v2/projects/${project_user.project.id}`);
		if (project.exam)
			return false;
		if (project.cursus.findIndex(cursus => cursus.id === 9) !== -1)
			return false;
		return true;
	} catch (error) {
        console.error('Error fetching user projects:', error.response ? error.response.data : error.message);
    }
}

const asyncFilter = async (arr, predicate) => {
	const results = await Promise.all(arr.map(predicate));

	return arr.filter((_v, index) => results[index]);
}

function getProjectLitteral(project) {
	let litteral = {
		status: '',
		name: '',
		badge: ''
	};
	litteral.name = project.project.name;
	if (project.status === 'finished') {
		if (project.final_mark < 100) {
			litteral.badge = project.final_mark + '-ffcc00';
		} else if (project.final_mark < 125) {
			litteral.badge = project.final_mark + '-green';
		} else if (project.final_mark === 125) {
			litteral.badge = project.final_mark + '-0d4500';
		}
		if (project['validated?'] == true) {
			litteral.status = '✅';
		} else {
			litteral.status = '❌';
		}
	} else {
		litteral.status = '🚧';
		litteral.badge = '%2F-black';
	}
	return litteral;
}

async function getAllProjectsLitteral(login) {
	const projects = await getProjectsUser(login);
	let filtered_projects = await asyncFilter(projects, isCursusProject);
	filtered_projects.sort((a, b) => {
		if (a.created_at < b.created_at)
			return 1;
		else if (a.created_at > b.created_at)
			return -1;
		return 0;
	});
	const project_litteral = filtered_projects.map(project => {
		return getProjectLitteral(project);
	});
	return project_litteral;
}

async function generateReadMe() {
	await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
	  if (err) throw err;
	  const output = Mustache.render(data.toString(), DATA);
	  fs.writeFileSync('README.md', output);
	});
  }

async function define_data() {
	DATA.unix_projects = await getAllProjectsLitteral('rrollin');
}

async function action() {
	await define_data();
	await generateReadMe();
}
  
action();