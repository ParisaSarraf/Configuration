import { Tabs } from "antd";
import React, { useState } from "react";
import Documents from "../Documents/Documents";

const GoodsCategories = () => {
  const [items, setItems] = useState([
    {
      label: 'معرفی و مشخصات',
      key: '1',
      children: 'معرفی و مشخصات',
    },
    {
      label: 'اسناد',
      key: '2',
      children: <Documents />,
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
          width: '100%',
        }}
        className="custom-tabs"
      />
    </div>
  );
};

export default GoodsCategories;