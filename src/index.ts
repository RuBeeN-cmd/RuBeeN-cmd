import { MustacheService } from './mustacheService.js';
import { User } from './user.js';

const user = new User('rrollin');
await user.updateUser();
const mustacheService = new MustacheService(user);
await mustacheService.generateReadMe();