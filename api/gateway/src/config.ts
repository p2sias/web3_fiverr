import config from "config";

const jobsServiceUrl = config.get("jobsService");
const usersServiceUrl = config.get("usersService");


const jobsApiUrl = `${jobsServiceUrl}/api/jobs`;
const usersApiUrl = `${usersServiceUrl}/api/users`;
const sessionsApiUrl = `${usersServiceUrl}/api/sessions`;
const picturesApiUrl = `${jobsServiceUrl}/api/pictures`;
const avatarsApiUrl = `${usersServiceUrl}/api/avatars`;
const categoriesApiUrl = `${jobsServiceUrl}/api/categories`;

export { jobsApiUrl, usersApiUrl,  picturesApiUrl, avatarsApiUrl, categoriesApiUrl, sessionsApiUrl};