import { useRef } from "react";
import { DeleteOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, message } from "antd";

export const useColumnSearch = ({ setSearchParams, refetch }) => {
  const filterRefs = useRef({});

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchParams((prev) => ({
      ...prev,
      [dataIndex]: selectedKeys[0],
    }));
  };

  const handleResetAll = () => {
    setSearchParams({});

    Object.values(filterRefs.current).forEach(
      ({ setSelectedKeys, confirm }) => {
        setSelectedKeys([]);
        confirm({ closeDropdown: true });
      }
    );

    if (refetch) {
      refetch();
    }

    message.success("تمام فیلترها پاک شدند.");
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
    }) => {
      filterRefs.current[dataIndex] = {
        setSelectedKeys,
        confirm,
      };

      return (
        <div
          className="flex flex-col gap-2 p-2"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Input
            placeholder={`جستجو ${title}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(
                e.target.value ? [e.target.value] : []
              )
            }
            onPressEnter={() =>
              handleSearch(selectedKeys, confirm, dataIndex)
            }
          />
          <Space>
            <Button
              className="w-32 p-3"
              type="primary"
              icon={<SearchOutlined />}
              size="small"
              onClick={() =>
                handleSearch(selectedKeys, confirm, dataIndex)
              }
            >
              جستجو
            </Button>
            <Button
              className="w-32 p-3"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={handleResetAll}
            >
              ریست
            </Button>
          </Space>
        </div>
      );
    },

    filterIcon: (filtered) => (
      <FilterOutlined
        style={{ color: filtered ? "#1677ff" : undefined }}
      />
    ),

    onFilter: (value, record) => {
      const keys = dataIndex.split(".");

      const targetValue = keys.reduce(
        (obj, key) => obj?.[key],
        record
      );

      return targetValue
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
  });

  return {
    getColumnSearchProps,
    handleResetAll,
  };
};

export default useColumnSearch;