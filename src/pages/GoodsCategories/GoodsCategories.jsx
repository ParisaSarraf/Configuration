import { Card, Tabs } from "antd";
import ProductDocuments from "../DocumentProduct/DocumentProduct";
import Introduction from "../Introduction/Introduction";
import Requirement from "../Requirement/Requirement";
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
      label: ` اسناد `,
      key: '2',
      children: <ProductDocuments />,
    },
    {
      label: ` الزامات`,
      key: '3',
      children: <ProductRequirement />,
    },
    {
      label: ` ردیابی محصول`,
      key: '4',
      children: <ProductTracking />,
    },
    {
      label: ` تجارب و خرابی `,
      key: '5',
      children: <Experience />,
    },
    // {
    //   label: ` خرید `,
    //   key: '6',
    //   children: 'خرید',
    // },
  ];

  return (
    <Card className="w-full flex flex-col">
      <Tabs
        defaultActiveKey="3"
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