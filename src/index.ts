import { MustacheService } from './mustacheService.js';
import { User } from './user.js';

const ft_login = process.env.FT_LOGIN;
if (ft_login === undefined || ft_login === '') {
    process.exit(1);
}
const user = new User(ft_login);
await user.updateUser();
const mustacheService = new MustacheService(user);
await mustacheService.generateReadMe();