import { createPortal } from "react-dom";

export default  function DropdownPortal = ({ children }: { children: React.ReactNode }) => {
  const el = document.getElementById("dropdown-root");
  if (!el) return null;
  return createPortal(children, el);
};
