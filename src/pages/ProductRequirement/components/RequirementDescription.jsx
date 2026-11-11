import { Tooltip } from "antd";
import { getRequirementDescription } from "../utils/requirementDescription";

export default function RequirementDescription({ value }) {
  const description = getRequirementDescription(value);
  if (!description) return null;
  return <span className="mx-1 text-slate-500">
    — <Tooltip title={<span style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{description}</span>}
      overlayStyle={{ maxWidth: 480 }}>
      <span tabIndex={0} className="inline-block max-w-[18rem] truncate align-middle text-xs"
        aria-label={`شرح کامل: ${description}`}>
        {description}
      </span>
    </Tooltip>
  </span>;
}
