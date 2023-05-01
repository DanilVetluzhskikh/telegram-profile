import {Command} from "./Command"
import {Markup, Telegraf} from "telegraf"
import {BotContext} from "../context/context"
import {models} from "../server/main"
import {UserModel} from "../server/models"

export class StartCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }

    handle(): void {
        this.bot.start((ctx) => {
            ctx.reply(`
            Привет ${ctx.message.from.username}, что хочешь сделать \n 1. Заполнить анкету \n 2. Моя анкета \n 3. Смотреть анкеты` ,
            Markup.keyboard([[
                Markup.button.callback('Заполнить профиль', 'profile'),
                Markup.button.callback('Моя анкета', 'my-profile'),
                Markup.button.callback('Смотреть анкеты', 'watch'),
            ]]).resize())
        })

        this.bot.hears(/Заполнить профиль/, (ctx) => {
            // @ts-ignore
            ctx.scene.enter('profile-scene')
        })

        this.bot.hears(/Моя анкета/, async (ctx) => {
            const userId = String(ctx.message.from.id)

            const user = await models.UserDb.findOne({
                where: {
                    telegramUserId: userId
                }
            })

            if (user?.dataValues) {
                const {photo, name, age, city, about} = user.dataValues

                await ctx.replyWithPhoto({ source: photo }, { caption: `${name}, ${age} ${city}\n${about}` })
            } else {
                ctx.reply('Ваша анкета не найдена')
            }
        })

        this.bot.hears("2", (ctx) => {
            console.log(ctx)
        })
    }
}
