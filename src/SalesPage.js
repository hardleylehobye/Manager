import React from "react";

function SalesPage({ instance }) {
  return (
    <div>
      <h2>{instance.name} (Sales-based)</h2>
      <p>Here you will manage sales for this instance...</p>
    </div>
  );
}

export default SalesPage;
