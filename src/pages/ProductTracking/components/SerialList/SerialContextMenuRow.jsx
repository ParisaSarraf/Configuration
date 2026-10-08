import { forwardRef } from "react";
import { Dropdown } from "antd";

// Dropdown رویدادهای کلیک راست را به tr اضافه می‌کند و عنصر اضافه‌ای در tbody نمی‌سازد.
const SerialContextMenuRow = forwardRef(({ serialMenu, ...rowProps }, ref) => {
  const row = <tr {...rowProps} ref={ref} />;
  if (!serialMenu) return row;
  return (
    <Dropdown trigger={["contextMenu"]} menu={serialMenu}>
      {row}
    </Dropdown>
  );
});

SerialContextMenuRow.displayName = "SerialContextMenuRow";
export default SerialContextMenuRow;