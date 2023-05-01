import dotenv from 'dotenv'
import {Scenes, Telegraf} from "telegraf"
import {BotContext} from "./context/context"
import {StartCommand, menuCommands, InfoCommand, Command} from "./commands"
import LocalSession from 'telegraf-session-local'
import {profileScene} from "./scenes/ProfileScene"
import {runServer} from "./server/main"

dotenv.config()
const localSession = new LocalSession({ database: 'sessions.json' })

class Bot {
    bot: Telegraf<BotContext>
    commands: Command[] = []

    constructor() {
        this.bot = new Telegraf<BotContext>(process.env.BOT_TOKEN ?? '')
        this.bot.use(localSession.middleware())
        this.bot.use(new Scenes.Stage([profileScene]))
    }

    async init() {
        this.commands = [
            new StartCommand(this.bot),
            new InfoCommand(this.bot)
        ]
        for(const command of this.commands) {
            command.handle()
        }

        await this.bot.telegram.setMyCommands(menuCommands)

        console.log('Бот запустился')
        this.bot.launch()
    }
}

export const bot = new Bot()

runServer().then(() => {
    bot.init()
})
