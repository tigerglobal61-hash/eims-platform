export default function DisplayBoardFootnotes({ averageLabel, fullscreen = false }) {
  return (
    <footer
      className={`display-board-footnotes${fullscreen ? " display-board-footnotes--fullscreen" : ""}`}
    >
      <p className="display-board-footnotes__average">{averageLabel}</p>
    </footer>
  );
}
