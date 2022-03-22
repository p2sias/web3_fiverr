export default interface User {
    _id?: string,
    polygon_address: string,
    mail?: string,
    pseudo?: string,
    jobs?: [],
    jwt_token: string,
    avatar?: string,
    createdAt?: string,
    updatedAt?: string,
    bio?: string
}