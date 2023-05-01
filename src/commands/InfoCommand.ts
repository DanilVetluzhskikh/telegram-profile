import {Command} from "./Command"
import {Telegraf} from "telegraf"
import {BotContext} from "../context/context"

export class InfoCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }

    handle() {
        this.bot.command('info', (ctx) => {
            ctx.reply(`
                Я бот который поможет найти тебе вторую половинку
            `)

            ctx.replyWithPhoto({ source: '../files/photo.jpg' }, { caption: 'Это подпись к фотографии' })
        })
    }
}