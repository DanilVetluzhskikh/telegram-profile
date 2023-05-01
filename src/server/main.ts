import express from 'express'
import dotenv from 'dotenv'
import {sequelizeInit} from "./sequilize/init"
import {Sequelize} from "sequelize"
import {initModels} from "./models"

dotenv.config()
const app = express()
export const SERVER_PORT = process.env.PORT ?? 228
export let sequelize: Sequelize
export let models: ReturnType<typeof initModels>

export const runServer = async () => {
    try {
        const username = process.env.DATABASE_USERNAME ?? ''
        const database = process.env.DATABASE_NAME ?? ''
        const password = process.env.DATABASE_PASSWORD ?? ''

        sequelize = sequelizeInit(database, username, password, {
            dialect: 'postgres',
            host: 'localhost',
        })

        await sequelize.authenticate()

        models = initModels(sequelize)

        await sequelize.sync()

        app.listen(process.env.PORT, () => {
            console.log(`Подключение к базе данных ${database} прошло успешно`)
            console.log(`Сервер запустился на ${SERVER_PORT} порту`)
        })
    } catch (e) {
        console.log('не удалось запустить сервер или подключиться к базе даннных', e)
    }
}

