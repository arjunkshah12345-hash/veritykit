"use client";

import { useState } from "react";

export function Hero() {
  const [weight, setWeight] = useState(300);
  const [reward, setReward] = useState(0.62);
  const [fancy, setFancy] = useState(false);

  return (
    <header
      className="wheel-demo-hero"
      data-glass-treatment="frosted"
      style={
        {
          "--value-weight": weight,
          "--value-reward": reward,
          "--hero-frosted-blur": "9px",
        } as React.CSSProperties
      }
    >
      <div className="hero-composition">
        <h1 aria-label="Verity is a tool for making the unverifiable trainable.">
          <span className="hero-heading-line" aria-hidden="true">
            <span>Verity is a</span>
            <span className="hero-variable-word hero-variable-word--tool" data-fancy={fancy}>
              tool
            </span>
          </span>
          <span className="hero-heading-line" aria-hidden="true">
            <span>for</span>
            <span className="hero-variable-word hero-variable-word--making" data-fancy={fancy}>
              making
            </span>
            <span>the</span>
          </span>
          <span className="hero-heading-line" aria-hidden="true">
            <span>unverifiable</span>
            <span className="hero-variable-word hero-variable-word--trainable" data-fancy={fancy}>
              trainable
            </span>
            <span className="hero-period">.</span>
          </span>
        </h1>
      </div>

      <div className="hero-control-rack hero-control-rack--type-collage" role="group" aria-label="Demo controls">
        <div
          className="hero-control-positioner"
          style={{ left: "4%", top: "10%", transform: "rotate(-6deg) scale(0.92)" }}
        >
          <div className="hero-control hero-control--weight hero-frosted-surface">
            <div className="hero-fill" style={{ width: `${((weight - 200) / 600) * 100}%` }} />
            <div className="hero-readout">
              <span>Weight</span>
              <output>{weight}</output>
            </div>
            <input
              className="hero-range"
              type="range"
              min={200}
              max={800}
              step={1}
              value={weight}
              aria-label="Headline weight"
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>
        </div>

        <div
          className="hero-control-positioner"
          style={{ right: "2%", top: "16%", transform: "rotate(7.4deg) scale(0.88)" }}
        >
          <div className="hero-control hero-control--reward hero-frosted-surface">
            <div className="hero-fill" style={{ width: `${reward * 100}%` }} />
            <div className="hero-readout">
              <span>Reward</span>
              <output>{reward.toFixed(2)}</output>
            </div>
            <input
              className="hero-range"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={reward}
              aria-label="Example reward"
              onChange={(e) => setReward(Number(e.target.value))}
            />
          </div>
        </div>

        <div
          className="hero-control-positioner"
          style={{ left: "26%", bottom: "8%", transform: "rotate(-2.6deg)" }}
        >
          <div className="hero-control hero-control--fancy hero-frosted-surface">
            <div className="hero-fancy-row">
              <span className="hero-fancy-label">Fancy</span>
              <div className="hero-fancy-segments">
                <button type="button" aria-pressed={!fancy} onClick={() => setFancy(false)}>
                  Off
                </button>
                <button type="button" aria-pressed={fancy} onClick={() => setFancy(true)}>
                  On
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        Headline weight {weight}. Fancy type is {fancy ? "on" : "off"}. Reward {reward.toFixed(2)}.
      </span>
    </header>
  );
}
