import {faker} from "@faker-js/faker";
import { prisma } from "@/config";

export async function createConsole(name ? : string) {
    return prisma.console.create({
        data: {
            name: (name ? name : faker.random.word())
        }
    })
}

