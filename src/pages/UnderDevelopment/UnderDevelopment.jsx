import { Tabs } from "antd";
import React, { useState } from "react";

const UnderDevelopment = () => {
  const [items, setItems] = useState([
    {
      label: 'معرفی و مشخصات',
      key: '1',
      children: 'معرفی و مشخصات',
    },
    {
      label: 'اسناد',
      key: '2',
      children: 'اسناد',
    },
    {
      label: 'الزامات',
      key: '3',
      children: 'الزامات',
    },
    {
      label: 'الزامات جدید',
      key: '4',
      children: 'الزامات جدید',
    },
    {
      label: 'تحارب و خرابی',
      key: '5',
      children: 'تحارب و خرابی',
    },
    {
      label: 'خرید',
      key: '6',
      children: 'خرید',
    },
  ]);

  return (
    <div className="w-full flex flex-col">
      <Tabs
        type="line"
        items={items}
        tabBarStyle={{
          display: 'flex',
          padding: '0 65px',
          width: '100%',
          overflow: "hidden",
          boxSizing: 'border-box',
        }}
        className="custom-tabs"
      />
    </div>
  );
};

export default UnderDevelopment;