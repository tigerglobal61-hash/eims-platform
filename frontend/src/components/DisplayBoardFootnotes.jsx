export default function DisplayBoardFootnotes({ averageLabel, fullscreen = false }) {
  return (
    <footer
      className={`display-board-footnotes${fullscreen ? " display-board-footnotes--fullscreen" : ""}`}
    >
      <p className="display-board-footnotes__average">{averageLabel}</p>
      <p className="display-board-footnotes__disclaimer">
        Status levels are based on site monitoring criteria and 1-hour moving averages.
      </p>
      <p className="display-board-footnotes__note">
        Displayed values represent on-site monitoring conditions.
      </p>
    </footer>
  );
}
