import React from "react";
import Users from "../Users/Users";
import Rols from "../Rols/Rols";

function SystemManagment() {
  return (
    <div className="flex flex-row gap-4">
      <Rols />
      <Users />
    </div>
  );
}

export default SystemManagment;
