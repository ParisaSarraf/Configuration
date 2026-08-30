import { useMemo, useState } from "react";
import { Input, Popover, Tabs } from "antd";
import * as AntIcons from "@ant-design/icons";
import * as LucideIcons from "lucide-react";

const getIconNames = (icons) => {
  return Object.keys(icons).filter((name) => {
    const Icon = icons[name];

    return (
      name !== "default" &&
      name !== "createLucideIcon" &&
      typeof Icon === "object" &&
      Icon !== null
    );
  });
};

const lucideIconNames = getIconNames(LucideIcons);
const antIconNames = getIconNames(AntIcons);

const IconPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("lucide");
  const [search, setSearch] = useState("");

  const [library, iconName] = value?.includes(":")
    ? value.split(":")
    : ["", value];

  const SelectedIcon =
    library === "lucide"
      ? LucideIcons[iconName]
      : library === "antd"
        ? AntIcons[iconName]
        : null;

  const currentIcons =
    activeTab === "lucide" ? lucideIconNames : antIconNames;

  const filteredIcons = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return currentIcons.slice(0, 200);
    }

    return currentIcons
      .filter((name) =>
        name.toLowerCase().includes(query)
      )
      .slice(0, 200);
  }, [currentIcons, search]);

  const selectIcon = (name) => {
    const newValue = `${activeTab}:${name}`;

    onChange?.(newValue);
    setOpen(false);
    setSearch("");
  };

  const content = (
    <div
      className="w-[400px]"
      dir="ltr"
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setSearch("");
        }}
        items={[
          {
            key: "lucide",
            label: `Lucide (${lucideIconNames.length})`,
          },
          {
            key: "antd",
            label: `Ant Design (${antIconNames.length})`,
          },
        ]}
      />

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons..."
        allowClear
        className="mb-3"
      />

      <div className="grid grid-cols-7 gap-2 max-h-[320px] overflow-y-auto">
        {filteredIcons.map((name) => {
          const Icon =
            activeTab === "lucide"
              ? LucideIcons[name]
              : AntIcons[name];

          if (!Icon) {
            return null;
          }

          const selected =
            value === `${activeTab}:${name}`;

          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => selectIcon(name)}
              className={`
                flex
                flex-col
                items-center
                justify-center
                gap-1
                h-[60px]
                rounded-md
                border
                transition-colors
                cursor-pointer
                hover:bg-gray-100
                ${
                  selected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }
              `}
            >
              <Icon style={{ fontSize: 22 }} />

              <span className="text-[8px] truncate w-full text-center px-1">
                {name}
              </span>
            </button>
          );
        })}

        {filteredIcons.length === 0 && (
          <div className="col-span-7 py-10 text-center text-gray-400">
            No icon found
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomLeft"
      content={content}
    >
      <Input
        readOnly
        value={value || ""}
        placeholder="انتخاب آیکون..."
        allowClear
        onClear={() => onChange?.("")}
        prefix={
          SelectedIcon ? (
            <SelectedIcon style={{ fontSize: 18 }} />
          ) : null
        }
      />
    </Popover>
  );
};

export default IconPicker;
