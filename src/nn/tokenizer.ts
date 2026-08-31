export const BOS = "<s>";
export const EOS = "</s>";
export const PAD = "<pad>";

export type EncodeOptions = {
  addBos?: boolean;
  addEos?: boolean;
  maxLength?: number;
};

export class CharTokenizer {
  readonly stoi: Map<string, number>;
  readonly itos: string[];
  readonly bos: number;
  readonly eos: number;
  readonly pad: number;

  constructor(chars: Iterable<string>) {
    const unique = [PAD, BOS, EOS, ...[...chars].filter((c) => c !== PAD && c !== BOS && c !== EOS)];
    this.itos = unique;
    this.stoi = new Map(unique.map((c, i) => [c, i]));
    this.pad = 0;
    this.bos = 1;
    this.eos = 2;
  }

  static fromText(text: string): CharTokenizer {
    return new CharTokenizer(text);
  }

  /** Printable ASCII + newline — enough to emit JavaScript and English. */
  static ascii(extra = ""): CharTokenizer {
    const chars = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i));
    return new CharTokenizer([...chars, "\n", "\t", ...extra]);
  }

  get vocabSize(): number {
    return this.itos.length;
  }

  encode(text: string, opts: EncodeOptions = {}): number[] {
    const ids: number[] = [];
    if (opts.addBos) ids.push(this.bos);
    for (const ch of text) {
      const id = this.stoi.get(ch);
      if (id === undefined) continue;
      ids.push(id);
    }
    if (opts.addEos) ids.push(this.eos);
    if (opts.maxLength !== undefined && ids.length > opts.maxLength) {
      return ids.slice(0, opts.maxLength);
    }
    return ids;
  }

  decode(ids: number[], opts: { skipSpecial?: boolean } = {}): string {
    let out = "";
    for (const id of ids) {
      const ch = this.itos[id];
      if (ch === undefined) continue;
      if (opts.skipSpecial && (id === this.bos || id === this.eos || id === this.pad)) continue;
      out += ch;
    }
    return out;
  }

  padBatch(rows: number[][], length: number): number[][] {
    return rows.map((row) => {
      const next = row.slice(0, length);
      while (next.length < length) next.push(this.pad);
      return next;
    });
  }
}
