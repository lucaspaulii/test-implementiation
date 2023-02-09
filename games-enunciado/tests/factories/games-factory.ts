import {faker} from "@faker-js/faker";
import { prisma } from "@/config";

export async function createGame(consoleId : number, title ? : string) {
    return prisma.game.create({
        data: {
            consoleId,
            title: (title ? title : faker.music.songName())
        }
    })
}