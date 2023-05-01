import {Telegraf} from "telegraf"
import {BotContext} from "../context/context"

export abstract class Command {
    protected constructor(public bot: Telegraf<BotContext>) {}

    abstract handle(): void
}