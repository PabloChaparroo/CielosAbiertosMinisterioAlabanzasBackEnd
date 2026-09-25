import { describe, expect, it } from "vitest";
import { validateDto } from "../testing/validate-dto";
import { PaginationQueryDto } from "./pagination-query.dto";

describe("PaginationQueryDto — ?page=&limit= de los listados", () => {
  it("convierte los valores de la URL (texto) a número", async () => {
    const { instance, fields } = await validateDto(PaginationQueryDto, { page: "2", limit: "10" });
    expect(fields).toEqual([]);
    expect(instance.page).toBe(2);
    expect(instance.limit).toBe(10);
  });

  it("sin parámetros usa los valores por defecto (página 1, 20 por página)", async () => {
    const { instance, fields } = await validateDto(PaginationQueryDto, {});
    expect(fields).toEqual([]);
    expect(instance).toMatchObject({ page: 1, limit: 20 });
  });

  it("no deja pedir más de 100 por página", async () => {
    const { fields } = await validateDto(PaginationQueryDto, { limit: "101" });
    expect(fields).toEqual(["limit"]);
  });

  it("rechaza página 0 y valores que no son números enteros", async () => {
    expect((await validateDto(PaginationQueryDto, { page: "0" })).fields).toEqual(["page"]);
    expect((await validateDto(PaginationQueryDto, { page: "dos" })).fields).toEqual(["page"]);
  });
});
