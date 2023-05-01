import {Context} from "telegraf"

export type SessionData = {
    name: string
}

export type BotContext = Context & {
    session: SessionData
}