import { useRef, useState } from "react";
import { Button, Modal } from "antd";
import { LockOutlined, MoreOutlined } from "@ant-design/icons";
import ProductStatus from "../../components/ProductUI/ProductStatus";
import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  EyeOutlined,
  FileTextOutlined,
  InboxOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import Introduction from "../Introduction/Introduction";
import ProductTracking from "../ProductTracking/ProductTracking";
import Experience from "../Experience/Experience";
import ProductRequirement from "../ProductRequirement/ProductRequirement";
import ProductPurchase from "../productPurchase/ProductPurchase";
import RequestOfWarehouse from "@/pages/RequestOfWarehouse/RequestOfWarehouse.jsx";
import Meetings from "@/pages/Meetings/Meetings.jsx";
import Activity from "@/pages/Activity/Activity.jsx";
import ProductDocuments from "../ProductDocument/ProductDocuments";
import Reports from "@/pages/Reports/Reports.jsx";
import DetailAccessProduct from "@/pages/SystemManagement/DetailAccessProduct/DetailAccessProduct.jsx";
import { useProductContext } from "../../Services/Context/ProductContext";
import { useAccessOfUserByProductIdList } from "../../QueryServises/accsessQuery";
import AfterSalesService from "../AfterSalesService/AfterSalesService";

const GoodsCategories = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [showAccessDetails, setShowAccessDetails] = useState(false); 

  const tabRefs = useRef([]);

  const { currentProduct } = useProductContext();
  const { data: accessList } = useAccessOfUserByProductIdList(
    currentProduct?.id
  );

  const tabs = [
    {
      id: "1",
      label: "معرفی و مشخصات",
      icon: <AppstoreOutlined />,
      content: <Introduction />,
    },
    {
      id: "2",
      label: "ردیابی محصول",
      icon: <EyeOutlined />,
      content: <ProductTracking />,
    },
    {
      id: "3",
      label: "اسناد و لاگ ها",
      icon: <FileTextOutlined />,
      content: <ProductDocuments />,
    },
    {
      id: "4",
      label: "الزامات و وابستگی ها",
      icon: <LinkOutlined />,
      content: <ProductRequirement />,
    },
    {
      id: "5",
      label: "تجارب و خرابی",
      icon: <ToolOutlined />,
      content: <Experience />,
    },
    {  
      id: "12",
      label: "خدمات پس از فروش",
      icon: <ShoppingCartOutlined />,
      content: <AfterSalesService />,
    },
    {
      id: "6",
      label: "خرید",
      icon: <ShoppingOutlined />,
      content: <ProductPurchase />,
    },
    {
      id: "7",
      label: "درخواست کالا از انبار",
      icon: <InboxOutlined />,
      content: <RequestOfWarehouse />,
    },
    {
      id: "8",
      label: "صورت جلسات",
      icon: <TeamOutlined />,
      content: <Meetings />,
    },
    {
      id: "9",
      label: "فعالیت ها",
      icon: <BarChartOutlined />,
      content: <Activity />,
    },
    {
      id: "10",
      label: "گزارش ها",
      icon: <AuditOutlined />,
      content: <Reports />,
    },
    {
      id: "11",
      label: "توزیع نقش ها",
      icon: <SafetyCertificateOutlined />,
      content: <DetailAccessProduct />,
    },
  ];

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const handleTabKeyDown = (event, index) => {
    let nextIndex;
    if (event.key === "ArrowLeft") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowRight") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
    tabRefs.current[nextIndex]?.scrollIntoView({block: "nearest", inline: "nearest"});
  };

  return (
    <div className="pw-product-page">
      <section className="pw-product-header" aria-label="مشخصات محصول">
        <div className="pw-product-summary">
          <div className="pw-product-identity">
            <div className="pw-product-icon"><InboxOutlined /></div>
            <div className="pw-product-heading">
              <p className="pw-eyebrow">مدیریت یکپارچه محصول</p>
              <div className="pw-title-line">
                <h1>{currentProduct?.persian_title || currentProduct?.name || "محصول"}</h1>
                <ProductStatus status={currentProduct?.status}/>
              </div>
              <p className="pw-subtitle">پنل نظارت و کنترل فرآیندهای سیستمی</p>
              <span className="pw-code">کد {currentProduct?.final_code || currentProduct?.code || "—"}</span>
            </div>
          </div>
          <div className="pw-product-actions">
            <Button icon={<LockOutlined/>} onClick={() => setShowAccessDetails(true)}>پروفایل دسترسی</Button>
            <Button icon={<MoreOutlined/>} aria-label="بخش‌های دیگر محصول" onClick={() => {
              Modal.info({title: "بخش‌های محصول", width: 520, okText: "بستن", content: (
                <div className="pw-section-links">{tabs.map((tab) => (
                  <Button key={tab.id} icon={tab.icon} onClick={() => {
                    setActiveTab(tab.id);
                    Modal.destroyAll();
                    requestAnimationFrame(() => tabRefs.current[tabs.indexOf(tab)]?.scrollIntoView({block: "nearest", inline: "nearest"}));
                  }}>{tab.label}</Button>
                ))}</div>
              )});
            }}/>
          </div>
        </div>
        <div className="pw-tabs" role="tablist" aria-label="بخش‌های محصول">
          {tabs.map((tab, index) => (
            <button key={tab.id} ref={(element) => { tabRefs.current[index] = element; }}
              id={`product-tab-${tab.id}`} type="button" role="tab"
              aria-selected={activeTab === tab.id} aria-controls="product-tab-panel"
              tabIndex={activeTab === tab.id ? 0 : -1}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              onClick={() => setActiveTab(tab.id)}
              className={`pw-tab ${activeTab === tab.id ? "pw-tab--active" : ""}`}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </div>
      </section>
      <section id="product-tab-panel" role="tabpanel" aria-labelledby={`product-tab-${activeTab}`} tabIndex={0} className="pw-tab-panel">
        {activeContent}
      </section>
      <Modal title="پروفایل دسترسی" open={showAccessDetails} onCancel={() => setShowAccessDetails(false)} footer={null}>
        <div className="pw-access-profile">
          <h3>سمت‌های این محصول</h3>
          <div className="pw-role-list">{accessList?.roles?.length ? accessList.roles.map((role) => (
            <span className="pw-code" key={role.id}>{role.name}</span>
          )) : <p>نقشی تعریف نشده</p>}</div>
          <h3>لیست مجوزها</h3>
          <ul>{accessList?.permissions?.length ? accessList.permissions.map((permission) => (
            <li key={permission.codename}>{permission.name}</li>
          )) : <li>مجوزی یافت نشد</li>}</ul>
        </div>
      </Modal>
    </div>
  );
};

export default GoodsCategories;
