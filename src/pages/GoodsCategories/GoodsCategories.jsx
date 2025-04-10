import { Card, Tabs } from "antd";
import ProductDocuments from "../DocumentProduct/DocumentProduct";

const GoodsCategories = () => {

  const items = [
    {
      label: "معرفی و مشخصات",
      key: '1',
      children: 'معرفی و مشخصات',
    },
    {
      label: ` اسناد `,
      key: '2',
      children: <ProductDocuments />,
    },
    {
      label: ` الزامات`,
      key: '3',
      children: 'الزامات',
    },
    {
      label: ` الزامات جدید`,
      key: '4',
      children: 'الزامات جدید',
    },
    {
      label: ` تجارب و خرابی `,
      key: '5',
      children: 'تحارب و خرابی',
    },
    {
      label: ` خرید `,
      key: '6',
      children: 'خرید',
    },
  ];

  return (
    <Card className="w-full flex flex-col">
      <Tabs
        type="line"
        items={items}
        tabBarStyle={{
          display: 'flex',
          width: '100%',
        }}
        className="custom-tabs"
      />
    </Card>
  );
};

export default GoodsCategories;