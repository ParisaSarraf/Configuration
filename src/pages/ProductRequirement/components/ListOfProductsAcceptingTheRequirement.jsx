import { Alert, Button, Card, Empty } from "antd";
import Tree from "../../../components/Tree";
import { useProductRequirementAcceptor } from "../../../QueryServises/productRequirementQuery";

export default function ListOfProductsAcceptingTheRequirement({ selectedProductRequirement }) {
  const { data, isFetching, isError, refetch } = useProductRequirementAcceptor(selectedProductRequirement);
  const transform = (nodes, path = "") => (Array.isArray(nodes) ? nodes : []).map((node) => {
    const key = `${path}/product-${node.id}`;
    return { key, id: node.id,
      title: <span>{node.title || node.persian_title || node.name || "بدون عنوان"}
        {node.code && <> — <bdi dir="ltr">{node.code}</bdi></>}</span>,
      children: transform(node.children, key) };
  });
  const treeData = transform(Array.isArray(data) ? data : data ? [data] : []);
  return <Card title="لیست محصولات پذیرنده الزام" loading={selectedProductRequirement != null && isFetching && data == null}>
    {selectedProductRequirement != null && isFetching && data != null && <div role="status">در حال به‌روزرسانی...</div>}
    {selectedProductRequirement == null ? <Empty description="یک الزام یا نسخه را از درخت انتخاب کنید" />
      : isError ? <Alert type="error" message="دریافت محصولات پذیرنده ناموفق بود"
        action={<Button onClick={() => refetch()}>تلاش دوباره</Button>} />
      : !treeData.length ? <Empty description="محصول پذیرنده‌ای ثبت نشده است" />
      : <Tree key={selectedProductRequirement} mode="tree" data={treeData} showLine checkable={false}
        showRightClickMenu={false} />}
  </Card>;
}
