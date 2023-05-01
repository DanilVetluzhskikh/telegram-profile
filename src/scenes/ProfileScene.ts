import {Markup, Scenes } from "telegraf"
import {createWriteStream} from 'fs'
import path from 'path'
import axios from "axios"
import {models} from "../server/main"

export const profileScene = new Scenes.WizardScene<any>(
    'profile-scene',
    (ctx) => {
        ctx.reply('Введите ваше имя', {
            reply_markup: {
                remove_keyboard: true,
            },
        })

        return ctx.wizard.next()
    },
    (ctx) => {
        const name = ctx.wizard.state.name ?? ctx.message.text
        ctx.wizard.state.name = name

        ctx.reply(`${name}, введите ваш возраст`)

        return ctx.wizard.next()
    },
    (ctx) => {
        const age = ctx.message.text
        ctx.wizard.state.age = age

        const name = ctx.wizard.state.name

        if(!Number(age)) {
            ctx.reply(`${name}, возраст должен быть числом`)

            ctx.wizard.back()
            return ctx.wizard.next()
        }

        ctx.reply(`${name}, из какого вы города`)
        return ctx.wizard.next()
    },
    (ctx) => {
        ctx.wizard.state.city = ctx.message.text
        const name = ctx.wizard.state.name

        ctx.reply(`${name}, расскажите о себе`)

        return ctx.wizard.next()
    },
    (ctx) => {
        ctx.wizard.state.about = ctx.message.text
        const name = ctx.wizard.state.name

        ctx.reply(`${name}, отправьте вашу фотографию`)
        return ctx.wizard.next()
    },
    async (ctx) => {
        try {
            // Получаем информацию о фотографии
            const photo = ctx.message.photo[ctx.message.photo.length - 1]
            const fileId = photo.file_id
            const file = await ctx.telegram.getFileLink(fileId)
            const userId = String(ctx.message.from.id)
            const link = file.href

            const splitLink = link.split('.')

            const response = await axios({
                method: 'get',
                url: link,
                responseType: 'stream'
            })

            const photoPath = path.resolve(__dirname, '..', 'images', `${userId}.photo.${splitLink[splitLink.length - 1]}`)
            const stream = createWriteStream(photoPath)
            response.data.pipe(stream)

            const age = ctx.wizard.state.age
            const name = ctx.wizard.state.name
            const about = ctx.wizard.state.about
            const city = ctx.wizard.state.city

            stream.on('finish', () => {
                ctx.wizard.state.photo = photoPath

                ctx.replyWithPhoto({ source: photoPath }, { caption: `${name}, ${age} ${city}\n${about}` })

                ctx.reply('Ваша анкета выглядит так, все ли верно?', Markup.keyboard([[
                    Markup.button.callback('Да', 'yes'),
                    Markup.button.callback('Нет', 'no')
                ]]).resize())
            })

            return ctx.wizard.next()
        } catch (err) {
            const name = ctx.wizard.state.name

            console.log(err)

            ctx.reply(`${name}, отправьте корректную фотографию`)

            ctx.wizard.back()
            return ctx.wizard.next()
        }
    },
    async (ctx) => {
        const isCorrect = ctx.message.text

        if(isCorrect === 'Да') {
            try {
                const age = ctx.wizard.state.age
                const name = ctx.wizard.state.name
                const about = ctx.wizard.state.about
                const city = ctx.wizard.state.city
                const photo = ctx.wizard.state.photo

                const userId = String(ctx.message.from.id)

                const prevProfileUser = await models.UserDb.findOne({
                    where: {
                        telegramUserId: userId
                    }
                })

                if(prevProfileUser?.dataValues) {
                    await models.UserDb.update({
                        telegramUserId: userId,
                        name,
                        age,
                        about,
                        city,
                        photo
                    }, {
                        where: {
                            telegramUserId: userId
                        }
                    })
                } else {
                    await models.UserDb.create({
                        telegramUserId: userId,
                        name,
                        age,
                        about,
                        city,
                        photo
                    })
                }

                ctx.reply('Ваша анкета успешно сохранена', {
                    reply_markup: {
                        remove_keyboard: true,
                    },
                })

                return ctx.scene.leave()
            } catch (e) {
                console.log(e)

                ctx.reply('Не удалось создать анкету попробуйте позже', {
                    reply_markup: {
                        remove_keyboard: true,
                    },
                })
                return ctx.scene.leave()
            }
        } else if (isCorrect === 'Нет') {
            return ctx.scene.reenter(0)
        } else {
            ctx.reply('Такого варианта ответа нет', Markup.keyboard([[
                Markup.button.callback('Да', 'yes'),
                Markup.button.callback('Нет', 'no')
            ]]).resize())
        }
    }
)
