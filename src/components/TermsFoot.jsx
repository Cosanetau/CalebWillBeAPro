import { useState } from "react";

const POINTS = [
  "Nicola de Vos is entitled to claim at least 73% of the credit for anything impressive Caleb ever achieves.",
  "If Caleb becomes a professional hockey player, Nicola must immediately receive unlimited bragging rights and permission to say, “Yeah, I basically made that happen.”",
  "Any goals, assists, successful defensive plays or moments where Caleb doesn’t fall over are legally recognised as evidence of Nicola’s coaching.",
  "Any bad games remain entirely Caleb’s fault and must never be mentioned again.",
  "Caleb agrees to stop complaining during training unless the exercise is genuinely horrible, in which case he may complain but must continue doing it anyway.",
  "Nicola accepts no responsibility for broken sticks, destroyed legs, excessive sweating, questionable life decisions or Caleb deciding that one more training session is somehow a good idea.",
  "If Caleb reaches his dreams, he must publicly admit that Nicola believed in him, helped him and tolerated an unreasonable number of ambitious plans.",
  "These terms remain valid until Caleb retires, becomes too old to skate or is physically removed from the rink by security.",
];

export default function TermsFoot() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="site-foot">
      <button
        type="button"
        className="terms-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        T&Cs
      </button>
      {open ? (
        <article className="terms-card">
          <h2>
            Definitely Not Legally Binding Terms <span className="amp">&amp;</span> Conditions
          </h2>
          <p>By viewing this website, you agree to the following extremely serious conditions:</p>
          <ol>
            {POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
          <p className="terms-thanks">
            Most importantly, thank you, Nicola de Vos, for helping me chase something that means everything to me. I
            genuinely wouldn’t have the confidence to go after this dream without your support, honesty and willingness
            to help me become better.
          </p>
        </article>
      ) : null}
    </footer>
  );
}
