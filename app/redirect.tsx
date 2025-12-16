import { useEffect } from "react";
import { useNavigate } from "react-router";
import { STORAGE_KEY_LASTGROUP } from "./utils/constants";

export default function RootRedirect() {
  /* 1️⃣ Reset the current group to localStorage */
  const navigate = useNavigate();

  useEffect(() => {
    const lastGroup = localStorage.getItem(STORAGE_KEY_LASTGROUP);
    if (lastGroup) {
      navigate(`/devices/group/${lastGroup}`, { replace: true });
    } else {
      navigate("/devices/all");
    }
  }, [navigate]);
}
