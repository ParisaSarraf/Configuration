import { Card, Tabs } from "antd";
import ProductDocuments from "../DocumentProduct/DocumentProduct";
import Introduction from "../Introduction/Introduction";
import ProductTracking from "../ProductTracking/ProductTracking";
import Experience from "../Experience/Experience";
import ProductRequirement from "../../ProductRequirement/ProductRequirement";

const GoodsCategories = () => {

  const items = [
    {
      label: "معرفی و مشخصات",
      key: '1',
      children: <Introduction />,
    },
      {
      label: ` ردیابی محصول`,
      key: '2',
      children: <ProductTracking />,
    },
    {
      label: ` اسناد و لاگ ها`,
      key: '3',
      children: <ProductDocuments />,
    },
    {
      label: ` الزامات و وابستگی ها`,
      key: '4',
      children: <ProductRequirement />,
    },
  
    {
      label: ` تجارب و خرابی `,
      key: '5',
      children: <Experience />,
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
        defaultActiveKey="4"
        type="card"
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