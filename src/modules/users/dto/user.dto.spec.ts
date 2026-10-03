import { describe, expect, it } from "vitest";
import { validateDto } from "../../../common/testing/validate-dto";
import { CreateUserDto, UpdateUserDto } from "./user.dto";

const valid = {
  email: "sofia@cielosabiertos.org",
  password: "secreto123",
  name: "Sofía Ledesma",
  avatarColor: "#123456",
  initials: "SL",
};

describe("CreateUserDto — instrumentos", () => {
  it("sin instrumentos → aceptado (son opcionales)", async () => {
    expect((await validateDto(CreateUserDto, valid)).fields).toEqual([]);
  });

  it("con varios instrumentos de la lista → aceptado", async () => {
    const dto = { ...valid, instruments: ["Guitarra eléctrica", "Voz"] };
    expect((await validateDto(CreateUserDto, dto)).fields).toEqual([]);
  });

  it("un instrumento que no está en la lista → rechazado", async () => {
    const dto = { ...valid, instruments: ["Voz", "Ukelele"] };
    expect((await validateDto(CreateUserDto, dto)).fields).toContain("instruments");
  });

  it("al editar se pueden cambiar solo los instrumentos", async () => {
    expect((await validateDto(UpdateUserDto, { instruments: ["Bajo"] })).fields).toEqual([]);
  });
});
