import { describe, it, expect } from "vitest";
import { get, set } from "./object-access";

describe("get", () => {
  it("returns top-level values", () => {
    expect(get({ a: 1 }, "a")).toBe(1);
  });

  it("walks nested paths", () => {
    expect(get({ a: { b: { c: 42 } } }, "a.b.c")).toBe(42);
  });

  it("returns undefined for missing paths", () => {
    expect(get({ a: 1 }, "b.c")).toBeUndefined();
    expect(get({ a: { b: null } }, "a.b.c")).toBeUndefined();
  });
});

describe("set", () => {
  it("writes top-level values", () => {
    const obj = {};
    set(obj, "a", 1);
    expect(obj).toEqual({ a: 1 });
  });

  it("creates intermediate objects when needed", () => {
    const obj = {};
    set(obj, "a.b.c", 99);
    expect(obj).toEqual({ a: { b: { c: 99 } } });
  });

  it("overwrites existing leaves", () => {
    const obj = { a: { b: 1 } };
    set(obj, "a.b", 2);
    expect(obj.a.b).toBe(2);
  });

  it("preserves siblings under a touched intermediate", () => {
    const obj = { a: { b: 1, c: 2 } };
    set(obj, "a.b", 99);
    expect(obj).toEqual({ a: { b: 99, c: 2 } });
  });
});
