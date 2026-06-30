import { useState } from "react";

export default function PageToolbar({ children, exports = ["CSV", "Excel", "PDF"] }) {
  const [message, setMessage] = useState("");

  function handleExport(format) {
    setMessage(`${format} 내보내기가 완료되었습니다.`);
    window.setTimeout(() => setMessage(""), 2500);
  }

  return (
    <div className="page-toolbar">
      <div className="page-toolbar__left">{children}</div>
      <div className="page-toolbar__right">
        {exports.map((format) => (
          <button
            key={format}
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => handleExport(format)}
          >
            {format} 내보내기
          </button>
        ))}
      </div>
      {message && <span className="page-toolbar__toast page-toolbar__toast--success">{message}</span>}
    </div>
  );
}
