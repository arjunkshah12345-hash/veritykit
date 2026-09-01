export function Methods() {
  return (
    <section className="vk-methods" aria-labelledby="methods-title">
      <h2 id="methods-title">Three methods. One trainer.</h2>
      <p>Keep the model. Swap the loss.</p>
      <table>
        <thead>
          <tr>
            <th>Call</th>
            <th>You give it</th>
            <th>It trains</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>sft()</code>
            </td>
            <td>prompt and target</td>
            <td>next-token, pads ignored</td>
          </tr>
          <tr>
            <td>
              <code>prefer()</code>
            </td>
            <td>chosen and rejected</td>
            <td>DPO, implicit reference</td>
          </tr>
          <tr>
            <td>
              <code>reinforce()</code>
            </td>
            <td>a score from a run</td>
            <td>GRPO on the group</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
