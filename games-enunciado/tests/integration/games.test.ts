import supertest from "supertest";
import app, { init } from "@/app";
import { cleanDb } from "../helpers";
import { createConsole } from "../factories/console-factory";
import { createGame } from "../factories/games-factory";
import httpStatus from "http-status";
import { faker } from "@faker-js/faker";

const server = supertest(app);

beforeAll(async () => {
  await init();
  await cleanDb();
});

describe("GET /games", () => {
  it("should return and empty array if no games are registered", async () => {
    const response = await server.get("/games");
    expect(response.body).toEqual([]);
  });
  it("should return an array of games", async () => {
    const createdConsole = await createConsole();
    await createGame(createdConsole.id);
    const response = await server.get("/games");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          consoleId: expect.any(Number),
          title: expect.any(String),
          Console: {
            id: expect.any(Number),
            name: expect.any(String),
          },
        }),
      ])
    );
  });
});

describe("GET /games/:id", () => {
  it("should return status 404 if no game is found for id", async () => {
    const console = await createConsole();
    await createGame(console.id);
    const response = await server.get("/games/0");
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });
  it("should return a game object for the given id", async () => {
    const console = await createConsole();
    const game = await createGame(console.id, faker.music.songName());
    const response = await server.get(`/games/${game.id}`);
    expect(response.body).toEqual({
      id: game.id,
      consoleId: game.consoleId,
      title: game.title,
    });
  });
});

describe("POST /games", () => {
    it ("should response with CONFLICT when game already exists", async () => {
        const console = await createConsole();
        const game = await createGame(console.id);
        const response = await server.post("/games").send({title: game.title, consoleId: console.id});
        expect(response.status).toBe(httpStatus.CONFLICT);
    });
    it ("should response with CONFLICT when game already exists", async () => {
        const response = await server.post("/games").send({title: faker.music.songName(), consoleId: 0});
        expect(response.status).toBe(httpStatus.CONFLICT);
    });
    it ("should return status 200 and create a game", async () => {
        const console = await createConsole();
        const response = await server.post("/games").send({
            title: faker.music.songName(),
            consoleId: console.id
        });
        expect(response.status).toBe(httpStatus.CREATED);
        const responseFromGet = await server.get("/games");
        expect(responseFromGet.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    consoleId: expect.any(Number),
                    title: expect.any(String),
                    Console: {
                      id: expect.any(Number),
                      name: expect.any(String),
                    },
                  }),
            ])
        );
    });
});
