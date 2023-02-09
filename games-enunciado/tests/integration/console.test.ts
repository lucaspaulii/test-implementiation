import supertest from "supertest";
import app, { init } from "@/app";
import { cleanDb } from "../helpers";
import { createConsole } from "../factories/console-factory";
import httpStatus from "http-status";
import { faker } from "@faker-js/faker";

const server = supertest(app);

beforeAll(async () => {
  await init();
});
beforeEach(async () => {
  await cleanDb();
});

describe("GET /consoles", () => {
  it("should return and empty array if no consoles are registered", async () => {
    const response = await server.get("/consoles");
    expect(response.body).toEqual([]);
  });
  it("should return an array of consoles", async () => {
    await createConsole();
    const response = await server.get("/consoles");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
        }),
      ])
    );
  });
});

describe("GET /consoles/:id", () => {
  it("should return status 404 if no console is found for id", async () => {
    await createConsole();
    const response = await server.get("/consoles/0");
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });
  it("should return an console object for the given id", async () => {
    const createdConsole = await createConsole(faker.random.word());
    const response = await server.get(`/consoles/${createdConsole.id}`);
    expect(response.body).toEqual({
      id: createdConsole.id,
      name: createdConsole.name,
    });
  });
});

describe("POST /consoles", () => {
    it ("should response with CONFLICT when console already exists", async () => {
        const console = await createConsole();
        const response = await server.post("/consoles").send({name: console.name});
        expect(response.status).toBe(httpStatus.CONFLICT);
    });
    it ("should return status 200 and create a console", async () => {
        const response = await server.post("/consoles").send({name: faker.random.word()});
        expect(response.status).toBe(httpStatus.CREATED);
        const responseFromGet = await server.get("/consoles");
        expect(responseFromGet.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                }),
            ])
        );
    });
});
