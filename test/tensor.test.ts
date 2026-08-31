import { describe, expect, it } from "vitest";
import { crossEntropy, Tensor } from "../src/tensor/tensor.js";

function almost(a: number, b: number, eps = 1e-5) {
  expect(Math.abs(a - b)).toBeLessThan(eps);
}

describe("tensor autograd", () => {
  it("adds and multiplies with correct grads", () => {
    const x = Tensor.from([2, 3], [2], { requiresGrad: true });
    const y = Tensor.from([4, 5], [2], { requiresGrad: true });
    const z = x.mul(y).add(x).sum();
    z.backward();
    // d/dx = y + 1 = [5, 6], d/dy = x = [2, 3]
    almost(x.grad![0]!, 5);
    almost(x.grad![1]!, 6);
    almost(y.grad![0]!, 2);
    almost(y.grad![1]!, 3);
  });

  it("matmuls 2d", () => {
    const a = Tensor.from([1, 2, 3, 4], [2, 2], { requiresGrad: true });
    const b = Tensor.from([1, 0, 0, 1], [2, 2], { requiresGrad: true });
    const c = a.matmul(b);
    expect([...c.data]).toEqual([1, 2, 3, 4]);
    c.sum().backward();
    expect(a.grad![0]).toBe(1);
    expect(b.grad![0]).toBe(4);
  });

  it("softmax rows sum to 1", () => {
    const x = Tensor.from([1, 2, 3, 0, 0, 0], [2, 3]);
    const s = x.softmax();
    almost(s.data[0]! + s.data[1]! + s.data[2]!, 1);
    almost(s.data[3]! + s.data[4]! + s.data[5]!, 1);
  });

  it("cross entropy prefers the labeled class", () => {
    const logits = Tensor.from([0, 4, 0, 3, 0, 0], [2, 3], { requiresGrad: true });
    const loss = crossEntropy(logits, [1, 0]);
    expect(loss.item()).toBeLessThan(0.3);
    loss.backward();
    expect(logits.grad).toBeTruthy();
  });
});
