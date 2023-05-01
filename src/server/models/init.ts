import {UserModel} from "./UserModel"
import {Sequelize} from "sequelize"

export const initModels = (sequelize: Sequelize) => {
    const UserDb = sequelize.define('User', UserModel)

    return {
        UserDb,
    }
}