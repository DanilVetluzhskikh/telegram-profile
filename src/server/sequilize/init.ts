import {Sequelize, Options} from 'sequelize'

export const sequelizeInit = (database: string, username: string, password: string, options: Options) => {
    return new Sequelize(database, username, password, options)
}
